import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { QueryClient } from '@tanstack/react-query';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtimeRequire = createRequire(import.meta.url);
const plain = (value) => JSON.parse(JSON.stringify(value));

// Execute the actual TypeScript API boundary with a deterministic transport.
function harness(respond = () => ({ body: {} }), overrides = {}) {
  const requests = [];
  const storage = new Map([['accessToken', 'test-token']]);
  const events = [];
  const cache = new Map();
  const context = vm.createContext({
    URL, URLSearchParams, AbortSignal, Event,
    process: { env: {} },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
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
  return { load, requests, storage, events };
}

const nestedArticle = { id: 42, title: '오늘의 뉴스', status: 'Unread', publishDate: 7, newsletter: { brandName: '뉴독', imageUrl: null } };

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
  assert.equal(app.storage.get('accessToken'), 'test-token');
  assert.deepEqual(app.events, []);
});

test('a 401 clears only the token which made the failed request', async () => {
  const app = harness(() => ({ status: 401, body: { message: '만료' } }));
  const { userApi } = app.load('src/entities/user/api/user.api.ts');
  await assert.rejects(userApi.getProfile());
  assert.equal(app.storage.has('accessToken'), false);
  assert.deepEqual(app.events, ['auth-change']);
  let rotated;
  rotated = harness(() => { rotated.storage.set('accessToken', 'new-session'); return { status: 401, body: {} }; });
  await assert.rejects(rotated.load('src/entities/user/api/user.api.ts').userApi.getProfile());
  assert.equal(rotated.storage.get('accessToken'), 'new-session');
  assert.deepEqual(rotated.events, []);
});

test('corrupt or overlapping local highlights cannot crash the article reader', () => {
  const { parseHighlights } = harness().load('src/shared/lib/reader-highlights.ts');
  assert.deepEqual(plain(parseHighlights('invalid')), []);
  const first = { id: '1', text: 'abc', start: 0, end: 3 };
  const overlap = { id: '2', text: 'bc', start: 1, end: 3 };
  assert.deepEqual(plain(parseHighlights(JSON.stringify([overlap, first, { ...first, start: -1 }, {}]))), [first]);
});

function componentHarness(filename, exported, { loggedIn = true, profile = { id: 5, nickname: '뉴독5', industryId: 10, interests: [], subscribeEmail: 'reader@example.com' }, options, queryError = false, queryStates = {} } = {}) {
  const slots = [];
  let cursor = 0;
  const queries = [];
  const invalidations = [];
  const saved = [];
  const ui = Object.fromEntries(['Button', 'ButtonLink', 'Chip', 'Dialog', 'EmptyState', 'GuestNotice', 'Icon', 'Toast', 'SegmentPicker'].map((name) => [name, name]));
  ui.Checkbox = 'input';
  ui.Dropdown = 'Dropdown';
  ui.LoadingState = 'LoadingState';
  ui.CardLink = 'CardLink';
  ui.MediaFrame = 'MediaFrame';
  const app = harness(({ url }) => ({ body: url.pathname.endsWith('/preInvestigate') ? { data: [] } : {} }), {
    react: {
      memo: (fn) => fn, useCallback: (fn) => fn, useMemo: (fn) => fn(), useEffect: () => {}, useRef: (value) => ({ current: value }), useId: () => 'test-id',
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
    '@/shared/hooks': { useAuth: () => ({ isLoggedIn: loggedIn, logout() {} }), useToast: () => ({ message: null, showToast: (value) => saved.push(value) }) },
    '@/shared/ui': ui,
  });
  const component = app.load(filename)[exported];
  return { ...app, queries, invalidations, saved, render(props = {}) { cursor = 0; queries.length = 0; return component(props); } };
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

test('subscription flow gates guests and guides members back to the confirmation mail', () => {
  const props = { brand: { brandId: 321, brandName: '뉴닉', subscribeUrl: 'https://example.com/subscribe', subscribeCheck: true }, onClose() {} };
  const guest = componentHarness('src/features/subscription/SubscribeDialog.tsx', 'SubscribeDialog', { loggedIn: false });
  assert.deepEqual(nodes(guest.render(props)).filter((node) => node.type === 'ButtonLink').map((node) => node.props.href), ['/login']);
  const member = componentHarness('src/features/subscription/SubscribeDialog.tsx', 'SubscribeDialog');
  let tree = member.render(props);
  control(tree, '발행처에서 신청하기 ↗').props.onClick();
  tree = member.render(props);
  assert.equal(nodes(tree).some((node) => node.props.href === '/home'), true);
  control(tree, '구독 신청 다시 하기').props.onClick();
  assert.equal(nodes(member.render(props)).some((node) => node.props.href === props.brand.subscribeUrl), true);
});

test('a bookmark request failure renders retry rather than the empty state', () => {
  const app = componentHarness('src/app/(main)/bookmarks/page.tsx', 'default', { queryError: true });
  const tree = app.render();
  assert.equal(nodes(tree).some((node) => node.type === 'EmptyState' && node.props.title === '북마크를 불러오지 못했어요.'), true);
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
  assert.ok(nodes(tree).some((node) => node.type === 'LoadingState' && node.props.label === '다른 추천을 불러오는 중이에요.'));
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

test('public artwork uses optimization and falls back to the original before showing an empty frame', () => {
  const app = componentHarness('src/widgets/landing/NewsletterImage.tsx', 'NewsletterImage');
  const props = { name: '뉴스레터', imageUrl: 'https://api-dev.newdok.store/public/test.png', variant: 'thumbnail' };
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
  assert.equal(nodes(tree).some((node) => node.props.fill), false);
});

test('image optimization only accepts development public artwork and preserves SVG/GIF originals', () => {
  const { canOptimizeNewsletterImage } = harness().load('src/shared/lib/image.ts');
  assert.equal(canOptimizeNewsletterImage('https://api-dev.newdok.store/public/test.png'), true);
  assert.equal(canOptimizeNewsletterImage('/api/backend/public/test.png'), true);
  for (const src of ['https://api.newdok.store/public/test.png', 'https://other.example/image.png', '/api/backend/users/profile', 'https://api-dev.newdok.store/public/test.gif', 'https://api-dev.newdok.store/public/test.svg']) assert.equal(canOptimizeNewsletterImage(src), false, src);
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
