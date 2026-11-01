// Numerals drawn as strokes rather than set in a font, for dials and bezels whose figures a system font can't match:
// rounded digits with round ends, and a 1 that's a plain vertical bar. Drawn for Hamilton's field numerals
// (h69439931.ts); the Speedmaster's tachymeter and subdial figures use them narrowed (omega31030425001001.ts).

const f = (n: number) => +n.toFixed(3);

/**
 * Each digit's stroke centreline in a box 1 tall (coordinate pairs only, so it can be placed by a simple transform),
 * and the digit's width.
 */
const DIGITS: Record<string, [string, number]> = {
  '0': ['M.29,0C.08,0 .02,.24 .02,.5C.02,.76 .08,1 .29,1C.5,1 .56,.76 .56,.5C.56,.24 .5,0 .29,0Z', .58],
  '1': ['M.05,0L.05,1', .1],
  '2': ['M.04,.22C.06,.04 .2,0 .3,0C.46,0 .55,.11 .55,.26C.55,.45 .32,.62 .04,1L.57,1', .6],
  '3': ['M.05,.13C.13,.03 .22,0 .31,0C.46,0 .55,.1 .55,.24C.55,.39 .42,.47 .26,.47C.45,.47 .58,.57 .58,.74C.58,.9 .46,1 .3,1C.18,1 .08,.95 .02,.86', .6],
  '4': ['M.45,1L.45,0L.02,.69L.62,.69', .64],
  '5': ['M.54,0L.12,0L.07,.45C.15,.39 .24,.37 .32,.37C.47,.37 .58,.49 .58,.68C.58,.88 .45,1 .29,1C.17,1 .08,.95 .02,.87', .6],
  '6': ['M.5,.07C.43,.02 .37,0 .31,0C.13,0 .04,.22 .04,.55C.04,.86 .15,1 .31,1C.47,1 .57,.88 .57,.69C.57,.5 .46,.39 .31,.39C.17,.39 .07,.48 .04,.6', .6],
  '7': ['M.02,0L.58,0L.2,1', .6],
  '8': ['M.3,.46C.15,.46 .07,.36 .07,.23C.07,.09 .17,0 .3,0C.43,0 .53,.09 .53,.23C.53,.36 .45,.46 .3,.46C.14,.46 .03,.57 .03,.73C.03,.9 .15,1 .3,1C.45,1 .57,.9 .57,.73C.57,.57 .46,.46 .3,.46Z', .6],
  '9': ['M.1,.93C.17,.98 .23,1 .29,1C.47,1 .56,.78 .56,.45C.56,.14 .45,0 .29,0C.13,0 .03,.12 .03,.31C.03,.5 .14,.61 .29,.61C.43,.61 .53,.52 .56,.4', .6],
};

/**
 * The centrelines of a number h mm tall, centred on (cx, cy), as path data for one stroked path. `narrow` scales the
 * digits' widths (1 is Hamilton's proportions), and `gap` is the space between digits as a fraction of h.
 */
export function strokeDigits(text: string, cx: number, cy: number, h: number, narrow = 1, gap = .16) {
  const width = [...text].reduce((w, c) => w + DIGITS[c][1] * narrow, 0) + gap * (text.length - 1);
  let d = '', x = -width / 2;
  for (const c of text) {
    const [path, w] = DIGITS[c], ox = x;
    d += path.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_, px: string, py: string) => `${f(cx + (+px * narrow + ox) * h)},${f(cy + (+py - .5) * h)}`);
    x += w * narrow + gap;
  }
  return d;
}

/** A number as its own stroked path, sw mm wide; the stroke colour comes from the enclosing group. */
export const strokeNumber = (text: string, cx: number, cy: number, h: number, sw: number) =>
  `<path d="${strokeDigits(text, cx, cy, h)}" stroke-width="${sw}"/>`;
