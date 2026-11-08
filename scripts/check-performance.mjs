import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const origin = process.argv[2] ?? 'http://localhost:3000';
async function measure(url, image = false) {
  const start = performance.now();
  const response = await fetch(url, { signal: AbortSignal.timeout(25_000), headers: image ? { Accept: 'image/webp' } : {} });
  const firstByteMs = Math.round(performance.now() - start);
  const bytes = (await response.arrayBuffer()).byteLength;
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return { firstByteMs, bytes, contentType: response.headers.get('content-type') };
}

const artwork = 'https://api-dev.newdok.store/public/NEWNEEK.png';
const results = await Promise.allSettled([
  measure(`${origin}/home`),
  measure(`${origin}/search`),
  measure(artwork, true),
  measure(`${origin}/_next/image?${new URLSearchParams({ url: artwork, w: '128', q: '75' })}`, true),
]);
const names = ['homeHTML', 'searchHTML', 'originalArtwork', 'thumbnail128'];
const report = Object.fromEntries(results.map((result, index) => [names[index], result.status === 'fulfilled' ? result.value : { error: String(result.reason) }]));
const html = readFileSync('.next/server/app/index.html', 'utf8');
const fonts = [...html.matchAll(/<link\b[^>]*as="font"[^>]*>/g)].map(([tag]) => tag.match(/href="([^"]+)"/)?.[1]).filter(Boolean);
report.buildFontPreloads = { count: fonts.length, bytes: fonts.reduce((total, href) => total + statSync(resolve('.next', href.replace('/_next/', ''))).size, 0) };
console.log(JSON.stringify({ scope: 'HTTP delivery sample and build font budget; browser LCP/INP are not measured here.', ...report }, null, 2));
if (results.some((result) => result.status === 'rejected')) process.exitCode = 1;
