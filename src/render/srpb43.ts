import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { handRole } from './hands';
import { WORDMARK } from './ssk003';

// Seiko Presage Cocktail Time (SRPB43): a fully polished round case with a wide sloping bezel and slim lugs, a box
// Hardlex crystal over a pressed radial-line dial, faceted dagger indices, a metal-framed date at 3, dauphine hands
// and a blue seconds hand with a hollow diamond counterweight. No lume. Everything is in millimetres, scaled by
// u = D / 40.5. See docs/models/seiko-srpb43.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

/** Radii measured on the reference photo at 15.23 px/mm, for the 40.5 mm case. */
const STEP = 19.9, CRYSTAL = 18.8, DIAL = 17.9;
/** The outer edge of each lug tip, and where its flank joins the case circle. */
const TIP_X = 12, JOIN_Y = 14.2;

/** Round case with slim lugs: each outer flank runs nearly straight from the tip into the case circle. */
export function srpb43Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = D / 40.5;
  const yi = Math.sqrt(R * R - slot * slot), tx = TIP_X * u, jy = JOIN_Y * u, jx = Math.sqrt(R * R - jy * jy);
  const ar = `A${f(R)},${f(R)} 0 0 1`;
  // Points for the lug in the quadrant (sx, sy).
  const q = (sx: number, sy: number) => (x: number, y: number) => `${f(sx * x)},${f(sy * y)}`;
  // Up the inner edge, round the tip and down the flank to the case circle.
  const out = (p: ReturnType<typeof q>, sx: number, sy: number) => `V${f(sy * (H - .5 * u))}Q${p(slot, H)} ${p(slot + .5 * u, H)}H${f(sx * (tx - .5 * u))}Q${p(tx, H)} ${p(tx + .06 * u, H - .55 * u)}`
    + `C${p(tx + .5 * u, H - 3.5 * u)} ${p(jx - .9 * u, jy + 2.2 * u)} ${p(jx, jy)}`;
  // The same lug traced the other way: up the flank, round the tip and back along the inner edge to the case.
  const back = (p: ReturnType<typeof q>, sx: number, sy: number) => `C${p(jx - .9 * u, jy + 2.2 * u)} ${p(tx + .5 * u, H - 3.5 * u)} ${p(tx + .06 * u, H - .55 * u)}`
    + `Q${p(tx, H)} ${p(tx - .5 * u, H)}H${f(sx * (slot + .5 * u))}Q${p(slot, H)} ${p(slot, H - .5 * u)}V${f(sy * yi)}`;
  const tr = q(1, -1), br = q(1, 1), bl = q(-1, 1), tl = q(-1, -1);
  return `M${tr(slot, yi)}${out(tr, 1, -1)}${ar} ${br(jx, jy)}${back(br, 1, 1)}${ar} ${bl(slot, yi)}`
    + `${out(bl, -1, 1)}${ar} ${tl(jx, jy)}${back(tl, -1, -1)}${ar} ${tr(slot, yi)}Z`;
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor, d = L.dial;
  return `<defs>
<radialGradient id="${id}bd" gradientUnits="userSpaceOnUse" cx="-1" cy="-1.5" r="19"><stop stop-color="${shade(d, .3)}"/><stop offset=".45" stop-color="${shade(d, .1)}"/><stop offset="1" stop-color="${shade(d, -.12)}"/></radialGradient>
<linearGradient id="${id}bb" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="${shade(m, .9)}"/><stop offset=".35" stop-color="${shade(m, .6)}"/><stop offset=".5" stop-color="${shade(m, -.2)}"/><stop offset=".6" stop-color="${shade(m, .75)}"/><stop offset=".85" stop-color="${shade(m, .3)}"/><stop offset="1" stop-color="${shade(m, -.3)}"/></linearGradient>
<linearGradient id="${id}bf" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#55646c"/><stop offset=".5" stop-color="#7b8a92"/><stop offset="1" stop-color="#3f4d55"/></linearGradient>
<linearGradient id="${id}bk" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.6)}"/><stop offset=".3" stop-color="${shade(m, .65)}"/><stop offset=".6" stop-color="${shade(m, .15)}"/><stop offset="1" stop-color="${shade(m, -.55)}"/></linearGradient>
</defs>`;
}

/** The 3 o'clock crown: a short neck, a deeply fluted barrel and a smooth domed end, drawn beneath the case. */
function crown(id: string, L: FullLook, u: number, outline: boolean, stroke: string) {
  const m = L.caseColor, x0 = 20 * u, x1 = 20.45 * u, x2 = 23.7 * u, x3 = 24.4 * u, h = 3.3 * u, hn = .95 * u;
  let s = `<path d="M${f(x0)},${f(-hn)}H${f(x1)}V${f(-h)}H${f(x2)}Q${f(x3)},${f(-h + .3 * u)} ${f(x3)},${f(-h + 1.4 * u)}V${f(h - 1.4 * u)}Q${f(x3)},${f(h - .3 * u)} ${f(x2)},${f(h)}H${f(x1)}V${f(hn)}H${f(x0)}Z" fill="${outline ? 'none' : `url(#${id}bk)`}" ${stroke}/>`;
  if (outline) return s;
  let grooves = '', crests = '';
  for (let i = 1; i < 12; i++) grooves += `M${f(x1 + .15 * u)},${f(-h + i * h / 6)}H${f(x2 - .05 * u)}`;
  for (let i = 0; i < 12; i++) crests += `M${f(x1 + .15 * u)},${f(-h + (i + .4) * h / 6)}H${f(x2 - .1 * u)}`;
  s += `<path d="${grooves}" stroke="${shade(m, -.6)}" stroke-width="${f(.16 * u)}"/><path d="${crests}" stroke="#fff" stroke-width="${f(.1 * u)}" opacity=".7"/>`;
  return s + `<path d="M${f(x2 + .2 * u)},${f(-h + .5 * u)}Q${f(x3 - .15 * u)},${f(-h + .9 * u)} ${f(x3 - .2 * u)},${f(-h + 1.6 * u)}V${f(h - 1.6 * u)}" fill="none" stroke="#fff" stroke-width="${f(.22 * u)}" opacity=".75"/>`;
}

/** Mirror-polished case: a dark reflection along each lug's outer flank, a bright line inside it and a polished rim. */
function caseFinish(d: string, H: number, id: string, L: FullLook, u: number) {
  const m = L.caseColor, jx = Math.sqrt((20.25 * u) ** 2 - (JOIN_Y * u) ** 2);
  let flank = '', light = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    flank += `M${f(sx * (TIP_X - .25) * u)},${f(sy * (H - .7 * u))}C${f(sx * (TIP_X + .2) * u)},${f(sy * (H - 3.6 * u))} ${f(sx * (jx - 1.2 * u))},${f(sy * (JOIN_Y + 2.4) * u)} ${f(sx * (jx - .5 * u))},${f(sy * (JOIN_Y + .2) * u)}`;
    light += `M${f(sx * (TIP_X - 1.05) * u)},${f(sy * (H - .6 * u))}C${f(sx * (TIP_X - .7) * u)},${f(sy * (H - 3.6 * u))} ${f(sx * (jx - 2 * u))},${f(sy * (JOIN_Y + 2.6) * u)} ${f(sx * (jx - 1.6 * u))},${f(sy * (JOIN_Y + .9) * u)}`;
  }
  return `<defs><clipPath id="${id}bcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}bcc)">`
    + `<path d="${flank}" fill="none" stroke="${shade(m, -.45)}" stroke-width="${f(.9 * u)}" opacity=".45"/><path d="${light}" fill="none" stroke="#fff" stroke-width="${f(.35 * u)}" opacity=".85"/>`
    + `<path d="${d}" fill="none" stroke="#fff" stroke-width=".35" opacity=".6"/><path d="${d}" fill="none" stroke="${shade(m, -.4)}" stroke-width=".18"/></g>`;
}

/** The wide polished bezel sloping to the box crystal, and the crystal's dark refracted edge over the dial rim. */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor;
  let s = `<circle r="${STEP}" fill="url(#${id}bb)" stroke="${shade(m, -.35)}" stroke-width=".1"/>`;
  s += `<circle r="${CRYSTAL}" fill="url(#${id}bf)" stroke="${shade(m, -.7)}" stroke-width=".12"/>`;
  return s + `<circle r="${f(CRYSTAL - .2)}" fill="none" stroke="#fff" stroke-width=".1" opacity=".5"/>`;
}

/** The pressed dial: fine radial lines with a starburst of brighter rays, darkening towards the rim. */
function dial(id: string, L: FullLook) {
  let ridges = '', fine = '', rays = '';
  // Pressed ridges every 3°, finer lines between them further out, and brighter rays. Each line starts at a slightly
  // different radius (a golden-ratio scatter), so the texture thins towards the hub instead of stopping in rings.
  const start = (i: number, r0: number, spread: number) => r0 + ((i * .618034) % 1) * spread;
  for (let i = 0; i < 120; i++) ridges += `M${pt(start(i, 1.3, 3.2), i * 3)}L${pt(DIAL, i * 3)}`;
  for (let i = 0; i < 120; i++) fine += `M${pt(start(i + 7, 5, 5), i * 3 + 1.5)}L${pt(DIAL, i * 3 + 1.5)}`;
  for (let i = 0; i < 60; i++) rays += `M${pt(start(i + 3, 1.3, 2.6), i * 6 + 1.8)}L${pt(DIAL, i * 6 + 1.2)}L${pt(DIAL, i * 6 + 2.4)}Z`;
  return `<circle r="${DIAL}" fill="url(#${id}bd)"/><path d="${rays}" fill="#fff" opacity=".28"/>`
    + `<path d="${ridges}" stroke="${shade(L.dial, -.48)}" stroke-width=".09" opacity=".6"/><path d="${fine}" stroke="${shade(L.dial, -.4)}" stroke-width=".06" opacity=".45"/>`;
}

/** Printed minute track: a long tick on each minute and four short ones between, hidden where an index sits. */
function track() {
  let long = '', short = '';
  for (let i = 0; i < 300; i++) {
    if (i % 25 === 0) continue;
    const a = i * 1.2;
    if (i % 5 === 0) long += `M${pt(15.9, a)}L${pt(16.95, a)}`;
    else short += `M${pt(16.35, a)}L${pt(16.95, a)}`;
  }
  return `<path d="${long}" stroke="#1b2433" stroke-width=".15"/><path d="${short}" stroke="#1b2433" stroke-width=".09"/>`;
}

/** Applied faceted daggers pointing in (a wider one at 12 and 6), and a short arrow at 3 pointing out past the date. */
function indices(L: FullLook) {
  const m = L.caseColor;
  let lit = '', dark = '', shadow = '';
  for (let h = 0; h < 12; h++) {
    const a = h * 30, t = a * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
    // Points in the index's own frame (x across, y outward from the centre), turned to its hour.
    const at = (x: number, r: number) => `${f(x * c + r * sn)},${f(x * sn - r * c)}`;
    let left: string, right: string, outline: string;
    if (h === 3) {
      left = `M${at(0, 13.7)}L${at(-.7, 13.7)}L${at(-.7, 16.4)}L${at(0, 17.1)}Z`;
      right = `M${at(0, 13.7)}L${at(.7, 13.7)}L${at(.7, 16.4)}L${at(0, 17.1)}Z`;
      outline = `M${at(-.7, 13.7)}L${at(-.7, 16.4)}L${at(0, 17.1)}L${at(.7, 16.4)}L${at(.7, 13.7)}Z`;
    } else {
      const w = h % 6 === 0 ? .8 : .62, r0 = h % 3 === 0 ? 10.8 : 11.2;
      left = `M${at(0, r0)}L${at(-w, 16.3)}L${at(-w * .45, 17)}L${at(0, 17)}Z`;
      right = `M${at(0, r0)}L${at(w, 16.3)}L${at(w * .45, 17)}L${at(0, 17)}Z`;
      outline = `M${at(0, r0)}L${at(-w, 16.3)}L${at(-w * .45, 17)}L${at(w * .45, 17)}L${at(w, 16.3)}Z`;
    }
    // Light comes from the upper left: the facet facing it is bright.
    if (c + sn > 0) { lit += left; dark += right; } else { lit += right; dark += left; }
    shadow += outline;
  }
  return `<path d="${shadow}" fill="#000" opacity=".25" transform="translate(.12 .16)"/><path d="${lit}" fill="${shade(m, .75)}"/>`
    + `<path d="${dark}" fill="${shade(m, -.32)}"/><path d="${shadow}" fill="none" stroke="${shade(m, -.6)}" stroke-width=".05"/>`;
}

function rrect(x: number, y: number, w: number, h: number, r: number) {
  return `M${f(x + r)},${f(y)}H${f(x + w - r)}Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)}V${f(y + h - r)}Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)}H${f(x + r)}Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)}V${f(y + r)}Q${f(x)},${f(y)} ${f(x + r)},${f(y)}Z`;
}

/** Polished applied frame round a white date wheel with a black numeral. */
function date(L: FullLook) {
  if (!L.date) return '';
  const m = L.caseColor, cx = 11.05, w = 4.1, h = 3.2;
  let s = `<path d="${rrect(cx - w / 2 + .1, -h / 2 + .14, w, h, .4)}" fill="#000" opacity=".22"/>`;
  s += `<path d="${rrect(cx - w / 2, -h / 2, w, h, .4)}" fill="${shade(m, .55)}" stroke="${shade(m, -.6)}" stroke-width=".06"/>`;
  s += `<path d="M${f(cx - w / 2 + .33)},${f(h / 2 - .33)}V${f(-h / 2 + .33)}H${f(cx + w / 2 - .33)}" fill="none" stroke="${shade(m, -.35)}" stroke-width=".12"/>`;
  s += `<path d="${rrect(cx - w / 2 + .33, -h / 2 + .33, w - .66, h - .66, .15)}" fill="#f3f4f2" stroke="${shade(m, -.5)}" stroke-width=".05"/>`;
  return s + `<text font-family="Helvetica,Arial,sans-serif" font-size="2.25" text-anchor="middle" dominant-baseline="central" fill="#151515" transform="translate(${f(cx)} .08) scale(1.3 1)">6</text>`;
}

/** Applied SEIKO, printed PRESAGE and AUTOMATIC, and the small print either side of 6. */
function printing(L: FullLook) {
  const m = L.caseColor, ink = '#16202c', edge = shade(m, -.7), h = 1.32, sx = 7.9 / WORDMARK.width;
  // SEIKO in applied steel: a dark edge, a bright rim catching the light on the upper left, then the darker faces.
  const face = shade(m, -.3), rim = shade(m, .75);
  let s = `<g transform="translate(-3.95 -7.85) scale(${f(sx)} ${f(h)})"><path d="${WORDMARK.s}" fill="none" stroke="${edge}" stroke-width=".32"/><path d="${WORDMARK.fill}" fill="${edge}" fill-rule="evenodd" stroke="${edge}" stroke-width=".1"/>`
    + `<g transform="translate(-.018 -.035)"><path d="${WORDMARK.fill}" fill="${rim}" fill-rule="evenodd"/><path d="${WORDMARK.s}" fill="none" stroke="${rim}" stroke-width=".2"/></g>`
    + `<path d="${WORDMARK.fill}" fill="${face}" fill-rule="evenodd"/><path d="${WORDMARK.s}" fill="none" stroke="${face}" stroke-width=".2"/></g>`;
  s += `<g font-family="'Times New Roman',Times,serif" text-anchor="middle" dominant-baseline="central" fill="${ink}">`
    + `<text y="7.15" font-size="1.12" textLength="6.1" lengthAdjust="spacingAndGlyphs">PRESAGE</text>`
    + `<text y="8.5" font-size=".76" textLength="5.6" lengthAdjust="spacingAndGlyphs">AUTOMATIC</text></g>`;
  const small = (t: string, a: number, len: number) => {
    const [x, y] = P(15.2, a);
    return `<text x="${f(x)}" y="${f(y)}" transform="rotate(${f(a - 180)} ${f(x)} ${f(y)})" textLength="${len}" lengthAdjust="spacingAndGlyphs">${t}</text>`;
  };
  return s + `<g font-family="Arial,Helvetica,sans-serif" font-size=".42" text-anchor="middle" dominant-baseline="central" fill="${ink}" opacity=".85">${small('MADE IN JAPAN', 195, 2.9)}${small('4R35-01M2 R 2', 164, 2.5)}</g>`;
}

/** Faceted dauphine hour and minute hands, and the blue seconds hand with a hollow diamond counterweight. */
function hands(L: FullLook) {
  const ha = 305, ma = 52, sa = 252, m = L.caseColor, blue = '#1d3d6e';
  // A dauphine blade from tip to a pointed tail, split down its ridge into a bright and a dark facet.
  const dauphine = (len: number, w: number, at: number, tail: number) => ({
    len,
    whole: `M0,${-len}L${w / 2},${-at}L${f(w * .32)},.4L0,${tail}L${f(-w * .32)},.4L${-w / 2},${-at}Z`,
    left: `M0,${-len}L${-w / 2},${-at}L${f(-w * .32)},.4L0,${tail}Z`,
  });
  const hr = dauphine(10.1, 1.45, 2, 2.4), mn = dauphine(16.8, 1.3, 2.4, 2.3);
  const blade = (d: ReturnType<typeof dauphine>, role: 'hour' | 'minute', a: number) =>
    `<g ${handRole(role)}transform="rotate(${a})"><path d="${d.whole}" fill="${shade(m, -.32)}" stroke="${shade(m, -.6)}" stroke-width=".05"/><path d="${d.left}" fill="${shade(m, .2)}"/><path d="M0,${-d.len}V.3" stroke="#fff" stroke-width=".05" opacity=".6"/></g>`;
  let s = `<g fill="#000" opacity=".22" transform="translate(.2 .28)"><path d="${hr.whole}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${mn.whole}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += blade(hr, 'hour', ha) + blade(mn, 'minute', ma);
  // Seconds: a fine needle to the track, and a hollow diamond on the short tail.
  const diamond = 'M0,3.4L.45,4.4L0,5.4L-.45,4.4Z';
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.09,3.4H.09L.035,-15.9H-.035Z" fill="${blue}"/><path d="${diamond}" fill="none" stroke="${blue}" stroke-width=".16" stroke-linejoin="round"/></g>`;
  return s + `<circle r=".62" fill="${blue}"/><circle r=".34" fill="none" stroke="${shade(m, .4)}" stroke-width=".09"/><circle r=".15" fill="${shade(m, -.5)}"/>`;
}

export interface SRPB43Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Seiko Presage Cocktail Time SRPB43. */
export function srpb43SVG(o: SRPB43Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = srpb43Case(D, LL, lw), u = D / 40.5;
  let s = outline ? '' : defs(id, L);
  s += crown(id, L, u, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(L.caseColor, -.35)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(CRYSTAL * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += caseFinish(d, LL / 2, id, L, u);
  // The bezel and dial are drawn at the 40.5 mm size and scaled with the case.
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L);
  s += dial(id, L);
  s += track();
  s += indices(L);
  s += date(L);
  s += printing(L);
  s += hands(L);
  // The box crystal: a soft reflection across the upper left.
  s += `<path d="M-14.5,-6A15.8,15.8 0 0 1 -6,-14.5A18.2,18.2 0 0 0 -14.5,-6Z" fill="#fff" opacity=".12"/>`;
  return s + '</g>';
}
