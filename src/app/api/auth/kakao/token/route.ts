import { NextRequest } from 'next/server';

type KakaoTokenResponse = {
  id_token?: string;
  error?: string;
  error_description?: string;
};

type KakaoIdTokenPayload = {
  nonce?: string;
};

function decodePayload(token: string): KakaoIdTokenPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  if (!clientId) {
    return Response.json(
      { message: '카카오 로그인이 아직 설정되지 않았습니다.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: '잘못된 요청입니다.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ message: '잘못된 요청입니다.' }, { status: 400 });
  }

  const { code, redirectUri, nonce, codeVerifier } = body as Record<string, unknown>;
  if (
    typeof code !== 'string' || !code ||
    typeof redirectUri !== 'string' || !redirectUri ||
    typeof nonce !== 'string' || !nonce ||
    typeof codeVerifier !== 'string' || !codeVerifier
  ) {
    return Response.json({ message: '카카오 인증 정보가 누락되었습니다.' }, { status: 400 });
  }

  let parsedRedirectUri: URL;
  try {
    parsedRedirectUri = new URL(redirectUri);
  } catch {
    return Response.json({ message: '잘못된 리다이렉트 주소입니다.' }, { status: 400 });
  }

  if (parsedRedirectUri.origin !== request.nextUrl.origin) {
    return Response.json({ message: '허용되지 않은 리다이렉트 주소입니다.' }, { status: 400 });
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });
  if (process.env.KAKAO_CLIENT_SECRET) {
    params.set('client_secret', process.env.KAKAO_CLIENT_SECRET);
  }

  const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      Accept: 'application/json',
    },
    body: params,
    cache: 'no-store',
  });

  const token = await tokenResponse.json() as KakaoTokenResponse;
  if (!tokenResponse.ok) {
    return Response.json(
      { message: token.error_description ?? '카카오 인증에 실패했습니다.' },
      { status: tokenResponse.status },
    );
  }

  if (!token.id_token) {
    return Response.json(
      { message: '카카오 OpenID Connect 설정을 확인해주세요.' },
      { status: 502 },
    );
  }

  const payload = decodePayload(token.id_token);
  if (!payload || payload.nonce !== nonce) {
    return Response.json({ message: '카카오 인증 검증에 실패했습니다.' }, { status: 400 });
  }

  return Response.json(
    { idToken: token.id_token },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
