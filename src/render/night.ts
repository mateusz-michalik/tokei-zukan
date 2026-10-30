import type { LUME_PARTS } from '../catalog/constants';
import type { Night } from '../catalog/schema';

export type LumePart = (typeof LUME_PARTS)[number];
/** How the watches are lit: daylight as drawn, dusk with the lume just showing, or full dark. */
export type Lighting = 'day' | 'dusk' | 'night';
export const LIGHTINGS: [Lighting, string][] = [['day', 'Day'], ['dusk', 'Dusk'], ['night', 'Night']];
export const isLighting = (l: unknown): l is Lighting => LIGHTINGS.some(([v]) => v === l);

/**
 * Marks an element as painted with lume, so the night pass can find it. Renderers add it to the element (or group)
 * whose fill is the lume, naming the part: hands, indices (dial markers and lumed numerals), bezel, seconds or subdials.
 */
export const lu = (part: LumePart) => ` data-lume="${part}"`;

const HEX = /#([0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-z_-])/gi;
const rgb = (hex: string) => {
  const h = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, c => c + c) : hex;
  return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
};
const toHex = (c: number[]) => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

/** How much light each level keeps, the dark blue it settles towards, and how strongly lume shows. */
const LEVELS = {
  dusk: { keep: .58, base: [5, 7, 14], lume: .6, halo: .45, blur: .25 },
  night: { keep: .26, base: [7, 10, 18], lume: 1, halo: .85, blur: .35 },
};

/** Dims every colour in an SVG fragment: part of its light over a dark blue, so contrast survives without inverting. */
export const dimColours = (svg: string, level: Exclude<Lighting, 'day'> = 'night') => {
  const { keep, base } = LEVELS[level];
  return svg.replace(HEX, hex => toHex(rgb(hex).map((c, i) => c * keep + base[i])));
};

let glows = 0;

/**
 * The watch at dusk or night: every surface dimmed, and only the documented lume glowing in its emitted colour (at
 * dusk, part-way between that and the dimmed paint). Elements tagged with a part the watch has no lume on stay dim,
 * so daytime paint never glows by accident.
 */
export function nightify(svg: string, night?: Night, level: Exclude<Lighting, 'day'> = 'night') {
  const s = dimColours(svg, level);
  if (!night) return s;
  const { lume, halo, blur } = LEVELS[level];
  const id = `lume${++glows}`;
  let lit = false;
  const glowing = s.replace(/<(\w+)([^>]*?) data-lume="(\w+)"([^>]*?)(\/?)>/g, (tag, name: string, before: string, part: LumePart, after: string, close: string) => {
    if (!night.parts.includes(part)) return tag;
    const glow = night.partGlow?.[part] ?? night.glow;
    if (!glow) return tag;
    let attrs = before + after;
    const paint = (old: string) => (lume === 1 || !old.startsWith('#') ? glow : toHex(rgb(glow).map((c, i) => c * lume + rgb(old)[i] * (1 - lume))));
    // Paint the lume itself: its fill, or its stroke when it's drawn as a line.
    if (/\sfill="(?!none")[^"]*"/.test(attrs)) attrs = attrs.replace(/\sfill="([^"]*)"/, (_, old: string) => ` fill="${paint(old)}"`);
    else if (/\sstroke="(?!none")[^"]*"/.test(attrs)) attrs = attrs.replace(/\sstroke="([^"]*)"/, (_, old: string) => ` stroke="${paint(old)}"`);
    else attrs += ` fill="${glow}"`;
    lit = true;
    return `<${name}${attrs} data-lume="${part}" filter="url(#${id})"${close}>`;
  });
  if (!lit) return s;
  // A soft halo just around each lumed shape; the region is generous so thin hands aren't clipped.
  return `<defs><filter id="${id}" x="-2" y="-2" width="5" height="5" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${blur}" result="b"/><feComponentTransfer in="b" result="halo"><feFuncA type="linear" slope="${halo}"/></feComponentTransfer><feMerge><feMergeNode in="halo"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` + glowing;
}
