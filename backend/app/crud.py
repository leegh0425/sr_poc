# backend/app/crud.py
# -------------------
# "CRUD" = Create / Read / Update / Delete 의 약자.
# 여기서는 SR(서비스 요청) 티켓에 대한 DB 입출력을 담당합니다.

from typing import Optional, List
from uuid import uuid4
from sqlalchemy.orm import Session
from datetime import datetime, date
from . import models, schemas  # models: DB 테이블 정의, schemas: 요청/응답 검증(Pydantic)

# 모든 티켓 앞에 붙일 접두어. 회사 규칙에 맞게 바꿀 수 있습니다.
PREFIX = "SR"

def gen_ticket_id() -> str:
    """
    사람이 읽기 쉬운 간단한 티켓 번호 생성기.
    예) "SR-1A2B3C4D"
    - uuid4()는 매우 긴 랜덤값을 주는데, 여기서는 앞 8자만 쓰고 대문자로 변환합니다.
    """
    return f"{PREFIX}-{str(uuid4())[:8].upper()}"


def _to_str(value: Optional[object]) -> Optional[str]:
    """
    EmailStr/HttpUrl 같은 Pydantic 특수 타입은 파이썬 객체(Url, Email)로 들어옵니다.
    그대로 DB에 넣으면 SQLAlchemy가 '무슨 타입인지 모르겠다'며 에러를 냅니다.
    → DB에 저장하기 전에 문자열(str)로 바꿔줍니다. (None이면 None 유지)
    """
    return str(value) if value is not None else None


def _to_iso(d: Optional[date]) -> Optional[str]:
    return d.isoformat() if d else None


def create_sr(db: Session, data: schemas.SRCreate) -> models.SR:
    """
    SR(서비스 요청) 한 건을 생성합니다.

    인자:
      - db: 세션(트랜잭션 단위). 모든 DB 작업은 이걸 통해 수행합니다.
      - data: Pydantic으로 검증된 요청 바디(schemas.SRCreate)

    처리 순서:
      1) models.SR 인스턴스 생성 (아직 DB에 INSERT 된 상태는 아님)
      2) db.add(sr)  : 세션에 등록 (변경 감지 대상이 됨)
      3) db.commit() : 실제로 INSERT
      4) db.refresh(sr): INSERT 후 DB에서 확정된 값(자동 증가 id, created_at 등)을 다시 읽어옴
    """
    sr = models.SR(
        ticket_id=gen_ticket_id(),
        title=data.title,
        summary=_to_str(getattr(data, "summary", None)),
        description=data.description,

        category=_to_str(data.category),
        priority=_to_str(data.priority),
        system_name=_to_str(data.system_name),

        # 추가된 필드
        team=_to_str(getattr(data, "team", None)),
        assignee=_to_str(getattr(data, "assignee", None)),
        requester=_to_str(getattr(data, "requester", None)),
        request_date=_to_iso(getattr(data, "request_date", None)) or datetime.utcnow().date().isoformat(),

        # 누락 지적한 contact_email 반영
        contact_email=_to_str(getattr(data, "contact_email", None)),

        attachment_url=_to_str(getattr(data, "attachment_url", None)),
        status="접수 대기",
        due_date=_to_iso(getattr(data, "due_date", None)),
    )

    # 세션에 객체 등록(아직 INSERT는 아님)
    db.add(sr)
    # 트랜잭션 커밋 → 실제 INSERT
    db.commit()
    # DB가 채워준 값(예: id, created_at)을 객체에 반영
    db.refresh(sr)
    return sr


def get_sr(db: Session, sr_id: int) -> Optional[models.SR]:
    """
    SR 1건 조회(by PK).
    SQLAlchemy 2.x 권장 방식: db.get(Model, pk)
    """
    return db.get(models.SR, sr_id)


def list_sr(db: Session, limit: int = 50) -> List[models.SR]:
    """
    SR 목록 조회 (최신 순서, 최대 N건).
    - ORM 쿼리 체이닝:
        query(Model).order_by(...).limit(N).all()
    """
    return db.query(models.SR).order_by(models.SR.id.desc()).limit(limit).all()


def update_status(db: Session, sr_id: int, status: str) -> Optional[models.SR]:
    """
    SR 상태값만 간단히 갱신.
    - 실제 서비스에서는 status 값 검증(허용 목록) 로직을 추가하세요.
    """
    sr = db.get(models.SR, sr_id)
    if not sr:
        return None
    sr.status = status
    db.commit()
    db.refresh(sr)  # 갱신된 값을 다시 읽어 반영
    return sr


def set_notion_page_id(db: Session, sr_id: int, page_id: str) -> Optional[models.SR]:
    """
    노션에 페이지가 생성된 뒤, 그 page_id를 SR 레코드에 연결할 때 사용.
    """
    sr = db.get(models.SR, sr_id)
    if not sr:
        return None
    sr.notion_page_id = page_id
    db.commit()
    return sr
