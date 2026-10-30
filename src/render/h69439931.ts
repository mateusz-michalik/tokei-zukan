import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P } from './geom';
import { handRole } from './hands';
import { lu } from './night';

// Hamilton Khaki Field Mechanical 38 mm (H69439931): a matte bead-blasted steel case with straight lugs, a flat bezel
// over a dark inner slope, a black dial with large luminous Arabic hours, an inner 13–24 ring, a minute track of
// dashes with beige triangles at the hours, framed pencil hands with beige lume, and a white seconds hand with a
// round counterweight. Everything is in millimetres at 38 mm, scaled by u = D / 38. See docs/models/hamilton-h69439931.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

/** Radii measured on Hamilton's photo at 24.2 px/mm. */
const STEP = 18.3, BEZEL_IN = 16.4, DIAL = 15;

/** Round case with straight lugs: each outer flank runs from a 2.4 mm tip straight out to meet the case. */
export function h69439931Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = D / 38;
  const yi = Math.sqrt(R * R - slot * slot), tip = 12.45 * u, join = [15.6 * u, Math.sqrt(R * R - (15.6 * u) ** 2)];
  const ar = `A${f(R)},${f(R)} 0 0 1`;
  // One lug, traced from the case at its inner edge round the tip and down the flank to the case (sx, sy mirror it).
  const lug = (sx: number, sy: number, reverse: boolean) => {
    const p = (x: number, y: number) => `${f(sx * x)},${f(sy * y)}`;
    const pts = [`${p(slot, yi)}`, `V${f(sy * (H - .45 * u))}Q${p(slot, H)} ${p(slot + .45 * u, H)}`, `H${f(sx * (tip - .7 * u))}Q${p(tip, H)} ${p(tip, H - .75 * u)}`, `L${p(join[0], join[1])}`];
    if (!reverse) return pts;
    return [`${p(join[0], join[1])}`, `L${p(tip, H - .75 * u)}Q${p(tip, H)} ${p(tip - .7 * u, H)}`, `H${f(sx * (slot + .45 * u))}Q${p(slot, H)} ${p(slot, H - .45 * u)}`, `V${f(sy * yi)}`];
  };
  const [a, b, c, d] = lug(1, -1, false), br = lug(1, 1, true), bl = lug(-1, 1, false), tl = lug(-1, -1, true);
  return `M${a}${b}${c}${d}${ar} ${br[0]}${br[1]}${br[2]}${br[3]}${ar} ${bl[0]}${bl[1]}${bl[2]}${bl[3]}${ar} ${tl[0]}${tl[1]}${tl[2]}${tl[3]}${ar} ${a}Z`;
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor;
  return `<defs><radialGradient id="${id}hc" cx=".4" cy=".35" r=".8"><stop stop-color="${shade(m, .18)}"/><stop offset=".7" stop-color="${m}"/><stop offset="1" stop-color="${shade(m, -.18)}"/></radialGradient>`
    + `<pattern id="${id}hm" patternUnits="userSpaceOnUse" width=".9" height=".9"><circle cx=".2" cy=".3" r=".07" fill="#fff" opacity=".18"/><circle cx=".65" cy=".7" r=".06" fill="#000" opacity=".14"/><circle cx=".7" cy=".15" r=".05" fill="#fff" opacity=".12"/></pattern>`
    + `<radialGradient id="${id}hs" cx=".5" cy=".5" r=".5"><stop offset=".86" stop-color="#4a4e50"/><stop offset=".93" stop-color="#36393b"/><stop offset="1" stop-color="#5d6164"/></radialGradient>`
    + `<radialGradient id="${id}hd" cx=".42" cy=".38" r=".7"><stop stop-color="#1b1c1e"/><stop offset="1" stop-color="#0e0f10"/></radialGradient></defs>`;
}

/** The knurled crown at 3, on a short tube, drawn beneath the case. */
function crown(L: FullLook, u: number, outline: boolean, stroke: string) {
  const m = L.caseColor, x0 = 18.6 * u, x1 = 19.4 * u, x2 = 22.7 * u, x3 = 23.05 * u, h = 3.2 * u;
  let s = `<path d="M${f(x0)},${f(-1.5 * u)}H${f(x1)}V${f(-h)}H${f(x2)}Q${f(x3)},${f(-h)} ${f(x3)},${f(-h + .9 * u)}V${f(h - .9 * u)}Q${f(x3)},${f(h)} ${f(x2)},${f(h)}H${f(x1)}V${f(1.5 * u)}H${f(x0)}Z" fill="${outline ? 'none' : shade(m, .05)}" ${stroke}/>`;
  if (outline) return s;
  let knurl = '';
  for (let y = -h + .35 * u; y < h - .2 * u; y += .38 * u) knurl += `M${f(x1 + .2 * u)},${f(y)}H${f(x2 - .1 * u)}`;
  s += `<path d="${knurl}" stroke="${shade(m, -.45)}" stroke-width="${f(.13 * u)}"/>`;
  return s + `<path d="M${f(x1 + .2 * u)},${f(-h + .25 * u)}H${f(x2)}" stroke="#fff" stroke-width="${f(.25 * u)}" opacity=".5"/>`;
}

/** Matte bead-blasted steel: a faint grain over the whole case, soft light on the upper left, and a crisp outline. */
function caseFinish(d: string, id: string, L: FullLook) {
  const m = L.caseColor;
  return `<path d="${d}" fill="url(#${id}hm)"/><path d="${d}" fill="none" stroke="${shade(m, .55)}" stroke-width=".3" opacity=".5"/>`;
}

/** Flat matte bezel with a step near its edge, the dark sloped inner ring, and the black dial. */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor;
  let s = `<circle r="${STEP}" fill="none" stroke="${shade(m, -.25)}" stroke-width=".12"/><circle r="${f(STEP - .1)}" fill="none" stroke="${shade(m, .5)}" stroke-width=".12" opacity=".6"/>`;
  s += `<circle r="${BEZEL_IN}" fill="url(#${id}hs)" stroke="${shade(m, -.4)}" stroke-width=".1"/>`;
  return s + `<circle r="${DIAL}" fill="url(#${id}hd)"/>`;
}

/**
 * White minute dashes, and beige triangles at the hours. Only the triangles are lume: in the photo the dashes and
 * numerals are flat white print, while the triangles carry the same beige as the hands' lume.
 */
function track(L: FullLook) {
  let dashes = '', tris = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6;
    if (i % 5) { dashes += `M${pt(12.75, a)}L${pt(14.35, a)}`; continue; }
    const t = (.55 / 14.45) * 180 / Math.PI;
    tris += `M${pt(14.45, a - t)}L${pt(14.45, a + t)}L${pt(12.75, a)}Z`;
  }
  return `<path d="${dashes}" stroke="#f1f1ec" stroke-width=".3"/><path d="${tris}" fill="${L.lume}"${lu('indices')}/>`;
}

/**
 * Hamilton's field numerals as drawn strokes, in a box 1 tall: rounded digits with round ends, and a 1 that's a plain
 * vertical bar. Each entry is the stroke's centreline (coordinate pairs only, so it can be placed by a
 * simple transform) and the digit's width.
 */
const DIGITS: Record<string, [string, number]> = {
  '0': ['M.29,0C.08,0 .02,.24 .02,.5C.02,.76 .08,1 .29,1C.5,1 .56,.76 .56,.5C.56,.24 .5,0 .29,0Z', .58],
  '1': ['M.05,0L.05,1', .1],
  '2': ['M.04,.22C.06,.04 .2,0 .3,0C.46,0 .55,.11 .55,.26C.55,.45 .32,.62 .04,1L.57,1', .6],
  '3': ['M.05,.13C.13,.03 .22,0 .31,0C.46,0 .55,.1 .55,.24C.55,.39 .42,.47 .26,.47C.45,.47 .58,.57 .58,.74C.58,.9 .46,1 .3,1C.18,1 .08,.95 .02,.86', .6],
  '4': ['M.45,1L.45,0L.02,.69L.62,.69', .64],
  '5': ['M.54,0L.12,0L.07,.45C.15,.39 .24,.37 .32,.37C.47,.37 .58,.49 .58,.68C.58,.88 .45,1 .29,1C.17,1 .08,.95 .02,.87', .6],
  '6': ['M.5,.07C.43,.02 .37,0 .31,0C.13,0 .04,.22 .04,.55C.04,.86 .15,1 .31,1C.47,1 .57,.88 .57,.69C.57,.5 .46,.39 .31,.39C.17,.39 .07,.48 .04,.6', .6],
  '7': ['M.02,0L.58,0L.2,1', .6],
  '8': ['M.3,.46C.15,.46 .07,.36 .07,.23C.07,.09 .17,0 .3,0C.43,0 .53,.09 .53,.23C.53,.36 .45,.46 .3,.46C.14,.46 .03,.57 .03,.73C.03,.9 .15,1 .3,1C.45,1 .57,.9 .57,.73C.57,.57 .46,.46 .3,.46Z', .6],
  '9': ['M.1,.93C.17,.98 .23,1 .29,1C.47,1 .56,.78 .56,.45C.56,.14 .45,0 .29,0C.13,0 .03,.12 .03,.31C.03,.5 .14,.61 .29,.61C.43,.61 .53,.52 .56,.4', .6],
};

/** A number drawn from DIGITS, h mm tall, centred on (cx, cy), its strokes sw mm wide. */
function numeral(text: string, cx: number, cy: number, h: number, sw: number) {
  const gap = .16, width = [...text].reduce((w, c) => w + DIGITS[c][1], 0) + gap * (text.length - 1);
  let d = '', x = -width / 2;
  for (const c of text) {
    const [path, w] = DIGITS[c], ox = x;
    d += path.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, px: string, py: string) => `${f(cx + (+px + ox) * h)},${f(cy + (+py - .5) * h)}`);
    x += w + gap;
  }
  return `<path d="${d}" stroke-width="${sw}"/>`;
}

/** The printed hours and inner 13–24 ring, HAMILTON and SWISS MADE. None of it is lume. */
function printing() {
  let hours = '', inner = '';
  for (let h = 1; h <= 12; h++) {
    const [x, y] = P(10.95, h * 30), [ix, iy] = P(7.6, h * 30);
    hours += numeral(String(h), x, y, 2.9, .6);
    inner += numeral(String(h + 12), ix, iy, 1.3, .26);
  }
  const sans = 'font-family="Arial,Helvetica,sans-serif" text-anchor="middle" dominant-baseline="central"';
  let s = `<g fill="none" stroke="#f1f1ec" stroke-linecap="round" stroke-linejoin="round">${hours}${inner}</g>`;
  s += `<text x="-.3" y="-3.97" ${sans} font-size="1.05" textLength="8.8" lengthAdjust="spacing" fill="#e9e9e4">HAMILTON</text>`;
  return s + `<g ${sans} font-size=".55" fill="#d9d9d4"><text x="-2.6" y="13.9" transform="rotate(10 -2.6 13.9)">SWISS</text><text x="2.6" y="13.9" transform="rotate(-10 2.6 13.9)">MADE</text></g>`;
}

/** Framed pencil hour and minute hands with beige lume, and the white seconds hand with a lume tip and round counterweight. */
function hands(L: FullLook) {
  const ha = 304, ma = 54, sa = 219.5, white = '#f2f2ee', edge = '#7d7f80', lume = L.lume;
  // A white frame round a lume panel, from a narrow stem to a lance tip.
  const pencil = (r0: number, r1: number, tip: number, w: number) => ({
    whole: `M-.28,.6V${-r0}L${-w / 2},${-r0 - .3}V${-r1}L0,${-tip}L${w / 2},${-r1}V${-r0 - .3}L.28,${-r0}V.6Z`,
    lume: `M${-w / 2 + .15},${-r0 - .4}H${w / 2 - .15}V${-r1 + .05}L0,${f(-r1 - (tip - r1) * .55)}L${-w / 2 + .15},${-r1 + .05}Z`,
  });
  // Widths and lume panels measured against the photo at the same scale: the hour lume starts close to the pivot.
  const hr = pencil(1.5, 7.3, 8.5, 1.28), mn = pencil(1.9, 10.9, 12.1, 1.02);
  let s = `<g fill="#000" opacity=".3" transform="translate(.15 .22)"><path d="${hr.whole}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${mn.whole}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  for (const [h, role, a] of [[hr, 'hour', ha], [mn, 'minute', ma]] as const)
    s += `<g ${handRole(role)}transform="rotate(${a})"><path d="${h.whole}" fill="${white}" stroke="${edge}" stroke-width=".05"/><path d="${h.lume}" fill="${lume}"${lu('hands')}/></g>`;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.07,6.6H.07L.04,-11H-.04Z" fill="${white}" stroke="${edge}" stroke-width=".02"/><circle cy="5.8" r=".9" fill="${white}" stroke="${edge}" stroke-width=".04"/>`
    + `<path d="M0,-12.6L.36,-10.9L0,-11.25L-.36,-10.9Z" fill="${lume}" stroke="${edge}" stroke-width=".03"${lu('seconds')}/></g>`;
  return s + `<circle r=".95" fill="${white}" stroke="${edge}" stroke-width=".05"/><circle r=".45" fill="none" stroke="${edge}" stroke-width=".08"/><circle r=".12" fill="#333"/>`;
}

export interface H69439931Options { D: number; LL: number; lw: number; id: string; L: FullLook; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Hamilton Khaki Field Mechanical 38 mm. */
export function h69439931SVG(o: H69439931Options) {
  const { D, LL, lw, id, L, outline } = o;
  const d = h69439931Case(D, LL, lw), u = D / 38;
  let s = outline ? '' : defs(id, L);
  s += crown(L, u, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}hc)`}" ${outline ? o.stroke : `stroke="${shade(L.caseColor, -.4)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(BEZEL_IN * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += caseFinish(d, id, L);
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L);
  s += track(L);
  s += printing();
  s += hands(L);
  // The sapphire: one faint reflection across the upper left.
  s += `<path d="M-12,-5A13,13 0 0 1 -5,-12A15,15 0 0 0 -12,-5Z" fill="#fff" opacity=".06"/>`;
  return s + '</g>';
}
