// All geometry is in millimetres, centred on 0,0, with 0° at 12 o'clock going clockwise.

export function superellipse(a: number, b: number, n: number, steps = 96) {
  let d = '';
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    const x = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), y = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    d += (i ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2);
  }
  return d + 'Z';
}

/** Polar to cartesian: radius r at clock angle deg. */
export const P = (r: number, deg: number): [number, number] => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
};

export function arc(r: number, a0: number, a1: number) {
  const [x0, y0] = P(r, a0), [x1, y1] = P(r, a1);
  return `M${x0},${y0}A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
}

export function ringSeg(ro: number, ri: number, a0: number, a1: number) {
  const [x0, y0] = P(ro, a0), [x1, y1] = P(ro, a1), [x2, y2] = P(ri, a1), [x3, y3] = P(ri, a0);
  const lg = a1 - a0 > 180 ? 1 : 0;
  return `M${x0},${y0}A${ro},${ro} 0 ${lg} 1 ${x1},${y1}L${x2},${y2}A${ri},${ri} 0 ${lg} 0 ${x3},${y3}Z`;
}
