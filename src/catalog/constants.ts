// Kept apart from schema.ts so app code can use them without bundling the schema library.
export const BRACELET_STYLES = ['oyster', 'jubilee', 'beads', 'president', 'mesh'] as const;
export const RUBBER_STYLES = ['smooth', 'tropic', 'waffle', 'wave', 'panels', 'ribbed'] as const;

/** Currencies a visitor can show prices in. */
export const DISPLAY_CURRENCIES = ['AUD', 'EUR', 'USD', 'CNY', 'JPY'] as const;
/** Currencies a catalogue price can be recorded in: the display ones plus makers' home currencies. Each needs a rate in rates.json. */
export const PRICE_CURRENCIES = [...DISPLAY_CURRENCIES, 'GBP', 'CHF'] as const;
/**
 * Where a price came from. `manufacturer-converted` is a maker's site converting automatically into the visitor's
 * currency; it's kept for the record but never shown as an official price or converted from.
 */
export const PRICE_SOURCES = ['manufacturer', 'archived-manufacturer', 'press-release', 'secondary', 'manufacturer-converted'] as const;

/** Parts of a watch that can carry lume: hour and minute hands, dial markers and numerals, the bezel, the seconds hand, chronograph subdial hands. */
export const LUME_PARTS = ['hands', 'indices', 'bezel', 'seconds', 'subdials'] as const;
