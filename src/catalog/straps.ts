import { BRACELET_STYLES, RUBBER_STYLES } from './constants';
import type { Strap, StrapPresets } from './schema';
import presets from '../../catalog/straps.json';

/** Colour presets for the strap picker. Checked against StrapPresetsSchema in the tests. */
export const STRAP_PRESETS = presets as StrapPresets;

export const BRACELET_NAMES: Record<(typeof BRACELET_STYLES)[number], string> = {
  oyster: 'Oyster', jubilee: 'Jubilee', beads: 'Beads of rice', president: 'President', mesh: 'Mesh',
};
export const RUBBER_NAMES: Record<(typeof RUBBER_STYLES)[number], string> = { smooth: 'Smooth', tropic: 'Tropic', waffle: 'Waffle', wave: 'Wave', panels: 'Textured panels' };

/** One of each kind of strap, for the gallery. */
export function sampleStraps(): Strap[] {
  return [
    ...BRACELET_STYLES.map((style): Strap => ({ type: 'bracelet', style, centre: 'polished' })),
    { type: 'bracelet', style: 'oyster', centre: 'brushed' },
    ...STRAP_PRESETS.nato.map((p): Strap => ({ type: 'nato', colors: p.colors, name: 'NATO, ' + p.name })),
    ...RUBBER_STYLES.map((style): Strap => ({ type: 'rubber', style, color: STRAP_PRESETS.rubber[0].color })),
    { type: 'rubber', style: 'tropic', color: STRAP_PRESETS.rubber[2].color, name: 'Tropic, orange' },
    ...STRAP_PRESETS.leather.map((p): Strap => ({ type: 'leather', color: p.color, stitch: p.stitch, name: p.name })),
    { type: 'nylon', color: '#6B5640', name: 'Nylon, brown' },
  ];
}
