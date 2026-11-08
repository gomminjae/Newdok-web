import { getSiteUrl } from './site';

export interface OAuthProviderConfig {
  clientId: string;
  redirectUri: string;
}

export interface SocialLoginConfig {
  kakao: OAuthProviderConfig;
  apple: OAuthProviderConfig;
}

// Read on the server, then pass only public OAuth identifiers to LoginForm.
// Client secrets and native app keys belong to the backend, never these props.
export function getSocialLoginConfig(env: NodeJS.ProcessEnv = process.env): SocialLoginConfig {
  const defaultRedirectUri = `${getSiteUrl(env)}/login`;
  return {
    kakao: {
      clientId: env.NEXT_PUBLIC_KAKAO_REST_API_KEY?.trim() ?? '',
      redirectUri: env.NEXT_PUBLIC_KAKAO_REDIRECT_URI?.trim() || defaultRedirectUri,
    },
    apple: {
      clientId: env.NEXT_PUBLIC_APPLE_CLIENT_ID?.trim() ?? '',
      redirectUri: env.NEXT_PUBLIC_APPLE_REDIRECT_URI?.trim() || defaultRedirectUri,
    },
  };
}
