import { catalogById } from '../catalog';
import type { Link } from '../catalog/schema';
import { fullLook } from '../render/watch';
import type { ShortlistEntry, Watch, WatchFacts } from './types';

/** Catalogue fields a user can override, other than links and look which are handled separately. */
const FACT_KEYS = ['brand', 'model', 'ref', 'diameter', 'lugToLug', 'thickness', 'lugWidth', 'crystal', 'bezel', 'movement', 'power', 'water', 'limited'] as const;
const PERSONAL_KEYS = ['liked', 'owned', 'priceAUD', 'priceNote', 'notes', 'pros', 'cons', 'photos', 'front', 'frontFill', 'wornStrap'] as const;

const blank = (v: unknown) => v === '' || v == null || v === false;
const same = (a: unknown, b: unknown) => (blank(a) && blank(b)) || a === b;

/** The catalogue facts for an entry: the catalogue model, or the user's own custom watch. */
export function baseFacts(watchId: string, customWatches: WatchFacts[]): WatchFacts | undefined {
  return catalogById.get(watchId) ?? customWatches.find(w => w.id === watchId);
}

export function mergeWatch(entry: ShortlistEntry, customWatches: WatchFacts[]): Watch | undefined {
  const base = baseFacts(entry.watchId, customWatches);
  if (!base) return undefined;
  const ov = entry.overrides ?? {};
  const { overrides: _o, watchId: _w, links: userLinks, ...personal } = entry;
  return {
    ...base,
    ...ov,
    look: { ...base.look, ...ov.look },
    ...personal,
    links: [...(ov.links ?? base.links ?? []), ...(userLinks ?? [])],
    custom: !catalogById.has(entry.watchId),
  };
}

/**
 * Splits an edited watch back into the user's entry and, for custom watches, its facts.
 * Catalogue watches only store the fields that differ from the catalogue.
 */
export function splitWatch(w: Watch): { entry: ShortlistEntry; facts?: WatchFacts } {
  const entry: ShortlistEntry = { watchId: w.id };
  for (const k of PERSONAL_KEYS) if (!blank(w[k])) (entry as unknown as Record<string, unknown>)[k] = w[k];
  const cat = catalogById.get(w.id);
  const facts: WatchFacts = { id: w.id, brand: w.brand, model: w.model, ref: w.ref, diameter: w.diameter, look: w.look };
  for (const k of FACT_KEYS) if (!blank(w[k])) (facts as unknown as Record<string, unknown>)[k] = w[k];
  if (!cat) {
    if (w.strap) facts.strap = w.strap;
    if (w.links.length) entry.links = w.links;
    return { entry, facts };
  }
  const official = cat.links ?? [];
  const isOfficial = (l: Link) => official.some(o => o.url === l.url && o.label === l.label);
  const keptOfficial = w.links.filter(isOfficial);
  const userLinks = w.links.filter(l => !isOfficial(l));
  if (userLinks.length) entry.links = userLinks;
  const ov: Partial<WatchFacts> = {};
  for (const k of FACT_KEYS) if (!same(w[k], cat[k])) (ov as Record<string, unknown>)[k] = w[k];
  if (keptOfficial.length !== official.length) ov.links = keptOfficial;
  const catLook = fullLook(cat.look), look = fullLook(w.look);
  // Colour inputs report lowercase hex, so compare case-insensitively.
  const lookDiff = Object.fromEntries(Object.entries(look).filter(([k, v]) => String(v).toLowerCase() !== String(catLook[k as keyof typeof catLook]).toLowerCase()));
  if (Object.keys(lookDiff).length) ov.look = lookDiff;
  if (Object.keys(ov).length) entry.overrides = ov;
  return { entry };
}
