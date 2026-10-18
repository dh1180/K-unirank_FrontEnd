# AI 입결 검색 화면 및 BFF

브라우저 → Next.js `/api/ai/questions` → Railway Spring Boot `/api/v1/ai/questions` → Raspberry Pi 5 FastAPI `/api/v1/ai/parse`

- FastAPI는 질문에서 검색 조건만 추출하며 운영 PostgreSQL을 직접 조회하지 않음.
- Spring Boot에서 `GradeComparisonService`의 공개 입결 수치를 근거로 응답.
- `AI_FRONTEND_TOKEN`은 Next.js 서버 전용이며 Spring의 동일 이름 설정과 일치해야 함. `NEXT_PUBLIC_` 사용 금지.
- `AI_FRONTEND_ENABLED=false`가 기본값. 운영 전에 HTTPS 터널, 비용·사용자별 rate limit, 실제 DB 복제본 테스트 필요.
- 프런트의 개발 미리보기 `robots=noindex` 유지. 운영 Django 도메인 전환은 실행하지 않음.
