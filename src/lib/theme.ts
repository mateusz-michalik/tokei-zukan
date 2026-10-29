import { useEffect, useSyncExternalStore } from 'react';

export type Theme = 'system' | 'light' | 'dark';
export const THEMES: [Theme, string][] = [['system', 'Match this device'], ['light', 'Light'], ['dark', 'Dark']];
export const isTheme = (t: unknown): t is Theme => THEMES.some(([v]) => v === t);

const darkQuery = () => matchMedia('(prefers-color-scheme: dark)');
const subscribe = (onChange: () => void) => {
  const q = darkQuery();
  q.addEventListener('change', onChange);
  return () => q.removeEventListener('change', onChange);
};

/** Whether the page is dark, following the device when the choice is "system", and keeps <html data-theme> in step. */
export function useDark(theme: Theme) {
  const deviceDark = useSyncExternalStore(subscribe, () => darkQuery().matches, () => false);
  const dark = theme === 'dark' || (theme === 'system' && deviceDark);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  return dark;
}
