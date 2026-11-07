import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Linter } from 'eslint';
import test from 'node:test';
import designSystem from '../scripts/eslint-design-system.mjs';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

test('all generated app colors and scales agree between TypeScript and CSS', () => {
  const tokens = JSON.parse(read('src/design-system/tokens/app-tokens.json'));
  const css = read('src/design-system/tokens/app-tokens.css');
  const declarations = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value]));
  const kebab = (value) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  for (const [name, value] of Object.entries(tokens.colors)) assert.equal(declarations[`color-${kebab(name)}`], value, name);
  for (const [group, prefix] of [['Spacing', 'spacing-app'], ['Radius', 'radius'], ['FontSize', 'text'], ['IconSize', 'icon']]) {
    for (const [name, value] of Object.entries(tokens[group])) assert.equal(declarations[`${prefix}-${name}`], `${value}px`, `${group}.${name}`);
  }
});

test('app asset outputs match the recorded source export, including all illustrations and icons', () => {
  const manifest = JSON.parse(read('public/images/app/manifest.json'));
  assert.ok(manifest.length >= 71);
  for (const asset of manifest) {
    const bytes = readFileSync(new URL(`public/${asset.output}`, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.outputSha256, asset.asset);
    assert.ok(asset.width > 0 && asset.height > 0, asset.asset);
  }
});

test('lint prevents screen colors and control appearance from diverging from the shared system', () => {
  const linter = new Linter();
  function check(source) {
    return linter.verify(source, { languageOptions: { parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } } }, plugins: { newdok: designSystem }, rules: { 'newdok/shared-appearance': 'error' } });
  }
  assert.deepEqual(check('const ui = <Button variant="outline" size="compact" className="mt-4 w-full" />;'), []);
  assert.deepEqual(check('const ui = <Chip as="button" active />;'), []);
  assert.equal(check('const ui = <SegmentPicker className="rounded-full bg-primary" />;')[0].messageId, 'override');
  assert.equal(check('const ui = <Button className={active ? "h-14" : "h-12"} />;')[0].messageId, 'override');
  assert.equal(check('const ui = <div className="text-[#123456]" />;')[0].messageId, 'color');
});
