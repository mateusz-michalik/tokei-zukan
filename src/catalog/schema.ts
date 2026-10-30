import { z } from 'zod';
import { BRACELET_STYLES, LUME_PARTS, PRICE_CURRENCIES, PRICE_SOURCES, RUBBER_STYLES } from './constants';

const hex = z.string().regex(/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/, 'Expected a hex colour like #1F3E8C');

/** How a watch is drawn. Every field is optional; missing ones fall back to DEFAULT_LOOK. */
export const LookSchema = z.object({
  shape: z.enum(['round', 'cushion', 'willard', 'willard-modern', 'speedtimer', 'heritage', 'heritage-gmt', 'srpk01', 'srpe03', 'spb253', 'spb255', 'mk2-39-5', 'c60-pro-300', 'oris-771', 'serica-5303', 'ssk003', 'spb507', 'srpb43', 'f91w', 'h69439931']),
  caseColor: hex,
  dial: hex,
  dialFinish: z.enum(['matte', 'sunburst']),
  bezelType: z.enum(['diver', 'fixed', 'smooth']),
  bezel: hex,
  bezel2: z.union([hex, z.literal('')]),
  bezelSplit: z.number(),
  bezelText: hex,
  lume: hex,
  hands: z.enum(['sword', 'baton', 'dauphine']),
  handColor: hex,
  accent: hex,
  minuteLume: z.union([hex, z.literal('')]),
  markers: z.enum(['bars', 'dots']),
  date: z.enum(['', '3', '4.5', '6']),
  crown: z.enum(['3', '4', '9']),
  pushers: z.boolean(),
  subdials: z.union([z.literal(0), z.literal(2), z.literal(3)]),
  subdialColor: hex,
  chapter: z.boolean(),
  /** Chapter ring marks: fine ticks, or a dot at every minute. */
  chapterMarks: z.enum(['ticks', 'dots']),
  /** Width of a dotted chapter ring, as a fraction of the dial opening's radius. */
  chapterWidth: z.number().min(.05).max(.3),
  /** Where the bezel insert ends, as a fraction of the bezel radius. 0 picks a default for the bezel type. */
  bezelInner: z.number().min(0).max(.97),
  /** Colour of the lume dot on the seconds hand; blank uses the seconds hand colour. */
  secondsDot: z.union([hex, z.literal('')]),
  /** Legacy: a plain strap colour, used only when a watch has no `strap`. */
  strap: hex,
}).partial().strict();


/** A strap or bracelet. `name` is a short colour or variant name shown in the picker. */
export const StrapSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('bracelet'),
    style: z.enum(BRACELET_STYLES),
    /** Finish of the centre links. Outer links are always brushed. */
    centre: z.enum(['brushed', 'polished']).optional(),
    /** Metal colour; defaults to the case colour. */
    metal: hex.optional(),
    name: z.string().optional(),
  }).strict(),
  z.object({
    type: z.literal('nato'), colors: z.array(hex).min(1), hardware: hex.optional(), name: z.string().optional(),
    /** Leather end tabs in this colour, as on Hamilton's NATO, instead of a steel keeper by the case. */
    leather: hex.optional(),
  }).strict(),
  z.object({
    type: z.literal('rubber'), style: z.enum(RUBBER_STYLES), color: hex, name: z.string().optional(),
    /** Width in mm at the case for straps with a shaped end that flares to fit the case; narrows to the lug width. */
    fitted: z.number().positive().optional(),
    /** With `fitted`: narrow in a straight line over this many mm, instead of the default quick curve. */
    fittedLength: z.number().positive().optional(),
  }).strict(),
  z.object({
    type: z.literal('leather'), color: hex, stitch: hex.optional(), name: z.string().optional(),
    /** Embossed grain, such as the SPB507's crocodile-pattern cow leather. */
    texture: z.enum(['croc']).optional(),
  }).strict(),
  /** Two-piece woven fabric strap, like Seiko's Seichu nylon. */
  z.object({ type: z.literal('nylon'), color: hex, name: z.string().optional() }).strict(),
]);

export const LinkSchema = z.object({ label: z.string(), url: z.string().url() }).strict();

/**
 * How the watch looks in the dark: the colour its lume emits and which parts carry it. Separate from `look.lume`,
 * the lume's daytime paint colour, because vintage-beige lume often glows green. Evidence is in docs/lume.md.
 */
export const NightSchema = z.object({
  /** Emitted colour, as it reads in night photos. Left out for a watch with no lume. */
  glow: hex.optional(),
  /** Empty for a watch with no lume, such as a dress watch: nothing glows. */
  parts: z.array(z.enum(LUME_PARTS)),
  /** Parts that glow in a different colour, where documented. */
  partGlow: z.partialRecord(z.enum(LUME_PARTS), hex).optional(),
  /** e.g. "LumiBrite" or "Super-LumiNova BGW9". */
  material: z.string().optional(),
  /** `documented`: maker and night photos agree. `likely`: parts documented, colour from the same material on sibling models. */
  certainty: z.enum(['documented', 'likely', 'uncertain']),
  /**
   * A digital watch's display light. It isn't lume: it glows only while a button is held, so Night shows it switched
   * on (as if pressed) and Dusk shows the display unlit. `color` is the light it gives, as night photos show it.
   */
  backlight: z.object({ kind: z.enum(['led', 'el']), color: hex }).strict().optional(),
}).strict().refine(n => !n.parts.length || n.glow, { message: 'A watch with lumed parts needs a glow colour' });

/** One recommended retail price, exactly as a source states it. See docs/pricing-standard.md. */
export const PriceSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(PRICE_CURRENCIES),
  /** Country or region code the price is for, e.g. "AU", "US", "DE", "JP". */
  market: z.string().regex(/^[A-Z]{2}$/),
  /** `current` while the maker still sells it there; `launch` for the documented price at release. */
  kind: z.enum(['current', 'launch']),
  /** The reference and strap or bracelet the price is for, when the source says. */
  variant: z.string().optional(),
  source: z.string().url(),
  sourceType: z.enum(PRICE_SOURCES),
  /** When the price was last checked against the source, YYYY-MM-DD. */
  verified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** When the price took effect or the watch launched, YYYY or YYYY-MM or YYYY-MM-DD. */
  effective: z.string().regex(/^\d{4}(-\d{2}){0,2}$/).optional(),
  /** Only set when the source says whether sales tax or VAT is included. */
  taxIncluded: z.boolean().optional(),
  note: z.string().optional(),
}).strict();

/** One catalogue model: facts about the watch, nothing personal. */
export const CatalogWatchSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  brand: z.string().min(1),
  model: z.string().min(1),
  ref: z.string().min(1),
  diameter: z.number().positive(),
  lugToLug: z.number().positive().optional(),
  thickness: z.number().positive().optional(),
  lugWidth: z.number().positive().optional(),
  /**
   * `rectangular` for a case that isn't round, like Casio's digitals: `diameter` is then its width across, and
   * `lugToLug` its overall length (Casio's "L"), shown as Width and Length.
   */
  caseShape: z.enum(['round', 'rectangular']).optional(),
  /** `digital` for an LCD: no hands, so live time sets the display instead and `beats` doesn't apply. */
  display: z.enum(['analogue', 'digital']).optional(),
  crystal: z.string().optional(),
  bezel: z.string().optional(),
  movement: z.string().optional(),
  /** Steps the seconds hand takes each second: 1 for a ticking quartz, 6 for 21,600 vph, 8 for 28,800 vph. */
  beats: z.number().int().positive().max(10).optional(),
  power: z.string().optional(),
  water: z.number().optional(),
  /** For a maker that states water resistance without a depth, such as Casio's "Water resistant": shown in its place. */
  waterNote: z.string().optional(),
  limited: z.string().optional(),
  links: z.array(LinkSchema).optional(),
  look: LookSchema,
  /** What the watch is sold on. */
  strap: StrapSchema.optional(),
  /** Other straps or bracelets the maker sells it on. */
  strapOptions: z.array(StrapSchema).optional(),
  /** Verified retail prices for what it's sold on. The first is the one other currencies are converted from. */
  prices: z.array(PriceSchema).optional(),
  night: NightSchema.optional(),
}).strict();

/** Colour presets offered in the strap picker, per strap type. */
export const StrapPresetsSchema = z.object({
  nato: z.array(z.object({ name: z.string(), colors: z.array(hex).min(1) }).strict()),
  rubber: z.array(z.object({ name: z.string(), color: hex }).strict()),
  leather: z.array(z.object({ name: z.string(), color: hex, stitch: hex.optional() }).strict()),
}).strict();

export type Look = z.infer<typeof LookSchema>;
export type FullLook = Required<Look>;
export type Link = z.infer<typeof LinkSchema>;
export type Price = z.infer<typeof PriceSchema>;
export type Night = z.infer<typeof NightSchema>;
export type CatalogWatch = z.infer<typeof CatalogWatchSchema>;
export type Strap = z.infer<typeof StrapSchema>;
export type StrapPresets = z.infer<typeof StrapPresetsSchema>;
