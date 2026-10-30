import type { Strap } from '../catalog/schema';
import { shade } from '../lib/util';

/** Where the strap goes, in mm. Both halves are drawn: one up from the case, one down. */
export interface StrapGeom {
  /** Lug width. */
  lw: number;
  /** Distance from the centre where the strap starts, tucked under the case. */
  start: number;
  /** Distance from the centre to the lug ends. */
  lugEnd: number;
  /** How far the strap runs past the lug ends. */
  len: number;
  /** Unique prefix for gradient and pattern ids. */
  id: string;
  /** Case colour, used for bracelets and NATO hardware. */
  metal: string;
  /** Optional centre-link fraction for a model-specific oyster bracelet. */
  centreWidth?: number;
  /** Braided Seichu finish and dark keeper for the Black Series supplied nylon. */
  seichu?: boolean;
  /** Mesh with an integrated end link, hinged polished centre bar and solid terminal (Serica 5303). */
  meshLink?: boolean;
  /** SKX-style five-row bracelet (SSK003): long flat links at one pitch and an end link divided into five pieces. */
  fiveRow?: boolean;
}

const LABELS: Record<string, string> = {
  oyster: 'Oyster bracelet', jubilee: 'Jubilee bracelet', beads: 'Beads of rice bracelet', president: 'President bracelet', mesh: 'Mesh bracelet',
  smooth: 'Rubber', tropic: 'Tropic rubber', waffle: 'Waffle rubber', wave: 'Wave rubber', panels: 'Textured panel rubber', ribbed: 'Ribbed resin',
};

/** A short human name for a strap, e.g. "Oyster bracelet, polished centre". `name` wins when set. */
export function strapLabel(s: Strap) {
  if (s.name) return s.name;
  switch (s.type) {
    case 'bracelet': return LABELS[s.style] + (s.centre === 'polished' && s.style === 'oyster' ? ', polished centre' : '');
    case 'nato': return 'NATO';
    case 'rubber': return LABELS[s.style];
    case 'leather': return 'Leather';
    case 'nylon': return 'Nylon';
  }
}

/** Taper from the lug width down towards the buckle or clasp, over a typical strap length. */
const taperTo = (s: Strap, lw: number) => (s.type === 'nato' ? lw : s.type === 'bracelet' ? lw - 3 : lw - 2);
const TAPER_LEN = 70;
const FIT_LEN = 9;

const f = (n: number) => +n.toFixed(3);

/** Draws both halves of the strap as an SVG fragment, to sit under the case. */
export function strapSVG(s: Strap, g: StrapGeom) {
  const { lw, start, lugEnd, len, id } = g;
  const end = lugEnd + len;
  const endW = taperTo(s, lw);
  // A fitted end flares out to the case and blends back to the lug width over FIT_LEN.
  const fit = s.type === 'rubber' && s.fitted ? s.fitted - lw : 0;
  // A fitted end either curves quickly back to the lug width or, with fittedLength, narrows in a straight line.
  const fitLen = s.type === 'rubber' && s.fittedLength;
  const fitAt = (t: number) => (fitLen ? fit * Math.max(0, 1 - t / fitLen) : fit * Math.max(0, 1 - t / FIT_LEN) ** 2);
  const wAt = (d: number) => {
    const t = Math.max(0, d - lugEnd);
    return lw - (lw - endW) * Math.min(1, t / (s.type === 'rubber' && s.style === 'panels' ? 14 : TAPER_LEN)) + fitAt(t);
  };
  /** Trapezoid from distance a to b on side sy, inset by `inset` mm from each edge. */
  const band = (sy: number, a: number, b: number, inset = 0) => {
    if (!fit) {
      const wa = wAt(a) / 2 - inset, wb = wAt(b) / 2 - inset;
      // Keep the full attachment width beneath/between the lugs. The taper
      // begins at the lug end, rather than interpolating from the hidden root.
      const kink = a < lugEnd && b > lugEnd;
      const wl = lw / 2 - inset;
      return `M${f(-wa)},${f(sy * a)}L${f(wa)},${f(sy * a)}${kink ? `L${f(wl)},${f(sy * lugEnd)}` : ''}L${f(wb)},${f(sy * b)}L${f(-wb)},${f(sy * b)}${kink ? `L${f(-wl)},${f(sy * lugEnd)}` : ''}Z`;
    }
    // Sample the edges so a fitted end's curve shows.
    const ys = Array.from({ length: 13 }, (_, i) => a + (b - a) * i / 12);
    const right = ys.map(y => `${f(wAt(y) / 2 - inset)},${f(sy * y)}`), left = ys.map(y => `${f(-wAt(y) / 2 + inset)},${f(sy * y)}`).reverse();
    return 'M' + [...right, ...left].join('L') + 'Z';
  };
  const halves = [-1, 1];
  let defs = '', out = '';

  /** Gradient across the strap width: darker rolled edges, lighter middle. */
  const across = (gid: string, c: string, edge = -.28, mid = .07) =>
    `<linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(c, edge)}"/><stop offset=".14" stop-color="${c}"/><stop offset=".5" stop-color="${shade(c, mid)}"/><stop offset=".86" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, edge)}"/></linearGradient>`;

  if (s.type === 'leather') {
    const c = s.color, st = s.stitch ?? shade(c, .32);
    defs += across(`${id}x`, c, -.32, .1);
    if (s.texture === 'croc') {
      // Crocodile-pattern embossing: a column of large scales down the middle, offset smaller ones towards the edges.
      const p = 2.7, x0 = -lw / 2;
      let grooves = `M0,0H${f(lw)}M${f(lw / 2 - 3.4)},0V${f(2 * p)}M${f(lw / 2 + 3.4)},0V${f(2 * p)}M${f(lw / 2 - 6.6)},0V${f(2 * p)}M${f(lw / 2 + 6.6)},0V${f(2 * p)}`;
      grooves += `M${f(lw / 2 - 3.4)},${p}H${f(lw / 2 + 3.4)}`;
      for (const y of [p / 2, 1.5 * p]) grooves += `M${f(lw / 2 - 6.6)},${y}H${f(lw / 2 - 3.4)}M${f(lw / 2 + 3.4)},${y}H${f(lw / 2 + 6.6)}`;
      for (const y of [p / 2, p, 1.5 * p]) grooves += `M0,${y}H${f(lw / 2 - 6.6)}M${f(lw / 2 + 6.6)},${y}H${f(lw)}`;
      defs += `<pattern id="${id}cr" patternUnits="userSpaceOnUse" x="${f(x0)}" width="${f(lw)}" height="${f(2 * p)}"><path d="${grooves}" stroke="${shade(c, -.6)}" stroke-width=".24" stroke-linecap="round" opacity=".32"/><path d="${grooves}" stroke="${shade(c, .5)}" stroke-width=".09" opacity=".1" transform="translate(.16 .16)"/></pattern>`;
    }
    for (const sy of halves) {
      out += `<path d="${band(sy, start, end)}" fill="url(#${id}x)"/>`;
      if (s.texture === 'croc') out += `<path d="${band(sy, lugEnd - 1, end, .5)}" fill="url(#${id}cr)"/>`;
      out += `<path d="${band(sy, lugEnd + .6, end, 2.4)}" fill="#fff" opacity=".05"/>`;
      for (const sx of [-1, 1]) {
        const a = Math.max(start, lugEnd - 2), x0 = sx * (wAt(a) / 2 - 1.1), x1 = sx * (wAt(end) / 2 - 1.1);
        out += `<line x1="${f(x0)}" y1="${f(sy * a)}" x2="${f(x1)}" y2="${f(sy * end)}" stroke="${st}" stroke-width=".22" stroke-dasharray=".9 .55"/>`;
      }
    }
  } else if (s.type === 'rubber') {
    const c = s.color, dark = shade(c, -.55), light = shade(c, .35);
    defs += across(`${id}x`, c, -.3, .1);
    if (s.style === 'tropic') defs += `<pattern id="${id}p" patternUnits="userSpaceOnUse" width=".38" height=".38" patternTransform="rotate(45)"><rect width=".38" height=".38" fill="${shade(c, -.02)}"/><path d="M0,0H.38M0,0V.38" stroke="${dark}" stroke-width=".065" opacity=".18"/><path d="M.06,.06H.32V.32" fill="none" stroke="${light}" stroke-width=".035" opacity=".08"/></pattern>`;
    // Seiko's silicone: rows of shallow wavy ribs across the strap.
    if (s.style === 'wave') defs += `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="4.4" height="2.3"><path d="M0,1.3Q1.1,.4 2.2,1.3T4.4,1.3" fill="none" stroke="${dark}" stroke-width=".5" opacity=".6"/><path d="M0,1.75Q1.1,.85 2.2,1.75T4.4,1.75" fill="none" stroke="${light}" stroke-width=".18" opacity=".35"/></pattern>`;
    // Casio's resin: shallow grooves straight across every 4.5 mm, each with a lit lip on its far side.
    if (s.style === 'ribbed') defs += `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="4" height="4.5"><rect y="1.6" width="4" height=".5" fill="${dark}" opacity=".7"/><rect y="2.1" width="4" height=".2" fill="${light}" opacity=".3"/></pattern>`;
    if (s.style === 'waffle') defs += `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="4" height="2.2"><rect x="0" y="0" width="4" height="1" fill="${dark}" opacity=".45"/><rect x="0" y="1" width="4" height=".18" fill="${light}" opacity=".35"/></pattern>`;
    if (s.style === 'panels') defs += `<pattern id="${id}p" patternUnits="userSpaceOnUse" width=".92" height="1.16"><rect width=".92" height="1.16" fill="${shade(c, -.18)}"/><path d="M-.23,.28L0,.04L.46,.5L.92,.04L1.15,.28M-.23,.86L0,.62L.46,1.08L.92,.62L1.15,.86" fill="none" stroke="${dark}" stroke-width=".21" stroke-linejoin="round"/><path d="M-.23,.23L0,-.01L.46,.45L.92,-.01L1.15,.23M-.23,.81L0,.57L.46,1.03L.92,.57L1.15,.81" fill="none" stroke="${light}" stroke-width=".09" opacity=".65"/></pattern>`;
    for (const sy of halves) {
      out += `<path d="${band(sy, start, end)}" fill="url(#${id}x)"/>`;
      if (s.style === 'panels') {
        const panelStart = lugEnd + .8;
        defs += `<clipPath id="${id}panel${sy}"><path d="${band(sy, panelStart, end, .95)}"/></clipPath><linearGradient id="${id}bend${sy}" gradientUnits="userSpaceOnUse" x1="0" y1="${sy * (lugEnd - 4.2)}" x2="0" y2="${sy * (lugEnd + 2)}"><stop stop-color="#000" stop-opacity=".5"/><stop offset=".64" stop-color="#000" stop-opacity=".08"/><stop offset=".86" stop-color="#fff" stop-opacity=".035"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
        out += `<path d="${band(sy, start, end)}" fill="url(#${id}bend${sy})"/><g clip-path="url(#${id}panel${sy})">`;
        for (const sx of [-1, 1]) {
          // Both textured panels taper with the strap, surrounding a smooth central spine.
          const xa = sx * (lw * .17), xb = sx * (wAt(end) * .17), outerA = sx * (wAt(panelStart) / 2 - 1), outerB = sx * (wAt(end) / 2 - 1);
          out += `<path d="M${xa},${sy * panelStart}L${outerA},${sy * panelStart}L${outerB},${sy * end}L${xb},${sy * end}Z" fill="url(#${id}p)" stroke="${dark}" stroke-width=".15" stroke-linejoin="round"/>`;
        }
        out += '</g>';
      } else if (s.style === 'smooth') {
        out += `<path d="${band(sy, lugEnd, end, wAt(end) * .3)}" fill="${light}" opacity=".12"/>`;
      } else if (s.style === 'tropic') {
        const pStart = Math.max(start, lugEnd - 5.2);
        defs += `<linearGradient id="${id}tb${sy}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(sy * pStart)}" x2="0" y2="${f(sy * (lugEnd + 1.6))}"><stop stop-color="#000" stop-opacity=".38"/><stop offset=".68" stop-color="#000" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
        out += `<path d="${band(sy, pStart, end, 1.32)}" fill="url(#${id}p)" stroke="${dark}" stroke-width=".08" stroke-opacity=".28"/>`;
        out += `<path d="${band(sy, start, lugEnd + 1.6)}" fill="url(#${id}tb${sy})"/>`;
        // Alternating 2-1-2 perforation holes down the textured centre panel.
        let holes = '', rims = '';
        const rx = .66, ry = .54;
        for (let row = 0, d = lugEnd + 3.9; d < end - 1.1; row++, d += 3.3) {
          const xs = row % 2 === 0 ? [-4.55, 4.55] : [0];
          for (const x of xs) {
            holes += `M${f(x - rx)},${f(sy * d)}a${rx},${ry} 0 1 0 ${f(2 * rx)},0a${rx},${ry} 0 1 0 ${f(-2 * rx)},0`;
            rims += `M${f(x - rx - .12)},${f(sy * d)}a${f(rx + .12)},${f(ry + .12)} 0 1 0 ${f(2 * (rx + .12))},0a${f(rx + .12)},${f(ry + .12)} 0 1 0 ${f(-2 * (rx + .12))},0`;
          }
        }
        if (holes) out += `<path d="${rims}" fill="${dark}" opacity=".65"/><path d="${holes}" fill="#050709"/>`;
      } else {
        out += `<path d="${band(sy, lugEnd + .8, end, s.style === 'wave' ? 1.8 : s.style === 'ribbed' ? .7 : 1.6)}" fill="url(#${id}p)"/>`;
      }
    }
  } else if (s.type === 'nylon') {
    const c = s.color;
    defs += across(`${id}x`, c, -.25, .06);
    defs += g.seichu
      ? `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="1.6" height="1.1"><path d="M0,0L.8,.45L1.6,0M0,.55L.8,1L1.6,.55M0,1.1L.8,1.55L1.6,1.1" fill="none" stroke="${shade(c, -.65)}" stroke-width=".34"/><path d="M0,-.08L.8,.37L1.6,-.08M0,.47L.8,.92L1.6,.47M0,1.02L.8,1.47L1.6,1.02" fill="none" stroke="${shade(c, .24)}" stroke-width=".12"/></pattern>`
      : `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="2" height=".7"><rect width="2" height=".28" fill="#000" opacity=".16"/></pattern>`;
    for (const sy of halves) {
      out += `<path d="${band(sy, start, end)}" fill="url(#${id}x)"/>`;
      out += `<path d="${band(sy, start, end)}" fill="url(#${id}p)"/>`;
      out += `<path d="${band(sy, lugEnd - 1, end, .7)}" fill="none" stroke="${shade(c, -.3)}" stroke-width=".3"/>`;
    }
    if (g.seichu && len > 9) {
      const y = lugEnd + Math.min(len - 3.2, 12), width = wAt(y) + .6;
      defs += across(`${id}keeper`, g.metal, -.4, .18);
      out += `<rect x="${f(-width / 2)}" y="${f(y)}" width="${f(width)}" height="3" rx=".45" fill="url(#${id}keeper)" stroke="${shade(g.metal, -.4)}" stroke-width=".12"/><text x="0" y="${f(y + 2.05)}" text-anchor="middle" font-family="Georgia,serif" font-size="1.65" textLength="9.4" lengthAdjust="spacingAndGlyphs" fill="${shade(g.metal, -.55)}">SEIKO</text>`;
    }
  } else if (s.type === 'nato') {
    // One continuous band: a NATO threads under the case through both spring bars.
    const n = s.colors.length, cw = lw / n, y0 = -end, h = 2 * end;
    s.colors.forEach((c, i) => { out += `<rect x="${f(-lw / 2 + i * cw)}" y="${f(y0)}" width="${f(cw + .02)}" height="${f(h)}" fill="${c}"/>`; });
    defs += `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="1" height=".6"><rect width="1" height=".22" fill="#000" opacity=".2"/><rect y=".3" width="1" height=".1" fill="#fff" opacity=".07"/></pattern>`;
    defs += `<linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".08" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`;
    out += `<rect x="${f(-lw / 2)}" y="${f(y0)}" width="${f(lw)}" height="${f(h)}" fill="url(#${id}p)"/>`;
    out += `<rect x="${f(-lw / 2)}" y="${f(y0)}" width="${f(lw)}" height="${f(h)}" fill="url(#${id}e)"/>`;
    // Steel keeper just below the case on the 6 o'clock side.
    if (len > 5) {
      const hw = s.hardware ?? g.metal;
      defs += `<linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(hw, .45)}"/><stop offset=".5" stop-color="${hw}"/><stop offset="1" stop-color="${shade(hw, -.35)}"/></linearGradient>`;
      out += `<rect x="${f(-lw / 2 - .5)}" y="${f(lugEnd + 2.6)}" width="${f(lw + 1)}" height="2.4" rx=".7" fill="url(#${id}k)" stroke="${shade(hw, -.45)}" stroke-width=".2"/>`;
    }
  } else {
    out += braceletSVG(s, g, end, wAt, band, d => { defs += d; });
  }
  return `<defs>${defs}</defs>${out}`;
}

type Bracelet = Extract<Strap, { type: 'bracelet' }>;
/** Columns across the bracelet as fractions of its width, with the link length and stagger for each. */
interface Col { a: number; b: number; len: number; offset: number; polish: boolean; round?: boolean; bead?: boolean; barrel?: boolean }

/** The SSK003's five rows, as fractions of the bracelet's width, measured on the reference photo. */
const FIVE_ROW = [0, .3, .435, .565, .7, 1];

function braceletColumns(s: Bracelet, centreWidth = .4, fiveRow = false): Col[] {
  const pc = s.centre === 'polished';
  if (fiveRow && s.style === 'jubilee') {
    // Every row shares one pitch; the outer and middle rows break together and the rows between them are offset half a link.
    const p = 4.3;
    return FIVE_ROW.slice(0, -1).map((a, i) => ({ a, b: FIVE_ROW[i + 1], len: p, offset: i % 2 ? p / 2 : 0, polish: i > 0 && i < 4 }));
  }
  switch (s.style) {
    case 'jubilee': {
      const p = 4.4, sm = (1 - .54) / 3;
      return [
        { a: 0, b: .27, len: p, offset: 0, polish: false },
        { a: .27, b: .27 + sm, len: p / 2, offset: 0, polish: true, round: true },
        { a: .27 + sm, b: .27 + 2 * sm, len: p / 2, offset: p / 4, polish: true, round: true },
        { a: .27 + 2 * sm, b: .73, len: p / 2, offset: 0, polish: true, round: true },
        { a: .73, b: 1, len: p, offset: 0, polish: false },
      ];
    }
    case 'beads': {
      const p = 4, n = 5, bw = .6 / n;
      return [
        { a: 0, b: .2, len: p, offset: 0, polish: false },
        ...Array.from({ length: n }, (_, i) => ({ a: .2 + i * bw, b: .2 + (i + 1) * bw, len: p / 2, offset: i % 2 ? p / 4 : 0, polish: true, bead: true })),
        { a: .8, b: 1, len: p, offset: 0, polish: false },
      ];
    }
    case 'president': {
      const p = 5.8;
      return [
        { a: 0, b: .31, len: p, offset: 0, polish: false, barrel: true },
        { a: .31, b: .69, len: p, offset: 0, polish: pc, barrel: true },
        { a: .69, b: 1, len: p, offset: 0, polish: false, barrel: true },
      ];
    }
    default: { // oyster: three rows, centre links staggered half a link
      const p = 5.2, side = (1 - centreWidth) / 2;
      return [
        { a: 0, b: side, len: p, offset: 0, polish: false },
        { a: side, b: 1 - side, len: p, offset: p / 2, polish: pc },
        { a: 1 - side, b: 1, len: p, offset: 0, polish: false },
      ];
    }
  }
}

function braceletSVG(s: Bracelet, g: StrapGeom, end: number, wAt: (d: number) => number,
  band: (sy: number, a: number, b: number, inset?: number) => string, addDefs: (d: string) => void) {
  const { id, start, lugEnd } = g;
  const m = s.metal ?? g.metal, gap = shade(m, -.52);
  // Links read as softly rounded solids: dark at their ends, with a broad reflection across the middle.
  addDefs(`<linearGradient id="${id}o" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.3)}"/><stop offset=".22" stop-color="${shade(m, .1)}"/><stop offset=".5" stop-color="${shade(m, .24)}"/><stop offset=".8" stop-color="${shade(m, .02)}"/><stop offset="1" stop-color="${shade(m, -.32)}"/></linearGradient>`);
  addDefs(`<linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(m, -.38)}"/><stop offset=".2" stop-color="${shade(m, .48)}"/><stop offset=".45" stop-color="${shade(m, .7)}"/><stop offset=".72" stop-color="${shade(m, .12)}"/><stop offset="1" stop-color="${shade(m, -.36)}"/></linearGradient>`);
  addDefs(`<pattern id="${id}h" patternUnits="userSpaceOnUse" width="2" height=".26"><rect width="2" height=".04" fill="#fff" opacity=".14"/><rect y=".14" width="2" height=".03" fill="#000" opacity=".07"/></pattern>`);
  addDefs(`<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(m, -.2)}"/><stop offset=".5" stop-color="${shade(m, .1)}"/><stop offset="1" stop-color="${shade(m, -.2)}"/></linearGradient>`);
  // Rounded (barrel) links catch the light along their length.
  addDefs(`<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(m, -.35)}"/><stop offset=".3" stop-color="${shade(m, .45)}"/><stop offset=".55" stop-color="${shade(m, .05)}"/><stop offset="1" stop-color="${shade(m, -.4)}"/></linearGradient>`);
  addDefs(`<radialGradient id="${id}r" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="${shade(m, .7)}"/><stop offset=".55" stop-color="${shade(m, .05)}"/><stop offset="1" stop-color="${shade(m, -.4)}"/></radialGradient>`);
  if (s.style === 'mesh') addDefs(`<pattern id="${id}m" patternUnits="userSpaceOnUse" width=".9" height=".9"><path d="M0,.9L.9,0M-.2,.2L.2,-.2M.7,1.1L1.1,.7" stroke="${gap}" stroke-width=".22" opacity=".7"/><path d="M0,0L.9,.9" stroke="${shade(m, .5)}" stroke-width=".12" opacity=".6"/></pattern>`);
  let out = '';
  for (const sy of [-1, 1]) {
    const clip = `${id}c${sy < 0 ? 'u' : 'd'}`;
    addDefs(`<clipPath id="${clip}"><path d="${band(sy, start, end)}"/></clipPath>`);
    out += `<path d="${band(sy, start, end)}" fill="${gap}"/>`;
    out += `<g clip-path="url(#${clip})">`;
    if (s.style === 'mesh') {
      const m0 = g.meshLink ? lugEnd + 5.6 : lugEnd + .2;
      out += `<path d="${band(sy, m0, end)}" fill="url(#${id}b)"/><path d="${band(sy, m0, end)}" fill="url(#${id}m)"/>`;
    } else {
      const cols = braceletColumns(s, g.centreWidth, g.fiveRow);
      const gp = .2;
      for (const c of cols) {
        for (let y = lugEnd + c.offset - (c.offset ? c.len : 0); y < end; y += c.len) {
          const y0 = Math.max(y, lugEnd) + gp / 2, y1 = y + c.len - gp / 2;
          if (y1 - y0 < .4) continue;
          const w = wAt((y0 + y1) / 2), x0 = -w / 2 + c.a * w + gp / 2, x1 = -w / 2 + c.b * w - gp / 2;
          const yy = sy < 0 ? -y1 : y0, hh = y1 - y0;
          const fill = c.bead ? `url(#${id}r)` : c.barrel ? `url(#${id}v)` : c.polish ? `url(#${id}p)` : `url(#${id}o)`;
          if (c.bead) out += `<ellipse cx="${f((x0 + x1) / 2)}" cy="${f(yy + hh / 2)}" rx="${f((x1 - x0) / 2)}" ry="${f(hh / 2)}" fill="${fill}"/>`;
          else out += `<rect x="${f(x0)}" y="${f(yy)}" width="${f(x1 - x0)}" height="${f(hh)}" rx="${c.round ? f(Math.min(x1 - x0, hh) * .45) : c.barrel ? .9 : g.fiveRow ? .25 : f(Math.min(.7, hh * .22))}" fill="${fill}"/>`;
        }
      }
      // Fine brushing across the links.
      out += `<path d="${band(sy, lugEnd, end)}" fill="url(#${id}h)"/>`;
    }
    // End link: fills the opening between the lugs and runs just past their tips. Three-row bracelets get a
    // three-piece end link whose centre piece continues further, with a curved end.
    if (g.meshLink && s.style === 'mesh') {
      // Integrated end link and solid terminal, with a hinged polished centre bar just past the lug tips.
      const span = (a: number, b: number) => sy < 0 ? [-b, b - a] : [a, b - a];
      const xb = g.lw * .38, [by, bh] = span(lugEnd - 1.2, lugEnd + 2.6), [gy, gh] = span(lugEnd + 2.6, lugEnd + 3.2), [jy, jh] = span(lugEnd - 1.45, lugEnd - 1.2);
      const body = band(sy, start, lugEnd + 5.6);
      out += `<path d="${body}" fill="url(#${id}o)" stroke="${gap}" stroke-width=".18"/><path d="${body}" fill="url(#${id}h)"/>`;
      out += `<rect x="${f(-xb - .25)}" y="${f(jy)}" width="${f(2 * xb + .5)}" height="${f(jh)}" fill="${gap}"/><rect x="${f(-xb - .25)}" y="${f(gy)}" width="${f(2 * xb + .5)}" height="${f(gh)}" fill="${gap}"/>`;
      out += `<rect x="${f(-xb)}" y="${f(by)}" width="${f(2 * xb)}" height="${f(bh)}" rx=".3" fill="url(#${id}p)"/>`;
      out += `<path d="M${f(-xb - .12)},${f(by)}v${f(bh)}M${f(xb + .12)},${f(by)}v${f(bh)}" stroke="${gap}" stroke-width=".18"/>`;
      out += `</g>`;
      continue;
    }
    if (g.fiveRow && s.style === 'jubilee') {
      // Straight-ended end link, divided into the same five pieces as the rows: brushed outer, polished centre.
      const e = lugEnd + .45, y0 = sy < 0 ? -e : start, h = e - start, W = g.lw - .3;
      FIVE_ROW.slice(0, -1).forEach((a, i) => {
        const x0 = -W / 2 + a * W + .09, x1 = -W / 2 + FIVE_ROW[i + 1] * W - .09;
        out += `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(h)}" rx=".25" fill="url(#${id}${i > 0 && i < 4 ? 'p' : 'o'})"/>`;
      });
      out += `<path d="M${f(-W / 2)},${f(sy * e)}H${f(W / 2)}" stroke="${gap}" stroke-width=".22"/><path d="${band(sy, start, e)}" fill="url(#${id}h)"/></g>`;
      continue;
    }
    const xL = -g.lw / 2 + .15, e0 = lugEnd + .6, e1 = lugEnd + 1.6;
    const pieces = s.style === 'oyster' || s.style === 'president';
    const centre = s.style === 'oyster' ? (g.centreWidth ?? .4) : .4;
    const xa = -g.lw * centre / 2, xb = -xa;
    const endLink = pieces
      ? `M${f(xL)},${f(sy * start)}H${f(-xL)}V${f(sy * e0)}H${f(xb)}V${f(sy * (e1 - .5))}Q0,${f(sy * (e1 + .5))} ${f(xa)},${f(sy * (e1 - .5))}V${f(sy * e0)}H${f(xL)}Z`
      : `M${f(xL)},${f(sy * start)}H${f(-xL)}V${f(sy * e0)}Q0,${f(sy * (2 * e1 - e0))} ${f(xL)},${f(sy * e0)}Z`;
    out += `<path d="${endLink}" fill="url(#${id}o)" stroke="${gap}" stroke-width=".18"/><path d="${endLink}" fill="url(#${id}h)"/>`;
    if (pieces) out += `<path d="M${f(xa)},${f(sy * Math.min(start, lugEnd - 2.5))}V${f(sy * e0)}M${f(xb)},${f(sy * Math.min(start, lugEnd - 2.5))}V${f(sy * e0)}" stroke="${gap}" stroke-width=".16"/>`;
    out += `</g>`;
  }
  return out;
}
