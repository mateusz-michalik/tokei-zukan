// Renders a single-watch visual review sheet (Day light, Day dark, Dusk, Night, Outline, and 64 px thumbnails)
// to review-artifacts/<id>-review.png and prints the measured SVG element count and UTF-8 byte budget.
//
// Usage: npm run review -- <watch-id>
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { createServer } from 'vite';

const id = process.argv[2];
if (!id) {
  console.error('Usage: npm run review -- <watch-id>');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const font = (pkg, file) => require.resolve(`@expo-google-fonts/${pkg}/${file}`);
const fontFiles = [
  font('arimo', '400Regular/Arimo_400Regular.ttf'), font('arimo', '700Bold/Arimo_700Bold.ttf'), font('arimo', '700Bold_Italic/Arimo_700Bold_Italic.ttf'),
  font('tinos', '400Regular/Tinos_400Regular.ttf'), font('tinos', '700Bold/Tinos_700Bold.ttf'),
  font('archivo', '800ExtraBold/Archivo_800ExtraBold.ttf'),
  font('eb-garamond', '400Regular/EBGaramond_400Regular.ttf'), font('eb-garamond', '400Regular_Italic/EBGaramond_400Regular_Italic.ttf'),
  font('ibm-plex-mono', '400Regular/IBMPlexMono_400Regular.ttf'), font('ibm-plex-mono', '500Medium/IBMPlexMono_500Medium.ttf'),
  font('dancing-script', '700Bold/DancingScript_700Bold.ttf'),
];
const LOADED = ['Arimo', 'Tinos', 'Archivo', 'EB Garamond', 'IBM Plex Mono', 'Dancing Script'];
const bundled = list => {
  if (LOADED.includes(list.split(',')[0].replace(/['"]/g, '').trim())) return list;
  if (/cursive|Script|Roundhand/i.test(list)) return 'Dancing Script';
  if (/mono/i.test(list)) return 'IBM Plex Mono';
  if (/(^|,)\s*serif|Times|Georgia|Garamond/i.test(list)) return 'Tinos';
  return 'Arimo';
};
const fixFonts = svg => svg
  .replace(/font-family="([^"]*)"/g, (_, list) => `font-family="${bundled(list)}"`)
  .replace(/(font-family="Dancing Script"[^>]*?) font-style="italic"/g, '$1');

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
try {
  const { CATALOG } = await server.ssrLoadModule('/src/catalog/index.ts');
  const { watchGroup, watchSVG } = await server.ssrLoadModule('/src/render/watch.ts');
  const watch = CATALOG.find(w => w.id === id);
  if (!watch) {
    console.error(`Unknown watch id "${id}". Available ids:\n  ${CATALOG.map(w => w.id).join('\n  ')}`);
    process.exit(1);
  }

  // Measure the same comparison budget checked by src/render/render.test.ts.
  const budgetSvg = watchSVG(watch, 8, { strapLen: 12 });
  const elements = (budgetSvg.match(/<[a-zA-Z]/g) ?? []).length;
  const bytes = new TextEncoder().encode(budgetSvg).length;
  console.log(`${watch.brand} ${watch.model} (${watch.ref})`);
  console.log(`Budget (strapLen=12): ${elements} elements (limit < 320), ${bytes} bytes (limit < 50,000)`);

  const W = 1380, H = 980, pad = 24, cw = 428, ch = 436, headerH = 44;
  const panels = [
    { label: 'DAY · LIGHT', bg: '#f4f4f0', fg: '#222', opts: { strapLen: 14, lighting: 'day' } },
    { label: 'DAY · DARK', bg: '#111419', fg: '#cfd6df', opts: { strapLen: 14, lighting: 'day' } },
    { label: 'DUSK', bg: '#141923', fg: '#cfd6df', opts: { strapLen: 14, lighting: 'dusk' } },
    { label: 'NIGHT', bg: '#090d14', fg: '#cfd6df', opts: { strapLen: 14, lighting: 'night' } },
    { label: 'OUTLINE', bg: '#ffffff', fg: '#222', opts: { outline: true, color: '#151515' } },
  ];

  let body = `<rect width="${W}" height="${H}" fill="#e9e8e2"/>`;
  body += `<text x="${pad}" y="30" font-family="IBM Plex Mono" font-size="15" font-weight="500" fill="#1e1e1c">${watch.brand} ${watch.model} (${watch.ref}) — ${elements} els · ${(bytes / 1000).toFixed(1)} KB</text>`;

  panels.forEach((p, idx) => {
    const col = idx % 3, row = Math.floor(idx / 3);
    const x = pad + col * (cw + pad), y = headerH + pad + row * (ch + pad);
    const r = watchGroup(watch, p.opts);
    const scale = Math.min((cw - 48) / r.w, (ch - 64) / r.h);
    const cx = x + cw / 2, cy = y + 34 + (ch - 34) / 2;
    body += `<g><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="${p.bg}" stroke="#c8c6be"/>`
      + `<text x="${x + 14}" y="${y + 22}" font-family="IBM Plex Mono" font-size="11" fill="${p.fg}" opacity=".75">${p.label}</text>`
      + `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${scale.toFixed(3)})">${r.g}</g></g>`;
  });

  // Sixth panel: 64 px sidebar thumbnails (light & dark) + 128 px comparison chip.
  const tx = pad + 2 * (cw + pad), ty = headerH + pad + (ch + pad);
  body += `<g><rect x="${tx}" y="${ty}" width="${cw}" height="${ch}" rx="8" fill="#f4f4f0" stroke="#c8c6be"/>`
    + `<text x="${tx + 14}" y="${ty + 22}" font-family="IBM Plex Mono" font-size="11" fill="#222" opacity=".75">THUMBNAILS (64 PX &amp; 128 PX)</text>`;
  const thumbs = [
    { cx: tx + 100, cy: ty + 130, box: 64, bg: '#ffffff', opts: { strapLen: 10, lighting: 'day' } },
    { cx: tx + 210, cy: ty + 130, box: 64, bg: '#111419', opts: { strapLen: 10, lighting: 'day' } },
    { cx: tx + 320, cy: ty + 130, box: 64, bg: '#090d14', opts: { strapLen: 10, lighting: 'night' } },
    { cx: tx + 135, cy: ty + 305, box: 128, bg: '#ffffff', opts: { strapLen: 12, lighting: 'day' } },
    { cx: tx + 295, cy: ty + 305, box: 128, bg: '#090d14', opts: { strapLen: 12, lighting: 'night' } },
  ];
  for (const t of thumbs) {
    const r = watchGroup(watch, t.opts);
    const s = Math.min((t.box - 8) / r.w, (t.box - 8) / r.h);
    body += `<rect x="${t.cx - t.box / 2}" y="${t.cy - t.box / 2}" width="${t.box}" height="${t.box}" rx="6" fill="${t.bg}" stroke="#c8c6be"/>`
      + `<g transform="translate(${t.cx} ${t.cy}) scale(${s.toFixed(3)})">${r.g}</g>`;
  }
  body += '</g>';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
  const png = new Resvg(fixFonts(svg), { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Arimo' } }).render().asPng();
  await mkdir('review-artifacts', { recursive: true });
  const out = join('review-artifacts', `${id}-review.png`);
  await writeFile(out, png);
  console.log(`Wrote ${out} (${(png.length / 1024).toFixed(1)} KB)`);
} finally {
  await server.close();
}
process.exit(0);
