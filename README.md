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
- 운영 호스트 정책으로 robots/meta/HTTP 색인을 제어합니다. Railway 미리보기는 noindex, 실제 k-unirank.com 호스트는 공개 기본 URL에 index를 적용하며 검색 쿼리와 개인 페이지는 noindex를 유지합니다.

## Git 컨벤션

[Contextory Backend PR #10](https://github.com/kau-likelion-14th-hackathon/Contextory_BackEnd/pull/10) 형식: `feat:` 커밋 + 변경 사항 리스트, `[Feat]` PR 제목, PR 타입/반영 브랜치/변경 사항/테스트 결과/참고 사항 본문.


## 기존 운영 설정 이관

- 기존 GA4 `G-5WK14ZDHSP`, AdSense `ca-pub-3862816878614020`, 수동 광고 슬롯 `8829169633` 유지
- `ads.txt`, 기존 PNG 파비콘, Open Graph/Twitter/Organization/WebSite/대학 구조화 데이터와 canonical 이전
- Google 스크립트·광고 요청은 실제 운영 호스트에서만 실행. 미리보기에서 실제 광고 노출·GA 수집을 만들지 않음
- GA4 기본 page_view + 기존 확장 측정의 history 탐색을 사용. 수동 page_view를 중복 발행하지 않음. GA 관리자에서 향상된 측정의 브라우저 기록 이벤트 설정과 실시간 보고서를 확인해야 함
- 기존 data-ga 이벤트 이름과 검색·학과·대학·출처 클릭 계측 유지
- `/sitemap.xml`은 Spring의 읽기 전용 `/api/v1/seo/urls`에서 기존 sitemap URL과 마지막 수정일 조회. API 실패 시 빈 sitemap으로 응답하지 않고 실패 상태를 반환
- 운영 호스트의 `/vs/`, `/accounts/`, `/support/`, `/result/`, `/static/`, 기존 board API는 같은 프로젝트의 Django로 전달. 쿠키·CSRF·리다이렉트·기존 HTML 계측을 보존하며 Spring 쓰기 권한은 확대하지 않음
- 공개 도메인 이동은 별도 운영 작업. 이 변경은 기존 도메인을 이동하거나 기존 Django 배포를 교체하지 않음
- 자동 광고, 사이트 승인, 지급 계정, 향상된 측정·동의 설정 등 Google 계정 내부 설정은 기존 계정에 유지되며 배포 코드만으로 승인·수익·실시간 수집 성공을 증명할 수 없음
