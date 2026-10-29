import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { catalogById } from '../catalog';
import { watchRequestUrl } from '../lib/links';
import { watchPath } from '../lib/route';
import { LIGHTINGS } from '../render/night';
import { watchSVG } from '../render/watch';
import type { Watch } from '../store/types';
import { useStore } from '../store/useStore';
import { sizeOrQ, Svg } from './common';
import { SidebarFooter } from './SidebarFooter';

/** `lost` means the address names no watch, so none is shown as current. */
export function Sidebar({ onSettings, onNavigate, lost }: { onSettings: () => void; onNavigate: () => void; lost: boolean }) {
  const { state, watches, dark, update } = useStore();
  const current = lost ? undefined : state.selectedId;
  const [q, setQ] = useState('');
  const active = useRef<HTMLDivElement>(null);

  // Arriving by address or Back/Forward can select a watch scrolled out of sight; clicks leave it where it is.
  useEffect(() => { active.current?.scrollIntoView({ block: 'nearest' }); }, [current]);

  const ql = q.trim().toLowerCase();
  const ws = watches.filter(w => !ql || [w.brand, w.model, w.ref].join(' ').toLowerCase().includes(ql));
  const brands = [...new Set(ws.map(w => w.brand))].sort((a, b) => a.localeCompare(b));

  const select = (w: Watch) => {
    onNavigate();
    update(s => {
      s.selectedId = w.id;
      s.wrist.watchId = w.id;
      if (s.tab === 'compare') s.tab = 'detail';
    });
  };
  // Plain clicks stay in the app; modifier and middle clicks are left to the browser, e.g. to open a new tab.
  const follow = (e: MouseEvent, w: Watch) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    select(w);
  };
  const toggleCompare = (id: string, on: boolean) => update(s => {
    s.compare = on ? [...s.compare, id] : s.compare.filter(x => x !== id);
  });
  const toggleBrand = (b: string) => update(s => {
    s.collapsedBrands = s.collapsedBrands.includes(b) ? s.collapsedBrands.filter(x => x !== b) : [...s.collapsedBrands, b];
  });

  const rowBody = (w: Watch) => <>
    <Svg className={`thumb ${state.lighting !== 'day' ? 'after-dark' : ''}`} html={watchSVG(w, 1, { strapLen: 3, lighting: state.lighting }).replace(/ width="[^"]*" height="[^"]*"/, ' width="44" height="52"')} />
    <div>
      <div className="t1">{w.ref}</div>
      <div className="t2 model">{w.model}</div>
      <div className="t3">{sizeOrQ(w.diameter)} × {sizeOrQ(w.lugToLug)} mm</div>
    </div>
  </>;

  return (
    <aside>
      <div className="brandbar">
        <h1>TOKEI ZUKAN</h1>
        <button className="btn" onClick={onSettings}>Settings</button>
        <p>Explore &amp; compare watches. See how they wear.</p>
      </div>
      <div className="side-view">
        <span id="lighting-label">Lighting</span>
        <div className="seg" role="group" aria-labelledby="lighting-label">
          {LIGHTINGS.map(([l, label]) => <button key={l} type="button" aria-pressed={state.lighting === l} onClick={() => update(s => { s.lighting = l; })}>{label}</button>)}
        </div>
        {/* Quick switch between light and dark; Settings also offers following the device. */}
        <button type="button" className="btn icon" aria-pressed={dark} aria-label="Dark interface" title={dark ? 'Switch to the light interface' : 'Switch to the dark interface'}
          onClick={() => update(s => { s.theme = dark ? 'light' : 'dark'; })}>
          {/* The icon shows the theme a click switches to: the sun in dark mode, the moon in light. */}
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            {dark
              ? <><circle cx="8" cy="8" r="2.8" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></>
              : <path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7Z" />}
          </svg>
        </button>
      </div>
      <div className="side-tools">
        <input type="search" placeholder="Search brand, model, ref" aria-label="Search watches" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="list">
        {brands.length ? brands.map(b => {
          // Plain catalogue order: liking and owning are personal and stay off the list.
          const group = ws.filter(w => w.brand === b).sort((a, c) => a.ref.localeCompare(c.ref, undefined, { numeric: true }));
          // Searching opens every matching brand without touching the saved choices. A folded brand names the watch
          // being viewed in its heading, so a watch opened from another view can always be found.
          const open = !!ql || !state.collapsedBrands.includes(b);
          const viewing = open ? undefined : group.find(w => w.id === current);
          const listId = `brand-${b.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          const count = <span className="count"><span className="sr">, </span>{group.length}<span className="sr">{group.length === 1 ? ' watch' : ' watches'}</span></span>;
          return (
            <div className="brand-group" key={b}>
              <h2>
                {ql ? <span>{b}{count}</span> : (
                  <button type="button" className="brand-toggle" aria-expanded={open} aria-controls={listId} onClick={() => toggleBrand(b)}>
                    <span className="chev" aria-hidden="true">▼</span>{b}
                    {viewing && <span className="viewing"><span className="sr">, </span>Viewing {viewing.ref}</span>}{count}
                  </button>
                )}
              </h2>
              <div id={listId}>
                {open && group.map(w => (
                  <div key={w.id} className={`row ${w.id === current ? 'active' : ''}`} ref={w.id === current ? active : undefined}>
                    {/* Browser-only custom watches from older versions have no public address, so they get a button. */}
                    {catalogById.has(w.id)
                      ? <a className="row-link" href={watchPath(w.id, state.tab === 'wrist' ? 'wrist' : 'detail')} aria-current={w.id === current ? 'page' : undefined} onClick={e => follow(e, w)}>{rowBody(w)}</a>
                      : <button type="button" className="row-link" aria-current={w.id === current || undefined} onClick={() => select(w)}>{rowBody(w)}</button>}
                    <input type="checkbox" aria-label={`Compare ${w.ref}`} checked={state.compare.includes(w.id)}
                      onChange={e => toggleCompare(w.id, e.target.checked)} />
                  </div>
                ))}
              </div>
            </div>
          );
        }) : (
          <p className="empty">
            No watches match your search.{' '}
            <a href={watchRequestUrl(q)} target="_blank" rel="noopener noreferrer">Request it<span className="sr"> on GitHub (opens in a new tab)</span></a>
          </p>
        )}
      </div>
      <SidebarFooter where="side" />
    </aside>
  );
}
