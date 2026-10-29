import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P, ringSeg } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Seiko 1968 Heritage Diver's GMT (SPB519): related case, 24-hour chapter and GMT furniture.
// Furniture is sized in units of k, the bezel insert's outer radius. The case is in millimetres.
// See docs/models/seiko-spb519.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

/** Rounded 1968 shoulders, with the catalogue lug span and open 20 mm attachment. */
export function spb519Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = D / 42, k = R / 1.045;
  const seat = k * .975;
  const corner = (sx: number, sy: number) => {
    const p = (x: number, y: number) => `${f(sx * x)},${f(sy * y)}`;
    return `M${p(slot, -seat)}V${f(sy * (-H + .25 * u))}Q${p(slot, -H)} ${p(slot + .25 * u, -H + .1 * u)}`
      + `C${p(slot + 2.7 * u, -H + 1.1 * u)} ${p(slot + 4.2 * u, -H + 2 * u)} ${p(slot + 5 * u, -H + 4 * u)}`
      + `L${p(R * .94, -R * .34)}Q${p(R, -R * .17)} ${p(R, 0)}`;
  };
  // Walk the four shoulders as one closed outline, without internal seams.
  const p = (x: number, y: number) => `${f(x)},${f(y)}`;
  const lowerRight = `Q${p(R, R * .17)} ${p(R * .94, R * .34)}L${p(slot + 5 * u, H - 4 * u)}`
    + `C${p(slot + 4.2 * u, H - 2 * u)} ${p(slot + 2.7 * u, H - 1.1 * u)} ${p(slot + .25 * u, H - .1 * u)}`
    + `Q${p(slot, H)} ${p(slot, H - .25 * u)}V${f(seat)}`;
  const upperLeft = `Q${p(-R, -R * .17)} ${p(-R * .94, -R * .34)}L${p(-slot - 5 * u, -H + 4 * u)}`
    + `C${p(-slot - 4.2 * u, -H + 2 * u)} ${p(-slot - 2.7 * u, -H + 1.1 * u)} ${p(-slot - .25 * u, -H + .1 * u)}`
    + `Q${p(-slot, -H)} ${p(-slot, -H + .25 * u)}V${f(-seat)}`;
  const d = corner(1, 1) + lowerRight + `Q0,${f(seat - .4 * u)} ${p(-slot, seat)}`
    + corner(-1, -1).replace(/^M[^V]+/, '') + upperLeft
    + `Q0,${f(-seat + .4 * u)} ${p(slot, -seat)}Z`;
  return { d, k };
}

function defs(id: string, L: FullLook) {
  return `<defs>
<linearGradient id="${id}gm" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7f8f4"/><stop offset=".4" stop-color="${L.handColor}"/><stop offset=".58" stop-color="#747d7b"/><stop offset=".75" stop-color="#e2e6e2"/><stop offset="1" stop-color="#929b98"/></linearGradient>
<linearGradient id="${id}gl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.09)}"/></linearGradient>
<linearGradient id="${id}gc" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(L.caseColor, -.42)}"/><stop offset=".28" stop-color="${shade(L.caseColor, .45)}"/><stop offset=".5" stop-color="${shade(L.caseColor, .72)}"/><stop offset="1" stop-color="${shade(L.caseColor, -.38)}"/></linearGradient>
<linearGradient id="${id}gb" x1="0" y1="1" x2="1" y2="0"><stop stop-color="${shade(L.bezel, .08)}"/><stop offset=".55" stop-color="${L.bezel}"/><stop offset="1" stop-color="${shade(L.bezel, -.32)}"/></linearGradient>
<linearGradient id="${id}gr" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1f3ef"/><stop offset=".28" stop-color="#aab2b0"/><stop offset=".52" stop-color="#e0e4e0"/><stop offset=".8" stop-color="#949d9b"/><stop offset="1" stop-color="#d9ddda"/></linearGradient>
<radialGradient id="${id}gd" cx=".43" cy=".35" r=".8"><stop stop-color="${shade(L.dial, .22)}"/><stop offset=".58" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.12)}"/></radialGradient>
<pattern id="${id}gh" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="rotate(48)"><path d="M0,0V.5M.22,0V.5" stroke="#fff" stroke-width=".05" opacity=".08"/><path d="M.11,0V.5M.38,0V.5" stroke="#4e5554" stroke-width=".04" opacity=".06"/></pattern>
</defs>`;
}

/** Screw-down crown at 4 o'clock, with a dark seat, rounded end and fine transverse grooves. */
function crown(R: number, id: string, L: FullLook, outline: boolean, stroke: string) {
  const angle = ({ 3: 0, 4: 30, 9: -90 } as Record<string, number>)[L.crown] ?? 30;
  const h = 3.3, proud = 3.6;
  let s = `<g transform="rotate(${angle}) translate(${f(R - .35)} 0)">`;
  if (!outline) s += `<rect x="-.65" y="${f(-h + .15)}" width="1.3" height="${f((h - .15) * 2)}" rx=".4" fill="${shade(L.caseColor, -.52)}"/>`;
  s += `<path d="M0,${-h}H${f(proud - 1.15)}Q${proud},${-h} ${proud},0Q${proud},${h} ${f(proud - 1.15)},${h}H0Z" fill="${outline ? 'none' : `url(#${id}gc)`}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -8; i <= 8; i++) {
      grooves += `M.2,${f(i * .36)}H${f(proud - 1.25)}`;
      lights += `M.25,${f(i * .36 + .12)}H${f(proud - 1.3)}`;
    }
    s += `<path d="${grooves}" stroke="${shade(L.caseColor, -.55)}" stroke-width=".13"/><path d="${lights}" stroke="#fff" stroke-width=".07" opacity=".75"/>`;
    s += `<path d="M${f(proud - .15)},${f(-h + .35)}Q${f(proud - .15)},0 ${f(proud - .15)},${f(h - .35)}" fill="none" stroke="#fff" stroke-width=".28" opacity=".7"/>`;
  }
  return s + '</g>';
}

/** Coin-edge steel bezel and blue ceramic 60-minute insert. */
function bezel(k: number, id: string, L: FullLook) {
  let crests = '', facets = '';
  const teeth = 60, step = 360 / teeth, toothHalf = step / 2;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    // Broad, shallow crest plateaus and rounded shoulders, not fine pointed scallops.
    crests += `M${pt(k * .995, a - toothHalf)}Q${pt(k * 1.044, a - toothHalf * .75)} ${pt(k * 1.044, a - toothHalf * .45)}L${pt(k * 1.044, a + toothHalf * .45)}Q${pt(k * 1.044, a + toothHalf * .75)} ${pt(k * .995, a + toothHalf)}Z`;
    facets += `M${pt(k * 1.04, a)}L${pt(k * 1.044, a + toothHalf * .45)}L${pt(k * .995, a + toothHalf)}L${pt(k * 1.015, a + toothHalf * .4)}Z`;
  }
  let s = `<circle r="${f(k * 1.02)}" fill="url(#${id}gc)"/><path d="${crests}" fill="${shade(L.caseColor, .55)}" stroke="${shade(L.caseColor, -.22)}" stroke-width=".06"/><path d="${facets}" fill="${shade(L.caseColor, -.3)}" opacity=".65"/>`;
  s += `<circle r="${f(k * 1.008)}" fill="none" stroke="#f4f5f2" stroke-width=".16"/><circle r="${f(k * .998)}" fill="url(#${id}gb)"/><circle r="${f(k * .998)}" fill="none" stroke="#d5dbd9" stroke-width=".1"/>`;
  let dots = '', bars = '';
  for (let m = 1; m < 60; m++) {
    if (m % 10 === 0) continue;
    const a = m * 6;
    if (m % 5 === 0) bars += `M${pt(k * .972, a)}L${pt(k * .835, a)}`;
    else {
      const [x, y] = P(k * .868, a), r = k * .014;
      dots += `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
    }
  }
  s += `<path d="${dots}" fill="${L.bezelText}"/><path d="${bars}" stroke="${L.bezelText}" stroke-width="${f(k * .026)}"/>`;
  const base = k * .985, tip = k * .825, half = k * .115;
  s += `<path d="M${f(-half)},${f(-base)}H${f(half)}L0,${f(-tip)}Z" fill="${L.bezelText}"/>`;
  s += `<circle cy="${f(-k * .935)}" r="${f(k * .036)}" fill="${L.lume}"${lu('bezel')} stroke="#263b40" stroke-width="${f(k * .012)}"/>`;
  s += `<g fill="${L.bezelText}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .17)}" font-weight="400" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40, 50]) {
    const a = v * 6, [x, y] = P(k * .9, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(1.08 .84) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  return s + '</g>';
}

/** Sloping 24-hour rehaut, dark odd-hour numerals and the inner minute track. */
function chapter(k: number, id: string) {
  let s = `<circle r="${f(k * .791)}" fill="none" stroke="#e8ece8" stroke-width=".12"/><circle r="${f(k * .779)}" fill="none" stroke="#283334" stroke-width="${f(k * .018)}"/>`;
  s += `<path d="${ringSeg(k * .774, k * .677, 0, 359.999)}" fill="url(#${id}gr)"/><circle r="${f(k * .774)}" fill="none" stroke="#f4f5f1" stroke-width=".1"/><circle r="${f(k * .679)}" fill="none" stroke="#555f5d" stroke-width=".1"/>`;
  let triangles = '';
  for (let h = 0; h < 24; h += 2) {
    const a = h * 15;
    triangles += `M${pt(k * .754, a - 1.25)}L${pt(k * .754, a + 1.25)}L${pt(k * .725, a)}Z`;
  }
  s += `<path d="${triangles}" fill="#303938"/>`;
  s += `<g fill="#343c3b" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .043)}" text-anchor="middle" dominant-baseline="central">`;
  for (let h = 1; h < 24; h += 2) {
    const a = h * 15, [x, y] = P(k * .707, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)})">${h}</text>`;
  }
  s += '</g>';
  let minor = '', major = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6;
    if (i % 5) minor += `M${pt(k * .674, a)}L${pt(k * .635, a)}`;
    else major += `M${pt(k * .674, a)}L${pt(k * .617, a)}`;
  }
  s += `<path d="${minor}" stroke="#343c3b" stroke-width="${f(k * .008)}"/><path d="${major}" stroke="#283130" stroke-width="${f(k * .018)}"/>`;
  return s;
}

function rrect(x: number, y: number, w: number, h: number, r: number) {
  const x2 = x + w, y2 = y + h, rr = Math.min(r, w / 2, h / 2);
  return `M${f(x + rr)},${f(y)}H${f(x2 - rr)}Q${f(x2)},${f(y)} ${f(x2)},${f(y + rr)}V${f(y2 - rr)}Q${f(x2)},${f(y2)} ${f(x2 - rr)},${f(y2)}H${f(x + rr)}Q${f(x)},${f(y2)} ${f(x)},${f(y2 - rr)}V${f(y + rr)}Q${f(x)},${f(y)} ${f(x + rr)},${f(y)}Z`;
}

/** Circular plots, cardinal batons and the divided shield at 12. */
function markers(k: number, id: string) {
  let shadows = '', frames = '', lume = '';
  for (const h of [1, 2, 4, 5, 7, 8, 10, 11]) {
    const [x, y] = P(k * .55, h * 30), r = k * .056;
    shadows += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
    frames += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#78837f" stroke="#505c58" stroke-width=".07"/>`;
    lume += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - k * .012)}" fill="url(#${id}gl)"${lu('indices')}/>`;
  }
  const addBar = (a: number, w: number, outer: number, inner: number) => {
    const x = -w / 2, y = -outer, h = outer - inner, t = ` transform="rotate(${a})"`;
    const d = rrect(x, y, w, h, k * .006), m = k * .012;
    shadows += `<path d="${d}"${t}/>`;
    frames += `<path d="${d}"${t} fill="#78837f" stroke="#505c58" stroke-width=".07"/>`;
    lume += `<path d="${rrect(x + m, y + m, w - 2 * m, h - 2 * m, k * .003)}"${t} fill="url(#${id}gl)"${lu('indices')}/>`;
  };
  addBar(90, k * .112, k * .635, k * .45);
  addBar(270, k * .112, k * .635, k * .45);
  addBar(180, k * .087, k * .65, k * .45);
  const shield = `M${f(-k * .073)},${f(-k * .63)}H${f(k * .073)}L${f(k * .068)},${f(-k * .47)}L0,${f(-k * .425)}L${f(-k * .068)},${f(-k * .47)}Z`;
  const shieldLume = `M${f(-k * .052)},${f(-k * .607)}H${f(k * .052)}L${f(k * .048)},${f(-k * .482)}L0,${f(-k * .45)}L${f(-k * .048)},${f(-k * .482)}Z`;
  shadows += `<path d="${shield}"/>`;
  frames += `<path d="${shield}" fill="#78837f" stroke="#505c58" stroke-width=".07"/>`;
  lume += `<path d="${shieldLume}" fill="url(#${id}gl)"${lu('indices')}/><path d="M0,${f(-k * .615)}V${f(-k * .445)}" stroke="#75807a" stroke-width="${f(k * .009)}"/>`;
  return `<g fill="#000" opacity=".25" transform="translate(.08 .12)">${shadows}</g>${frames}${lume}`;
}

/** White rectangular date aperture at 4:30; the frame and numeral follow its angled orientation. */
function date(k: number, id: string, L: FullLook) {
  if (!L.date) return '';
  const [x, y] = P(k * .565, 135);
  const w = k * .13, h = k * .105;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(45)"><path d="${rrect(-w / 2 - k * .009, -h / 2 - k * .009, w + k * .018, h + k * .018, k * .012)}" fill="url(#${id}gm)" stroke="#68726f" stroke-width=".06"/><path d="${rrect(-w / 2, -h / 2, w, h, k * .006)}" fill="#F7F7F2"/><text font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .095)}" text-anchor="middle" dominant-baseline="central" fill="#252D2D">6</text></g>`;
}

function printing(k: number, L: FullLook, brand: string) {
  const ink = '#252d2d', xs = k * .037;
  let s = `<text y="${f(-k * .27)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .079)}" textLength="${f(k * .3)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">${esc(brand.toUpperCase())}</text>`;
  s += `<g transform="translate(0 ${f(-k * .185)})"><path d="M${f(xs * .45)},${f(-xs)}H${f(xs * 1.1)}L${f(-xs * .45)},${f(xs)}H${f(-xs * 1.1)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .16)}"/><path d="M${f(-xs * 1.2)},${f(-xs)}H${f(-xs * .3)}L${f(xs * 1.2)},${f(xs)}H${f(xs * .3)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .16)}"/></g>`;
  s += `<g text-anchor="middle" font-family="Arial,Helvetica,sans-serif"><text y="${f(k * .235)}" font-size="${f(k * .045)}" fill="${L.accent}">GMT</text><text y="${f(k * .315)}" font-size="${f(k * .041)}" textLength="${f(k * .47)}" lengthAdjust="spacingAndGlyphs" fill="${ink}">AUTOMATIC 3 DAYS</text><text y="${f(k * .385)}" font-size="${f(k * .045)}" textLength="${f(k * .43)}" lengthAdjust="spacingAndGlyphs" fill="${ink}">DIVER’S 300m</text></g>`;
  return s;
}

/** Red open-arrow GMT hand below the steel hour/minute set and the red-dot seconds needle. */
function hands(k: number, id: string, L: FullLook) {
  const hw = k * .108, mw = k * .064;
  const hour = `M${f(-hw * .43)},${f(k * .02)}L${f(-hw / 2)},${f(-k * .4)}L${f(-hw * .3)},${f(-k * .46)}H${f(hw * .3)}L${f(hw / 2)},${f(-k * .4)}L${f(hw * .43)},${f(k * .02)}Z`;
  const hourTail = `M${f(-hw * .46)},0V${f(k * .135)}L0,${f(k * .155)}L${f(hw * .46)},${f(k * .135)}V0Z`;
  const hourLume = `M${f(-hw * .3)},${f(-k * .18)}V${f(-k * .37)}L0,${f(-k * .425)}L${f(hw * .3)},${f(-k * .37)}V${f(-k * .18)}Z`;
  const minute = `M${f(-mw * .45)},${f(k * .02)}L${f(-mw / 2)},${f(-k * .58)}L0,${f(-k * .65)}L${f(mw / 2)},${f(-k * .58)}L${f(mw * .45)},${f(k * .02)}Z`;
  const minuteTail = `M${f(-mw * .5)},0V${f(k * .14)}H${f(mw * .5)}V0Z`;
  const minuteLume = `M${f(-mw * .27)},${f(-k * .1)}V${f(-k * .55)}L0,${f(-k * .60)}L${f(mw * .27)},${f(-k * .55)}V${f(-k * .1)}Z`;
  const brushed = shade(L.handColor, -.28), polished = L.handColor;
  const hourFace = `M0,${f(-k * .46)}H${f(hw * .3)}L${f(hw / 2)},${f(-k * .4)}L${f(hw * .43)},${f(k * .02)}H0Z M0,0H${f(hw * .46)}V${f(k * .135)}L0,${f(k * .155)}Z`;
  const minuteFace = `M0,${f(-k * .65)}L${f(mw / 2)},${f(-k * .58)}L${f(mw * .45)},${f(k * .02)}H0Z M0,0H${f(mw * .5)}V${f(k * .14)}H0Z`;
  const ha = 303, ma = 52, sa = 252, ga = 212;
  // The open triangle sits inside the dial; a fine red needle continues from its tip to the track.
  let s = `<g ${handRole('hour24')}transform="rotate(${ga})"><path d="M${f(-k * .009)},${f(k * .08)}H${f(k * .009)}V${f(-k * .66)}H${f(-k * .009)}Z" fill="${L.accent}"/><path d="M${f(-k * .062)},${f(-k * .40)}L0,${f(-k * .62)}L${f(k * .062)},${f(-k * .40)}Z" fill="${L.dial}" stroke="${L.accent}" stroke-width="${f(k * .014)}" stroke-linejoin="miter"/></g>`;
  s += `<g fill="#000" opacity=".25" transform="translate(.16 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${hourTail}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${minuteTail}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hourTail}" fill="${brushed}"/><path d="${hour}" fill="${brushed}" stroke="#f2f3f0" stroke-width=".06"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}gl)"${lu('hands')} stroke="#a8b0a5" stroke-width=".05"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minuteTail}" fill="${brushed}"/><path d="${minute}" fill="${brushed}" stroke="#f2f3f0" stroke-width=".06"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="url(#${id}gl)"${lu('hands')} stroke="#a8b0a5" stroke-width=".05"/></g>`;
  const capY = -k * .615, capH = k * .105, cw = k * .028;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M${f(-k * .004)},${f(k * .17)}H${f(k * .004)}L${f(k * .0025)},${f(-k * .69)}H${f(-k * .0025)}Z" fill="${L.handColor}"/><path d="${rrect(-cw, capY, cw * 2, capH, cw * .35)}" fill="url(#${id}gm)" stroke="#66716d" stroke-width=".05"/><path d="${rrect(-cw * .65, capY + k * .012, cw * 1.3, capH - k * .024, cw * .2)}" fill="${L.lume}"${lu('seconds')}/><circle cy="${f(-k * .535)}" r="${f(k * .022)}" fill="${L.accent}" stroke="#f4f2e8" stroke-width=".04"/></g>`;
  return s + `<circle r="${f(k * .029)}" fill="url(#${id}gm)" stroke="#e4e7e3" stroke-width=".06"/><circle r="${f(k * .011)}" fill="#5c6462"/>`;
}

export interface SPB519Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the 1968 Heritage Diver's GMT. */
export function spb519SVG(o: SPB519Options) {
  const { D, LL, lw, id, L, outline } = o;
  const { d, k } = spb519Case(D, LL, lw);
  let s = outline ? '' : defs(id, L);
  // Seat the crown beneath the case: the metal masks its root instead of letting the seat
  // and inner grooves show through on top of the case. The exposed barrel remains visible.
  s += crown(D / 2, id, L, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(L.caseColor, -.28)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(k * 1.04)}" fill="none" ${o.stroke}/><circle r="${f(k * .779)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  const u = D / 42, slot = lw / 2, H = LL / 2, R = D / 2;
  const facet = `M${f(slot + .1 * u)},${f(-H + .1 * u)}C${f(slot + 2.7 * u)},${f(-H + 1.1 * u)} ${f(slot + 4.2 * u)},${f(-H + 2 * u)} ${f(slot + 5 * u)},${f(-H + 4 * u)}L${f(R * .94)},${f(-R * .34)}L${f(R * .84)},${f(-R * .49)}C${f(slot + 4 * u)},${f(-H + 4.7 * u)} ${f(slot + 2.7 * u)},${f(-H + 2 * u)} ${f(slot + .1 * u)},${f(-H + .95 * u)}Z`;
  const facetEdge = `M${f(slot + .1 * u)},${f(-H + .95 * u)}C${f(slot + 2.7 * u)},${f(-H + 2 * u)} ${f(slot + 4 * u)},${f(-H + 4.7 * u)} ${f(R * .84)},${f(-R * .49)}`;
  let bevels = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    bevels += `<path d="${facet}" transform="scale(${sx} ${sy})" fill="${shade(L.caseColor, sx < 0 ? -.24 : -.3)}"/>`;
    bevels += `<path d="${facetEdge}" transform="scale(${sx} ${sy})" fill="none" stroke="${shade(L.caseColor, .45)}" stroke-width=".14" opacity=".8"/>`;
  }
  s += `<defs><clipPath id="${id}gcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}gcc)">${bevels}<path d="${d}" fill="url(#${id}gh)"/><path d="${d}" fill="none" stroke="${shade(L.caseColor, -.32)}" stroke-width=".42"/><path d="${d}" fill="none" stroke="${shade(L.caseColor, .62)}" stroke-width=".16"/></g>`;
  s += bezel(k, id, L);
  s += `<circle r="${f(k * .778)}" fill="url(#${id}gd)"/><circle r="${f(k * .677)}" fill="url(#${id}gd)"/>`;
  s += chapter(k, id);
  s += markers(k, id);
  s += date(k, id, L);
  s += printing(k, L, o.brand);
  s += hands(k, id, L);
  s += `<path d="M${f(-k * .55)},${f(-k * .18)}A${f(k * .72)},${f(k * .72)} 0 0 1 ${f(k * .18)},${f(-k * .55)}A${f(k * .95)},${f(k * .95)} 0 0 0 ${f(-k * .55)},${f(-k * .18)}Z" fill="#fff" opacity=".035"/>`;
  return s;
}
