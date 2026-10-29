import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { startAnalytics } from './lib/analytics';
import { StoreProvider } from './store/StoreProvider';
import './styles.css';

// Dev-only drawing review sheet at /#gallery.
const Gallery = import.meta.env.DEV ? lazy(() => import('./components/Gallery').then(m => ({ default: m.Gallery }))) : null;

if (import.meta.env.DEV) {
  // Surface a bad catalogue file straight away while editing it.
  Promise.all([import('./catalog/validate'), import('./catalog')]).then(([v, c]) => v.parseCatalog(c.catalogFiles)).catch(e => console.error(e));
}

// Production visit counts only; a no-op everywhere else (see lib/analytics.ts).
if (location.hash !== '#gallery') startAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      {Gallery && location.hash === '#gallery' ? <Suspense><Gallery /></Suspense> : <App />}
    </StoreProvider>
  </StrictMode>,
);
