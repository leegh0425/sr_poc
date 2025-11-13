# CODEx — v0/shadcn 번들 주입 (Next 16 + Tailwind v4 환경)

## 목표
- `frontend/` Next.js(App Router) 프로젝트에 **v0/shadcn 번들**을 주입한다.
- Tailwind v4(+ `@tailwindcss/postcss`) 구성은 유지한다.
- `/sr` 라우트는 기존 그대로 쓰되, 필요한 UI 컴포넌트/스타일은 번들에서 공급받는다.

---

## 0) 작업 디렉터리
항상 `frontend/`에서 실행한다.
```bash
cd ~/projects/sr-poc-kor/frontend
1) Next App Router 최소 골격 보장
1-1) app/layout.tsx 확인/생성
이미 있으면 이 형태와 크게 다르지 않은지만 확인.

tsx
코드 복사
// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className="min-h-full">
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
1-2) app/globals.css 확인/생성
맨 위 3줄 필수!

css
코드 복사
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 필요 시 커스텀 CSS 추가 (비워둬도 됨) */
2) shadcn CLI 인식 설정
2-1) components.json 생성(없으면)
json
코드 복사
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tsconfigPath": "./tsconfig.json",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
2-2) shadcn 유틸 추가 (없으면)
bash
코드 복사
mkdir -p lib
ts
코드 복사
// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
3) 필수 패키지 점검/설치
Tailwind v4 플러그인과 shadcn에서 자주 쓰는 유틸을 설치한다.
(이미 있으면 건너뜀)

bash
코드 복사
npm i @tailwindcss/postcss autoprefixer \
      clsx tailwind-merge \
      @radix-ui/react-icons @radix-ui/react-slot class-variance-authority
4) v0/shadcn 번들 주입
반드시 frontend/에서 실행

bash
코드 복사
npx shadcn@latest add "https://v0.app/chat/b/b_0KVXHD1tFlB?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..viv6BG30eVN4sb80.AfM7Tso53ZgpF25QBKOjuPXBUzu83II6S6iZYuI0fF_1n2m36a8JJ7iuZOg.ElSyPjkTSHa_25gpAVto4w"
프롬프트가 components.json 생성 여부를 묻는다면: Yes

파일 충돌 시 원칙:

UI 코드(components/, app/sr/)** → 번들 쪽 우선으로 덮어쓴다.

설정 파일(package.json, tailwind.config.ts, postcss.config.mjs) → 기존 버전/구성 유지.

단, 번들이 추가한 dependencies/devDependencies는 병합 후 npm i로 동기화.

번들 주입 후 의존성 설치:

bash
코드 복사
npm i
5) 실행 & 확인
로컬(dev)
bash
코드 복사
# 혹시 떠있는 dev 서버가 있으면 종료
pkill -f "next dev" || true

npm run dev
# 브라우저에서 확인: http://localhost:3000/sr
도커(선택, 프론트만 재배포)
bash
코드 복사
cd ~/projects/sr-poc-kor
docker compose build --no-cache sr_frontend
docker compose up -d sr_frontend
# 확인: http://172.16.200.143:3010/sr  (환경에 맞게 포트 확인)
체크리스트 (문제 발생 시)
app/layout.tsx가 **./globals.css**를 import 하는지.

app/globals.css 맨 위에 @tailwind base/components/utilities 3줄이 있는지.

components.json이 존재하고 "tailwind.css": "app/globals.css"로 지정됐는지.

번들 주입 후 npm i 를 실행했는지.

tailwind v4용 PostCSS 플러그인: @tailwindcss/postcss + autoprefixer 가 설치되어 있는지.

클래스를 못 알아본다는 오류가 나면 dev 서버를 완전히 재시작(프로세스 종료 후 npm run dev) 한다.

위 단계까지 완료되면 /sr 페이지는 v0/shadcn 번들이 적용된 UI로 렌더링되어야 한다.