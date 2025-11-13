<<<<<<< HEAD
# sr_poc
=======
# SR PoC (Korean Notion Schema)

## 프로젝트 개요
- 한글 속성명을 사용하는 Notion 데이터베이스와 연동되는 SR(서비스 요청) 관리 PoC입니다.
- FastAPI + SQLAlchemy + PostgreSQL 조합으로 티켓 저장, 상태 조회, Notion 페이지 생성을 자동화합니다.
- 소규모 팀에서도 쉽게 이해할 수 있도록 코드에 초보자 친화 주석을 풍부하게 추가했습니다.

## 백엔드 프로세스 흐름
1. 클라이언트가 `/api/sr` 엔드포인트로 POST 요청을 전송합니다.
2. `backend/app/routers/sr.py` 라우터가 요청 본문을 `schemas.SRCreate` 로 검증하고, Notion 설정 여부를 확인합니다.
3. 검증된 데이터는 `crud.create_sr()` 을 통해 PostgreSQL(DB)에 저장되며, 저장 후 생성된 `ticket_id` 가 반환됩니다.
4. 동일한 데이터를 기반으로 Notion API를 호출하여 페이지를 생성하고, 생성된 `page_id` 를 다시 DB에 업데이트합니다.
5. 이후 `/api/sr` 목록 조회, `/api/sr/{id}` 단건 조회, `/api/sr/{id}/status` 상태 갱신 엔드포인트가 DB와 통신하여 최신 상태를 제공합니다.
6. `/api/health` 는 배포 환경에서 서비스 정상 동작 여부를 확인하는 헬스체크 용도로 사용합니다.

## 핵심 모듈 및 책임
- `backend/app/main.py` : FastAPI 앱 초기화, CORS 설정, 테이블 생성, 라우터 등록.
- `backend/app/database.py` : SQLAlchemy 엔진/세션 구성과 FastAPI 의존성(`get_db`) 제공.
- `backend/app/models.py` : `sr_tickets` 테이블 구조를 정의하는 ORM 모델.
- `backend/app/schemas.py` : 요청/응답 데이터 검증을 담당하는 Pydantic 모델.
- `backend/app/crud.py` : SR 생성/조회/업데이트 등 DB 액세스 로직과 Notion page_id 업데이트.
- `backend/app/routers/sr.py` : API 엔드포인트 정의, 요청 검증, CRUD 호출, Notion 연동.
- `backend/requirements.txt` : 백엔드 Python 의존성 목록.
- `backend/Dockerfile` : Docker 이미지 빌드 정의.
- `backend/.env` : 로컬 개발용 환경 변수 템플릿(Notion, DB 등).

## 프로젝트 폴더 구조
```text
sr-poc-kor/
├── README.md
├── frontend.md                     # 데모 화면 스토리보드 및 설명
├── docker-compose.yml              # 백엔드 + Postgres 컨테이너 실행 정의
├── package-lock.json               # 루트 의존성(예: shared tooling) 잠금 파일
├── v0_prompt_ko.txt                # 프롬프트 예시(프론트엔드 POC 참고 자료)
├── backend/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── crud.py
│       └── routers/
│           └── sr.py
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── sr/
    │       └── page.tsx
    ├── components/
    │   ├── Background.tsx
    │   ├── Dropzone.tsx
    │   ├── FAQ.tsx
    │   ├── SRForm.tsx
    │   ├── StickyBar.tsx
    │   ├── common/
    │   │   ├── DropzoneCard.tsx
    │   │   └── StickyBar.tsx
    │   ├── providers/
    │   │   ├── QueryProvider.tsx
    │   │   └── ToastProvider.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       └── ...(shadcn 기반 입력 컴포넌트)
    ├── hooks/
    │   └── use-toast.ts
    ├── lib/
    │   ├── api.ts
    │   ├── constants.ts
    │   ├── depth.ts
    │   ├── mappers.ts
    │   ├── progress.ts
    │   ├── storage.ts
    │   └── validators.ts
    ├── public/
    │   └── textures/
    │       └── concrete.jpg
    └── styles/
        └── globals.css
```

## 개발 환경 가이드
### 기본 요구 사항
- Python 3.11+ (로컬 실행 시 권장, Docker 사용 시 자동 포함)
- Docker & Docker Compose (권장 실행 방식)
- Notion API 접근 토큰 및 대상 데이터베이스 ID
- PostgreSQL (Docker Compose로 자동 구성)

### 환경 변수 설정
- `backend/.env` 파일에 아래 항목을 채워주세요.
  - `DATABASE_URL=postgresql+psycopg://user:password@db-host:port/dbname`
  - `NOTION_TOKEN=...`
  - `NOTION_DB_ID=...`
- 프론트엔드 연동 시 `.env` 또는 환경 변수로 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` 를 지정합니다.

### Notion 사전 준비
- Notion DB 속성은 **한글 이름**을 그대로 사용해야 합니다.
- 속성 예시: 제목(Title), 간략 설명(Rich text), 상세 설명(배경 및 조치사항)(Rich text),
  상태(Status: 접수 대기/접수 완료/보류/진행 중/검토 중/완료/취소),
  서비스/시스템명(Select: MS Teams/HERP-NTMS/통합HR/그룹웨어),
  요청 일자(Date), 우선순위(Select: 낮음/보통/높음/긴급), 첨부 파일(Files),
  카테고리(Select: 장애/문의/개선/계정/기타/신규), 마감 일자(Date), 티켓번호(Rich text).

### 로컬 실행 (Docker Compose)
```bash
docker compose up -d --build
curl http://localhost:8000/api/health
```
- 헬스체크 응답이 `{"ok": true}` 이면 백엔드가 정상 기동된 것입니다.

### 샘플 API 호출
```bash
curl -X POST http://localhost:8000/api/sr \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "MS Teams 채널 초대 오류",
    "summary": "특정 보안그룹만 초대 실패",
    "description": "팀즈에서 특정 보안그룹을 멤버로 추가 시 403 오류. 재현 조건과 로그는 첨부 링크 참고",
    "category": "장애",
    "priority": "높음",
    "system_name": "MS Teams",
    "contact_email": "user@example.com",
    "attachment_url": "https://example.com/screenshot.png"
  }'
```
- 성공 시 PostgreSQL `sr_tickets` 테이블에 저장되고 Notion DB에도 페이지가 생성됩니다.

### 개발자 팁
- 로컬에서 Python으로 직접 실행하려면 `backend` 폴더에서 `pip install -r requirements.txt` 후 `uvicorn app.main:app --reload` 를 실행하세요.
- FastAPI 자동 문서는 `http://localhost:8000/docs`, ReDoc은 `http://localhost:8000/redoc` 에서 확인할 수 있습니다.

## 프론트엔드 (Next.js 14 Intake UI)
Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui 조합으로 SR 접수 경험을 제공합니다. 실사용 환경에서 바로 연결할 수 있도록 화면, 상태, 데이터 계약을 백엔드와 동일한 스키마로 맞춰두었습니다.

### 개발/실행
- 위치: `frontend/`
- 실행 절차
  ```bash
  cd frontend
  npm install
  npm run dev             # http://localhost:3000
  npm run lint            # ESLint 확인
  ```
- 환경 변수: `frontend/.env.local`에 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` 를 지정하고, 업로드 기능을 임시 비활성화하려면 `NEXT_PUBLIC_ENABLE_UPLOAD=false` 를 추가합니다.

### 프론트엔드 폴더 구조 요약
```text
frontend/
├── app/                  # App Router 엔트리, 공통 레이아웃 및 SR 페이지
├── components/           # SR 화면을 구성하는 프리미티브/페이지 컴포넌트
├── hooks/                # 클라이언트 훅 (예: toast 상태)
├── lib/                  # API, 폼 옵션, 상태 계산 유틸
├── public/               # 배경 텍스처 등 정적 자산
├── styles/               # Tailwind 기반 글로벌 스타일
└── (config files)        # next.config.mjs, tailwind.config.ts, tsconfig.json 등
```

### 라우트 & 화면 흐름
- `frontend/app/layout.tsx` : Noto Sans KR 폰트, Vercel Analytics, shadcn `Toaster` Provider를 등록해 전역 UI 컨텍스트를 구성합니다.
- `frontend/app/page.tsx` : 루트 접속 시 `/sr`로 즉시 리디렉션하여 단일 SR 인입 경험에 집중합니다.
- `frontend/app/sr/page.tsx` : 글래스모피즘 배경(`components/Background.tsx`)과 FAQ/가이드를 좌측 사이드에 배치하고, 우측에는 SR 폼(`components/SRForm.tsx`)을 감싼 카드가 위치합니다. 섹션 헤더/Sticky CTA(`components/StickyBar.tsx`, `components/common/StickyBar.tsx`)로 모바일에서도 행동 유도를 유지합니다.

### SR Intake 기능 하이라이트
- `frontend/components/SRForm.tsx` : `react-hook-form` + `zod`로 모든 필드를 검증하고, `useEffect`로 작성 진행률(`lib/progress.ts`)과 자동 임시저장(`lib/storage.ts`)을 동시에 갱신합니다. 제출 시 `fetch`를 통해 백엔드 `/api/sr`에 POST 요청을 전송하고 성공 모달을 띄웁니다.
- `frontend/components/Dropzone.tsx` / `components/common/DropzoneCard.tsx` : `react-dropzone` 기반 파일 업로드 UI와 미리보기, 허용 확장자, 삭제 컨트롤을 제공합니다.
- `frontend/components/FAQ.tsx` : 자주 묻는 질문 섹션으로 SR 작성 가이드와 함께 좌측 정보 레일을 구성합니다.
- `frontend/components/StickyBar.tsx` : 스크롤 시에도 제출/초기화 버튼을 노출하여 긴 폼에서도 CTA 접근성을 유지합니다.

### 데이터 · 상태 관리 유틸리티
- `frontend/lib/api.ts` : `NEXT_PUBLIC_API_BASE_URL` 환경변수에 따라 실서버/로컬 API를 분기하고, 업로드 기능(`uploadFile`)은 설정 여부에 따라 예외 처리를 제공합니다.
- `frontend/lib/constants.ts` : 회사, 시스템, 담당자, 요청 구분 상수와 TypeScript 타입을 중앙관리하여 폼과 UI 컴포넌트에서 재사용합니다.
- `frontend/lib/storage.ts` & `frontend/lib/progress.ts` : 로컬 스토리지에 초안 저장/복원, 필수 필드 충족률 계산을 담당해 사용성 데이터를 제공합니다.
- `frontend/components/providers/QueryProvider.tsx` 는 tanstack/react-query 클라이언트를 주입할 준비가 되어 있고, `frontend/components/providers/ToastProvider.tsx` 및 `frontend/hooks/use-toast.ts` 는 사용자 알림을 위한 자체 토스트 스택을 구현합니다.
- `frontend/lib/depth.ts` : 글래스 카드, pill, 입력 등 공통 입체감 클래스를 제공해 Tailwind 유틸을 캡슐화합니다.

### 디자인 시스템 & 자산
- `frontend/styles/globals.css` 와 `frontend/app/globals.css`는 콘크리트 질감(`frontend/public/textures/concrete.jpg`)과 브랜드 레디언트(`glass-card`, `pill`, `shadow-depth-*`)를 정의해 화면 전반의 톤을 맞춥니다.
- `frontend/components/ui/*` 폴더는 shadcn/ui에서 가져온 Form/Command/Dialog 등 프리미티브를 포함하며, `tailwind.config.ts`에 등록된 디자인 토큰과 함께 일관된 인터랙션을 제공합니다.
- `frontend/components/Background.tsx` 는 캔버스/gradient 요소를 조합해 상시 움직이는 조명 효과를 내고, `app/layout.tsx` 의 폰트/Analytics 설정과 결합해 프로덕션급 브랜딩을 구성합니다.

Next.js 문서 자동 제공: http://localhost:3000/sr 접속 시 최신 UI를 확인할 수 있습니다.
>>>>>>> d00f34b (chore: initial commit (frontend+backend+compose))
