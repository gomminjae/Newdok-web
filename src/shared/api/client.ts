import type { ZodType, z } from 'zod';

const BROWSER_API_PATH = '/api/backend';
const SERVER_API_URL = process.env.API_INTERNAL_URL ?? 'http://3.38.79.19';

function buildUrl(endpoint: string): URL {
  if (typeof window === 'undefined') {
    return new URL(`${SERVER_API_URL}${endpoint}`);
  }
  return new URL(`${BROWSER_API_PATH}${endpoint}`, window.location.origin);
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  schema?: ZodType;
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

export function apiClient<S extends ZodType>(
  endpoint: string,
  options: RequestOptions & { schema: S },
): Promise<z.output<S>>;
export function apiClient<T = unknown>(
  endpoint: string,
  options?: RequestOptions,
): Promise<T>;
export async function apiClient(
  endpoint: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const { params, body, headers, schema, ...fetchOptions } = options;

  const url = buildUrl(endpoint);
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
  if (!text) return undefined;

  const json = JSON.parse(text);
  return schema ? schema.parse(json) : json;
}
