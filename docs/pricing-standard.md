# Watch pricing standard

Every price Tokei Zukan shows is the maker's recommended retail price (RRP) for the exact reference on what it's sold on, or a clearly marked conversion of one. Follow this guide whenever you add a watch to the catalogue, and when you re-check existing prices.

A missing price is acceptable. An estimate, a dealer price or a price we can't trace back to a source is not.

## Where prices live

| File | Responsibility |
| --- | --- |
| `catalog/watches/<brand>/<ref>.json` | The watch's `prices` array: every verified RRP, with its source. |
| [`src/catalog/schema.ts`](../src/catalog/schema.ts) | `PriceSchema`, which every price must match. `npm test` checks it. |
| [`src/data/rates.json`](../src/data/rates.json) | The exchange rates used for conversions, with their source and date. |
| [`src/lib/price.ts`](../src/lib/price.ts) | Which price is shown for the visitor's currency, and how it's labelled. |

## How prices are shown

Visitors choose a currency in Settings: AUD, EUR, USD, CNY or JPY.

1. If the watch has a price in that currency, it's shown as the maker's price ("Australian RRP"). A current price wins over a launch price. When a launch price is recorded too, the details page shows it underneath.
2. Otherwise the **first** price in the array is converted at the rates in `rates.json`, rounded (to 10, or 1,000 for yen) and marked "≈", with a label naming the original price and the rates date.
3. With no usable price the watch shows "No verified price".

So the order of the array matters. Put first the maker's current price in its home market (UK for Christopher Ward, Switzerland for Oris, France for Baltic and Serica, Japan for Casio, whose Japanese market suffix such as F-91W-1JH marks the same watch). When there isn't one, as with Seiko, whose Japanese references differ from export ones, use a euro-area price, since those include VAT. For a watch no longer sold, use its most reliable launch price.

## Adding prices for a new watch

1. **Pin down the variant.** Prices are for the reference and strap or bracelet in the watch's `strap` field. Different straps often have different references (SPB317 on rubber, SPB315 on a bracelet) or different prices (Baltic charges more for a bracelet). Price the one the catalogue entry shows. Mention other variants in `note` if useful.
2. **Look in each market**: Australia (AUD), the euro area (EUR, any euro country), the US (USD), China (CNY) and Japan (JPY), plus the maker's home market if it uses another currency (GBP for Christopher Ward, CHF for Oris).
3. **Use sources in this order:**
   1. The maker's own regional site or store, including its region or currency switcher.
   2. An archived copy of the maker's page on the [Wayback Machine](https://web.archive.org). Cite the archive URL, not the live one.
   3. The maker's press release.
   4. Reputable press quoting the RRP (Hodinkee, Monochrome, Fratello, Worn & Wound). Mark it `secondary`; it's shown as "as reported".
4. **Never record** used or grey-market prices, dealer discounts, sale prices, marketplace listings such as Chrono24, your own estimates, or your own currency conversions.
5. **Watch for automatic conversions.** Many direct-to-consumer stores (Shopify and others) convert one price into the visitor's currency. Those aren't local RRPs: record them with `"sourceType": "manufacturer-converted"`, or leave them out. The app never shows or converts from them.
6. **Current and launch.** Use `"kind": "current"` while the maker sells the watch in that market. Also record the documented launch RRP, with `"kind": "launch"` and an `effective` date (at least the year): the details page shows it under the current price ("At launch: US$625 (2020)"). Where the watch is no longer sold, record only the launch price; don't chase the last listed price or secondary-market prices, and don't present an old price as current. A launch price is often only documented in one or two currencies; that's fine.
7. **Tax.** Set `taxIncluded` only when the source says so (Japanese sites state 税込; Australian prices include GST; EU prices usually include VAT; US prices usually exclude sales tax). Otherwise leave it out.
8. **Record each price** in the watch's JSON:

   ```json
   "prices": [
     {
       "amount": 1400,
       "currency": "AUD",
       "market": "AU",
       "kind": "current",
       "variant": "SPB317J1, black silicone strap",
       "source": "https://www.seikowatches.com/au-en/products/prospex/spb317j1",
       "sourceType": "manufacturer",
       "verified": "2026-10-29",
       "taxIncluded": true
     }
   ]
   ```

   `market` is a two-letter country code (`AU`, `US`, `DE`, `FR`, `JP`, `CN`, `GB`, `CH`). `verified` is the date you checked the source.
9. **Leave out what you can't verify.** Visitors in that currency then see a marked conversion, which is the honest answer.
10. **Check it.** Run `npm test`, then look at the watch in the app in each currency and confirm every figure matches its source.

## Re-checking prices

Makers change prices, usually once or twice a year. When you re-check:

- Update `amount` and `verified` together. Git keeps the history, so don't keep old prices in the file.
- When a watch is withdrawn from a market, remove its current price there. Its launch price stays.
- Mention price changes in the project changelog when they're significant.

## Exchange rates

`rates.json` holds the European Central Bank's [euro reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) for one day, with `asOf` set to that day. The app shows that date next to every conversion.

To update them, read the latest rates from <https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml>, copy AUD, USD, CNY, JPY, GBP and CHF into `rates`, and set `asOf`. Update them whenever you re-check prices, and at least every few months so conversions don't drift far from reality. A currency you add to `PRICE_CURRENCIES` in `src/catalog/constants.ts` needs a rate here too; `npm test` checks that.

## Prices saved by older versions

Before catalogue prices existed, the starter list filled in personal AUD prices, many of them estimates. Those factory values are removed from saved lists once, using `src/data/legacy-starter-prices.json`. A price a visitor changed is kept: it's shown as "Your saved price", with the maker's RRP underneath on the details page. Don't add prices to `src/data/starter-list.json`.
