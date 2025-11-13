# IT SR Intake Frontend (Next.js + Tailwind + shadcn/ui)
**파일명:** `frontend.md`  
**목적:** Daiso용 IT 서비스 요청(SR) 접수 페이지를 **모던/입체(뉴모피즘+글래스)** 스타일로 구현.  
**런타임:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + react-hook-form + zod + react-dropzone.  
**브랜드:** Daiso Red `#E60012` 중심.

---

## 0) 결과물 요구사항 (Codex 참고용)
- 라우트: `/sr/new` (App Router)
- 주요 컴포넌트
  - `components/sr/SRForm.tsx` : 폼 전체
  - `components/sr/FAQ.tsx` : 좌측 FAQ 아코디언
  - `components/sr/Guide.tsx` : 좌측 작성 가이드
  - `components/common/StickyBar.tsx` : 하단 고정 제출/리셋/임시저장 바
  - `components/common/DropzoneCard.tsx` : 파일 드롭존
- API 연동
  - Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL` (예: `http://localhost:8000`)
  - SR 생성: `POST /api/sr/` (JSON)
  - 파일 업로드(필수): `POST /api/upload` (multipart/form-data) → `{ "url": "https://..." }` 반환  
    ※ 백엔드에 `/api/upload`가 없다면 **임시로 비활성화** 하되, 구현되어 있으면 자동으로 사용.
- 제출 성공 시 모달로 **티켓번호** 출력. 실패 시 토스트 에러.
- **접근성(A11y)**: 모든 라벨/aria-속성/키보드 포커스 지원, 에러 메시지 명확히 노출.
- **로컬 자동 저장**: 작성 중 내용 `localStorage`에 주기적으로 저장/복원.
- **반응형**: 데스크톱 2열, 모바일 1열.

---

## 1) 설치 & 초기화

```bash
# 새 프론트엔드 폴더 생성
mkdir frontend && cd frontend

# Next 14 + TS 템플릿
npm create next@latest . -- --ts --eslint --app --tailwind --src-dir --no-experimental-app

# 기본 패키지
npm i axios zod react-hook-form @hookform/resolvers react-dropzone   @tanstack/react-query framer-motion class-variance-authority tailwind-merge lucide-react

# shadcn/ui 초기화
npx shadcn@latest init

# 필요한 컴포넌트 추가(선택: 생성기에서 필요한 만큼 호출)
npx shadcn@latest add button input textarea select label form popover calendar   radio-group badge progress accordion tooltip dialog toast separator dropdown-menu
```

> **Node**: LTS 권장.  
> **폴더 이름이 이미 있다면** 위 명령에서 `.` 대신 프로젝트명을 사용하세요.

---

## 2) 환경 변수

`frontend/.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 3) 파일 구조

```
frontend/
  app/
    (sr)/
      sr/
        new/
          page.tsx
  components/
    sr/
      SRForm.tsx
      FAQ.tsx
      Guide.tsx
    common/
      StickyBar.tsx
      DropzoneCard.tsx
  lib/
    api.ts
    mappers.ts
    validators.ts
  public/
    textures/concrete.jpg     # 콘크리트 질감 이미지(회색 유럽 미장 느낌)
  styles/
    globals.css               # Tailwind 레이어 커스텀
  tailwind.config.ts
```

> **콘크리트 텍스처** 파일을 `public/textures/concrete.jpg`로 추가하세요. (회색 유럽미장/콘크리트 질감)

---

## 4) Tailwind 테마 토큰 & 글로벌 스타일

### `tailwind.config.ts` 확장
```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#E60012",  // Daiso Red
          700: "#b0000e",
          800: "#8a000b",
          900: "#5c0008"
        },
      },
      boxShadow: {
        // 뉴모피즘+글래스 입체감
        "depth-1":
          "0 10px 24px -12px rgba(230,0,18,.18), inset 0 1px 0 rgba(255,255,255,.9)",
        "depth-2":
          "0 16px 40px -14px rgba(230,0,18,.28), inset 0 1px 0 rgba(255,255,255,.9)",
        "inner-soft":
          "inset 0 1px 0 rgba(255,255,255,.85), inset 0 -3px 10px rgba(0,0,0,.06)",
        "bevel-1":
          "inset 1px 1px 0 rgba(255,255,255,.8), inset -1px -1px 0 rgba(0,0,0,.05), 0 12px 24px -14px rgba(0,0,0,.15)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config
```

### `styles/globals.css` 배경 & 컴포넌트 기본
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 페이지 배경: 콘크리트 질감 + 아주 옅은 레드 그라데이션 오버레이 */
:root {
  --bg-overlay: radial-gradient(1200px 600px at 70% 10%, rgba(230,0,18,0.08), transparent 60%),
                 radial-gradient(1000px 500px at 20% 90%, rgba(230,0,18,0.06), transparent 55%);
}

html, body {
  @apply h-full min-h-screen;
  background-image:
    var(--bg-overlay),
    url("/textures/concrete.jpg");
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
}

/* 카드/필드의 글래스+뉴모피즘 기본 */
.glass-card {
  @apply rounded-3xl bg-white/70 backdrop-blur-md shadow-depth-2;
  border: 1px solid rgba(255,255,255,.6);
}

.input-3d {
  @apply rounded-2xl bg-white/80 backdrop-blur-[2px] border border-white/60 shadow-inner-soft;
}
.input-3d:hover { @apply shadow-depth-1; }
.input-3d:focus-visible { @apply ring-2 ring-brand-600/70 ring-offset-2 outline-none; }

.pill {
  @apply rounded-full bg-white/85 px-4 py-2 shadow-depth-1;
}
.pill[data-state="on"],
.pill-active {
  background: linear-gradient(to bottom, #fb4a5d, #E60012);
  color: white;
  box-shadow: 0 16px 40px -14px rgba(230,0,18,.32), inset 0 1px 0 rgba(255,255,255,.7);
}

.shadow-bevel-deep {
  /* 버튼/필드에 강한 입체감 */
  box-shadow:
    inset 2px 2px 0 rgba(255,255,255,.9),
    inset -2px -2px 0 rgba(0,0,0,.08),
    0 18px 40px -18px rgba(0,0,0,.25);
}
```

---

## 5) 유스케이스 & UI 구성 (요약 스펙)

### 좌측 패널
- **FAQ**: 아코디언(3~4개 Q/A), 글래스 카드
- **작성 가이드**: 체크리스트, 글래스 카드

### 우측 메인 카드
- 상단 진행률(progress bar, brand 색상)
- 섹션: **기본 정보**, **시스템 정보**, **요청 상세**
- **필드(필수)**: 회사(라디오 pill), 소속 부서/팀, 요청자 이름, 제목, 시스템 선택(검색), 시스템 담당자(검색), 요청 구분(장애/문의/개선/신규/기타 – pill 라디오), 요청일자(date), 상세내용(textarea), **첨부 파일(드롭존-필수)**
- **옵션**: 완료일자(date), 답변 받을 이메일
- 하단 **StickyBar**: Unsaved / Reset / Submit (캡슐형 글래스 바)

### 상태 스타일
- Default: soft inner highlight + light outer shadow
- Hover: `translate-y-[-1px]` + shadow 10~15% 증가
- Active/Checked: `translate-y-[1px]` + inner shadow 강조(pressed)
- Focus: `ring-2 ring-brand-600/70 ring-offset-2`

---

## 6) 폼 검증 스키마 (zod)

```ts
// lib/validators.ts
import { z } from "zod"

export const srSchema = z.object({
  company: z.enum(["아성MP","HS","아성물류","아성다이소"]),
  team: z.string().min(1, "소속 부서/팀을 입력하세요"),
  requester: z.string().min(1, "요청자 이름을 입력하세요"),
  title: z.string().min(2, "제목을 입력하세요"),
  system_name: z.string().min(1, "시스템을 선택하세요"),
  assignee: z.string().min(1, "담당자를 선택하세요"),
  category: z.enum(["장애","문의","개선","신규","기타"]),
  request_date: z.string().min(1, "요청일자를 선택하세요"),
  description: z.string().min(10, "최소 10자 이상 상세 내용을 입력하세요"),
  attachment_url: z.string().url("첨부 업로드 결과 URL이 필요합니다"),
  due_date: z.string().optional(),
  contact_email: z.string().email().optional(),
  summary: z.string().optional(), // 간략 설명
  priority: z.enum(["낮음","보통","높음"]).optional(), // 필요시
})
export type SRPayload = z.infer<typeof srSchema>
```

---

## 7) API 규격 (프론트 기준)

### 7.1 SR 생성
`POST {BASE_URL}/api/sr/`

```json
{
  "title": "MS Teams 채널 초대 오류",
  "summary": "특정 보안그룹만 초대 실패",
  "description": "재현 절차/오류 로그는 첨부 링크 참조",
  "category": "장애",
  "priority": "높음",
  "system_name": "MS Teams",
  "team": "IT개발팀",
  "assignee": "홍길동",
  "requester": "이광현",
  "request_date": "2025-11-07",
  "due_date": "2025-11-15",
  "contact_email": "example@daiso.co.kr",
  "attachment_url": "https://files.example.com/abc.png"
}
```

**성공 응답 예시**
```json
{ "id": 1, "ticket_id": "SR-6A25E9B2", "status": "접수 대기", "notion_page_id": null }
```

### 7.2 파일 업로드(필수)
`POST {BASE_URL}/api/upload` (multipart/form-data: `file` 필드)

**응답**
```json
{ "url": "https://files.example.com/uuid-filename.ext" }
```

> 백엔드 구현이 없으면 드롭존은 **미리보기만 제공**하고 제출 버튼 비활성화.  
> 구현 시, 업로드 후 반환된 `url`을 `attachment_url`에 채워 SR을 생성.

---

## 8) 코드 스케치

### 8.1 `lib/api.ts`
```ts
import axios from "axios"
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

export async function createSR(payload: any) {
  const { data } = await api.post("/api/sr/", payload)
  return data
}

export async function uploadFile(file: File) {
  const form = new FormData()
  form.append("file", file)
  const { data } = await api.post("/api/upload", form, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return data as { url: string }
}
```

### 8.2 `components/common/DropzoneCard.tsx`
```tsx
"use client"

import { useState } from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { uploadFile } from "@/lib/api"

type Props = {
  onUploaded: (url: string) => void
  disabled?: boolean
}

export default function DropzoneCard({ onUploaded, disabled }: Props) {
  const [busy, setBusy] = useState(false)
  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted?.length || disabled) return
    try {
      setBusy(true)
      const res = await uploadFile(accepted[0])
      onUploaded(res.url)
    } finally {
      setBusy(false)
    }
  }, [disabled, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false })

  return (
    <div
      {...getRootProps()}
      className={`glass-card input-3d border-dashed border-2 p-10 text-center transition
        ${isDragActive ? "ring-2 ring-brand-600/60 scale-[1.01]" : ""}
        ${busy ? "opacity-70 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="text-sm text-neutral-600">
        {busy ? "업로드 중..." : (isDragActive ? "여기에 파일을 놓으세요" : "파일 첨부(필수) – 클릭 또는 드래그")}
      </div>
      <div className="text-xs text-neutral-400 mt-2">허용: 이미지, PDF, Word 문서</div>
    </div>
  )
}
```

### 8.3 `app/(sr)/sr/new/page.tsx`
```tsx
import SRForm from "@/components/sr/SRForm"

export default function Page() {
  return (
    <div className="p-4 md:p-8">
      <SRForm />
    </div>
  )
}
```

> `SRForm.tsx`에서는 `react-hook-form`+`zodResolver(srSchema)`를 사용하고,  
> 각 필드는 `input-3d shadow-bevel-deep` 클래스를 적용하여 **입체감을 강화**합니다.  
> 라디오 pill, 선택 컨트롤은 `pill` 클래스로 스타일링하고 선택 시 그라데이션 브랜딩 처리.  
> StickyBar는 상단 스크롤과 무관하게 하단 고정 캡슐 형태(글래스 + 내부 하이라이트)로 구현합니다.

---

## 9) 접근성 & UX
- 폼 컨트롤 모두 `label for` 연계, `aria-invalid`, `aria-describedby` 적용
- 키보드 탐색: 탭 순서, 라디오/콤보박스 화살표 이동, ESC 닫기
- 에러 메시지는 빨간 틴트와 함께 구체적 설명 제공
- 제출 중 로딩 인디케이터, 중복 제출 방지
- 저장/리셋/제출 버튼: `Disabled → Hover → Active → Focus` 상태 모두 시각적으로 구분

---

## 10) 런 & 테스트

```bash
npm run dev
# http://localhost:3000/sr/new 접속
```

**백엔드 확인**
```bash
# FastAPI 헬스체크
curl http://localhost:8000/api/health

# SR 테스트 (파일 업로드 후 받은 URL 사용)
curl -X POST http://localhost:8000/api/sr/   -H "Content-Type: application/json"   -d '{
    "title":"Teams 초대 오류",
    "summary":"보안그룹 초대 실패",
    "description":"재현 절차는 첨부 링크 참조",
    "category":"장애",
    "priority":"높음",
    "system_name":"MS Teams",
    "team":"IT개발팀",
    "assignee":"홍길동",
    "requester":"이광현",
    "request_date":"2025-11-07",
    "attachment_url":"https://files.example.com/demo.png"
  }'
```

---

## 11) 디자인 체크리스트
- 콘크리트 텍스처 + 옅은 레드 **오버레이 배경** (거친 유럽 미장 페인트 질감)
- 입력 필드/카드 **입체감 강화** (`shadow-bevel-deep`, `shadow-depth-2`, 내부 하이라이트)
- 포커스/호버/프레스 상태 차이 분명
- 브랜드 컬러 사용 위치: 포커스 링, 진행률, CTA, 선택 pill
- 모바일 1열, 데스크톱 2열 그리드

---

## 12) 구현 메모
- `/api/upload`가 준비되면 **DropzoneCard → uploadFile** 흐름이 자동 연결됨.  
  준비 전에는 제출 버튼을 비활성화하거나, 대체로 **URL 입력 필드**를 임시 제공할 수 있음.
- 백엔드에서 **Notion 파일 등록**까지 처리. 프론트는 업로드 URL만 전달.

---

## 13) 완료 기준
- `/sr/new`에서 모든 필수 필드 검증 + 파일 업로드 가능
- 제출 시 **티켓 ID** 모달 표시, DB/Notion에 반영
- 콘크리트 질감 배경 + 3D UI가 스크린샷 기준으로 명확히 보임
