import { handAngle, turnTransform, type HandRole } from '../render/hands';
import { GHOST, GLYPHS, lcdChars } from '../render/lcd';

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

// The characters each LCD cell last showed, to skip unchanged cells.
const cellShown = new WeakMap<Element, string>();

/**
 * Sets every digital display inside `root` to the moment `at` (or, with none, back to the sample moment it was drawn
 * at), switching segments between lit and ghosted. Each display keeps its own 12- or 24-hour format.
 */
export function setDisplays(root: ParentNode, at?: Date) {
  for (const display of root.querySelectorAll<SVGElement>('[data-lcd-display]')) {
    const format = display.dataset.lcdDisplay === '24h' ? '24h' : '12h';
    const chars = lcdChars(at ?? new Date(Number(display.dataset.lcdSample)), format);
    for (const cell of display.querySelectorAll<SVGElement>('[data-lcd]')) {
      const ch = chars[cell.dataset.lcd!] ?? '';
      if (cellShown.get(cell) === ch) continue;
      cellShown.set(cell, ch);
      const lit = ch === 'on' ? 'on' : GLYPHS[ch] ?? '';
      for (const seg of cell.querySelectorAll<SVGElement>('[data-seg]')) seg.setAttribute('fill-opacity', String(lit.includes(seg.dataset.seg!) ? 1 : GHOST));
    }
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
 * Digital displays read the same clock, so their digits change on the second boundary. With reduced motion it wakes
 * once a minute instead, when a display's seconds read 00.
 */
export function startLiveTime() {
  let frame = 0, timer = 0;
  const tick = () => {
    const now = new Date();
    if (prefersReducedMotion()) {
      setHands(document, now, true);
      setDisplays(document, now);
      timer = window.setTimeout(tick, 60_000 - (now.getSeconds() * 1000 + now.getMilliseconds()));
    } else {
      setHands(document, now);
      setDisplays(document, now);
      frame = requestAnimationFrame(tick);
    }
  };
  tick();
  return () => { cancelAnimationFrame(frame); clearTimeout(timer); restoreHands(document); setDisplays(document); };
}
