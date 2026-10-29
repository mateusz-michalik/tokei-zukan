import { CatalogWatchSchema, type CatalogWatch } from './schema';

/** Checks catalogue files against the schema and the "<brand>-<ref>" id convention. Throws on the first bad file. */
export function parseCatalog(entries: Record<string, unknown>): CatalogWatch[] {
  const out: CatalogWatch[] = [];
  const seen = new Set<string>();
  for (const [file, raw] of Object.entries(entries)) {
    const res = CatalogWatchSchema.safeParse(raw);
    if (!res.success) throw new Error(`${file}: ${res.error.issues.map(i => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    const [, brand, ref] = file.match(/watches\/([^/]+)\/([^/]+)\.json$/) ?? [];
    if (res.data.id !== `${brand}-${ref}`) throw new Error(`${file}: id should be "${brand}-${ref}", found "${res.data.id}"`);
    if (seen.has(res.data.id)) throw new Error(`${file}: duplicate id ${res.data.id}`);
    seen.add(res.data.id);
    out.push(res.data);
  }
  return out;
}
