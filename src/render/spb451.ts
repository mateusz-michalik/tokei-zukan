import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Seiko 1965 Heritage Diver (SPB451): round case, short flat-tipped lugs, coin-edge bezel.
// Furniture is sized in units of k, the bezel insert's outer radius. The case is in millimetres.
// See docs/models/seiko-spb451.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
type XY = [number, number];
type Seg = { c: XY[]; p: XY };

const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;
const segPath = (segs: Seg[]) => segs.map(s => (s.c.length === 0 ? 'L' : s.c.length === 1 ? 'Q' : 'C') + [...s.c, s.p].map(xy).join(' ')).join('');

function reverse(start: XY, segs: Seg[]): Seg[] {
  const pts = [start, ...segs.map(s => s.p)];
  return segs.map((s, i) => ({ c: [...s.c].reverse(), p: pts[i] })).reverse();
}

/** Split a subpath of L/Q/C commands into segments. */
function pathSegs(d: string): Seg[] {
  const segs: Seg[] = [];
  for (const m of d.matchAll(/([LQC])([^LQC]+)/g)) {
    const nums = m[2].trim().split(/[ ,]+/).map(Number);
    const c: XY[] = [];
    for (let i = 0; i < nums.length - 2; i += 2) c.push([nums[i], nums[i + 1]]);
    segs.push({ c, p: [nums[nums.length - 2], nums[nums.length - 1]] });
  }
  return segs;
}

/**
 * Case silhouette. The coin-edge crest is the specified diameter. Each lug opening is exactly
 * the lug width, and the shoulder meets the circle near 2 and 4 o'clock.
 */
export function spb451Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = R / 20;
  const k = R / 1.045;
  const ri = .22 * u, seat = -k * .975, xTip = slot + 2.45 * u;
  const join = 70;
  const ang = ((join - 90) * Math.PI) / 180;
  // Direction of increasing clock angle, at the top-right join.
  const tangent: XY = [-Math.sin(ang), Math.cos(ang)];
  // Shoulder, measured on the reference and scaled with the case radius. y is negative at the top.
  const shoulder: XY[] = [
    [13.5 * u, -20.5 * u], [14.9 * u, -17.3 * u], [16.3 * u, -13.6 * u], [17.5 * u, -10.3 * u], [18.4 * u, -8.1 * u],
  ];
  const cubics = (from: XY, pts: XY[], to: XY, arrive: XY) => {
    const all = [from, ...pts, to];
    let d = '';
    for (let i = 0; i < all.length - 1; i++) {
      const p0 = all[Math.max(0, i - 1)], p1 = all[i], p2 = all[i + 1], p3 = all[Math.min(all.length - 1, i + 2)];
      let c1: XY = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      let c2: XY = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      if (i === 0) {
        // Continue directly down the shoulder: no vertical bulge at the lug tip.
        c1 = [p1[0] + (p2[0] - p1[0]) / 3, p1[1] + (p2[1] - p1[1]) / 3];
      }
      if (i === all.length - 2) {
        const prev = pts[pts.length - 1];
        const len = Math.max(.9 * u, Math.hypot(to[0] - prev[0], to[1] - prev[1]) / 2.4);
        c2 = [to[0] - arrive[0] * len, to[1] - arrive[1] * len];
      }
      d += `C${xy(c1)} ${xy(c2)} ${xy(p2)}`;
    }
    return d;
  };
  // Opening → circle join, for one corner. sx/sy pick the quadrant.
  const forward = (sx: number, sy: number, arrive: XY) => {
    const tip: XY = [sx * xTip, sy * (-H + .5 * u)];
    const wall: Seg[] = [
      { c: [], p: [sx * slot, sy * (-H + ri)] },
      { c: [[sx * slot, sy * -H]], p: [sx * (slot + ri), sy * -H] },
      { c: [], p: [sx * (xTip - ri), sy * (-H + .22 * u)] },
      { c: [[sx * xTip, sy * (-H + .22 * u)]], p: tip },
    ];
    const pts = shoulder.map(([x, y]): XY => [sx * x, sy * y]);
    const dest = P(R, sy > 0 ? (sx > 0 ? join : 360 - join) : (sx > 0 ? 180 - join : 180 + join));
    return `${segPath(wall)}${cubics(tip, pts, dest, arrive)}`;
  };
  const arc = (p: XY) => `A${f(R)},${f(R)} 0 0 1 ${xy(p)}`;
  const bow = .45 * u;
  const startTR: XY = [slot, seat];
  const startBR: XY = [slot, -seat];
  const startTL: XY = [-slot, seat];
  // Clockwise. Bottom-right and top-left are walked from the join back to the opening.
  // `arrive` is the direction of travel at the join for the opening→join walk.
  // Reversed corners leave the join along the clockwise tangent instead.
  const tr = forward(1, 1, tangent);
  const br = reverse(startBR, pathSegs(forward(1, -1, [tangent[0], -tangent[1]])));
  const bl = forward(-1, -1, [-tangent[0], -tangent[1]]);
  const tl = reverse(startTL, pathSegs(forward(-1, 1, [-tangent[0], tangent[1]])));
  const d = `M${xy(startTR)}${tr}${arc(P(R, 110))}${segPath(br)}Q0,${f(-seat - bow)} ${f(-slot)},${f(-seat)}${bl}${arc(P(R, 290))}${segPath(tl)}Q0,${f(seat + bow)} ${xy(startTR)}Z`;
  return { d, k };
}

function defs(id: string, L: FullLook, metal: string) {
  return `<defs>
<linearGradient id="${id}hst" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfbf6"/><stop offset=".42" stop-color="${L.handColor}"/><stop offset=".58" stop-color="#7d8482"/><stop offset=".72" stop-color="#e4e6e3"/><stop offset="1" stop-color="#9aa19e"/></linearGradient>
<linearGradient id="${id}hlu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.1)}"/></linearGradient>
<linearGradient id="${id}hcy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.42)}"/><stop offset=".28" stop-color="${shade(metal, .45)}"/><stop offset=".5" stop-color="${shade(metal, .72)}"/><stop offset="1" stop-color="${shade(metal, -.38)}"/></linearGradient>
<linearGradient id="${id}hch" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#35464d"/><stop offset=".45" stop-color="#101a21"/><stop offset="1" stop-color="#566568"/></linearGradient>
<linearGradient id="${id}hbe" x1="0" y1="1" x2="1" y2="0"><stop stop-color="${L.dial}"/><stop offset=".55" stop-color="${L.bezel}"/><stop offset="1" stop-color="${shade(L.bezel, -.22)}"/></linearGradient>
<linearGradient id="${id}hsun" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#28639b" stop-opacity="0"/><stop offset=".48" stop-color="#28639b" stop-opacity=".4"/><stop offset="1" stop-color="#28639b" stop-opacity="0"/></linearGradient>
<radialGradient id="${id}hdl" cx=".46" cy=".36" r=".8"><stop stop-color="${shade(L.dial, .015)}"/><stop offset=".55" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.55)}"/></radialGradient>
<pattern id="${id}hbr" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="rotate(48)"><path d="M0,0V.5M.22,0V.5" stroke="#fff" stroke-width=".05" opacity=".08"/><path d="M.11,0V.5M.38,0V.5" stroke="#4e5554" stroke-width=".04" opacity=".06"/></pattern>
</defs>`;
}

/** Knurled crown at 3 o'clock: 6.6 mm across, standing about 3.6 mm proud, with a smooth rounded end. */
function crown(R: number, id: string, metal: string, outline: boolean, stroke: string) {
  const h = 3.3, proud = 3.6;
  let s = `<g transform="translate(${f(R - .35)} 0)">`;
  if (!outline) s += `<rect x="-.55" y="${-h + .15}" width="1.1" height="${f((h - .15) * 2)}" rx=".4" fill="${shade(metal, -.5)}"/>`;
  s += `<path d="M0,${-h}H${f(proud - 1.15)}Q${f(proud)},${-h} ${f(proud)},0Q${f(proud)},${h} ${f(proud - 1.15)},${h}H0Z" fill="${outline ? 'none' : `url(#${id}hcy)`}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -8; i <= 8; i++) {
      grooves += `M.2,${f(i * .36)}H${f(proud - 1.25)}`;
      lights += `M.25,${f(i * .36 + .12)}H${f(proud - 1.3)}`;
    }
    s += `<path d="${grooves}" stroke="${shade(metal, -.55)}" stroke-width=".13"/><path d="${lights}" stroke="#fff" stroke-width=".07" opacity=".75"/>`;
    s += `<path d="M${f(proud - .15)},${f(-h + .35)}Q${f(proud - .15)},0 ${f(proud - .15)},${f(h - .35)}" fill="none" stroke="#fff" stroke-width=".28" opacity=".7"/>`;
  }
  return s + '</g>';
}

/** Coin-edge bezel, blue insert, triangle with a lume pip, minute dots, bars and numerals. */
function bezel(k: number, id: string, L: FullLook) {
  let crests = '', facets = '';
  const n = 120;
  for (let i = 0; i < n; i++) {
    const a = i * 360 / n, half = 180 / n;
    crests += `M${pt(k * 1.01, a - half)}Q${pt(k * 1.044, a)} ${pt(k * 1.01, a + half)}Z`;
    facets += `M${pt(k * 1.032, a)}L${pt(k * 1.01, a + half)}L${pt(k * 1.02, a + half * .35)}Z`;
  }
  let s = `<circle r="${f(k * 1.02)}" fill="url(#${id}hcy)"/><path d="${crests}" fill="${shade(L.caseColor, .55)}" stroke="${shade(L.caseColor, -.22)}" stroke-width=".04"/><path d="${facets}" fill="${shade(L.caseColor, -.25)}" opacity=".55"/>`;
  s += `<circle r="${f(k * 1.008)}" fill="none" stroke="#f4f5f2" stroke-width=".16"/>`;
  s += `<circle r="${f(k * .998)}" fill="url(#${id}hbe)"/><circle r="${f(k * .998)}" fill="none" stroke="#d5dbe4" stroke-width=".1"/>`;
  const bt = L.bezelText;
  let dots = '', bars = '';
  for (let m = 1; m < 60; m++) {
    if (m % 10 === 0) continue;
    const a = m * 6;
    if (m % 5 === 0) bars += `M${pt(k * .972, a)}L${pt(k * .835, a)}`;
    else {
      const [x, y] = P(k * .868, a), r = k * .015;
      dots += `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
    }
  }
  s += `<path d="${dots}" fill="${bt}"/><path d="${bars}" stroke="${bt}" stroke-width="${f(k * .026)}" stroke-linecap="butt"/>`;
  // 12: triangle pointing in, with a lume pip.
  const base = k * .985, tip = k * .825, half = k * .115;
  s += `<path d="M${f(-half)},${f(-base)}H${f(half)}L0,${f(-tip)}Z" fill="${bt}"/>`;
  s += `<circle cy="${f(-k * .935)}" r="${f(k * .034)}" fill="${L.lume}"${lu('bezel')} stroke="#8d93a0" stroke-width=".1"/>`;
  s += `<g fill="${bt}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .178)}" font-weight="400" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40, 50]) {
    const a = v * 6, [x, y] = P(k * .905, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(1.1 .96) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  return s + '</g>';
}

/** Thin dark crystal seat with minute printing extending onto the blue dial. */
function chapter(k: number, id: string) {
  let minor = '', major = '';
  for (let i = 0; i < 60; i++) {
    if (i === 0 || i === 30) continue;
    const a = i * 6;
    if (i % 5) minor += `M${pt(k * .755, a)}L${pt(k * .688, a)}`;
    else major += `M${pt(k * .758, a)}L${pt(k * .686, a)}`;
  }
  const y0 = -k * .758, y1 = -k * .685;
  return `<circle r="${f(k * .777)}" fill="none" stroke="url(#${id}hch)" stroke-width="${f(k * .025)}"/>`
    + `<circle r="${f(k * .791)}" fill="none" stroke="#e7ebf0" stroke-width=".12"/>`
    + `<path d="${minor}" stroke="#f3f5f4" stroke-width="${f(k * .01)}"/><path d="${major}" stroke="#fff" stroke-width="${f(k * .02)}"/>`
    + `<rect x="${f(-k * .022)}" y="${f(y0)}" width="${f(k * .044)}" height="${f(y1 - y0)}" rx=".04" fill="#fff"/>`
    + `<rect x="${f(-k * .016)}" y="${f(k * .689)}" width="${f(k * .032)}" height="${f(k * .032)}" fill="#fff"/>`
    + `<circle r="${f(k * .763)}" fill="none" stroke="#0c1424" stroke-width=".08"/>`;
}

function rrect(x: number, y: number, w: number, h: number, r: number) {
  const x2 = x + w, y2 = y + h, rr = Math.min(r, w / 2, h / 2);
  return `M${f(x + rr)},${f(y)}H${f(x2 - rr)}Q${f(x2)},${f(y)} ${f(x2)},${f(y + rr)}V${f(y2 - rr)}Q${f(x2)},${f(y2)} ${f(x2 - rr)},${f(y2)}H${f(x + rr)}Q${f(x)},${f(y2)} ${f(x)},${f(y2 - rr)}V${f(y + rr)}Q${f(x)},${f(y)} ${f(x + rr)},${f(y)}Z`;
}

/** Applied indices. Every hour has one, including 3; 12 is a double bar. The date sits between 4 and 5. */
function markers(k: number, id: string) {
  let shadow = '', metal = '', lume = '';
  const add = (a: number, x: number, y: number, w: number, h: number) => {
    const t = ` transform="rotate(${a})"`;
    const m = k * .012;
    shadow += `<path d="${rrect(x, y, w, h, k * .009)}"${t}/>`;
    metal += `<path d="${rrect(x, y, w, h, k * .009)}"${t}/>`;
    lume += `<path d="${rrect(x + m, y + m, w - 2 * m, h - 2 * m, k * .006)}"${t}/>`;
  };
  const outer = -k * .65, len = k * .18, w = k * .115;
  for (let h = 1; h < 12; h++) add(h * 30, -w / 2, outer, w, len);
  const dw = k * .079, gap = k * .009;
  add(0, -(dw + gap / 2), outer, dw, len);
  add(0, gap / 2, outer, dw, len);
  return `<g fill="#000" opacity=".32" transform="translate(.08 .12)">${shadow}</g><g fill="#788580" stroke="#c8d0cb" stroke-width=".055">${metal}</g><g fill="url(#${id}hlu)"${lu('indices')} stroke="#e2e8e2" stroke-width=".045">${lume}</g>`;
}

/**
 * Hour and minute hands follow the sword set used on the Willard and SPB317: arrow tip, lume insert,
 * counterweight, brushed and polished halves. The seconds hand is this dial's own needle and rectangular lume.
 */
function hands(k: number, id: string, L: FullLook) {
  const hw = k * .096, mw = k * .062;
  const hour = `M${f(-hw * .42)},${f(k * .02)}L${f(-hw / 2)},${f(-k * .40)}L${f(-hw * .28)},${f(-k * .45)}H${f(hw * .28)}L${f(hw / 2)},${f(-k * .40)}L${f(hw * .42)},${f(k * .02)}Z`;
  const hourTail = `M${f(-hw * .46)},0V${f(k * .14)}L0,${f(k * .158)}L${f(hw * .46)},${f(k * .14)}V0Z`;
  const hourLume = `M${f(-hw * .3)},${f(-k * .19)}V${f(-k * .365)}L0,${f(-k * .415)}L${f(hw * .3)},${f(-k * .365)}V${f(-k * .19)}Z`;
  const minute = `M${f(-mw * .45)},${f(k * .02)}L${f(-mw / 2)},${f(-k * .62)}L0,${f(-k * .69)}L${f(mw / 2)},${f(-k * .62)}L${f(mw * .45)},${f(k * .02)}Z`;
  const minuteTail = `M${f(-mw * .5)},0V${f(k * .145)}H${f(mw * .5)}V0Z`;
  const minuteLume = `M${f(-mw * .28)},${f(-k * .09)}V${f(-k * .59)}L0,${f(-k * .63)}L${f(mw * .28)},${f(-k * .59)}V${f(-k * .09)}Z`;
  const brushed = shade(L.handColor, -.28), polished = L.handColor;
  const hourFace = `M0,${f(-k * .45)}H${f(hw * .28)}L${f(hw / 2)},${f(-k * .40)}L${f(hw * .42)},${f(k * .02)}H0Z M0,0H${f(hw * .46)}V${f(k * .14)}L0,${f(k * .158)}Z`;
  const minuteFace = `M0,${f(-k * .69)}L${f(mw / 2)},${f(-k * .62)}L${f(mw * .45)},${f(k * .02)}H0Z M0,0H${f(mw * .5)}V${f(k * .145)}H0Z`;
  const ha = 303, ma = 52, sa = 252;
  let s = `<g fill="#000" opacity=".28" transform="translate(.16 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${hourTail}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${minuteTail}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hourTail}" fill="${brushed}"/><path d="${hour}" fill="${brushed}" stroke="#f2f3f0" stroke-width=".06"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}hlu)"${lu('hands')} stroke="#b7bdb4" stroke-width=".05"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minuteTail}" fill="${brushed}"/><path d="${minute}" fill="${brushed}" stroke="#f2f3f0" stroke-width=".06"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="url(#${id}hlu)"${lu('hands')} stroke="#b7bdb4" stroke-width=".05"/></g>`;
  // Seconds: a needle to the minute track, with a small framed lume rectangle and no coloured dot.
  const capY = -k * .595, capH = k * .1, cw = k * .03;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.055,${f(k * .17)}H.055L.04,${f(-k * .71)}H-.04Z" fill="${L.accent}"/>`
    + `<rect x="${f(-cw)}" y="${f(capY)}" width="${f(cw * 2)}" height="${f(capH)}" rx="${f(cw * .4)}" fill="${L.accent}" stroke="#6e7674" stroke-width=".05"/>`
    + `<rect x="${f(-cw * .58)}" y="${f(capY + k * .016)}" width="${f(cw * 1.16)}" height="${f(capH - k * .032)}" rx="${f(cw * .28)}" fill="${L.lume}"${lu('seconds')}/></g>`;
  return s + `<circle r="${f(k * .028)}" fill="url(#${id}hst)" stroke="#e4e7e3" stroke-width=".06"/><circle r="${f(k * .011)}" fill="#5c6462"/>`;
}

export interface SPB451Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the 1965 heritage diver. */
export function spb451SVG(o: SPB451Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor;
  const { d, k } = spb451Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(metal, -.28)}" stroke-width=".12"`}/>`;
  s += crown(D / 2, id, metal, outline, o.stroke);
  if (outline) {
    return s + `<circle r="${f(k * 1.04)}" fill="none" ${o.stroke}/><circle r="${f(k * .763)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }
  // Narrow chamfers follow the tapered lug flanks, disappearing beneath the bezel.
  const u = D / 40, tip = lw / 2 + 2.45 * u, H = LL / 2;
  const facet = `M${f(tip - .15 * u)},${f(-H + .48 * u)}L${f(18.5 * u)},${f(-8.3 * u)}L${f(17.25 * u)},${f(-10.7 * u)}L${f(tip - 1.15 * u)},${f(-H + .12 * u)}Z`;
  let bevels = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    bevels += `<path d="${facet}" transform="scale(${sx} ${sy})" fill="${shade(metal, sx < 0 ? -.16 : -.1)}"/>`;
  }
  s += `<defs><clipPath id="${id}hcc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}hcc)">${bevels}<path d="${d}" fill="url(#${id}hbr)"/><path d="${d}" fill="none" stroke="${shade(metal, -.32)}" stroke-width=".42"/><path d="${d}" fill="none" stroke="${shade(metal, .62)}" stroke-width=".16"/></g>`;
  s += bezel(k, id, L);
  let grain = '';
  for (let i = 0; i < 90; i++) grain += `M${pt(k * .12, i * 4)}L${pt(k * .7, i * 4)}`;
  s += `<circle r="${f(k * .764)}" fill="url(#${id}hdl)"/><path d="${grain}" stroke="#487199" stroke-width=".025" opacity=".055"/>`;
  // Broad, low-contrast sunburst lobes, rather than a pale hotspot across the dial.
  const fan = `M0,0L${pt(k * .763, 325)}A${f(k * .763)},${f(k * .763)} 0 0 1 ${pt(k * .763, 30)}Z`;
  s += `<path d="${fan}" fill="url(#${id}hsun)"/><path d="${fan}" transform="rotate(180)" fill="url(#${id}hsun)" opacity=".7"/>`;
  s += chapter(k, id);
  s += markers(k, id);
  if (L.date) {
    // Day-of-month at 4:30, the same corner as the SPB317: a black disc and a light numeral.
    const [x, y] = P(k * .57, 135);
    const r = k * .05;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r + k * .008)}" fill="url(#${id}hst)" stroke="#6a726f" stroke-width=".05"/>`;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#07090c"/>`;
    s += `<text x="${f(x)}" y="${f(y)}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .09)}" font-weight="400" text-anchor="middle" dominant-baseline="central" fill="${L.lume}">6</text>`;
  }
  const ink = L.bezelText;
  s += `<text y="${f(-k * .27)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .088)}" font-weight="700" textLength="${f(k * .35)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">${esc(o.brand.toUpperCase())}</text>`;
  const xs = k * .044;
  s += `<g transform="translate(0 ${f(k * .2)})"><path d="M${f(xs * .45)},${f(-xs)}H${f(xs * 1.1)}L${f(-xs * .45)},${f(xs)}H${f(-xs * 1.1)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .16)}" stroke-linejoin="miter"/><path d="M${f(-xs * 1.2)},${f(-xs)}H${f(-xs * .3)}L${f(xs * 1.2)},${f(xs)}H${f(xs * .3)}Z" fill="${ink}"/></g>`;
  s += `<g fill="${ink}" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text y="${f(k * .305)}" font-size="${f(k * .044)}" textLength="${f(k * .5)}" lengthAdjust="spacingAndGlyphs">AUTOMATIC 3 DAYS</text><text y="${f(k * .372)}" font-size="${f(k * .05)}" font-weight="700" textLength="${f(k * .46)}" lengthAdjust="spacingAndGlyphs">DIVER’S 300m</text></g>`;
  s += hands(k, id, L);
  s += `<path d="M${f(-k * .55)},${f(-k * .18)}A${f(k * .72)},${f(k * .72)} 0 0 1 ${f(k * .18)},${f(-k * .55)}A${f(k * .95)},${f(k * .95)} 0 0 0 ${f(-k * .55)},${f(-k * .18)}Z" fill="#fff" opacity=".07"/>`;
  return s;
}
