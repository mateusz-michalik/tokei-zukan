import { useEffect, useRef, useState } from 'react';
import { CompareView } from './components/CompareView';
import { DetailView } from './components/DetailView';
import { OwnedView } from './components/OwnedView';
import { SidebarFooter } from './components/SidebarFooter';
import { Settings } from './components/Settings';
import { Sidebar } from './components/Sidebar';
import { WristView } from './components/WristView';
import { startLiveTime } from './lib/liveTime';
import { applyRoute, parseRoute, pathFor } from './lib/route';
import type { Tab } from './store/types';
import { useStore } from './store/useStore';

const TABS: [Tab, string][] = [['detail', 'Details'], ['compare', 'Compare'], ['wrist', 'On the wrist'], ['owned', 'Owned']];

/**
 * Keeps the address bar and the view in step. The state decides the address: user navigation adds a history entry,
 * while loading, Back/Forward and tidying an old address replace the current one, so the two never chase each other.
 * Returns whether the address names nothing, and a way to clear that once the user navigates on.
 */
function useAddress() {
  const { state, update } = useStore();
  const [notFound, setNotFound] = useState(() => parseRoute(location.pathname).view === 'not-found');
  const replaceNext = useRef(true);
  const path = pathFor(state);

  useEffect(() => {
    if (notFound || path === location.pathname) { replaceNext.current = false; return; }
    history[replaceNext.current ? 'replaceState' : 'pushState'](null, '', path + location.hash);
    replaceNext.current = false;
  }, [path, notFound]);

  useEffect(() => {
    const onPop = () => {
      const r = parseRoute(location.pathname);
      setNotFound(r.view === 'not-found');
      replaceNext.current = true;
      update(s => applyRoute(s, r));
    };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [update]);

  return { notFound, found: () => setNotFound(false) };
}

export function App() {
  const { state, byId, update, toasts } = useStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { notFound, found } = useAddress();
  const view = useRef<HTMLDivElement>(null);
  const shown = state.tab === 'compare' || state.tab === 'owned' ? undefined : byId(state.tab === 'wrist' ? state.wrist.watchId || state.selectedId : state.selectedId);

  // One clock for every watch on the page while live time is on.
  useEffect(() => (state.liveTime ? startLiveTime() : undefined), [state.liveTime]);
  // A new page starts at the top, and history and tabs read as the watch shown. The sidebar keeps its own scroll.
  useEffect(() => { view.current?.scrollTo({ top: 0 }); }, [state.tab, state.selectedId, state.wrist.watchId, notFound]);
  useEffect(() => {
    const page = notFound ? 'Watch not found' : shown ? `${shown.brand} ${shown.ref}` : state.tab === 'compare' ? 'Compare' : state.tab === 'owned' ? 'Owned' : '';
    document.title = page ? `${page} · Tokei Zukan` : 'Tokei Zukan';
  }, [notFound, shown, state.tab]);

  return (
    <div className="app">
      {/* First stop for keyboard users: jump past the sidebar's watch list. Focuses the view without touching the address. */}
      <a className="skip-link" href="#content" onClick={e => { e.preventDefault(); view.current?.focus(); }}>Skip to content</a>
      <Sidebar onSettings={() => setSettingsOpen(true)} onNavigate={found} lost={notFound} />
      <main>
        <div className="tabs" role="tablist">
          {TABS.map(([t, label]) => (
            <button key={t} className="tab" role="tab" aria-selected={state.tab === t} onClick={() => { found(); update(s => { s.tab = t; }); }}>
              {t === 'compare' ? `Compare (${state.compare.filter(id => byId(id)).length})` : t === 'owned' ? `Owned (${state.shortlist.filter(e => e.owned && byId(e.watchId)).length})` : label}
            </button>
          ))}
        </div>
        <div className="view" id="content" ref={view} tabIndex={-1}>
          {notFound ? (
            <div className="empty not-found">
              <h2>Watch not found</h2>
              <p>There's no watch at this address. It may have been renamed or removed, or the link may be incomplete. Pick a watch from the list.</p>
            </div>
          ) : <>
            {state.tab === 'detail' && <DetailView />}
            {state.tab === 'compare' && <CompareView />}
            {state.tab === 'wrist' && <WristView />}
            {state.tab === 'owned' && <OwnedView />}
          </>}
        </div>
      </main>
      <SidebarFooter where="page" />
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}
    </div>
  );
}
