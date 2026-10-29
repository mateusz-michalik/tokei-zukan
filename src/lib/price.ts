import { DISPLAY_CURRENCIES, type PRICE_CURRENCIES } from '../catalog/constants';
import type { Price } from '../catalog/schema';
import rates from '../data/rates.json';

export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];
type PriceCurrency = (typeof PRICE_CURRENCIES)[number];

export const CURRENCY_NAMES: Record<DisplayCurrency, string> = {
  AUD: 'Australian dollars', EUR: 'Euros', USD: 'US dollars', CNY: 'Chinese yuan', JPY: 'Japanese yen',
};
// CN¥ and JP¥ keep the two yen-style symbols apart.
const SYMBOLS: Record<PriceCurrency, string> = { AUD: 'A$', EUR: '€', USD: 'US$', CNY: 'CN¥', JPY: 'JP¥', GBP: '£', CHF: 'CHF ' };
const MARKETS: Record<string, string> = {
  AU: 'Australian', US: 'US', JP: 'Japanese', CN: 'Chinese', GB: 'UK', CH: 'Swiss', DE: 'German', FR: 'French', IT: 'Italian', ES: 'Spanish', NL: 'Dutch', EU: 'EU',
};

export const isDisplayCurrency = (c: unknown): c is DisplayCurrency => (DISPLAY_CURRENCIES as readonly unknown[]).includes(c);

export const fmtMoney = (n: number, currency: PriceCurrency) => SYMBOLS[currency] + Math.round(n).toLocaleString('en-AU');

/** Converts at the bundled ECB reference rates, always from the original amount so switching never compounds rounding. */
export const convert = (amount: number, from: PriceCurrency, to: PriceCurrency) => (amount / rates.rates[from]) * rates.rates[to];

export const ratesDate = new Date(rates.asOf).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const ratesSource = { name: rates.source, url: rates.url };

/** "Australian RRP", "US launch RRP (2021)", with a flag when it isn't from the maker. */
export function describePrice(p: Price) {
  const where = MARKETS[p.market] ?? p.market;
  const when = p.kind === 'launch' ? ` launch RRP${p.effective ? ` (${p.effective.slice(0, 4)})` : ''}` : ' RRP';
  return where + when + (p.sourceType === 'secondary' ? ', as reported' : '');
}

export interface ShownPrice {
  amount: number;
  currency: DisplayCurrency;
  /** True when worked out from another currency rather than published in this one. */
  converted: boolean;
  /** A short description of where the figure comes from. */
  label: string;
  /** The recorded price behind it; missing for a price the user saved in an older version. */
  price?: Price;
}

/** Rounds conversions so they don't look more precise than they are. */
const roundConverted = (n: number, c: DisplayCurrency) => { const step = c === 'JPY' ? 1000 : 10; return Math.round(n / step) * step; };

/**
 * The maker's price in this currency when there is one, current before launch; otherwise the first recorded price,
 * converted. Prices a maker's site converted automatically are never shown or converted from.
 */
export function rrpIn(prices: Price[] | undefined, currency: DisplayCurrency): ShownPrice | undefined {
  const usable = (prices ?? []).filter(p => p.sourceType !== 'manufacturer-converted');
  const local = usable.filter(p => p.currency === currency).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'current' ? -1 : 1))[0];
  if (local) return { amount: local.amount, currency, converted: false, label: describePrice(local), price: local };
  const base = usable[0];
  if (!base) return undefined;
  return {
    amount: roundConverted(convert(base.amount, base.currency, currency), currency), currency, converted: true, price: base,
    label: `Converted from the ${fmtMoney(base.amount, base.currency)} ${describePrice(base)} at ECB rates of ${ratesDate}`,
  };
}

/** The launch price in this currency, or the first recorded launch price converted. */
export const launchIn = (prices: Price[] | undefined, currency: DisplayCurrency) => rrpIn(prices?.filter(p => p.kind === 'launch'), currency);

/** A price saved by an older version wins over the catalogue's, so a deliberate figure isn't silently replaced. */
export function shownPrice(w: { prices?: Price[]; priceAUD?: number | null }, currency: DisplayCurrency): ShownPrice | undefined {
  if (w.priceAUD == null) return rrpIn(w.prices, currency);
  const converted = currency !== 'AUD';
  return {
    amount: converted ? roundConverted(convert(w.priceAUD, 'AUD', currency), currency) : w.priceAUD, currency, converted,
    label: converted ? `Your saved price of ${fmtMoney(w.priceAUD, 'AUD')}, converted at ECB rates of ${ratesDate}` : 'Your saved price',
  };
}

/** "A$1,400", or "≈ US$940" for a conversion. */
export const fmtShown = (p: ShownPrice) => (p.converted ? '≈ ' : '') + fmtMoney(p.amount, p.currency);
