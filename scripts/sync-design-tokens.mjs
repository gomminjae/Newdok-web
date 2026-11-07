import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = process.argv[2] ?? path.join(root, '../Newdok');
const palettePath = 'Modules/DesignSystem/Sources/Color/ColorPalette.swift';
const scalePath = 'Modules/DesignSystem/Sources/Token/DesignToken.swift';
const palette = readFileSync(path.join(app, palettePath), 'utf8').split('// MARK: - Legacy aliases')[0];
const scale = readFileSync(path.join(app, scalePath), 'utf8');
const colors = Object.fromEntries([...palette.matchAll(/static let (\w+) = Color\(hex: "([\dA-F]+)"\)(?:\.opacity\(([\d.]+)\))?/g)].map(([, name, hex, opacity]) => {
  const rgb = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).join(' ');
  return [name, opacity ? `rgb(${rgb} / ${opacity})` : `#${hex}`];
}));
const scales = Object.fromEntries([...scale.matchAll(/public enum (Spacing|Radius|FontSize|IconSize) \{([^}]+)\}/g)].map(([, group, body]) => [group, Object.fromEntries([...body.matchAll(/static let (\w+): CGFloat = (\d+)/g)].map(([, name, value]) => [name, Number(value)]))]));
const tokens = { sources: [palettePath, scalePath], colors, ...scales };
const destination = path.join(root, 'src/design-system/tokens');
mkdirSync(destination, { recursive: true });
writeFileSync(path.join(destination, 'app-tokens.json'), JSON.stringify(tokens, null, 2) + '\n');
const kebab = (value) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const lines = Object.entries(colors).map(([name, value]) => `  --color-${kebab(name)}: ${value};`);
for (const [group, prefix] of [['Spacing', 'spacing-app'], ['Radius', 'radius'], ['FontSize', 'text'], ['IconSize', 'icon']]) {
  for (const [name, value] of Object.entries(scales[group])) lines.push(`  --${prefix}-${name}: ${value}px;`);
}
writeFileSync(path.join(destination, 'app-tokens.css'), `/* Generated from the iOS DesignSystem by scripts/sync-design-tokens.mjs. */\n@theme {\n${lines.join('\n')}\n}\n`);
console.log(`Synced ${Object.keys(colors).length} app colors and ${Object.keys(scales).length} token scales`);
