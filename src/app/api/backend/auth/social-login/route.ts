import { SocialLoginRequestSchema, SocialLoginResponseSchema } from '@/entities/user/model/schema';
import { validateOAuthConfig } from '@/features/auth/social/lib/config';
import { getApiBaseUrl } from '@/shared/config/api';
import { getSocialLoginConfig } from '@/shared/config/auth';
import { getAppEnvironment } from '@/shared/config/environment';
import { getSiteUrl } from '@/shared/config/site';

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  let input;
  try {
    input = SocialLoginRequestSchema.safeParse(await request.json());
  } catch {
    return json({ message: '로그인 요청을 확인할 수 없습니다. 다시 시도해주세요.' }, 400);
  }
  if (!input.success) {
    return json({ message: '로그인 요청을 확인할 수 없습니다. 다시 시도해주세요.' }, 400);
  }

  const credential = input.data;
  const origin = getSiteUrl();
  if (request.headers.get('origin') !== origin) {
    return json({ message: '로그인을 시작한 사이트를 확인할 수 없습니다.' }, 403);
  }
  try {
    const provider = credential.provider === 'KAKAO' ? 'kakao' : 'apple';
    validateOAuthConfig(provider, {
      ...getSocialLoginConfig()[provider], redirectUri: credential.redirectUri,
    }, origin);
  } catch {
    return json({ message: '로그인 복귀 주소가 현재 사이트와 다릅니다. 다시 시도해주세요.' }, 400);
  }

  try {
    let body: Record<string, unknown> = credential;
    // Production still accepts the app's ID-token contract. Development exchanges
    // web authorization codes itself and also needs Apple's redirectUri.
    if (getAppEnvironment() === 'production') {
      if (credential.provider === 'KAKAO') {
        const clientId = getSocialLoginConfig().kakao.clientId;
        const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim();
        if (!clientId || !clientSecret) {
          return json({ message: '카카오 로그인 서버 설정이 누락됐습니다. 관리자에게 문의해주세요.' }, 503);
        }
        const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
          method: 'POST',
          cache: 'no-store',
          signal: AbortSignal.timeout(6_000),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: credential.authorizationCode,
            redirect_uri: credential.redirectUri,
          }),
        });
        if (!tokenResponse.ok) {
          return json({ message: '카카오 인증을 완료하지 못했습니다. 다시 로그인해주세요.' }, 401);
        }
        const token = await tokenResponse.json();
        if (typeof token.id_token !== 'string' || !token.id_token.trim()) {
          return json({ message: '카카오 ID 토큰을 받지 못했습니다. OpenID Connect 설정을 확인해주세요.' }, 502);
        }
        body = { provider: 'KAKAO', platform: 'WEB', idToken: token.id_token };
      } else {
        body = {
          provider: 'APPLE', platform: 'WEB', idToken: credential.idToken,
          ...(credential.authorizationCode ? { authorizationCode: credential.authorizationCode } : {}),
        };
      }
    }

    const response = await fetch(`${getApiBaseUrl()}/auth/social-login`, {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) {
      const message = Array.isArray(result.message)
        ? result.message.filter((item: unknown) => typeof item === 'string').join('\n')
        : typeof result.message === 'string' ? result.message : '소셜 로그인에 실패했습니다. 다시 시도해주세요.';
      return json({ message }, response.status);
    }
    return json(SocialLoginResponseSchema.parse(result));
  } catch {
    return json({ message: '로그인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.' }, 502);
  }
}
