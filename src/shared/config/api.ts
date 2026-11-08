import { getAppEnvironment, parseOrigin } from './environment';

// Matches the native app's Debug / Release xcconfig values.
export const API_BASE_URLS = {
  development: 'https://api-dev.newdok.store',
  production: 'https://api.newdok.store',
} as const;

export function getApiBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const environment = getAppEnvironment(env);
  const value = env.API_INTERNAL_URL?.trim();
  if (!value && (env.VERCEL_ENV || environment === 'production')) {
    throw new Error('Set API_INTERNAL_URL separately for Vercel Preview and Production.');
  }
  const url = parseOrigin(value || API_BASE_URLS.development, 'API_INTERNAL_URL');
  if (url.origin !== API_BASE_URLS[environment]) {
    throw new Error(`API_INTERNAL_URL does not match APP_ENV=${environment}.`);
  }
  return url.origin;
}
