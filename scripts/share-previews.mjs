// Writes the link-preview pages and images after `vite build` (see src/lib/share.ts).
// For every catalogue watch: dist/watches/<slug>.html, <slug>/index.html and <slug>/wrist.html (index.html with that
// watch's share tags), and dist/share/<slug>.jpg. Plus dist/watch-not-found.html and dist/share/tokei-zukan.jpg.
// Vite loads src/lib/share.ts so the catalogue's import.meta.glob and the TypeScript renderers work as in the app.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import jpeg from 'jpeg-js';
import { createServer } from 'vite';

const dist = 'dist';
const require = createRequire(import.meta.url);
// Text in the drawings asks for Arial, Times, Georgia and so on, which a build server won't have. Arimo and Tinos
// share their metrics with Arial and Times New Roman.
const font = (pkg, file) => require.resolve(`@expo-google-fonts/${pkg}/${file}`);
const fontFiles = [
  font('arimo', '400Regular/Arimo_400Regular.ttf'), font('arimo', '700Bold/Arimo_700Bold.ttf'), font('arimo', '700Bold_Italic/Arimo_700Bold_Italic.ttf'),
  font('tinos', '400Regular/Tinos_400Regular.ttf'), font('tinos', '700Bold/Tinos_700Bold.ttf'),
  font('archivo', '800ExtraBold/Archivo_800ExtraBold.ttf'),
  font('eb-garamond', '400Regular/EBGaramond_400Regular.ttf'), font('eb-garamond', '400Regular_Italic/EBGaramond_400Regular_Italic.ttf'),
  font('ibm-plex-mono', '400Regular/IBMPlexMono_400Regular.ttf'), font('ibm-plex-mono', '500Medium/IBMPlexMono_500Medium.ttf'),
  font('dancing-script', '700Bold/DancingScript_700Bold.ttf'),
];
// resvg doesn't map generic families (serif, cursive, monospace) to the fonts given for them; everything unknown falls
// back to the default. So each font-family list in a drawing is swapped for the bundled font it's asking for.
const LOADED = ['Arimo', 'Tinos', 'Archivo', 'EB Garamond', 'IBM Plex Mono', 'Dancing Script'];
const bundled = list => {
  if (LOADED.includes(list.split(',')[0].replace(/['"]/g, '').trim())) return list;
  if (/cursive|Script|Roundhand/i.test(list)) return 'Dancing Script';
  if (/mono/i.test(list)) return 'IBM Plex Mono';
  if (/(^|,)\s*serif|Times|Georgia|Garamond/i.test(list)) return 'Tinos';
  return 'Arimo';
};
// JPEG keeps the detailed dials well under the ~300 KB some apps (WhatsApp among them) accept for a preview image.
// The script font has no italic, so script text doesn't ask for one.
const jpg = svg => {
  const fonts = svg.replace(/font-family="([^"]*)"/g, (_, list) => `font-family="${bundled(list)}"`)
    .replace(/(font-family="Dancing Script"[^>]*?) font-style="italic"/g, '$1');
  const img = new Resvg(fonts, { font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Arimo' } }).render();
  return jpeg.encode({ data: img.pixels, width: img.width, height: img.height }, 88).data;
};

const write = async (file, data) => { await mkdir(dirname(join(dist, file)), { recursive: true }); await writeFile(join(dist, file), data); };

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
try {
  const share = await server.ssrLoadModule('/src/lib/share.ts');
  const { CATALOG } = await server.ssrLoadModule('/src/catalog/index.ts');
  const template = await readFile(join(dist, 'index.html'), 'utf8');
  const pages = share.sharePages();
  for (const { file, share: s } of pages) await write(file, share.withShareHead(template, s));
  for (const w of CATALOG) await write(share.previewImage(w).slice(1), jpg(share.previewSVG(w)));
  await write(share.homeShare.image.slice(1), jpg(share.homePreviewSVG()));
  console.log(`share previews: ${pages.length} pages, ${CATALOG.length + 1} images`);
} finally {
  await server.close();
}
