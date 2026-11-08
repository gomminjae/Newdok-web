export type AppEnvironment = 'development' | 'production';

export function getAppEnvironment(env: NodeJS.ProcessEnv = process.env): AppEnvironment {
  const value = env.APP_ENV ?? (env.VERCEL_ENV === 'production' ? 'production' : 'development');
  if (value !== 'development' && value !== 'production') {
    throw new Error('APP_ENV must be development or production.');
  }
  if (env.VERCEL_ENV === 'preview' && value !== 'development') {
    throw new Error('Vercel Preview must use APP_ENV=development.');
  }
  if (env.VERCEL_ENV === 'production' && value !== 'production') {
    throw new Error('Vercel Production must use APP_ENV=production.');
  }
  return value;
}

export function parseOrigin(value: string, name: string): URL {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error(`${name} must be an absolute HTTP(S) origin.`); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password
    || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTP(S) origin without credentials, path, query or fragment.`);
  }
  return url;
}
