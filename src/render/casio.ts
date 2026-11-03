// Shared Casio drawing pieces: the CASIO logo, chrome push buttons and outline helpers used by the Casio digitals.

const f = (n: number) => +n.toFixed(3);

/** A straight segment to `to`, or a quadratic curve through control point `c`. */
export type Seg = { to: number[]; c?: number[] };

/** Traces a right-side outline from (0, y0) and back up its mirror image, closed. */
export function mirrored(segs: Seg[], y0: number, p: (pt: number[]) => string) {
  const cmd = (to: number[], c?: number[]) => (c ? `Q${p(c)} ${p(to)}` : `L${p(to)}`);
  let d = `M${p([0, y0])}` + segs.map(s => cmd(s.to, s.c)).join('');
  const flip = ([x, y]: number[]) => [-x, y];
  for (let i = segs.length - 1; i >= 0; i--) d += cmd(flip(i ? segs[i - 1].to : [0, y0]), segs[i].c && flip(segs[i].c!));
  return d + 'Z';
}

/** A rectangle with every corner rounded by r. */
export function rrect(x: number, y: number, w: number, h: number, r: number) {
  return `M${f(x + r)},${f(y)}H${f(x + w - r)}Q${f(x + w)},${f(y)} ${f(x + w)},${f(y + r)}V${f(y + h - r)}Q${f(x + w)},${f(y + h)} ${f(x + w - r)},${f(y + h)}H${f(x + r)}Q${f(x)},${f(y + h)} ${f(x)},${f(y + h - r)}V${f(y + r)}Q${f(x)},${f(y)} ${f(x + r)},${f(y)}Z`;
}

/** A chrome cylinder lit from above: a bright band, a dark reflection below it, and light again at the bottom. */
export const buttonGrad = (id: string) => `<linearGradient id="${id}_bt" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8d9297"/><stop offset=".2" stop-color="#f4f6f8"/><stop offset=".42" stop-color="#cfd3d7"/><stop offset=".66" stop-color="#5f6469"/><stop offset=".86" stop-color="#b8bdc2"/><stop offset="1" stop-color="#7c8186"/></linearGradient>`;

/**
 * Casio's logo, drawn rather than set in a font: wide, squared letters with tight rounded corners and a flat-topped A
 * whose crossbar sits low, 1.24 mm tall from −8.79 to −1.93, as measured on the A168's close-up. Another watch places
 * and sizes it with `transform`.
 */
export function casioLogo(fill: string, transform?: string) {
  const t = .28, yT = -9.97 + t / 2, yB = -8.73 - t / 2, yM = -9.35;
  const C = `M-7.34,${yT}H-8.27Q-8.65,${yT} -8.65,${f(yT + .38)}V${f(yB - .38)}Q-8.65,${yB} -8.27,${yB}H-7.34`;
  const S = `M-4.21,${yT}H-5.13Q-5.42,${yT} -5.42,${f(yT + .29)}V${f(yM - .29)}Q-5.42,${yM} -5.13,${yM}H-4.64Q-4.35,${yM} -4.35,${f(yM + .29)}V${f(yB - .29)}Q-4.35,${yB} -4.64,${yB}H-5.56`;
  const O = `M-2.95,${yT}H-2.47Q-2.07,${yT} -2.07,${f(yT + .4)}V${f(yB - .4)}Q-2.07,${yB} -2.47,${yB}H-2.95Q-3.35,${yB} -3.35,${f(yB - .4)}V${f(yT + .4)}Q-3.35,${yT} -2.95,${yT}Z`;
  // The A: a flat-topped outline with its counter and the gap under the crossbar cut out.
  const A = 'M-7.18,-8.73L-6.6,-9.97H-6.18L-5.6,-8.73H-5.92L-6.03,-8.97H-6.75L-6.86,-8.73ZM-6.64,-9.2H-6.14L-6.39,-9.68Z';
  return `<g data-logo="CASIO"${transform ? ` transform="${transform}"` : ''}><g fill="none" stroke="${fill}" stroke-width="${t}"><path d="${C}"/><path d="${S}"/><path d="${O}"/></g><path d="${A}" fill="${fill}" fill-rule="evenodd"/><path d="M-4.01,-9.97H-3.74V-8.73H-4.01Z" fill="${fill}"/></g>`;
}
