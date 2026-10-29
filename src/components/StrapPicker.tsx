import { BRACELET_STYLES, RUBBER_STYLES } from '../catalog/constants';
import type { Strap } from '../catalog/schema';
import { BRACELET_NAMES, RUBBER_NAMES, STRAP_PRESETS } from '../catalog/straps';
import { strapLabel } from '../render/strap';
import type { Watch } from '../store/types';
import { useStore } from '../store/useStore';

type Kind = Strap['type'];
const KINDS: [Exclude<Kind, 'nylon'>, string][] = [['bracelet', 'Bracelet'], ['nato', 'NATO'], ['rubber', 'Rubber'], ['leather', 'Leather']];

const same = (a?: Strap, b?: Strap) => !!a && !!b && JSON.stringify(a) === JSON.stringify(b);

const rubberName = (style: (typeof RUBBER_STYLES)[number], color: string) => {
  const p = STRAP_PRESETS.rubber.find(x => x.color === color);
  return `${RUBBER_NAMES[style]} rubber${p ? ', ' + p.name.toLowerCase() : ''}`;
};
const leatherName = (n: string) => (/suede|leather/i.test(n) ? n : n + ' leather');

/** The first strap of each kind, used when the user switches kind. Without a watch there's no bracelet of its own to start from. */
function defaultOf(kind: Kind, w?: Watch): Strap {
  switch (kind) {
    case 'bracelet': return w?.strap?.type === 'bracelet' ? w.strap : { type: 'bracelet', style: 'oyster', centre: 'polished' };
    case 'nato': { const p = STRAP_PRESETS.nato[0]; return { type: 'nato', colors: p.colors, name: 'NATO, ' + p.name }; }
    case 'rubber': { const c = STRAP_PRESETS.rubber[0].color; return { type: 'rubber', style: 'smooth', color: c, name: rubberName('smooth', c) }; }
    case 'leather': { const p = STRAP_PRESETS.leather[0]; return { type: 'leather', color: p.color, stitch: p.stitch, name: leatherName(p.name) }; }
    case 'nylon': return { type: 'nylon', color: '#6B5640' };
  }
}

/** Lets the user see a watch on what it's sold on, the maker's other options, or a strap of their own choosing. */
export function StrapPicker({ w, compact }: { w: Watch; compact?: boolean }) {
  const { update } = useStore();
  const set = (s: Strap | undefined) => update(st => {
    const e = st.shortlist.find(x => x.watchId === w.id);
    if (!e) return;
    if (!s || same(s, w.strap)) delete e.wornStrap; else e.wornStrap = s;
  });
  const worn = w.wornStrap;
  const official = [...(w.strap ? [w.strap] : []), ...(w.strapOptions ?? [])];
  const officialIdx = worn ? official.findIndex(o => same(o, worn)) : w.strap ? 0 : -1;
  const custom = worn && officialIdx < 0 ? worn : undefined;

  return (
    <div className={`strap-picker ${compact ? 'compact' : ''}`}>
      <div className="sp-row" role="group" aria-label="Strap">
        {official.map((o, i) => (
          <button key={i} type="button" className="chip" aria-pressed={!custom && officialIdx === i} onClick={() => set(i === 0 && w.strap ? undefined : o)}>
            {i === 0 && w.strap ? 'As sold: ' : 'Option: '}{strapLabel(o)}
          </button>
        ))}
        {KINDS.map(([k, label]) => (
          <button key={k} type="button" className="chip" aria-pressed={custom?.type === k} onClick={() => set(custom?.type === k ? custom : defaultOf(k, w))}>{label}</button>
        ))}
      </div>
      {custom && <Options s={custom} set={set} />}
    </div>
  );
}

/**
 * One strap for every watch in Compare. Uses the same kinds and presets as the per-watch picker, but never a maker's
 * fitted strap, which only suits the watch it was made for. Each watch still draws it at its own lug width.
 */
export function CompareStrapPicker({ value, set }: { value: Strap | 'sold' | undefined; set: (s: Strap | 'sold' | undefined) => void }) {
  const custom = typeof value === 'object' ? value : undefined;
  return (
    <div className="strap-picker compact">
      <div className="sp-row" role="group" aria-label="Strap for every watch">
        <span className="sp-label">Show all on</span>
        <button type="button" className="chip" aria-pressed={!value} onClick={() => set(undefined)}>Their own straps</button>
        <button type="button" className="chip" aria-pressed={value === 'sold'} onClick={() => set('sold')}>As sold</button>
        {KINDS.map(([k, label]) => (
          <button key={k} type="button" className="chip" aria-pressed={custom?.type === k} onClick={() => set(custom?.type === k ? custom : defaultOf(k))}>{label}</button>
        ))}
      </div>
      {custom && <Options s={custom} set={set} />}
    </div>
  );
}

function Options({ s, set }: { s: Strap; set: (s: Strap) => void }) {
  if (s.type === 'bracelet') return (
    <div className="sp-row">
      {BRACELET_STYLES.map(style => <button key={style} type="button" className="chip small" aria-pressed={s.style === style} onClick={() => set({ ...s, style })}>{BRACELET_NAMES[style]}</button>)}
      {(s.style === 'oyster' || s.style === 'president') && (
        <label className="sp-check"><input type="checkbox" checked={s.centre === 'polished'} onChange={e => set({ ...s, centre: e.target.checked ? 'polished' : 'brushed' })} /> Polished centre links</label>
      )}
    </div>
  );
  if (s.type === 'nato') return (
    <div className="sp-row">
      {STRAP_PRESETS.nato.map(p => (
        <button key={p.name} type="button" className="swatch" title={p.name} aria-label={p.name} aria-pressed={same({ type: 'nato', colors: p.colors, name: 'NATO, ' + p.name }, s)}
          style={{ background: `linear-gradient(90deg, ${p.colors.map((c, i) => `${c} ${(i / p.colors.length) * 100}% ${((i + 1) / p.colors.length) * 100}%`).join(', ')})` }}
          onClick={() => set({ type: 'nato', colors: p.colors, name: 'NATO, ' + p.name })} />
      ))}
    </div>
  );
  if (s.type === 'rubber') return (
    <div className="sp-row">
      {RUBBER_STYLES.map(style => <button key={style} type="button" className="chip small" aria-pressed={s.style === style} onClick={() => set({ ...s, style, name: rubberName(style, s.color) })}>{RUBBER_NAMES[style]}</button>)}
      <span className="sp-gap" />
      {STRAP_PRESETS.rubber.map(p => (
        <button key={p.name} type="button" className="swatch" title={p.name} aria-label={p.name} aria-pressed={s.color === p.color} style={{ background: p.color }}
          onClick={() => set({ ...s, color: p.color, name: rubberName(s.style, p.color) })} />
      ))}
    </div>
  );
  if (s.type === 'leather') return (
    <div className="sp-row">
      {STRAP_PRESETS.leather.map(p => (
        <button key={p.name} type="button" className="swatch" title={p.name} aria-label={p.name} aria-pressed={s.color === p.color} style={{ background: p.color }}
          onClick={() => set({ type: 'leather', color: p.color, stitch: p.stitch, name: leatherName(p.name) })} />
      ))}
    </div>
  );
  return null;
}
