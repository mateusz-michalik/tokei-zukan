import { DEFAULT_LOOK } from '../catalog/defaults';
import type { FullLook, Look, Night, Strap } from '../catalog/schema';
import { esc, l2l, num, shade } from '../lib/util';
import { WILLARD_BEZEL } from './cases';
import { P, ringSeg, superellipse } from './geom';
import { lu, nightify, type Lighting } from './night';
import { strapSVG } from './strap';
import { slimBezelEdge, slimCase, slimChapter, slimDialDefs, slimHands, slimMarker } from './spb317';
import { spb451SVG } from './spb451';
import { spb519SVG } from './spb519';
import { ssc947SVG } from './ssc947';
import { spb151SVG } from './spb151';
import { spb253SVG } from './spb253';
import { spb255SVG } from './spb255';
import { srpk01SVG } from './srpk01';
import { mk2395SVG } from './mk2395';
import { c60300SVG } from './c60300';
import { oris771SVG } from './oris771';
import { serica5303SVG } from './serica5303';
import { ssk003SVG } from './ssk003';
import { spb507SVG } from './spb507';
import { srpb43SVG } from './srpb43';
import { f91wSVG } from './f91w';
import { handRole, type HandRole } from './hands';

/** The fields the renderer reads. Sizes may be null while a watch is being edited. */
export interface RenderableWatch {
  id?: string;
  brand?: string;
  ref?: string;
  diameter?: number | null;
  lugToLug?: number | null;
  lugWidth?: number | null;
  look?: Look;
  /** What it's sold on. */
  strap?: Strap;
  /** What the user has chosen to see it on, if different. */
  wornStrap?: Strap;
  night?: Night;
  /** Seconds-hand steps per second, for live time. */
  beats?: number;
}

export interface WatchRenderOptions {
  /** mm of strap drawn beyond each end of the case. */
  strapLen?: number;
  /** Draw only the case and crystal outline, in `color`. */
  outline?: boolean;
  color?: string;
  sw?: number;
  /** Draw on this strap instead of the watch's own. */
  strap?: Strap;
  /** At dusk or night the surfaces dim and the lume glows. Ignored for outlines. */
  lighting?: Lighting;
}

let uidc = 0;
/** Gradient ids are unique per render; tests reset the counter so output is stable. */
export const resetRenderIds = () => { uidc = 0; };

export const fullLook = (look?: Look): FullLook => ({ ...DEFAULT_LOOK, ...(look || {}) });

/** The strap to draw: the user's choice, else what it's sold on, else a leather strap in the legacy strap colour. */
export const resolveStrap = (w: RenderableWatch): Strap =>
  w.wornStrap ?? w.strap ?? { type: 'leather', color: fullLook(w.look).strap };

/** Returns an SVG group string centred on 0,0, in mm, plus its bounding width and height. */
export function watchGroup(w: RenderableWatch, o: WatchRenderOptions = {}) {
  const r = drawWatch(w, o);
  // Live time steps each seconds hand at its movement's rate.
  const g = w.beats ? r.g.replace(/data-hand="(second|small-seconds)" /g, `$&data-beats="${w.beats}" `) : r.g;
  return { ...r, g: o.lighting && o.lighting !== 'day' && !o.outline ? nightify(g, w.night, o.lighting) : g };
}

function drawWatch(w: RenderableWatch, o: WatchRenderOptions) {
  const L = fullLook(w.look);
  const D = num(w.diameter) || 40, R = D / 2, LL = l2l(w), lw = num(w.lugWidth) || 20, id = 'w' + (++uidc);
  const strapLen = o.strapLen ?? 10;
  const slim = L.shape === 'willard-modern';
  const m = L.caseColor, mD = shade(m, -.28), mL = shade(m, .35);
  const out = o.outline; const oc = o.color || '#151515';
  let s = '';
  if (!out) s += `<defs><linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mL}"/><stop offset=".5" stop-color="${m}"/><stop offset="1" stop-color="${mD}"/></linearGradient>
  <radialGradient id="${id}d" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="${L.dialFinish === 'sunburst' ? shade(L.dial, .28) : shade(L.dial, .06)}"/><stop offset="1" stop-color="${L.dialFinish === 'sunburst' ? shade(L.dial, -.22) : shade(L.dial, -.08)}"/></radialGradient>
  <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
  if (!out && slim) s += slimDialDefs(id, L);
  // strap
  if (!out && strapLen > 0) {
    const strapStart = L.shape === 'willard' ? R * .88 : L.shape.startsWith('heritage') || L.shape === 'spb253' || L.shape === 'spb255' || L.shape === 'mk2-39-5' || L.shape === 'c60-pro-300' || L.shape === 'oris-771' || L.shape === 'serica-5303' ? R * .82 : L.shape === 'srpk01' || L.shape === 'srpe03' || L.shape === 'ssk003' ? R * .88 : L.shape === 'spb507' ? R * .78 : L.shape === 'srpb43' ? R * .8 : L.shape === 'f91w' ? LL / 2 - 3 : R * .4;
    s += strapSVG(o.strap ?? resolveStrap(w), { lw, start: strapStart, lugEnd: LL / 2, len: strapLen, id: id + '_s', metal: m, seichu: L.shape === 'spb253' || L.shape === 'spb255' || (L.shape === 'willard' && !!L.minuteLume), centreWidth: L.shape === 'willard' || L.shape === 'heritage-gmt' || L.shape === 'spb255' || L.shape === 'srpk01' || L.shape === 'srpe03' ? .5 : L.shape === 'heritage' || L.shape === 'c60-pro-300' ? .46 : L.shape === 'oris-771' ? .38 : undefined, meshLink: L.shape === 'serica-5303', fiveRow: L.shape === 'ssk003' });
  }
  // case + lugs
  const caseFill = out ? 'none' : `url(#${id}c)`, st = out ? `stroke="${oc}" stroke-width="${o.sw || .5}"` : `stroke="${mD}" stroke-width=".3"`;
  if (L.shape === 'speedtimer') {
    // Model-specific drawing: see ssc947.ts. The crown and pushers stand about 4 mm proud of the case.
    s += ssc947SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'willard') {
    // Model-specific drawing for the 6105-reissue case family: see spb151.ts. The guard and crown stand out on the right.
    s += spb151SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 8, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'heritage') {
    // 1965 heritage diver: see spb451.ts. The crown stands about 4 mm proud of the case.
    s += spb451SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'heritage-gmt') {
    // 1968 heritage GMT: see spb519.ts. The 4 o'clock crown stands about 4 mm proud.
    s += spb519SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'spb253') {
    // Black Series 1965 diver: see spb253.ts. The crown stands about 3.4 mm proud of the case.
    s += spb253SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'spb255') {
    // Black Series 1968 diver: see spb255.ts. The 4 o'clock crown stands about 3.6 mm proud.
    s += spb255SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'srpk01' || L.shape === 'srpe03') {
    // King Turtle pair: see srpk01.ts. The unguarded 4 o'clock crown projects on the right.
    s += srpk01SVG({ D, LL, lw, id, L, brand: w.brand || '', variant: L.shape, outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 8, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'mk2-39-5') {
    // Baltic Aquascaphe MK2 39.5: see mk2395.ts. The crown and flat-top guards project on the right.
    s += mk2395SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 8, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'c60-pro-300') {
    // Christopher Ward C60 Trident Pro 300 40 mm: see c60300.ts. The crown and guards project on the right.
    s += c60300SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 8, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'oris-771') {
    // Oris Divers Sixty-Five Chronograph 40 mm: see oris771.ts. The crown and pump pushers project on the right.
    s += oris771SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 8, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'serica-5303') {
    // Serica 5303-1 Diving Chronometer: see serica5303.ts. The unguarded 8 mm crown stands 4 mm proud.
    s += serica5303SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'ssk003') {
    // Seiko 5 Sports GMT: see ssk003.ts. The guarded 4 o'clock crown stands about 3 mm proud.
    s += ssk003SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'spb507') {
    // Seiko Prospex Alpinist: see spb507.ts. The 3 o'clock crown stands about 4 mm proud of the case.
    s += spb507SVG({ D, LL, lw, id, L, brand: w.brand || '', outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'f91w') {
    // Casio F-91W: see f91w.ts. The buttons stand about 1.5 mm proud of the case sides.
    s += f91wSVG({ D, LL, id, L, outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5, glow: w.night?.backlight?.color });
    return { g: s, w: D + 5, h: out ? LL : LL + 2 * strapLen };
  }
  if (L.shape === 'srpb43') {
    // Seiko Presage Cocktail Time: see srpb43.ts. The 3 o'clock crown stands about 4 mm proud of the case.
    s += srpb43SVG({ D, LL, lw, id, L, outline: !!out, stroke: st, outlineColor: oc, sw: o.sw || .5 });
    return { g: s, w: D + 9, h: out ? LL : LL + 2 * strapLen };
  }
  let bo: number;
  if (L.shape === 'round') {
    const lugT = Math.max(2.4, (R * 0.98 - lw / 2) * 0.42);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const xi = sx * (lw / 2 + .15), xo = sx * (lw / 2 + lugT), y0 = sy * R * 0.55, y1 = sy * LL / 2, dy = Math.abs(y1 - y0);
      // Outer edge sweeps in from the case and narrows slightly towards a rounded tip.
      s += `<path d="M${xi},${y0}L${xo + sx * 1.6},${y0}C${xo + sx * 1.6},${y0 + sy * dy * .45} ${xo + sx * .2},${y1 - sy * 3} ${xo},${y1 - sy * 1.4}Q${xo},${y1} ${xo - sx * 1.4},${y1}L${xi},${y1}Z" fill="${caseFill}" ${st}/>`;
      if (!out) s += `<path d="M${xo + sx * .5},${y0 + sy * 1.2}C${xo + sx * .5},${y0 + sy * dy * .5} ${xo - sx * .5},${y1 - sy * 3} ${xo - sx * .8},${y1 - sy * 1.3}" fill="none" stroke="${mL}" stroke-width=".35" opacity=".55"/>`;
    }
    s += `<circle r="${R * 0.97}" fill="${caseFill}" ${st}/>`; bo = R;
  } else if (L.shape === 'cushion') {
    s += `<path d="${superellipse(R * 0.97, LL / 2, 4.4)}" fill="${caseFill}" ${st}/>`; bo = R * 0.9;
    if (!out) for (const sy of [-1, 1]) s += `<rect x="${-lw / 2 + .4}" y="${sy < 0 ? -LL / 2 - .2 : LL / 2 - 1.6}" width="${lw - .8}" height="1.8" rx=".4" fill="${mD}" opacity=".35"/>`;
  } else { // willard-modern (SPB317)
    bo = R * WILLARD_BEZEL['willard-modern'];
    const angle = ({ 3: 90, 4: 123, 9: 270 } as Record<string, number>)[L.crown] ?? 123;
    s += slimCase(D, LL, lw, id, m, !!out, st, angle);
  }
  // crown + pushers
  const crownAng = ({ 3: 90, 4: 120, 9: 270 } as Record<string, number>)[L.crown] ?? 90;
  const crownR = L.shape === 'cushion' ? R * 0.96 : R * 0.97;
  const crownEl = (ang: number, w2: number, h2: number, r0: number) => {
    const [cx, cy] = P(r0 + h2 / 2 - 0.4, ang);
    return `<rect x="${cx - h2 / 2}" y="${cy - w2 / 2}" width="${h2}" height="${w2}" rx=".7" transform="rotate(${ang - 90} ${cx} ${cy})" fill="${caseFill}" ${st}/>`;
  };
  if (!L.shape.startsWith('willard')) s += crownEl(crownAng, 6, 2.8, crownR);
  if (L.pushers) { s += crownEl(crownAng - 32, 3.2, 2.2, crownR - 0.3); s += crownEl(crownAng + 32, 3.2, 2.2, crownR - 0.3); }
  // bezel
  const bi = bo * (L.bezelInner || (L.bezelType === 'diver' ? 0.79 : L.bezelType === 'fixed' ? 0.82 : 0.93));
  if (out) {
    s += `<circle r="${bo}" fill="none" ${st}/><circle r="${bi}" fill="none" stroke="${oc}" stroke-width="${(o.sw || .5) * .6}" stroke-dasharray="1.2 .8"/>`;
    return { g: s, w: D + 6, h: LL };
  }
  if (slim && L.bezelType === 'diver') {
    s += slimBezelEdge(bo, id);
  } else if (L.bezelType === 'diver') {
    for (let i = 0; i < 120; i++) {
      const [x0, y0] = P(bo, i * 3), [x1, y1] = P(bo - .6, i * 3);
      s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${mD}" stroke-width=".35"/>`;
    }
  }
  s += `<circle r="${bo - (L.bezelType === 'diver' ? (slim ? .8 : .45) : 0)}" fill="${slim ? mL : mD}"/>`;
  const ins = bo - (L.bezelType === 'diver' ? .9 : .5);
  s += `<circle r="${ins}" fill="${L.bezel}"/>`;
  if (L.bezel2) {
    const sp = num(L.bezelSplit) || 30;
    s += `<path d="${ringSeg(ins, bi, 0, sp * 6)}" fill="${L.bezel2}"/>`;
    if (sp === 30) s += `<path d="${ringSeg(ins, bi, 180, 360)}" fill="${L.bezel}"/>`;
  }
  // Numerals nearly fill an insert whose width was measured from a photo; older entries keep the original smaller size.
  const bw = ins - bi, bt = L.bezelText, numeralFill = slim ? 1.1 : L.bezelInner ? 1.2 : .5;
  if (L.bezelType === 'diver') {
    for (let mnt = 0; mnt < 60; mnt++) {
      const a = mnt * 6;
      if (mnt === 0) {
        const [tx, ty] = P(ins - bw * .12, 0);
        if (slim) {
          s += `<path d="M${-bw * .67},${ty}H${bw * .67}L0,${ty + bw * .65}Z" fill="${bt}"/><circle cy="${ty + bw * .26}" r="${bw * .16}" fill="${L.lume}"${lu('bezel')} stroke="#626760" stroke-width=".18"/>`;
          continue;
        }
        s += `<path d="M${tx - bw * .32},${ty}L${tx + bw * .32},${ty}L0,${ty + bw * .55}Z" fill="${bt}"/><circle cx="0" cy="${ty + bw * .2}" r="${bw * .1}" fill="${L.lume}"${lu('bezel')}/>`;
        continue;
      }
      if (mnt % 10 === 0) {
        const [x, y] = P(bi + bw * .5, a);
        s += `<text x="${x}" y="${y}" font-size="${bw * numeralFill}" font-family="Arial,Helvetica,sans-serif" font-weight="${slim ? 400 : 700}" fill="${bt}" text-anchor="middle" dominant-baseline="central" transform="rotate(${a} ${x} ${y})${slim ? ` translate(${x} ${y}) scale(1 .82) translate(${-x} ${-y})` : ''}">${mnt}</text>`;
        continue;
      }
      if (mnt % 5 === 0) {
        const [x0, y0] = P(ins - bw * .15, a), [x1, y1] = P(bi + bw * .25, a);
        s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${bt}" stroke-width="${bw * (slim ? .18 : .14)}"/>`;
        continue;
      }
      if (slim) {
        if ((mnt % 10 === 1 && mnt !== 1) || (mnt % 10 === 9 && mnt !== 59)) continue;
        const [x, y] = P(bi + bw * .53, a);
        s += `<circle cx="${x}" cy="${y}" r="${bw * .09}" fill="${bt}"/>`;
      } else if (mnt < 15) {
        const [x0, y0] = P(ins - bw * .15, a), [x1, y1] = P(ins - bw * .45, a);
        s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${bt}" stroke-width="${bw * .06}"/>`;
      }
    }
  } else if (L.bezelType === 'fixed') {
    for (let i = 0; i < 60; i++) {
      const [x0, y0] = P(ins - bw * .1, i * 6), [x1, y1] = P(ins - bw * (i % 5 ? .3 : .5), i * 6);
      s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${bt}" stroke-width="${bw * .05}"/>`;
    }
    [500, 300, 200, 150, 120, 100, 90, 80, 70, 65].forEach(v => {
      const a = (21600 / v) % 360; const [x, y] = P(bi + bw * .32, a); // seconds at that speed, at 6° per second
      if (a < 350) s += `<text x="${x}" y="${y}" font-size="${bw * .3}" font-family="Arial,sans-serif" fill="${bt}" text-anchor="middle" dominant-baseline="central" transform="rotate(${a} ${x} ${y})">${v}</text>`;
    });
  }
  // crystal edge + dial
  s += `<circle r="${bi}" fill="${shade(L.dial, -.45)}"/>`;
  const dr = bi - .35;
  s += `<circle r="${dr}" fill="url(#${id}d)"/>`;
  if (L.dialFinish === 'sunburst') {
    for (let i = 0; i < 72; i++) {
      const [x, y] = P(dr, i * 5);
      s += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="#fff" stroke-opacity=".035" stroke-width=".5"/>`;
    }
  }
  let mr = dr * .94;
  if (slim && L.chapter && L.chapterMarks === 'ticks') {
    s += slimChapter(dr, id);
    mr = dr * .855;
  } else if (L.chapter && L.chapterMarks === 'dots') {
    // A distinct chapter ring (rehaut) with a dot at every minute, as on modern Seiko divers.
    const cw = L.chapterWidth || .145, ri = dr * (1 - cw), rm = (dr + ri) / 2;
    s += `<path d="${ringSeg(dr, ri, 0, 359.99)}" fill="${shade(L.dial, .04)}"/>`;
    s += `<circle r="${dr - .15}" fill="none" stroke="${shade(L.dial, .55)}" stroke-width=".3" opacity=".7"/>`;
    s += `<circle r="${ri}" fill="none" stroke="${shade(L.dial, -.5)}" stroke-width=".25"/>`;
    for (let i = 0; i < 60; i++) {
      const [x, y] = P(rm, i * 6);
      s += `<circle cx="${x}" cy="${y}" r="${dr * (i % 5 ? .011 : .017)}" fill="#fff" opacity=".9"/>`;
    }
    mr = ri - dr * .01;
  } else if (L.chapter) {
    s += `<circle r="${dr}" fill="none" stroke="${shade(L.dial, -.6)}" stroke-width="${dr * .12}" opacity=".85"/>`;
    for (let i = 0; i < 60; i++) {
      const [x0, y0] = P(dr * .995, i * 6), [x1, y1] = P(dr * (i % 5 ? .95 : .92), i * 6);
      s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#fff" stroke-width=".18" opacity=".85"/>`;
    }
    mr = dr * .86;
  } else {
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const [x0, y0] = P(dr * .985, i * 6), [x1, y1] = P(dr * .94, i * 6);
      s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${L.bezelText}" stroke-width=".16" opacity=".6"/>`;
    }
  }
  // subdials
  const subPos = L.subdials === 3 ? [90, 180, 270] : L.subdials === 2 ? [90, 270] : [];
  subPos.forEach(a => {
    const [x, y] = P(dr * .5, a);
    s += `<circle cx="${x}" cy="${y}" r="${dr * .25}" fill="${L.subdialColor}" stroke="${shade(m, .2)}" stroke-width=".25"/>`;
    for (let i = 0; i < 12; i++) {
      const [a0, b0] = P(dr * .23, i * 30), [a1, b1] = P(dr * .19, i * 30);
      s += `<line x1="${x + a0}" y1="${y + b0}" x2="${x + a1}" y2="${y + b1}" stroke="#fff" stroke-width=".18"/>`;
    }
    const [hx, hy] = P(dr * .18, (a * 1.7) % 360);
    s += `<line x1="${x}" y1="${y}" x2="${x + hx}" y2="${y + hy}" stroke="#fff" stroke-width=".35"/>`;
  });
  // markers
  const dateA = ({ '3': 90, '4.5': 135, '6': 180 } as Record<string, number>)[L.date];
  for (let h = 0; h < 12; h++) {
    const a = h * 30;
    if (a === dateA && L.date !== '4.5') continue;
    if (subPos.includes(a)) continue;
    const len = dr * (h % 3 === 0 ? .2 : (slim ? .17 : .15)), wd = dr * (slim ? (h % 3 === 0 ? .12 : .105) : (h % 3 === 0 ? .09 : .075));
    const g = `transform="rotate(${a})"`;
    if (L.markers === 'dots' && h % 3 !== 0) {
      const [x, y] = P(mr - dr * .07, a);
      s += `<circle cx="${x}" cy="${y}" r="${dr * .065}" fill="${L.lume}"${lu('indices')} stroke="${mL}" stroke-width=".25"/>`;
      continue;
    }
    if (slim && L.markers === 'bars') {
      s += slimMarker(h, dr, id);
      continue;
    }
    if (h === 0 && slim) {
      s += `<path d="M${-wd * 1.05},${-mr}H${wd * 1.05}L${wd * .95},${-mr + len * 1.08}L0,${-mr + len * 1.18}L${-wd * .95},${-mr + len * 1.08}Z" fill="${L.lume}"${lu('indices')} stroke="${mL}" stroke-width=".25"/><path d="M0,${-mr}V${-mr + len * 1.12}" stroke="#888e86" stroke-width=".18"/>`;
      continue;
    }
    if (h === 0) {
      s += `<rect x="${-wd * 1.25}" y="${-mr}" width="${wd * .95}" height="${len * 1.1}" fill="${L.lume}"${lu('indices')} stroke="${mL}" stroke-width=".25"/><rect x="${wd * .3}" y="${-mr}" width="${wd * .95}" height="${len * 1.1}" fill="${L.lume}"${lu('indices')} stroke="${mL}" stroke-width=".25"/>`;
      continue;
    }
    s += `<rect ${g} x="${-wd / 2}" y="${-mr}" width="${wd}" height="${len}" fill="${L.lume}"${lu('indices')} stroke="${mL}" stroke-width=".25"/>`;
  }
  // date
  if (slim && dateA != null) {
    const [x, y] = P(dr * .74, dateA);
    s += `<circle cx="${x}" cy="${y}" r="${dr * .078}" fill="#070c0f" stroke="#303d3e" stroke-width=".18"/><text x="${x}" y="${y}" textLength="${dr * .115}" lengthAdjust="spacingAndGlyphs" font-size="${dr * .127}" font-family="Arial,sans-serif" text-anchor="middle" dominant-baseline="central" fill="${L.lume}">6</text>`;
  } else if (dateA != null) {
    const dw = dr * .2, dh = dr * .15; const [x, y] = P(dr * (L.date === '4.5' ? .62 : .68), dateA);
    s += `<rect x="${x - dw / 2}" y="${y - dh / 2}" width="${dw}" height="${dh}" fill="#F6F6F2" stroke="${mL}" stroke-width=".3" transform="rotate(${L.date === '4.5' ? 45 : 0} ${x} ${y})"/><text x="${x}" y="${y}" font-size="${dh * .75}" font-family="Arial,sans-serif" text-anchor="middle" dominant-baseline="central" fill="#111" transform="rotate(${L.date === '4.5' ? 45 : 0} ${x} ${y})">23</text>`;
  }
  // brand text
  if (!subPos.includes(0)) {
    s += `<text y="${-dr * (slim ? .36 : .42)}" font-size="${dr * (slim ? .125 : .085)}" font-family="${slim ? "Georgia,serif" : "Arial,Helvetica,sans-serif"}" font-weight="700" letter-spacing=".2" text-anchor="middle" fill="${L.bezelText}" opacity=".9">${esc((w.brand || '').toUpperCase())}</text>`;
  }
  if (slim) {
    s += `<g fill="${L.bezelText}" text-anchor="middle" font-family="Arial,sans-serif"><path d="M-1.05,3.25L.65,4.55H-.55L1.05,3.25M-.8,3.25H.8M-.8,4.55H.8" fill="none" stroke="${L.bezelText}" stroke-width=".15"/><text y="5.7" font-size="1.04">AUTOMATIC</text><text y="6.95" font-size="1.05" letter-spacing=".025" font-weight="700">DIVER’S 200m</text></g>`;
  }
  if (slim && L.hands === 'sword') {
    s += slimHands(dr, id, L);
  } else {
    // Generic hands at 10:09:36
    const hand = (role: HandRole, ang: number, len: number, wd: number, fill: string, lume: string | null, style: FullLook['hands']) => {
      let d;
      if (style === 'baton') d = `M${-wd / 2},${dr * .06}L${-wd / 2},${-len}L${wd / 2},${-len}L${wd / 2},${dr * .06}Z`;
      else if (style === 'dauphine') d = `M0,${dr * .08}L${-wd / 2},${-len * .15}L0,${-len}L${wd / 2},${-len * .15}Z`;
      else d = `M${-wd * .3},${dr * .08}L${-wd / 2},${-len * .72}L0,${-len}L${wd / 2},${-len * .72}L${wd * .3},${dr * .08}Z`;
      let r = `<g ${handRole(role)}transform="rotate(${ang})"><path d="${d}" fill="${fill}" stroke="${shade(fill, -.35)}" stroke-width=".2"/>`;
      if (lume) r += `<path d="${d}" fill="${lume}"${lu('hands')} transform="translate(0 ${-len * .12}) scale(.55 .78)"/>`;
      return r + '</g>';
    };
    s += `<g filter="none" opacity=".25" transform="translate(.5 .7)">${hand('hour', 304.5, dr * (slim ? .64 : .55), dr * .13, '#000', null, L.hands)}${hand('minute', 57.6, dr * (slim ? .94 : .85), dr * .09, '#000', null, L.hands)}</g>`;
    s += hand('hour', 304.5, dr * (slim ? .64 : .55), dr * .13, L.handColor, L.lume, L.hands);
    s += hand('minute', 57.6, dr * (slim ? .94 : .85), dr * .09, L.handColor, L.minuteLume || L.lume, L.hands);
    s += `<g ${handRole('second')}transform="rotate(${slim ? 254 : 216})"><line y1="${dr * .18}" y2="${-dr * .9}" stroke="${L.accent}" stroke-width="${dr * .022}"/><circle cy="${-dr * .62}" r="${dr * .04}" fill="${L.secondsDot || L.accent}" stroke="${slim ? L.lume : "none"}" stroke-width=".2"/></g>`;
    s += `<circle r="${dr * .045}" fill="${L.handColor}" stroke="${shade(L.handColor, -.4)}" stroke-width=".2"/>`;
  }
  // crystal glare
  s += `<path d="M${-dr * .8},${-dr * .3}A${dr},${dr} 0 0 1 ${dr * .3},${-dr * .8}A${dr * 1.3},${dr * 1.3} 0 0 0 ${-dr * .8},${-dr * .3}Z" fill="url(#${id}g)"/>`;
  s += `<circle r="${dr}" fill="url(#${id}g)" opacity=".35"/>`;
  return { g: s, w: D + (L.shape.startsWith('willard') ? 4 : 6), h: LL + 2 * strapLen };
}

/** A standalone SVG of the watch at `px` screen pixels per mm. */
export function watchSVG(w: RenderableWatch, px = 8, o: WatchRenderOptions = {}) {
  const r = watchGroup(w, o);
  const W = Math.max(r.w, (num(w.diameter) ?? 0) + 8), H = r.h;
  return `<svg viewBox="${-W / 2} ${-H / 2} ${W} ${H}" width="${W * px}" height="${H * px}" role="img" aria-label="${esc(w.brand + ' ' + w.ref)} illustration">${r.g}</svg>`;
}
