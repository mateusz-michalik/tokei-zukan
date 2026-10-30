import { describe, expect, test } from 'vitest';
import { CATALOG } from '../catalog';
import { StrapPresetsSchema } from '../catalog/schema';
import { sampleStraps, STRAP_PRESETS } from '../catalog/straps';
import { spb253Case } from './spb253';
import { spb255Case } from './spb255';
import { spb451Case } from './spb451';
import { srpk01Case } from './srpk01';
import { ssc947Case } from './ssc947';
import { mk2395Case } from './mk2395';
import { c60300Case } from './c60300';
import { oris771Case } from './oris771';
import { serica5303Case } from './serica5303';
import { ssk003Case } from './ssk003';
import { spb507Case } from './spb507';
import { srpb43Case } from './srpb43';
import { watchSVG } from './watch';
import { wristSVG } from './wrist';

const broken = /NaN|undefined|Infinity/;

describe('renderer', () => {
  test('strap presets match the schema', () => {
    expect(() => StrapPresetsSchema.parse(STRAP_PRESETS)).not.toThrow();
  });
  test('every catalogue watch draws cleanly on every kind of strap', () => {
    for (const w of CATALOG) {
      for (const strap of sampleStraps()) {
        const svg = watchSVG(w, 5, { strapLen: 16, strap });
        expect(svg, `${w.id} on ${JSON.stringify(strap)}`).not.toMatch(broken);
      }
      expect(wristSVG(w, 15, CATALOG[0]), w.id).not.toMatch(broken);
      // Gradient, pattern and clip ids must not collide between the strap and the watch's own drawing.
      for (const strap of sampleStraps()) {
        const ids = [...watchSVG(w, 5, { strapLen: 16, strap }).matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
        expect(ids.filter((x, i) => ids.indexOf(x) !== i), `${w.id} on ${strap.type}`).toEqual([]);
      }
      expect(watchSVG(w, 5, { outline: true }), w.id).not.toMatch(broken);
    }
  });
  test.each(['seiko-spb317', 'seiko-ssc947', 'seiko-spb151', 'seiko-spb257', 'seiko-spb451', 'seiko-spb519', 'seiko-srpk01', 'seiko-srpe03', 'seiko-spb253', 'seiko-spb255', 'baltic-mk2-39-5', 'christopher-ward-c60-pro-300', 'oris-01-733-7707', 'serica-5303-1', 'seiko-ssk003', 'seiko-spb507', 'seiko-srpb43'])('the detailed %s stays within the comparison SVG budget', id => {
    const watch = CATALOG.find(w => w.id === id)!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    // Bound both DOM complexity and markup size, independently of display resolution.
    expect((svg.match(/<[a-zA-Z]/g) ?? []).length).toBeLessThan(320);
    expect(new TextEncoder().encode(svg).length).toBeLessThan(50_000);
  });
  test('the SPB519 has its GMT furniture and 4 oclock date', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-spb519')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>GMT</text>');
    expect(svg).toContain('>23</text>');
    expect(svg).toContain('rotate(30) translate(20.65 0)');
    expect(svg).toContain('>6</text>');
  });
  test('the SSK003 has its 24-hour bezel and rehaut, cyclops date, red lumed GMT arrow and guarded 4 oclock crown', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-ssk003')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>GMT</text>');
    expect(svg).toContain('>Automatic</text>');
    expect(svg).toContain('>22</text>');
    expect(svg).toContain('>24</text>');
    expect(svg).toContain('>6</text>');
    expect(svg).toContain('fill="#C9202A"');
    expect(svg).toContain('rotate(23.8)');
    // The GMT arrow's lume glows with the hands.
    expect(svg).toMatch(/data-hand="hour24"[^]*?data-lume="hands"/);
    expect(svg).not.toContain('DIVER');
  });
  test('only the SSK003 draws its jubilee as the five-row bracelet with a divided end link', () => {
    const jubilee = { type: 'bracelet', style: 'jubilee', centre: 'polished' } as const;
    const ssk = watchSVG(CATALOG.find(w => w.id === 'seiko-ssk003')!, 8, { strapLen: 12 });
    // Five end-link pieces per side, each a square-cornered rect.
    expect(ssk.match(/<rect [^>]*rx=".25"/g)?.length).toBeGreaterThanOrEqual(10);
    expect(watchSVG(CATALOG.find(w => w.id === 'seiko-spb519')!, 8, { strapLen: 12, strap: jubilee })).not.toContain('rx=".25"');
  });
  test('the SSK003 case outline is closed with 22 mm openings', () => {
    const { d } = ssk003Case(42.5, 46, 22);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M11,-19.562');
    expect(d).toContain('V-19.562Q0');
    expect(d).not.toMatch(broken);
  });
  test('the SPB507 has its compass ring, numerals, date at 3 and crocodile-grain strap', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-spb507')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>Alpinist</text>');
    expect(svg).toContain('>AUTOMATIC 3 DAYS</text>');
    expect(svg).toContain('>20 BAR</text>');
    for (const t of ['N', 'NE', 'E', 'SW', '330', '150']) expect(svg).toContain(`>${t}</text>`);
    expect(svg).toContain('>6</text>');
    // The 4 o'clock crown that turns the compass ring.
    expect(svg).toContain('rotate(29)');
    expect(svg).toContain('_scr)');
    expect(svg).not.toContain('DIVER');
  });
  test('the SPB507 case outline is closed and symmetric with 20 mm openings', () => {
    const { d } = spb507Case(39.5, 46.4, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M10,-16.038');
    expect(d).toContain('L-12.126,-22.644');
    expect(d).not.toMatch(broken);
  });
  test('the SRPB43 has its Presage print, date at 3, blue seconds and no lume', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-srpb43')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>PRESAGE</text>');
    expect(svg).toContain('>AUTOMATIC</text>');
    expect(svg).toContain('>MADE IN JAPAN</text>');
    expect(svg).toContain('>6</text>');
    expect(svg).toContain('fill="#1d3d6e"');
    expect(svg).not.toContain('data-lume');
    // Dressed at night, nothing on it glows.
    expect(watchSVG(watch, 8, { lighting: 'night' })).not.toContain('filter="url(#lume');
  });
  test('the SRPB43 case outline is closed and symmetric with 20 mm openings', () => {
    const d = srpb43Case(40.5, 47.5, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M10,-17.609V-23.25');
    expect(d).toContain('-10,17.609V23.25');
    expect(d).toContain('A20.25,20.25 0 0 1 14.437,14.2');
    expect(d).toContain('A20.25,20.25 0 0 1 -14.437,-14.2');
    expect(d).not.toMatch(broken);
  });
  test('the SRPK01 has its PADI furniture and day/date magnifier', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-srpk01')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>PADI</text>');
    expect(svg).toContain('>MON</text>');
    expect(svg).toContain('>6</text>');
    expect(svg).toContain('fill="#1CA9DC"');
    expect(svg).toContain('rotate(24) translate(21.5 0)');
  });
  test('the SRPE03 keeps its black-and-gold edition details distinct from the PADI', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-srpe03')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>MON</text>');
    expect(svg).toContain('>6</text>');
    expect(svg).toContain('fill="#B79A62"');
    expect(svg).toContain('stroke="#c3ccc6"');
    expect(svg).toContain('tile)');
    expect(svg).not.toContain('>PADI</text>');
    expect(svg).not.toContain('fill="#1CA9DC"');
  });
  test('the King Turtle case outline is closed and symmetric with 22 mm openings', () => {
    const { d } = srpk01Case(45, 47.7, 22);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M11,-19.433');
    expect(d).not.toMatch(broken);
  });
  test('the SPB257 shares the Black Series bezel, dial, hand and Seichu strap palette', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-spb257')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('fill="#F4A12A"');
    expect(svg).toContain('fill="#E85A34"');
    expect(svg).toContain('fill="#B5BCBD"');
    expect(svg).toContain('fill="#E4E7DE"');
    expect(svg).toContain('>SEIKO</text>');
  });
  test('the SPB253 has its black-series bezel, date at 3 and orange minute hand', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-spb253')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('DIVER’S 200m');
    expect(svg).not.toContain('300m');
    expect(svg).toContain('>AUTOMATIC</text>');
    expect(svg).toContain('fill="#F4A12A"');
    expect(svg).toContain('>6</text>');
    expect(svg).toContain('>10</text>');
  });
  test('the 1965 black-series case outline is closed and symmetric', () => {
    const { d } = spb253Case(40.5, 47.6, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('A20.25,20.25');
    expect(d).not.toMatch(broken);
    const ends = [...d.matchAll(/[MLQCA][^MLQCAZ]*/g)].flatMap(m => {
      const nums = m[0].match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      return nums.length >= 2 ? [nums.slice(-2)] : [];
    });
    const xs = ends.map(([x]) => x);
    expect(Math.max(...xs)).toBeCloseTo(-Math.min(...xs), 1);
  });
  test('the SPB255 has its 1968 black-series bezel, 4 oclock crown and date at 3', () => {
    const watch = CATALOG.find(w => w.id === 'seiko-spb255')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('DIVER’S 200m');
    expect(svg).not.toContain('300m');
    expect(svg).not.toContain('>GMT</text>');
    expect(svg).toContain('rotate(28) translate(20.65 0)');
    expect(svg).toContain('fill="#F4A12A"');
    expect(svg).toContain('fill="#E85A34"');
    expect(svg).toContain('>6</text>');
    expect(svg).toContain('>20</text>');
  });
  test('the 1968 black-series case outline is closed and symmetric with 20 mm openings', () => {
    const { d } = spb255Case(42, 48.8, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M10,-19.593');
    expect(d).not.toMatch(broken);
    const ends = [...d.matchAll(/[MLQCA][^MLQCAZ]*/g)].flatMap(m => {
      const nums = m[0].match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      return nums.length >= 2 ? [nums.slice(-2)] : [];
    });
    const xs = ends.map(([x]) => x);
    expect(Math.max(...xs)).toBeCloseTo(-Math.min(...xs), 1);
  });
  test('the heritage diver case outline is closed and symmetric', () => {
    const { d } = spb451Case(40, 46.4, 20);
    expect(d.endsWith('Z')).toBe(true);
    const ends = [...d.matchAll(/[MLQCA][^MLQCAZ]*/g)].flatMap(m => {
      const nums = m[0].match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      return nums.length >= 2 ? [nums.slice(-2)] : [];
    });
    const xs = ends.map(([x]) => x);
    expect(Math.max(...xs)).toBeCloseTo(-Math.min(...xs), 1);
    expect(d).toContain('A20,20');
  });
  test('the Speedtimer case outline is closed, symmetric and has no zero-length arcs', () => {
    const { d } = ssc947Case(20.7, 45.9, 21);
    const nums = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0);
    expect(Math.max(...xs)).toBeCloseTo(-Math.min(...xs), 1);
    // Each arc must end somewhere other than where it starts.
    const pts = [...d.matchAll(/([LQCA])([^LQCAZ]+)/g)].map(m => ({ cmd: m[1], end: m[2].trim().split(/[ ,]+/).slice(-2).map(Number) }));
    pts.forEach((p, i) => {
      if (p.cmd !== 'A' || i === 0) return;
      const prev = pts[i - 1].end;
      expect(Math.hypot(p.end[0] - prev[0], p.end[1] - prev[1])).toBeGreaterThan(1);
    });
  });
  test('the Baltic Aquascaphe MK2 39.5 has its sapphire bezel numerals, railway track and blue FKM tropic strap', () => {
    const watch = CATALOG.find(w => w.id === 'baltic-mk2-39-5')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>BALTIC</text>');
    expect(svg).toContain('>AQUASCAPHE</text>');
    expect(svg).toContain('>200M</text>');
    expect(svg).toContain('>15</text>');
    expect(svg).toContain('>30</text>');
    expect(svg).toContain('>45</text>');
    expect(svg).toContain('>55</text>');
    expect(svg).toContain('#3E5A6F');
  });
  test('the Baltic Aquascaphe MK2 39.5 case outline is closed with 20 mm lug openings and flat-top crown guards', () => {
    const { d } = mk2395Case(39.5, 47, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M10,-17.997');
    expect(d).toContain('L-10,-17.997');
    expect(d).not.toMatch(broken);
  });
  test('the Christopher Ward C60 Trident Pro 300 has its two-part bezel, twin-flags logo, date at 6 and Trident seconds hand', () => {
    const watch = CATALOG.find(w => w.id === 'christopher-ward-c60-pro-300')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>AUTOMATIC</text>');
    expect(svg).toContain('>300m|1000ft</text>');
    expect(svg).toContain('>8</text>');
    expect(svg).toContain('>55</text>');
    expect(svg).toContain('>SWISS</text>');
    expect(svg).toContain('#E03A2E');
  });
  test('the Christopher Ward C60 Trident Pro 300 case outline is closed with 20 mm lug openings', () => {
    const { d } = c60300Case(40, 47.45, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M10,-18.625');
    expect(d).toContain('L-10,-18.625');
    expect(d).not.toMatch(broken);
  });
  test('the Oris Divers Sixty-Five Chronograph has its bicompax registers, pump pushers, shield 12 and 10BAR/100M text', () => {
    const watch = CATALOG.find(w => w.id === 'oris-01-733-7707')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>ORIS</text>');
    expect(svg).toContain('>WATER RESISTANT</text>');
    expect(svg).toContain('>10BAR / 100M</text>');
    expect(svg).toContain('>60</text>');
    expect(svg).toContain('>45</text>');
    expect(svg).toContain('>30</text>');
    expect(svg).toContain('>15</text>');
  });
  test('the Oris Divers Sixty-Five Chronograph case outline is closed with 20 mm lug openings', () => {
    const { d } = oris771Case(40, 48, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M10,-18.629');
    expect(d).toContain('L-10,-18.629');
    expect(d).not.toMatch(broken);
  });
  test('the Serica 5303-1 has its double-graduation bezel, CHRONOMÈTRE printing and integrated mesh end link', () => {
    const watch = CATALOG.find(w => w.id === 'serica-5303-1')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    expect(svg).toContain('>CHRONOMÈTRE</text>');
    // SERICA and SWISS are set letter by letter along the lower track.
    expect(svg).toMatch(/>S<\/text><text[^>]*>E<\/text><text[^>]*>R<\/text><text[^>]*>I<\/text>/);
    expect(svg).toMatch(/>S<\/text><text[^>]*>W<\/text><text[^>]*>I<\/text>/);
    expect(svg).toContain('>40</text>');
    expect(svg).toContain('>11</text>');
    expect(svg).toContain('>H</text>');
    expect(svg).toContain('-1000<tspan font-style="italic">ft</tspan></text>');
    // Hinged polished centre bar of the woven bracelet's end link.
    expect(svg).toContain('width="15.2"');
  });
  test('the Serica 5303-1 case outline is closed with 20 mm lug openings', () => {
    const { d } = serica5303Case(39, 46.5, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).toContain('M10,-18.129');
    expect(d).toContain('L-10,-18.129');
    expect(d).not.toMatch(broken);
  });
  test('a watch without a strap set falls back to a leather strap in its legacy colour', () => {
    const svg = watchSVG({ diameter: 40, look: { strap: '#123456' } });
    expect(svg).toContain('#123456');
  });
});
