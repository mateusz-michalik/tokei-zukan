import type { CatalogWatch, Link, Strap } from '../catalog/schema';
import type { DisplayCurrency } from '../lib/price';
import type { Theme } from '../lib/theme';
import type { Lighting } from '../render/night';

/** The single status older versions saved per watch. Loading turns it into `liked` and `owned`. */
export type LegacyStatus = 'owned' | 'front-runner' | 'considering' | 'ruled-out';

export interface Photo { src: string }

/** Catalogue fields as the editor can leave them: sizes may be blank. */
export type WatchFacts = Omit<CatalogWatch, 'diameter' | 'lugToLug' | 'thickness' | 'lugWidth' | 'water'> & {
  diameter: number | null;
  lugToLug?: number | null;
  thickness?: number | null;
  lugWidth?: number | null;
  water?: number | null;
};

/** Everything personal about one watch on the user's list. Lives only in this browser. */
export interface ShortlistEntry {
  watchId: string;
  /**
   * The visitor likes this model. Independent of owning it and of comparing it. Not shown for now, as there's no
   * liked-watches view yet; kept so saved likes, including older front-runners, return when there is.
   */
  liked?: boolean;
  /** The visitor owns one. Independent of liking it; where it sits in a watch box is kept in `boxes`. */
  owned?: boolean;
  /** A price saved by an older version. Starter-list prices are removed on load; catalogue RRPs replace them. */
  priceAUD?: number | null;
  priceNote?: string;
  notes?: string;
  pros?: string;
  cons?: string;
  /** The user's own links (dealers, reviews). Official links come from the catalogue. */
  links?: Link[];
  /** The strap the user wants to see it on. Blank means what it's sold on. */
  wornStrap?: Strap;
  /** Retired photo fields. No longer shown, but kept so older saved lists load and save unchanged. */
  photos?: Photo[];
  front?: string;
  frontFill?: number | null;
  /** Catalogue fields the user has changed for themselves. */
  overrides?: Partial<WatchFacts>;
}

/** A catalogue watch merged with the user's entry: what the views work with. */
export type Watch = WatchFacts & Omit<ShortlistEntry, 'watchId' | 'overrides' | 'links'> & {
  links: Link[];
  /** True when the watch was added by the user rather than coming from the catalogue. */
  custom: boolean;
};

export type Tab = 'detail' | 'compare' | 'wrist' | 'owned';

/** A watch box: a named row of slots, each holding an owned watch's id or nothing. */
export interface WatchBox { id: string; name: string; slots: (string | null)[] }
export type CompareMode = 'renders' | 'outlines';

export interface UserState {
  version: 2;
  /** One-time removals of factory data: 2 removed the personal buying advice, 3 the unverified starter prices. */
  starterCopyVersion?: 1 | 2 | 3;
  shortlist: ShortlistEntry[];
  /** Watches the user added that are not in the catalogue. */
  customWatches: WatchFacts[];
  /** Catalogue ids already offered to this user, so watches added to the catalogue later show up once. */
  seenCatalog: string[];
  selectedId: string;
  compare: string[];
  tab: Tab;
  cmpMode: CompareMode;
  /** Currency prices are shown in. */
  currency: DisplayCurrency;
  /** Light or dark pages; `system` follows the device. */
  theme: Theme;
  /** How the watches are lit, whatever the page theme: at dusk and night they dim and their lume glows. */
  lighting: Lighting;
  /** Set the hands to this device's time and keep them moving, instead of each drawing's reference pose. */
  liveTime: boolean;
  /**
   * One strap for every watch in Compare, without changing any watch's own choice. Blank shows each watch on the strap
   * chosen for it on its details page; 'sold' shows each on what it's sold on.
   */
  cmpStrap?: Strap | 'sold';
  /** The watch sizes are compared against in Compare. Blank means the first watch the user owns. */
  referenceId: string;
  /** Brands whose watch list is folded away in the sidebar. */
  collapsedBrands: string[];
  /** Where owned watches sit. Taking a watch out of a box doesn't make it any less owned. */
  boxes: WatchBox[];
  /**
   * The wrist views: wrist size, the watch worn, and the watch drawn as an outline over it (blank for none). The outline
   * is chosen separately from the size reference so each control only changes its own view.
   */
  wrist: { cm: number; watchId: string; outlineId: string };
}
