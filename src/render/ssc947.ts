import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole, type HandRole } from './hands';

// Seiko Prospex Speedtimer solar chronograph (SSC947 "Pogue"), measured from a front-on product photo.
// Furniture is sized in units of k, the bezel insert's outer radius; the case in physical millimetres.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
/** Clock angle of a tachymeter value: the seconds it takes at that speed, at 6° per second. */
const tachy = (v: number) => (21600 / v) % 360;

type XY = [number, number];
type Seg = { c: XY[]; p: XY };   // line (no controls), quadratic (1) or cubic (2), ending at p

const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;
const segPath = (segs: Seg[]) => segs.map(s => (s.c.length === 0 ? 'L' : s.c.length === 1 ? 'Q' : 'C') + [...s.c, s.p].map(xy).join(' ')).join('');
/** The same segments walked from their end back to `start`. */
function reverse(start: XY, segs: Seg[]): Seg[] {
  const pts = [start, ...segs.map(s => s.p)];
  return segs.map((s, i) => ({ c: [...s.c].reverse(), p: pts[i] })).reverse();
}
const map = (segs: Seg[], t: (p: XY) => XY): Seg[] => segs.map(s => ({ c: s.c.map(t), p: t(s.p) }));

/**
 * Round case under the bezel with four long, straight-sided lugs. The lug openings are exactly the lug width;
 * each lug's outer edge runs from a rounded tip into the case circle at 2, 4, 8 and 10 o'clock.
 */
export function ssc947Case(R: number, LL: number, lw: number) {
  const H = LL / 2, Rc = R * 1.005, xi = lw / 2, yJ = Math.sqrt(Rc * Rc - xi * xi);
  const xT = xi + R * .155, ri = .35;
  const start: XY = [xi, -yJ];
  // Top-right lug, from where its inner edge leaves the case to where its outer edge rejoins it.
  // The tip is cut on a slant, about 0.45 mm lower at the outside, and rounds into the outer edge.
  const q: XY = P(Rc, 58) as XY;
  const lineDir: XY = [.383, .924], arcDir: XY = [Math.cos(58 * Math.PI / 180), Math.sin(58 * Math.PI / 180)];
  const a0: XY = [xT, -H + 1.7], span = Math.hypot(q[0] - a0[0], q[1] - a0[1]) / 3;
  const lug: Seg[] = [
    { c: [], p: [xi, -H + ri] }, { c: [[xi, -H]], p: [xi + ri, -H + .02] },
    { c: [], p: [xT - 1.6, -H + .45] }, { c: [[xT - .2, -H + .7]], p: a0 },
    { c: [[a0[0] + lineDir[0] * span, a0[1] + lineDir[1] * span], [q[0] - arcDir[0] * span, q[1] - arcDir[1] * span]], p: q },
  ];
  const arc = (p: XY) => `A${f(Rc)},${f(Rc)} 0 0 1 ${xy(p)}`;
  const flipY = ([x, y]: XY): XY => [x, -y], flipX = ([x, y]: XY): XY => [-x, y], rot = ([x, y]: XY): XY => [-x, -y];
  const br = reverse(flipY(start), map(lug, flipY));          // bottom right, walked towards its inner edge
  const bl = map(lug, rot);                                   // bottom left, walked outwards
  const tl = reverse(flipX(start), map(lug, flipX));          // top left, walked towards its inner edge
  const d = `M${xy(start)}${segPath(lug)}${arc(flipY(q))}${segPath(br)}${arc(rot(start))}${segPath(bl)}${arc(flipX(q))}${segPath(tl)}${arc(start)}Z`;
  return { d, Rc };
}

/** Steel, lume and dial finishes shared by the furniture. */
function defs(id: string, L: FullLook, k: number) {
  return `<defs>
<linearGradient id="${id}st" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fbfbf6"/><stop offset=".4" stop-color="${L.handColor}"/><stop offset=".55" stop-color="#8a8f8d"/><stop offset=".68" stop-color="#e4e6e2"/><stop offset="1" stop-color="#9da3a1"/></linearGradient>
<linearGradient id="${id}lu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.1)}"/></linearGradient>
<radialGradient id="${id}dl" cx=".52" cy=".36" r=".8"><stop stop-color="${shade(L.dial, .2)}"/><stop offset=".6" stop-color="${L.dial}"/><stop offset="1" stop-color="${shade(L.dial, -.16)}"/></radialGradient>
<linearGradient id="${id}gl" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#5a2a00" stop-opacity=".14"/><stop offset=".42" stop-color="#ffe9a8" stop-opacity=".14"/><stop offset=".58" stop-color="#ffe9a8" stop-opacity=".14"/><stop offset="1" stop-color="#5a2a00" stop-opacity=".14"/></linearGradient>
<linearGradient id="${id}sh" x1=".35" y1="0" x2=".65" y2="1"><stop stop-color="#fff" stop-opacity=".12"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
<radialGradient id="${id}sd" cx=".45" cy=".4" r=".7"><stop stop-color="${shade(L.subdialColor, .12)}"/><stop offset="1" stop-color="${shade(L.subdialColor, -.25)}"/></radialGradient>
<linearGradient id="${id}fl" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#2b2e31"/><stop offset=".5" stop-color="#0b0c0e"/><stop offset="1" stop-color="#1e2124"/></linearGradient>
<linearGradient id="${id}cy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7d8281"/><stop offset=".3" stop-color="#e6e8e6"/><stop offset=".5" stop-color="#fbfbf8"/><stop offset="1" stop-color="#8b908f"/></linearGradient>
<pattern id="${id}br" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="rotate(90)"><path d="M0,0V.5M.22,0V.5" stroke="#fff" stroke-width=".05" opacity=".22"/><path d="M.11,0V.5M.38,0V.5" stroke="#4d5251" stroke-width=".04" opacity=".16"/></pattern>
<path id="${id}tp" d="M${pt(k * .918, -40)}A${f(k * .918)},${f(k * .918)} 0 0 1 ${pt(k * .918, 86)}"/>
</defs>`;
}

/**
 * Crown at 3 and pushers at 2 and 4, each drawn in its own frame pointing away from the case.
 * Pushers: a broad housing against the case, with a smaller flat-ended button projecting from it. The shoulder
 * stays visible above and below the button. Crown: 6.9 mm tall with rounded outer corners and raised ridges that taper to a point
 * towards the case.
 */
function crownAndPushers(Rc: number, id: string, metal: string, outline: boolean, stroke: string) {
  const cyl = outline ? 'none' : `url(#${id}cy)`, dark = shade(metal, -.55);
  let s = '';
  for (const a of [64.5, 115.5]) {
    s += `<g transform="rotate(${a - 90}) translate(${f(Rc - .5)} 0)">`;
    if (!outline) s += `<rect x="0" y="-1.3" width=".7" height="2.6" fill="${shade(metal, -.35)}"/>`;
    s += `<rect x=".15" y="-2.1" width="1.65" height="4.2" rx=".18" fill="${cyl}" ${stroke}/><rect x="1.72" y="-1.7" width="1.28" height="3.4" rx=".22" fill="${cyl}" ${stroke}/>`;
    if (!outline) s += `<path d="M.45,-2V2M1.75,-1.65V1.65" stroke="${dark}" stroke-width=".08"/><rect x="2.7" y="-1.5" width=".24" height="3" rx=".1" fill="#f3f4f1" opacity=".9"/>`;
    s += '</g>';
  }
  s += `<g transform="translate(${f(Rc - .6)} 0)">`;
  if (!outline) s += `<rect x="-.2" y="-2" width="1.2" height="4" fill="${shade(metal, -.4)}"/>`;
  s += `<path d="M.8,-3.45H3.25Q4.4,-3.45 4.4,-1.7V1.7Q4.4,3.45 3.25,3.45H.8Z" fill="${cyl}" ${stroke}/>`;
  if (!outline) {
    // Raised ridges: a lit face with a dark groove beneath, each ending short of the rounded outer corners.
    let faces = '', grooves = '';
    for (let i = -3; i <= 3; i++) {
      const y = i * .9, xe = f(4.4 - .3 - (Math.abs(y) > 1.7 ? 1.15 * (1 - Math.sqrt(Math.max(0, 1 - ((Math.abs(y) - 1.7) / 1.75) ** 2))) : 0));
      faces += `M1.05,${f(y)}L1.7,${f(y - .3)}H${xe}Q${f(+xe + .2)},${f(y)} ${xe},${f(y + .3)}H1.7Z`;
      grooves += `M.95,${f(y + .45)}H${f(+xe + .12)}`;
    }
    s += `<path d="${grooves}" stroke="#30353a" stroke-width=".26"/><path d="${faces}" fill="#fbfbf8" opacity=".72"/>`;
  }
  return s + '</g>';
}

/** Fixed tachymeter bezel: blue insert with red from 60 to 250, white scale and lettering. */
function bezel(k: number, R: number, id: string, L: FullLook) {
  const ins = k, inner = k * .856, mid = (ins + inner) / 2, red = tachy(250);
  const ring = (r0: number, r1: number, a0: number, a1: number) =>
    `M${pt(r0, a0)}A${f(r0)},${f(r0)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(r0, a1)}L${pt(r1, a1)}A${f(r1)},${f(r1)} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${pt(r1, a0)}Z`;
  let s = `<circle r="${f(R * .996)}" fill="url(#${id}st)"/><circle r="${f(R * .996)}" fill="none" stroke="#8f9593" stroke-width=".12"/>`;
  s += `<circle r="${f(ins)}" fill="${L.bezel}"/><path d="${ring(ins, inner, 0, red)}" fill="${L.bezel2 || L.bezel}"/>`;
  s += `<circle r="${f(mid)}" fill="none" stroke="url(#${id}sh)" stroke-width="${f(ins - inner)}"/>`;
  // Graduations: every unit to 100, then every other unit to 120, then the halfway values between numerals.
  const numerals = [60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 160, 180, 200, 250, 300, 400, 500];
  const minor: number[] = [];
  for (let v = 61; v < 100; v++) if (v % 5) minor.push(v);
  for (let v = 102; v < 120; v += 2) if (v !== 110) minor.push(v);
  minor.push(125, 135, 150, 170, 190, 225, 275, 350, 450);
  let small = '', major = '';
  for (const v of minor) small += `M${pt(inner + k * .006, tachy(v))}L${pt(inner + k * .032, tachy(v))}`;
  for (const v of numerals) major += `M${pt(inner + k * .006, tachy(v))}L${pt(inner + k * .045, tachy(v))}`;
  s += `<path d="${small}" stroke="${L.bezelText}" stroke-width="${f(k * .009)}"/><path d="${major}" stroke="${L.bezelText}" stroke-width="${f(k * .013)}"/>`;
  const rn = k * .942, fs = k * .082;
  s += `<g fill="${L.bezelText}" font-family="Arial,Helvetica,sans-serif" font-size="${f(fs)}" font-weight="700" text-anchor="middle" dominant-baseline="central">`;
  for (const v of numerals) {
    const a = tachy(v), [x, y] = P(rn, a), rot = a > 112 && a < 248 ? a + 180 : a;
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${f(rot)} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(.82 1) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  s += `</g><text font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .08)}" font-weight="700" fill="${L.bezelText}"><textPath href="#${id}tp" startOffset="50%" text-anchor="middle" textLength="${f(k * .44)}" lengthAdjust="spacingAndGlyphs">TACHYMETER</textPath></text>`;
  // Polished inner edge of the bezel.
  return s + `<circle r="${f(k * .846)}" fill="none" stroke="url(#${id}st)" stroke-width="${f(k * .02)}"/>`;
}

/** Dark flange with 1/5-second graduations, heavier every second and every five seconds. */
function flange(k: number, id: string) {
  let fine = '', sec = '', five = '';
  for (let i = 0; i < 300; i++) {
    const a = i * 1.2;
    if (i % 25 === 0) five += `M${pt(k * .758, a)}L${pt(k * .7, a)}`;
    else if (i % 5 === 0) sec += `M${pt(k * .758, a)}L${pt(k * .722, a)}`;
    else fine += `M${pt(k * .756, a)}L${pt(k * .736, a)}`;
  }
  return `<circle r="${f(k * .8)}" fill="none" stroke="url(#${id}fl)" stroke-width="${f(k * .058)}"/><circle r="${f(k * .772)}" fill="#0c0e10"/><circle r="${f(k * .771)}" fill="none" stroke="#4a4e52" stroke-width=".08"/>`
    + `<path d="${fine}" stroke="#e8e9e6" stroke-width="${f(k * .0045)}"/><path d="${sec}" stroke="#f3f3f0" stroke-width="${f(k * .007)}"/><path d="${five}" stroke="#fff" stroke-width="${f(k * .011)}"/>`;
}

/** One sub-dial: navy, with a fine track, numerals and a slim hand. */
function subdial(cx: number, cy: number, r: number, labels: [string, number][], ticks: number, hand: number, role: HandRole, id: string, handFill: string, k: number, teardrop = false) {
  let tk = '', big = '';
  for (let i = 0; i < ticks; i++) {
    const a = i * 360 / ticks, [x0, y0] = P(r * .96, a), long = i % (ticks / 12) === 0;
    const [x1, y1] = P(r * (long ? .8 : .86), a);
    (long ? (big += `M${f(cx + x0)},${f(cy + y0)}L${f(cx + x1)},${f(cy + y1)}`) : (tk += `M${f(cx + x0)},${f(cy + y0)}L${f(cx + x1)},${f(cy + y1)}`));
  }
  let s = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="url(#${id}sd)"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="#9a7a3a" stroke-width=".1" opacity=".55"/>`;
  s += `<path d="${tk}" stroke="#d9dce0" stroke-width=".07"/><path d="${big}" stroke="#fff" stroke-width=".13"/>`;
  s += `<g fill="#f4f4f2" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .062)}" font-weight="700" text-anchor="middle" dominant-baseline="central">`;
  for (const [t, a] of labels) { const [x, y] = P(r * .5, a); s += `<text x="${f(cx + x)}" y="${f(cy + y)}">${t}</text>`; }
  s += `</g><g ${handRole(role)}transform="translate(${f(cx)} ${f(cy)}) rotate(${hand})">`;
  if (teardrop) {
    const b = r * .17;
    s += `<path d="M${f(-b * .95)},${f(-b * .3)}Q${f(-b * .5)},${f(-r * .3)} -.09,${f(-r * .6)}L-.06,${f(-r * .9)}H.06L.09,${f(-r * .6)}Q${f(b * .5)},${f(-r * .3)} ${f(b * .95)},${f(-b * .3)}A${f(b)},${f(b)} 0 1 1 ${f(-b * .95)},${f(-b * .3)}Z" fill="${handFill}" stroke="${shade(handFill, -.35)}" stroke-width=".04"/></g>`;
    return s + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .07)}" fill="#e3e6e8" stroke="#8c9296" stroke-width=".04"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .03)}" fill="#3b3f44"/>`;
  }
  s += `<path d="M-.12,${f(r * .2)}L-.07,${f(-r * .82)}L0,${f(-r * .88)}L.07,${f(-r * .82)}L.12,${f(r * .2)}Z" fill="${handFill}" stroke="${shade(handFill, -.35)}" stroke-width=".04"/></g>`;
  return s + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .085)}" fill="${handFill}" stroke="${shade(handFill, -.4)}" stroke-width=".05"/><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .035)}" fill="#3b3f44"/>`;
}

/** Applied indices: framed steel with a lume inset. The 3, 6 and 9 are short bars set across the radius. */
function markers(k: number, id: string) {
  const frame = (x0: number, y0: number, w: number, h: number) => `M${f(x0)},${f(y0)}h${f(w)}v${f(h)}h${f(-w)}Z`;
  let shadow = '', metal = '', lume = '';
  const add = (a: number, x0: number, y0: number, w: number, h: number) => {
    const t = `transform="rotate(${a})"`;
    const d = frame(x0, y0, w, h), inset = frame(x0 + w * .09, y0 + h * .08, w * .82, h * .8);
    shadow += `<path d="${d}" ${t}/>`; metal += `<path d="${d}" ${t}/>`; lume += `<path d="${inset}" ${t}/>`;
  };
  for (let h = 1; h < 12; h++) {
    if (h % 3 === 0) { const w = k * .1, len = k * .05; add(h * 30, -w / 2, -k * .67, w, len); continue; }
    add(h * 30, -k * .044, -k * .672, k * .088, k * .127);
  }
  // 12 o'clock: a tall double index.
  for (const x0 of [-k * .06, k * .008]) add(0, x0, -k * .668, k * .052, k * .126);
  return `<g fill="#000" opacity=".3" transform="translate(.09 .13)">${shadow}</g><g fill="url(#${id}st)" stroke="#e9ebe8" stroke-width=".06">${metal}</g><g fill="url(#${id}lu)"${lu('indices')}>${lume}</g>`;
}

/** Faceted steel hands with lume inserts and long counterweights; red chronograph hand with a black tail. */
function hands(k: number, id: string, L: FullLook) {
  // Near-parallel blades with a short point; the lume fills most of the blade's width.
  const hand = (len: number, w: number, l0: number, l1: number, tail: number) => {
    const body = `M${f(-w * .46)},0L${f(-w / 2)},${f(-l1)}L0,${f(-len)}L${f(w / 2)},${f(-l1)}L${f(w * .46)},0Z`;
    const back = `M${f(-w * .5)},0L${f(-w * .5)},${f(tail - w * .2)}L${f(-w * .3)},${f(tail)}H${f(w * .3)}L${f(w * .5)},${f(tail - w * .2)}L${f(w * .5)},0Z`;
    const lu = `M${f(-w * .34)},${f(-l0)}L${f(-w * .36)},${f(-l1 + w * .05)}L0,${f(-l1 - w * .42)}L${f(w * .36)},${f(-l1 + w * .05)}L${f(w * .34)},${f(-l0)}Z`;
    const face = `M0,${f(-len)}L${f(w / 2)},${f(-l1)}L${f(w * .46)},0H0Z M0,0H${f(w * .5)}V${f(tail - w * .2)}L${f(w * .3)},${f(tail)}H0Z`;
    return { body, back, lu, face };
  };
  const hr = hand(k * .47, k * .07, k * .125, k * .415, k * .18), mn = hand(k * .66, k * .058, k * .135, k * .61, k * .18);
  // Brushed and polished halves are flat tones, with a crisp longitudinal split.
  const brushed = shade(L.handColor, -.28), polished = L.handColor;
  const draw = (h: ReturnType<typeof hand>, a: number, role: HandRole) => `<g ${handRole(role)}transform="rotate(${a})"><path d="${h.back}" fill="${brushed}" stroke="#434849" stroke-width=".06"/><path d="${h.body}" fill="${brushed}" stroke="#f2f3ef" stroke-width=".07"/><path d="${h.face}" fill="${polished}"/><path d="${h.lu}" fill="url(#${id}lu)"${lu('hands')} stroke="#b8bcb0" stroke-width=".05"/></g>`;
  const sh = (h: ReturnType<typeof hand>, a: number, role: HandRole) => `<g ${handRole(role)}transform="rotate(${a})"><path d="${h.body}"/><path d="${h.back}"/></g>`;
  let s = `<g fill="#000" opacity=".26" transform="translate(.2 .28)">${sh(hr, 303.5, 'hour')}${sh(mn, 51.5, 'minute')}</g>`;
  s += draw(hr, 303.5, 'hour') + draw(mn, 51.5, 'minute');
  s += `<g ${handRole('chrono')}transform="rotate(0)"><path d="M-.08,0L-.05,${f(-k * .748)}L.05,${f(-k * .748)}L.08,0Z" fill="${L.accent}"/><path d="M-.27,0L-.24,${f(k * .29)}H.24L.27,0Z" fill="#141618"/></g>`;
  return s + `<circle r="${f(k * .03)}" fill="#141618" stroke="#5b5f63" stroke-width=".06"/><circle r="${f(k * .012)}" fill="#9aa0a3"/>`;
}

export interface SSC947Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** The whole Speedtimer above the strap: case, crown and pushers, bezel, dial and hands. */
export function ssc947SVG(o: SSC947Options) {
  const { D, LL, lw, id, L, outline } = o;
  const R = D / 2, k = R / 1.018, metal = L.caseColor;
  const { d, Rc } = ssc947Case(R, LL, lw);
  let s = '';
  s += crownAndPushers(Rc, id, metal, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(metal, -.3)}" stroke-width=".12"`}/>`;
  if (outline) {
    return s + `<circle r="${f(R * .996)}" fill="none" ${o.stroke}/><circle r="${f(k * .73)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }
  s += defs(id, L, k);
  // Brushed case with a narrow polished edge.
  s += `<defs><clipPath id="${id}cc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}cc)"><path d="${d}" fill="url(#${id}br)"/><path d="${d}" fill="none" stroke="${shade(metal, -.32)}" stroke-width=".9"/><path d="${d}" fill="none" stroke="${shade(metal, .6)}" stroke-width=".35"/></g>`;
  s += bezel(k, R, id, L);
  s += flange(k, id);
  // Dial: orange sunburst under a soft sheen.
  // Fine radial brushing (one compound path of hairlines) under a broad, soft vertical glow.
  let grain = '';
  for (let i = 0; i < 180; i++) grain += `M${pt(k * .1, i * 2)}L${pt(k * .688, i * 2)}`;
  s += `<circle r="${f(k * .689)}" fill="url(#${id}dl)"/><circle r="${f(k * .689)}" fill="url(#${id}gl)"/><path d="${grain}" stroke="#fff3c8" stroke-width=".035" opacity=".16"/><circle r="${f(k * .689)}" fill="url(#${id}sh)" opacity=".45"/>`;
  s += subdial(-k * .364, 0, k * .237, [['60', 0], ['20', 120], ['40', 240]], 60, 248, 'chrono', id, '#e9ecee', k);
  s += subdial(k * .364, 0, k * .237, [['24', 0], ['8', 120], ['16', 240]], 48, 152, 'hour24', id, '#e9ecee', k);
  s += subdial(0, k * .372, k * .224, [['60', 0], ['30', 180]], 60, 270, 'small-seconds', id, L.accent, k, true);
  // Power reserve marks beside the small seconds.
  s += `<g fill="#2b2213" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .045)}" text-anchor="middle" dominant-baseline="central"><text x="${f(-k * .272)}" y="${f(k * .333)}">F</text><text x="${f(-k * .1)}" y="${f(k * .64)}">E</text></g>`;
  s += `<path d="M${f(-k * .247)},${f(k * .336)}h${f(k * .018)}M${f(-k * .2)},${f(k * .52)}l${f(k * .012)},${f(-k * .01)}M${f(-k * .1)},${f(k * .608)}v${f(-k * .016)}" stroke="#2b2213" stroke-width="${f(k * .011)}"/>`;
  s += markers(k, id);
  // Date at 4:30, in a framed white aperture set along the radius.
  const [dx, dy] = P(k * .53, 132);
  s += `<g transform="translate(${f(dx)} ${f(dy)}) rotate(-48)"><rect x="${f(-k * .062)}" y="${f(-k * .05)}" width="${f(k * .124)}" height="${f(k * .1)}" rx=".15" fill="url(#${id}st)" stroke="#6d7271" stroke-width=".05"/><rect x="${f(-k * .044)}" y="${f(-k * .034)}" width="${f(k * .088)}" height="${f(k * .068)}" fill="#f7f6f1"/><text font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .07)}" text-anchor="middle" dominant-baseline="central" fill="#151515">6</text></g>`;
  // Printing: wordmark and the Prospex X.
  s += `<text y="${f(-k * .36)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .098)}" font-weight="700" textLength="${f(k * .376)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="#1d1710">${esc(o.brand.toUpperCase())}</text>`;
  const xs = k * .036, xy0 = -k * .25, ink = '#1d1710';
  s += `<g transform="translate(0 ${f(xy0)})"><path d="M${f(xs * .45)},${f(-xs)}H${f(xs * 1.1)}L${f(-xs * .45)},${f(xs)}H${f(-xs * 1.1)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .16)}" stroke-linejoin="miter"/><path d="M${f(-xs * 1.2)},${f(-xs)}H${f(-xs * .3)}L${f(xs * 1.2)},${f(xs)}H${f(xs * .3)}Z" fill="${ink}"/></g>`;
  s += hands(k, id, L);
  // Restrained crystal highlight.
  s += `<path d="M${f(-k * .55)},${f(-k * .2)}A${f(k * .69)},${f(k * .69)} 0 0 1 ${f(k * .2)},${f(-k * .55)}A${f(k * .9)},${f(k * .9)} 0 0 0 ${f(-k * .55)},${f(-k * .2)}Z" fill="#fff" opacity=".07"/>`;
  return s;
}
