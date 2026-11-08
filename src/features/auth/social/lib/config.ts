import type { OAuthProviderConfig } from '@/shared/config/auth';

export function createOAuthConfig(
  provider: 'kakao' | 'apple', clientId: string, currentOrigin: string,
): OAuthProviderConfig {
  return validateOAuthConfig(provider, {
    clientId,
    redirectUri: new URL('/login', currentOrigin).href,
  }, currentOrigin);
}

export function validateOAuthConfig(
  provider: 'kakao' | 'apple', config: OAuthProviderConfig, currentOrigin: string,
): OAuthProviderConfig {
  const name = provider === 'kakao' ? '카카오' : 'Apple';
  if (!config.clientId) throw new Error(`${name} 로그인 설정이 누락됐습니다. 관리자에게 문의해주세요.`);

  let url: URL;
  try { url = new URL(config.redirectUri); } catch {
    throw new Error(`${name} 로그인 주소 설정이 올바르지 않습니다.`);
  }
  const localKakao = provider === 'kakao' && url.protocol === 'http:'
    && ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !localKakao) || url.origin !== currentOrigin
    || url.pathname !== '/login' || url.search || url.hash || url.username || url.password) {
    throw new Error(`${name} 로그인 주소가 현재 사이트와 다릅니다. 환경별 로그인 설정을 확인해주세요.`);
  }
  return { clientId: config.clientId, redirectUri: url.href };
}
