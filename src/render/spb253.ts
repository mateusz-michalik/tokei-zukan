import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Seiko Black Series 1965 diver (SPB253): short-lug round case, coin-edge bezel,
// orange 10 and minute hand, date at 3. Furniture is sized in units of k, the
// bezel insert's outer radius. The case is in millimetres.
// See docs/models/seiko-spb253.md.

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
 * the lug width. Shoulders meet the circle near 2 and 4 o'clock; tips sit at the lug-to-lug.
 */
export function spb253Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = R / 20;
  const k = R / 1.045;
  const ri = .28 * u, seat = -k * .975, xTip = slot + 1.75 * u;
  const join = 68;
  const ang = ((join - 90) * Math.PI) / 180;
  const tangent: XY = [-Math.sin(ang), Math.cos(ang)];
  // Outer shoulder, scaled with the case. The tip is short: lug-to-lug is only 7 mm over the diameter.
  const shoulder: XY[] = [
    [12.6 * u, -20.4 * u], [14.2 * u, -16.8 * u], [16.0 * u, -13.2 * u], [17.5 * u, -10.4 * u], [18.45 * u, -8.15 * u],
  ];
  const cubics = (from: XY, pts: XY[], to: XY, arrive: XY) => {
    const all = [from, ...pts, to];
    let d = '';
    for (let i = 0; i < all.length - 1; i++) {
      const p0 = all[Math.max(0, i - 1)], p1 = all[i], p2 = all[i + 1], p3 = all[Math.min(all.length - 1, i + 2)];
      let c1: XY = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      let c2: XY = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      if (i === 0) c1 = [p1[0] + (p2[0] - p1[0]) / 3, p1[1] + (p2[1] - p1[1]) / 3];
      if (i === all.length - 2) {
        const prev = pts[pts.length - 1];
        const len = Math.max(.9 * u, Math.hypot(to[0] - prev[0], to[1] - prev[1]) / 2.4);
        c2 = [to[0] - arrive[0] * len, to[1] - arrive[1] * len];
      }
      d += `C${xy(c1)} ${xy(c2)} ${xy(p2)}`;
    }
    return d;
  };
  const forward = (sx: number, sy: number, arrive: XY) => {
    const tip: XY = [sx * xTip, sy * (-H + .42 * u)];
    const wall: Seg[] = [
      { c: [], p: [sx * slot, sy * (-H + ri)] },
      { c: [[sx * slot, sy * -H]], p: [sx * (slot + ri), sy * -H] },
      { c: [], p: [sx * (xTip - ri), sy * (-H + .18 * u)] },
      { c: [[sx * xTip, sy * (-H + .18 * u)]], p: tip },
    ];
    const pts = shoulder.map(([x, y]): XY => [sx * x, sy * y]);
    const dest = P(R, sy > 0 ? (sx > 0 ? join : 360 - join) : (sx > 0 ? 180 - join : 180 + join));
    return `${segPath(wall)}${cubics(tip, pts, dest, arrive)}`;
  };
  const arc = (p: XY) => `A${f(R)},${f(R)} 0 0 1 ${xy(p)}`;
  const bow = .4 * u;
  const startTR: XY = [slot, seat];
  const startBR: XY = [slot, -seat];
  const startTL: XY = [-slot, seat];
  const tr = forward(1, 1, tangent);
  const br = reverse(startBR, pathSegs(forward(1, -1, [tangent[0], -tangent[1]])));
  const bl = forward(-1, -1, [-tangent[0], -tangent[1]]);
  const tl = reverse(startTL, pathSegs(forward(-1, 1, [-tangent[0], tangent[1]])));
  const d = `M${xy(startTR)}${tr}${arc(P(R, 112))}${segPath(br)}Q0,${f(-seat - bow)} ${f(-slot)},${f(-seat)}${bl}${arc(P(R, 292))}${segPath(tl)}Q0,${f(seat + bow)} ${xy(startTR)}Z`;
  return { d, k };
}

function defs(id: string, L: FullLook, metal: string) {
  return `<defs>
<linearGradient id="${id}cs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(metal, .16)}"/><stop offset=".42" stop-color="${metal}"/><stop offset="1" stop-color="${shade(metal, -.4)}"/></linearGradient>
<linearGradient id="${id}cy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.18)}"/><stop offset=".32" stop-color="${shade(metal, .38)}"/><stop offset=".5" stop-color="${shade(metal, .58)}"/><stop offset="1" stop-color="${shade(metal, -.46)}"/></linearGradient>
<linearGradient id="${id}lu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.lume, .12)}"/><stop offset="1" stop-color="${shade(L.lume, -.12)}"/></linearGradient>
<radialGradient id="${id}dl" cx=".44" cy=".38" r=".82"><stop stop-color="${shade(L.dial, .05)}"/><stop offset=".62" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.45)}"/></radialGradient>
<linearGradient id="${id}be" x1="0" y1="0" x2="1" y2=".6"><stop stop-color="${shade(L.bezel, .13)}"/><stop offset=".6" stop-color="${L.bezel}"/><stop offset="1" stop-color="${shade(L.bezel, -.35)}"/></linearGradient>
<linearGradient id="${id}re" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4b5254"/><stop offset=".35" stop-color="#23282a"/><stop offset=".7" stop-color="#727a7c"/><stop offset="1" stop-color="#d1d7d4"/></linearGradient>
<pattern id="${id}br" patternUnits="userSpaceOnUse" width=".55" height=".55" patternTransform="rotate(28)"><path d="M0,0V.55M.28,0V.55" stroke="#fff" stroke-width=".04" opacity=".05"/></pattern>
</defs>`;
}

/** Knurled crown at 3 o'clock, about 6.4 mm across and 3.4 mm proud of the case. */
function crown(R: number, id: string, metal: string, outline: boolean, stroke: string) {
  const h = 3.2, proud = 3.4;
  let s = `<g transform="translate(${f(R - .4)} 0)">`;
  if (!outline) s += `<rect x="-.5" y="${-h + .2}" width="1.05" height="${f((h - .2) * 2)}" rx=".35" fill="${shade(metal, -.55)}"/>`;
  s += `<path d="M0,${-h}H${f(proud - 1.05)}Q${f(proud)},${-h} ${f(proud)},0Q${f(proud)},${h} ${f(proud - 1.05)},${h}H0Z" fill="${outline ? 'none' : `url(#${id}cy)`}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -8; i <= 8; i++) {
      grooves += `M.15,${f(i * .34)}H${f(proud - 1.15)}`;
      lights += `M.2,${f(i * .34 + .1)}H${f(proud - 1.2)}`;
    }
    s += `<path d="${grooves}" stroke="${shade(metal, -.65)}" stroke-width=".11"/><path d="${lights}" stroke="#e2e6e8" stroke-width=".05" opacity=".75"/>`;
    s += `<path d="M${f(proud - .12)},${f(-h + .4)}Q${f(proud + .02)},0 ${f(proud - .12)},${f(h - .4)}" fill="none" stroke="#fff" stroke-width=".22" opacity=".5"/>`;
  }
  return s + '</g>';
}

/** Plateau-crested coin edge; orange triangle, dots and bars through 15, and an orange 10. */
function bezel(k: number, id: string, L: FullLook) {
  const orange = L.minuteLume || '#E8742A';
  let crests = '', facets = '';
  const teeth = 60, step = 360 / teeth, half = step / 2;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    crests += `M${pt(k * .995, a - half)}Q${pt(k * 1.044, a - half * .75)} ${pt(k * 1.044, a - half * .45)}L${pt(k * 1.044, a + half * .45)}Q${pt(k * 1.044, a + half * .75)} ${pt(k * .995, a + half)}Z`;
    facets += `M${pt(k * 1.04, a)}L${pt(k * 1.044, a + half * .45)}L${pt(k * .995, a + half)}L${pt(k * 1.015, a + half * .4)}Z`;
  }
  let s = `<circle r="${f(k * 1.02)}" fill="${shade(L.caseColor, -.28)}"/>`;
  s += `<path d="${crests}" fill="${shade(L.caseColor, .2)}" stroke="${shade(L.caseColor, -.18)}" stroke-width=".045"/>`;
  s += `<path d="${facets}" fill="#17191c" opacity=".72"/>`;
  s += `<circle r="${f(k * 1.006)}" fill="none" stroke="${shade(L.caseColor, .34)}" stroke-width=".11"/>`;
  s += `<circle r="${f(k * .998)}" fill="url(#${id}be)"/>`;
  s += `<circle r="${f(k * .998)}" fill="none" stroke="#858b8f" stroke-width=".08"/>`;
  const bt = L.bezelText;
  let dots = '', orangeDots = '', bars = '', orangeBars = '';
  for (let m = 1; m < 60; m++) {
    if (m % 10 === 0) continue;
    const a = m * 6;
    if (m % 5 === 0) {
      const d = `M${pt(k * .975, a)}L${pt(k * .835, a)}`;
      if (m <= 15) orangeBars += d; else bars += d;
    } else {
      const [x, y] = P(k * .868, a), r = k * .013;
      const d = `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
      if (m < 15) orangeDots += d; else dots += d;
    }
  }
  s += `<path d="${dots}" fill="${bt}"/><path d="${orangeDots}" fill="${orange}"/><path d="${bars}" stroke="${bt}" stroke-width="${f(k * .03)}"/><path d="${orangeBars}" stroke="${orange}" stroke-width="${f(k * .03)}"/>`;
  const base = k * .99, tip = k * .828, th = k * .12;
  s += `<path d="M${f(-th)},${f(-base)}H${f(th)}L0,${f(-tip)}Z" fill="${orange}"/>`;
  s += `<circle cy="${f(-k * .93)}" r="${f(k * .03)}" fill="${L.lume}"${lu('bezel')} stroke="${shade(orange, -.35)}" stroke-width=".08"/>`;
  s += `<g font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .178)}" font-weight="400" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40, 50]) {
    const a = v * 6, [x, y] = P(k * .9, a);
    const fill = v === 10 ? orange : bt;
    s += `<text x="${f(x)}" y="${f(y)}" fill="${fill}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(1.08 .92) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  return s + '</g>';
}

/** Narrow steel crystal seat and the printed minute track on the dial. */
function chapter(k: number, id: string) {
  let minor = '', major = '';
  for (let i = 0; i < 60; i++) {
    if (i === 0) continue;
    const a = i * 6;
    if (i % 5) minor += `M${pt(k * .758, a)}L${pt(k * .708, a)}`;
    else major += `M${pt(k * .762, a)}L${pt(k * .698, a)}`;
  }
  const y0 = -k * .762, y1 = -k * .692;
  return `<circle r="${f(k * .786)}" fill="none" stroke="url(#${id}re)" stroke-width="${f(k * .025)}"/>`
    + `<circle r="${f(k * .796)}" fill="none" stroke="#e7ebef" stroke-width=".1"/>`
    + `<circle r="${f(k * .774)}" fill="none" stroke="#2a2e32" stroke-width=".1"/>`
    + `<path d="${minor}" stroke="#d9ddd8" stroke-width="${f(k * .008)}"/>`
    + `<path d="${major}" stroke="#f4f6f4" stroke-width="${f(k * .016)}"/>`
    + `<rect x="${f(-k * .018)}" y="${f(y0)}" width="${f(k * .036)}" height="${f(y1 - y0)}" rx=".03" fill="#f4f6f4"/>`;
}

function rrect(x: number, y: number, w: number, h: number, r: number) {
  const x2 = x + w, y2 = y + h, rr = Math.min(r, w / 2, h / 2);
  return `M${f(x + rr)},${f(y)}H${f(x2 - rr)}Q${f(x2)},${f(y)} ${f(x2)},${f(y + rr)}V${f(y2 - rr)}Q${f(x2)},${f(y2)} ${f(x2 - rr)},${f(y2)}H${f(x + rr)}Q${f(x)},${f(y2)} ${f(x)},${f(y2 - rr)}V${f(y + rr)}Q${f(x)},${f(y)} ${f(x + rr)},${f(y)}Z`;
}

/** Framed batons, a divided 12, and a short lume plot beyond the date at 3. */
function markers(k: number, id: string) {
  let shadow = '', metal = '', lume = '';
  const add = (a: number, x: number, y: number, w: number, h: number) => {
    const t = ` transform="rotate(${a})"`;
    const m = k * .011;
    shadow += `<path d="${rrect(x, y, w, h, k * .012)}"${t}/>`;
    metal += `<path d="${rrect(x, y, w, h, k * .012)}"${t}/>`;
    lume += `<path d="${rrect(x + m, y + m, w - 2 * m, h - 2 * m, k * .008)}"${t}/>`;
  };
  const outer = -k * .64, len = k * .17, w = k * .10;
  for (let h = 1; h < 12; h++) if (h !== 3) add(h * 30, -w / 2, outer, w, len);
  add(90, -k * .044, -k * .715, k * .088, k * .045);
  // A single metal frame holds two ivory inserts at 12.
  const twelve = rrect(-k * .085, outer, k * .17, len, k * .008);
  shadow += `<path d="${twelve}"/>`;
  metal += `<path d="${twelve}"/>`;
  for (const side of [-1, 1]) lume += `<path d="${rrect(k * .006, outer + k * .012, k * .065, len - k * .024, k * .003)}" transform="scale(${side} 1)"/>`;
  return `<g fill="#000" opacity=".28" transform="translate(.08 .12)">${shadow}</g><g fill="#7e8682" stroke="#d5dbd6" stroke-width=".05">${metal}</g><g fill="url(#${id}lu)"${lu('indices')} stroke="#c9c3b0" stroke-width=".04">${lume}</g>`;
}

/**
 * Steel hour hand with a lume insert, orange minute hand, and a light seconds needle
 * with a rectangular lume capsule. Angles match the reference photograph.
 */
function hands(k: number, id: string, L: FullLook) {
  const hw = k * .096, mw = k * .062;
  const hour = `M${f(-hw * .42)},${f(k * .02)}L${f(-hw / 2)},${f(-k * .40)}L${f(-hw * .28)},${f(-k * .45)}H${f(hw * .28)}L${f(hw / 2)},${f(-k * .40)}L${f(hw * .42)},${f(k * .02)}Z`;
  const hourTail = `M${f(-hw * .46)},0V${f(k * .14)}L0,${f(k * .158)}L${f(hw * .46)},${f(k * .14)}V0Z`;
  const hourLume = `M${f(-hw * .3)},${f(-k * .19)}V${f(-k * .365)}L0,${f(-k * .415)}L${f(hw * .3)},${f(-k * .365)}V${f(-k * .19)}Z`;
  const minute = `M${f(-mw * .45)},${f(k * .02)}L${f(-mw / 2)},${f(-k * .62)}L0,${f(-k * .69)}L${f(mw / 2)},${f(-k * .62)}L${f(mw * .45)},${f(k * .02)}Z`;
  const minuteTail = `M${f(-mw * .5)},0V${f(k * .145)}H${f(mw * .5)}V0Z`;
  const minuteLume = `M${f(-mw * .35)},${f(-k * .09)}V${f(-k * .60)}L0,${f(-k * .645)}L${f(mw * .35)},${f(-k * .60)}V${f(-k * .09)}Z`;
  const brushed = shade(L.handColor, -.28), polished = L.handColor;
  const hourFace = `M0,${f(-k * .45)}H${f(hw * .28)}L${f(hw / 2)},${f(-k * .40)}L${f(hw * .42)},${f(k * .02)}H0Z M0,0H${f(hw * .46)}V${f(k * .14)}L0,${f(k * .158)}Z`;
  const minuteFace = `M0,${f(-k * .69)}L${f(mw / 2)},${f(-k * .62)}L${f(mw * .45)},${f(k * .02)}H0Z M0,0H${f(mw * .5)}V${f(k * .145)}H0Z`;
  const ha = 300, ma = 53, sa = 252;
  let s = `<g fill="#000" opacity=".28" transform="translate(.16 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${hourTail}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${minuteTail}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hourTail}" fill="${brushed}"/><path d="${hour}" fill="${brushed}" stroke="#939a96" stroke-width=".06"/><path d="${hourFace}" fill="${polished}"/><path d="${hourLume}" fill="url(#${id}lu)"${lu('hands')} stroke="#8c9288" stroke-width=".05"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minuteTail}" fill="${brushed}"/><path d="${minute}" fill="${brushed}" stroke="#939a96" stroke-width=".06"/><path d="${minuteFace}" fill="${polished}"/><path d="${minuteLume}" fill="${L.minuteLume || '#F4A12A'}"${lu('hands')} stroke="#8c9288" stroke-width=".05"/></g>`;
  // Seconds: a needle to the minute track, with a small framed lume rectangle and no coloured dot.
  const capY = -k * .595, capH = k * .1, cw = k * .03;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.055,${f(k * .17)}H.055L.04,${f(-k * .71)}H-.04Z" fill="${L.handColor}"/>`
    + `<rect x="${f(-cw)}" y="${f(capY)}" width="${f(cw * 2)}" height="${f(capH)}" rx="${f(cw * .4)}" fill="${L.handColor}" stroke="#6e7674" stroke-width=".05"/>`
    + `<rect x="${f(-cw * .58)}" y="${f(capY + k * .016)}" width="${f(cw * 1.16)}" height="${f(capH - k * .032)}" rx="${f(cw * .28)}" fill="${L.lume}"${lu('seconds')}/></g>`;
  return s + `<circle r="${f(k * .028)}" fill="${L.handColor}" stroke="#858c86" stroke-width=".06"/><circle r="${f(k * .011)}" fill="#5c6462"/>`;
}

export interface SPB253Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Black Series 1965 diver. */
export function spb253SVG(o: SPB253Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor;
  const { d, k } = spb253Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}cs)`}" ${outline ? o.stroke : `stroke="${shade(metal, .5)}" stroke-width=".14"`}/>`;
  if (!outline) {
    const u = D / 40, tip = lw / 2 + 1.75 * u, H = LL / 2;
    const facet = `M${f(tip - .15 * u)},${f(-H + .45 * u)}L${f(17.6 * u)},${f(-9.2 * u)}L${f(16.5 * u)},${f(-11.2 * u)}L${f(tip - .9 * u)},${f(-H + .12 * u)}Z`;
    let bevels = '';
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bevels += `<path d="${facet}" transform="scale(${sx} ${sy})" fill="${shade(metal, sx < 0 ? -.22 : .06)}"/>`;
    s += `<defs><clipPath id="${id}cc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}cc)">${bevels}<path d="${d}" fill="url(#${id}br)"/><path d="${d}" fill="none" stroke="${shade(metal, -.45)}" stroke-width=".35"/><path d="${d}" fill="none" stroke="${shade(metal, .55)}" stroke-width=".12"/></g>`;
  }
  s += crown(D / 2, id, metal, outline, o.stroke);
  if (outline) {
    return s + `<circle r="${f(k * 1.045)}" fill="none" ${o.stroke}/><circle r="${f(k * .77)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }
  s += bezel(k, id, L);
  s += `<circle r="${f(k * .772)}" fill="url(#${id}dl)"/>`;
  s += chapter(k, id);
  s += markers(k, id);
  if (L.date) {
    const dx = k * .575, dy = 0, w = k * .15, h = k * .10;
    s += `<rect x="${f(dx - w / 2 - k * .012)}" y="${f(dy - h / 2 - k * .012)}" width="${f(w + k * .024)}" height="${f(h + k * .024)}" rx=".14" fill="#303532" stroke="#6a706c" stroke-width=".05"/>`;
    s += `<rect x="${f(dx - w / 2)}" y="${f(dy - h / 2)}" width="${f(w)}" height="${f(h)}" rx=".06" fill="#f4f5f2"/>`;
    s += `<text x="${f(dx)}" y="${f(dy)}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .105)}" textLength="${f(k * .115)}" lengthAdjust="spacingAndGlyphs" font-weight="400" text-anchor="middle" dominant-baseline="central" fill="#16181b">6</text>`;
  }
  const ink = '#E4E7DE';
  s += `<text y="${f(-k * .255)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .086)}" font-weight="700" textLength="${f(k * .36)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">${esc(o.brand.toUpperCase())}</text>`;
  const xs = k * .042;
  s += `<g transform="translate(0 ${f(k * .21)})"><path d="M${f(xs * .45)},${f(-xs)}H${f(xs * 1.1)}L${f(-xs * .45)},${f(xs)}H${f(-xs * 1.1)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .15)}" stroke-linejoin="miter"/><path d="M${f(-xs * 1.2)},${f(-xs)}H${f(-xs * .3)}L${f(xs * 1.2)},${f(xs)}H${f(xs * .3)}Z" fill="${ink}"/></g>`;
  s += `<g fill="${ink}" font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text y="${f(k * .292)}" font-size="${f(k * .044)}" letter-spacing=".04" textLength="${f(k * .34)}" lengthAdjust="spacingAndGlyphs">AUTOMATIC</text><text y="${f(k * .362)}" font-size="${f(k * .05)}" font-weight="700" textLength="${f(k * .46)}" lengthAdjust="spacingAndGlyphs">DIVER’S 200m</text></g>`;
  s += hands(k, id, L);
  s += `<path d="M${f(-k * .52)},${f(-k * .16)}A${f(k * .7)},${f(k * .7)} 0 0 1 ${f(k * .16)},${f(-k * .52)}A${f(k * .92)},${f(k * .92)} 0 0 0 ${f(-k * .52)},${f(-k * .16)}Z" fill="#fff" opacity=".055"/>`;
  return s;
}
