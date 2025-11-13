from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db, Base, engine   # (Base/engine은 콘솔 테이블 생성 등에 쓸 수 있어 남겨둠)
from .. import schemas, crud
import os
from notion_client import Client
from datetime import datetime, date
from typing import Any, Dict, List, Optional

# backend/app/routers/sr.py
# -------------------------
# SR 관련 API 엔드포인트를 모아둔 라우터. DB CRUD 호출 + Notion 페이지 생성까지 담당합니다.

# prefix="/api/sr": 모든 엔드포인트 URI가 /api/sr/... 형태가 되도록 지정.
router = APIRouter(prefix="/api/sr", tags=["sr"])

# Notion 연동에 필요한 토큰/DB ID 는 환경 변수에서 읽습니다.
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
NOTION_DB_ID = os.getenv("NOTION_DB_ID")
NOTION = Client(auth=NOTION_TOKEN) if NOTION_TOKEN else None


# --------------------------
# Notion helper builders
# --------------------------
def _rt(text: Optional[str]) -> Dict[str, Any]:
    """rich_text 생성"""
    return {"rich_text": [{"type": "text", "text": {"content": text}}]} if text else {"rich_text": []}

def _title(text: str) -> Dict[str, Any]:
    return {"title": [{"type": "text", "text": {"content": text}}]}

def _select(name: Optional[str]) -> Dict[str, Any]:
    return {"select": {"name": name}} if name else {"select": None}

def _status(name: str) -> Dict[str, Any]:
    return {"status": {"name": name}}

def _date(d: Optional[date]) -> Dict[str, Any]:
    """YYYY-MM-DD 형태 권장. 없으면 오늘(UTC)"""
    start = d.isoformat() if d else datetime.utcnow().date().isoformat()
    return {"date": {"start": start}}

def _files(url: Optional[str]) -> Dict[str, Any]:
    return {"files": [{"type": "external", "name": "첨부", "external": {"url": url}}]} if url else {"files": []}

def _people(ids: List[str]) -> Dict[str, Any]:
    return {"people": [{"object": "user", "id": x} for x in ids]} if ids else {"people": []}


def _find_user_ids(value: Optional[str]) -> List[str]:
    """
    Notion People 속성 매핑: 이메일(우선) 또는 이름 일치 시 user id 반환.
    매칭 실패 시 빈 리스트(본문에 텍스트로 보강).
    """
    if not (NOTION and value):
        return []

    try:
        collected: List[Dict[str, Any]] = []
        cursor: Optional[str] = None
        while True:
            resp = NOTION.users.list(start_cursor=cursor) if cursor else NOTION.users.list()
            collected.extend(resp.get("results", []))
            cursor = resp.get("next_cursor")
            if not cursor:
                break

        needle = value.strip().lower()
        ids: List[str] = []
        for u in collected:
            name = (u.get("name") or "").lower()
            person = u.get("person") or {}
            email = (person.get("email") or "").lower()
            if needle == email or needle == name:
                ids.append(u["id"])
        return ids
    except Exception:
        # user 조회 실패 시에도 SR 저장은 계속 진행
        return []


# --------------------------
# Routes
# --------------------------
@router.post("/", response_model=schemas.SRRead)
def create_sr(payload: schemas.SRCreate, db: Session = Depends(get_db)):
    """
    SR 티켓을 생성하고 같은 내용을 Notion 데이터베이스에도 복사합니다.
    1) 내부 DB에 먼저 저장
    2) Notion API 호출 → 페이지 생성
       (실패하더라도 SR 레코드는 남도록 try/except 로 감쌉니다)
    """
    if not NOTION_DB_ID:
        # 기존 동작 유지: DB ID 미설정은 500
        raise HTTPException(status_code=500, detail="Notion DB not configured")

    # 1) DB 저장 (status=접수 대기)
    sr = crud.create_sr(db, payload)

    # 2) Notion 페이지 생성 (실패해도 SR는 남도록 예외 잡기)
    try:
        # People 속성 매핑 시도
        assignee_ids = _find_user_ids(getattr(payload, "assignee", None))
        requester_ids = _find_user_ids(getattr(payload, "requester", None))

        properties: Dict[str, Any] = {
            "제목": _title(payload.title),
            "카테고리": _select(payload.category),
            "우선순위": _select(payload.priority),
            "서비스/시스템명": _select(payload.system_name),
            "상태": _status("접수 대기"),
            "요청 일자": _date(getattr(payload, "request_date", None)),
            "티켓번호": _rt(sr.ticket_id),
            # 추가 필드
            "담당 팀": _rt(getattr(payload, "team", None)),
            "담당자": _people(assignee_ids),
            "요청자": _people(requester_ids),
        }

        # 옵션 필드
        if getattr(payload, "summary", None):
            properties["간략 설명"] = _rt(payload.summary)
        if getattr(payload, "contact_email", None):
            properties["연락 이메일"] = {"email": payload.contact_email}
        if getattr(payload, "attachment_url", None):
            properties["첨부 파일"] = _files(str(payload.attachment_url))
        if getattr(payload, "due_date", None):
            properties["마감 일자"] = {"date": {"start": payload.due_date.isoformat()}}

        # 본문: 상세 설명 + People 매칭 실패 시 텍스트로 보강
        children: List[Dict[str, Any]] = [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {"rich_text": [{"type": "text", "text": {"content": "상세 설명"}}]},
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": [{"type": "text", "text": {"content": payload.description}}]},
            },
        ]
        fallbacks: List[str] = []
        if not assignee_ids and getattr(payload, "assignee", None):
            fallbacks.append(f"담당자(텍스트): {payload.assignee}")
        if not requester_ids and getattr(payload, "requester", None):
            fallbacks.append(f"요청자(텍스트): {payload.requester}")
        if fallbacks:
            children.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": [{"type": "text", "text": {"content": ' / '.join(fallbacks)}}]},
            })

        page = NOTION.pages.create(
            parent={"database_id": NOTION_DB_ID},
            properties=properties,
            children=children,
        )
        page_id = page.get("id")
        if page_id:
            crud.set_notion_page_id(db, sr.id, page_id)
    except Exception as e:
        print("[WARN] Notion create failed:", e)

    return sr


@router.get("/", response_model=list[schemas.SRRead])
def list_sr(limit: int = 50, db: Session = Depends(get_db)):
    """최신 SR 티켓 목록을 최대 N건까지 가져옵니다."""
    return crud.list_sr(db, limit)


@router.get("/{sr_id}", response_model=schemas.SRRead)
def get_one(sr_id: int, db: Session = Depends(get_db)):
    """PK(ID) 기반으로 단일 SR 티켓을 조회합니다."""
    item = crud.get_sr(db, sr_id)
    if not item:
        raise HTTPException(404, detail="Not found")
    return item


@router.patch("/{sr_id}/status", response_model=schemas.SRRead)
def patch_status(sr_id: int, payload: schemas.SRUpdateStatus, db: Session = Depends(get_db)):
    """상태값만 부분 수정. (실제 운영에서는 상태값 검증 로직을 확장하세요.)"""
    sr = crud.update_status(db, sr_id, payload.status)
    if not sr:
        raise HTTPException(404, detail="Not found")
    # (선택) 노션 동기화는 운영에서 구현
    return sr
