import type { FullLook } from '../catalog/schema';
import { shade } from '../lib/util';
import { P, ringSeg } from './geom';
import { lu } from './night';
import { handRole } from './hands';
import { DIGITS, DIGIT_GAP, DIGIT_STROKE, WORDMARK } from './ssk003';

// Seiko Prospex Alpinist (SPB507): round case with long tapering lugs, a boss for the 3 o'clock crown, a 4 o'clock
// crown turning the inner compass ring, a wide polished bezel, gold railway track with framed lume dots, tilted
// applied numerals and the cathedral hour hand. Everything is in millimetres, scaled by u = D / 39.5.
// See docs/models/seiko-spb507.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
const circ = (x: number, y: number, r: number) => `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;

/** Radii measured on the reference photo at 15.8 px/mm, for the 39.5 mm case. */
const BEZEL = 18.6, GASKET = 16.9, RING = 15.95, DIAL = 14.35;
/** The case edge between the lugs, and the outer edge of each lug tip. */
const CASE_MID = 18.9, TIP_X = 11.9;
/** Crown axes, degrees clockwise from 12. */
const CROWN4_ANGLE = 119;

/** Round case with straight flanks running tangent to it out to slim lug tips, and a crown boss at 3 o'clock. */
export function spb507Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = D / 39.5;
  const p = (x: number, y: number) => `${f(x)},${f(y)}`;
  const yi = Math.sqrt((CASE_MID * u) ** 2 - slot ** 2);
  // Each flank is the tangent from the lug tip's outer corner to the case circle.
  const tx = TIP_X * u, d = Math.hypot(tx, H), phi = Math.atan2(H, tx), alpha = Math.acos(R / d);
  const T = [R * Math.cos(phi - alpha), R * Math.sin(phi - alpha)];
  const ux = (T[0] - tx) / Math.hypot(T[0] - tx, H - T[1]), uy = (H - T[1]) / Math.hypot(T[0] - tx, H - T[1]);
  const corner = [tx + .6 * u * ux, H - .6 * u * uy];
  const onCircle = (y: number) => Math.sqrt(R * R - y * y);
  const ar = `A${f(R)},${f(R)} 0 0 1`;
  // Upper right: lug inner edge, tip, flank, then the boss around the 3 o'clock crown and back to the circle.
  const right = `M${p(slot, -yi)}V${f(-H + .5 * u)}Q${p(slot, -H)} ${p(slot + .5 * u, -H)}H${f(tx - .45 * u)}Q${p(tx, -H)} ${p(corner[0], -corner[1])}`
    + `L${p(T[0], -T[1])}${ar} ${p(onCircle(7 * u), -7 * u)}C${p(19.6 * u, -6.6 * u)} ${p(20.4 * u, -4.8 * u)} ${p(21.1 * u, -4.5 * u)}`
    + `V${f(4 * u)}C${p(20.4 * u, 4.3 * u)} ${p(19.6 * u, 6.2 * u)} ${p(onCircle(6.6 * u), 6.6 * u)}${ar} ${p(T[0], T[1])}`
    + `L${p(corner[0], corner[1])}Q${p(tx, H)} ${p(tx - .45 * u, H)}H${f(slot + .5 * u)}Q${p(slot, H)} ${p(slot, H - .5 * u)}V${f(yi)}`;
  const left = `A${f(CASE_MID * u)},${f(CASE_MID * u)} 0 0 1 ${p(-slot, yi)}V${f(H - .5 * u)}Q${p(-slot, H)} ${p(-slot - .5 * u, H)}H${f(-tx + .45 * u)}Q${p(-tx, H)} ${p(-corner[0], corner[1])}`
    + `L${p(-T[0], T[1])}${ar} ${p(-T[0], -T[1])}L${p(-corner[0], -corner[1])}Q${p(-tx, -H)} ${p(-tx + .45 * u, -H)}H${f(-slot - .5 * u)}Q${p(-slot, -H)} ${p(-slot, -H + .5 * u)}V${f(-yi)}`;
  return { d: right + left + `A${f(CASE_MID * u)},${f(CASE_MID * u)} 0 0 1 ${p(slot, -yi)}Z`, T };
}

function defs(id: string, L: FullLook) {
  const m = L.caseColor, g = L.handColor;
  return `<defs>
<radialGradient id="${id}ad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="15"><stop stop-color="${shade(L.dial, .12)}"/><stop offset=".5" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.45)}"/></radialGradient>
<linearGradient id="${id}ak" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#000" stop-opacity=".12"/><stop offset=".4" stop-color="#e8f5e8" stop-opacity=".02"/><stop offset=".5" stop-color="#e8f5e8" stop-opacity=".1"/><stop offset=".62" stop-color="#e8f5e8" stop-opacity=".03"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<linearGradient id="${id}ab" x1=".15" y1="0" x2=".85" y2="1"><stop stop-color="${shade(m, .9)}"/><stop offset=".3" stop-color="${shade(m, .2)}"/><stop offset=".46" stop-color="${shade(m, -.45)}"/><stop offset=".56" stop-color="${shade(m, .7)}"/><stop offset=".78" stop-color="${shade(m, .1)}"/><stop offset="1" stop-color="${shade(m, -.4)}"/></linearGradient>
<linearGradient id="${id}ap" x1="0" y1="0" x2="1" y2=".25"><stop stop-color="#fff" stop-opacity=".9"/><stop offset=".45" stop-color="${shade(m, -.5)}" stop-opacity=".7"/><stop offset=".55" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="${shade(m, -.55)}" stop-opacity=".75"/></linearGradient>
<linearGradient id="${id}ac" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.45)}"/><stop offset=".3" stop-color="${shade(m, .6)}"/><stop offset=".55" stop-color="${shade(m, .2)}"/><stop offset="1" stop-color="${shade(m, -.45)}"/></linearGradient>
<linearGradient id="${id}ag" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(g, .45)}"/><stop offset=".5" stop-color="${g}"/><stop offset="1" stop-color="${shade(g, -.35)}"/></linearGradient>
<linearGradient id="${id}al" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.lume, .3)}"/><stop offset="1" stop-color="${shade(L.lume, -.1)}"/></linearGradient>
<pattern id="${id}ah" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="rotate(90)"><path d="M0,0V.5M.22,0V.5" stroke="#fff" stroke-width=".05" opacity=".09"/><path d="M.11,0V.5M.38,0V.5" stroke="#4e5554" stroke-width=".04" opacity=".07"/></pattern>
</defs>`;
}

/** A fluted screw-down crown on its own axis, drawn beneath the case so the case covers its root. */
function crown(id: string, L: FullLook, angle: number, half: number, r0: number, r1: number, flutes: number, outline: boolean, stroke: string) {
  let s = `<g transform="rotate(${f(angle - 90)})">`;
  s += `<path d="M${f(r0)},${f(-half)}H${f(r1 - .8)}Q${f(r1)},${f(-half)} ${f(r1)},${f(-half + .9)}V${f(half - .9)}Q${f(r1)},${f(half)} ${f(r1 - .8)},${f(half)}H${f(r0)}Z" fill="${outline ? 'none' : `url(#${id}ac)`}" ${stroke}/>`;
  if (!outline) {
    // Broad rounded flutes: a dark groove between each, with a bright crest along every flute.
    let grooves = '', crests = '';
    const pitch = (2 * half) / flutes;
    for (let i = 1; i < flutes; i++) grooves += `M${f(r0 + .3)},${f(-half + i * pitch)}H${f(r1 - .75)}`;
    for (let i = 0; i < flutes; i++) crests += `M${f(r0 + .3)},${f(-half + (i + .38) * pitch)}H${f(r1 - .8)}`;
    s += `<path d="${grooves}" stroke="${shade(L.caseColor, -.62)}" stroke-width=".22"/><path d="${crests}" stroke="#fff" stroke-width=".14" opacity=".75"/>`;
    s += `<path d="M${f(r1 - .55)},${f(-half + .5)}V${f(half - .5)}" stroke="${shade(L.caseColor, -.4)}" stroke-width=".12"/><path d="M${f(r1 - .2)},${f(-half + .8)}V${f(half - .8)}" stroke="#fff" stroke-width=".25" opacity=".6"/>`;
  }
  return s + '</g>';
}

/** Brushed top, polished sides seen as a reflective band round the outline, and a facet line down each lug. */
function caseFinish(d: string, T: number[], H: number, id: string, L: FullLook, u: number) {
  const m = L.caseColor;
  let facets = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) facets += `M${f(sx * (T[0] - 1.1 * u))},${f(sy * (T[1] + .6 * u))}L${f(sx * (TIP_X - .55) * u)},${f(sy * (H - .3 * u))}`;
  return `<defs><clipPath id="${id}acc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}acc)"><path d="${d}" fill="url(#${id}ah)"/>`
    + `<path d="${facets}" stroke="#fff" stroke-width=".18" opacity=".55"/><path d="${facets}" stroke="${shade(m, -.35)}" stroke-width=".08" opacity=".6" transform="translate(.12 0)"/>`
    + `<path d="${d}" fill="none" stroke="url(#${id}ap)" stroke-width="${f(1.5 * u)}"/><path d="${d}" fill="none" stroke="#fff" stroke-width=".18" opacity=".7"/>`
    + `<path d="M${f(19.75 * u)},${f(-6.2 * u)}Q${f(20.6 * u)},${f(-4.6 * u)} ${f(20.75 * u)},${f(-3.2 * u)}V${f(2.6 * u)}" fill="none" stroke="#fff" stroke-width="${f(.35 * u)}" opacity=".75"/>`
    + `<path d="M${f(20.7 * u)},${f(3.6 * u)}Q${f(20.2 * u)},${f(5 * u)} ${f(19.4 * u)},${f(6.1 * u)}" fill="none" stroke="${shade(m, -.5)}" stroke-width="${f(.4 * u)}" opacity=".6"/>`
    + `<path d="${d}" fill="none" stroke="${shade(m, -.38)}" stroke-width=".22"/></g>`;
}

/** Wide polished bezel sloping down to the crystal, and the dark gasket inside it. */
function bezel(id: string, L: FullLook) {
  const m = L.caseColor;
  let s = `<circle r="${BEZEL}" fill="url(#${id}ab)" stroke="${shade(m, -.4)}" stroke-width=".12"/>`;
  s += `<path d="${ringSeg(BEZEL - .25, BEZEL - .7, 200, 340)}" fill="#fff" opacity=".45"/><path d="${ringSeg(GASKET + .55, GASKET + .1, 20, 160)}" fill="${shade(m, -.4)}" opacity=".35"/>`;
  s += `<circle r="${GASKET}" fill="${shade(m, -.55)}"/><circle r="${GASKET - .12}" fill="none" stroke="${shade(m, .3)}" stroke-width=".1" opacity=".7"/>`;
  return s + `<circle r="${f(RING + .25)}" fill="#252b2a"/>`;
}

const BEARINGS: Record<number, string> = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };

/** The rotating compass ring: degree numerals every 30°, cardinal triangles, intercardinal letters and a dash every 10°. */
function compass(L: FullLook) {
  const gold = L.bezelText, rm = (RING + DIAL) / 2;
  let s = `<path d="${ringSeg(RING, DIAL, 0, 359.999)}" fill="${L.bezel}"/><circle r="${f(RING - .06)}" fill="none" stroke="#fff" stroke-width=".06" opacity=".18"/>`;
  let dashes = '', dots = '', golds = '', reds = '';
  // A dash every 10°, except where a degree numeral or cardinal point sits.
  for (let a = 10; a < 360; a += 10) if (a % 30) dashes += `M${pt(rm - .28, a)}L${pt(rm + .28, a)}`;
  let text = `<g font-family="Arial,Helvetica,sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="central">`;
  const label = (t: string, r: number, a: number, size: number, fill: string) => {
    const [x, y] = P(r, a);
    return `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${fill}" transform="rotate(${a} ${f(x)} ${f(y)})">${t}</text>`;
  };
  // A triangle on the ring pointing in towards the dial, a units wide at its base.
  const tri = (a: number, r0: number, r1: number, w: number) => {
    const t = (w / 2 / r0) * 180 / Math.PI;
    return `M${pt(r0, a - t)}L${pt(r0, a + t)}L${pt(r1, a)}Z`;
  };
  for (let a = 30; a < 360; a += 30) {
    if (a % 90 === 0) continue;
    text += label(String(a), rm + .22, a, .95, gold);
    const [x, y] = P(DIAL + .22, a);
    dots += `M${f(x - .11)},${f(y - .11)}h.22v.22h-.22Z`;
  }
  for (const [deg, b] of Object.entries(BEARINGS)) {
    const a = +deg;
    if (a % 90 === 0) {
      // Cardinal points: a triangle with the letter inside. North's is red.
      if (a === 0) reds += tri(a, RING - .08, DIAL + .08, 1.5);
      else golds += tri(a, RING - .08, DIAL + .08, 1.5);
      text += label(b, rm + .2, a, .56, a === 0 ? '#f4f1ea' : shade(L.bezel, -.5));
    } else {
      // Intercardinals: letters with a small triangle beneath; NE and NW are red.
      const north = a === 45 || a === 315;
      text += label(b, rm + .22, a, .72, north ? L.accent : gold);
      golds += tri(a, DIAL + .55, DIAL + .2, .38);
    }
  }
  s += `<path d="${dashes}" stroke="${gold}" stroke-width=".13"/><path d="${dots}${golds}" fill="${gold}"/><path d="${reds}" fill="${L.accent}"/>`;
  return s + text + '</g>';
}

/** Gold railway track: an inner circle with ticks every quarter minute, longer on the minute; framed lume dots at the hours. */
function track(L: FullLook, id: string) {
  const gold = L.bezelText, r0 = 13.1;
  let ticks = '';
  for (let i = 0; i < 240; i++) {
    if (i % 20 === 0) continue;
    const r1 = i % 4 === 0 ? 14.15 : i % 2 === 0 ? 13.85 : 13.6;
    ticks += `M${pt(r0, i * 1.5)}L${pt(r1, i * 1.5)}`;
  }
  let s = `<circle r="${r0}" fill="none" stroke="${gold}" stroke-width=".1"/><path d="${ticks}" stroke="${gold}" stroke-width=".085"/>`;
  let frames = '', lume = '';
  for (let h = 0; h < 12; h++) {
    const a = h * 30, [x, y] = P(13.5, a), t = a * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
    // A square frame turned to face the centre.
    const q = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(([px, py]) => `${f(x + px * c - py * sn)},${f(y + px * sn + py * c)}`);
    frames += `M${q.join('L')}Z`;
    lume += circ(x, y, .34);
  }
  s += `<path d="${frames}" fill="url(#${id}ag)" stroke="${shade(gold, -.45)}" stroke-width=".05"/>`;
  return s + `<path d="${lume}" fill="url(#${id}al)" stroke="${shade(gold, -.3)}" stroke-width=".05"${lu('indices')}/>`;
}

/** Applied gold triangles at 1, 5, 7, 9 and 11, pointing in, with a polished ridge down the middle. */
function triangles(L: FullLook, id: string) {
  let body = '', light = '';
  for (const h of [1, 5, 7, 9, 11]) {
    const a = h * 30, half = .66;
    const t = (half / 12.35) * 180 / Math.PI;
    body += `M${pt(12.35, a - t)}L${pt(12.35, a + t)}L${pt(9.55, a)}Z`;
    light += `M${pt(12.2, a - t * .8)}L${pt(12.2, a)}L${pt(9.85, a)}Z`;
  }
  return `<path d="${body}" fill="#000" opacity=".3" transform="translate(.07 .1)"/><path d="${body}" fill="url(#${id}ag)" stroke="${shade(L.bezelText, -.45)}" stroke-width=".06"/><path d="${light}" fill="#fff" opacity=".12"/>`;
}

/** Applied gold numerals: a monoline digit in polished gold, lit along its upper-left edge. The 2, 4, 8 and 10 are
 *  turned 60° so their feet face the nearer edge of the dial (the 12 and 6 stay upright). */
function numerals(id: string, L: FullLook) {
  const h = 2.75, r = 10.65;
  let d = '';
  for (const n of [12, 2, 4, 6, 8, 10]) {
    const text = String(n), width = [...text].reduce((w, c) => w + DIGITS[c][1], 0) + DIGIT_GAP * (text.length - 1);
    const [cx, cy] = P(r, n * 30), turn = n === 2 || n === 8 ? 60 : n === 4 || n === 10 ? -60 : 0;
    const c = Math.cos(turn * Math.PI / 180), sn = Math.sin(turn * Math.PI / 180);
    let x0 = -width / 2;
    for (const ch of text) {
      const [path, adv] = DIGITS[ch], ox = x0;
      d += path.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, x: string, y: string) => {
        const px = (+x + ox) * h, py = (+y - .5) * h;
        return `${f(cx + px * c - py * sn)},${f(cy + px * sn + py * c)}`;
      });
      x0 += adv + DIGIT_GAP;
    }
  }
  const w = h * DIGIT_STROKE * .95, join = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
  return `<path d="${d}" ${join} stroke="#000" stroke-width="${f(w)}" opacity=".3" transform="translate(.07 .1)"/>`
    + `<path d="${d}" ${join} stroke="${shade(L.bezelText, .8)}" stroke-width="${f(w * 1.1)}" transform="translate(-.04 -.05)"/>`
    + `<path d="${d}" ${join} stroke="url(#${id}ag)" stroke-width="${f(w)}"/>`
    + `<path d="${d}" ${join} stroke="${shade(L.bezelText, .35)}" stroke-width="${f(w * .22)}" opacity=".45"/>`;
}

function rrect(x: number, y: number, w: number, h: number, r: number) {
  return `M${f(x + r)},${f(y)}H${f(x + w - r)}Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)}V${f(y + h - r)}Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)}H${f(x + r)}Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)}V${f(y + r)}Q${f(x)},${f(y)} ${f(x + r)},${f(y)}Z`;
}

/** Dark date wheel with white numerals, in a gold frame, enlarged by the sapphire magnifier: a broad numeral filling
 *  most of the window, and a bright reflection along the lens's left edge with a shadow on the right. */
function date(L: FullLook, id: string) {
  if (!L.date) return '';
  const cx = 10.45, w = 4.2, h = 3.25;
  let s = `<path d="${rrect(cx - w / 2, -h / 2, w, h, .35)}" fill="url(#${id}ag)" stroke="${shade(L.bezelText, -.5)}" stroke-width=".05"/>`;
  s += `<path d="${rrect(cx - w / 2 + .3, -h / 2 + .3, w - .6, h - .6, .2)}" fill="${shade(L.dial, -.45)}"/>`;
  s += `<text font-family="Arial,Helvetica,sans-serif" font-size="2.75" text-anchor="middle" dominant-baseline="central" fill="#f4f5f0" stroke="#0c1712" stroke-width=".06" paint-order="stroke" transform="translate(${f(cx + .05)} .08) scale(1.5 1)">6</text>`;
  s += `<path d="${rrect(10.25 - 2.65, -2.25, 5.3, 4.5, 1)}" fill="#cfe8e0" fill-opacity=".06" stroke="#0b1a14" stroke-width=".14" stroke-opacity=".5"/>`;
  s += `<path d="M8.55,-2.2Q7.65,-2.2 7.62,-1.25V1.25Q7.65,2.2 8.55,2.2M8.2,-2.05H11.2" fill="none" stroke="#fff" stroke-width=".16" stroke-linecap="round" opacity=".85"/>`;
  return s + `<path d="M12.55,-2.1Q12.85,-1.9 12.86,-1.3V1.3Q12.85,1.95 12.4,2.18" fill="none" stroke="#dfeee9" stroke-width=".08" opacity=".45"/>`;
}

/** SEIKO, the Alpinist script with its flanking lines, the Prospex X, AUTOMATIC 3 DAYS and 20 BAR. */
function printing(L: FullLook, id: string) {
  const gold = L.bezelText, edge = shade(L.dial, -.6), h = 1.49, sx = 7.12 / WORDMARK.width;
  let s = `<g transform="translate(-3.56 -7.63) scale(${f(sx)} ${f(h)})"><path d="${WORDMARK.s}" fill="none" stroke="${edge}" stroke-width=".34"/><path d="${WORDMARK.fill}" fill="url(#${id}ag)" fill-rule="evenodd" stroke="${edge}" stroke-width=".08" paint-order="stroke"/><path d="${WORDMARK.s}" fill="none" stroke="${shade(gold, .2)}" stroke-width=".24"/></g>`;
  s += `<text y="-4.3" font-family="'Snell Roundhand','Segoe Script','Brush Script MT',cursive" font-style="italic" font-weight="700" font-size="1.5" textLength="5.5" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${gold}">Alpinist</text>`;
  s += `<path d="M-4.05,-4.72L-2.75,-4.82L-2.75,-4.68ZM4.05,-4.72L2.75,-4.82L2.75,-4.68Z" fill="${gold}"/>`;
  // The Prospex X: a broad diagonal and a thin one crossing it, joined by a short bar across the top.
  s += `<path d="M-.7,3.45H-.15L.7,4.55H.15ZM.32,3.45H.7L-.45,4.55H-.7ZM-.62,3.45H.62" fill="${gold}" stroke="${gold}" stroke-width=".1"/>`;
  s += `<g font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="1.08" text-anchor="middle" dominant-baseline="central" fill="${gold}">`
    + `<text y="5.43" textLength="9.27" lengthAdjust="spacingAndGlyphs">AUTOMATIC 3 DAYS</text><text y="6.69" textLength="3.39" lengthAdjust="spacingAndGlyphs">20 BAR</text></g>`;
  return s;
}

/** Cathedral hour hand, two-window sword minute hand, and a gold seconds hand with a lume paddle and spade tail. */
function hands(id: string, L: FullLook) {
  const ha = 304.35, ma = 52.2, sa = 252;
  const brushed = shade(L.handColor, -.22), edge = shade(L.handColor, -.5), lume = `url(#${id}al)`;
  // Hour: a slim stem into an onion-shaped blade, then a fine spike.
  const hour = 'M-.3,.6V-3C-.95,-3.3 -1.1,-4.6 -1,-5.4C-.9,-6.4 -.4,-7 -.09,-7.4L-.035,-8.8H.035L.09,-7.4C.4,-7 .9,-6.4 1,-5.4C1.1,-4.6 .95,-3.3 .3,-3V.6Z';
  const hourFace = 'M0,.6V-8.8H.035L.09,-7.4C.4,-7 .9,-6.4 1,-5.4C1.1,-4.6 .95,-3.3 .3,-3V.6Z';
  const hourLume = 'M-.12,-2.1V-3.2C-.75,-3.5 -.9,-4.6 -.82,-5.4C-.74,-6.3 -.35,-6.8 0,-7.15C.35,-6.8 .74,-6.3 .82,-5.4C.9,-4.6 .75,-3.5 .12,-3.2V-2.1Z';
  const hourRibs = 'M0,-5.25V-7.1M-.85,-4.95Q0,-5.55 .85,-4.95M-.3,-3.1H.3';
  // Minute: an open-framed stem, a long blade with two lume windows, and a lance tip with a needle.
  const minute = 'M-.28,.9V-3.8L-.55,-4.3V-10.6L-.06,-11.7L-.03,-13.2H.03L.06,-11.7L.55,-10.6V-4.3L.28,-3.8V.9Z';
  const minuteFace = 'M0,.9V-13.2H.03L.06,-11.7L.55,-10.6V-4.3L.28,-3.8V.9Z';
  const minuteLume = 'M-.4,-4.25H.4V-7H-.4ZM-.4,-7.25H.4V-10.55L0,-11.15L-.4,-10.55Z';
  const minuteSlot = 'M-.12,-1.3H.12V-3.6H-.12Z';
  let s = `<g fill="#000" opacity=".28" transform="translate(.16 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${brushed}" stroke="${edge}" stroke-width=".05"/><path d="${hourFace}" fill="${L.handColor}"/><path d="${hourLume}" fill="${lume}"${lu('hands')}/><path d="${hourRibs}" fill="none" stroke="${L.handColor}" stroke-width=".13"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${brushed}" stroke="${edge}" stroke-width=".05"/><path d="${minuteFace}" fill="${L.handColor}"/><path d="${minuteSlot}" fill="${shade(L.dial, -.3)}"/><path d="${minuteLume}" fill="${lume}"${lu('hands')}/></g>`;
  // Seconds: needle to the track, teardrop lume paddle near the tip, and a spade on the short tail.
  const paddle = 'M0,-7.85C.3,-8.2 .58,-8.6 .58,-9.1C.58,-9.6 .3,-9.9 0,-9.9C-.3,-9.9 -.58,-9.6 -.58,-9.1C-.58,-8.6 -.3,-8.2 0,-7.85Z';
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M-.075,3.6H.075L.04,-13.4H-.04Z" fill="${L.handColor}" stroke="${edge}" stroke-width=".03"/>`
    + `<path d="M0,3.4L.48,4.05Q.2,4.3 0,4.95Q-.2,4.3 -.48,4.05Z" fill="url(#${id}ag)" stroke="${edge}" stroke-width=".04"/>`
    + `<path d="${paddle}" fill="url(#${id}ag)" stroke="${edge}" stroke-width=".04"/><path d="M0,-8.15C.22,-8.42 .45,-8.75 .45,-9.1C.45,-9.47 .22,-9.74 0,-9.74C-.22,-9.74 -.45,-9.47 -.45,-9.1C-.45,-8.75 -.22,-8.42 0,-8.15Z" fill="${lume}"${lu('seconds')}/></g>`;
  return s + `<circle r="1" fill="url(#${id}ag)" stroke="${edge}" stroke-width=".05"/><circle r=".72" fill="none" stroke="${shade(L.handColor, .4)}" stroke-width=".08"/><circle r=".28" fill="${shade(L.handColor, -.3)}"/>`;
}

export interface SPB507Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Seiko Prospex Alpinist SPB507. */
export function spb507SVG(o: SPB507Options) {
  const { D, LL, lw, id, L, outline } = o;
  const { d, T } = spb507Case(D, LL, lw);
  const u = D / 39.5;
  let s = outline ? '' : defs(id, L);
  s += crown(id, L, 90, 2.85 * u, 19.5 * u, 23.5 * u, 6, outline, o.stroke);
  s += crown(id, L, CROWN4_ANGLE, 2.15 * u, 18.6 * u, 22.3 * u, 4, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(L.caseColor, -.3)}" stroke-width=".12"`}/>`;
  if (outline) return s + `<circle r="${f(BEZEL * u)}" fill="none" ${o.stroke}/><circle r="${f(RING * u)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += caseFinish(d, T, LL / 2, id, L, u);
  // The dial furniture is drawn at the 39.5 mm size and scaled with the case.
  s += `<g transform="scale(${f(u)})">`;
  s += bezel(id, L);
  s += compass(L);
  s += `<circle r="${DIAL}" fill="url(#${id}ad)"/>`;
  s += track(L, id);
  s += triangles(L, id);
  s += numerals(id, L);
  s += date(L, id);
  s += printing(L, id);
  s += `<circle r="${DIAL}" fill="url(#${id}ak)"/>`;
  s += hands(id, L);
  s += `<path d="M-11.5,-4A13.5,13.5 0 0 1 -4,-11.5A16.5,16.5 0 0 0 -11.5,-4Z" fill="#fff" opacity=".05"/>`;
  return s + '</g>';
}
