from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal
from datetime import date

# backend/app/schemas.py
# ----------------------
# FastAPI 엔드포인트로 들어온 JSON 데이터를 검증하고, 응답에 나갈 형태를 정의합니다.
# Pydantic BaseModel 을 사용하면 타입/길이 등 기본 검증을 쉽게 붙일 수 있습니다.

# Literal 은 지정된 문자열만 허용하도록 강제합니다.
Category = Literal["장애", "문의", "개선", "계정", "기타", "신규"]
Priority = Literal["낮음", "보통", "높음", "긴급"]


class SRCreate(BaseModel):
    """
    POST /api/sr 에서 사용할 요청(body) 모델.
    - Field() 를 사용하면 최소/최대 길이 같은 추가 검증 조건을 둘 수 있습니다.
    - Optional[...] 은 값이 없어도(None) 통과한다는 의미입니다.
    """

    # 필수 입력값
    title: str = Field(min_length=2, max_length=100, description="제목")
    team: str = Field(min_length=1, max_length=100, description="담당 팀")
    assignee: str = Field(min_length=1, max_length=100, description="담당자(이름/이메일)")
    description: str = Field(min_length=2, description="상세 설명")
    category: Category
    priority: Priority
    system_name: str = Field(min_length=1, max_length=100, description="서비스/시스템명")
    request_date: Optional[date] = Field(None, description="요청일자(없으면 오늘)")
    requester: str = Field(min_length=1, max_length=100, description="요청자(이름/이메일)")

    # 선택 입력값 (없으면 자동으로 None)
    summary: Optional[str] = Field(None, max_length=200)
    attachment_url: Optional[HttpUrl] = None  # 유효한 URL 형식만 통과


class SRResponse(BaseModel):
    """티켓 생성/조회 이후 클라이언트에 내려줄 최소한의 정보."""

    id: int
    ticket_id: str
    status: str
    notion_page_id: Optional[str] = None

    class Config:
        # SQLAlchemy 모델 객체를 그대로 넣어도 자동으로 dict로 변환해줍니다.
        from_attributes = True


class SRRead(BaseModel):
    """목록/상세 조회 시 공통으로 사용하는 응답 스키마."""

    id: int
    ticket_id: str
    status: str
    notion_page_id: Optional[str] = None

    class Config:
        from_attributes = True


class SRUpdateStatus(BaseModel):
    """PATCH /status 요청에서 허용하는 상태값만 Literal 로 제한합니다."""

    status: Literal["접수 대기", "접수 완료", "보류", "진행 중", "검토 중", "완료", "취소"]
