import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { prefersReducedMotion, setHands } from '../lib/liveTime';
import { num } from '../lib/util';
import { parseWrist, UNIT_NAMES, WRIST_UNITS, wristRange, wristValue, type WristUnit } from '../lib/wrist';
import type { Watch } from '../store/types';
import { useStore } from '../store/useStore';

/** Renders an SVG string from the renderers. The strings escape all user text. */
export function Svg({ html, className, style }: { html: string; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const { liveTime } = useStore().state;
  // With live time, a freshly drawn watch shows the time before it's painted, not its reference pose.
  useLayoutEffect(() => { if (liveTime && ref.current) setHands(ref.current, new Date(), prefersReducedMotion()); }, [html, liveTime]);
  return <div ref={ref} className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Size difference from the reference watch, named in the tooltip and for screen readers. */
export function Delta({ v, r, of }: { v: number | null; r: number | null; of: string }) {
  if (v == null || r == null) return null;
  const d = +(v - r).toFixed(1);
  const vs = d ? `${Math.abs(d)} mm ${d > 0 ? 'bigger' : 'smaller'} than the ${of}` : `Same as the ${of}`;
  return (
    <span className={`d ${d > 0 ? 'plus' : d < 0 ? 'minus' : ''}`} title={vs}>
      <span aria-hidden="true">{!d ? 'same' : (d > 0 ? '+' : '') + d}</span><span className="sr">{vs}</span>
    </span>
  );
}

export const sizeOrQ = (v: unknown) => num(v) ?? '?';

/** Marks a watch owned or not, on its details. Owned watches appear on the Owned screen. */
export function OwnedButton({ w }: { w: Watch }) {
  const { setOwned } = useStore();
  const owned = !!w.owned;
  return (
    <button type="button" className={`act own ${owned ? 'on' : ''}`} aria-pressed={owned} aria-label={`I own the ${w.ref}`}
      title={owned ? 'Owned. Click if you no longer own it.' : 'Mark as owned'} onClick={() => setOwned(w.id, !owned)}>
      <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M5.8 4.1 6.3 1.2h3.4l.5 2.9M5.8 11.9l.5 2.9h3.4l.5-2.9" />
        <circle cx="8" cy="8" r="4.3" fill={owned ? 'currentColor' : 'none'} />
        {owned ? <path d="M6.1 8.1 7.4 9.4 10 6.8" stroke="var(--surface)" strokeWidth="1.5" strokeLinecap="round" /> : <path d="M8 5.6V8l1.5 1" strokeLinecap="round" />}
      </svg>
    </button>
  );
}

/**
 * Wrist circumference, typed in centimetres or inches. The size is always saved in centimetres; the unit only changes
 * how it's typed and shown, so switching never changes the drawings. The field keeps its own text while typing,
 * saves only sizes in range, says why anything else isn't used, and follows changes made elsewhere.
 */
export function WristSize({ id, label }: { id: string; label: string }) {
  const { state, update } = useStore();
  const cm = state.wrist.cm || 17, unit = state.wristUnit;
  const shown = (u: WristUnit) => String(wristValue(cm, u));
  const [text, setText] = useState(() => shown(unit));
  const parsed = parseWrist(text, unit), error = 'error' in parsed ? parsed.error : '';
  // Follow a size or unit set elsewhere, unless the text already means that size.
  useEffect(() => {
    setText(t => { const p = parseWrist(t, unit); return 'cm' in p && Math.abs(p.cm - cm) < 1e-9 ? t : shown(unit); });
  }, [cm, unit]);
  const { spin } = wristRange(unit);
  const setUnit = (u: WristUnit) => {
    // Switching shows the saved size in the new unit, discarding a half-typed or invalid entry.
    setText(shown(u));
    update(s => { s.wristUnit = u; });
  };
  return (
    <span className="wrist-size">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" min={spin.min} max={spin.max} step={spin.step} value={text}
        aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
        onChange={e => {
          setText(e.target.value);
          const p = parseWrist(e.target.value, unit);
          if ('cm' in p) update(s => { s.wrist.cm = p.cm; });
        }} />
      <span className="seg unit" role="group" aria-label="Wrist size unit">
        {WRIST_UNITS.map(u => <button key={u} type="button" aria-pressed={unit === u} aria-label={`${u} (${UNIT_NAMES[u].toLowerCase()})`} title={UNIT_NAMES[u]} onClick={() => setUnit(u)}>{u}</button>)}
      </span>
      {error && <span id={`${id}-error`} className="field-error" role="alert">{error}</span>}
    </span>
  );
}
