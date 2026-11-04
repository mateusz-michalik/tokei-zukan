// Shared case proportions and finishing details. Model-specific case outlines live in their own modules (spb317.ts, spb151.ts, ssc947.ts, spb451.ts, spb519.ts, srpk01.ts, spb253.ts, spb255.ts, ssk003.ts, spb507.ts, srpb43.ts, f91w.ts, h69439931.ts, omega31030425001001.ts, rolex1240600001.ts, m7939a1a0nu0001.ts, nj015056l.ts).
import { shade } from '../lib/util';

/** Bezel radius (to the outside of the knurled edge) as a fraction of half the case width. */
export const WILLARD_BEZEL = { 'willard-modern': .951 } as const;

/**
 * The bezel's soft shadow on the case, falling below and to the right of it as the light comes from the upper left.
 * `r` is about 0.1 mm outside the bezel's edge, in the case's millimetres. Draw it last inside the case's clip path,
 * before the bezel, so the bezel covers its inner half and the clip keeps it off the strap.
 */
export const bezelShadow = (r: number) =>
  `<circle r="${+r.toFixed(3)}" fill="none" stroke="#000" stroke-width="1.1" opacity=".16" transform="translate(.12 .2)"/>`;

const f = (n: number) => +n.toFixed(3);

/**
 * Brushed lug tops lit from above, at the Black Bay 58's strength: light at each lug tip, turning to shade towards the
 * case, then fading out so it leaves no edge where the case flank stands outside the bezel. Overlays for inside the
 * case's clip path, after its brushing and before its edge strokes; the bezel covers the middle. `strength` scales
 * it down for a matte finish.
 */
export function lugTopLight(id: string, D: number, LL: number, strength = 1) {
  const a = (o: number) => f(o * strength);
  const H = LL / 2, x1 = D / 2 + 4, y1 = H * .45;
  let defs = '', rects = '';
  for (const v of [-1, 1]) {
    const g = `${id}lt${v < 0 ? 't' : 'b'}`;
    defs += `<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(v * H)}" x2="0" y2="${f(v * y1)}"><stop stop-color="#fff" stop-opacity="${a(.26)}"/><stop offset=".25" stop-color="#fff" stop-opacity="${a(.02)}"/><stop offset=".6" stop-color="#000" stop-opacity="${a(.14)}"/><stop offset=".8" stop-color="#000" stop-opacity="${a(.14)}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`;
    // Full width: the strap opening between the lugs is outside the case anyway, and where the case shows there
    // (round a bezel smaller than the case) it is lit the same, without a seam.
    rects += `<rect x="${f(-x1)}" y="${f(v < 0 ? -H : y1)}" width="${f(2 * x1)}" height="${f(H - y1)}" fill="url(#${g})"/>`;
  }
  return `<defs>${defs}</defs>${rects}`;
}

/**
 * A polished bevel down the case's outer flanks: a light crease where it meets the brushed top, the polished band
 * (bright with a dark reflection) and a crisp dark edge. `flanks` is a path of just the outer flanks, tip to tip, in
 * the case's millimetres; draw it inside the case's clip path, after the edge strokes. A black case keeps to its own
 * dark tones with a fainter crease, so it reads as coated metal rather than steel.
 */
export function flankBevel(id: string, flanks: string, metal: string, black = false) {
  const stops = black
    ? [[0, .42], [.35, .2], [.55, -.35], [.72, .26], [1, -.1]]
    : [[0, 0], [.35, .3], [.55, -.38], [.72, .4], [1, -.1]];
  const g = `${id}fb`;
  return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1">${stops.map(([o, a]) => `<stop offset="${o}" stop-color="${!black && o === 0 ? '#fbfbf9' : shade(metal, a)}"/>`).join('')}</linearGradient></defs>`
    + `<path d="${flanks}" fill="none" stroke="#fff" stroke-width="1.7" opacity="${black ? '.22' : '.6'}"/><path d="${flanks}" fill="none" stroke="url(#${g})" stroke-width="1.5"/><path d="${flanks}" fill="none" stroke="${shade(metal, black ? -.6 : -.5)}" stroke-width=".22"/>`;
}
