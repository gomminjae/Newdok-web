import assert from 'node:assert/strict';

const origin = process.argv[2] ?? 'http://localhost:3000';
const page = await fetch(`${origin}/design-system`);
assert.equal(page.status, 200, 'Design system preview must load');
const html = await page.text();
const stylesheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map(([tag]) => tag.match(/href="([^"]+)"/)?.[1]).filter(Boolean);
assert.ok(stylesheets.length, 'SSR must link a stylesheet');
const css = (await Promise.all(stylesheets.map(async (href) => {
  const response = await fetch(new URL(href.replaceAll('&amp;', '&'), origin));
  assert.equal(response.status, 200, `Stylesheet ${href} must load`);
  return response.text();
}))).join('\n');
for (const selector of ['.nd-button', '.nd-chip', '.nd-segment', '.nd-tabs', '.nd-dropdown-trigger', '.nd-dropdown-list']) {
  assert.ok(css.includes(`${selector} {`) || css.includes(`${selector}{`), `Missing delivered component style: ${selector}`);
}
for (const variable of ['--ds-segment-height:', '--color-primary-normal:', '--color-bg-normal:']) assert.ok(css.includes(variable), `Missing delivered design token: ${variable}`);
console.log('Delivered CSS verified: buttons, chips, segments, tabs, dropdowns and design tokens');
