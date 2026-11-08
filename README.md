# Newdok Web

Next.js 16 기반 뉴독 웹입니다.

## 로컬 실행

`.env.example`을 참고해 `.env.local`에 환경변수를 설정하고 실행합니다.

```bash
npm install
npm run dev
```

## 배포 흐름

| 브랜치 | Vercel 환경 | 용도 |
| --- | --- | --- |
| `develop` | Preview | [테스트 웹](https://newdok-web-git-develop-gommj0611-2968s-projects.vercel.app) |
| `main` | Production | 검증된 버전을 제공하는 기존 웹 (`https://newdok.vercel.app`) |

변경은 `develop`에서 먼저 확인하고, 배포할 변경만 `main`으로 병합합니다.
`main` push는 기존 공개 주소를 바로 갱신합니다.
Vercel Git 연동으로 배포하며 Vercel CLI는 사용하지 않습니다.

**현재 두 웹 모두 `https://api-dev.newdok.store` 개발 API를 사용합니다.**
웹 주소·배포를 나눠도 백엔드와 데이터는 분리되지 않습니다.
운영 API로 전환하는 작업은 별도로 진행해야 합니다.

## 테스트 웹 설정

Vercel은 `develop` push마다 Preview를 만들고, 브랜치 고정 주소는 해당 브랜치의 최신 배포를 가리킵니다.
로그인은 매번 달라지는 개별 배포 주소 대신 고정 브랜치 주소에서 검증합니다.

Preview 환경변수는 Production과 별도로 확인해야 합니다.

| 환경변수 | `develop` Preview 값 |
| --- | --- |
| `API_INTERNAL_URL` | `https://api-dev.newdok.store` |
| `NEXT_PUBLIC_SITE_URL` | `https://newdok-web-git-develop-gommj0611-2968s-projects.vercel.app` |
| `ALLOW_INDEXING` | `false` (코드에서도 Preview 검색 수집 차단) |
| `NEXT_PUBLIC_KAKAO_REST_API_KEY` | 개발용 Kakao REST API 키 |
| `NEXT_PUBLIC_APPLE_REDIRECT_URI` | `https://newdok-web-git-develop-gommj0611-2968s-projects.vercel.app/login` |

환경변수를 바꾸면 새 배포가 필요합니다.
Kakao Developers의 Redirect URI와 Apple Developer의 웹 도메인·Return URL에도 테스트 주소를 등록해야 합니다.
Apple Services ID는 개발 백엔드와 동일한 `com.newdok.dev.web`을 사용합니다.
Production의 로그인 주소를 Preview에 그대로 사용하지 않습니다.

테스트 배포는 GitHub에서 Preview 성공을 확인했습니다. 현재 고정 테스트 주소는 Vercel 로그인 보호에 응답합니다.
Preview 환경변수와 소셜 서비스의 테스트 콜백 등록 여부는 아직 검증하지 않았습니다.

## 검증

```bash
npm test
npm run lint
npm run build
npm run design:check -- https://테스트-주소
```

Vercel 참고: [배포 환경](https://vercel.com/docs/deployments/environments), [고정 브랜치 주소](https://vercel.com/docs/deployments/generated-urls), [환경변수 범위](https://vercel.com/docs/environment-variables).
