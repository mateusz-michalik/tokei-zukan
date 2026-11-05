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
  /** Optional link pitch in mm for a model-specific oyster bracelet, such as Rolex's long Oyster links. */
  linkPitch?: number;
  /**
   * Oyster bracelets: each centre link in two polished pieces per pitch, as on Citizen's Tsuyosa: a rounded block this
   * many mm long, then a narrow recessed bridge with a seam, in line with the outer links rather than staggered. Only
   * the outer rows are brushed.
   */
  centreSplit?: number;
  /**
   * `flat`: brushed links shaded as flat faces lit from above, as on Rolex's Oyster: a dark joint shadow, a bright upper
   * face falling into shade where each link turns away, square corners and edges that roll off at the sides.
   */
  linkShade?: 'flat';
  /** Braided Seichu finish and dark keeper for the Black Series supplied nylon. */
  seichu?: boolean;
  /** Mesh with an integrated end link, hinged polished centre bar and solid terminal (Serica 5303). */
  meshLink?: boolean;
  /**
   * A model's five-row bracelet, drawn for its `jubilee`-style bracelet: rows at one pitch and an end link divided into
   * the same five pieces. `ssk003`: SKX-style, three polished centre rows. `moonwatch`: the 2021 Speedmaster's, two
   * narrow polished rows between brushed outer and centre links. `bb58`: the Black Bay 58's, three polished centre rows
   * between wide arched satin links.
   */
  fiveRow?: 'ssk003' | 'moonwatch' | 'bb58';
  /** A model's own bracelet taper: its width at the clasp, reached `taperLen` mm past the lugs. Bracelets only. */
  clasp?: number;
  taperLen?: number;
  /** `along`: fine brushing down the bracelet's length instead of across it, as on Casio's folded-steel links. */
  brush?: 'along';
  /**
   * Oyster bracelets: single-piece links across the whole width, as on Tissot's PRX. Each link's middle, `centre` mm
   * wide, stands `step` mm proud of its outer parts towards the case, so every joint steps round the next link's middle,
   * with a polished bevel along each edge facing the case. The first link's middle, `rootWidth` wide, runs on into the
   * case's opening to `root` mm from the centre; there's no separate end link. Pitch from `linkPitch`.
   */
  stepped?: { centre: number; step: number; root: number; rootWidth: number };
}

const LABELS: Record<string, string> = {
  oyster: 'Oyster bracelet', jubilee: 'Jubilee bracelet', beads: 'Beads of rice bracelet', president: 'President bracelet', mesh: 'Mesh bracelet',
  smooth: 'Rubber', tropic: 'Tropic rubber', waffle: 'Waffle rubber', wave: 'Wave rubber', panels: 'Textured panel rubber', ribbed: 'Ribbed resin', segmented: 'Segmented resin',
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
export function strapSVG(s: Strap, geom: StrapGeom) {
  // A fitted bracelet is drawn as if the lugs were as wide as its links, and a resin band with its own `width` at
  // that width; other straps keep the real lug width.
  const g = s.type === 'bracelet' && s.fitted ? { ...geom, lw: s.fitted } : s.type === 'rubber' && s.width ? { ...geom, lw: s.width } : geom;
  const { lw, start, lugEnd, len, id } = g;
  const end = lugEnd + len;
  const five = s.type === 'bracelet' && s.style === 'jubilee' && g.fiveRow ? FIVE_ROWS[g.fiveRow] : undefined;
  // A model's own bracelet taper applies to its bracelet only; any other strap tapers as usual.
  const own = s.type === 'bracelet' && !five;
  const endW = five?.clasp ?? (own && g.clasp ? g.clasp : taperTo(s, lw)), taperLen = five?.taperLen ?? (own && g.taperLen ? g.taperLen : TAPER_LEN);
  // A fitted end flares out to the case and blends back to the lug width over FIT_LEN.
  const fit = s.type === 'rubber' && s.fitted ? s.fitted - lw : 0;
  // A fitted end either curves quickly back to the lug width or, with fittedLength, narrows in a straight line.
  const fitLen = s.type === 'rubber' && s.fittedLength;
  const fitAt = (t: number) => (fitLen ? fit * Math.max(0, 1 - t / fitLen) : fit * Math.max(0, 1 - t / FIT_LEN) ** 2);
  const wAt = (d: number) => {
    const t = Math.max(0, d - lugEnd);
    return lw - (lw - endW) * Math.min(1, t / (s.type === 'rubber' && s.style === 'panels' ? 14 : taperLen)) + fitAt(t);
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
      } else if (s.style === 'segmented') {
        // G-Shock's resin: rounded segments every 4.75 mm, each overhanging the next. A deep shadow under each step,
        // a lit crown across the segment rolling into shade towards its far edge, and a lit lip at that edge; a pair of
        // recessed dimples on the two segments nearest the case.
        const p = 4.75, pid = `${id}sg${sy < 0 ? 'u' : 'd'}`;
        // One segment's profile from the case side outwards, repeated along the band from the case edge: so each
        // segment reads as a rounded slab rather than as stripes. The upper half runs the other way.
        const prof: [number, number][] = [[0, -.8], [.1, -.7], [.17, .2], [.32, .3], [.58, .06], [.86, -.24], [.91, .34], [.96, .1], [1, -.3]];
        const stops = (sy < 0 ? [...prof].reverse().map(([o, a]) => [1 - o, a]) : prof).map(([o, a]) => `<stop offset="${o}" stop-color="${shade(c, a)}"/>`).join('');
        defs += `<pattern id="${pid}" patternUnits="userSpaceOnUse" x="-40" y="${f(sy < 0 ? -lugEnd : lugEnd)}" width="80" height="${p}"><linearGradient id="${pid}g" x1="0" y1="0" x2="0" y2="1">${stops}</linearGradient><rect width="80" height="${p}" fill="url(#${pid}g)"/></pattern>`;
        out += `<path d="${band(sy, lugEnd, end)}" fill="url(#${pid})" opacity=".85"/>`;
        // The band's edges roll away on every segment.
        out += `<path d="${band(sy, lugEnd, end)}" fill="url(#${id}x)" opacity=".35"/>`;
        // The dimples, each layer for all four on this half drawn as one path.
        const dims: number[][] = [];
        for (const k of [0, 1]) {
          const d = lugEnd + k * p + 3.1;
          if (d + 1.2 <= end) for (const sx of [-1, 1]) dims.push([sx * Math.min(8.45, wAt(d) / 2 - 2.8), sy * d]);
        }
        if (dims.length) {
          const ov = (rx: number, ry: number, dx = 0, dy = 0) => dims.map(([x, y]) => `M${f(x + dx - rx)},${f(y + dy)}a${rx},${ry} 0 1 0 ${f(2 * rx)},0a${rx},${ry} 0 1 0 ${f(-2 * rx)},0`).join('');
          const arcs = dims.map(([x, y]) => `M${f(x - .95)},${f(y + .3)}A1.05,.85 0 0 0 ${f(x + .95)},${f(y + .3)}`).join('');
          out += `<path d="${ov(1.25, 1.02)}" fill="${light}" opacity=".18"/><path d="${ov(1.18, .96, .06, .08)}" fill="${dark}" opacity=".75"/>`
            + `<path d="${ov(.9, .7, 0, .16)}" fill="${c}"/><path d="${arcs}" fill="none" stroke="${light}" stroke-width=".16" opacity=".45"/>`;
        }
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
    // Woven nylon: offset blocks of over-and-under weave, not continuous stripes.
    defs += `<pattern id="${id}p" patternUnits="userSpaceOnUse" width="1.4" height=".8"><rect width=".7" height=".4" fill="#000" opacity=".17"/><rect x=".7" y=".4" width=".7" height=".4" fill="#000" opacity=".17"/><path d="M0,.03H.7M.7,.43H1.4" stroke="#fff" stroke-width=".06" opacity=".09"/></pattern>`;
    defs += `<linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".08" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`;
    out += `<rect x="${f(-lw / 2)}" y="${f(y0)}" width="${f(lw)}" height="${f(h)}" fill="url(#${id}p)"/>`;
    out += `<rect x="${f(-lw / 2)}" y="${f(y0)}" width="${f(lw)}" height="${f(h)}" fill="url(#${id}e)"/>`;
    // Leather-trimmed NATOs, like Hamilton's, end in leather tabs and have no steel keeper by the case.
    // The tabs sit at fixed places on the strap, about 12.4 mm past each lug end; only the part inside the drawn length
    // shows, so they stay put whatever length is drawn.
    if (s.leather) {
      for (const sy of [-1, 1]) {
        const a = lugEnd + 12.4, b = Math.min(a + 2.7, end);
        if (a >= end) continue;
        const y = sy > 0 ? a : -b;
        out += `<rect x="${f(-lw / 2 - .25)}" y="${f(y)}" width="${f(lw + .5)}" height="${f(b - a)}" rx=".5" fill="${s.leather}" stroke="${shade(s.leather, -.4)}" stroke-width=".15"/><path d="M${f(-lw / 2 + .4)},${f(sy > 0 ? a + .45 : -a - .45)}H${f(lw / 2 - .4)}" stroke="${shade(s.leather, .35)}" stroke-width=".18" opacity=".7"/>`;
      }
    } else if (len > 5) {
      // Steel keeper just below the case on the 6 o'clock side.
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
interface Col {
  a: number; b: number; len: number; offset: number; polish: boolean; round?: boolean; bead?: boolean; barrel?: boolean;
  /** Length of each piece when shorter than the pitch, and its own face: a split centre link's block and bridge. */
  piece?: number; face?: 'pill' | 'mirrorFlat';
}

/**
 * Five-row bracelets, measured on their reference photos: each row's edges as fractions of the bracelet's width, which
 * rows are polished, each row's stagger as a fraction of the link pitch, and the pitch in mm.
 */
const FIVE_ROWS: Record<'ssk003' | 'moonwatch' | 'bb58', {
  edges: number[]; polish: boolean[]; offset: number[]; pitch: number;
  /** Width at the clasp, where the maker states it, reached `taperLen` mm past the lugs; otherwise the shared taper. */
  clasp?: number; taperLen?: number;
  /** Brushed links drawn as arched: a stronger light across their middles and deeper shade at their ends. */
  arched?: boolean;
  /**
   * Per-row finish, overriding the shared ones: `flat`, mirror-flat links divided by thin dark lines, each with a bright
   * lip below the line and a face brightening downwards; `pill`, separate rounded links whose ends roll away into deep
   * shadow; `satin`, brushed links lit across their upper half and shading into each joint. With each row's gap in mm.
   */
  rowFinish?: ('flat' | 'pill' | 'satin' | undefined)[]; rowGap?: number[];
  // These finishes are kept close in contrast to the shared bracelets' so the catalogue reads as one style.
  /**
   * The polished rows run on through the end link to the case, which then has pieces only for the outer rows, and the
   * brushing lies only on the brushed rows.
   */
  through?: boolean;
  /** Gap between links and rows, and each link's corner radius, in mm. */
  gap?: number; rx?: number;
}> = {
  // SSK003: the outer and middle rows break together and the rows between them are offset half a link.
  ssk003: { edges: [0, .3, .435, .565, .7, 1], polish: [false, true, true, true, false], offset: [0, .5, 0, .5, 0], pitch: 4.3 },
  // Speedmaster Moonwatch (310.30.42.50.01.001): wide arched outer and centre links with narrow polished rows between;
  // the polished rows break with the outer links and the centre links are offset half a link. It tapers from 20 mm
  // to a 15 mm clasp, and its rows stand apart more deeply than the SKX's flat links.
  moonwatch: { edges: [0, .265, .33, .67, .735, 1], polish: [false, true, false, true, false], offset: [0, 0, .5, 0, 0], pitch: 5, clasp: 15, taperLen: 55, gap: .32, rx: .55, arched: true },
  // Black Bay 58 (M7939A1A0NU-0001): wide arched satin outer links and three polished centre rows offset half a link
  // from the middle one, as on the SKX but with wider outer links and a longer pitch. The rows either side are flat
  // mirror links divided by thin lines; the middle row is separate rounded links with shadowed gaps. It tapers
  // as the photo shows, towards 16 mm 30 mm past the lugs; Tudor doesn't give the clasp width.
  bb58: { edges: [0, .272, .422, .578, .728, 1], polish: [false, true, true, true, false], offset: [0, .5, 0, .5, 0], pitch: 5.6, gap: .3, rx: .45, arched: true,
    rowFinish: ['satin', 'flat', 'pill', 'flat', 'satin'], rowGap: [.2, .14, .5, .14, .2], through: true, clasp: 16, taperLen: 30 },
};

function braceletColumns(s: Bracelet, centreWidth = .4, fiveRow?: StrapGeom['fiveRow'], linkPitch = 5.2, centreSplit?: number): Col[] {
  const pc = s.centre === 'polished';
  if (fiveRow && s.style === 'jubilee') {
    // Every row shares one pitch.
    const { edges, polish, offset, pitch: p } = FIVE_ROWS[fiveRow];
    return edges.slice(0, -1).map((a, i) => ({ a, b: edges[i + 1], len: p, offset: offset[i] * p, polish: polish[i] }));
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
      const p = linkPitch, side = (1 - centreWidth) / 2;
      if (centreSplit) return [
        { a: 0, b: side, len: p, offset: 0, polish: false },
        { a: side, b: 1 - side, len: p, offset: 0, piece: centreSplit, polish: pc, face: 'pill' },
        { a: side, b: 1 - side, len: p, offset: centreSplit, piece: p - centreSplit, polish: pc, face: 'mirrorFlat' },
        { a: 1 - side, b: 1, len: p, offset: 0, polish: false },
      ];
      return [
        { a: 0, b: side, len: p, offset: 0, polish: false },
        { a: side, b: 1 - side, len: p, offset: p / 2, polish: pc },
        { a: 1 - side, b: 1, len: p, offset: 0, polish: false },
      ];
    }
  }
}

/**
 * The metal finishes every bracelet is drawn with, as shade amounts on the bracelet's metal colour, so all bracelets
 * share one contrast range whatever their construction. See "Metal finish" in docs/watch-illustration-standard.md.
 */
export const FINISH = {
  /** The shadow between links and rows. */
  joint: -.56,
  /** Where a link turns away at its ends. */
  edge: -.42,
  /** A satin face's shaded and lit parts. */
  shade: -.12, face: .08, lit: .28,
  /** A polished face's highlight, and the dark reflection across it. */
  hi: .66, dip: -.24,
} as const;
const F = FINISH;

/** A vertical gradient across one link, from stops of [offset, shade amount]. */
const linkGrad = (id: string, m: string, stops: [number, number][]) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, a]) => `<stop offset="${o}" stop-color="${shade(m, a)}"/>`).join('')}</linearGradient>`;

/**
 * The link faces, built from FINISH. `satin`: a brushed link, lit across its upper half and turning away at both ends.
 * `polished`: a bright highlight, then a dark reflection, rolling off at the ends. `flat`: a flat satin link lit from
 * above, with a joint shadow and a narrow lip. `mirrorFlat`: a flat polished link, a thin dark line, a bright lip and
 * a face brightening downwards. `pill`: a separate rounded polished link. `creased`: a satin link with a faint crease
 * across it, in line with the seam of a split centre link beside it. `slab`: a broad, nearly flat satin link, lit a
 * little across its middle. `bevel`: a narrow polished bevel along a link's edge, bright with a shaded lip.
 */
const FACES: Record<'satin' | 'polished' | 'flat' | 'mirrorFlat' | 'pill' | 'creased' | 'slab' | 'bevel', [number, number][]> = {
  satin: [[0, F.edge], [.16, F.face], [.42, F.lit], [.78, F.face * .5], [1, F.edge]],
  polished: [[0, F.edge], [.14, F.lit + .2], [.34, F.hi], [.56, F.dip], [.78, F.face + .1], [1, F.edge]],
  flat: [[0, F.joint], [.07, F.shade], [.15, F.lit + .1], [.45, F.lit], [.8, F.face * .5], [1, F.edge * .7]],
  mirrorFlat: [[0, F.joint], [.05, F.joint], [.08, F.hi * .85], [.13, F.lit], [.2, F.dip * .5], [.6, F.face + .02], [.9, F.hi * .62], [1, F.lit * .7]],
  pill: [[0, F.edge], [.12, F.shade], [.3, F.lit + .1], [.55, F.hi * .82], [.8, F.face + .07], [1, F.edge]],
  creased: [[0, F.edge], [.12, F.face], [.32, F.lit], [.52, F.face * .5], [.57, F.shade], [.62, F.lit * .8], [.86, F.face * .5], [1, F.edge]],
  slab: [[0, F.shade], [.15, F.shade * .3], [.5, F.face], [.85, F.shade * .3], [1, F.shade]],
  bevel: [[0, F.lit + .1], [.3, F.hi], [.65, F.hi * .8], [1, F.shade]],
};

/**
 * Tissot PRX-style single-piece links (StrapGeom `stepped`) on one side of the case: each link's outline steps round
 * the next link's middle, with the shared `slab` face, lengthwise brushing and a polished `bevel` along each edge that
 * faces the case. Drawn inside the bracelet's clip, over the joint colour.
 */
function steppedLinks(g: StrapGeom, sy: number, end: number, wAt: (d: number) => number) {
  const { id, lugEnd } = g, { centre: tw, step, root, rootWidth } = g.stepped!, P = g.linkPitch ?? 6.3, gp = .3, bv = .75;
  const pt = (x: number, d: number) => `${f(x)},${f(sy * d)}`;
  let links = '', all = '', bevels = '';
  for (let k = 0, o = lugEnd; o - step < end; k++, o += P) {
    // This link's middle runs into the opening before it (the case's, for the first); its far edges step round the
    // next link's middle, a joint's width clear of it.
    const c0 = k ? o - step : root, t = (k ? tw : rootWidth) - gp, o1 = o + P - gp, c1 = o1 - step, n = tw + gp;
    const h0 = wAt(o) / 2, h1 = wAt(o1) / 2;
    const d = `M${pt(-h0, o)}L${pt(-t / 2, o)}L${pt(-t / 2, c0)}L${pt(t / 2, c0)}L${pt(t / 2, o)}L${pt(h0, o)}`
      + `L${pt(h1, o1)}L${pt(n / 2, o1)}L${pt(n / 2, c1)}L${pt(-n / 2, c1)}L${pt(-n / 2, o1)}L${pt(-h1, o1)}Z`;
    links += `<path d="${d}" fill="url(#${id}tf)"/>`;
    all += d;
    // The bevels along the edges facing the case: across each outer part, and across the middle.
    const y = (a: number) => f(sy < 0 ? -a - bv : a), hb = wAt(o + bv) / 2;
    bevels += `<rect x="${f(-hb)}" y="${y(o)}" width="${f(hb - t / 2)}" height="${bv}" fill="url(#${id}tv)"/>`
      + `<rect x="${f(t / 2)}" y="${y(o)}" width="${f(hb - t / 2)}" height="${bv}" fill="url(#${id}tv)"/>`
      + `<rect x="${f(-t / 2)}" y="${y(c0)}" width="${f(t)}" height="${bv}" fill="url(#${id}tv)"/>`;
  }
  return links + `<path d="${all}" fill="url(#${id}h)"/>` + bevels;
}

function braceletSVG(s: Bracelet, g: StrapGeom, end: number, wAt: (d: number) => number,
  band: (sy: number, a: number, b: number, inset?: number) => string, addDefs: (d: string) => void) {
  const { id, start, lugEnd } = g;
  const m = s.metal ?? g.metal, through = s.style === 'jubilee' && !!g.fiveRow && !!FIVE_ROWS[g.fiveRow].through;
  const gap = shade(m, F.joint);
  // Satin and polished links, from the shared finishes.
  addDefs(linkGrad(`${id}o`, m, FACES.satin) + linkGrad(`${id}p`, m, FACES.polished));
  addDefs(g.brush === 'along'
    ? `<pattern id="${id}h" patternUnits="userSpaceOnUse" width=".32" height="2"><rect width=".04" height="2" fill="#fff" opacity=".18"/><rect x=".17" width=".03" height="2" fill="#000" opacity=".09"/></pattern>`
    : `<pattern id="${id}h" patternUnits="userSpaceOnUse" width="2" height=".26"><rect width="2" height=".04" fill="#fff" opacity=".14"/><rect y=".14" width="2" height=".03" fill="#000" opacity=".07"/></pattern>`);
  addDefs(`<linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${shade(m, -.2)}"/><stop offset=".5" stop-color="${shade(m, .1)}"/><stop offset="1" stop-color="${shade(m, -.2)}"/></linearGradient>`);
  // Rounded (barrel) links catch the light along their length.
  addDefs(linkGrad(`${id}v`, m, [[0, F.edge], [.3, F.lit + .15], [.55, F.face * .5], [1, F.edge]]));
  addDefs(`<radialGradient id="${id}r" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="${shade(m, .7)}"/><stop offset=".55" stop-color="${shade(m, .05)}"/><stop offset="1" stop-color="${shade(m, -.4)}"/></radialGradient>`);
  if (s.style === 'mesh') addDefs(`<pattern id="${id}m" patternUnits="userSpaceOnUse" width=".9" height=".9"><path d="M0,.9L.9,0M-.2,.2L.2,-.2M.7,1.1L1.1,.7" stroke="${gap}" stroke-width=".22" opacity=".7"/><path d="M0,0L.9,.9" stroke="${shade(m, .5)}" stroke-width=".12" opacity=".6"/></pattern>`);
  let out = '';
  for (const sy of [-1, 1]) {
    const clip = `${id}c${sy < 0 ? 'u' : 'd'}`;
    addDefs(`<clipPath id="${clip}"><path d="${band(sy, start, end)}"/></clipPath>`);
    out += `<path d="${band(sy, start, end)}" fill="${gap}"/>`;
    out += `<g clip-path="url(#${clip})">`;
    if (g.stepped && s.style === 'oyster') {
      if (sy < 0) addDefs(linkGrad(`${id}tf`, m, FACES.slab) + linkGrad(`${id}tv`, m, FACES.bevel));
      out += steppedLinks(g, sy, end, wAt) + '</g>';
      continue;
    }
    if (s.style === 'mesh') {
      const m0 = g.meshLink ? lugEnd + 5.6 : lugEnd + .2;
      out += `<path d="${band(sy, m0, end)}" fill="url(#${id}b)"/><path d="${band(sy, m0, end)}" fill="url(#${id}m)"/>`;
    } else {
      const cols = braceletColumns(s, g.centreWidth, g.fiveRow, g.linkPitch, g.centreSplit);
      const five = s.style === 'jubilee' && g.fiveRow ? FIVE_ROWS[g.fiveRow] : undefined;
      const flat = g.linkShade === 'flat' && s.style === 'oyster';
      const gp = flat ? .34 : five?.gap ?? .2;
      if (flat && sy < 0) addDefs(linkGrad(`${id}f`, m, FACES.flat)
        + `<linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#000" stop-opacity=".3"/><stop offset=".07" stop-color="#000" stop-opacity="0"/><stop offset=".93" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>`);
      // Arched links: bright across the crown of each link, falling away into shade where it meets the next.
      if (five?.through && sy < 0) addDefs(`<pattern id="${id}hv" patternUnits="userSpaceOnUse" width=".42" height="3"><path d="M.06,0V3M.27,0V3" stroke="#fff" stroke-width=".05" opacity=".2"/><path d="M.17,0V3M.36,0V3" stroke="#3d4144" stroke-width=".035" opacity=".12"/></pattern>`);
      if (g.centreSplit && !five && sy < 0) addDefs(linkGrad(`${id}ml`, m, FACES.mirrorFlat) + linkGrad(`${id}mc`, m, FACES.pill) + linkGrad(`${id}mk`, m, FACES.creased));
      if (five?.rowFinish && sy < 0) addDefs(linkGrad(`${id}ml`, m, FACES.mirrorFlat) + linkGrad(`${id}ms`, m, FACES.satin) + linkGrad(`${id}mc`, m, FACES.pill));
      if (five?.arched && sy < 0) addDefs(linkGrad(`${id}a`, m, [[0, F.edge - .06], [.16, F.face], [.42, F.lit + .08], [.74, F.face * .3], [1, F.edge - .06]]));
      cols.forEach((c, ci) => {
        const rf = five?.rowFinish?.[ci], gy = five?.rowGap?.[ci] ?? gp;
        const from = five?.through && c.polish ? start : lugEnd;
        for (let y = lugEnd + c.offset - (c.offset ? c.len : 0) - (from < lugEnd ? c.len : 0); y < end; y += c.len) {
          const y0 = Math.max(y, from) + gy / 2, y1 = y + (c.piece ?? c.len) - gy / 2;
          if (y1 - y0 < .4) continue;
          const gx = through ? .14 : gp, w = wAt((y0 + y1) / 2), x0 = -w / 2 + c.a * w + gx / 2, x1 = -w / 2 + c.b * w - gx / 2;
          const yy = sy < 0 ? -y1 : y0, hh = y1 - y0;
          const face = c.polish && c.face ? (c.face === 'pill' ? 'pill' : 'flat') : rf;
          const fill = c.bead ? `url(#${id}r)` : c.barrel ? `url(#${id}v)` : c.polish ? `url(#${id}${face === 'flat' ? 'ml' : face === 'pill' ? 'mc' : 'p'})` : rf === 'satin' ? `url(#${id}ms)` : g.centreSplit && !five ? `url(#${id}mk)` : five?.arched ? `url(#${id}a)` : flat ? `url(#${id}f)` : `url(#${id}o)`;
          if (c.bead) out += `<ellipse cx="${f((x0 + x1) / 2)}" cy="${f(yy + hh / 2)}" rx="${f((x1 - x0) / 2)}" ry="${f(hh / 2)}" fill="${fill}"/>`;
          else out += `<rect x="${f(x0)}" y="${f(yy)}" width="${f(x1 - x0)}" height="${f(hh)}" rx="${c.round ? f(Math.min(x1 - x0, hh) * .45) : c.barrel ? .9 : face === 'flat' ? .08 : face === 'pill' ? .3 : rf === 'satin' ? .9 : g.centreSplit && !five ? .3 : g.fiveRow ? (five?.rx ?? .25) : flat ? .15 : f(Math.min(.7, hh * .22))}" fill="${fill}"/>`;
        }
      });
      // Flat links roll away at the bracelet's edges.
      if (flat) out += `<path d="${band(sy, lugEnd, end)}" fill="url(#${id}e)"/>`;
      // Fine brushing across the links: across the whole bracelet, or only its brushed rows.
      if (five?.through) {
        cols.forEach(c => {
          if (c.polish) return;
          const at = (d: number, t: number) => `${f(-wAt(d) / 2 + t * wAt(d))},${f(sy * d)}`;
          out += `<path d="M${at(lugEnd, c.a)}L${at(lugEnd, c.b)}L${at(end, c.b)}L${at(end, c.a)}Z" fill="url(#${id}hv)"/>`;
        });
      } else if (g.centreSplit) {
        // A split centre is polished: brush the outer rows only.
        cols.forEach(c => {
          if (c.polish) return;
          const at = (d: number, t: number) => `${f(-wAt(d) / 2 + t * wAt(d))},${f(sy * d)}`;
          out += `<path d="M${at(lugEnd, c.a)}L${at(lugEnd, c.b)}L${at(end, c.b)}L${at(end, c.a)}Z" fill="url(#${id}h)"/>`;
        });
      } else out += `<path d="${band(sy, lugEnd, end)}" fill="url(#${id}h)"/>`;
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
      // Straight-ended end link, divided into the same five pieces as the rows, with the same finishes.
      const { edges, polish, rowFinish } = FIVE_ROWS[g.fiveRow];
      const e = lugEnd + .45, y0 = sy < 0 ? -e : start, h = e - start, W = g.lw - .3;
      edges.slice(0, -1).forEach((a, i) => {
        if (through && polish[i]) return;
        const x0 = -W / 2 + a * W + .09, x1 = -W / 2 + edges[i + 1] * W - .09;
        out += `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(h)}" rx=".25" fill="url(#${id}${polish[i] ? (rowFinish?.[i] === 'flat' ? 'ml' : rowFinish?.[i] === 'pill' ? 'mc' : 'p') : rowFinish?.[i] === 'satin' ? 'ms' : 'o'})"/>`;
      });
      if (through) {
        // Only the outer pieces end here; each takes the line and the brushing.
        const outer = edges.slice(0, -1).map((a, i) => [a, edges[i + 1], i] as const).filter(([, , i]) => !polish[i]);
        for (const [a, b] of outer) {
          const x0 = -W / 2 + a * W, x1 = -W / 2 + b * W;
          out += `<path d="M${f(x0)},${f(sy * e)}H${f(x1)}" stroke="${gap}" stroke-width=".22"/><rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(h)}" fill="url(#${id}hv)"/>`;
        }
        out += '</g>';
      } else out += `<path d="M${f(-W / 2)},${f(sy * e)}H${f(W / 2)}" stroke="${gap}" stroke-width=".22"/><path d="${band(sy, start, e)}" fill="url(#${id}h)"/></g>`;
      continue;
    }
    const xL = -g.lw / 2 + .15, e0 = lugEnd + .6, e1 = lugEnd + 1.6;
    const pieces = s.style === 'oyster' || s.style === 'president';
    const centre = s.style === 'oyster' ? (g.centreWidth ?? .4) : .4;
    const xa = -g.lw * centre / 2, xb = -xa;
    const endLink = pieces
      ? `M${f(xL)},${f(sy * start)}H${f(-xL)}V${f(sy * e0)}H${f(xb)}V${f(sy * (e1 - .5))}Q0,${f(sy * (e1 + .5))} ${f(xa)},${f(sy * (e1 - .5))}V${f(sy * e0)}H${f(xL)}Z`
      : `M${f(xL)},${f(sy * start)}H${f(-xL)}V${f(sy * e0)}Q0,${f(sy * (2 * e1 - e0))} ${f(xL)},${f(sy * e0)}Z`;
    out += `<path d="${endLink}" fill="url(#${id}${g.linkShade === 'flat' && s.style === 'oyster' ? 'f' : 'o'})" stroke="${gap}" stroke-width=".18"/><path d="${endLink}" fill="url(#${id}h)"/>`;
    if (pieces) out += `<path d="M${f(xa)},${f(sy * Math.min(start, lugEnd - 2.5))}V${f(sy * e0)}M${f(xb)},${f(sy * Math.min(start, lugEnd - 2.5))}V${f(sy * e0)}" stroke="${gap}" stroke-width=".16"/>`;
    out += `</g>`;
  }
  return out;
}
