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
import { h69439931Case } from './h69439931';
import { omega31030425001001Case } from './omega31030425001001';
import { rolex1240600001Case } from './rolex1240600001';
import { m7939a1a0nu0001Case } from './m7939a1a0nu0001';
import { nj015056lCase } from './nj015056l';
import { watchSVG } from './watch';
import { FINISH } from './strap';
import { shade } from '../lib/util';
import { wristSVG } from './wrist';

const broken = /NaN|undefined|Infinity/;

/**
 * Attributes without a value, which browsers forgive in HTML but break the SVG as XML: the build's preview images
 * (scripts/share-previews.mjs) parse it strictly. Returns the offending tags.
 */
const bareAttributes = (svg: string) => [...svg.matchAll(/<[a-zA-Z][^>]*>/g)].map(m => m[0])
  .filter(tag => tag.replace(/"[^"]*"/g, '""').replace(/^<[\w:-]+|\/?>$/g, '').trim().split(/\s+/).some(t => t && !/^[\w:-]+=""$/.test(t)));

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
      for (const lighting of ['day', 'dusk', 'night'] as const) expect(bareAttributes(watchSVG(w, 5, { lighting })), `${w.id} at ${lighting}`).toEqual([]);
    }
  });
  test.each(['seiko-spb317', 'seiko-ssc947', 'seiko-spb151', 'seiko-spb257', 'seiko-spb451', 'seiko-spb519', 'seiko-srpk01', 'seiko-srpe03', 'seiko-spb253', 'seiko-spb255', 'baltic-mk2-39-5', 'christopher-ward-c60-pro-300', 'oris-01-733-7707', 'serica-5303-1', 'seiko-ssk003', 'seiko-spb507', 'seiko-srpb43', 'casio-f-91w-1', 'casio-a168wa-1w', 'casio-dw-5600ue-1', 'hamilton-h69439931', 'omega-310-30-42-50-01-001', 'rolex-124060-0001', 'tudor-m7939a1a0nu-0001', 'citizen-nj0150-56l'])('the detailed %s stays within the comparison SVG budget', id => {
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
  test('the Khaki Field has lume only on its triangles and hands, drawn numerals and a leather-tipped NATO', () => {
    const watch = CATALOG.find(w => w.id === 'hamilton-h69439931')!;
    const svg = watchSVG(watch, 8, { strapLen: 16 });
    for (const t of ['HAMILTON', 'SWISS', 'MADE']) expect(svg).toContain(`>${t}</text>`);
    // Numerals are drawn strokes, not a font, and aren't lume: only the triangles are, besides the hands.
    expect(svg).not.toMatch(/>\d+<\/text>/);
    expect([...svg.matchAll(/data-lume="indices"/g)]).toHaveLength(1);
    expect(svg).toMatch(/fill="#D8C9A3" data-lume="indices"/);
    expect(svg).toContain('data-lume="seconds"');
    // Leather tabs sit at fixed places on the strap: 12.4 mm past the lugs, so a short strap doesn't show them.
    expect(svg).toContain('fill="#6B4327"');
    expect(watchSVG(watch, 8, { strapLen: 10 })).not.toContain('fill="#6B4327"');
    expect(svg).not.toContain('_sk)');
  });
  test('the Khaki Field case is closed and symmetric, with 20 mm openings and 47 mm lug to lug', () => {
    const d = h69439931Case(38, 47, 20);
    expect(d.endsWith('Z')).toBe(true);
    // Lug openings at ±10, 2.45 mm lug tips ending at ±23.5, and flanks meeting the case at ±15.6, on all four lugs.
    expect(d.startsWith('M10,-16.155V-23.05')).toBe(true);
    for (const pt of ['12.45,-22.75', '-12.45,-22.75', '12.45,22.75', '-12.45,22.75', '15.6,-10.846', '-15.6,10.846']) expect(d).toContain(pt);
    expect(d).not.toMatch(broken);
  });
  test('the Speedmaster has its tachymeter, step dial furniture, three registers and lume', () => {
    const watch = CATALOG.find(w => w.id === 'omega-310-30-42-50-01-001')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    for (const t of ['OMEGA', 'Speedmaster', 'PROFESSIONAL']) expect(svg).toContain(`>${t}</text>`);
    expect(svg).toContain('>TACHYMÈTRE</textPath>');
    expect(svg).toContain('>SWISS MADE</textPath>');
    // Running seconds at 9, and the 30-minute and 12-hour counters at 3 and 6, all at rest.
    expect(svg).toContain('data-hand="small-seconds" data-beats="6" transform="translate(-6.95 0) rotate(0)"');
    expect(svg).toContain('data-hand="chrono" transform="translate(6.95 0) rotate(0)"');
    expect(svg).toContain('data-hand="chrono" transform="translate(0 6.95) rotate(0)"');
    // Lume on the batons and 12 o'clock dots, the hour and minute stripes and the chronograph hand's lozenge; none on the registers.
    expect(svg).toContain('data-lume="indices"');
    expect(svg.match(/data-lume="hands"/g)).toHaveLength(2);
    expect(svg.match(/data-lume="seconds"/g)).toHaveLength(1);
    expect(svg).not.toContain('data-lume="subdials"');
    // The pushers point outwards from the crown: the upper one up and to the right, the lower one down.
    expect(svg).toContain('translate(18.31 -8.4) rotate(-23)');
    expect(svg).toContain('translate(18.31 8.4) rotate(23)');
  });
  test('the Speedmaster bracelet has two narrow polished rows between brushed links, on this watch only', () => {
    const speedy = watchSVG(CATALOG.find(w => w.id === 'omega-310-30-42-50-01-001')!, 8, { strapLen: 12 });
    // Five end-link pieces per side; the second and fourth are polished.
    const pieces = [...speedy.matchAll(/<rect [^>]*rx=".25" fill="url\(#w\d+_s(\w)\)"/g)].map(m => m[1]);
    expect(pieces.slice(0, 5)).toEqual(['o', 'p', 'o', 'p', 'o']);
    const ssk = watchSVG(CATALOG.find(w => w.id === 'seiko-ssk003')!, 8, { strapLen: 12 });
    expect([...ssk.matchAll(/<rect [^>]*rx=".25" fill="url\(#w\d+_s(\w)\)"/g)].map(m => m[1]).slice(0, 5)).toEqual(['o', 'p', 'p', 'p', 'o']);
    // Arched links only on the Speedmaster.
    expect(speedy).toContain('_sa)');
    expect(ssk).not.toContain('_sa)');
  });
  test('the Speedmaster case is closed and symmetric, with 20 mm openings and 47.5 mm lug to lug', () => {
    const d = omega31030425001001Case(42, 47.5, 20);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).not.toMatch(broken);
    // The lug openings run straight up the inner edges at ±10 to the tips at ±23.75, on all four lugs.
    for (const pt of ['10,-23.45', '10,23.45', '-10,23.45', '-10,-23.45']) expect(d).toContain(pt);
    // Widest at 9 (21 mm), and wider on the crown side for the guards.
    expect(d).toContain('-20.995,0');
    expect(d).toContain('21.323,-4.066');
  });
  test('the Submariner has its no-date dial, Mercedes handset, platinum bezel figures and Chromalight', () => {
    const watch = CATALOG.find(w => w.id === 'rolex-124060-0001')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    for (const t of ['ROLEX', 'OYSTER PERPETUAL', 'SUBMARINER', 'SUPERLATIVE CHRONOMETER', 'OFFICIALLY CERTIFIED']) expect(svg).toContain(`>${t}</text>`);
    // No date window: the 3 o'clock marker is a full baton like the 6 and 9.
    expect(watch.look.date).toBe('');
    // The bezel figures are drawn strokes, not a font, at 10 to 50.
    expect(svg).not.toMatch(/>[1-5]0<\/text>/);
    for (const a of [60, 120, 180, 240, 300]) expect(svg).toContain(`transform="rotate(${a})"/>`);
    // Chromalight on the markers, both hands, the seconds dot and the bezel pip, and nowhere else.
    expect(svg.match(/data-lume="indices"/g)).toHaveLength(1);
    expect(svg.match(/data-lume="hands"/g)).toHaveLength(2);
    expect(svg.match(/data-lume="seconds"/g)).toHaveLength(1);
    expect(svg.match(/data-lume="bezel"/g)).toHaveLength(1);
    expect(svg).toContain('data-hand="second" data-beats="8" transform="rotate(185.4)"');
  });
  test('only the Submariner draws its Oyster bracelet with long, flat-shaded links', () => {
    const sub = watchSVG(CATALOG.find(w => w.id === 'rolex-124060-0001')!, 8, { strapLen: 30 });
    const c60 = watchSVG(CATALOG.find(w => w.id === 'christopher-ward-c60-pro-300')!, 8, { strapLen: 30 });
    // Link heights on the outer rows: the 8.8 mm pitch less its wider 0.34 mm joint, against the shared 5.2 mm less 0.2.
    expect(sub).toContain('height="8.46" rx="0.15" fill="url(#');
    expect(c60).not.toContain('height="8.46"');
    expect(c60).toContain('height="5"');
    // Flat faces lit from above, with edges rolling off at the sides, on the Submariner only.
    expect(sub).toMatch(/fill="url\(#w\d+_sf\)"/);
    expect(sub).toMatch(/fill="url\(#w\d+_se\)"/);
    expect(c60).not.toMatch(/_s[fe]\)/);
  });
  test('the Submariner case is closed and symmetric, with 21 mm openings and 47.6 mm lug to lug', () => {
    const d = rolex1240600001Case(41, 47.6, 21);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).not.toMatch(broken);
    // Lug openings run straight up the inner edges at ±10.5 to flat tips at ±23.8, on all four lugs.
    for (const pt of ['10.5,-23.55', '10.5,23.55', '-10.5,23.55', '-10.5,-23.55', '10.75,-23.8', '-10.75,23.8']) expect(d).toContain(pt);
    // Crown guards with flat faces 22.4 mm out on the right only, the crown recess between them, and the plain side at 9.
    for (const pt of ['22.4,-6.618', '22.4,3.873', '20.75,0', '-20.4,0']) expect(d).toContain(pt);
    expect(d).not.toContain('-22.4,');
  });
  test('the Black Bay 58 has its gilt dial print, red zero triangle, snowflake hand and lume', () => {
    const watch = CATALOG.find(w => w.id === 'tudor-m7939a1a0nu-0001')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    for (const t of ['TUDOR', 'GENEVE', 'MASTER CHRONOMETER', 'SWISS MADE']) expect(svg).toContain(`>${t}</text>`);
    // The bezel figures are drawn strokes at 10 to 50, and the zero triangle is red.
    expect(svg).not.toMatch(/>[1-5]0<\/text>/);
    expect(svg).toContain('<path d="M-2.4,-18.5H2.4L0,-15.45Z" fill="#A3283A"/>');
    // The snowflake: a square on its corner, 4.5 mm across, 6 mm out.
    expect(svg).toContain('L-2.25,-6L');
    // Lume on the markers, both hands, the seconds dot and the bezel pip.
    expect(svg.match(/data-lume="indices"/g)).toHaveLength(1);
    expect(svg.match(/data-lume="hands"/g)).toHaveLength(2);
    expect(svg.match(/data-lume="seconds"/g)).toHaveLength(1);
    expect(svg.match(/data-lume="bezel"/g)).toHaveLength(1);
    expect(svg).toContain('data-hand="second" data-beats="8" transform="rotate(228.3)"');
  });
  test('only the Black Bay 58 draws its five-link bracelet with flat mirror rows round a middle row of pills', () => {
    const bb = watchSVG(CATALOG.find(w => w.id === 'tudor-m7939a1a0nu-0001')!, 8, { strapLen: 12 });
    const ssk = watchSVG(CATALOG.find(w => w.id === 'seiko-ssk003')!, 8, { strapLen: 12 });
    // The end link has only its two outer pieces; the polished rows run on through it to the case.
    expect([...bb.matchAll(/<rect [^>]*rx=".25" fill="url\(#w\d+_s(\w+)\)"/g)].map(m => m[1]).slice(0, 2)).toEqual(['ms', 'ms']);
    // Flat mirror rows either side of the middle row's pills: the pills stand apart with 0.5 mm gaps, the flat
    // rows' lines are 0.14 mm.
    expect(bb).toMatch(/height="5.1" rx="0.3" fill="url\(#w\d+_smc\)"/);
    expect(bb).toMatch(/height="5.46" rx="0.08" fill="url\(#w\d+_sml\)"/);
    expect(ssk).not.toMatch(/_sm[lcs]\)/);
  });
  test('the Black Bay 58 case is closed and symmetric, with 20 mm openings, no crown guards and its catalogue lug to lug', () => {
    const w = CATALOG.find(x => x.id === 'tudor-m7939a1a0nu-0001')!;
    const d = m7939a1a0nu0001Case(w.diameter, w.lugToLug!, w.lugWidth!);
    const H = +(w.lugToLug! / 2).toFixed(3);
    expect(d.endsWith('Z')).toBe(true);
    expect(d).not.toMatch(broken);
    // Lug openings run straight up the inner edges at ±10 to flat tips at ±H, on all four lugs.
    for (const pt of [`10,${-H + .25}`, `10,${H - .25}`, `-10,${H - .25}`, `-10,${-H + .25}`, `10.25,${-H}`, `-10.25,${H}`]) expect(d).toContain(pt);
    // The same side at 3 and 9: no guards.
    expect(d).toContain('19.3,0');
    expect(d).toContain('-19.3,0');
  });
  test('the Tsuyosa has its dial print, magnified date, 4 oclock crown and lume', () => {
    const watch = CATALOG.find(w => w.id === 'citizen-nj0150-56l')!;
    const svg = watchSVG(watch, 8, { strapLen: 12 });
    for (const t of ['CITIZEN', 'AUTOMATIC', '7']) expect(svg).toContain(`>${t}</text>`);
    // The crown sits in a recess in the lower right flank, square to it, with the access notch below it.
    expect(svg.match(/transform="translate\(16\.296 12\.6\) rotate\(25\.6\)"/g)).toHaveLength(3);
    // Lume on the batons and hour squares, and on both hands' strips; none on the seconds hand.
    expect(svg.match(/data-lume="indices"/g)).toHaveLength(2);
    expect(svg.match(/data-lume="hands"/g)).toHaveLength(2);
    expect(svg).not.toContain('data-lume="seconds"');
    expect(svg).toContain('data-hand="second" data-beats="6" transform="rotate(208)"');
    // Without a date the short baton at 3 becomes a full one.
    const noDate = watchSVG({ ...watch, look: { ...watch.look, date: '' } }, 8);
    expect(noDate).not.toContain('>7</text>');
  });
  test('the Tsuyosa case is closed and symmetric, with flat horn tips at its lug to lug and the fixed centre links past them', () => {
    const w = CATALOG.find(x => x.id === 'citizen-nj0150-56l')!;
    const d = nj015056lCase(w.diameter, w.lugToLug!);
    const H = w.lugToLug! / 2;
    expect(d.endsWith('Z')).toBe(true);
    expect(d).not.toMatch(broken);
    for (const pt of [`11.25,${-H}`, `-11.25,${-H}`, `11.25,${H}`, `-11.25,${H}`, '20,0', '-20,0']) expect(d).toContain(pt);
    // The centre links are 9.1 mm wide and end 2 mm past the horns, in the outline too.
    const outline = watchSVG(w, 8, { outline: true });
    expect(outline).toContain(`H4.15Q4.55,${-H - 2.15} 4.55,${-H - 1.75}`);
    expect(outline).toContain(`viewBox="-24 ${-H - 2.5} 48 ${2 * H + 5}"`);
  });
  test('only the Tsuyosa splits its polished centre links into a block and a bridge, with creased brushed outer links', () => {
    const ts = watchSVG(CATALOG.find(w => w.id === 'citizen-nj0150-56l')!, 8, { strapLen: 12 });
    const rolex = watchSVG(CATALOG.find(w => w.id === 'rolex-124060-0001')!, 8, { strapLen: 12 });
    // A 2.25 mm block and a 1.75 mm bridge in every 4 mm of the centre row, in line with the outer links.
    expect(ts).toMatch(/height="2.05" rx="0.3" fill="url\(#w\d+_smc\)"/);
    expect(ts).toMatch(/height="1.55" rx="0.08" fill="url\(#w\d+_sml\)"/);
    expect(ts).toMatch(/height="3.8" rx="0.3" fill="url\(#w\d+_smk\)"/);
    // Only the outer rows and the end links are brushed, on each side of the case: none of the polished centre.
    expect(ts.match(/fill="url\(#w\d+_sh\)"/g)).toHaveLength(6);
    expect(rolex).not.toMatch(/_sm[lck]\)/);
  });
  test('every bracelet draws its joints in the same shared finish', () => {
    const joint = shade('#C6CACD', FINISH.joint);
    for (const id of ['seiko-ssk003', 'tudor-m7939a1a0nu-0001', 'rolex-124060-0001', 'omega-310-30-42-50-01-001']) {
      const w = CATALOG.find(x => x.id === id)!;
      const svg = watchSVG({ ...w, look: { ...w.look, caseColor: '#C6CACD' } }, 8, { strapLen: 12 });
      expect(svg, id).toContain(`fill="${joint}"`);
    }
  });
  test('every bezel case drops the same shadow from its bezel, once, and only away from outlines', () => {
    // The Casio digitals have no bezel; the SRPB43's sloping bezel and the Khaki Field's stepped one are part of the case.
    const shadow = /<circle r="[\d.]+" fill="none" stroke="#000" stroke-width="1.1" opacity=".16" transform="translate\(.12 .2\)"\/>/g;
    for (const w of CATALOG.filter(x => !['casio-f-91w-1', 'casio-a168wa-1w', 'casio-dw-5600ue-1', 'seiko-srpb43', 'hamilton-h69439931'].includes(x.id))) {
      expect(watchSVG(w, 8).match(shadow), w.id).toHaveLength(1);
      expect(watchSVG(w, 8, { outline: true }), w.id).not.toMatch(shadow);
    }
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
