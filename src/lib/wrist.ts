// Wrist circumference in the visitor's unit. The wrist is always stored in centimetres (`state.wrist.cm`); inches are
// only how it's typed and shown, so switching units never changes the stored size or the drawing's scale.

export const WRIST_UNITS = ['cm', 'in'] as const;
export type WristUnit = (typeof WRIST_UNITS)[number];
export const isWristUnit = (u: unknown): u is WristUnit => u === 'cm' || u === 'in';
export const UNIT_NAMES: Record<WristUnit, string> = { cm: 'Centimetres', in: 'Inches' };

export const CM_PER_INCH = 2.54;
/** Wrist sizes the drawings support, in centimetres. */
export const WRIST_MIN_CM = 13, WRIST_MAX_CM = 23;

const round = (v: number, places: number) => +v.toFixed(places);

/** The wrist size in a unit, rounded for display: 17 → 17 cm or 6.69 in; 17.78 → 7 in. */
export const wristValue = (cm: number, unit: WristUnit) => (unit === 'in' ? round(cm / CM_PER_INCH, 2) : round(cm, 2));

/** "17 cm" or "6.69 in". */
export const formatWrist = (cm: number, unit: WristUnit) => `${wristValue(cm, unit)} ${unit}`;

/**
 * The supported range in a unit, rounded inwards so both ends are themselves valid: 13–23 cm, 5.12–9.05 in. Then the
 * input's spinner: half centimetres, or quarter inches from 5.25 to 9, so the arrows land on 7, 6.75 and so on.
 * Typed values only need to be in range.
 */
export function wristRange(unit: WristUnit) {
  if (unit === 'cm') return { min: WRIST_MIN_CM, max: WRIST_MAX_CM, spin: { min: WRIST_MIN_CM, max: WRIST_MAX_CM, step: .5 } };
  const min = Math.ceil(WRIST_MIN_CM / CM_PER_INCH * 100) / 100, max = Math.floor(WRIST_MAX_CM / CM_PER_INCH * 100) / 100;
  return { min, max, spin: { min: Math.ceil(min * 4) / 4, max: Math.floor(max * 4) / 4, step: .25 } };
}

/** What a typed value means: the size in centimetres, or why it can't be used. */
export function parseWrist(text: string, unit: WristUnit): { cm: number } | { error: string } {
  const { min, max } = wristRange(unit);
  const range = `Enter a size between ${min} and ${max} ${unit}.`;
  const t = text.trim();
  if (!/^\d*\.?\d+$|^\d+\.$/.test(t)) return { error: t ? range : `Enter your wrist size in ${unit === 'cm' ? 'centimetres' : 'inches'}.` };
  const cm = unit === 'in' ? +t * CM_PER_INCH : +t;
  // A hair of tolerance so a boundary typed in either unit is accepted.
  if (cm < WRIST_MIN_CM - 1e-9 || cm > WRIST_MAX_CM + 1e-9) return { error: range };
  return { cm };
}
