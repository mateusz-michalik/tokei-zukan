import { CATALOG } from '../catalog';
import { BRACELET_STYLES, RUBBER_STYLES } from '../catalog/constants';
import type { Strap } from '../catalog/schema';
import starter from '../data/starter-list.json';
import { splitWatch } from './model';
import { isDisplayCurrency } from '../lib/price';
import { isTheme } from '../lib/theme';
import { isLighting } from '../render/night';
import { removeLegacyStarterCopy, removeLegacyStarterPrices } from './starterCopy';
import type { LegacyStatus, ShortlistEntry, UserState, Watch, WatchBox, WatchFacts } from './types';

const KEY = 'wristcheck.v2';
const LEGACY_KEY = 'wristcheck.v1';

/**
 * Puts every catalogue watch missing from the user's list onto it, so watches added to the catalogue after their
 * first visit reach them, and ones removed in older versions come back. Returns how many were new to this user.
 */
export function addNewCatalogWatches(s: UserState) {
  let added = 0;
  for (const c of CATALOG) {
    const unseen = !s.seenCatalog.includes(c.id);
    if (unseen) s.seenCatalog.push(c.id);
    if (s.shortlist.some(e => e.watchId === c.id)) continue;
    s.shortlist.push({ watchId: c.id });
    if (unseen) added++;
  }
  return added;
}

export function starterState(): UserState {
  const s: UserState = {
    version: 2,
    starterCopyVersion: 3,
    shortlist: structuredClone(starter.shortlist) as ShortlistEntry[],
    customWatches: [],
    seenCatalog: [],
    selectedId: starter.selectedId,
    compare: [...starter.compare],
    tab: 'detail',
    cmpMode: 'renders',
    currency: 'AUD',
    // Light until the visitor picks otherwise, whatever the device prefers.
    theme: 'light',
    themeVersion: 2,
    lighting: 'day',
    liveTime: false,
    referenceId: starter.referenceId,
    collapsedBrands: [],
    boxes: [newBox()],
    wrist: { ...starter.wrist, outlineId: '' },
  };
  addNewCatalogWatches(s);
  return s;
}

/** Enough of the strap schema to draw it, without bundling zod for one saved field. */
function isStrap(v: unknown): v is Strap {
  const s = v as Record<string, unknown> | null;
  if (!s || typeof s !== 'object') return false;
  switch (s.type) {
    case 'bracelet': return (BRACELET_STYLES as readonly unknown[]).includes(s.style);
    case 'nato': return Array.isArray(s.colors) && s.colors.length > 0 && s.colors.every(c => typeof c === 'string');
    case 'rubber': return (RUBBER_STYLES as readonly unknown[]).includes(s.style) && typeof s.color === 'string';
    case 'leather': case 'nylon': return typeof s.color === 'string';
    default: return false;
  }
}

/** Removes unchanged factory data once: buying advice before version 2, unverified prices before version 3. */
function cleanStarterData(shortlist: ShortlistEntry[], version: UserState['starterCopyVersion']) {
  const copied = version === 2 || version === 3 ? shortlist : removeLegacyStarterCopy(shortlist);
  return version === 3 ? copied : removeLegacyStarterPrices(copied);
}

/** Likes or unlikes a watch. Ownership, boxes and comparison are untouched. */
export function setLiked(s: UserState, id: string, on: boolean) {
  const e = s.shortlist.find(x => x.watchId === id);
  if (e) e.liked = on || undefined;
}

/** Marks a watch owned or not. Unowning takes it out of every box; its like and comparison are untouched. */
export function setOwned(s: UserState, id: string, on: boolean) {
  const e = s.shortlist.find(x => x.watchId === id);
  if (!e) return;
  e.owned = on || undefined;
  if (!on) for (const b of s.boxes) b.slots = b.slots.map(x => (x === id ? null : x));
}

/** The first watch box: eight slots. */
export const newBox = (): WatchBox => ({ id: 'box-1', name: 'Watch box', slots: Array(8).fill(null) });

/**
 * Turns an older entry's single status into the independent flags: front-runners become liked, owned stays owned,
 * and considering or ruled-out become neither. Entries already in the new shape pass through unchanged.
 */
function splitStatus(entry: ShortlistEntry & { status?: LegacyStatus }): ShortlistEntry {
  const { status, ...e } = entry;
  if (status === 'front-runner') e.liked = true;
  if (status === 'owned') e.owned = true;
  return e;
}

/**
 * The first default box had six slots; it grows to today's eight, keeping its watches where they are. Box sizes
 * can't be chosen yet, so a six-slot default box is always that original one.
 */
const grownDefault = (b: WatchBox): WatchBox =>
  b.id === 'box-1' && b.slots.length === 6 ? { ...b, slots: [...b.slots, null, null] } : b;

/** Saved boxes, keeping only owned watches, each in one slot at most. Always at least one box. */
function cleanBoxes(raw: unknown, owned: Set<string>): WatchBox[] {
  const seen = new Set<string>();
  const boxes = (Array.isArray(raw) ? raw : []).filter((b): b is WatchBox =>
    !!b && typeof b.id === 'string' && typeof b.name === 'string' && Array.isArray(b.slots) && b.slots.length > 0);
  return boxes.length
    ? boxes.map(b => ({ ...b, slots: grownDefault(b).slots.map(id => (typeof id === 'string' && owned.has(id) && !seen.has(id) && seen.add(id) ? id : null)) }))
    : [newBox()];
}

/** Fills in fields that older saved states and exports don't have. */
export function normalise(raw: Omit<Partial<UserState>, 'cmpMode' | 'wrist'> & {
  cmpMode?: string; showOutline?: boolean; wrist?: Partial<UserState['wrist']> & { ghostId?: string };
}): UserState {
  const base = starterState();
  const { ghostId, ...wrist } = raw.wrist ?? {};
  const { showOutline, ...rest } = raw;
  const given = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
  const referenceId = raw.referenceId ?? ghostId ?? '';
  // The outline used to be the size reference behind an on/off switch; one that was on keeps showing the same watch.
  // Remove only unchanged factory copy, once; user-authored notes and selections survive.
  const shortlist = cleanStarterData(raw.shortlist ?? base.shortlist, raw.starterCopyVersion).map(splitStatus);
  const legacyOutline = showOutline ? referenceId || shortlist.find(e => e.owned)?.watchId || '' : '';
  return {
    ...base,
    ...given,
    shortlist,
    starterCopyVersion: 3,
    // Saved before seenCatalog existed: treat everything in today's catalogue as already offered.
    seenCatalog: raw.seenCatalog ?? CATALOG.map(c => c.id),
    // The front-photos mode was retired; fall back to the default view.
    cmpMode: raw.cmpMode === 'outlines' ? 'outlines' : 'renders',
    currency: isDisplayCurrency(raw.currency) ? raw.currency : 'AUD',
    // `system` saved before light became the default was that default, not a choice.
    theme: isTheme(raw.theme) && !(raw.theme === 'system' && raw.themeVersion !== 2) ? raw.theme : 'light',
    themeVersion: 2,
    lighting: isLighting(raw.lighting) ? raw.lighting : 'day',
    liveTime: raw.liveTime === true,
    // A strap the renderer can't draw would break Compare; fall back to each watch's own.
    cmpStrap: raw.cmpStrap === 'sold' || isStrap(raw.cmpStrap) ? raw.cmpStrap : undefined,
    referenceId,
    boxes: cleanBoxes(raw.boxes, new Set(shortlist.filter(e => e.owned).map(e => e.watchId))),
    wrist: { ...base.wrist, outlineId: legacyOutline, ...wrist },
  };
}

/* ---------- v1 (single-file app) migration ---------- */

interface V1Watch extends Record<string, unknown> { id: string; brand: string; ref: string; status: LegacyStatus }
interface V1State { watches: V1Watch[]; selectedId?: string; compare?: string[]; tab?: UserState['tab']; cmpMode?: string; wrist?: { cm?: number; watchId?: string; ghostId?: string } }

const norm = (s: unknown) => String(s ?? '').trim().toLowerCase();

/** Turns a v1 state (all watch data in one array) into catalogue references plus personal entries. */
export function migrateV1(v1: V1State): UserState {
  const idMap: Record<string, string> = {};
  const shortlist: ShortlistEntry[] = [];
  const customWatches: WatchFacts[] = [];
  for (const old of v1.watches) {
    const match = CATALOG.find(c => norm(c.brand) === norm(old.brand) && norm(c.ref) === norm(old.ref));
    const id = match?.id ?? old.id;
    idMap[old.id] = id;
    const w = { ...old, id, liked: old.status === 'front-runner', owned: old.status === 'owned', links: (old.links as Watch['links']) ?? [], look: old.look ?? {}, custom: !match } as unknown as Watch;
    const { entry, facts } = splitWatch(w);
    shortlist.push(entry);
    if (facts) customWatches.push(facts);
  }
  const map = (id?: string) => (id && idMap[id]) || '';
  return normalise({
    shortlist,
    customWatches,
    selectedId: map(v1.selectedId) || shortlist[0]?.watchId || '',
    compare: (v1.compare ?? []).map(map).filter(Boolean),
    tab: v1.tab,
    cmpMode: v1.cmpMode,
    referenceId: map(v1.wrist?.ghostId),
    wrist: { cm: v1.wrist?.cm ?? 17, watchId: map(v1.wrist?.watchId) },
  });
}

/* ---------- localStorage ---------- */

/** The saved state, plus how many new catalogue watches were added to it. */
export function loadState(): { state: UserState; added: number } {
  let s = starterState();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    const v1 = saved ? null : JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
    if (saved?.version === 2) s = normalise(saved);
    else if (v1?.watches) s = migrateV1(v1);
    else return { state: s, added: 0 };
  } catch { /* fall through to the starter list */ }
  const added = addNewCatalogWatches(s);
  return { state: s, added };
}

/** Returns false when the browser refuses to store it (full or blocked). */
export function saveState(state: UserState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
