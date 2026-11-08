import { AUTH_STORAGE_PREFIX } from '@/shared/config/session';

export {
  createRandomUrlSafeString,
  readJwtPayload,
} from './lib/oauth';

export const SOCIAL_SIGNUP_STORAGE_KEY = `${AUTH_STORAGE_PREFIX}.socialSignup`;
export { validateOAuthConfig } from './lib/config';
