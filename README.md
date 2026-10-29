# K-unirank FrontEnd

K-unirank의 **Next.js + React + TypeScript** 프런트엔드 전용 저장소입니다. 기존 Spring Boot 저장소의 `frontend/`를 **루트 디렉터리로 이관**했습니다.

- API: [K-unirank_BackEnd](https://github.com/dh1180/K-unirank_BackEnd) (Spring Boot)
- AI: [K-unirank_AI](https://github.com/dh1180/K-unirank_AI) (FastAPI)
- 기존 운영: [K-unirank_v2](https://github.com/dh1180/K-unirank_v2) (Django)

> 현재는 **개발 미리보기**입니다. 검색 엔진 차단을 유지하며 기존 Django와 운영 DB를 변경하지 않습니다.

## 개발

Node.js 22 이상이 필요합니다. 로컬에서는 별도 개발 DB를 사용하는 Spring Boot API를 실행하세요. Railway 미리보기는 배포된 읽기 전용 Spring API를 사용합니다.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

`API_INTERNAL_URL=http://127.0.0.1:8080`은 Next.js 서버가 읽는 Spring API 주소입니다. `NEXT_PUBLIC_` 접두사로 노출하지 마세요. Railway 배포 시에는 `http://<backend-service>.railway.internal:8080` 등 사설 주소를 설정합니다. 실제 API 서비스명과 PORT가 일치해야 합니다.

```bash
npm run test
npm run typecheck
npm run build
```

## Railway 미리보기 배포

- 기존 Django `web`과 별도인 `frontend` 서비스로 배포
- Next.js는 **리포지터리 루트를 빌드 컨텍스트**로 사용
- `API_INTERNAL_URL=http://api.railway.internal:8080`으로 Spring API 연결
- `PORT=3000`; `/api/health/`가 Spring health까지 확인하며 정상일 때 HTTP 200, 연결 실패 시 503 반환
- Docker는 lockfile 기반 `npm ci` 빌드, Next.js standalone 결과물 및 비루트 사용자로 실행
- `VS_FRONTEND_ENABLED=false`, `MEMBER_FRONTEND_ENABLED=false`, `AI_FRONTEND_ENABLED=false` 유지. 준비 중인 메뉴와 관심 등록 버튼은 숨기며 BFF도 비활성 상태 유지
- Railway 미리보기 도메인을 사용. 기존 실서비스 도메인과 Django 배포는 유지
- `/admissions/`, 대학·학과 URL, 구조화 데이터, 로그인, VS 기능, 광고, sitemap 등 기존 서비스와 동등성 검증 후 운영 도메인 전환
- `robots.ts`, `layout.tsx`, HTTP `X-Robots-Tag`에 **noindex**가 있으므로 운영 전환 전 별도 변경으로 해제·검증

## Git 컨벤션

[Contextory Backend PR #10](https://github.com/kau-likelion-14th-hackathon/Contextory_BackEnd/pull/10) 형식: `feat:` 커밋 + 변경 사항 리스트, `[Feat]` PR 제목, PR 타입/반영 브랜치/변경 사항/테스트 결과/참고 사항 본문.
