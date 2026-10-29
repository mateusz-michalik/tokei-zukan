/**
 * What each hand shows, so live time can turn it. Renderers draw hands at their posed reference time and tag every
 * hand's rotating element (and its shadow) with its role; live time then only rewrites the final rotate() of tagged
 * elements, so the drawing itself never changes.
 *
 * - hour, minute, second: the central time hands.
 * - small-seconds: running seconds in a subdial.
 * - hour24: one turn a day, like a GMT hand or a 24-hour subdial. Live time shows local time; there's no second zone.
 * - chrono: chronograph hands and counters, which rest at zero while the chronograph isn't running.
 */
export const HAND_ROLES = ['hour', 'minute', 'second', 'small-seconds', 'hour24', 'chrono'] as const;
export type HandRole = (typeof HAND_ROLES)[number];

/**
 * Tags a hand. Put it right before the element's `transform`, which must end in rotate(angle) about the hand's pivot:
 * `rotate(a)` for the centre, `translate(x y) rotate(a)` for a subdial.
 */
export const handRole = (role: HandRole) => `data-hand="${role}" `;

/**
 * A hand's angle in degrees clockwise from 12 at a moment. `beats` is how many steps the seconds hand takes each
 * second: 1 for a ticking quartz, 6 for a 21,600 vph automatic, 8 for 28,800 vph. Angles come straight from the
 * clock, so nothing accumulates drift.
 */
export function handAngle(role: HandRole, at: Date, beats = 1) {
  const h = at.getHours(), m = at.getMinutes();
  const s = at.getSeconds() + Math.floor((at.getMilliseconds() / 1000) * beats) / beats;
  switch (role) {
    case 'hour': return ((h % 12) + m / 60 + s / 3600) * 30;
    case 'minute': return (m + s / 60) * 6;
    case 'second': case 'small-seconds': return s * 6;
    case 'hour24': return (h + m / 60 + s / 3600) * 15;
    case 'chrono': return 0;
  }
}

/** Turns one hand: replaces the rotate() that ends its transform. */
export const turnTransform = (transform: string, angle: number) => transform.replace(/rotate\([^)]*\)\s*$/, `rotate(${+angle.toFixed(3)})`);
