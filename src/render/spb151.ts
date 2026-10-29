import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Seiko 6105-reissue "Captain Willard" case and furniture (SPB151, and the SPB257 in its own colours), measured
// from a front-on product photo. Everything is in units of k, the bezel insert's outer radius, except where noted.
// See docs/models/seiko-spb151.md for the reference, specs and remaining approximations.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
type XY = [number, number];

/**
 * Case silhouette traced from the photo, clockwise from the right end of the top edge. Units of k, centred on the
 * dial; the right-hand flank is genuinely fuller than the left. The crown guard swells out from 3 to 4 o'clock and
 * the case is cut back into a recess beneath it, where the crown sits.
 */
// Sparse silhouette landmarks keep the curves smooth and the repeated clip paths compact.
const RIGHT: XY[] = [
  [.69, -1.14], [.88, -.96], [1.01, -.72], [1.08, -.48], [1.12, -.24],
  [1.14, -.04], [1.145, .06], [1.17, .135], [1.23, .20], [1.258, .26], [1.236, .34],
  [1.17, .35], [1.08, .365], [1.01, .40], [.995, .48], [1.01, .60], [1.07, .69],
  [1.02, .79], [.88, .97], [.69, 1.15],
];
const LEFT: XY[] = [
  [-.67, 1.13], [-.84, .93], [-.96, .7], [-1.045, .43], [-1.09, .17], [-1.097, 0],
  [-1.085, -.24], [-1.045, -.48], [-.97, -.7], [-.85, -.94], [-.68, -1.13],
];
const TOP = 1.2075;
/** The dial sits this far above the case's centre (units of k): the bezel is closer to the top edge than the bottom. */
const DROP = .0375;

/** Smooth curve through the points (Catmull-Rom as cubic Béziers), starting from the current point `from`. */
function chain(from: XY, pts: XY[], to: XY, s: (p: XY) => XY) {
  const all = [from, ...pts, to].map(s);
  let d = '';
  for (let i = 0; i < all.length - 1; i++) {
    const p0 = all[Math.max(0, i - 1)], p1 = all[i], p2 = all[i + 1], p3 = all[Math.min(all.length - 1, i + 2)];
    const c1: XY = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: XY = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    if (i === 0) c1[1] = p1[1];
    if (i === all.length - 2) c2[1] = p2[1];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

/** The case path in millimetres. Width (without the guard) is D, end to end is LL. */
export function spb151Case(D: number, LL: number, lw: number) {
  const sx = D / 2.235, sy = LL / (2 * TOP), k = (sx + sy) / 2;
  const s = ([x, y]: XY): XY => [x * sx, (y + DROP) * sy];
  const slot = lw / 2, corner = .35;
  const top = (-TOP + DROP) * sy, bottom = (TOP + DROP) * sy;
  const seatTop = -k * .982, seatBottom = k * .99;
  const right = (slot + corner) / sx, left = -right;
  // Actual open slots, not a solid slab over the strap. The bracelet/strap beneath
  // remains visible all the way from the lug tips to the curved bezel seat.
  const d = `M${f(-slot)},${f(seatTop)}Q0,${f(seatTop + .35)} ${f(slot)},${f(seatTop)}`
    + `V${f(top + corner)}Q${f(slot)},${f(top)} ${f(slot + corner)},${f(top)}`
    + chain([right, -TOP], RIGHT, [right, TOP], s)
    + `Q${f(slot)},${f(bottom)} ${f(slot)},${f(bottom - corner)}V${f(seatBottom)}`
    + `Q0,${f(seatBottom - .35)} ${f(-slot)},${f(seatBottom)}V${f(bottom - corner)}`
    + `Q${f(-slot)},${f(bottom)} ${f(-slot - corner)},${f(bottom)}`
    + chain([left, TOP], LEFT, [left, -TOP], s)
    + `Q${f(-slot)},${f(top)} ${f(-slot)},${f(top + corner)}Z`;
  return { d, k };
}

function defs(id: string, L: FullLook, metal: string, blackSeries: boolean) {
  return `<defs>
<linearGradient id="${id}wst" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfbf6"/><stop offset=".4" stop-color="${L.handColor}"/><stop offset=".56" stop-color="#7e8481"/><stop offset=".7" stop-color="#e2e4e0"/><stop offset="1" stop-color="#9aa09d"/></linearGradient>
<linearGradient id="${id}wlu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${blackSeries ? shade(L.lume, .12) : L.lume}"/><stop offset="1" stop-color="${shade(L.lume, blackSeries ? -.12 : -.1)}"/></linearGradient>
<linearGradient id="${id}wcy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, blackSeries ? -.18 : -.4)}"/><stop offset="${blackSeries ? '.32' : '.3'}" stop-color="${shade(metal, blackSeries ? .38 : .5)}"/><stop offset=".5" stop-color="${shade(metal, blackSeries ? .58 : .75)}"/><stop offset="1" stop-color="${shade(metal, blackSeries ? -.46 : -.35)}"/></linearGradient>
<linearGradient id="${id}wre" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${blackSeries ? '#484e50' : '#686c71'}"/><stop offset=".5" stop-color="${blackSeries ? '#222628' : '#3e4246'}"/><stop offset="1" stop-color="${blackSeries ? '#52585a' : '#5a5e62'}"/></linearGradient>
<linearGradient id="${id}wli" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".28"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
<radialGradient id="${id}wdl" cx="${blackSeries ? '.44' : '.45'}" cy="${blackSeries ? '.38' : '.35'}" r="${blackSeries ? '.82' : '.8'}">${blackSeries ? `<stop stop-color="${shade(L.dial, .05)}"/><stop offset=".62" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.45)}"/>` : `<stop stop-color="${shade(L.dial, .1)}"/><stop offset="1" stop-color="${shade(L.dial, -.12)}"/>`}</radialGradient>${blackSeries ? `\n<linearGradient id="${id}wbe" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="${shade(L.bezel, .13)}"/><stop offset=".6" stop-color="${L.bezel}"/><stop offset="1" stop-color="${shade(L.bezel, -.35)}"/></linearGradient>` : ''}
<pattern id="${id}wbr" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="rotate(46)"><path d="M0,0V.5M.22,0V.5" stroke="#fff" stroke-width=".05" opacity=".12"/><path d="M.11,0V.5M.38,0V.5" stroke="#50554f" stroke-width=".04" opacity=".08"/></pattern>
</defs>`;
}

/**
 * Crown at about 4 o'clock, nestled under the guard: measured 0.97–1.21 k across and 0.33–0.66 k down, so ≈6 mm
 * across with ≈4.6 mm of knurled barrel and a smooth rounded end. Drawn in its own frame, axis at 105°.
 */
function crown(k: number, id: string, metal: string, outline: boolean, stroke: string, blackSeries: boolean) {
  const fill = outline ? 'none' : `url(#${id}wcy)`;
  let s = `<g transform="translate(${f(k * .975)} ${f(k * (.465 + DROP))}) rotate(15)">`;
  if (!outline) s += `<rect x="-1.5" y="-3.1" width="2" height="6.2" fill="${shade(metal, -.55)}"/>`;
  s += `<path d="M0,-3H3.6Q4.6,-3 4.6,0Q4.6,3 3.6,3H0Z" fill="${fill}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -7; i <= 7; i++) { grooves += `M.15,${f(i * .38)}H3.5`; lights += `M.2,${f(i * .38 + .14)}H3.45`; }
    s += `<path d="${grooves}" stroke="${shade(metal, blackSeries ? -.65 : -.55)}" stroke-width="${blackSeries ? '.12' : '.15'}"/><path d="${lights}" stroke="${blackSeries ? '#e2e6e8' : '#fff'}" stroke-width="${blackSeries ? '.05' : '.08'}" opacity="${blackSeries ? '.75' : '.7'}"/>`;
    s += `<path d="M3.62,-2.85Q4.4,-2.7 4.4,0Q4.4,2.7 3.62,2.85" fill="none" stroke="#fff" stroke-width="${blackSeries ? '.22' : '.26'}" opacity="${blackSeries ? '.5' : '.65'}"/><path d="M3.55,-2.9V2.9" stroke="${shade(metal, -.4)}" stroke-width=".12"/>`;
  }
  return s + '</g>';
}

/** Rotating bezel: coarse teeth, black insert with large numerals, minute dots, bars and a lumed pip. */
function bezel(k: number, id: string, L: FullLook, blackSeries: boolean) {
  let rim = '', facets = '';
  if (blackSeries) {
    const teeth = 60, step = 360 / teeth, half = step / 2;
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      rim += `M${pt(k * .995, a - half)}Q${pt(k * 1.044, a - half * .75)} ${pt(k * 1.044, a - half * .45)}L${pt(k * 1.044, a + half * .45)}Q${pt(k * 1.044, a + half * .75)} ${pt(k * .995, a + half)}Z`;
      facets += `M${pt(k * 1.04, a)}L${pt(k * 1.044, a + half * .45)}L${pt(k * .995, a + half)}L${pt(k * 1.015, a + half * .4)}Z`;
    }
  } else {
    // Scalloped machined rim: each tooth has a rounded crest and a shaded facet.
    for (let i = 0; i < 105; i++) {
      const a = i * 360 / 105, half = 180 / 105;
      rim += `M${pt(k * 1.007, a - half)}Q${pt(k * 1.04, a - half * .75)} ${pt(k * 1.047, a - half * .3)}Q${pt(k * 1.06, a)} ${pt(k * 1.047, a + half * .3)}Q${pt(k * 1.04, a + half * .75)} ${pt(k * 1.007, a + half)}Z`;
      facets += `M${pt(k * 1.047, a + half * .3)}L${pt(k * 1.007, a + half)}L${pt(k * 1.019, a + half * .3)}Z`;
    }
  }
  let s = blackSeries
    ? `<circle r="${f(k * 1.02)}" fill="${shade(L.caseColor, -.28)}"/><path d="${rim}" fill="${shade(L.caseColor, .2)}" stroke="${shade(L.caseColor, -.18)}" stroke-width=".045"/><path d="${facets}" fill="#17191c" opacity=".72"/><circle r="${f(k * 1.006)}" fill="none" stroke="${shade(L.caseColor, .34)}" stroke-width=".11"/><circle r="${f(k * .998)}" fill="url(#${id}wbe)"/><circle r="${f(k * .998)}" fill="none" stroke="#858b8f" stroke-width=".08"/>`
    : `<circle r="${f(k * 1.02)}" fill="url(#${id}wcy)"/><path d="${rim}" fill="${shade(L.caseColor, .5)}" stroke="${shade(L.caseColor, -.25)}" stroke-width=".045"/><path d="${facets}" fill="${shade(L.caseColor, -.2)}" opacity=".55"/><circle r="${f(k * .998)}" fill="${L.bezel}"/><circle r="${f(k * .998)}" fill="none" stroke="#d9dcd7" stroke-width=".12"/>`;
  const bt = L.bezelText, orange = L.minuteLume || bt, inner = k * .823;
  let dots = '', orangeDots = '', bars = '', orangeBars = '';
  for (let m = 1; m < 60; m++) {
    const a = m * 6;
    if (m % 10 === 0) continue;
    if (m % 5 === 0) {
      const d = `M${pt(k * .975, a)}L${pt(k * .842, a)}`;
      if (blackSeries && m <= 15) orangeBars += d; else bars += d;
    } else {
      const [x, y] = P(k * .866, a), r = k * .0135;
      const d = `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
      if (blackSeries && m < 20) orangeDots += d; else dots += d;
    }
  }
  s += `<path d="${dots}" fill="${bt}"/>${orangeDots ? `<path d="${orangeDots}" fill="${orange}"/>` : ''}<path d="${bars}" stroke="${bt}" stroke-width="${f(k * .022)}"/>${orangeBars ? `<path d="${orangeBars}" stroke="${orange}" stroke-width="${f(k * .024)}"/>` : ''}`;
  // 12 o'clock: inverted triangle with a lumed pip.
  s += `<path d="M${f(-k * .12)},${f(-k * .99)}H${f(k * .12)}L0,${f(-k * .875)}Z" fill="${blackSeries ? orange : bt}"/><circle cy="${f(-k * .938)}" r="${f(k * .036)}" fill="${L.lume}"${lu('bezel')} stroke="${blackSeries ? shade(orange, -.35) : '#6e736f'}" stroke-width=".1"/>`;
  // Numerals turn with the bezel, tops outward; wide and rounded.
  // Measured: digits 0.124 k tall, centred at 0.904 k, about 0.19 k wide per pair.
  s += `<g fill="${bt}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .173)}" font-weight="400" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40, 50]) {
    const a = v * 6, [x, y] = P(k * .904, a);
    const fillAttr = blackSeries && v <= 20 ? ` fill="${orange}"` : '';
    s += `<text x="${f(x)}" y="${f(y)}"${fillAttr} transform="rotate(${a} ${f(x)} ${f(y)})">${v}</text>`;
  }
  s += '</g>';
  // Dark inner edge between the insert and the rehaut.
  return s + `<circle r="${f((inner + k * .8) / 2)}" fill="none" stroke="#0d0f10" stroke-width="${f(inner - k * .8)}"/>`;
}

/** Sloped grey rehaut with white minute bars, heavier every five minutes. */
function rehaut(k: number, id: string, blackSeries: boolean) {
  let minor = '', major = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6;
    if (i % 5) minor += `M${pt(k * .792, a)}L${pt(k * .752, a)}`; else major += `M${pt(k * .796, a)}L${pt(k * .742, a)}`;
  }
  return `<circle r="${f(k * .7655)}" fill="none" stroke="url(#${id}wre)" stroke-width="${f(k * .069)}"/>`
    + `<path d="${minor}" stroke="${blackSeries ? '#d6dad5' : '#eef0ee'}" stroke-width="${f(k * .009)}"/><path d="${major}" stroke="${blackSeries ? '#f2f4f0' : '#fff'}" stroke-width="${f(k * .02)}"/>`
    + `<circle r="${f(k * .731)}" fill="none" stroke="#2b2e31" stroke-width=".08"/>`;
}

/** Applied indices with polished frames and lume. The 12 is a double shield; 6 and 9 are long bars; 3 is the date. */
function markers(k: number, id: string, blackSeries: boolean) {
  let shadow = '', metal = '', lume = '';
  const add = (a: number, d: string, inset: string) => {
    const t = ` transform="rotate(${a})"`;
    shadow += `<path d="${d}"${t}/>`; metal += `<path d="${d}"${t}/>`; lume += `<path d="${inset}"${t}/>`;
  };
  // Slightly narrower at the inner end, like the reference.
  const block = (r0: number, r1: number, w0: number, w1: number) => `M${f(-w1 / 2)},${f(-r1)}H${f(w1 / 2)}L${f(w0 / 2)},${f(-r0)}H${f(-w0 / 2)}Z`;
  for (let h = 1; h < 12; h++) {
    if (h === 3) continue;
    const long = h === 6 || h === 9;
    const r0 = k * (long ? .472 : .54), r1 = k * .656, w = k * (long ? .118 : .106);
    const m = k * .008;
    add(h * 30, block(r0, r1, w * .94, w), block(r0 + m, r1 - m, w * .94 - 2 * m, w - 2 * m));
  }
  // 12: two bars whose lower ends meet in a shallow V.
  for (const sx of [-1, 1]) {
    const x0 = sx * k * .008, x1 = sx * k * .098, top = -k * .65, bot = -k * .47, v = k * .028;
    const d = `M${f(x0)},${f(top)}H${f(x1)}V${f(bot)}L${f(x0)},${f(bot + v)}Z`;
    const m = k * .008;
    const inset = `M${f(x0 + sx * m)},${f(top + m)}H${f(x1 - sx * m)}V${f(bot - m)}L${f(x0 + sx * m)},${f(bot + v - m * 1.4)}Z`;
    add(0, d, inset);
  }
  const frameFill = blackSeries ? '#7e8682' : `url(#${id}wst)`, frameStroke = blackSeries ? '#d5dbd6' : '#e8eae6', lumeStroke = blackSeries ? '#c9c3b0' : '#87928b';
  return `<g fill="#000" opacity=".35" transform="translate(.1 .14)">${shadow}</g><g fill="${frameFill}" stroke="${frameStroke}" stroke-width=".06">${metal}</g><g fill="url(#${id}wlu)"${lu('indices')} stroke="${lumeStroke}" stroke-width="${blackSeries ? '.04' : '.055'}">${lume}</g>`;
}

/** Hour hand with an arrow tip and short lume, long sword minute hand, needle seconds with a framed lume capsule. */
function hands(k: number, id: string, L: FullLook, blackSeries: boolean) {
  const hw = k * (blackSeries ? .096 : .082), mw = k * (blackSeries ? .062 : .053);
  const hour = `M${f(-hw * .42)},${f(k * .03)}L${f(-hw / 2)},${f(-k * .39)}L${f(-hw * .27)},${f(-k * .444)}H${f(hw * .27)}L${f(hw / 2)},${f(-k * .39)}L${f(hw * .42)},${f(k * .03)}Z`;
  const hourTail = `M${f(-hw * .45)},0V${f(k * .14)}L0,${f(k * .156)}L${f(hw * .45)},${f(k * .14)}V0Z`;
  const hourLume = `M${f(-hw * .3)},${f(-k * .198)}V${f(-k * .38)}L0,${f(-k * .41)}L${f(hw * .3)},${f(-k * .38)}V${f(-k * .198)}Z`;
  const minute = `M${f(-mw * .45)},${f(k * .03)}L${f(-mw / 2)},${f(-k * .65)}L0,${f(-k * .72)}L${f(mw / 2)},${f(-k * .65)}L${f(mw * .45)},${f(k * .03)}Z`;
  const minuteTail = `M${f(-mw * .5)},0V${f(k * .155)}H${f(mw * .5)}V0Z`;
  const minuteLume = blackSeries
    ? `M${f(-mw * .35)},${f(-k * .11)}V${f(-k * .62)}L0,${f(-k * .66)}L${f(mw * .35)},${f(-k * .62)}V${f(-k * .11)}Z`
    : `M${f(-mw * .28)},${f(-k * .12)}V${f(-k * .6)}L0,${f(-k * .63)}L${f(mw * .28)},${f(-k * .6)}V${f(-k * .12)}Z`;
  // Two flat metal faces meet along the blade centre, including the counterweight.
  const brushed = shade(L.handColor, -.28), polished = L.handColor;
  const edgeStroke = blackSeries ? '#939a96' : '#f1f2ee', lumeStroke = blackSeries ? '#8c9288' : '#a9ae9f';
  const hourFace = `M0,${f(-k * .444)}H${f(hw * .27)}L${f(hw / 2)},${f(-k * .39)}L${f(hw * .42)},${f(k * .03)}H0Z M0,0H${f(hw * .45)}V${f(k * .14)}L0,${f(k * .156)}Z`;
  const minuteFace = `M0,${f(-k * .72)}L${f(mw / 2)},${f(-k * .65)}L${f(mw * .45)},${f(k * .03)}H0Z M0,0H${f(mw * .5)}V${f(k * .155)}H0Z`;
  const ha = 303.5, ma = 54.5, sa = 252;
  let s = `<g fill="#000" opacity=".3" transform="translate(.18 .26)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${hourTail}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${minuteTail}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hourTail}" fill="${brushed}" stroke="#6f7571" stroke-width=".05"/><path d="${hour}" fill="${brushed}" stroke="${edgeStroke}" stroke-width=".07"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}wlu)"${lu('hands')} stroke="${lumeStroke}" stroke-width=".05"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minuteTail}" fill="${brushed}" stroke="#6f7571" stroke-width=".05"/><path d="${minute}" fill="${brushed}" stroke="${edgeStroke}" stroke-width=".07"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="${L.minuteLume || `url(#${id}wlu)`}"${lu('hands')} stroke="${lumeStroke}" stroke-width=".05"/></g>`;
  // Seconds: a needle from a long counterweight to just past a framed capsule with the red dot and lume.
  const cw = k * .069, secMetal = blackSeries ? L.handColor : L.accent;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.09,${f(k * .29)}H.09L.05,${f(-k * .62)}H-.05Z" fill="${secMetal}"/>`
    + `<path d="M${f(-cw / 2)},${f(-k * .435)}V${f(-k * .545)}L0,${f(-k * .585)}L${f(cw / 2)},${f(-k * .545)}V${f(-k * .435)}Z" fill="${secMetal}" stroke="#78837b" stroke-width=".06"/>`
    + `<rect x="${f(-cw * .34)}" y="${f(-k * .565)}" width="${f(cw * .68)}" height="${f(k * .075)}" rx="${f(cw * .3)}" fill="${L.lume}"${lu('seconds')}/>`
    + `<circle cy="${f(-k * .462)}" r="${f(k * .023)}" fill="${L.secondsDot || '#d2312a'}" stroke="#eef1df" stroke-width=".06"/></g>`;
  return s + `<circle r="${f(k * .03)}" fill="${blackSeries ? L.handColor : `url(#${id}wst)`}" stroke="${blackSeries ? '#858c86' : '#e6e9e4'}" stroke-width=".07"/><circle r="${f(k * .012)}" fill="#5d6460"/>`;
}

export interface SPB151Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap: case and crown, bezel, rehaut, dial, markers, date, printing and hands. */
export function spb151SVG(o: SPB151Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor, blackSeries = !!L.minuteLume;
  const { d, k } = spb151Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal, blackSeries);
  // The guard and the case below it overlap the crown, which shows through a pocket in the case.
  s += crown(k, id, metal, outline, o.stroke, blackSeries);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(metal, -.3)}" stroke-width=".12"`}/>`;
  if (outline) {
    return s + `<circle r="${f(k * 1.058)}" fill="none" ${o.stroke}/><circle r="${f(k * .731)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }
  // Brushed case with narrow polished edges.
  s += `<defs><clipPath id="${id}wcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}wcc)"><path d="${d}" fill="url(#${id}wbr)"/><path d="${d}" fill="url(#${id}wli)"/><path d="${d}" fill="none" stroke="${shade(metal, blackSeries ? -.45 : -.3)}" stroke-width="${blackSeries ? '.38' : '.8'}"/><path d="${d}" fill="none" stroke="${shade(metal, blackSeries ? .52 : .6)}" stroke-width="${blackSeries ? '.14' : '.3'}"/></g>`;
  s += bezel(k, id, L, blackSeries);
  s += rehaut(k, id, blackSeries);
  s += `<circle r="${f(k * .731)}" fill="url(#${id}wdl)"/>`;
  // Fine printed minute track on the dial, inside the sloped reflective rehaut.
  let ticks = '';
  for (let i = 0; i < 60; i++) ticks += `M${pt(k * .718, i * 6)}L${pt(k * (i % 5 ? .681 : .669), i * 6)}`;
  s += `<path d="${ticks}" fill="none" stroke="#cdd3cc" stroke-width="${f(k * .008)}"/>`;
  s += markers(k, id, blackSeries);
  if (L.date) {
    // Date at 3: framed white aperture with a black numeral.
    const [dx, dy, w, h] = [k * .577, k * .011, k * .15, k * .104];
    s += `<rect x="${f(dx - w / 2 - k * .014)}" y="${f(dy - h / 2 - k * .014)}" width="${f(w + k * .028)}" height="${f(h + k * .028)}" rx=".12" fill="${blackSeries ? '#303532' : `url(#${id}wst)`}" stroke="#6d726f" stroke-width=".05"/><rect x="${f(dx - w / 2)}" y="${f(dy - h / 2)}" width="${f(w)}" height="${f(h)}" fill="#f6f6f2"/><text x="${f(dx)}" y="${f(dy)}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .119)}" textLength="${f(k * .117)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" dominant-baseline="central" fill="#151515">6</text>`;
  }
  // Printing.
  const ink = blackSeries ? '#E4E7DE' : L.bezelText;
  s += `<text y="${f(-k * .262)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .085)}" font-weight="700" textLength="${f(k * .36)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">${esc(o.brand.toUpperCase())}</text>`;
  const xs = k * .042, xy0 = k * .256;
  s += `<g transform="translate(0 ${f(xy0)})"><path d="M${f(xs * .45)},${f(-xs * .8)}H${f(xs * 1.1)}L${f(-xs * .45)},${f(xs * .8)}H${f(-xs * 1.1)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .13)}"/><path d="M${f(-xs * 1.2)},${f(-xs * .8)}H${f(-xs * .3)}L${f(xs * 1.2)},${f(xs * .8)}H${f(xs * .3)}Z" fill="${ink}"/></g>`;
  s += `<g fill="${ink}" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text y="${f(k * .361)}" font-size="${f(k * .042)}" textLength="${f(k * .288)}" lengthAdjust="spacingAndGlyphs">AUTOMATIC</text><text y="${f(k * .432)}" font-size="${f(k * .044)}" font-weight="700" textLength="${f(k * .442)}" lengthAdjust="spacingAndGlyphs">DIVER’S 200m</text></g>`;
  s += hands(k, id, L, blackSeries);
  // Restrained crystal highlight.
  s += `<path d="M${f(-k * .6)},${f(-k * .2)}A${f(k * .73)},${f(k * .73)} 0 0 1 ${f(k * .2)},${f(-k * .6)}A${f(k * .95)},${f(k * .95)} 0 0 0 ${f(-k * .6)},${f(-k * .2)}Z" fill="#fff" opacity=".06"/>`;
  return s;
}
