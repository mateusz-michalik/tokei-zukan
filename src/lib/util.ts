export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const num = (v: unknown): number | null => {
  const n = parseFloat(v as string);
  return isFinite(n) ? n : null;
};


/**
 * What a watch's two case sizes are called. A rectangular case (`caseShape`) has a width and an overall length rather
 * than a diameter and a lug-to-lug; the values are stored in the same fields.
 */
export const sizeNames = (w: { caseShape?: string }) =>
  w.caseShape === 'rectangular' ? { across: 'Width', long: 'Length' } : { across: 'Diameter', long: 'Lug to lug' };

/** Lug to lug, or an estimate from the diameter when the spec is missing. */
export const l2l = (w: { lugToLug?: number | null; diameter?: number | null }) =>
  num(w.lugToLug) ?? +((num(w.diameter) ?? 0) * 1.17 || 46).toFixed(1);

/** Lighten (amt > 0) or darken (amt < 0) a hex colour. */
export function shade(hex: string, amt: number) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (x: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? x * (1 + amt) : x + (255 - x) * amt)));
  return '#' + [f(r), f(g), f(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
