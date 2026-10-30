import { CATALOG, catalogById } from '../catalog';
import type { CatalogWatch } from '../catalog/schema';
import { watchSVG } from '../render/watch';
import { watchPath } from './route';

/**
 * Link previews for messaging apps and social sites. Their crawlers don't run JavaScript, so `npm run build` writes a
 * copy of index.html for every catalogue watch address with that watch's title, description and preview image in its
 * head (scripts/share-previews.mjs). This module decides what goes in them; nothing here runs in the browser app.
 */

/** The production address: share tags need absolute URLs, and the bare domain redirects here. */
export const SITE = 'https://www.tokeizukan.com';
export const PREVIEW_W = 1200, PREVIEW_H = 630;

export interface Share {
  /** The page's <title>. */
  title: string;
  /** The headline shown in a link preview. */
  heading: string;
  description: string;
  /** Absolute address of the page, or none for a page that isn't a real address (not found). */
  url?: string;
  /** Path of the preview image under the site root. */
  image: string;
  imageAlt: string;
  noindex?: boolean;
}

const HOME_DESCRIPTION = 'Explore watches, compare their sizes to scale and see how they wear on your wrist.';

export const homeShare: Share = {
  title: 'Tokei Zukan',
  heading: 'Tokei Zukan',
  description: HOME_DESCRIPTION,
  url: `${SITE}/`,
  image: '/share/tokei-zukan.jpg',
  imageAlt: 'Tokei Zukan: a row of watch illustrations drawn to scale.',
};

/** For an address that names no watch: branded, never another watch's details, and kept out of search results. */
export const notFoundShare: Share = {
  title: 'Watch not found · Tokei Zukan',
  heading: 'Watch not found',
  description: `This address doesn't name a watch in the catalogue. ${HOME_DESCRIPTION}`,
  image: homeShare.image,
  imageAlt: homeShare.imageAlt,
  noindex: true,
};

const mm = (n: number | undefined) => (n === undefined ? undefined : `${n} mm`);
/** "Seiko Presage Cocktail Time SRPB43", leaving out a reference the model name already includes. */
export const fullName = (w: CatalogWatch) => [w.brand, w.model, w.model.includes(w.ref) ? '' : w.ref].filter(Boolean).join(' ');

export const previewImage = (w: CatalogWatch) => `/share/${watchPath(w.id).split('/').pop()}.jpg`;

export function watchShare(w: CatalogWatch, view: 'detail' | 'wrist'): Share {
  const name = fullName(w);
  const size = [mm(w.diameter) && `${mm(w.diameter)} wide`, mm(w.lugToLug) && `${mm(w.lugToLug)} lug to lug`, mm(w.thickness) && `${mm(w.thickness)} thick`].filter(Boolean).join(', ');
  return view === 'detail' ? {
    title: `${w.brand} ${w.ref} · Tokei Zukan`,
    heading: name,
    description: `${name}: ${size}. Compare its size to scale with other watches and see how it wears on your wrist.`,
    url: SITE + watchPath(w.id),
    image: previewImage(w),
    imageAlt: `Illustration of the ${name}, drawn to scale.`,
  } : {
    title: `${w.brand} ${w.ref} on the wrist · Tokei Zukan`,
    heading: `${name} on the wrist`,
    description: `See how the ${name} (${size}) wears on your wrist, drawn to scale.`,
    url: SITE + watchPath(w.id, 'wrist'),
    image: previewImage(w),
    imageAlt: `Illustration of the ${name}, drawn to scale.`,
  };
}

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The <head> tags for one page: title, description, canonical address, Open Graph and X (Twitter) card. */
export function shareHead(s: Share) {
  const image = SITE + s.image;
  const tags = [
    `<title>${attr(s.title)}</title>`,
    `<meta name="description" content="${attr(s.description)}">`,
    s.noindex && '<meta name="robots" content="noindex">',
    s.url && `<link rel="canonical" href="${attr(s.url)}">`,
    '<meta property="og:site_name" content="Tokei Zukan">',
    '<meta property="og:type" content="website">',
    `<meta property="og:title" content="${attr(s.heading)}">`,
    `<meta property="og:description" content="${attr(s.description)}">`,
    s.url && `<meta property="og:url" content="${attr(s.url)}">`,
    `<meta property="og:image" content="${attr(image)}">`,
    '<meta property="og:image:type" content="image/jpeg">',
    `<meta property="og:image:width" content="${PREVIEW_W}">`,
    `<meta property="og:image:height" content="${PREVIEW_H}">`,
    `<meta property="og:image:alt" content="${attr(s.imageAlt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${attr(s.heading)}">`,
    `<meta name="twitter:description" content="${attr(s.description)}">`,
    `<meta name="twitter:image" content="${attr(image)}">`,
    `<meta name="twitter:image:alt" content="${attr(s.imageAlt)}">`,
  ];
  return tags.filter(Boolean).join('\n');
}

const START = '<!-- share:start -->', END = '<!-- share:end -->';

/** index.html with its share tags (between the share markers) swapped for another page's. */
export function withShareHead(html: string, s: Share) {
  const a = html.indexOf(START), b = html.indexOf(END);
  if (a < 0 || b < a) throw new Error('index.html is missing its share markers');
  return html.slice(0, a + START.length) + '\n' + shareHead(s) + '\n' + html.slice(b);
}

/** Every page the build writes: a file under dist/ for each catalogue watch address, plus the not-found page. */
export function sharePages() {
  const pages: { file: string; share: Share }[] = [];
  for (const w of CATALOG) {
    const path = watchPath(w.id);
    // /watches/x serves x.html (cleanUrls); /watches/x/ serves x/index.html.
    pages.push({ file: `${path.slice(1)}.html`, share: watchShare(w, 'detail') });
    pages.push({ file: `${path.slice(1)}/index.html`, share: watchShare(w, 'detail') });
    pages.push({ file: `${path.slice(1)}/wrist.html`, share: watchShare(w, 'wrist') });
  }
  pages.push({ file: 'watch-not-found.html', share: notFoundShare });
  return pages;
}

/* ---------- preview images ---------- */

const PAPER = '#ECEBE6', INK = '#151515', MUTED = '#5E5C57', LINE = '#CFCDC6', ACCENT = '#B4432B';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A watch drawing placed with its centre at (cx, cy), scaled so its height is h pixels. */
function placed(w: CatalogWatch, cx: number, cy: number, h: number, strapLen: number) {
  const svg = watchSVG(w, 1, { strapLen });
  const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)![1].split(' ').map(Number);
  const px = h / vh;
  return svg.replace(/^<svg /, `<svg x="${(cx - vw * px / 2).toFixed(1)}" y="${(cy - vh * px / 2).toFixed(1)}" `)
    .replace(/ width="[^"]+" height="[^"]+"/, ` width="${(vw * px).toFixed(1)}" height="${(vh * px).toFixed(1)}"`);
}

/** Splits text into lines of at most `max` characters, at spaces. */
function wrap(text: string, max: number) {
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines.at(-1);
    if (last !== undefined && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  return lines;
}

/** The condensed Archivo heading the site uses, as a horizontally scaled regular-width face. */
const display = (text: string, x: number, y: number, size: number, maxW: number, fill = INK) => {
  // Archivo ExtraBold capitals average about 0.66 em; condensed to 62% like the site's headings.
  const k = .62, width = text.length * size * .66 * k, fit = Math.min(1, maxW / width);
  return `<text transform="translate(${x} ${y}) scale(${(k * fit).toFixed(3)} 1)" font-family="Archivo" font-weight="800" font-size="${size}" fill="${fill}">${esc(text.toUpperCase())}</text>`;
};

const frame = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${PREVIEW_W}" height="${PREVIEW_H}" viewBox="0 0 ${PREVIEW_W} ${PREVIEW_H}">`
  + `<rect width="${PREVIEW_W}" height="${PREVIEW_H}" fill="${PAPER}"/>${body}</svg>`;

/** A watch's preview: the drawing on the left, its name and size on the right, branded and inside crop-safe margins. */
export function previewSVG(w: CatalogWatch) {
  const x = 640, size = [w.diameter, w.lugToLug, w.thickness].filter(n => n !== undefined).join(' × ') + ' mm';
  const model = wrap(w.model, 26).slice(0, 2);
  let s = `<rect x="60" y="40" width="520" height="550" fill="#F3F2EE" stroke="${LINE}"/>` + placed(w, 320, 315, 530, 7);
  s += display('Tokei Zukan', x, 104, 44, 300);
  s += `<line x1="${x}" y1="128" x2="1140" y2="128" stroke="${INK}" stroke-width="2"/>`;
  s += `<text x="${x}" y="200" font-family="IBM Plex Mono" font-weight="500" font-size="26" letter-spacing="3" fill="${MUTED}">${esc(w.brand.toUpperCase())}</text>`;
  s += display(w.ref, x, 318, 128, 500);
  s += model.map((l, i) => `<text x="${x}" y="${378 + i * 46}" font-family="EB Garamond" font-size="40" fill="${INK}">${esc(l)}</text>`).join('');
  s += `<text x="${x}" y="${378 + model.length * 46 + 40}" font-family="IBM Plex Mono" font-size="26" fill="${INK}">${esc(size)}</text>`;
  s += `<line x1="${x}" y1="530" x2="1140" y2="530" stroke="${LINE}" stroke-width="2"/>`;
  s += `<text x="${x}" y="572" font-family="EB Garamond" font-style="italic" font-size="28" fill="${MUTED}">Compare it to scale and see it on your wrist</text>`;
  return frame(s);
}

/** The site's own preview: the name over a row of catalogue watches drawn to the same scale. */
export function homePreviewSVG() {
  const row = ['seiko-spb317', 'baltic-mk2-39-5', 'seiko-srpb43', 'oris-01-733-7707', 'seiko-spb507'].map(id => catalogById.get(id)).filter((w): w is CatalogWatch => !!w);
  const px = 4.3, gap = 1080 / Math.max(row.length, 1);
  let s = display('Tokei Zukan', 60, 128, 104, 700);
  s += `<text x="${62}" y="180" font-family="EB Garamond" font-style="italic" font-size="36" fill="${MUTED}">Explore &amp; compare watches. See how they wear.</text>`;
  s += `<line x1="60" y1="212" x2="1140" y2="212" stroke="${INK}" stroke-width="2"/>`;
  // One scale for all, so their relative sizes are true.
  row.forEach((w, i) => {
    const svg = watchSVG(w, px, { strapLen: 4 });
    const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)![1].split(' ').map(Number);
    s += svg.replace(/^<svg /, `<svg x="${(60 + gap * (i + .5) - vw * px / 2).toFixed(1)}" y="${(400 - vh * px / 2).toFixed(1)}" `);
  });
  s += `<text x="1140" y="600" text-anchor="end" font-family="IBM Plex Mono" font-size="22" fill="${ACCENT}">tokeizukan.com</text>`;
  return frame(s);
}
