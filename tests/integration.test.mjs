import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { QueryClient } from '@tanstack/react-query';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeRequire = createRequire(import.meta.url);
const plain = (value) => JSON.parse(JSON.stringify(value));
const DEV_TOKEN_KEY = 'newdok.development.accessToken';

// Execute the actual TypeScript API boundary with a deterministic transport.
function harness(respond = () => ({ body: {} }), overrides = {}, env = {}) {
  const requests = [];
  const authTokenKey = `newdok.${env.NEXT_PUBLIC_APP_ENV ?? 'development'}.accessToken`;
  const storage = new Map([[authTokenKey, 'test-token']]);
  const session = new Map();
  const events = [];
  const cache = new Map();
  const context = vm.createContext({
    URL, URLSearchParams, AbortSignal, Event, crypto: globalThis.crypto, btoa, atob,
    process: { env },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    sessionStorage: {
      getItem: (key) => session.get(key) ?? null,
      setItem: (key, value) => session.set(key, value),
      removeItem: (key) => session.delete(key),
    },
    window: { location: { origin: 'https://newdok.test' }, innerHeight: 640, dispatchEvent: (event) => events.push(event.type), scrollTo() {} },
    fetch: async (url, options) => {
      const request = { url: new URL(url), ...options };
      requests.push(request);
      const result = await respond(request);
      return new Response(result.body === undefined ? null : JSON.stringify(result.body), { status: result.status ?? 200 });
    },
  });
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const source = readFileSync(path.join(root, filename), 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    const localRequire = (name) => {
      if (name in overrides) return overrides[name];
      if (!name.startsWith('.') && !name.startsWith('@/')) return runtimeRequire(name);
      const base = name.startsWith('@/') ? `src/${name.slice(2)}` : path.join(path.dirname(filename), name);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find((candidate) => existsSync(path.join(root, candidate)) && /\.(tsx?|json)$/.test(candidate));
      if (!resolved) throw new Error(`Cannot resolve ${name} from ${filename}`);
      if (resolved.endsWith('.json')) return JSON.parse(readFileSync(path.join(root, resolved), 'utf8'));
      return load(resolved);
    };
    vm.runInContext(`(function(require, module, exports) {${js}\n})`, context, { filename })(localRequire, loaded, loaded.exports);
    return loaded.exports;
  }
  return { load, requests, storage, session, events, context, authTokenKey };
}

const nestedArticle = { id: 42, title: '오늘의 뉴스', status: 'Unread', publishDate: 7, newsletter: { brandName: '뉴독', imageUrl: null } };

test('Vercel previews block indexing even when production indexing is enabled', () => {
  const indexingEnv = { NODE_ENV: 'production', ALLOW_INDEXING: 'true', NEXT_PUBLIC_SITE_URL: 'https://newdok.test' };
  const preview = harness(undefined, {}, { ...indexingEnv, VERCEL_ENV: 'preview' }).load('src/app/robots.ts').default();
  assert.deepEqual(plain(preview), { rules: [{ userAgent: '*', disallow: ['/'] }] });
  const production = harness(undefined, {}, { ...indexingEnv, VERCEL_ENV: 'production' }).load('src/app/robots.ts').default();
  assert.equal(production.rules[0].allow.includes('/newsletters'), true);
  assert.equal(production.rules[0].disallow.includes('/subscribe'), true);
});

test('web routes serve search and explore on their named pages and preserve the public directory', async () => {
  const app = harness(undefined, {
    '@/widgets/newsletter-search/NewsletterSearch': { NewsletterSearch: 'SearchView' },
    '@/widgets/newsletter-explorer/NewsletterExplorer': { NewsletterExplorer: 'ExplorerView' },
    '@/entities/newsletter/api/public-newsletter.server': { getPublicNewsletters: async () => [] },
  });
  assert.equal(app.load('src/app/(main)/search/page.tsx').default().type, 'SearchView');
  assert.equal(app.load('src/app/(main)/explore/page.tsx').default().type, 'ExplorerView');
  assert.equal(existsSync(path.join(root, 'src/app/(main)/subscribe/page.tsx')), true);
  assert.equal(existsSync(path.join(root, 'src/app/(main)/search/newsletters/page.tsx')), false);
  const directory = app.load('src/app/newsletters/page.tsx');
  assert.equal(directory.metadata.alternates.canonical, '/newsletters');
  assert.equal((await directory.default()).type, 'ExplorerView');
});

test('old keyword and filter links redirect to the appropriate new route without redirecting searches', async () => {
  const config = harness(undefined, {}, { APP_ENV: 'development', API_INTERNAL_URL: 'https://api-dev.newdok.store' }).load('next.config.ts').default;
  const redirects = await config.redirects();
  const match = (url) => {
    const { pathname, searchParams } = new URL(url, 'https://newdok.test');
    return redirects.find((rule) => rule.source === pathname
      && (rule.has ?? []).every(({ key }) => searchParams.has(key))
      && (rule.missing ?? []).every(({ key }) => !searchParams.has(key)));
  };
  assert.equal(match('/search/newsletters?q=%EB%89%B4%EB%8B%89').destination, '/search');
  for (const query of ['tab=recommend', 'industry=2', 'day=3', 'orderOpt=%EC%B5%9C%EC%8B%A0%EC%88%9C']) {
    assert.equal(match(`/search?${query}`).destination, '/explore');
  }
  for (const url of ['/search', '/search?q=%EB%89%B4%EB%8B%89', '/search?q=hello&tab=all', '/explore?tab=all', '/newsletters']) {
    assert.equal(match(url), undefined, url);
  }
  assert.ok(redirects.every(({ permanent }) => permanent === false));
});

test('only the matching navigation item is active for search, explore, subscribe, and the directory', () => {
  for (const [pathname, selected] of [['/search', null], ['/explore', '/explore'], ['/subscribe', '/subscribe'], ['/newsletters', '/explore']]) {
    const app = harness(undefined, {
      'next/link': 'a',
      'next/navigation': { usePathname: () => pathname },
      '@/shared/ui': { Icon: 'Icon' },
    });
    const links = nodes(app.load('src/widgets/sidebar/Sidebar.tsx').Sidebar()).filter((node) => node.type === 'a');
    assert.deepEqual(links.filter((node) => node.props['aria-current'] === 'page').map((node) => node.props.href), selected ? [selected, selected] : [], pathname);
  }
});

test('Preview and Production use their own API for both rewrites and server requests', async () => {
  for (const [vercelEnv, appEnv, origin] of [
    ['preview', 'development', 'https://api-dev.newdok.store'],
    ['production', 'production', 'https://api.newdok.store'],
  ]) {
    const app = harness(undefined, {}, { VERCEL_ENV: vercelEnv, APP_ENV: appEnv, API_INTERNAL_URL: `${origin}/` });
    const config = app.load('next.config.ts').default;
    assert.equal(config.env.NEXT_PUBLIC_APP_ENV, appEnv);
    assert.equal((await config.rewrites())[0].destination, `${origin}/:path*`);
    app.context.window = undefined;
    await app.load('src/shared/api/client.ts').apiClient('/newsletters/non-member', { authenticated: false });
    assert.equal(app.requests[0].url.origin, origin);
    assert.equal(app.requests[0].url.pathname, '/newsletters/non-member');
  }
});

test('deployment API configuration refuses missing values and mixed environments', () => {
  for (const env of [
    { VERCEL_ENV: 'preview' },
    { VERCEL_ENV: 'production' },
    { APP_ENV: 'production' },
    { VERCEL_ENV: 'preview', APP_ENV: 'production', API_INTERNAL_URL: 'https://api.newdok.store' },
    { VERCEL_ENV: 'production', APP_ENV: 'development', API_INTERNAL_URL: 'https://api-dev.newdok.store' },
    { VERCEL_ENV: 'production', API_INTERNAL_URL: 'https://api-dev.newdok.store' },
    { VERCEL_ENV: 'preview', API_INTERNAL_URL: 'https://api.newdok.store' },
    { APP_ENV: 'staging' },
    ...['https://api-dev.newdok.store/private', 'https://api-dev.newdok.store?key=value', 'https://user:pass@api-dev.newdok.store', 'http://api-dev.newdok.store'].map((API_INTERNAL_URL) => ({ API_INTERNAL_URL })),
  ]) {
    assert.throws(() => harness(undefined, {}, env).load('next.config.ts'));
  }
});

test('browser API requests stay on the current web origin instead of exposing the backend', async () => {
  const app = harness(undefined, {}, { APP_ENV: 'production', API_INTERNAL_URL: 'https://api.newdok.store' });
  await app.load('src/shared/api/client.ts').apiClient('/auth/social-login', { authenticated: false });
  assert.equal(app.requests[0].url.href, 'https://newdok.test/api/backend/auth/social-login');
});

test('production never sends legacy or development tokens and logout preserves the other environment', async () => {
  const app = harness(undefined, {}, { NEXT_PUBLIC_APP_ENV: 'production' });
  app.storage.delete(app.authTokenKey);
  app.storage.set('accessToken', 'legacy-development-token');
  app.storage.set(DEV_TOKEN_KEY, 'development-token');
  app.storage.set('user', '{"nickname":"개발 사용자"}');
  const { apiClient, setAccessToken, clearAccessToken } = app.load('src/shared/api/client.ts');
  await apiClient('/users/profile');
  assert.equal(app.requests[0].headers.Authorization, undefined);
  assert.equal(app.storage.has('accessToken'), false);
  assert.equal(app.storage.has('user'), false);
  setAccessToken('production-token');
  await apiClient('/users/profile');
  assert.equal(app.requests[1].headers.Authorization, 'Bearer production-token');
  clearAccessToken();
  assert.equal(app.storage.has(app.authTokenKey), false);
  assert.equal(app.storage.get(DEV_TOKEN_KEY), 'development-token');
});

test('signup and OAuth state use environment-specific storage keys', () => {
  const development = harness(undefined, {}, { NEXT_PUBLIC_APP_ENV: 'development' });
  const production = harness(undefined, {}, { NEXT_PUBLIC_APP_ENV: 'production' });
  assert.notEqual(development.load('src/features/auth/social/index.ts').SOCIAL_SIGNUP_STORAGE_KEY,
    production.load('src/features/auth/social/index.ts').SOCIAL_SIGNUP_STORAGE_KEY);
});

test('OAuth config uses each environment’s web keys and Services ID without stale callback values', () => {
  for (const name of ['development', 'production']) {
    const site = `https://${name}.newdok.test`;
    const env = {
      NEXT_PUBLIC_SITE_URL: site,
      NEXT_PUBLIC_KAKAO_REST_API_KEY: `${name}-rest-key`,
      NEXT_PUBLIC_KAKAO_REDIRECT_URI: 'https://old-preview.test/login',
      NEXT_PUBLIC_APPLE_CLIENT_ID: `${name}.web`,
      NEXT_PUBLIC_APPLE_REDIRECT_URI: 'https://old-preview.test/login',
    };
    const config = harness(undefined, {}, env).load('src/shared/config/auth.ts').getSocialLoginConfig();
    assert.deepEqual(plain(config), {
      kakao: { clientId: `${name}-rest-key` },
      apple: { clientId: `${name}.web` },
    });
  }
  const { getSocialLoginConfig } = harness().load('src/shared/config/auth.ts');
  assert.equal(getSocialLoginConfig().apple.clientId, '');
});

test('OAuth rejects another environment’s callback and Apple HTTP before starting authentication', () => {
  const { validateOAuthConfig } = harness().load('src/features/auth/social/lib/config.ts');
  const config = { clientId: 'web-client', redirectUri: 'https://dev.newdok.test/login' };
  for (const provider of ['kakao', 'apple']) {
    assert.equal(validateOAuthConfig(provider, config, 'https://dev.newdok.test').redirectUri, config.redirectUri);
    assert.throws(() => validateOAuthConfig(provider, config, 'https://newdok.test'));
    assert.throws(() => validateOAuthConfig(provider, { ...config, clientId: '' }, 'https://dev.newdok.test'));
  }
  const local = { ...config, redirectUri: 'http://localhost:3000/login' };
  assert.doesNotThrow(() => validateOAuthConfig('kakao', local, 'http://localhost:3000'));
  assert.throws(() => validateOAuthConfig('apple', local, 'http://localhost:3000'));
});

test('preview metadata falls back to its stable branch URL, never the production URL', () => {
  const app = harness(undefined, {}, { VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'develop.newdok.test' });
  assert.equal(app.load('src/shared/config/site.ts').SITE_URL, 'https://develop.newdok.test');
});

function loginHarness(config) {
  const slots = [];
  let cursor = 0;
  const effects = [];
  const credentials = [];
  const redirects = [];
  const routes = [];
  const appleInitializations = [];
  const app = harness(undefined, {
    react: {
      useCallback: (fn) => fn, useRef: (value) => ({ current: value }), useEffect: (fn) => effects.push(fn),
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], (value) => { slots[index] = value; }];
      },
    },
    'next/script': 'script',
    'next/navigation': { useRouter: () => ({ replace: (path) => routes.push(path), push() {} }) },
    '@/entities/user': { userApi: { socialLogin: async (credential) => {
      credentials.push(plain(credential));
      return { isRegistered: true, user: { nickname: '뉴독' } };
    } } },
    '@/shared/hooks': { enterAsGuest() {} },
    '@/shared/ui': { AppImage: 'img', Button: 'button', ButtonLink: 'a' },
  });
  app.context.window.location.search = '';
  app.context.window.location.assign = (url) => redirects.push(new URL(url));
  app.context.window.history = { replaceState() {} };
  app.context.window.AppleID = { auth: {
    init: (value) => appleInitializations.push(plain(value)),
    signIn: async () => {
      const { state, nonce } = appleInitializations.at(-1);
      return { authorization: { code: 'apple-code', state, id_token: `header.${btoa(JSON.stringify({ nonce }))}.signature` } };
    },
  } };
  const { LoginForm } = app.load('src/app/(auth)/login/LoginForm.tsx');
  return { ...app, effects, credentials, redirects, routes, appleInitializations, render() {
    cursor = 0;
    effects.length = 0;
    return LoginForm({ config });
  } };
}

test('Kakao sends the environment REST key and reuses the requested callback for backend code exchange', async () => {
  const config = {
    kakao: { clientId: 'development-rest-key', redirectUri: 'https://newdok.test/login' },
    apple: { clientId: '', redirectUri: 'https://newdok.test/login' },
  };
  const app = loginHarness(config);
  control(app.render(), '카카오로 계속하기').props.onClick();
  const authorize = app.redirects[0];
  assert.equal(authorize.origin, 'https://kauth.kakao.com');
  assert.equal(authorize.searchParams.get('client_id'), 'development-rest-key');
  assert.equal(authorize.searchParams.get('redirect_uri'), config.kakao.redirectUri);
  app.context.window.location.search = `?code=kakao-code&state=${authorize.searchParams.get('state')}`;
  app.render();
  app.effects[0]();
  await new Promise(setImmediate);
  assert.deepEqual(app.credentials, [{ provider: 'KAKAO', platform: 'WEB', authorizationCode: 'kakao-code', redirectUri: config.kakao.redirectUri }]);
  assert.deepEqual(app.routes, ['/home']);
  assert.equal(app.session.has('newdok.development.kakaoOAuthRedirectUri'), false);
});

test('Apple SDK and backend receive the matching environment Services ID and callback', async () => {
  for (const clientId of ['com.newdok.dev.web', 'configured.production.web']) {
    const app = loginHarness({
      kakao: { clientId: '', redirectUri: 'https://newdok.test/login' },
      apple: { clientId, redirectUri: 'https://newdok.test/login' },
    });
    nodes(app.render()).find((node) => node.type === 'script').props.onReady();
    control(app.render(), 'Apple로 계속하기').props.onClick();
    await new Promise(setImmediate);
    assert.equal(app.appleInitializations[0].clientId, clientId);
    assert.equal(app.appleInitializations[0].redirectURI, 'https://newdok.test/login');
    assert.equal(app.credentials[0].redirectUri, 'https://newdok.test/login');
    assert.equal(app.credentials[0].authorizationCode, 'apple-code');
    assert.deepEqual(app.routes, ['/home']);
  }
});

test('renaming the preview alias uses the actual origin for both providers despite stale redirect props', async () => {
  const wrongCallback = { clientId: 'configured-key', redirectUri: 'https://other-environment.test/login' };
  const app = loginHarness({ kakao: wrongCallback, apple: wrongCallback });
  app.context.window.location.origin = 'https://newdok-dev.vercel.app';
  nodes(app.render()).find((node) => node.type === 'script').props.onReady();
  control(app.render(), '카카오로 계속하기').props.onClick();
  assert.equal(app.redirects[0].searchParams.get('redirect_uri'), 'https://newdok-dev.vercel.app/login');
  app.context.window.location.search = `?code=kakao-code&state=${app.redirects[0].searchParams.get('state')}`;
  app.render();
  app.effects[0]();
  await new Promise(setImmediate);
  assert.equal(app.credentials[0].redirectUri, 'https://newdok-dev.vercel.app/login');
  const appleApp = loginHarness({ kakao: wrongCallback, apple: wrongCallback });
  appleApp.context.window.location.origin = 'https://newdok-dev.vercel.app';
  nodes(appleApp.render()).find((node) => node.type === 'script').props.onReady();
  control(appleApp.render(), 'Apple로 계속하기').props.onClick();
  await new Promise(setImmediate);
  assert.equal(appleApp.appleInitializations[0].redirectURI, 'https://newdok-dev.vercel.app/login');
  assert.equal(appleApp.credentials[0].redirectUri, 'https://newdok-dev.vercel.app/login');
});

test('missing provider keys stop login before any OAuth navigation or SDK call', () => {
  const app = loginHarness({ kakao: { clientId: '' }, apple: { clientId: '' } });
  nodes(app.render()).find((node) => node.type === 'script').props.onReady();
  for (const name of ['카카오로 계속하기', 'Apple로 계속하기']) {
    control(app.render(), name).props.onClick();
    assert.match(text(app.render()), /로그인 설정이 누락/);
  }
  assert.equal(app.redirects.length, 0);
  assert.equal(app.appleInitializations.length, 0);
});

test('development and production send the same new web login contract without converting credentials', async () => {
  for (const environment of ['development', 'production']) {
    const origin = environment === 'production' ? 'https://newdok.vercel.app' : 'https://newdok-dev.vercel.app';
    for (const credential of [
      { provider: 'KAKAO', platform: 'WEB', authorizationCode: 'kakao-code' },
      { provider: 'APPLE', platform: 'WEB', idToken: 'apple-id-token', authorizationCode: 'apple-code' },
    ]) {
      const app = harness(() => ({ body: { isRegistered: false, signupToken: 'signup-token' } }), {}, {
        NEXT_PUBLIC_APP_ENV: environment,
      });
      app.context.window.location.origin = origin;
      const input = { ...credential, redirectUri: `${origin}/login` };
      await app.load('src/entities/user/api/user.api.ts').userApi.socialLogin(input);
      assert.equal(app.requests.length, 1);
      assert.equal(app.requests[0].url.href, `${origin}/api/backend/auth/social-login`);
      assert.deepEqual(JSON.parse(app.requests[0].body), input);
      assert.equal(app.requests[0].headers.Authorization, undefined);
    }
  }
});

test('nonempty day/today article responses normalize to the home card contract', async () => {
  const app = harness(() => ({ body: [nestedArticle] }));
  const { articleApi } = app.load('src/entities/article/api/article.api.ts');
  const day = await articleApi.fetchDayArticle(2026, 11, 7);
  const today = await articleApi.fetchTodayArticle();
  const expected = [{ id: 42, articleTitle: '오늘의 뉴스', status: 'Unread', publishDate: 7, brandName: '뉴독', imageUrl: null }];
  assert.deepEqual(plain(day), expected);
  assert.deepEqual(plain(today), expected);
  assert.equal(app.requests[0].url.searchParams.get('publicationMonth'), '11');
});

test('article boundary accepts legacy IDs and absent publication dates without hiding malformed responses', () => {
  const { ArticleListSchema } = harness().load('src/entities/article/model/schema.ts');
  const legacy = { articleId: 7, articleTitle: '지난 소식', brandName: '뉴스', imageUrl: null, status: 'Read' };
  const parsed = ArticleListSchema.parse([legacy, { ...nestedArticle, newsletter: null }]);
  assert.equal(parsed[0].id, 7);
  assert.equal(parsed[0].publishDate, null);
  assert.equal(parsed[1].brandName, '');
  assert.equal(ArticleListSchema.safeParse([{ id: 1 }]).success, false);
  assert.equal(ArticleListSchema.safeParse({ data: [] }).success, false);
});

test('newsletter boundaries accept nullable publication cycles', () => {
  const app = harness();
  const { BrandDetailSchema, NewsletterDetailSchema } = app.load('src/entities/newsletter/model/schema.ts');
  const common = { brandName: '뉴스', imageUrl: null, publicationCycle: null, subscribeUrl: 'https://example.com', interests: [] };
  assert.equal(BrandDetailSchema.parse({ ...common, brandId: 1, detailDescription: null, brandArticleList: [], subscribeCheck: false }).publicationCycle, '');
  assert.equal(NewsletterDetailSchema.parse({ ...common, id: 1, firstDescription: '', secondDescription: '', createdAt: '', updatedAt: '', industries: [] }).publicationCycle, '');
});

test('profile setup repeats interest query parameters and nickname changes accept social accounts', async () => {
  const app = harness(({ url }) => ({ body: url.pathname.endsWith('/nickname') ? { id: 5, loginId: null, nickname: '뉴독5' } : { data: [] } }));
  const { userApi } = app.load('src/entities/user/api/user.api.ts');
  await userApi.preInvestigate('10', ['1', '2', '3']);
  const nickname = await userApi.updateNickname({ nickname: '뉴독5' });
  assert.deepEqual(app.requests[0].url.searchParams.getAll('interest'), ['1', '2', '3']);
  assert.equal(app.requests[0].url.searchParams.get('industry'), '10');
  assert.equal(app.requests[1].method, 'PATCH');
  assert.deepEqual(JSON.parse(app.requests[1].body), { nickname: '뉴독5' });
  assert.equal(nickname.loginId, null);
});

test('bookmark sorting and multiple industry/day filters reach the backend unchanged', async () => {
  const app = harness(({ url }) => ({ body: url.pathname.endsWith('/bookmark') ? { data: { totalAmount: 0, bookmarkForMonth: [] } } : [] }));
  const { articleApi } = app.load('src/entities/article/api/article.api.ts');
  const { newsletterApi } = app.load('src/entities/newsletter/api/newsletter.api.ts');
  for (const sort of ['bookmark_date', 'article_date_desc', 'article_date_asc']) await articleApi.fetchBookmarkArticles(2, sort);
  assert.deepEqual(app.requests.map((request) => request.url.searchParams.get('sortBy')), ['bookmark_date', 'article_date_desc', 'article_date_asc']);
  await newsletterApi.fetchGuestAllNewsletterBrands({ industry: ['10', '11'], day: ['1', '2'] });
  const request = app.requests.at(-1);
  assert.deepEqual(request.url.searchParams.getAll('industry'), ['10', '11']);
  assert.deepEqual(request.url.searchParams.getAll('day'), ['1', '2']);
  assert.equal(request.headers.Authorization, undefined);
});

test('subscription and withdrawal actions use the app backend contract', async () => {
  const app = harness(() => ({ body: undefined, status: 204 }));
  const { newsletterApi } = app.load('src/entities/newsletter/api/newsletter.api.ts');
  const { userApi } = app.load('src/entities/user/api/user.api.ts');
  await newsletterApi.pauseSubscription({ newsletterId: 321 });
  await newsletterApi.resumeSubscription({ newsletterId: 321 });
  await userApi.withdraw();
  assert.deepEqual(app.requests.map((request) => [request.method, request.url.pathname, request.body]), [
    ['PATCH', '/api/backend/newsletters/subscription/pause', '{"newsletterId":321}'],
    ['PATCH', '/api/backend/newsletters/subscription/resume', '{"newsletterId":321}'],
    ['PATCH', '/api/backend/users/withdraw', undefined],
  ]);
});

test('failed mutations preserve the session and expose the server error', async () => {
  const app = harness(() => ({ status: 500, body: { message: '일시적인 오류' } }));
  const { userApi } = app.load('src/entities/user/api/user.api.ts');
  const { getErrorMessage } = app.load('src/shared/api/client.ts');
  await assert.rejects(userApi.withdraw(), (error) => getErrorMessage(error) === '일시적인 오류');
  assert.equal(app.storage.get(DEV_TOKEN_KEY), 'test-token');
  assert.deepEqual(app.events, []);
});

test('a 401 clears only the token which made the failed request', async () => {
  const app = harness(() => ({ status: 401, body: { message: '만료' } }));
  const { userApi } = app.load('src/entities/user/api/user.api.ts');
  await assert.rejects(userApi.getProfile());
  assert.equal(app.storage.has(DEV_TOKEN_KEY), false);
  assert.deepEqual(app.events, ['auth-change']);
  let rotated;
  rotated = harness(() => { rotated.storage.set(DEV_TOKEN_KEY, 'new-session'); return { status: 401, body: {} }; });
  await assert.rejects(rotated.load('src/entities/user/api/user.api.ts').userApi.getProfile());
  assert.equal(rotated.storage.get(DEV_TOKEN_KEY), 'new-session');
  assert.deepEqual(rotated.events, []);
});

test('corrupt or overlapping local highlights cannot crash the article reader', () => {
  const { parseHighlights } = harness().load('src/shared/lib/reader-highlights.ts');
  assert.deepEqual(plain(parseHighlights('invalid')), []);
  const first = { id: '1', text: 'abc', start: 0, end: 3 };
  const overlap = { id: '2', text: 'bc', start: 1, end: 3 };
  assert.deepEqual(plain(parseHighlights(JSON.stringify([overlap, first, { ...first, start: -1 }, {}]))), [first]);
});

test('touch selection changes are coalesced and pending updates are cancelled when the reader closes', () => {
  const { observeSelectionChanges } = harness().load('src/shared/lib/selection-observer.ts');
  const document = new EventTarget();
  const frames = new Map();
  let nextFrame = 0;
  document.defaultView = {
    requestAnimationFrame: (callback) => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  let updates = 0;
  const stop = observeSelectionChanges(document, () => { updates++; });
  document.dispatchEvent(new Event('selectionchange'));
  document.dispatchEvent(new Event('selectionchange'));
  document.dispatchEvent(new Event('pointerup'));
  assert.equal(frames.size, 1);
  const [id, publish] = [...frames][0];
  frames.delete(id);
  publish();
  assert.equal(updates, 1);
  document.dispatchEvent(new Event('selectionchange'));
  stop();
  assert.equal(frames.size, 0);
  document.dispatchEvent(new Event('selectionchange'));
  document.dispatchEvent(new Event('keyup'));
  assert.equal(frames.size, 0);
  assert.equal(updates, 1);
});

test('completed newsletter searches announce real counts without retaining pending UI', () => {
  for (const pending of [true, false]) {
    const app = harness(undefined, {
      'next/link': (props) => { const attributes = { ...props }; delete attributes.prefetch; return createElement('a', attributes); },
      'next/navigation': {
        useSearchParams: () => new URLSearchParams('q=NEWNEEK'),
        useRouter: () => ({ back() {}, replace() {} }),
      },
      '@tanstack/react-query': {
        queryOptions: (options) => options,
        useQueryClient: () => ({}),
        useQuery: () => ({ isPending: pending, isFetching: pending, isError: false,
          data: pending ? undefined : [{ id: 321, brandName: 'NEWNEEK', firstDescription: '세상 돌아가는 소식', imageUrl: null }] }),
      },
      '@/widgets/landing/NewsletterImage': { NewsletterImage: () => null },
    });
    const html = renderToStaticMarkup(createElement(app.load('src/widgets/newsletter-search/NewsletterSearch.tsx').NewsletterSearch));
    if (pending) {
      assert.match(html, /aria-busy="true"/);
      assert.match(html, /nd-loading-spinner/);
      assert.doesNotMatch(html, /NEWNEEK 검색 결과/);
    } else {
      assert.match(html, /NEWNEEK 검색 결과 1개/);
      assert.doesNotMatch(html, /nd-loading-spinner|aria-busy="true"|\{keyword\}|\{results/);
      assert.match(html, /href="\/newsletters\/321"/);
    }
  }
});

function componentHarness(filename, exported, { loggedIn = true, hydrated = true, profile = { id: 5, nickname: '뉴독5', industryId: 10, interests: [], subscribeEmail: 'reader@example.com' }, options, queryError = false, queryStates = {}, moduleOverrides = {} } = {}) {
  const slots = [];
  let cursor = 0;
  const queries = [];
  const invalidations = [];
  const saved = [];
  const effects = [];
  const ui = Object.fromEntries(['AppImage', 'Button', 'ButtonLink', 'Chip', 'Dialog', 'EmptyState', 'GuestNotice', 'Icon', 'Toast', 'SegmentPicker'].map((name) => [name, name]));
  ui.Checkbox = 'input';
  ui.Dropdown = 'Dropdown';
  ui.LoadingState = 'LoadingState';
  ui.CardLink = 'CardLink';
  ui.MediaFrame = 'MediaFrame';
  const app = harness(({ url }) => ({ body: url.pathname.endsWith('/preInvestigate') ? { data: [] } : {} }), {
    react: {
      memo: (fn) => fn, useCallback: (fn) => fn, useMemo: (fn) => fn(), useEffect: (effect) => { effects.push(effect); }, useId: () => 'test-id',
      useRef(value) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = { current: value };
        return slots[index];
      },
      useState(initial) {
        const index = cursor++;
        if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
        return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
      },
    },
    '@tanstack/react-query': {
      queryOptions: (value) => value,
      useQuery(query) {
        queries.push(query);
        const key = query.queryKey;
        const data = key[0] === 'user' ? profile : key.includes('options') ? options : key.includes('list') && key[0] === 'bookmark' ? { totalAmount: 0, bookmarkForMonth: [] } : [];
        return { data, isPending: false, isLoading: false, isError: queryError, refetch() {}, ...(queryStates[key.at(-1)] ?? {}) };
      },
      useQueryClient: () => ({ invalidateQueries: async ({ queryKey }) => { invalidations.push(plain(queryKey)); } }),
    },
    '@/shared/hooks': { useAuth: () => ({ isLoggedIn: loggedIn, isHydrated: hydrated, logout() {} }), useToast: () => ({ message: null, showToast: (value) => saved.push(value) }) },
    '@/shared/ui': ui,
    ...moduleOverrides,
  });
  const component = app.load(filename)[exported];
  return { ...app, queries, invalidations, saved, effects, render(props = {}) { cursor = 0; queries.length = 0; return component(props); } };
}
function nodes(tree) {
  if (tree == null || typeof tree === 'boolean') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (tree == null || typeof tree === 'boolean') return '';
  if (Array.isArray(tree)) return tree.map(text).join('');
  if (typeof tree === 'object') return text(tree.props?.children);
  return String(tree);
}
const control = (tree, label) => nodes(tree).find((node) => text(node) === label && (node.props.onClick || node.props.type === 'submit'));

test('choosing a bookmark sort changes the query to the backend sort code', () => {
  const app = componentHarness('src/app/(main)/bookmarks/page.tsx', 'default');
  let tree = app.render();
  nodes(tree).find((node) => node.props['aria-label'] === '정렬: 추가순').props.onClick();
  tree = app.render();
  control(tree, '오래된 아티클 순').props.onClick();
  app.render();
  assert.equal(app.queries.find((query) => query.queryKey.includes('list')).queryKey.at(-1), 'article_date_asc');
});

test('recommendations request profile setup before calling APIs which require preferences', () => {
  const app = componentHarness('src/widgets/newsletter-explorer/NewsletterRecommendations.tsx', 'NewsletterRecommendations');
  const tree = app.render();
  assert.equal(nodes(tree).find((node) => node.type === 'ButtonLink').props.href, '/onboarding');
  assert.deepEqual(app.queries.filter((query) => query.queryKey.includes('recommend')).map((query) => query.enabled), [false, false]);
});

test('preference form requires three interests then saves and refreshes profile/recommendations', async () => {
  let completed = false;
  const app = componentHarness('src/features/profile/PreferenceForm.tsx', 'PreferenceForm', {
    options: { industries: [{ id: 10, name: '개발' }], interests: [{ id: 1, name: '기술' }, { id: 2, name: '경제' }, { id: 3, name: '문화' }] },
  });
  const props = { profile: { industryId: 10, interests: [{ interestId: 1 }, { interestId: 2 }] }, onSaved: () => { completed = true; } };
  let tree = app.render(props);
  assert.equal(nodes(tree).find((node) => node.type === 'Button').props.disabled, true);
  control(tree, '문화').props.onClick();
  tree = app.render(props);
  assert.equal(nodes(tree).find((node) => node.type === 'Button').props.disabled, false);
  tree.props.onSubmit({ preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(app.requests[0].url.searchParams.getAll('interest'), ['1', '2', '3']);
  assert.deepEqual(app.invalidations, [['user'], ['newsletter']]);
  assert.equal(completed, true);
});

test('subscription notices follow the Figma state and confirmation designs while guests are sent to login', () => {
  let closed = 0;
  let hidden = 0;
  const props = { onClose() { closed++; }, onHideForToday() { hidden++; } };
  const guest = componentHarness('src/features/subscription/SubscribeDialog.tsx', 'SubscribeDialog', { loggedIn: false });
  assert.deepEqual(nodes(guest.render(props)).filter((node) => node.type === 'ButtonLink').map((node) => node.props.href), ['/login']);
  const member = componentHarness('src/features/subscription/SubscribeDialog.tsx', 'SubscribeDialog');
  let tree = member.render(props);
  assert.equal(tree.props.title, '구독 상태 안내');
  assert.equal(tree.props.variant, 'notice');
  assert.equal(nodes(tree).some((node) => node.type === 'iframe'), false);
  assert.match(text(tree), /첫 아티클 수신 후구독 상태가 자동으로 변경돼요/);
  control(tree, '확인').props.onClick();
  control(tree, '오늘 하루 보지 않기').props.onClick();
  assert.equal(closed, 1);
  assert.equal(hidden, 1);
  tree = member.render({ ...props, checking: true });
  assert.equal(tree.props.title, '구독 확인 필요');
  assert.ok(nodes(tree).some((node) => node.props.href === '/home' && text(node) === '메일 확인하기'));
  assert.equal(control(tree, '오늘 하루 보지 않기'), undefined);
});

test('subscription copies the email, refreshes on return, and respects hiding the notice for today', async () => {
  const app = componentHarness('src/features/subscription/useSubscriptionFlow.ts', 'useSubscriptionFlow');
  const copied = [];
  const listeners = new Map();
  app.context.window.addEventListener = (name, handler) => listeners.set(name, handler);
  app.context.window.removeEventListener = (name) => listeners.delete(name);
  app.context.document = { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} };
  app.context.navigator = { clipboard: { writeText: async (value) => { copied.push(value); } } };
  const props = { email: 'reader@example.com', userId: 5 };
  let flow = app.render(props);
  const cleanup = app.effects[0]();
  flow.beginSubscription({ preventDefault() { assert.fail('A ready subscription link must open normally'); } });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(copied, ['reader@example.com']);
  assert.deepEqual(app.saved, ['구독 이메일을 복사했어요.']);
  assert.equal(app.render(props).notice, null);
  listeners.get('focus')();
  flow = app.render(props);
  assert.equal(flow.notice, 'state');
  assert.deepEqual(app.invalidations, [['newsletter'], ['subscription'], ['article']]);
  flow.hideForToday();
  flow = app.render(props);
  assert.equal(flow.notice, null);
  flow.beginSubscription({ preventDefault() { assert.fail(); } });
  listeners.get('focus')();
  assert.equal(app.render(props).notice, null);
  app.context.navigator.clipboard.writeText = async () => { throw new Error('Clipboard denied'); };
  await app.render(props).copyEmail();
  assert.match(app.render(props).copyError, /복사하지 못했어요/);
  cleanup();
});

test('a bookmark request failure renders retry rather than the empty state', () => {
  const app = componentHarness('src/app/(main)/bookmarks/page.tsx', 'default', { queryError: true });
  const tree = app.render();
  assert.equal(nodes(tree).some((node) => node.type === 'EmptyState' && node.props.title === '북마크를 불러오지 못했어요.'), true);
});

test('private pages do not show a guest state before auth hydration', () => {
  for (const filename of ['src/app/(main)/bookmarks/page.tsx', 'src/app/(main)/mypage/page.tsx']) {
    const app = componentHarness(filename, 'default', { loggedIn: false, hydrated: false });
    const tree = app.render();
    assert.equal(nodes(tree).some((node) => node.type === 'GuestNotice' || node.type === 'BookmarkEmpty'), false);
    assert.equal(nodes(tree).some((node) => node.type === 'LoadingState'), true);
  }
});

test('public newsletter content stays visible while member subscription state loads', () => {
  const brand = { brandName: '뉴독', imageUrl: null, publicationCycle: '', detailDescription: '소개', subscribeUrl: 'https://newdok.test', brandArticleList: [], interests: [] };
  const moduleOverrides = {
    '@/entities/newsletter': {
      newsletterQueries: { brand: (id, member) => ({ queryKey: ['newsletter', 'brand', id, member] }) },
      usePauseSubscription: () => ({ isPending: false }),
      useResumeSubscription: () => ({ isPending: false }),
    },
    '@/features/subscription/SubscribeDialog': { SubscribeDialog: 'SubscribeDialog' },
    '@/widgets/landing/NewsletterImage': { NewsletterImage: 'NewsletterImage' },
  };
  const queryStates = { true: { data: brand, isPending: false, isPlaceholderData: true } };
  const app = componentHarness('src/app/newsletters/[id]/BrandDetailClient.tsx', 'BrandDetailClient', {
    loggedIn: true, hydrated: true, moduleOverrides,
    queryStates,
  });
  const tree = app.render({ id: 5, initialBrand: brand });
  assert.equal(app.queries.find((query) => query.queryKey.includes('brand')).placeholderData, brand);
  assert.match(text(tree), /뉴독/);
  assert.equal(nodes(tree).some((node) => node.type === 'LoadingState'), false);
  assert.equal(control(tree, '구독하기'), undefined);
  queryStates.true.isPlaceholderData = false;
  app.context.window.open = () => { assert.fail('Subscription uses a normal new-tab link, not a popup window'); };
  app.context.navigator = { clipboard: { writeText: async () => {} } };
  const link = control(app.render({ id: 5, initialBrand: brand }), '구독하기');
  assert.equal(link.type, 'ButtonLink');
  assert.equal(link.props.href, brand.subscribeUrl);
  assert.equal(link.props.target, '_blank');
  link.props.onClick({ preventDefault() { assert.fail(); } });
  assert.equal(nodes(app.render({ id: 5, initialBrand: brand })).some((node) => node.type === 'SubscribeDialog'), false);
});

function profileField(app, props) {
  const tree = app.render(props);
  const field = nodes(tree).find((node) => typeof node.type === 'function' && node.props.field);
  return field.type(field.props);
}

test('profile industry editor sends the selected numeric industry and refreshes recommendations', async () => {
  const app = componentHarness('src/features/profile/ProfileEditor.tsx', 'ProfileEditor', { options: { industries: [{ id: 10, name: '개발' }, { id: 11, name: '교육' }], interests: [] } });
  const props = { profile: { nickname: '뉴독5', industryId: 10, interests: [] }, onClose() {} };
  let tree = app.render(props);
  nodes(tree).find((node) => node.props.label === '종사산업').props.onClick();
  tree = profileField(app, props);
  nodes(tree).find((node) => node.type === 'Dropdown').props.onValueChange('11');
  tree = profileField(app, props);
  tree.props.onSubmit({ preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(app.requests[0].url.pathname, '/api/backend/users/mypage/industry');
  assert.deepEqual(JSON.parse(app.requests[0].body), { industryId: 11 });
  assert.deepEqual(app.invalidations, [['user'], ['newsletter']]);
});

test('profile interest editor enforces three choices before updating existing preferences', async () => {
  const app = componentHarness('src/features/profile/ProfileEditor.tsx', 'ProfileEditor', { options: { industries: [], interests: [{ id: 1, name: '기술' }, { id: 2, name: '경제' }, { id: 3, name: '문화' }] } });
  const props = { profile: { nickname: '뉴독5', industryId: 10, interests: [{ interestId: 1 }, { interestId: 2 }] }, onClose() {} };
  let tree = app.render(props);
  nodes(tree).find((node) => node.props['aria-label'] === '관심사 변경').props.onClick();
  tree = profileField(app, props);
  assert.equal(nodes(tree).find((node) => node.type === 'Button' && node.props.type === 'submit').props.disabled, true);
  control(tree, '문화').props.onClick();
  tree = profileField(app, props);
  assert.equal(nodes(tree).find((node) => node.type === 'Button' && node.props.type === 'submit').props.disabled, false);
  tree.props.onSubmit({ preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(JSON.parse(app.requests[0].body), { interestIds: [1, 2, 3] });
});

test('withdrawal requires acknowledging deletion, choosing a reason and pressing the final action', async () => {
  const app = componentHarness('src/app/(main)/mypage/page.tsx', 'default');
  let tree = app.render();
  nodes(tree).find((node) => node.props.label === '계정 관리').props.onClick();
  tree = app.render();
  nodes(tree).find((node) => node.props.label === '회원탈퇴').props.onClick();
  const render = () => { const root = app.render(); const child = nodes(root).find((node) => typeof node.type === 'function' && node.props.onWithdrawn); return child.type(child.props); };
  tree = render();
  assert.equal(control(tree, '계속하기').props.disabled, true);
  nodes(tree).find((node) => node.type === 'input').props.onChange({ target: { checked: true } });
  tree = render(); control(tree, '계속하기').props.onClick();
  tree = render();
  assert.equal(control(tree, '탈퇴하기').props.disabled, true);
  assert.equal(app.requests.length, 0);
  nodes(tree).find((node) => node.type === 'input').props.onChange();
  tree = render();
  assert.equal(control(tree, '탈퇴하기').props.disabled, false);
  assert.equal(app.requests.length, 0);
  control(tree, '탈퇴하기').props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].url.pathname, '/api/backend/users/withdraw');
});

test('signup onboarding shows email completion and recommendation guidance before preferences', () => {
  const app = componentHarness('src/app/(auth)/onboarding/page.tsx', 'default');
  let tree = app.render();
  assert.match(JSON.stringify(tree), /이메일이 생성되었어요/);
  control(tree, '다음').props.onClick();
  tree = app.render();
  assert.match(JSON.stringify(tree), /더 알려주세요/);
  control(tree, '뉴스레터 추천받기').props.onClick();
  tree = app.render();
  assert.ok(nodes(tree).some((node) => node.props.stepwise === true && node.props.onSaved));
  assert.equal(app.requests.length, 0);
});

test('stepwise onboarding keeps industry selection and only saves after three interests', async () => {
  const app = componentHarness('src/features/profile/PreferenceForm.tsx', 'PreferenceForm', { options: { industries: [{ id: 11, name: 'IT' }], interests: [{ id: 1, name: '기술' }, { id: 2, name: '경제' }, { id: 3, name: '문화' }] } });
  const props = { profile: { industryId: null, interests: [] }, stepwise: true, onSaved() {} };
  let tree = app.render(props);
  assert.equal(control(tree, '다음').props.disabled, true);
  nodes(tree).find((node) => node.type === 'Dropdown').props.onValueChange('11');
  tree = app.render(props);
  tree.props.onSubmit({ preventDefault() {} });
  tree = app.render(props);
  assert.equal(app.requests.length, 0);
  assert.equal(control(tree, '뉴스레터 추천받기').props.disabled, true);
  for (const interest of ['기술', '경제', '문화']) { control(tree, interest).props.onClick(); tree = app.render(props); }
  control(tree, '산업 다시 선택').props.onClick();
  tree = app.render(props);
  assert.equal(nodes(tree).find((node) => node.type === 'Dropdown').props.value, '11');
  tree.props.onSubmit({ preventDefault() {} });
  tree = app.render(props);
  assert.equal(control(tree, '뉴스레터 추천받기').props.disabled, false);
  tree.props.onSubmit({ preventDefault() {} });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].url.searchParams.get('industry'), '11');
  assert.deepEqual(app.requests[0].url.searchParams.getAll('interest'), ['1', '2', '3']);
});

test('shared tabs support keyboard selection and focus while preserving panel associations', () => {
  const app = componentHarness('src/design-system/components/Tabs.tsx', 'Tabs');
  const changes = [];
  const focused = [];
  const props = { id: 'newsletter', label: '뉴스레터 목록', value: 'recommend', options: [{ value: 'recommend', label: '추천 뉴스레터' }, { value: 'all', label: '모든 뉴스레터' }], onChange: (value) => changes.push(value) };
  let tree = app.render(props);
  const tabs = nodes(tree).filter((node) => node.props.role === 'tab');
  tabs.forEach((tab, index) => tab.props.ref({ focus: () => focused.push(index) }));
  tabs[0].props.onKeyDown({ key: 'ArrowRight', preventDefault() {} });
  assert.deepEqual(changes, ['all']);
  assert.deepEqual(focused, [1]);
  tree = app.render({ ...props, value: 'all' });
  const selected = nodes(tree).find((node) => node.props.role === 'tab' && node.props['aria-selected']);
  assert.equal(selected.props.id, 'newsletter-tab-all');
  assert.equal(selected.props['aria-controls'], 'newsletter-panel-all');
  assert.equal(selected.props.tabIndex, 0);
});

test('dropdown opens an overlay above a low trigger and commits keyboard selection only on Enter', () => {
  const app = componentHarness('src/design-system/components/Dropdown.tsx', 'Dropdown');
  const changes = [];
  const props = { value: '', placeholder: '산업군을 선택해주세요.', options: [{ value: 'it', label: 'IT' }, { value: 'finance', label: '금융' }, { value: 'design', label: '디자인' }], onValueChange: (value) => changes.push(value) };
  let tree = app.render(props);
  tree.props.ref.current = { getBoundingClientRect: () => ({ top: 500, bottom: 548 }), closest: () => null };
  nodes(tree).find((node) => node.props.role === 'combobox').props.onClick();
  tree = app.render(props);
  const popup = nodes(tree).find((node) => node.props.role === 'listbox');
  assert.equal(popup.props.hidden, false);
  assert.equal(popup.props['data-side'], 'above');
  const key = (key) => ({ key, nativeEvent: {}, preventDefault() {}, stopPropagation() {} });
  nodes(tree).find((node) => node.props.role === 'combobox').props.onKeyDown(key('ArrowDown'));
  tree = app.render(props);
  assert.deepEqual(changes, []);
  nodes(tree).find((node) => node.props.role === 'combobox').props.onKeyDown(key('Enter'));
  assert.deepEqual(changes, ['finance']);
  tree = app.render({ ...props, value: 'finance' });
  assert.equal(nodes(tree).find((node) => node.props.role === 'listbox').props.hidden, true);
  assert.equal(nodes(tree).find((node) => node.props.role === 'option' && node.props['aria-selected']).props.children, '금융');
});

test('dropdown Escape closes the list without selecting or cancelling its parent dialog', () => {
  const app = componentHarness('src/design-system/components/Dropdown.tsx', 'Dropdown');
  const props = { value: 'it', placeholder: '선택', options: [{ value: 'it', label: 'IT' }], onValueChange() { assert.fail('Escape must not select'); } };
  let tree = app.render(props);
  nodes(tree).find((node) => node.props.role === 'combobox').props.onClick();
  tree = app.render(props);
  const prevented = [];
  nodes(tree).find((node) => node.props.role === 'combobox').props.onKeyDown({ key: 'Escape', nativeEvent: {}, preventDefault() { prevented.push('default'); }, stopPropagation() { prevented.push('propagation'); } });
  tree = app.render(props);
  assert.equal(nodes(tree).find((node) => node.props.role === 'combobox').props['aria-expanded'], false);
  assert.deepEqual(prevented, ['default', 'propagation']);
});

test('a slow secondary recommendation does not hide the ready primary recommendation', () => {
  const app = componentHarness('src/widgets/newsletter-explorer/NewsletterRecommendations.tsx', 'NewsletterRecommendations', {
    profile: { nickname: '뉴독', industryId: 10, interests: [{ interestId: 1 }] },
    queryStates: { intersection: { data: [{ id: 42 }] }, union: { data: undefined, isPending: true } },
  });
  const tree = app.render();
  assert.ok(nodes(tree).some((node) => node.props.items?.[0]?.id === 42));
  assert.ok(nodes(tree).some((node) => node.type?.name === 'NewsletterListSkeleton' && node.props.label === '다른 추천을 불러오는 중이에요.'));
});

test('recommendation lists render 24 entries initially and reveal the next batch on demand', () => {
  const app = componentHarness('src/widgets/newsletter-explorer/NewsletterRecommendations.tsx', 'NewsletterRecommendations', {
    profile: { nickname: '뉴독', industryId: 10, interests: [{ interestId: 1 }] },
    queryStates: { union: { data: Array.from({ length: 60 }, (_, id) => ({ id })) } },
  });
  function renderList() { const root = app.render(); const list = nodes(root).find((node) => node.type?.name === 'RecommendationList'); return list.type(list.props); }
  let tree = renderList();
  assert.equal(nodes(tree).filter((node) => node.props.newsletter).length, 24);
  control(tree, '추천 더 보기 (24/60)').props.onClick();
  tree = renderList();
  assert.equal(nodes(tree).filter((node) => node.props.newsletter).length, 48);
});

test('public artwork retries the original and shows the app placeholder for missing or failed images', () => {
  const app = componentHarness('src/widgets/landing/NewsletterImage.tsx', 'NewsletterImage');
  const props = { name: '뉴스레터', imageUrl: 'https://api-dev.newdok.store/public/test.png', variant: 'thumbnail' };
  for (const imageUrl of [null, '', '  \n ']) {
    const empty = app.render({ ...props, imageUrl });
    assert.equal(empty.props.empty, true);
    assert.equal(nodes(empty).find((node) => node.props.fill).props.name, 'emptyCase');
  }
  let tree = app.render(props);
  let img = nodes(tree).find((node) => node.props.fill);
  assert.equal(img.props.unoptimized, false);
  img.props.onError();
  tree = app.render(props);
  img = nodes(tree).find((node) => node.props.fill);
  assert.equal(img.props.unoptimized, true);
  img.props.onError();
  tree = app.render(props);
  assert.equal(tree.props.empty, true);
  assert.equal(nodes(tree).find((node) => node.props.fill).props.name, 'emptyCase');
  tree = app.render({ ...props, imageUrl: 'https://api-dev.newdok.store/public/replacement.png' });
  assert.equal(tree.props.empty, false);
  assert.equal(nodes(tree).find((node) => node.props.fill).props.src, 'https://api-dev.newdok.store/public/replacement.png');
});

test('image optimization accepts both app APIs’ public artwork and preserves SVG/GIF originals', () => {
  const { canOptimizeNewsletterImage } = harness().load('src/shared/lib/image.ts');
  assert.equal(canOptimizeNewsletterImage('https://api-dev.newdok.store/public/test.png'), true);
  assert.equal(canOptimizeNewsletterImage('https://api.newdok.store/public/test.png'), true);
  assert.equal(canOptimizeNewsletterImage('/api/backend/public/test.png'), true);
  for (const src of ['https://api.newdok.store/users/profile', 'https://api.newdok.store:8443/public/test.png', 'https://other.example/image.png', '/api/backend/users/profile', 'https://api-dev.newdok.store/public/test.gif', 'https://api-dev.newdok.store/public/test.svg']) assert.equal(canOptimizeNewsletterImage(src), false, src);
});

test('query retry policy stops invalid-session requests immediately but retries transient failures once', async () => {
  const app = harness();
  const { ApiError } = app.load('src/shared/api/client.ts');
  const { shouldRetryQuery } = app.load('src/shared/lib/query-policy.ts');
  for (const [status, expected] of [[401, 1], [403, 1], [404, 1], [503, 2], [429, 2]]) {
    let attempts = 0;
    const client = new QueryClient({ defaultOptions: { queries: { retry: shouldRetryQuery, retryDelay: 0, gcTime: 0 } } });
    await assert.rejects(client.fetchQuery({ queryKey: ['retry-policy', status], queryFn: () => { attempts++; throw new ApiError(status); } }));
    assert.equal(attempts, expected, String(status));
    client.clear();
  }
});
