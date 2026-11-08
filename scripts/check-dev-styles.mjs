import assert from 'node:assert/strict';

const origin = process.argv[2] ?? 'http://localhost:3000';
const page = await fetch(`${origin}/design-system`);
assert.equal(page.status, 200, 'Design system preview must load');
const html = await page.text();
assert.match(html, /<body\b[^>]*\bclass="[^"]+"/, 'Body must directly bind the local font class');
const stylesheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(([tag]) => tag.match(/href="([^"]+)"/)?.[1]).filter(Boolean);
assert.ok(stylesheets.length, 'SSR must link a stylesheet');
const fontURLs = new Set();
const css = (await Promise.all(stylesheets.map(async (href) => {
  const response = await fetch(new URL(href.replaceAll('&amp;', '&'), origin));
  assert.equal(response.status, 200, `Stylesheet ${href} must load`);
  const sheet = await response.text();
  for (const [, , src] of sheet.matchAll(/url\((['"]?)([^'"\s)]+\.woff2(?:\?[^'"\s)]*)?)\1\)/g)) fontURLs.add(new URL(src, new URL(href.replaceAll('&amp;', '&'), origin)).href);
  return sheet;
}))).join('\n');
for (const selector of ['.nd-button', '.nd-chip', '.nd-segment', '.nd-tabs', '.nd-dropdown-trigger', '.nd-dropdown-list', '.nd-loading', '.nd-card-link', '.nd-media-frame']) {
  assert.ok(css.includes(`${selector} {`) || css.includes(`${selector}{`), `Missing delivered component style: ${selector}`);
}
for (const variable of ['--ds-segment-height:', '--color-primary-normal:', '--color-bg-normal:']) assert.ok(css.includes(variable), `Missing delivered design token: ${variable}`);
const fontLinks = [...html.matchAll(/<link\b[^>]*as="font"[^>]*>/g)].map(([tag]) => tag.match(/href="([^"]+)"/)?.[1]).filter(Boolean);
for (const href of fontLinks) fontURLs.add(new URL(href, origin).href);
assert.ok(fontURLs.size > 0, 'Delivered CSS must include local font faces');
await Promise.all([...fontURLs].map(async (href) => { const response = await fetch(href, { method: 'HEAD' }); assert.equal(response.status, 200, `Local font ${href} must load`); }));
console.log('Delivered styles and fonts verified: controls, loading, card/image borders and local font files');
