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

## 환경별 API·로그인 설정

| 설정 | Preview (`develop`) | Production (`main`) |
| --- | --- | --- |
| `APP_ENV` | `development` | `production` |
| `API_INTERNAL_URL` | `https://api-dev.newdok.store` | `https://api.newdok.store` |
| `NEXT_PUBLIC_SITE_URL` | 고정 테스트 주소 | 기존 공개 웹 주소 |
| `NEXT_PUBLIC_KAKAO_REST_API_KEY` | 개발 Kakao 앱의 웹 REST 키 | 운영 Kakao 앱의 웹 REST 키 |
| `NEXT_PUBLIC_KAKAO_REDIRECT_URI` | 테스트 주소 + `/login` | 공개 웹 주소 + `/login` |
| `NEXT_PUBLIC_APPLE_CLIENT_ID` | `com.newdok.dev.web` | `com.newdok.web` (기존 Production 설정) |
| `NEXT_PUBLIC_APPLE_REDIRECT_URI` | 테스트 주소 + `/login` | 공개 웹 주소 + `/login` |

Vercel Preview와 Production에 해당 환경의 API·로그인 값을 각각 설정합니다.
환경변수 변경은 새 배포부터 적용됩니다. 변경은 `develop`에서 검증한 뒤 `main`에 병합합니다.
운영 Kakao 앱(`1549268`)과 개발 앱(`1468488`)의 웹 REST 키는 서로 다릅니다.
실제 키는 Vercel 환경변수에만 설정하며 예시에 커밋하지 않습니다.

설정 예시:

- 로컬: [.env.example](.env.example) → `.env.local`
- Vercel Preview: [preview.env.example](config/env/preview.env.example)
- Vercel Production: [production.env.example](config/env/production.env.example)

Vercel은 **환경변수의 Preview / Production 범위**로 구분합니다.
Preview도 `next build`에서는 `NODE_ENV=production`이므로 `.env.development`에 넣어 구분하면 안 됩니다.
예시 파일을 추가하는 것만으로 Vercel 환경변수가 등록되지는 않습니다.

API 프록시와 서버 렌더링은 `getApiBaseUrl()`을 공통으로 사용합니다.
브라우저는 현재 웹 주소의 `/api/backend`에만 요청하고, Vercel이 해당 환경 API로 전달합니다.
배포 환경의 API 주소 누락, Preview/Production과 `APP_ENV` 불일치, 개발·운영 API 주소 혼용은 오류로 처리합니다.
개발·운영 API의 `/public/**` 이미지 모두 최적화할 수 있습니다.

로그인 페이지는 서버에서 해당 환경의 공개 키·콜백을 읽어 폼에 전달합니다.
Apple Services ID를 코드에 고정하지 않습니다. 클라이언트 시크릿은 백엔드에만 둡니다.
현재 웹과 다른 주소의 로그인 콜백은 인증 시작 전에 차단합니다.
Kakao 인가 코드 요청에 사용한 콜백을 세션에 저장하고, 코드 교환 요청에도 같은 값을 전달합니다.

## 테스트 웹 설정

Vercel은 `develop` push마다 Preview를 만들고, 브랜치 고정 주소는 해당 브랜치의 최신 배포를 가리킵니다.
로그인은 매번 달라지는 개별 배포 주소 대신 고정 브랜치 주소에서 검증합니다.

환경변수를 바꾸면 새 배포가 필요합니다.
Kakao Developers의 Redirect URI와 Apple Developer의 웹 도메인·Return URL에도 테스트 주소를 등록해야 합니다.
Production의 로그인 주소를 Preview에 그대로 사용하지 않습니다.
Apple 로그인은 localhost 대신 등록한 HTTPS 테스트 웹에서 확인합니다.
Preview는 `ALLOW_INDEXING` 값과 관계없이 검색 수집을 차단합니다.

`develop` 전용 Preview 변수 8개를 대시보드에 등록했고, 환경 분리 코드의 테스트 배포도 성공했습니다.
고정 테스트 주소는 Vercel 로그인 보호를 사용합니다.
소셜 서비스의 테스트 콜백 등록과 실제 로그인 완료는 별도로 확인해야 합니다.

## 검증

```bash
npm test
npm run lint
npm run build
npm run design:check -- https://테스트-주소
```

Vercel 참고: [배포 환경](https://vercel.com/docs/deployments/environments), [고정 브랜치 주소](https://vercel.com/docs/deployments/generated-urls), [환경변수 범위](https://vercel.com/docs/environment-variables).
