from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

# backend/app/database.py
# -----------------------
# FastAPI 앱이 사용할 SQLAlchemy 연결/세션 관련 도우미를 모아둔 모듈입니다.
# 다른 파일에서는 여기서 제공하는 engine / SessionLocal / Base / get_db 만 import 해서 사용하면 됩니다.

# .env 또는 환경 변수에 정의한 DB 접속 문자열.
# 예) postgresql+psycopg://user:password@host:port/dbname
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy가 실제 DB와 통신할 때 사용할 엔진 객체.
# pool_pre_ping=True 옵션은 커넥션이 닫혀 있으면 재연결하도록 미리 체크합니다.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# 요청마다 쓸 DB 세션(Session) 공장 함수.
# autocommit/autoflush는 기본값 False: 명시적으로 commit() 하기 전까지는 DB에 반영되지 않습니다.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """모든 모델(BaseModel)의 부모가 되는 클래스. Declarative ORM에서 필수."""
    pass


def get_db():
    """
    FastAPI 의 DI(Dependency Injection)에 사용할 제너레이터.
    - 요청이 들어오면 SessionLocal() 로 세션을 하나 만들고
    - 요청 처리가 끝나면 finally 블록에서 반드시 close() 합니다.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
