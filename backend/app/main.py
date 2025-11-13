from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import sr
import os

# backend/app/main.py
# -------------------
# FastAPI 애플리케이션의 시작점. 라우터 등록, CORS 설정 등 앱 전역 구성을 수행합니다.

# FastAPI 인스턴스 생성: title/version 은 자동 Swagger 문서에 표시됩니다.
app = FastAPI(title="SR API (Korean Notion Mapping)", version="0.2.0")

# SQLAlchemy 모델(Base 메타데이터)에 정의된 테이블을 실제 DB에 생성합니다.
# 운영 환경에서는 Alembic 같은 마이그레이션 도구를 쓰지만, POC 단계라서 간단히 자동 생성합니다.
Base.metadata.create_all(bind=engine)

# CORS 허용 도메인 목록을 환경 변수(ALLOWED_ORIGINS)에서 읽어와서 미들웨어에 적용합니다.
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/api/health")
async def health():
    """헬스체크 엔드포인트: 서버가 살아있는지만 빠르게 확인."""
    return {"ok": True}

# SR 관련 라우터(POST/GET/PATCH 등)를 애플리케이션에 등록합니다.
app.include_router(sr.router)
