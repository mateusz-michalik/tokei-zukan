import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { applyRoute, parseRoute } from '../lib/route';
import { useDark } from '../lib/theme';
import { mergeWatch } from './model';
import { loadState, saveState, setOwned as own } from './state';
import type { UserState, Watch } from './types';
import { StoreContext, type Store } from './useStore';

export function StoreProvider({ children }: { children: ReactNode }) {
  // An address someone shared wins over whatever this browser last had open.
  const [initial] = useState(() => { const l = loadState(); applyRoute(l.state, parseRoute(location.pathname)); return l; });
  const [state, setState] = useState(initial.state);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const tid = useRef(0);
  const toast = useCallback((msg: string) => {
    const id = ++tid.current;
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  const announced = useRef(false);
  useEffect(() => {
    if (announced.current || !initial.added) return;
    announced.current = true;
    toast(`${initial.added} new watch${initial.added > 1 ? 'es' : ''} added from the catalogue`);
  }, [initial, toast]);

  // Also runs on first load, so a list migrated from v1 is stored straight away.
  useEffect(() => {
    if (!saveState(state)) toast('Could not save: browser storage is full or blocked');
  }, [state, toast]);

  const dark = useDark(state.theme);

  const update = useCallback((fn: (s: UserState) => void) => setState(s => { const n = structuredClone(s); fn(n); return n; }), []);
  const setOwned = useCallback((id: string, on: boolean) => update(s => own(s, id, on)), [update]);

  const store = useMemo<Store>(() => {
    const watches = state.shortlist.map(e => mergeWatch(e, state.customWatches)).filter((w): w is Watch => !!w);
    const byId = (id: string | undefined) => watches.find(w => w.id === id);
    const refWatch = byId(state.referenceId) || watches.find(w => w.owned);
    return { state, watches, byId, refWatch, dark, update, setOwned, toast, toasts };
  }, [state, dark, toasts, update, setOwned, toast]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
