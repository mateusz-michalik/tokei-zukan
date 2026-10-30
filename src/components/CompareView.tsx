import type { ReactNode } from 'react';
import { fmtShown, shownPrice } from '../lib/price';
import { l2l, num, sizeNames } from '../lib/util';
import { strapLabel } from '../render/strap';
import { watchGroup, watchSVG, resolveStrap } from '../render/watch';
import type { CompareMode, Watch } from '../store/types';
import { useStore } from '../store/useStore';
import { Delta, sizeOrQ, Svg } from './common';
import { CompareStrapPicker } from './StrapPicker';

const PALETTE = ['#151515', '#B4432B', '#3E6B4A', '#2F4E7A', '#8A6A2A', '#6A4A7A', '#2A7A80', '#77756F'];
// The same hues lightened so outlines stay clear on the dark panel.
const NIGHT_PALETTE = ['#E7E6E1', '#E07A5F', '#7FB08C', '#8FA8D0', '#D7B56A', '#B79BD0', '#6CC0C8', '#A3A19A'];

export function CompareView() {
  const { state, watches, byId, refWatch: R, dark, update } = useStore();
  const palette = dark ? NIGHT_PALETTE : PALETTE;
  const { lighting } = state;
  const ws = state.compare.map(byId).filter((w): w is Watch => !!w);
  if (!ws.length) return <p className="empty">Tick the box next to two or more watches in the list to compare them here.</p>;
  const px = 6.2;
  const mode = state.cmpMode;
  // What each watch is drawn on here: the shared strap, what it's sold on, or its own choice from its details page.
  const shared = state.cmpStrap;
  const shownOn = (w: Watch) => (typeof shared === 'object' ? shared : resolveStrap(shared === 'sold' ? { ...w, wornStrap: undefined } : w));

  let stage: ReactNode;
  if (mode === 'renders') {
    stage = <>
      <div className="stage-row">{ws.map(w => (
        <div className="stage-item" key={w.id}>
          <Svg html={watchSVG(w, px, { strapLen: 6, strap: shownOn(w), lighting })} />
          <div className="lbl">{w.ref}</div>
          <div className="lbl2">{sizeOrQ(w.diameter)} × {sizeOrQ(w.lugToLug)} × {sizeOrQ(w.thickness)} mm</div>
        </div>
      ))}</div>
      <div className="scalebar">All drawn at the same scale. 10 mm = {Math.round(10 * px)} px on screen.</div>
    </>;
  } else {
    const maxD = Math.max(...ws.map(w => num(w.diameter) || 40)) + 10, maxL = Math.max(...ws.map(l2l)) + 6, p = 9;
    const svg = `<svg viewBox="${-maxD / 2} ${-maxL / 2} ${maxD} ${maxL}" width="${maxD * p}" height="${maxL * p}" style="max-width:100%;height:auto">${ws.map((w, i) => watchGroup(w, { outline: true, color: palette[i % 8], sw: .4 }).g).join('')}</svg>`;
    stage = <>
      <Svg style={{ textAlign: 'center' }} html={svg} />
      <div className="legend">{ws.map((w, i) => <span key={w.id}><i style={{ background: palette[i % 8] }} />{w.ref} {num(w.lugToLug) ? '' : '(lug to lug estimated)'}</span>)}</div>
      <div className="scalebar">Case outlines stacked on top of each other. Dashed line is the crystal.</div>
    </>;
  }

  // Rectangular cases have a width and length; with round ones alongside, the rows name both.
  const shapes = new Set(ws.map(w => sizeNames(w).across));
  const names = shapes.size > 1 ? { across: 'Diameter / width', long: 'Lug to lug / length' } : sizeNames(ws[0] ?? {});
  const sz = (w: Watch, k: 'diameter' | 'lugToLug' | 'thickness') => {
    const v = num(w[k]);
    if (v == null) return <span className="est">not confirmed</span>;
    return <>{v} mm{R && R.id !== w.id && <Delta v={v} r={num(R[k])} of={R.ref} />}</>;
  };
  const br = (t?: string) => (t || '').split('\n').flatMap((x, i) => (i ? [<br key={i} />, x] : [x]));
  const rows: [string, (w: Watch) => ReactNode][] = [
    ['Price', w => { const p = shownPrice(w, state.currency); return p ? fmtShown(p) : 'No verified price'; }],
    ['Price source', w => shownPrice(w, state.currency)?.label ?? ''],
    [names.across, w => sz(w, 'diameter')], [names.long, w => sz(w, 'lugToLug')], ['Thickness', w => sz(w, 'thickness')],
    ['Lug width', w => (w.lugWidth ? w.lugWidth + ' mm' : '—')], ['Sold on', w => (w.strap ? strapLabel(w.strap) : '—')],
    ['Shown on', w => strapLabel(shownOn(w))], ['Crystal', w => w.crystal], ['Bezel', w => w.bezel], ['Movement', w => w.movement],
    [ws.some(w => w.display === 'digital') ? 'Power' : 'Power reserve', w => w.power || '—'], ['Water', w => (w.water ? w.water + ' m' : w.waterNote || '—')], ['Limited', w => w.limited || '—'],
  ];
  if (ws.some(w => w.pros)) rows.push(['Good', w => br(w.pros)]);
  if (ws.some(w => w.cons)) rows.push(['Watch out for', w => br(w.cons)]);
  const modes: [CompareMode, string][] = [['renders', 'Side by side'], ['outlines', 'Outlines stacked']];

  return <>
    <div className="cmp-head">
      <div className="seg" role="group" aria-label="Comparison view">
        {modes.map(([m, label]) => <button key={m} aria-pressed={mode === m} onClick={() => update(s => { s.cmpMode = m; })}>{label}</button>)}
      </div>
    </div>
    {/* Outlines are drawn without straps, so the picker waits for Side by side; the choice is kept meanwhile. */}
    {mode === 'renders' && <CompareStrapPicker value={shared} set={v => update(s => { s.cmpStrap = v; })} />}
    <div className={`stage ${mode === 'renders' && lighting !== 'day' ? 'after-dark' : ''}`}>{stage}</div>
    {/* Sits on the table because that's where the size differences are. */}
    <div className="cmp-ref">
      <label>Compare sizes against{' '}
        <select className="btn" value={R?.id ?? ''} onChange={e => { const v = e.target.value; update(s => { s.referenceId = v; }); }}>
          {watches.map(w => <option key={w.id} value={w.id}>{w.ref}</option>)}
        </select>
      </label>
    </div>
    <div className="tablewrap"><table className="cmp">
      <thead><tr><th />{ws.map(w => <th key={w.id}>{w.ref}<div style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 12 }}>{w.brand}</div></th>)}</tr></thead>
      <tbody>{rows.map(([k, f]) => <tr key={k}><th>{k}</th>{ws.map(w => <td key={w.id} className={R && R.id === w.id ? 'ref' : ''}>{f(w)}</td>)}</tr>)}</tbody>
    </table></div>
  </>;
}
