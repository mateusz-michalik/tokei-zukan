# Lume and dark mode

In dark mode every watch is drawn at night: its surfaces dim towards moonlit blue and only its documented lume glows, in the colour it gives off. This file records the evidence behind each watch's `night` block, and how to add one for a new watch.

Researched 2026-10-29. Glow colours are the standard emission colour of each material grade, not measured from night photos of these exact watches. No source found for these models showed a lume photo with a clear colour, so most entries are `likely` or `uncertain`, and the app's details caption says so.

## How it works

| Piece | Where |
| --- | --- |
| `night` in a watch's catalogue JSON | The glow colour (`glow`), the lumed `parts`, optional `partGlow` for parts that glow differently, `material` and `certainty`. Separate from `look.lume`, which is the lume's daytime paint colour: beige "aged" lume often glows green. |
| `lu('part')` in the renderers | Tags each element painted with lume by part: `hands`, `indices` (dial markers and lumed numerals), `bezel`, `seconds` or `subdials` (chronograph subdial hands). Tag only real lume; printed numerals that happen to use the lume colour, like the SPB451's date, stay untagged. |
| [`src/render/night.ts`](../src/render/night.ts) | The night pass: dims every colour, then lets tagged parts listed in `night.parts` glow, with one soft halo filter per drawing (unique ids, so several watches can share a page). Tagged parts the watch has no lume on stay dim. |

`certainty` is `documented` when the maker states the lumed parts and the glow colour is confirmed for that watch, `likely` when the parts are documented and the colour comes from the material or sibling models, and `uncertain` when either is in doubt.

## Adding lume for a new watch

1. Tag the lume elements in its renderer with `lu('part')`, right after the element's lume `fill` (or on the group holding the lume shapes).
2. Find which parts are lumed from the maker's spec ("LumiBrite on hands, index(es) and bezel") and the material grade. Reviews with night photos are the best evidence for the glow colour.
3. Add `night` to its catalogue JSON. Standard glows: Super-LumiNova BGW9 and BL grades about `#8FD8FF` (blue), C3 and GL grades about `#8CFF6E`, Seiko LumiBrite about `#7CFF9A` (green). Use `partGlow` only when a source shows parts glowing differently.
4. Add a row below with your sources, run `npm test`, and check the watch in dark mode.

## Evidence by watch

| Watch | Material | Lumed parts | Glow | Certainty | Sources and notes |
| --- | --- | --- | --- | --- | --- |
| Seiko SSC947 | LumiBrite | hands, indices | green `#7CFF9A` | likely | [Seiko](https://www.seikowatches.com/global-en/products/prospex/ssc947): "Lumibrite on hands and index(es)". Chronograph, small-seconds and 24-hour hands not stated, so not lit. |
| Seiko SPB151 | LumiBrite | hands, indices, bezel, seconds | green `#7CFF9A` | likely | Seiko's page is gone. [Retailer spec](https://www.righttime.com/rt/seiko/spb151.htm): LumiBrite hands and markers. Bezel pip and seconds plot from [Worn & Wound's SPB153 review](https://wornandwound.com/review/review-seiko-spb153-captain-willard-reissue/), the same dial and hands. |
| Seiko SPB253 | LumiBrite, aged colour | hands, indices | green `#7CFF9A` | uncertain | [Seiko Black Series page](https://www.seikowatches.com/us-en/products/prospex/special/blackseries_limited-2nd): "hour markers and hands are coated with Lumibrite". Beige daytime lume; glow colour not found. Bezel pip lume not confirmed. |
| Seiko SPB255 | LumiBrite, aged colour | hands, indices | green `#7CFF9A` | uncertain | As SPB253. |
| Seiko SPB257 | LumiBrite, aged colour | hands, indices, bezel | green `#7CFF9A` | uncertain | [Seiko Spain](https://www.seikowatches.com/es-es/products/prospex/SPB257J1/): "Lumibrite en agujas, índices y bisel". Glow colour not found. |
| Seiko SPB317 | LumiBrite | hands, indices, bezel | green `#7CFF9A` | likely | [Seiko](https://www.seikowatches.com/us-en/products/prospex/spb317j1): "LumiBrite on hands, index(es) and bezel". |
| Seiko SPB451 | LumiBrite | hands, indices, bezel | green `#7CFF9A` | likely | [Seiko](https://www.seikowatches.com/us-en/products/prospex/spb451j1): "LumiBrite on hands, index(es) and bezel". |
| Seiko SPB519 | LumiBrite | hands, indices, bezel | green `#7CFF9A` | likely | [Seiko](https://www.seikowatches.com/us-en/products/prospex/spb519j1): "LumiBrite on hands, index(es) and bezel"; [Monochrome](https://monochrome-watches.com/seiko-prospex-1968-heritage-diver-gmt-spb519-300m-micro-adjust-clasp-/): "a lumed drop within a triangle at zero". A lumed seconds hand appears only in a blog seen as a search summary, so it isn't lit; nor is the GMT hand. |
| Seiko SRPK01 | LumiBrite | hands, indices, bezel | green `#7CFF9A` | uncertain | [Seiko](https://www.seikowatches.com/global-en/products/prospex/srpk01): "LumiBrite on hands, index(es) and bezel". Its "light blue essence" bezel markers and minute hand may glow blue; unconfirmed, so all one colour for now. |
| Seiko SRPE03 | LumiBrite | hands, indices | green `#7CFF9A` | likely | [Seiko](https://www.seikowatches.com/global-en/products/prospex/srpe03): "Lumibrite on hands and index(es)". [Monochrome](https://monochrome-watches.com/seiko-prospex-king-turtle-srpe03-srpe05-review-price/) mentions bezel lume, but Seiko's spec doesn't, so the pip isn't lit. |
| Baltic Aquascaphe MK2 39.5 | Super-LumiNova BGW9 | hands, indices, seconds | blue `#8FD8FF` | documented | [Baltic](https://baltic-watches.com/en/products/aquascaphe-mk2-blue): "Super-LumiNova BGW9" lumicast appliques, lumed hands; [Time+Tide](https://timeandtidewatches.com/baltic-unveil-the-aquascaphe-mk2-a-more-refined-take-on-their-incredibly-popula) confirms BGW9. Seconds plot from the [model notes](models/baltic-mk2-39-5.md). Sapphire bezel lume not confirmed, so it isn't lit. |
| Christopher Ward C60 Trident Pro 300 40 mm | Super-LumiNova X1 BL C1 | hands, indices, bezel, seconds | blue `#8FD8FF` | likely | Grade from the [model notes](models/christopher-ward-c60-pro-300.md), researched for this reference. [Watchclicker](https://watchclicker.com/christopher-ward-c60-trident-pro-300/) gives "X1 GL C1" (green) for the 42 mm blue model, a conflict worth checking on Christopher Ward's page. Fully lumed bezel per Watchclicker and [aBlogtoWatch](https://www.ablogtowatch.com/watch-review-christopher-ward-c60-trident-pro-300/). |
| Oris Divers Sixty-Five Chronograph 01 771 7791 | Super-LumiNova BGW9 | hands, indices, bezel, subdials | blue `#8FD8FF` | likely | [Monochrome](https://monochrome-watches.com/introducing-oris-divers-sixty-five-chronograph-40mm-calibre-771-specs-price/): indices, hands and "counter hands" with Super-LumiNova, luminous bezel triangle. BGW9 from one [dealer listing](https://www.laguardajoiers.com/en/01-771-7791-4054-07-8-20-18-oris-divers-sixty-five.html). Oris's own page doesn't mention lume. |
| Serica 5303-1 | Super-LumiNova C3 | hands, indices, bezel, seconds | green `#8CFF6E` | likely | [Chronohunter](https://chronohunter.com/chronicles/serica-5303-watch-collection-review): C3, "green lume", lumed pip at 12. Serica's copy for the sibling 5303-3 says "Super-Luminova C3, Green glow" (search snippet). Seconds plot from the [model notes](models/serica-5303-1.md). |

Worth confirming in a browser: Christopher Ward's 40 mm black page (BL or GL grade), Serica's 5303-1 page, and night photos of the Black Series and SRPK01.
