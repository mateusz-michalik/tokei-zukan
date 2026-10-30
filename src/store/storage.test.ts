import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import indexHtml from '../../index.html?raw';
import { loadState, saveState, starterState } from './state';

let values: Map<string, string>;
beforeEach(() => {
  values = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('branded browser storage', () => {
  test('migrates legacy preferences and personal collection without deleting the old list', () => {
    const old = starterState();
    old.theme = 'dark';
    old.currency = 'EUR';
    old.shortlist[0].liked = true;
    old.shortlist[0].owned = true;
    old.boxes[0].slots[2] = old.shortlist[0].watchId;
    old.wrist.cm = 18;
    const raw = JSON.stringify(old);
    values.set('wristcheck.v2', raw);
    const { state } = loadState();
    expect(state).toEqual(old);
    expect(JSON.parse(values.get('tokeizukan.v2')!)).toEqual(old);
    expect(values.get('wristcheck.v2')).toBe(raw);
  });
  test('the new key wins over stale legacy data, and subsequent saves use only the new key', () => {
    const old = { ...starterState(), currency: 'USD' };
    const current = { ...starterState(), currency: 'JPY' };
    values.set('wristcheck.v2', JSON.stringify(old));
    values.set('tokeizukan.v2', JSON.stringify(current));
    expect(loadState().state.currency).toBe('JPY');
    expect(saveState({ ...starterState(), currency: 'EUR' })).toBe(true);
    expect(JSON.parse(values.get('tokeizukan.v2')!).currency).toBe('EUR');
    expect(JSON.parse(values.get('wristcheck.v2')!).currency).toBe('USD');
  });
  test('a corrupt new key does not hide a usable old list', () => {
    values.set('tokeizukan.v2', '{broken');
    values.set('wristcheck.v2', JSON.stringify({ ...starterState(), currency: 'CNY' }));
    expect(loadState().state.currency).toBe('CNY');
  });
  test('v1 lists still migrate through the branded key', () => {
    values.set('wristcheck.v1', JSON.stringify({ watches: [], wrist: { cm: 19 } }));
    expect(loadState().state.wrist.cm).toBe(19);
    expect(JSON.parse(values.get('tokeizukan.v2')!).version).toBe(2);
    expect(values.has('wristcheck.v1')).toBe(true);
  });
  test('a denied migration write still loads personal data without deleting its source', () => {
    values.set('wristcheck.v2', JSON.stringify({ ...starterState(), currency: 'EUR' }));
    localStorage.setItem = () => { throw new Error('Quota exceeded'); };
    expect(loadState().state.currency).toBe('EUR');
    expect(values.has('wristcheck.v2')).toBe(true);
    expect(saveState(starterState())).toBe(false);
  });
  test('blocked storage safely uses the starter state', () => {
    localStorage.getItem = () => { throw new Error('Blocked'); };
    expect(loadState().state).toEqual(starterState());
  });
  test('initial-paint theme uses the same key priority, including corrupt-new-key fallback', () => {
    const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)![1];
    const apply = () => {
      const icon = { href: '' };
      const doc = { documentElement: { dataset: { theme: '' } }, getElementById: () => icon };
      new Function('document', 'localStorage', 'matchMedia', script)(doc, localStorage, () => ({ matches: false }));
      return { theme: doc.documentElement.dataset.theme, icon: icon.href };
    };
    values.set('wristcheck.v2', JSON.stringify({ ...starterState(), theme: 'dark' }));
    values.set('tokeizukan.v2', '{broken');
    expect(apply()).toEqual({ theme: 'dark', icon: '/favicon.svg' });
    values.set('tokeizukan.v2', JSON.stringify({ ...starterState(), theme: 'light' }));
    expect(apply()).toEqual({ theme: 'light', icon: '/favicon-light.svg' });
  });
});
