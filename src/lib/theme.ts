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

/** The tab icon for each page theme: the dusk-lume dial in dark mode, the day dial in light. index.html uses the same. */
export const faviconFor = (dark: boolean) => (dark ? '/favicon.svg' : '/favicon-light.svg');

/**
 * Whether the page is dark, following the device when the choice is "system". Keeps <html data-theme> and the tab icon
 * in step: index.html sets both before first paint, and this takes over when the theme changes.
 */
export function useDark(theme: Theme) {
  const deviceDark = useSyncExternalStore(subscribe, () => darkQuery().matches, () => false);
  const dark = theme === 'dark' || (theme === 'system' && deviceDark);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    // Swap the one SVG icon link in place; the ICO stays as the fallback for browsers without SVG icons.
    const icon = document.getElementById('favicon');
    if (icon instanceof HTMLLinkElement && icon.getAttribute('href') !== faviconFor(dark)) icon.href = faviconFor(dark);
  }, [dark]);
  return dark;
}
