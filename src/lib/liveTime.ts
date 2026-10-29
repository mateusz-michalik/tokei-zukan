import { handAngle, turnTransform, type HandRole } from '../render/hands';

// Each hand's drawn transform, so live time can always be undone, and the angle last shown, to skip unchanged hands.
const posed = new WeakMap<Element, string>();
const shown = new WeakMap<Element, number>();

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Sets every tagged hand inside `root` to the moment `at`, so all watches on the page share one clock reading.
 * `still` rests seconds hands at 12 for reduced motion, where hands only move once a minute.
 */
export function setHands(root: ParentNode, at: Date, still = false) {
  for (const el of root.querySelectorAll<SVGElement>('[data-hand]')) {
    const role = el.dataset.hand as HandRole;
    if (!posed.has(el)) posed.set(el, el.getAttribute('transform') ?? '');
    const angle = still && (role === 'second' || role === 'small-seconds') ? 0 : handAngle(role, at, Number(el.dataset.beats) || 1);
    if (shown.get(el) === angle) continue;
    shown.set(el, angle);
    el.setAttribute('transform', turnTransform(posed.get(el)!, angle));
  }
}

/** Puts every hand back at its drawn reference time. */
function restoreHands(root: ParentNode) {
  for (const el of root.querySelectorAll('[data-hand]')) {
    const pose = posed.get(el);
    if (pose === undefined) continue;
    el.setAttribute('transform', pose);
    shown.delete(el);
  }
}

/**
 * Runs live time for the whole page until the returned stop function is called. Every frame re-reads the clock, so
 * a background tab or a clock change can't leave the hands behind; browsers pause the loop while the tab is hidden.
 * With reduced motion it wakes once a minute instead.
 */
export function startLiveTime() {
  let frame = 0, timer = 0;
  const tick = () => {
    const now = new Date();
    if (prefersReducedMotion()) {
      setHands(document, now, true);
      timer = window.setTimeout(tick, 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()));
    } else {
      setHands(document, now);
      frame = requestAnimationFrame(tick);
    }
  };
  tick();
  return () => { cancelAnimationFrame(frame); clearTimeout(timer); restoreHands(document); };
}
