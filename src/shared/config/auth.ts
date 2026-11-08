export interface OAuthProviderConfig {
  clientId: string;
  redirectUri: string;
}

export interface SocialLoginConfig {
  kakao: { clientId: string };
  apple: { clientId: string };
}

// Read on the server, then pass only public OAuth identifiers to LoginForm.
// Client secrets and native app keys belong to the backend, never these props.
export function getSocialLoginConfig(env: NodeJS.ProcessEnv = process.env): SocialLoginConfig {
  return {
    kakao: {
      clientId: env.NEXT_PUBLIC_KAKAO_REST_API_KEY?.trim() ?? '',
    },
    apple: {
      clientId: env.NEXT_PUBLIC_APPLE_CLIENT_ID?.trim() ?? '',
    },
  };
}
