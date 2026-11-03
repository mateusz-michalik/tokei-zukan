import legacyCopy from '../data/legacy-starter-copy.json';
import legacyPrices from '../data/legacy-starter-prices.json';
import retiredLinks from '../data/retired-starter-links.json';
import type { Link } from '../catalog/schema';
import type { ShortlistEntry } from './types';

type CopyField = 'notes' | 'pros' | 'cons';
const legacy = legacyCopy as Record<string, Partial<Record<CopyField, string[]>>>;
// Unverified prices and notes that earlier starter lists filled in. Catalogue RRPs replace them.
const seededPrices = legacyPrices as Record<string, { priceAUD?: number[]; priceNote: string[] }>;

// FNV-1a fingerprints let us recognise the old factory lines without shipping the
// original personal buying advice. This is a matching aid, not a security hash.
const fingerprint = (text: string) => {
  let hash = 14695981039346656037n;
  for (const ch of text.trim()) hash = BigInt.asUintN(64, (hash ^ BigInt(ch.codePointAt(0)!)) * 1099511628211n);
  return hash.toString(16);
};

/** Preserve edited lines, photos, prices, ownership, custom watches and reference choices. */
export function removeLegacyStarterCopy(entries: ShortlistEntry[]): ShortlistEntry[] {
  return entries.map(entry => {
    const known = legacy[entry.watchId];
    if (!known) return entry;
    const result = { ...entry };
    for (const field of ['notes', 'pros', 'cons'] as const) {
      const text = entry[field], hashes = known[field];
      if (!text || !hashes) continue;
      const lines = text.split(/\r?\n/);
      const kept = lines.filter(line => !hashes.includes(fingerprint(line)));
      if (kept.length === lines.length) continue;
      if (kept.some(line => line.trim())) result[field] = kept.join('\n');
      else delete result[field];
    }
    return result;
  });
}

/** Drops prices and price notes that are still exactly what an earlier starter list filled in; changed ones are kept. */
export function removeLegacyStarterPrices(entries: ShortlistEntry[]): ShortlistEntry[] {
  return entries.map(entry => {
    const seeded = seededPrices[entry.watchId];
    if (!seeded) return entry;
    const result = { ...entry };
    if (result.priceAUD != null && seeded.priceAUD?.includes(result.priceAUD)) delete result.priceAUD;
    if (result.priceNote && seeded.priceNote.includes(result.priceNote)) delete result.priceNote;
    return result;
  });
}

// Fingerprints of the Chrono24 and dealer links earlier starter lists gave four Seiko watches, as label and address
// joined by a newline, so the shop addresses aren't shipped. The site links only to makers now.
const seededLinks = retiredLinks as Record<string, string[]>;
const linkFingerprint = (l: Link) => fingerprint(`${l.label}\n${l.url}`);

/**
 * Drops links that are exactly what an earlier starter list filled in. Runs on every load, not once, so a list saved
 * by any older version, or migrated from the first one, can't bring them back. Other saved links are the visitor's own.
 */
export function removeRetiredStarterLinks(entries: ShortlistEntry[]): ShortlistEntry[] {
  return entries.map(entry => {
    const seeded = seededLinks[entry.watchId];
    if (!seeded || !entry.links) return entry;
    const kept = entry.links.filter(l => !seeded.includes(linkFingerprint(l)));
    if (kept.length === entry.links.length) return entry;
    const { links: _, ...rest } = entry;
    return kept.length ? { ...rest, links: kept } : rest;
  });
}
