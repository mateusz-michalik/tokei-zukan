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
  const px = 6.2;
  const mode = state.cmpMode;
  // What each watch is drawn on here: the shared strap, what it's sold on, or its own choice from its details page.
  const shared = state.cmpStrap;
  const shownOn = (w: Watch) => (typeof shared === 'object' ? shared : resolveStrap(shared === 'sold' ? { ...w, wornStrap: undefined } : w));
  // Fewer than two isn't a comparison yet: explain how to start, without the comparison's controls and table.
  if (!ws.length) return <CompareEmpty watches={watches} palette={palette} />;
  if (ws.length === 1) {
    const w = ws[0], svg = watchSVG(w, px, { strapLen: 6, strap: shownOn(w), lighting });
    const [, width, height] = svg.match(/ width="([\d.]+)" height="([\d.]+)"/) ?? [];
    return (
      <div className={`stage ${lighting !== 'day' ? 'after-dark' : ''}`}>
        <div className="stage-row single">
          <div className="stage-item">
            <Svg html={svg} />
            <div className="lbl">{w.ref}</div>
            <div className="lbl2">{sizeOrQ(w.diameter)} × {sizeOrQ(w.lugToLug)} × {sizeOrQ(w.thickness)} mm</div>
          </div>
          {/* The empty second slot, the size of the watch beside it. */}
          <div className="stage-item">
            <div className="cmp-slot" style={{ width: Math.round(+width), minHeight: Math.round(+height) }}>
              <p>Select another watch using the checkbox next to it in the list to compare it with the {w.ref}.</p>
              <ToListButton />
            </div>
            <div className="lbl" aria-hidden="true">&nbsp;</div><div className="lbl2" aria-hidden="true">&nbsp;</div>
          </div>
        </div>
      </div>
    );
  }

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

/** Moves focus to the first compare checkbox showing in the list, or to the search if every brand is folded away. */
function ToListButton() {
  const go = () => {
    const boxes = [...document.querySelectorAll<HTMLInputElement>('aside .list input[type=checkbox]')].filter(b => b.offsetParent);
    const target = boxes[0] ?? document.querySelector<HTMLInputElement>('aside input[type=search], aside input');
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    target?.focus({ preventScroll: true });
  };
  return <button type="button" className="btn" onClick={go}>Go to the list</button>;
}

/**
 * Compare with nothing selected: what it does and how to start, beside a small drawing of the idea. Two list rows
 * with their boxes ticked lead to two real catalogue watches outlined at the same scale. The drawing is decorative;
 * the text says it all.
 */
function CompareEmpty({ watches, palette }: { watches: Watch[]; palette: string[] }) {
  const pick = (id: string, i: number) => watches.find(w => w.id === id) ?? watches[i];
  const pair = [pick('hamilton-h69439931', 0), pick('omega-310-30-42-50-01-001', 1)].filter(Boolean);
  const outlines = pair.map((w, i) => {
    const g = watchGroup(w, { outline: true, color: palette[i], sw: .45 });
    return `<g transform="translate(${125 + i * 50} 46)">${g.g}</g>`;
  }).join('');
  const row = (y: number, i: number) => `<g transform="translate(0 ${y})"><rect x="1" y="0" width="70" height="22" rx="2" fill="none" stroke="currentColor" stroke-opacity=".3"/>`
    + `<circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-opacity=".45"/><rect x="21" y="6" width="26" height="3.5" rx="1" fill="currentColor" fill-opacity=".45"/><rect x="21" y="13" width="18" height="3" rx="1" fill="currentColor" fill-opacity=".25"/>`
    + `<rect x="55" y="5" width="11" height="11" rx="1.5" fill="${palette[i]}"/><path d="M57.8 10.6 60 12.8l3.4-4" fill="none" stroke="var(--surface)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const html = `<svg viewBox="0 0 200 92" width="300" height="138" aria-hidden="true" focusable="false" style="max-width:100%;height:auto;color:var(--ink)">`
    + row(22, 0) + row(50, 1) + `<path d="M79 46h16m-4-4 4 4-4 4" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`
    + outlines + '</svg>';
  return (
    <section className="cmp-empty" aria-labelledby="cmp-empty-title">
      <Svg className="cmp-empty-art" html={html} />
      <div>
        <h2 id="cmp-empty-title">Compare watches side by side</h2>
        <p>Tick the box next to a watch in the list to add it here. With two or more, they're drawn at the same scale, or as
          outlines stacked on each other, with their sizes and prices in a table.</p>
        <ToListButton />
      </div>
    </section>
  );
}
