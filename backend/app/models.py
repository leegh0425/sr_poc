from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
from datetime import datetime

# backend/app/models.py
# ---------------------
# SQLAlchemy ORM 모델(테이블 구조)을 정의하는 파일입니다.
# 이 프로젝트에서는 SR(서비스 요청) 한 건이 한 행(row)이 되도록 SR 클래스를 만듭니다.


class SR(Base):
    """
    sr_tickets 테이블에 매핑되는 ORM 모델.
    - 클래스 변수로 선언한 Column 이 실제 테이블 컬럼이 됩니다.
    - Base 를 상속하면 SQLAlchemy 가 내부적으로 메타데이터를 생성합니다.
    """

    __tablename__ = "sr_tickets"

    # 기본 식별자(primary key) 및 티켓 고유 번호
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(32), unique=True, index=True)

    # 사용자가 제출하는 주요 본문 데이터
    title = Column(String(200), nullable=False)
    summary = Column(String(500))
    description = Column(String(4000), nullable=False)

    # 선택/드롭다운 형태의 속성들
    category = Column(String(20))
    priority = Column(String(20))
    system_name = Column(String(100))

    # 문자열로 저장되는 추가 메타 정보 (날짜는 ISO 포맷 문자열)
    team = Column(String(100))          # 담당 팀
    assignee = Column(String(100))      # 담당자 이름 또는 이메일
    requester = Column(String(100))     # 요청자 이름 또는 이메일
    request_date = Column(String(32))   # "YYYY-MM-DD" 형태의 문자열

    contact_email = Column(String(200))
    attachment_url = Column(String(1000))

    # 진행 상태 및 Notion 연동 정보
    status = Column(String(50), default="접수 대기")
    notion_page_id = Column(String(100))
    due_date = Column(String(32))  # 마감일도 문자열로 저장

    # 생성/수정 시각 관리 (UTC 기준)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime)
