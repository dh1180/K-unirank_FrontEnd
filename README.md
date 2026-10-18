# K-unirank FrontEnd

K-unirank의 **Next.js + React + TypeScript** 프런트엔드 전용 저장소입니다. 기존 Spring Boot 저장소의 `frontend/`를 **루트 디렉터리로 이관**했습니다.

- API: [K-unirank_BackEnd](https://github.com/dh1180/K-unirank_BackEnd) (Spring Boot)
- AI: [K-unirank_AI](https://github.com/dh1180/K-unirank_AI) (FastAPI)
- 기존 운영: [K-unirank_v2](https://github.com/dh1180/K-unirank_v2) (Django)

> 현재는 **개발 미리보기**입니다. 검색 엔진 차단을 유지하며 기존 Django와 운영 DB를 변경하지 않습니다.

## 개발

Node.js 22 이상이 필요합니다. 먼저 별도 개발 PostgreSQL 복제본을 사용해 Spring Boot API를 실행하세요.

```bash
cp .env.example .env.local
npm install
npm run dev
```

`API_INTERNAL_URL=http://127.0.0.1:8080`은 Next.js 서버가 읽는 Spring API 주소입니다. `NEXT_PUBLIC_` 접두사로 노출하지 마세요. Railway 배포 시에는 `http://<backend-service>.railway.internal:8080` 등 사설 주소를 설정합니다. 실제 API 서비스명과 PORT가 일치해야 합니다.

```bash
npm run test
npm run typecheck
npm run build
```

## Railway 배포 계획

- 프런트엔드 자체를 Railway의 별도 `web` 서비스로 배포
- Next.js는 **리포지터리 루트를 빌드 컨텍스트**로 사용
- `API_INTERNAL_URL`은 백엔드 연결을 검증한 테스트 환경에서만 구성
- `/admissions/`, 대학·학과 URL, 구조화 데이터, 로그인, VS 기능, 광고, sitemap 등 기존 서비스와 동등성 검증 후 운영 도메인 전환
- `robots.ts`와 `layout.tsx`에 **noindex**가 있으므로 운영 전환 전 반드시 별도 PR에서 해제·검증

## Git 컨벤션

[Contextory Backend PR #10](https://github.com/kau-likelion-14th-hackathon/Contextory_BackEnd/pull/10) 형식: `feat:` 커밋 + 변경 사항 리스트, `[Feat]` PR 제목, PR 타입/반영 브랜치/변경 사항/테스트 결과/참고 사항 본문.
