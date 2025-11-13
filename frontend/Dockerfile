# ---------- BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

# 공개변수(클라이언트에서 쓰는 값)는 빌드타임에도 필요
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# package 설치
COPY package*.json ./
RUN npm ci

# 소스 복사 (컨텍스트가 ./frontend 이므로 앞에 frontend/ 붙이면 안 됨)
COPY . .

# Tailwind/PostCSS는 devDeps라서 omit 금지
RUN npm run build

# ---------- RUN ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# 런타임에서도 동일 값이 필요하면 유지
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Next standalone 서버 + 정적/공용 자산을 반드시 복사
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]