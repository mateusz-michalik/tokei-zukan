import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P, ringSeg } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Seiko 5 Sports GMT (SSK003): SKX-style case with crown guards, coin-edge bezel with a two-tone 24-hour insert,
// sloping 24-hour rehaut, cyclops date and lumed red GMT arrow.
// Dial furniture is sized in units of k, the bezel insert's outer radius. The case is in millimetres.
// See docs/models/seiko-ssk003.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

/** Insert outer radius as a fraction of half the case width, measured from the reference photo. */
const K = 1 / 1.108;
/** Crown axis, degrees clockwise from 12: the 4 o'clock crown sits a little above 4. */
const CROWN_ANGLE = 113.8;
const CROWN_HALF = 3.2, CROWN_SEAT = 20.6, CROWN_END = 24.4;

/** Straight SKX flanks, a rounded 9 o'clock, and crown guards either side of the 4 o'clock crown. */
export function ssk003Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = D / 42.5, k = R * K;
  const seat = k * 1.02;
  // The flank is a straight line through (19, 9.3) mm with a slope of 0.44, measured on the photo.
  const flankX = (y: number) => (19 - .44 * (y / u - 9.3)) * u;
  const cy = H - .75 * u, cx = flankX(cy);
  const p = (x: number, y: number) => `${f(x)},${f(y)}`;
  // Upper-right quarter, from the lug's inner edge to 3 o'clock.
  const upperRight = `M${p(slot, -seat)}V${f(-H + .3 * u)}Q${p(slot, -H)} ${p(slot + .3 * u, -H)}`
    + `H${f(cx - .9 * u)}Q${p(cx - .2 * u, -H)} ${p(cx, -cy)}`
    + `L${p(19 * u, -9.3 * u)}Q${p(R, -4.19 * u)} ${p(R, 0)}`;
  // The crown's edges, so the guards' faces can overlap it slightly and leave no gap.
  const a = (CROWN_ANGLE * Math.PI) / 180, ux = Math.sin(a), uy = -Math.cos(a), nx = -uy, ny = ux;
  const top = (r: number) => p((r * ux + (CROWN_HALF - .15) * -nx) * u, (r * uy + (CROWN_HALF - .15) * -ny) * u);
  const bot = (r: number) => p((r * ux - (CROWN_HALF - .15) * -nx) * u, (r * uy - (CROWN_HALF - .15) * -ny) * u);
  // Lower-right: the upper guard sweeps out to a nose just above the crown's end, the seat runs behind the crown,
  // and below the crown the flank runs straight back to the lug.
  const lowerRight = `C${p(R, 2 * u)} ${p(22.4 * u, 3.7 * u)} ${p(23.45 * u, 5.8 * u)}Q${p(23.75 * u, 6.5 * u)} ${top(23.9)}`
    + `L${top(CROWN_SEAT)}L${bot(CROWN_SEAT)}L${bot(23.2)}`
    + `L${p(17.2 * u, 16.2 * u)}L${p(cx, cy)}Q${p(cx - .2 * u, H)} ${p(cx - .9 * u, H)}H${f(slot + .3 * u)}Q${p(slot, H)} ${p(slot, H - .3 * u)}V${f(seat)}`;
  const lowerLeft = `Q0,${f(seat - .4 * u)} ${p(-slot, seat)}V${f(H - .3 * u)}Q${p(-slot, H)} ${p(-slot - .3 * u, H)}`
    + `H${f(-cx + .9 * u)}Q${p(-cx + .2 * u, H)} ${p(-cx, cy)}L${p(-19 * u, 9.3 * u)}Q${p(-R, 4.19 * u)} ${p(-R, 0)}`;
  // The upper-left quarter, walked from 9 o'clock back up to the lug's inner edge.
  const upperLeft = `Q${p(-R, -4.19 * u)} ${p(-19 * u, -9.3 * u)}L${p(-cx, -cy)}Q${p(-cx + .2 * u, -H)} ${p(-cx + .9 * u, -H)}`
    + `H${f(-slot - .3 * u)}Q${p(-slot, -H)} ${p(-slot, -H + .3 * u)}V${f(-seat)}`;
  // Walk the outline once: upper right, lower right, lower left, upper left, closing across the top lugs.
  const d = upperRight + lowerRight + lowerLeft + upperLeft + `Q0,${f(-seat + .4 * u)} ${p(slot, -seat)}Z`;
  return { d, k };
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs>
<linearGradient id="${id}gm" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6f7f5"/><stop offset=".45" stop-color="${L.handColor}"/><stop offset=".7" stop-color="#7d8687"/><stop offset="1" stop-color="#c6cbcc"/></linearGradient>
<linearGradient id="${id}gl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.lume, .25)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></linearGradient>
<linearGradient id="${id}gc" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.45)}"/><stop offset=".25" stop-color="${shade(m, .5)}"/><stop offset=".5" stop-color="${shade(m, .75)}"/><stop offset="1" stop-color="${shade(m, -.4)}"/></linearGradient>
<linearGradient id="${id}gs" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(m, .5)}"/><stop offset=".5" stop-color="${shade(m, -.08)}"/><stop offset="1" stop-color="${shade(m, -.42)}"/></linearGradient>
<linearGradient id="${id}gr" x1="1" y1="0" x2="0" y2="1"><stop stop-color="${shade(L.dial, .28)}"/><stop offset=".35" stop-color="${shade(L.dial, -.2)}"/><stop offset="1" stop-color="${shade(L.dial, -.55)}"/></linearGradient>
<radialGradient id="${id}gd" cx=".46" cy=".44" r=".72"><stop stop-color="${shade(L.dial, .1)}"/><stop offset=".55" stop-color="${L.dial}"/><stop offset=".85" stop-color="${shade(L.dial, -.25)}"/><stop offset="1" stop-color="${shade(L.dial, -.45)}"/></radialGradient>
<linearGradient id="${id}gk" x1=".15" y1=".1" x2=".75" y2=".85"><stop stop-color="#9fc2ff" stop-opacity=".14"/><stop offset=".45" stop-color="#9fc2ff" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<linearGradient id="${id}gy" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c9d3db" stop-opacity=".75"/><stop offset=".22" stop-color="#4d6077" stop-opacity=".35"/><stop offset=".55" stop-color="#03142c" stop-opacity="0"/></linearGradient>
<pattern id="${id}gh" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="rotate(90)"><path d="M0,0V.5M.22,0V.5" stroke="#fff" stroke-width=".05" opacity=".09"/><path d="M.11,0V.5M.38,0V.5" stroke="#4e5554" stroke-width=".04" opacity=".07"/></pattern>
</defs>`;
}

/** Screw-down crown at about 4 o'clock: a knurled barrel drawn beneath the case, so the guards cover its root. */
function crown(id: string, L: FullLook, u: number, outline: boolean, stroke: string) {
  const h = CROWN_HALF * u, r0 = CROWN_SEAT * u - .6, r1 = CROWN_END * u;
  let s = `<g transform="rotate(${f(CROWN_ANGLE - 90)})">`;
  s += `<path d="M${f(r0)},${f(-h)}H${f(r1 - .7)}Q${f(r1)},${f(-h)} ${f(r1)},${f(-h + .8)}V${f(h - .8)}Q${f(r1)},${f(h)} ${f(r1 - .7)},${f(h)}H${f(r0)}Z" fill="${outline ? 'none' : `url(#${id}gc)`}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -7; i <= 7; i++) {
      grooves += `M${f(r0 + .3)},${f(i * .4)}H${f(r1 - .45)}`;
      lights += `M${f(r0 + .3)},${f(i * .4 + .13)}H${f(r1 - .5)}`;
    }
    s += `<path d="${grooves}" stroke="${shade(L.caseColor, -.6)}" stroke-width=".14"/><path d="${lights}" stroke="#fff" stroke-width=".07" opacity=".7"/>`;
    s += `<path d="M${f(r1 - .2)},${f(-h + .7)}V${f(h - .7)}" stroke="#fff" stroke-width=".3" opacity=".6"/>`;
  }
  return s + '</g>';
}

/** Polished outer edge of the case flanks, inset from the outline, over a brushed top. */
function caseFinish(d: string, id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs><clipPath id="${id}gcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}gcc)"><path d="${d}" fill="url(#${id}gh)"/>`
    + `<path d="${d}" fill="none" stroke="${shade(m, -.3)}" stroke-width=".9" opacity=".35"/><path d="${d}" fill="none" stroke="${shade(m, .7)}" stroke-width=".5" opacity=".8"/>`
    + `<path d="${d}" fill="none" stroke="${shade(m, -.38)}" stroke-width=".22"/></g>`;
}

/** Bezel digits as stroke centrelines in a box one unit tall (absolute points only, so they rotate), with their advance widths. */
export const DIGITS: Record<string, [string, number]> = {
  '0': ['M.375,.1C.56,.1 .65,.3 .65,.5C.65,.7 .56,.9 .375,.9C.19,.9 .1,.7 .1,.5C.1,.3 .19,.1 .375,.1Z', .75],
  '1': ['M.18,.1L.18,.9', .36],
  '2': ['M.12,.3C.14,.16 .24,.1 .38,.1C.54,.1 .65,.2 .65,.33C.65,.47 .55,.55 .4,.66L.1,.9L.68,.9', .75],
  '4': ['M.52,.9L.52,.1L.08,.66L.7,.66', .75],
  '6': ['M.6,.16C.52,.11 .45,.1 .38,.1C.2,.1 .1,.3 .1,.55C.1,.78 .22,.9 .38,.9C.54,.9 .65,.78 .65,.64C.65,.48 .54,.38 .38,.38C.24,.38 .12,.46 .1,.58', .75],
  '8': ['M.375,.48C.22,.48 .13,.4 .13,.29C.13,.17 .24,.1 .375,.1C.51,.1 .62,.17 .62,.29C.62,.4 .53,.48 .375,.48C.2,.48 .1,.58 .1,.69C.1,.82 .22,.9 .375,.9C.53,.9 .65,.82 .65,.69C.65,.58 .55,.48 .375,.48Z', .75],
};
export const DIGIT_STROKE = .2, DIGIT_GAP = .1;

/** A bezel numeral as path data: centred on radius r at clock angle a, h tall, reading outwards like the reference. */
function numeral(text: string, r: number, a: number, h: number) {
  const width = [...text].reduce((w, c) => w + DIGITS[c][1], 0) + DIGIT_GAP * (text.length - 1);
  const [cx, cy] = P(r, a), t = (a * Math.PI) / 180, cos = Math.cos(t), sin = Math.sin(t);
  let x0 = -width / 2, d = '';
  for (const c of text) {
    const [path, adv] = DIGITS[c], ox = x0;
    // Map each unit point into place: centre the string, scale to h, rotate by the clock angle, move to the ring.
    d += path.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, x: string, y: string) => {
      const ux = (+x + ox) * h, uy = (+y - .5) * h;
      return `${f(cx + ux * cos - uy * sin)},${f(cy + ux * sin + uy * cos)}`;
    });
    x0 += adv + DIGIT_GAP;
  }
  return d;
}

/** 60-tooth coin edge, sloping steel ring and the two-tone Hardlex 24-hour insert. */
function bezel(k: number, id: string, L: FullLook) {
  const m = L.caseColor;
  // Flat crests at the outer radius with a rounded notch cut between each pair, showing the case beneath.
  const ro = k * 1.09, rn = k * 1.043, half = 1.35;
  let edge = '', cups = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6, b = a + 6 - half;
    edge += `${i ? 'L' : 'M'}${pt(ro, a - half)}A${f(ro)},${f(ro)} 0 0 1 ${pt(ro, a + half)}C${pt(rn, a + half + .5)} ${pt(rn, b - .5)} ${pt(ro, b)}`;
    cups += `M${pt(ro, a + half)}C${pt(rn, a + half + .5)} ${pt(rn, b - .5)} ${pt(ro, b)}`;
  }
  let s = `<circle r="${f(ro)}" fill="${shade(m, -.4)}"/><path d="${edge}Z" fill="${shade(m, .25)}"/><path d="${cups}" fill="none" stroke="${shade(m, -.45)}" stroke-width=".16"/><path d="${cups}" fill="none" stroke="#fff" stroke-width=".07" opacity=".7" transform="scale(.994)"/>`;
  s += `<circle r="${f(k * 1.035)}" fill="url(#${id}gs)"/><circle r="${f(k * 1.033)}" fill="none" stroke="${shade(m, -.35)}" stroke-width=".08"/>`;
  s += `<circle r="${f(k)}" fill="${L.bezel}"/><path d="${ringSeg(k, k * .85, 90, 270)}" fill="${L.bezel2 || L.bezel}"/>`;
  s += `<circle r="${f(k * .995)}" fill="none" stroke="#fff" stroke-width=".1" opacity=".25"/>`;
  let dots = '';
  for (let h = 1; h < 24; h += 2) {
    const [x, y] = P(k * .93, h * 15), r = k * .019;
    dots += `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
  }
  s += `<path d="${dots}" fill="${L.bezelText}"/>`;
  s += `<path d="M${f(-k * .16)},${f(-k * .983)}H${f(k * .16)}L0,${f(-k * .865)}Z" fill="${L.bezelText}" stroke="${shade(L.bezelText, -.3)}" stroke-width=".05"/>`;
  // Heavy monoline numerals, drawn as strokes: the photo's are about twice Arial's weight, with a plain 1 and flat-based 2.
  let nums = '';
  for (let h = 2; h < 24; h += 2) nums += numeral(String(h), k * .922, h * 15, k * .11);
  s += `<path d="${nums}" fill="none" stroke="${L.bezelText}" stroke-width="${f(k * .11 * DIGIT_STROKE)}" stroke-linejoin="round"/>`;
  return s + `<circle r="${f(k * .852)}" fill="none" stroke="#010409" stroke-width="${f(k * .014)}"/>`;
}

/** Sloping blue rehaut: a light reflection on its outer slope, even-hour 24-hour numerals and a tick every 6°. */
function rehaut(k: number, id: string, L: FullLook) {
  let s = `<circle r="${f(k * .845)}" fill="${shade(L.dial, -.4)}"/><path d="${ringSeg(k * .845, k * .78, 0, 359.999)}" fill="url(#${id}gr)"/>`;
  s += `<circle r="${f(k * .78)}" fill="none" stroke="${shade(L.dial, -.6)}" stroke-width=".08"/><circle r="${f(k * .697)}" fill="none" stroke="#020b18" stroke-width=".12"/>`;
  let ticks = '';
  for (let i = 0; i < 60; i++) if (i % 5) ticks += `M${pt(k * .766, i * 6)}L${pt(k * .726, i * 6)}`;
  s += `<path d="${ticks}" stroke="#dfe5ea" stroke-width="${f(k * .009)}" opacity=".9"/>`;
  s += `<g fill="#eef2f4" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .058)}" font-weight="700" text-anchor="middle" dominant-baseline="central">`;
  for (let h = 0; h < 24; h += 2) {
    const a = h * 15, [x, y] = P(k * .745, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)})">${h || 24}</text>`;
  }
  return s + '</g>';
}

const circ = (x: number, y: number, r: number) => `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
/** A stadium (rounded-end bar) centred on x, y. */
function stadium(x: number, y: number, w: number, h: number) {
  const r = Math.min(w, h) / 2;
  if (w >= h) return `M${f(x - w / 2 + r)},${f(y - r)}H${f(x + w / 2 - r)}A${f(r)},${f(r)} 0 0 1 ${f(x + w / 2 - r)},${f(y + r)}H${f(x - w / 2 + r)}A${f(r)},${f(r)} 0 0 1 ${f(x - w / 2 + r)},${f(y - r)}Z`;
  return `M${f(x - r)},${f(y - h / 2 + r)}A${f(r)},${f(r)} 0 0 1 ${f(x + r)},${f(y - h / 2 + r)}V${f(y + h / 2 - r)}A${f(r)},${f(r)} 0 0 1 ${f(x - r)},${f(y + h / 2 - r)}Z`;
}
function rrect(x: number, y: number, w: number, h: number, r: number) {
  const x2 = x + w, y2 = y + h, rr = Math.min(r, w / 2, h / 2);
  return `M${f(x + rr)},${f(y)}H${f(x2 - rr)}Q${f(x2)},${f(y)} ${f(x2)},${f(y + rr)}V${f(y2 - rr)}Q${f(x2)},${f(y2)} ${f(x2 - rr)},${f(y2)}H${f(x + rr)}Q${f(x)},${f(y2)} ${f(x)},${f(y2 - rr)}V${f(y + rr)}Q${f(x)},${f(y)} ${f(x + rr)},${f(y)}Z`;
}

/** Applied, framed lume: circular plots, the 12 o'clock triangle on a stem, and stadium batons at 6 and 9. */
function markers(k: number, id: string) {
  let frames = '', lume = '';
  const m = k * .014;
  for (const h of [1, 2, 4, 5, 7, 8, 10, 11]) {
    const [x, y] = P(k * .595, h * 30);
    frames += circ(x, y, k * .06);
    lume += circ(x, y, k * .06 - m);
  }
  const tri = (inset: number) => {
    const t = -k * .68 + inset, s = k * .127 - inset * 1.25, c = k * .11 - inset;
    return `M${f(-c)},${f(t)}H${f(c)}L${f(s)},${f(t + k * .025)}L0,${f(-k * .463 - inset * 1.6)}L${f(-s)},${f(t + k * .025)}Z`;
  };
  frames += tri(0) + rrect(-k * .013, -k * .47, k * .026, k * .1, k * .013);
  lume += tri(m) + rrect(-k * .005, -k * .462, k * .01, k * .085, k * .005);
  frames += stadium(0, k * .595, k * .12, k * .23) + rrect(-k * .012, k * .42, k * .024, k * .065, k * .012);
  lume += stadium(0, k * .595, k * .12 - 2 * m, k * .23 - 2 * m) + rrect(-k * .004, k * .428, k * .008, k * .05, k * .004);
  frames += stadium(-k * .5575, 0, k * .215, k * .12) + rrect(-k * .447, -k * .012, k * .06, k * .024, k * .012);
  lume += stadium(-k * .5575, 0, k * .215 - 2 * m, k * .12 - 2 * m) + rrect(-k * .44, -k * .004, k * .046, k * .008, k * .004);
  return `<path d="${frames}" fill="#000" opacity=".3" transform="translate(.07 .11)"/><path d="${frames}" fill="#c4c9ca" stroke="#4f595b" stroke-width=".07"/><path d="${lume}" fill="url(#${id}gl)"${lu('indices')}/>`;
}

/** White date at 3, seen through the cushion-shaped Hardlex magnifier. */
function date(k: number, L: FullLook, id: string) {
  if (!L.date) return '';
  const lx = k * .553, ly = -k * .01, lw = k * .37, lh = k * .3;
  const dx = k * .567, dy = k * .012, dw = k * .21, dh = k * .143;
  let s = `<path d="${rrect(lx - lw / 2, ly - lh / 2, lw, lh, k * .085)}" fill="#03122a"/>`;
  s += `<path d="${rrect(dx - dw / 2 - k * .012, dy - dh / 2 - k * .012, dw + k * .024, dh + k * .024, k * .012)}" fill="#8e9aa1"/><path d="${rrect(dx - dw / 2, dy - dh / 2, dw, dh, k * .006)}" fill="#f3f4f1"/>`;
  s += `<text x="${f(dx)}" y="${f(dy)}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .135)}" text-anchor="middle" dominant-baseline="central" fill="#14181c">6</text>`;
  s += `<path d="${rrect(lx - lw / 2, ly - lh / 2, lw, lh, k * .085)}" fill="url(#${id}gy)" stroke="#d8e0e6" stroke-width="${f(k * .008)}"/>`;
  return s;
}

/** The SEIKO wordmark as vector letters in a box one unit tall: wide, high-contrast serif capitals. */
export const WORDMARK = {
  width: 5.62,
  // E, I, K and O as filled outlines; the O's counter is cut with even-odd filling.
  fill: 'M1.14,0H2.09V.32H1.98V.15H1.5V.42H1.8V.34H1.9V.66H1.8V.58H1.5V.85H1.98V.68H2.09V1H1.14V.86H1.22V.14H1.14Z'
    + 'M2.23,0H2.68V.14H2.595V.86H2.68V1H2.23V.86H2.315V.14H2.23Z'
    + 'M2.82,0H3.3V.14H3.18V.47L3.64,.14H3.58V0H4.02V.14H3.9L3.46,.45L3.94,.86H4.07V1H3.6V.86H3.66L3.3,.55L3.18,.64V.86H3.3V1H2.82V.86H2.9V.14H2.82Z'
    + 'M4.17,.5A.725,.5 0 1 0 5.62,.5A.725,.5 0 1 0 4.17,.5ZM4.44,.5A.455,.35 0 1 0 5.35,.5A.455,.35 0 1 0 4.44,.5Z',
  // The S is a stroked spine with short serifs at both terminals.
  s: 'M.86,.24C.8,.1 .62,.06 .48,.06C.26,.06 .13,.17 .13,.3C.13,.46 .32,.5 .5,.54C.72,.58 .87,.66 .87,.78C.87,.9 .7,.95 .5,.95C.32,.95 .18,.9 .12,.76M.86,.04V.3M.12,.7V.96',
};

function printing(k: number, L: FullLook) {
  const ink = '#f1f3f2', edge = '#07162d', h = k * .063;
  // SEIKO, 0.063 tall with its baseline at -0.247: an applied wordmark with a fine dark edge.
  let s = `<g transform="translate(${f(-WORDMARK.width * h / 2)} ${f(-k * .31)}) scale(${f(h)})"><path d="${WORDMARK.s}" fill="none" stroke="${edge}" stroke-width=".36"/><path d="${WORDMARK.fill}" fill="${ink}" fill-rule="evenodd" stroke="${edge}" stroke-width=".1" paint-order="stroke"/><path d="${WORDMARK.s}" fill="none" stroke="${ink}" stroke-width=".25"/></g>`;
  // The Seiko 5 emblem: a slanted hexagonal badge cut by two diagonal slots.
  const pts = [[-.067, -.22], [.087, -.22], [.103, -.183], [.06, -.14], [-.017, -.14], [-.09, -.183]];
  s += `<path d="M${pts.map(([x, y]) => `${f(x * k)},${f(y * k)}`).join('L')}Z" fill="${ink}" stroke="${edge}" stroke-width="${f(k * .004)}" paint-order="stroke"/>`;
  s += `<path d="M${f(-k * .058)},${f(-k * .188)}L${f(k * .025)},${f(-k * .214)}M${f(-k * .014)},${f(-k * .147)}L${f(k * .072)},${f(-k * .186)}" stroke="${L.dial}" stroke-width="${f(k * .016)}" stroke-linecap="round"/>`;
  s += `<text y="${f(k * .272)}" font-family="'Snell Roundhand','Segoe Script','Brush Script MT',cursive" font-style="italic" font-size="${f(k * .11)}" textLength="${f(k * .39)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">Automatic</text>`;
  s += `<text y="${f(k * .347)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .077)}" textLength="${f(k * .15)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${L.accent}">GMT</text>`;
  return s;
}

/** Lumed red GMT arrow under the hour and minute hands; arrow minute hand; chamfered hour blade; dark seconds tail. */
function hands(k: number, id: string, L: FullLook) {
  const ga = 152, ha = 303.75, ma = 51.75, sa = 253;
  const red = L.accent;
  // GMT: shaft, open arrowhead filled with lume and a fine needle running on to the rehaut.
  const gOuter = `M${f(-k * .019)},${f(k * .06)}V${f(-k * .4)}H${f(-k * .082)}L0,${f(-k * .6)}L${f(k * .082)},${f(-k * .4)}H${f(k * .019)}V${f(k * .06)}Z`;
  const gLume = `M${f(-k * .05)},${f(-k * .43)}H${f(k * .05)}L0,${f(-k * .565)}Z`;
  let s = `<g ${handRole('hour24')}transform="rotate(${ga})"><path d="${gOuter}" fill="#000" opacity=".25" transform="translate(.06 .1)"/><path d="${gOuter}" fill="${red}" stroke="${shade(red, -.35)}" stroke-width=".05"/>`
    + `<path d="M${f(k * .013)},${f(k * .02)}V${f(-k * .4)}" stroke="#ffd9dc" stroke-width="${f(k * .006)}" opacity=".6"/><path d="${gLume}" fill="url(#${id}gl)"${lu('hands')}/>`
    + `<path d="M${f(-k * .005)},${f(-k * .59)}H${f(k * .005)}L${f(k * .003)},${f(-k * .69)}H${f(-k * .003)}Z" fill="${red}"/></g>`;
  // Hour: a metal neck into a framed lume blade with chamfered ends and a fine spike.
  const hour = `M${f(-k * .035)},${f(k * .04)}V${f(-k * .1)}L${f(-k * .0625)},${f(-k * .135)}V${f(-k * .385)}L${f(-k * .011)},${f(-k * .428)}L${f(-k * .007)},${f(-k * .475)}H${f(k * .007)}L${f(k * .011)},${f(-k * .428)}L${f(k * .0625)},${f(-k * .385)}V${f(-k * .135)}L${f(k * .035)},${f(-k * .1)}V${f(k * .04)}Z`;
  const hourFace = `M0,${f(-k * .475)}H${f(k * .007)}L${f(k * .011)},${f(-k * .428)}L${f(k * .0625)},${f(-k * .385)}V${f(-k * .135)}L${f(k * .035)},${f(-k * .1)}V${f(k * .04)}H0Z`;
  const hourLume = `M${f(-k * .046)},${f(-k * .148)}V${f(-k * .372)}L0,${f(-k * .407)}L${f(k * .046)},${f(-k * .372)}V${f(-k * .148)}Z`;
  // Minute: broad base, narrower shaft and a barbed arrowhead with a fine spike.
  const minute = `M0,${f(k * .125)}L${f(k * .062)},${f(k * .07)}L${f(k * .052)},0V${f(-k * .2)}L${f(k * .041)},${f(-k * .235)}V${f(-k * .448)}L${f(k * .094)},${f(-k * .458)}L${f(k * .006)},${f(-k * .6)}V${f(-k * .66)}H${f(-k * .006)}V${f(-k * .6)}L${f(-k * .094)},${f(-k * .458)}L${f(-k * .041)},${f(-k * .448)}V${f(-k * .235)}L${f(-k * .052)},${f(-k * .2)}V0L${f(-k * .062)},${f(k * .07)}Z`;
  const minuteFace = `M0,${f(k * .125)}L${f(k * .062)},${f(k * .07)}L${f(k * .052)},0V${f(-k * .2)}L${f(k * .041)},${f(-k * .235)}V${f(-k * .448)}L${f(k * .094)},${f(-k * .458)}L${f(k * .006)},${f(-k * .6)}V${f(-k * .66)}H0Z`;
  const minuteLume = `M${f(-k * .043)},${f(-k * .09)}V${f(-k * .2)}L${f(-k * .032)},${f(-k * .235)}V${f(-k * .462)}L${f(-k * .078)},${f(-k * .468)}L0,${f(-k * .585)}L${f(k * .078)},${f(-k * .468)}L${f(k * .032)},${f(-k * .462)}V${f(-k * .235)}L${f(k * .043)},${f(-k * .2)}V${f(-k * .09)}Z`;
  const brushed = shade(L.handColor, -.25), polished = L.handColor;
  s += `<g fill="#000" opacity=".25" transform="translate(.16 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${brushed}" stroke="#eef0ee" stroke-width=".05"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}gl)"${lu('hands')} stroke="#9aa2a0" stroke-width=".05"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${brushed}" stroke="#eef0ee" stroke-width=".05"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="url(#${id}gl)"${lu('hands')} stroke="#9aa2a0" stroke-width=".05"/></g>`;
  // Seconds: silver needle; dark tail with a framed lume counterweight disc; dark hub.
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M${f(-k * .005)},0H${f(k * .005)}L${f(k * .0025)},${f(-k * .69)}H${f(-k * .0025)}Z" fill="#e3e7e8"/>`
    + `<path d="M${f(-k * .008)},0H${f(k * .008)}V${f(k * .285)}H${f(-k * .008)}Z" fill="#1d2329"/><circle cy="${f(k * .32)}" r="${f(k * .046)}" fill="#1d2329"/><circle cy="${f(k * .32)}" r="${f(k * .034)}" fill="${L.lume}"${lu('seconds')}/>`
    + `<circle r="${f(k * .045)}" fill="#1d2329" stroke="#59626a" stroke-width=".05"/></g>`;
  return s + `<circle r="${f(k * .02)}" fill="url(#${id}gm)" stroke="#e6e9ea" stroke-width=".04"/><circle r="${f(k * .008)}" fill="#3b4247"/>`;
}

export interface SSK003Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the bracelet for the Seiko 5 Sports GMT. */
export function ssk003SVG(o: SSK003Options) {
  const { D, LL, lw, id, L, outline } = o;
  const { d, k } = ssk003Case(D, LL, lw);
  const u = D / 42.5;
  let s = outline ? '' : defs(id, L);
  s += crown(id, L, u, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(L.caseColor, -.3)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(k * 1.09)}" fill="none" ${o.stroke}/><circle r="${f(k * .85)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += caseFinish(d, id, L);
  s += bezel(k, id, L);
  s += rehaut(k, id, L);
  s += `<circle r="${f(k * .695)}" fill="url(#${id}gd)"/>`;
  // A broad, soft sheen across the upper left rather than visible sunburst rays.
  s += `<circle r="${f(k * .695)}" fill="url(#${id}gk)"/>`;
  s += markers(k, id);
  s += date(k, L, id);
  s += printing(k, L);
  s += hands(k, id, L);
  s += `<path d="M${f(-k * .6)},${f(-k * .2)}A${f(k * .76)},${f(k * .76)} 0 0 1 ${f(k * .2)},${f(-k * .6)}A${f(k * .98)},${f(k * .98)} 0 0 0 ${f(-k * .6)},${f(-k * .2)}Z" fill="#fff" opacity=".035"/>`;
  return s;
}
