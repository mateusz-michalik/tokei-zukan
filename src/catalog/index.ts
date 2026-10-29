import type { CatalogWatch } from './schema';

// Every file in catalog/watches/<brand>/<ref>.json is one model. Ids are "<brand>-<ref>" so the path and id always agree.
// The files are checked against the schema by validate.ts in the tests (which gate `npm run build`) and on dev start-up.
export const catalogFiles = import.meta.glob<CatalogWatch>('/catalog/watches/**/*.json', { eager: true, import: 'default' });

export const CATALOG: CatalogWatch[] = Object.values(catalogFiles);
export const catalogById = new Map(CATALOG.map(w => [w.id, w]));
