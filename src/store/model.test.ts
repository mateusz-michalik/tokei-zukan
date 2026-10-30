import { describe, expect, test } from 'vitest';
import { CATALOG, catalogFiles } from '../catalog';
import { parseCatalog } from '../catalog/validate';
import { mergeWatch, splitWatch } from './model';
import { addNewCatalogWatches, migrateV1, normalise, setLiked, setOwned, starterState } from './state';
import type { LegacyStatus, ShortlistEntry, Watch } from './types';

/** Entries as versions before likes and ownership were split saved them. */
const legacy = (entries: (Omit<ShortlistEntry, 'liked' | 'owned'> & { status: LegacyStatus })[]) => entries as ShortlistEntry[];

describe('catalogue', () => {
  test('every watch file is valid', () => {
    expect(parseCatalog(catalogFiles).length).toBeGreaterThan(0);
  });
  test('rejects a file whose id does not match its path', () => {
    const w = { ...CATALOG[0], id: 'seiko-wrong' };
    expect(() => parseCatalog({ '/catalog/watches/seiko/spb257.json': w })).toThrow(/id should be "seiko-spb257"/);
  });
  test('rejects unknown look fields', () => {
    const w = { ...CATALOG[0], look: { ...CATALOG[0].look, glow: true } };
    expect(() => parseCatalog({ [`/catalog/watches/x/y.json`]: w })).toThrow();
  });
});

describe('merge and split', () => {
  test('every starter entry points at a catalogue watch', () => {
    const s = starterState();
    for (const e of s.shortlist) expect(mergeWatch(e, []), e.watchId).toBeDefined();
  });
  test('merging then splitting the starter list changes nothing', () => {
    for (const e of starterState().shortlist) expect(splitWatch(mergeWatch(e, [])!).entry).toEqual(e);
  });
  test('edits to catalogue fields are stored as overrides', () => {
    const e = starterState().shortlist.find(x => x.watchId === 'seiko-spb257')!;
    const w = mergeWatch(e, [])!;
    const { entry, facts } = splitWatch({ ...w, diameter: 43, look: { ...w.look, dial: '#000000' } });
    expect(facts).toBeUndefined();
    expect(entry.overrides).toEqual({ diameter: 43, look: { dial: '#000000' } });
    expect(mergeWatch(entry, [])!.diameter).toBe(43);
  });
  test('colours that only differ in case are not overrides', () => {
    const e = starterState().shortlist.find(x => x.watchId === 'seiko-spb257')!;
    const w = mergeWatch(e, [])!;
    const lower = Object.fromEntries(Object.entries(w.look).map(([k, v]) => [k, typeof v === 'string' ? v.toLowerCase() : v]));
    expect(splitWatch({ ...w, look: lower }).entry.overrides).toBeUndefined();
  });
  test('the chosen strap is personal and survives a round trip', () => {
    const e = { ...starterState().shortlist[0], wornStrap: { type: 'nato' as const, colors: ['#000000'] } };
    const { entry } = splitWatch(mergeWatch(e, [])!);
    expect(entry.wornStrap).toEqual({ type: 'nato', colors: ['#000000'] });
    expect(entry.overrides).toBeUndefined();
  });
  test('custom watches keep their facts separately', () => {
    const w: Watch = { id: 'w1', brand: 'Tudor', model: 'Pelagos 39', ref: '25407N', diameter: 39, links: [], look: {}, custom: true };
    const { entry, facts } = splitWatch(w);
    expect(facts).toMatchObject({ id: 'w1', brand: 'Tudor', diameter: 39 });
    expect(mergeWatch(entry, [facts!])).toMatchObject({ ref: '25407N', custom: true });
  });
});

describe('v1 migration', () => {
  test('maps catalogue watches by brand and ref and keeps custom ones', () => {
    const s = migrateV1({
      watches: [
        { id: 'spb257', brand: 'Seiko', model: 'Prospex Black Series "Willard"', ref: 'SPB257', status: 'front-runner', priceAUD: 1350, diameter: 42.7, lugToLug: 46.6, thickness: 13.2, lugWidth: 20,
          crystal: 'Curved sapphire, AR inside', bezel: 'Rotating diver', movement: '6R35 automatic', power: '70 h', water: 200, limited: '5,500',
          links: [{ label: 'Chrono24', url: 'https://www.chrono24.com.au/search/index.htm?query=SPB257' }], look: CATALOG.find(c => c.id === 'seiko-spb257')!.look, photos: [{ src: 'idb:p1' }], front: 'idb:p1' },
        { id: 'w99', brand: 'Tudor', model: 'Pelagos 39', ref: '25407N', status: 'considering', diameter: 39, look: { dial: '#111111' } },
      ],
      selectedId: 'spb257', compare: ['spb257', 'w99'], wrist: { cm: 18, watchId: 'w99', ghostId: 'spb257' },
    });
    expect(s.shortlist[0]).toMatchObject({ watchId: 'seiko-spb257', liked: true, priceAUD: 1350, front: 'idb:p1' });
    expect(s.shortlist[0]).not.toHaveProperty('status');
    expect(s.shortlist[0].overrides).toBeUndefined();
    expect(s.customWatches).toHaveLength(1);
    expect(s.compare).toEqual(['seiko-spb257', 'w99']);
    expect(s.wrist).toEqual({ cm: 18, watchId: 'w99', outlineId: '' });
    expect(s.referenceId).toBe('seiko-spb257');
  });
});

describe('saved state', () => {
  test('older v2 states get settings defaults, all brands open, and the outline watch becomes the reference', () => {
    const old = { ...starterState(), wrist: { cm: 18, watchId: 'seiko-spb257', ghostId: 'seiko-spb317' } } as Record<string, unknown>;
    delete old.referenceId; delete old.showOutline; delete old.seenCatalog; delete old.collapsedBrands;
    const s = normalise(old);
    expect(s.referenceId).toBe('seiko-spb317');
    expect(s.collapsedBrands).toEqual([]);
    expect(s.wrist).toEqual({ cm: 18, watchId: 'seiko-spb257', outlineId: '' });
    expect(s.seenCatalog).toEqual(CATALOG.map(c => c.id));
  });
  test('an outline that was switched on keeps showing the same watch; one that was off shows none', () => {
    const old = (o: Record<string, unknown>) => normalise({ ...starterState(), ...o } as Parameters<typeof normalise>[0]);
    const wrist = { cm: 17, watchId: 'seiko-spb257' };
    expect(old({ showOutline: true, referenceId: 'seiko-spb317', wrist }).wrist.outlineId).toBe('seiko-spb317');
    expect(old({ showOutline: false, referenceId: 'seiko-spb317', wrist }).wrist.outlineId).toBe('');
    // No reference chosen: it showed the first watch owned.
    const shortlist = [{ watchId: 'seiko-spb451', status: 'considering' }, { watchId: 'seiko-ssc947', status: 'owned' }];
    expect(old({ showOutline: true, referenceId: '', shortlist, wrist }).wrist.outlineId).toBe('seiko-ssc947');
    expect(old({ showOutline: true, referenceId: '', shortlist: shortlist.slice(0, 1), wrist }).wrist.outlineId).toBe('');
    // The retired switch isn't carried along, and a saved outline wins over it.
    const s = old({ showOutline: true, referenceId: 'seiko-spb317', wrist: { ...wrist, outlineId: 'seiko-srpk01' } });
    expect(s.wrist.outlineId).toBe('seiko-srpk01');
    expect('showOutline' in s).toBe(false);
  });
  test('theme and lighting are saved separately and fall back to light and day', () => {
    const load = (o: Record<string, unknown>) => normalise({ ...starterState(), ...o } as Parameters<typeof normalise>[0]);
    expect(load({ theme: 'dark', lighting: 'day' })).toMatchObject({ theme: 'dark', lighting: 'day' });
    expect(load({ theme: 'light', lighting: 'night' })).toMatchObject({ theme: 'light', lighting: 'night' });
    expect(load({ theme: 'sepia', lighting: 'noon' })).toMatchObject({ theme: 'light', lighting: 'day' });
    // Matching the device stays available, and a visitor who chose it keeps it.
    expect(load({ theme: 'system', themeVersion: 2 })).toMatchObject({ theme: 'system' });
    // Before light became the default everyone started on `system`, so an old saved `system` wasn't a choice.
    expect(load({ theme: 'system', themeVersion: undefined })).toMatchObject({ theme: 'light', themeVersion: 2 });
    expect(load({ theme: 'dark', themeVersion: undefined })).toMatchObject({ theme: 'dark' });
    expect(starterState()).toMatchObject({ theme: 'light', lighting: 'day' });
  });
  test('a saved front-photos comparison falls back to side by side; photo data is kept', () => {
    const old = { ...starterState(), cmpMode: 'photos', shortlist: [{ watchId: 'seiko-spb257', status: 'considering', photos: [{ src: 'idb:p1' }], front: 'idb:p1' }] };
    const s = normalise(old as Parameters<typeof normalise>[0]);
    expect(s.cmpMode).toBe('renders');
    expect(s.shortlist[0]).toMatchObject({ photos: [{ src: 'idb:p1' }], front: 'idb:p1' });
    expect(normalise({ ...s, cmpMode: 'outlines' }).cmpMode).toBe('outlines');
  });
  test('the shared comparison strap loads when valid and is otherwise left to each watch', () => {
    const nato = { type: 'nato', colors: ['#000000'], name: 'NATO, black' } as const;
    const load = (cmpStrap: unknown) => normalise({ ...starterState(), cmpStrap } as Parameters<typeof normalise>[0]).cmpStrap;
    expect(load(nato)).toEqual(nato);
    expect(load('sold')).toBe('sold');
    expect(load(undefined)).toBeUndefined();
    expect(load({ type: 'nato' })).toBeUndefined();
    expect(load('chain mail')).toBeUndefined();
  });
  test('every catalogue watch is listed; only unseen ones count as new', () => {
    const s = starterState();
    expect(s.shortlist.map(e => e.watchId).sort()).toEqual(CATALOG.map(c => c.id).sort());
    s.shortlist = s.shortlist.filter(e => e.watchId !== 'seiko-spb317' && e.watchId !== 'baltic-mk2-39-5');
    s.seenCatalog = s.seenCatalog.filter(id => id !== 'baltic-mk2-39-5');
    expect(addNewCatalogWatches(s)).toBe(1);
    expect(s.shortlist.map(e => e.watchId).sort()).toEqual(CATALOG.map(c => c.id).sort());
    expect(s.shortlist.find(e => e.watchId === 'seiko-spb317')).toEqual({ watchId: 'seiko-spb317' });
    expect(addNewCatalogWatches(s)).toBe(0);
  });
});

describe('public starter copy', () => {
  test('new visitors get no seeded opinions, ownership, favourites or reference watch', () => {
    const s = starterState();
    expect(s.referenceId).toBe('');
    expect(s.compare).toEqual([]);
    for (const e of s.shortlist) {
      expect([e.liked, e.owned]).toEqual([undefined, undefined]);
      expect(e.notes).toBeUndefined();
      expect(e.pros).toBeUndefined();
      expect(e.cons).toBeUndefined();
    }
  });
  test('old saved copy is removed while added lines and personal settings survive', () => {
    const old = starterState();
    delete old.starterCopyVersion;
    old.referenceId = 'seiko-ssc947';
    old.wrist.cm = 18;
    old.shortlist = legacy([{ watchId: 'seiko-spb257', status: 'front-runner', priceAUD: 1234,
      pros: 'Closest footprint to the Pogue\nComfortable on my wrist',
      cons: 'Coating scratches show bright steel\nNo polished/brushed contrast\nLimited, mostly grey market',
      notes: 'My own notes', photos: [{ src: 'idb:mine' }], overrides: { diameter: 43 } }]);
    const result = normalise(old);
    const { status: _, ...rest } = old.shortlist[0] as ShortlistEntry & { status?: string };
    expect(result.shortlist[0]).toEqual({ ...rest, liked: true, pros: 'Comfortable on my wrist', cons: undefined });
    expect(result.referenceId).toBe(old.referenceId);
    expect(result.wrist.cm).toBe(18);
    expect(old.shortlist[0].pros).toContain('Closest footprint');
    expect(normalise(result)).toEqual(result);
  });
  test('also removes retired factory text from earlier catalogue revisions', () => {
    const old = starterState();
    old.starterCopyVersion = 1;
    old.shortlist = legacy([{ watchId: 'oris-01-733-7707', status: 'considering',
      notes: 'Best glass on the list. The chrono you linked is A$7,000, this is the three-hander.',
      pros: 'Box-style glass', cons: 'Aluminium bezel', priceAUD: 2960 }]);
    // A$2,960 was that revision's factory price, so it goes too.
    expect(normalise(old).shortlist).toEqual([{ watchId: 'oris-01-733-7707' }]);
  });
  test('unchanged starter prices are removed once; prices and notes the user changed stay', () => {
    const old = starterState();
    old.starterCopyVersion = 2;
    old.shortlist = legacy([
      { watchId: 'seiko-spb317', status: 'considering', priceAUD: 1400, priceNote: 'Seiko AU RRP' },
      { watchId: 'seiko-spb451', status: 'considering', priceAUD: 1850, priceNote: 'Seiko AU RRP' },
      { watchId: 'seiko-spb519', status: 'considering', priceAUD: 3200, priceNote: 'Bought at a boutique sale' },
      { watchId: 'custom-1', status: 'considering', priceAUD: 1400 },
    ]);
    const result = normalise(old);
    expect(result.shortlist).toEqual([
      { watchId: 'seiko-spb317' },
      { watchId: 'seiko-spb451', priceAUD: 1850 },
      { watchId: 'seiko-spb519', priceNote: 'Bought at a boutique sale' },
      { watchId: 'custom-1', priceAUD: 1400 },
    ]);
    expect(result.starterCopyVersion).toBe(3);
    // Runs once: a later save that matches a seed value again is left alone.
    const again = { ...result, shortlist: [{ watchId: 'seiko-spb317', priceAUD: 1400 }] };
    expect(normalise(again).shortlist[0].priceAUD).toBe(1400);
  });
  test('the starter list carries no prices of its own', () => {
    for (const e of starterState().shortlist) expect([e.priceAUD, e.priceNote]).toEqual([undefined, undefined]);
  });
  test('edited factory paragraphs and custom-watch notes are not removed', () => {
    const old = starterState();
    delete old.starterCopyVersion;
    old.shortlist = legacy([
      { watchId: 'seiko-spb451', status: 'considering', cons: 'Arguably too similar to what you own — but I prefer this dial.' },
      { watchId: 'custom-1', status: 'owned', pros: 'Closest footprint to the Pogue' },
    ]);
    expect(normalise(old).shortlist).toEqual([
      { watchId: 'seiko-spb451', cons: 'Arguably too similar to what you own — but I prefer this dial.' },
      { watchId: 'custom-1', owned: true, pros: 'Closest footprint to the Pogue' },
    ]);
  });
  test('after migration, deliberately entered notes are left untouched', () => {
    const saved = starterState();
    saved.shortlist[0].pros = 'Size is just right';
    expect(normalise(saved).shortlist[0].pros).toBe('Size is just right');
  });
});

describe('likes, ownership and comparison', () => {
  const entry = (s: ReturnType<typeof starterState>, id: string) => s.shortlist.find(e => e.watchId === id)!;
  test('are independent in every combination', () => {
    for (const liked of [false, true]) for (const owned of [false, true]) for (const compared of [false, true]) {
      const s = starterState();
      if (compared) s.compare = ['seiko-spb317'];
      setLiked(s, 'seiko-spb317', liked);
      setOwned(s, 'seiko-spb317', owned);
      const e = entry(s, 'seiko-spb317');
      expect([!!e.liked, !!e.owned, s.compare.includes('seiko-spb317')]).toEqual([liked, owned, compared]);
      // Toggling one never moves the others.
      setLiked(s, 'seiko-spb317', !liked);
      expect([!!e.owned, s.compare.includes('seiko-spb317')]).toEqual([owned, compared]);
      setOwned(s, 'seiko-spb317', !owned);
      expect([!!e.liked, s.compare.includes('seiko-spb317')]).toEqual([!liked, compared]);
    }
  });
  test('unowning takes a watch out of its box but keeps its like', () => {
    const s = starterState();
    setOwned(s, 'seiko-spb317', true);
    setLiked(s, 'seiko-spb317', true);
    s.boxes[0].slots[2] = 'seiko-spb317';
    setOwned(s, 'seiko-spb317', false);
    expect(s.boxes[0].slots).toEqual(Array(8).fill(null));
    expect(entry(s, 'seiko-spb317').liked).toBe(true);
  });
  test('old statuses become likes and ownership once; other data and choices survive', () => {
    const old = { ...starterState(), compare: ['seiko-spb451'], currency: 'EUR' as const, shortlist: legacy([
      { watchId: 'seiko-spb317', status: 'front-runner', notes: 'Mine' },
      { watchId: 'seiko-spb451', status: 'owned' },
      { watchId: 'seiko-spb519', status: 'considering' },
      { watchId: 'seiko-srpe03', status: 'ruled-out' },
    ]) };
    const s = normalise(old);
    expect(s.shortlist).toEqual([
      { watchId: 'seiko-spb317', liked: true, notes: 'Mine' },
      { watchId: 'seiko-spb451', owned: true },
      { watchId: 'seiko-spb519' },
      { watchId: 'seiko-srpe03' },
    ]);
    expect([s.compare, s.currency]).toEqual([['seiko-spb451'], 'EUR']);
    expect(normalise(s)).toEqual(s);
    expect(normalise(normalise(s))).toEqual(s);
  });
  test('boxes keep only owned watches, once each, and there is always one', () => {
    const base = { ...starterState(), shortlist: [{ watchId: 'seiko-spb317', owned: true }, { watchId: 'seiko-spb451' }] };
    const load = (boxes: unknown) => normalise({ ...base, boxes } as Parameters<typeof normalise>[0]).boxes;
    expect(load([{ id: 'b', name: 'Box', slots: ['seiko-spb317', 'seiko-spb451', 'seiko-spb317', 7, null] }])[0].slots)
      .toEqual(['seiko-spb317', null, null, null, null]);
    for (const bad of [undefined, [], 'box', [{ id: 'b' }]]) expect(load(bad)).toEqual([{ id: 'box-1', name: 'Watch box', slots: Array(8).fill(null) }]);
    // The original six-slot default box grows to eight with its watch in place, once.
    const grown = load([{ id: 'box-1', name: 'Watch box', slots: [null, 'seiko-spb317', null, null, null, null] }]);
    expect(grown[0].slots).toEqual([null, 'seiko-spb317', null, null, null, null, null, null]);
    expect(load(grown)[0].slots).toHaveLength(8);
  });
});
