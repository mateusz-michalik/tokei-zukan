import { describe, expect, test } from 'vitest';
import type { Price } from '../catalog/schema';
import rates from '../data/rates.json';
import { PRICE_CURRENCIES } from '../catalog/constants';
import { convert, fmtMoney, fmtShown, launchIn, rrpIn, shownPrice } from './price';

const price = (p: Partial<Price>): Price => ({
  amount: 1000, currency: 'AUD', market: 'AU', kind: 'current', source: 'https://example.com', sourceType: 'manufacturer', verified: '2026-10-29', ...p,
});

describe('prices', () => {
  test('every recordable currency has a rate', () => {
    for (const c of PRICE_CURRENCIES) expect(rates.rates[c]).toBeGreaterThan(0);
  });
  test('formats with symbols that keep the yen-style currencies apart', () => {
    expect(fmtMoney(1400, 'AUD')).toBe('A$1,400');
    expect(fmtMoney(1200, 'USD')).toBe('US$1,200');
    expect(fmtMoney(9000.4, 'CNY')).toBe('CN¥9,000');
    expect(fmtMoney(181500, 'JPY')).toBe('JP¥181,500');
  });
  test('converts through the euro rates and back without drift', () => {
    expect(convert(1, 'EUR', 'AUD')).toBeCloseTo(rates.rates.AUD);
    let a = 1400;
    for (let i = 0; i < 20; i++) a = convert(convert(a, 'AUD', 'JPY'), 'JPY', 'AUD');
    expect(a).toBeCloseTo(1400, 6);
  });
  test("uses the maker's price in the chosen currency, current before launch", () => {
    const ps = [price({}), price({ currency: 'USD', market: 'US', kind: 'launch', amount: 900, effective: '2021-06' }), price({ currency: 'USD', market: 'US', amount: 950 })];
    expect(rrpIn(ps, 'USD')).toMatchObject({ amount: 950, converted: false, label: 'US RRP' });
    expect(rrpIn(ps.slice(0, 2), 'USD')).toMatchObject({ amount: 900, converted: false, label: 'US launch RRP (2021)' });
  });
  test('otherwise converts the first recorded price, rounded and marked', () => {
    const shown = rrpIn([price({ amount: 1400 }), price({ currency: 'USD', market: 'US', amount: 950 })], 'JPY')!;
    expect(shown.converted).toBe(true);
    expect(shown.amount % 1000).toBe(0);
    expect(shown.amount).toBe(Math.round(convert(1400, 'AUD', 'JPY') / 1000) * 1000);
    expect(fmtShown(shown)).toMatch(/^≈ JP¥/);
    expect(shown.label).toMatch(/^Converted from the A\$1,400 Australian RRP at ECB rates of /);
  });
  test("a site's automatic conversion is never shown or converted from", () => {
    const ps = [price({ currency: 'EUR', market: 'FR', amount: 800, sourceType: 'manufacturer-converted' }), price({ currency: 'USD', market: 'US', amount: 950 })];
    expect(rrpIn(ps, 'EUR')).toMatchObject({ converted: true, price: { currency: 'USD' } });
    expect(rrpIn([ps[0]], 'EUR')).toBeUndefined();
  });
  test('the launch price is picked on its own, converted when needed', () => {
    const ps = [price({ amount: 1400 }), price({ currency: 'USD', market: 'US', kind: 'launch', amount: 900, effective: '2021-06' })];
    expect(launchIn(ps, 'USD')).toMatchObject({ amount: 900, converted: false });
    expect(launchIn(ps, 'AUD')).toMatchObject({ converted: true, price: { amount: 900 } });
    expect(launchIn([price({})], 'AUD')).toBeUndefined();
  });
  test('no prices means no price', () => {
    expect(rrpIn(undefined, 'AUD')).toBeUndefined();
    expect(shownPrice({ prices: [] }, 'EUR')).toBeUndefined();
  });
  test("a price saved by an older version wins and is labelled as the user's", () => {
    expect(shownPrice({ prices: [price({})], priceAUD: 1234 }, 'AUD')).toMatchObject({ amount: 1234, converted: false, label: 'Your saved price' });
    expect(shownPrice({ priceAUD: 1234 }, 'EUR')).toMatchObject({ converted: true, label: expect.stringMatching(/^Your saved price of A\$1,234, converted/) });
  });
});
