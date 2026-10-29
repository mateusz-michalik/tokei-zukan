import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Serica 5303-1 Diving Chronometer (black enamel): 316L steel case (39.0 mm diameter,
// 46.5 mm lug-to-lug, 20 mm lug width) with twisted lyre lugs carrying wide polished
// bevels, unguarded 8 mm fluted screw-down crown at 3 o'clock, and a 120-tooth coin-edge
// bezel with a double-graduation insert: polished black ceramic outer ring (lumed pip at 12,
// MINUTES, 10/20/30/40, five-minute bars and a 45–60 countdown) around a satin steel
// 12-hour ring (HEURES and 2–11). Double-domed sapphire over a polished inner bevel and dark
// rehaut; glossy black enamel dial with an outer minute track, domed Super-LumiNova C3
// plots joined to the track by fine lines, batons at 3/6/9, a flanked baton at 12,
// CHRONOMÈTRE / 300m-1000ft printing and SERICA / SWISS at 6; white lacquered broad-arrow
// hour, lance minute and lollipop seconds hands.
// Furniture is in units of k, the ceramic ring's outer radius; the case is in mm.
// See docs/models/serica-5303-1.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');
type XY = [number, number];

const xy = ([x, y]: XY) => `${f(x)},${f(y)}`;
/** Rotates a point in a marker's local frame (12 o'clock up) to clock angle a. */
const rot = ([x, y]: XY, a: number): XY => {
  const t = a * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  return [x * c - y * s, x * s + y * c];
};
/** A short clockwise arc at radius r between clock angles a0 and a1, for narrow polished reflections. */
const glint = (r: number, a0: number, a1: number) => `M${pt(r, a0)}A${f(r)},${f(r)} 0 0 1 ${pt(r, a1)}`;
const FONT = `'Avenir Next','Futura','Century Gothic','Trebuchet MS',Arial,sans-serif`;

/**
 * Case silhouette in millimetres. The 120-tooth bezel crest is the specified 39.0 mm diameter
 * (R = 19.5 mm, k = R / 1.038). Lug openings are an exact 20 mm (x = -10..+10) and the twisted
 * lyre lugs reach the 46.5 mm lug-to-lug (y = ±23.25) with slightly angled flat tips, flaring to
 * about ±15.6 mm where they pass just outside the bezel crest near 10:30 and 1:30.
 */
export function serica5303Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, u = R / 19.5;
  const k = R / 1.038;
  const ri = .25 * u, seat = k * .965, bow = .35 * u, rMid = 19.3 * u;
  const jy = 10.5 * u, jx = Math.sqrt(rMid * rMid - jy * jy);

  const lug = (sx: number, sy: number) => {
    const p = (x: number, y: number): XY => [sx * x, sy * -y];
    return {
      in0: p(slot, H - ri), tipC: p(slot, H), tipIn: p(slot + ri, H),
      tipOut: p(slot + 2.65 * u, H - .42 * u), cornerC: p(slot + 3.08 * u, H - .5 * u), corner: p(slot + 3.12 * u, H - .92 * u),
      c1: p(slot + 3.55 * u, 19.4 * u), c2: p(slot + 4.75 * u, 15.5 * u), flank: p(slot + 5.6 * u, 13.3 * u),
      c3: p(slot + 5.95 * u, 12.4 * u), c4: p(jx - .05 * u, 11.5 * u), join: p(jx, jy), seat: p(slot, seat),
    };
  };
  const toJoin = (sx: number, sy: number) => {
    const l = lug(sx, sy);
    return `L${xy(l.in0)}Q${xy(l.tipC)} ${xy(l.tipIn)}L${xy(l.tipOut)}Q${xy(l.cornerC)} ${xy(l.corner)}C${xy(l.c1)} ${xy(l.c2)} ${xy(l.flank)}C${xy(l.c3)} ${xy(l.c4)} ${xy(l.join)}`;
  };
  const fromJoin = (sx: number, sy: number) => {
    const l = lug(sx, sy);
    return `C${xy(l.c4)} ${xy(l.c3)} ${xy(l.flank)}C${xy(l.c2)} ${xy(l.c1)} ${xy(l.corner)}Q${xy(l.cornerC)} ${xy(l.tipOut)}L${xy(l.tipIn)}Q${xy(l.tipC)} ${xy(l.in0)}L${xy(l.seat)}`;
  };
  const arc = (p: XY) => `A${f(rMid)},${f(rMid)} 0 0 1 ${xy(p)}`;

  const d = `M${xy([slot, -seat])}`
    + toJoin(1, 1) + arc([jx, jy]) + fromJoin(1, -1)
    + `Q0,${f(seat - bow)} ${xy([-slot, seat])}`
    + toJoin(-1, -1) + arc([-jx, -jy]) + fromJoin(-1, 1)
    + `Q0,${f(-seat + bow)} ${xy([slot, -seat])}Z`;

  // Wide polished lyre bevel on the top-right lug; mirrored onto the others.
  const l = lug(1, 1);
  const bevel = `M${xy([slot + .42 * u, -H + .03 * u])}L${xy(l.tipOut)}Q${xy(l.cornerC)} ${xy(l.corner)}C${xy(l.c1)} ${xy(l.c2)} ${xy(l.flank)}L${xy([slot + 6 * u, -12.3 * u])}L${xy([slot + 4.1 * u, -12.6 * u])}C${xy([slot + 2.6 * u, -15.6 * u])} ${xy([slot + 1.1 * u, -19.6 * u])} ${xy([slot + .42 * u, -H + .03 * u])}Z`;
  const crease = `M${xy([slot + .42 * u, -H + .03 * u])}C${xy([slot + 1.1 * u, -19.6 * u])} ${xy([slot + 2.6 * u, -15.6 * u])} ${xy([slot + 4.1 * u, -12.6 * u])}`;
  const edge = `M${xy(l.corner)}C${xy(l.c1)} ${xy(l.c2)} ${xy(l.flank)}`;
  return { d, k, bevel, crease, edge };
}

function defs(id: string, L: FullLook, metal: string) {
  return `<defs>
<linearGradient id="${id}sec" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(metal, .3)}"/><stop offset=".5" stop-color="${metal}"/><stop offset="1" stop-color="${shade(metal, -.3)}"/></linearGradient>
<linearGradient id="${id}secy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.45)}"/><stop offset=".22" stop-color="${shade(metal, .5)}"/><stop offset=".48" stop-color="${shade(metal, .82)}"/><stop offset=".74" stop-color="${shade(metal, .1)}"/><stop offset="1" stop-color="${shade(metal, -.46)}"/></linearGradient>
<linearGradient id="${id}sel" x1="0" y1="0" x2="1" y2="0"><stop stop-color="${shade(metal, -.55)}"/><stop offset=".35" stop-color="${shade(metal, -.2)}"/><stop offset=".72" stop-color="${shade(metal, .5)}"/><stop offset=".86" stop-color="${shade(metal, .78)}"/><stop offset="1" stop-color="${shade(metal, .2)}"/></linearGradient>
<linearGradient id="${id}sez" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="${shade(L.bezel, .16)}"/><stop offset=".45" stop-color="${L.bezel}"/><stop offset="1" stop-color="#050608"/></linearGradient>
<linearGradient id="${id}ser" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(metal, .38)}"/><stop offset=".38" stop-color="${shade(metal, -.1)}"/><stop offset=".62" stop-color="${shade(metal, .2)}"/><stop offset="1" stop-color="${shade(metal, -.34)}"/></linearGradient>
<linearGradient id="${id}seb" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(metal, -.8)}"/><stop offset=".38" stop-color="${shade(metal, -.7)}"/><stop offset=".46" stop-color="${shade(metal, -.1)}"/><stop offset=".5" stop-color="${shade(metal, .4)}"/><stop offset=".54" stop-color="${shade(metal, -.1)}"/><stop offset=".62" stop-color="${shade(metal, -.7)}"/><stop offset="1" stop-color="${shade(metal, -.8)}"/></linearGradient>
<radialGradient id="${id}seh" r=".5"><stop offset=".86" stop-color="#14161a"/><stop offset="1" stop-color="#3a3e44"/></radialGradient>
<radialGradient id="${id}sed" cx=".42" cy=".36" r=".72"><stop stop-color="${shade(L.dial, .1)}"/><stop offset=".6" stop-color="${L.dial}"/><stop offset="1" stop-color="#030304"/></radialGradient>
<radialGradient id="${id}sep" cx=".38" cy=".34" r=".7"><stop stop-color="#fcfdf6"/><stop offset=".6" stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.16)}"/></radialGradient>
<pattern id="${id}sebr" patternUnits="userSpaceOnUse" width=".4" height=".6"><path d="M0,0V.6M.2,0V.6" stroke="#fff" stroke-width=".045" opacity=".12"/><path d="M.1,0V.6M.3,0V.6" stroke="#42484d" stroke-width=".035" opacity=".08"/></pattern>
</defs>`;
}

/** Unguarded 8 mm screw-down crown at 3 o'clock: tube, chamfered barrel and deep flutes. */
function crown(D: number, id: string, metal: string, outline: boolean, stroke: string) {
  const u = D / 39, h = 4 * u, x0 = 19.8 * u, x1 = 23.5 * u, ci = .55 * u, co = .62 * u;
  const cyl = outline ? 'none' : `url(#${id}secy)`, dark = shade(metal, -.6);
  let s = '';
  if (!outline) s += `<rect x="${f(18.9 * u)}" y="${f(-2.6 * u)}" width="${f(.9 * u)}" height="${f(5.2 * u)}" fill="${dark}"/>`;
  s += `<rect x="${f(18.9 * u)}" y="${f(-2.1 * u)}" width="${f(1.05 * u)}" height="${f(4.2 * u)}" fill="${cyl}" ${stroke}/>`;
  s += `<path d="M${f(x0)},${f(-h + ci)}L${f(x0 + ci)},${f(-h)}H${f(x1 - co)}L${f(x1)},${f(-h + co)}V${f(h - co)}L${f(x1 - co)},${f(h)}H${f(x0 + ci)}L${f(x0)},${f(h - ci)}Z" fill="${cyl}" ${stroke}/>`;
  if (outline) return s;
  let grooves = '', ridges = '';
  for (let i = -3; i <= 3; i++) {
    const y = i * 1.1 * u;
    grooves += `M${f(x0 + .55 * u)},${f(y)}H${f(x1 - .5 * u)}`;
    ridges += `M${f(x0 + .6 * u)},${f(y + .52 * u)}H${f(x1 - .55 * u)}`;
  }
  s += `<path d="${grooves}" stroke="${dark}" stroke-width="${f(.42 * u)}" stroke-linecap="round"/>`;
  s += `<path d="${ridges}" stroke="#fff" stroke-width="${f(.12 * u)}" opacity=".7"/>`;
  s += `<path d="M${f(x1 - .2 * u)},${f(-h + co + .2 * u)}V${f(h - co - .2 * u)}" stroke="#f6f8f9" stroke-width="${f(.18 * u)}" opacity=".8"/>`;
  return s;
}

/**
 * 120-tooth coin edge and polished black ceramic outer ring: lumed pip at 12, curved MINUTES with
 * a dot at 5, numerals 10–40, five-minute bars and minute ticks across the 45–60 countdown.
 */
function bezel(k: number, id: string, L: FullLook) {
  const teeth = 120, step = 360 / teeth, half = step / 2, metal = L.caseColor;
  let crest = `M${pt(k * 1.008, -half)}`, facets = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    crest += `L${pt(k * 1.038, a)}L${pt(k * 1.008, a + half)}`;
    facets += `M${pt(k * 1.038, a)}L${pt(k * 1.008, a + half)}L${pt(k * 1.016, a + half * .3)}Z`;
  }
  let s = `<circle r="${f(k * 1.012)}" fill="${shade(metal, -.25)}"/>`;
  s += `<path d="${crest}Z" fill="${shade(metal, .38)}" stroke="${shade(metal, -.3)}" stroke-width=".04"/>`;
  s += `<path d="${facets}" fill="${shade(metal, -.36)}" opacity=".6"/>`;
  s += `<circle r="${f(k * 1.004)}" fill="none" stroke="#eef2f5" stroke-width=".12"/>`;

  const rOut = k, rIn = k * .875;
  s += `<circle r="${f(rOut)}" fill="url(#${id}sez)"/>`;
  // Polished ceramic reflections, upper left and lower right.
  const band = (a0: number, a1: number) => `M${pt(rOut, a0)}A${f(rOut)},${f(rOut)} 0 0 1 ${pt(rOut, a1)}L${pt(rIn, a1)}A${f(rIn)},${f(rIn)} 0 0 0 ${pt(rIn, a0)}Z`;
  s += `<path d="${band(282, 338)}" fill="#dfe6ee" opacity=".06"/><path d="${band(118, 150)}" fill="#dfe6ee" opacity=".035"/>`;
  s += `<circle r="${f(rOut)}" fill="none" stroke="#5c636b" stroke-width=".07"/>`;

  const bt = L.bezelText;
  let ticks = '', bars = '';
  for (let m = 15; m < 60; m += 5) if (m % 10 || m === 50) bars += `M${pt(k * .985, m * 6)}L${pt(k * .895, m * 6)}`;
  for (let m = 46; m < 60; m++) if (m % 5) ticks += `M${pt(k * .975, m * 6)}L${pt(k * .92, m * 6)}`;
  s += `<path d="${ticks}" stroke="${bt}" stroke-width="${f(k * .009)}" opacity=".9"/><path d="${bars}" stroke="${bt}" stroke-width="${f(k * .026)}"/>`;
  s += `<circle cx="${f(P(k * .893, 30)[0])}" cy="${f(P(k * .893, 30)[1])}" r="${f(k * .011)}" fill="${bt}"/>`;

  s += `<g fill="${bt}" font-family="${FONT}" font-size="${f(k * .112)}" font-weight="600" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40]) {
    const a = v * 6, [x, y] = P(k * .94, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${a} ${f(x)} ${f(y)})">${v}</text>`;
  }
  s += '</g>' + arcWord('MINUTES', k * .945, 31, 3.55, k * .062, 400, bt);
  return s;
}

/**
 * A word set letter by letter along an arc, centred on clock angle `a`. It reads clockwise with letter tops
 * outward, or with `below`, counterclockwise across the bottom with tops towards the centre so it stays upright.
 */
function arcWord(word: string, r: number, a: number, step: number, size: number, weight: number, fill: string, below = false) {
  let s = `<g fill="${fill}" font-family="${FONT}" font-size="${f(size)}" font-weight="${weight}" text-anchor="middle" dominant-baseline="central">`;
  [...word].forEach((ch, i) => {
    const b = a + (below ? -1 : 1) * (i - (word.length - 1) / 2) * step, [x, y] = P(r, b);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${f(below ? b - 180 : b)} ${f(x)} ${f(y)})">${esc(ch)}</text>`;
  });
  return s + '</g>';
}

/** Satin steel 12-hour ring with engraved HEURES and 2–11, its polished inner bevel, and the lumed pip at 12. */
function hourRing(k: number, id: string, L: FullLook) {
  const metal = L.caseColor, ink = '#16181b';
  let s = `<circle r="${f(k * .875)}" fill="url(#${id}ser)"/>`;
  for (const [fr, c, o] of [[.858, '#fff', .16], [.84, '#30363b', .1], [.822, '#fff', .12]] as const) {
    s += `<circle r="${f(k * fr)}" fill="none" stroke="${c}" stroke-width=".05" opacity="${o}"/>`;
  }
  s += `<circle r="${f(k * .875)}" fill="none" stroke="#202328" stroke-width=".07"/>`;
  // Polished inner bevel: dark slope between a bright outer lip and a fine inner edge, with narrow reflections.
  s += `<circle r="${f(k * .7625)}" fill="none" stroke="url(#${id}seb)" stroke-width="${f(k * .075)}"/>`;
  s += `<circle r="${f(k * .797)}" fill="none" stroke="${shade(metal, .8)}" stroke-width="${f(k * .008)}"/>`;
  s += `<circle r="${f(k * .73)}" fill="none" stroke="${shade(metal, .7)}" stroke-width="${f(k * .005)}" opacity=".7"/>`;
  s += `<path d="${glint(k * .776, 292, 334)}${glint(k * .776, 112, 154)}" fill="none" stroke="#fff" stroke-width="${f(k * .012)}" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="${glint(k * .745, 300, 322)}${glint(k * .745, 120, 142)}" fill="none" stroke="#fff" stroke-width="${f(k * .007)}" stroke-linecap="round" opacity=".4"/>`;

  s += `<g fill="${ink}" font-family="${FONT}" font-size="${f(k * .084)}" font-weight="600" text-anchor="middle" dominant-baseline="central">`;
  // Engraved radially like the minute scale, except the 6, which stays upright so it cannot read as a 9.
  for (let h = 2; h <= 11; h++) {
    const a = h * 30, [x, y] = P(k * .838, a);
    s += `<text x="${f(x)}" y="${f(y)}" transform="rotate(${h === 6 ? 0 : a} ${f(x)} ${f(y)})">${h}</text>`;
  }
  s += '</g>' + arcWord('HEURES', k * .838, 30, 3.9, k * .068, 700, ink);

  // Raised lume pearl at 12, set in a polished steel cup across the ceramic/steel join.
  s += `<circle cy="${f(-k * .89)}" r="${f(k * .057)}" fill="url(#${id}secy)" stroke="${shade(metal, -.5)}" stroke-width=".05"/>`;
  s += `<circle cy="${f(-k * .89)}" r="${f(k * .044)}" fill="url(#${id}sep)"${lu('bezel')} stroke="#a7ab94" stroke-width=".04"/>`;
  return s;
}

/** Dark rehaut under the domed crystal, glossy enamel dial and its outer minute track. */
function dial(k: number, id: string, L: FullLook) {
  let s = `<circle r="${f(k * .725)}" fill="url(#${id}seh)"/>`;
  // Domed crystal edge: a dark seat, a fine bright rim and a narrow reflection rather than a broad grey band.
  s += `<circle r="${f(k * .724)}" fill="none" stroke="#08090b" stroke-width="${f(k * .006)}"/>`;
  s += `<circle r="${f(k * .719)}" fill="none" stroke="#e6ecf1" stroke-width="${f(k * .005)}" opacity=".55"/>`;
  s += `<circle r="${f(k * .7)}" fill="none" stroke="#c8d0d8" stroke-width="${f(k * .004)}" opacity=".25"/>`;
  s += `<path d="${glint(k * .71, 296, 338)}" fill="none" stroke="#fff" stroke-width="${f(k * .008)}" stroke-linecap="round" opacity=".42"/>`;
  s += `<circle r="${f(k * .632)}" fill="url(#${id}sed)"/>`;
  s += `<circle r="${f(k * .636)}" fill="none" stroke="#000" stroke-width="${f(k * .012)}" opacity=".6"/>`;
  let ticks = '';
  for (let m = 0; m < 60; m++) ticks += `M${pt(k * .629, m * 6)}L${pt(k * .601, m * 6)}`;
  s += `<path d="${ticks}" stroke="${L.bezelText}" stroke-width="${f(k * .0075)}" opacity=".92"/>`;
  s += `<circle r="${f(k * .627)}" fill="none" stroke="${L.bezelText}" stroke-width="${f(k * .005)}" opacity=".75"/>`;
  return s;
}

/**
 * Domed Super-LumiNova C3 markers: plots at 1, 2, 4, 5, 7, 8, 10 and 11 joined to the track by
 * fine lines, batons at 3, 6 and 9, and a baton at 12 flanked by two smaller plots.
 */
function markers(k: number, id: string, L: FullLook) {
  const circle = ([x, y]: XY, r: number) => `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
  const baton = (a: number, r0: number, r1: number, w: number) => {
    const c = [[-w / 2, -r1], [w / 2, -r1], [w / 2, -r0], [-w / 2, -r0]].map(p => xy(rot(p as XY, a)));
    return `M${c.join('L')}Z`;
  };
  let shape = '', glint = '', sticks = '';
  const plot = (p: XY, r: number) => {
    shape += circle(p, r);
    glint += circle([p[0] - r * .3, p[1] - r * .32], r * .28);
  };
  const rP = k * .425, ro = k * .043;
  for (const h of [1, 2, 4, 5, 7, 8, 10, 11]) {
    plot(P(rP, h * 30), ro);
    sticks += `M${pt(rP + ro, h * 30)}L${pt(k * .628, h * 30)}`;
  }
  for (const s of [-1, 1]) plot(P(k * .598, s * 8.8), k * .035);
  shape += baton(0, k * .478, k * .624, k * .072) + baton(90, k * .465, k * .624, k * .062) + baton(270, k * .465, k * .624, k * .062) + baton(180, k * .49, k * .624, k * .066);
  for (const [a, r0] of [[0, .478], [90, .465], [180, .49], [270, .465]] as const) {
    glint += baton(a, k * (r0 + .02), k * .6, k * .016);
  }

  return `<path d="${sticks}" stroke="${L.bezelText}" stroke-width="${f(k * .009)}"/>`
    + `<path d="${shape}" fill="#000" opacity=".45" transform="translate(.07 .1)"/>`
    + `<path d="${shape}" fill="url(#${id}sep)"${lu('indices')} stroke="${shade(L.lume, -.3)}" stroke-width=".05"/>`
    + `<path d="${glint}" fill="#fff" opacity=".35"/>`;
}

/** CHRONOMÈTRE and 300m-1000ft below the pivot, and the brand and SWISS flanking the 6 o'clock baton. */
function printing(k: number, L: FullLook, brand: string) {
  const ink = L.bezelText, label = (brand || 'SERICA').toUpperCase();
  return `<g fill="${ink}" font-family="${FONT}" text-anchor="middle">`
    + `<text y="${f(k * .206)}" font-size="${f(k * .056)}" font-weight="600" textLength="${f(k * .44)}" lengthAdjust="spacingAndGlyphs">CHRONOMÈTRE</text>`
    + `<text y="${f(k * .27)}" font-size="${f(k * .047)}" font-weight="500" textLength="${f(k * .3)}" lengthAdjust="spacingAndGlyphs">300<tspan font-style="italic">m</tspan>-1000<tspan font-style="italic">ft</tspan></text>`
    + `</g>`
    // Curved along the lower track, upright, with a clear gap either side of the 6 o'clock baton.
    + arcWord(label, k * .583, 180 + 5.7 + (label.length - 1) * 1.175 + 1.1, 2.35, k * .032, 500, ink, true)
    + arcWord('SWISS', k * .583, 168.5, 2.35, k * .032, 500, ink, true);
}

/** White lacquered handset: broad-arrow hour hand, lance minute hand and lollipop seconds hand at 10:10:38. */
function hands(k: number, id: string, L: FullLook) {
  const white = L.handColor, edge = shade(white, -.32);
  const hour = `M0,${f(-k * .385)}L${f(k * .118)},${f(-k * .2)}L${f(k * .022)},${f(-k * .252)}L${f(k * .017)},${f(k * .07)}H${f(-k * .017)}L${f(-k * .022)},${f(-k * .252)}L${f(-k * .118)},${f(-k * .2)}Z`;
  const hourLume = `M0,${f(-k * .352)}L${f(k * .086)},${f(-k * .214)}L${f(k * .018)},${f(-k * .243)}H${f(-k * .018)}L${f(-k * .086)},${f(-k * .214)}Z`;
  const minute = `M${f(-k * .016)},${f(k * .11)}L${f(-k * .016)},${f(-k * .12)}L${f(-k * .042)},${f(-k * .32)}L0,${f(-k * .632)}L${f(k * .042)},${f(-k * .32)}L${f(k * .016)},${f(-k * .12)}L${f(k * .016)},${f(k * .11)}Z`;
  const minuteLume = `M${f(-k * .008)},${f(-k * .15)}L${f(-k * .0265)},${f(-k * .32)}L0,${f(-k * .566)}L${f(k * .0265)},${f(-k * .32)}L${f(k * .008)},${f(-k * .15)}Z`;
  const seconds = `M${f(-k * .007)},${f(k * .17)}H${f(k * .007)}L${f(k * .003)},${f(-k * .63)}H${f(-k * .003)}Z`;
  const ha = 305, ma = 60, sa = 228;

  let s = `<g fill="#000" opacity=".36" transform="translate(.15 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${seconds}" ${handRole('second')}transform="rotate(${sa})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hour}" fill="${white}" stroke="${edge}" stroke-width=".05"/><path d="${hourLume}" fill="url(#${id}sep)"${lu('hands')} stroke="${shade(L.lume, -.3)}" stroke-width=".04"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minute}" fill="${white}" stroke="${edge}" stroke-width=".045"/><path d="${minuteLume}" fill="url(#${id}sep)"${lu('hands')} stroke="${shade(L.lume, -.18)}" stroke-width=".03"/></g>`;
  const sc = L.accent || white;
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="${seconds}" fill="${sc}" stroke="${edge}" stroke-width=".03"/><circle cy="${f(-k * .52)}" r="${f(k * .03)}" fill="${sc}" stroke="${edge}" stroke-width=".03"/><circle cy="${f(-k * .52)}" r="${f(k * .021)}" fill="url(#${id}sep)"${lu('seconds')}/></g>`;
  return s + `<circle r="${f(k * .042)}" fill="${white}" stroke="${edge}" stroke-width=".05"/><circle r="${f(k * .014)}" fill="${shade(white, -.3)}"/>`;
}

export interface Serica5303Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the Serica 5303-1 Diving Chronometer. */
export function serica5303SVG(o: Serica5303Options) {
  const { D, LL, lw, id, L, outline } = o;
  const metal = L.caseColor;
  const { d, k, bevel, crease, edge } = serica5303Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, metal);
  s += crown(D, id, metal, outline, o.stroke);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}sec)`}" ${outline ? o.stroke : `stroke="${shade(metal, -.3)}" stroke-width=".12"`}/>`;
  if (outline) {
    return s + `<circle r="${f(k * 1.038)}" fill="none" ${o.stroke}/><circle r="${f(k * .725)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  }

  // Twisted lyre lugs: a wide polished bevel on each, satin-brushed elsewhere.
  let lugs = '';
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const t = `transform="scale(${sx} ${sy})"`;
    lugs += `<path d="${bevel}" ${t} fill="url(#${id}sel)"/>`;
    lugs += `<path d="${crease}" ${t} fill="none" stroke="#f4f7f9" stroke-width=".1" opacity=".7"/>`;
    lugs += `<path d="${edge}" ${t} fill="none" stroke="${shade(metal, sx < 0 ? .7 : .45)}" stroke-width=".16"/>`;
  }
  s += `<defs><clipPath id="${id}secc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}secc)"><path d="${d}" fill="url(#${id}sebr)"/>${lugs}<path d="${d}" fill="none" stroke="${shade(metal, -.34)}" stroke-width=".3"/></g>`;

  s += bezel(k, id, L);
  s += hourRing(k, id, L);
  s += dial(k, id, L);
  s += markers(k, id, L);
  s += printing(k, L, o.brand);
  s += hands(k, id, L);

  // Double-domed sapphire reflection.
  s += `<path d="M${f(-k * .5)},${f(-k * .2)}A${f(k * .66)},${f(k * .66)} 0 0 1 ${f(k * .16)},${f(-k * .52)}A${f(k * .86)},${f(k * .86)} 0 0 0 ${f(-k * .5)},${f(-k * .2)}Z" fill="#fff" opacity=".07"/>`;
  return s;
}
