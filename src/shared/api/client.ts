const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public serverMessage?: string,
  ) {
    super(serverMessage ?? `API Error: ${status}`);
    this.name = 'ApiError';
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function setAccessToken(token: string) {
  localStorage.setItem('accessToken', token);
}

export function clearAccessToken() {
  localStorage.removeItem('accessToken');
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, body, headers, ...fetchOptions } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const token = getAccessToken();

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...fetchOptions,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
      }
    }

    let serverMessage: string | undefined;
    try {
      const errorBody = await response.json();
      serverMessage = errorBody.message ?? errorBody.error;
    } catch {
      /* empty */
    }

    throw new ApiError(response.status, serverMessage);
  }

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}
