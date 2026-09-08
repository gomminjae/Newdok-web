'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { userApi, type SocialProvider } from '@/entities/user';
import {
  createCodeChallenge,
  createRandomUrlSafeString,
  readJwtPayload,
  SOCIAL_SIGNUP_STORAGE_KEY,
} from '@/features/auth/social';
import { ApiError } from '@/shared/api/client';
import { enterAsGuest } from '@/shared/hooks';

const KAKAO_STATE_KEY = 'newdok.kakaoOAuthState';
const KAKAO_NONCE_KEY = 'newdok.kakaoOAuthNonce';
const KAKAO_CODE_VERIFIER_KEY = 'newdok.kakaoCodeVerifier';

type LoginProvider = 'kakao' | 'apple';

type SocialCredential = {
  provider: SocialProvider;
  idToken: string;
  authorizationCode?: string;
};

export function LoginForm() {
  const router = useRouter();
  const handledKakaoCallback = useRef(false);
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAppleScriptReady, setIsAppleScriptReady] = useState(false);

  const authenticate = useCallback(async (credential: SocialCredential) => {
    const response = await userApi.socialLogin({
      ...credential,
      platform: 'WEB',
    });

    if (response.isRegistered) {
      localStorage.setItem('user', JSON.stringify(response.user));
      sessionStorage.removeItem(SOCIAL_SIGNUP_STORAGE_KEY);
      window.dispatchEvent(new Event('auth-change'));
      router.replace('/home');
      return;
    }

    sessionStorage.setItem(SOCIAL_SIGNUP_STORAGE_KEY, JSON.stringify({
      signupToken: response.signupToken,
      suggestedNickname: response.profile?.nickname ?? '',
    }));
    router.replace('/signup');
  }, [router]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const hasKakaoResponse = query.has('code') || query.has('error');
    if (!hasKakaoResponse || handledKakaoCallback.current) return;
    handledKakaoCallback.current = true;

    const finishKakaoLogin = async () => {
      setLoadingProvider('kakao');
      setErrorMessage(null);

      const error = query.get('error');
      if (error) {
        const isCancelled = error === 'access_denied';
        clearKakaoSession();
        window.history.replaceState(null, '', '/login');
        if (!isCancelled) {
          setErrorMessage(query.get('error_description') ?? '카카오 인증에 실패했습니다.');
        }
        setLoadingProvider(null);
        return;
      }

      const code = query.get('code');
      const returnedState = query.get('state');
      const expectedState = sessionStorage.getItem(KAKAO_STATE_KEY);
      const nonce = sessionStorage.getItem(KAKAO_NONCE_KEY);
      const codeVerifier = sessionStorage.getItem(KAKAO_CODE_VERIFIER_KEY);
      const redirectUri = `${window.location.origin}/login`;

      window.history.replaceState(null, '', '/login');
      clearKakaoSession();

      if (!code || !returnedState || returnedState !== expectedState || !nonce || !codeVerifier) {
        setErrorMessage('카카오 로그인 요청을 확인할 수 없습니다. 다시 시도해주세요.');
        setLoadingProvider(null);
        return;
      }

      try {
        const tokenResponse = await fetch('/api/auth/kakao/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirectUri, nonce, codeVerifier }),
          signal: AbortSignal.timeout(20_000),
        });
        const tokenBody = await tokenResponse.json() as {
          idToken?: string;
          message?: string;
        };

        if (!tokenResponse.ok || !tokenBody.idToken) {
          throw new Error(tokenBody.message ?? '카카오 인증에 실패했습니다.');
        }

        await authenticate({ provider: 'KAKAO', idToken: tokenBody.idToken });
      } catch (loginError) {
        setErrorMessage(getLoginErrorMessage(loginError));
        setLoadingProvider(null);
      }
    };

    void finishKakaoLogin();
  }, [authenticate]);

  async function startKakaoLogin() {
    if (loadingProvider) return;
    const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    if (!clientId) {
      setErrorMessage('카카오 로그인을 위한 REST API 키가 필요합니다.');
      return;
    }

    setLoadingProvider('kakao');
    setErrorMessage(null);

    try {
      const state = createRandomUrlSafeString();
      const nonce = createRandomUrlSafeString();
      const codeVerifier = createRandomUrlSafeString(64);
      const codeChallenge = await createCodeChallenge(codeVerifier);
      const redirectUri = `${window.location.origin}/login`;

      sessionStorage.setItem(KAKAO_STATE_KEY, state);
      sessionStorage.setItem(KAKAO_NONCE_KEY, nonce);
      sessionStorage.setItem(KAKAO_CODE_VERIFIER_KEY, codeVerifier);

      const authorizationUrl = new URL('https://kauth.kakao.com/oauth/authorize');
      authorizationUrl.search = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: 'openid',
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      }).toString();

      window.location.assign(authorizationUrl);
    } catch (loginError) {
      setErrorMessage(getLoginErrorMessage(loginError));
      setLoadingProvider(null);
    }
  }

  async function startAppleLogin() {
    if (loadingProvider) return;
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      setErrorMessage('Apple 로그인을 위한 Services ID와 Return URL이 필요합니다.');
      return;
    }
    if (!isAppleScriptReady || !window.AppleID) {
      setErrorMessage('Apple 로그인 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setLoadingProvider('apple');
    setErrorMessage(null);

    try {
      const state = createRandomUrlSafeString();
      const nonce = createRandomUrlSafeString();
      window.AppleID.auth.init({
        clientId,
        scope: 'name email',
        redirectURI: redirectUri,
        state,
        nonce,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      const authorization = response.authorization;
      const payload = readJwtPayload(authorization.id_token);

      if (authorization.state !== state || payload?.nonce !== nonce) {
        throw new Error('Apple 인증 검증에 실패했습니다.');
      }

      await authenticate({
        provider: 'APPLE',
        idToken: authorization.id_token,
        authorizationCode: authorization.code,
      });
    } catch (loginError) {
      if (!isAppleCancellation(loginError)) {
        setErrorMessage(getLoginErrorMessage(loginError));
      }
      setLoadingProvider(null);
    }
  }

  const isLoading = loadingProvider !== null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <Script
        src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/ko_KR/appleid.auth.js"
        strategy="afterInteractive"
        onReady={() => setIsAppleScriptReady(true)}
        onError={() => setErrorMessage('Apple 로그인 모듈을 불러오지 못했습니다.')}
      />

      <div className="flex w-full max-w-sm flex-1 flex-col justify-center">
        <Image
          src="/images/landing/newdok-logo.svg"
          alt="Newdok"
          width={180}
          height={32}
          priority
          className="mx-auto mb-24 h-8 w-auto"
        />

        <div className="flex flex-col gap-3">
          <div className="relative">
            <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FB4F4F] px-3 py-1.5 text-xs font-bold text-white after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[5px] after:border-t-[6px] after:border-x-transparent after:border-t-[#FB4F4F]">
              3초만에 시작하기
            </div>
            <button
              type="button"
              onClick={() => void startKakaoLogin()}
              disabled={isLoading}
              className="relative flex h-14 w-full items-center justify-center rounded-xl bg-[#FEE500] text-base font-bold text-black/85 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KakaoIcon />
              {loadingProvider === 'kakao' ? '카카오 로그인 중...' : '카카오로 계속하기'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void startAppleLogin()}
            disabled={isLoading}
            className="relative flex h-14 w-full items-center justify-center rounded-xl bg-black text-base font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AppleIcon />
            {loadingProvider === 'apple' ? 'Apple 로그인 중...' : 'Apple로 계속하기'}
          </button>

          {errorMessage && (
            <p role="alert" className="pt-1 text-center text-sm text-error">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              enterAsGuest();
              router.push('/');
            }}
            disabled={isLoading}
            className="mt-2 text-sm font-medium text-caption-neutral underline-offset-2 hover:underline disabled:opacity-60"
          >
            비회원으로 이용하기
          </button>
        </div>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="absolute left-5 h-5 w-5 fill-current"
    >
      <path d="M12 3C6.48 3 2 6.49 2 10.8c0 2.78 1.86 5.22 4.66 6.6l-1.19 4.37a.38.38 0 0 0 .58.41l5.22-3.48c.24.02.48.03.73.03 5.52 0 10-3.49 10-7.93S17.52 3 12 3Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="absolute left-5 h-5 w-5 fill-current"
    >
      <path d="M17.05 12.54c-.02-2.44 2-3.63 2.09-3.69a4.5 4.5 0 0 0-3.54-1.92c-1.49-.16-2.93.9-3.69.9-.77 0-1.93-.88-3.19-.85a4.7 4.7 0 0 0-3.95 2.41c-1.72 2.98-.44 7.35 1.21 9.75.83 1.18 1.79 2.5 3.05 2.45 1.23-.05 1.69-.78 3.18-.78 1.47 0 1.91.78 3.19.75 1.32-.02 2.15-1.18 2.95-2.37a9.7 9.7 0 0 0 1.35-2.75 4.22 4.22 0 0 1-2.65-3.9ZM14.63 5.35A4.35 4.35 0 0 0 15.62 2a4.4 4.4 0 0 0-2.87 1.6 4.15 4.15 0 0 0-1.02 3.22 3.65 3.65 0 0 0 2.9-1.47Z" />
    </svg>
  );
}

function isAppleCancellation(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = 'error' in error ? String(error.error) : '';
  return code === 'popup_closed_by_user' || code === 'user_cancelled_authorize';
}

function clearKakaoSession() {
  sessionStorage.removeItem(KAKAO_STATE_KEY);
  sessionStorage.removeItem(KAKAO_NONCE_KEY);
  sessionStorage.removeItem(KAKAO_CODE_VERIFIER_KEY);
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.serverMessage ?? '로그인에 실패했습니다.';
  }
  if (error instanceof Error) return error.message;
  return '로그인 중 오류가 발생했습니다.';
}
