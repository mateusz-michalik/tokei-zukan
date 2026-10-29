# Seiko SPB151 "Captain Willard" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 24 October 2026. The same module draws the SPB257 (Black Series), which shares the 6105-reissue case, in its own catalogue colours.

## Reference and dimensions

- **Photo:** the supplied front-on Seiko product photo (1102 px square, transparent background). It isn't stored in the repo.
- **Unit:** k, the outer radius of the bezel insert. In the photo k = 298.4 px, centred at (525.3, 510.2).
- **Catalogue dimensions retained:** 42.7 mm diameter, 46.6 mm lug to lug, 13.2 mm thickness and 20 mm lug width. Earlier research found conflicting lug-to-lug figures; the manufacturer dimension was not independently confirmed during this refinement.
- **Photo proportions:** useful for aligning the silhouette and furniture, but perspective and product-image processing mean the photo cannot settle conflicting published dimensions. Do not treat its apparent aspect ratio as proof of a specification.
- **Scale:** the case is drawn with the width across 42.7 mm and the height across 46.6 mm. Those scales differ by about 1%, within measurement noise. Furniture uses their average, k ≈ 19.2 mm, which makes the bezel insert about 38.4 mm.

## Where it lives

- **Selection:** `shape: "willard"` sends the drawing to `spb151SVG()` in [spb151.ts](../../src/render/spb151.ts). It replaces the old generic Willard branch.
- **Scope:** everything above the strap: case and crown, bezel, rehaut, dial, markers, date, printing and hands.
- **Colours:** come from `look`, so the SPB257 renders in black with orange accents, matching the Black Series palette (`#F4A12A` orange minute hand and 0–20 bezel sector, `#B5BCBD` grey bezel markings, `#E4E7DE` dial printing, `#686F6B` dark metal hands and seconds shaft with `#E85A34` red-orange paddle dot, dark charcoal rehaut and 60-tooth plateau-crested bezel rim, and `#514239` Seichu braided nylon strap).

## Measurements used

| Feature | Value (k unless stated) |
|---|---|
| Case | Sparse curved landmarks with rounded lug tips. Actual 20 mm open slots extend to seats at −0.982 / +0.99, so the bracelet sits between the lugs. The right flank is fuller; the guard swells to 1.258 at about 3:30 and blends into the crown pocket. |
| Dial position | The dial sits 0.0375 (≈0.7 mm) above the case centre, so the bezel is nearer the top edge, as in the photo. |
| Crown | Seen through the pocket from 0.97 to 1.21 across and 0.33 to 0.66 down: ≈6 mm across, ≈4.6 mm of barrel, axis at 105°. It's drawn under the case so the guard overlaps it. |
| Bezel | 105 rounded scallops reaching approximately 1.05, drawn with two compound paths for crests and shaded facets. Black insert 0.823–0.998. |
| Bezel print | Numerals 0.124 tall, centred at 0.904, regular weight, turning with the bezel. Minute dots at 0.866. Bars 0.842–0.975. Triangle at 12 is 0.24 wide, with a 0.036-radius lume pip centred at −0.938. |
| Rehaut and dial | Dark ring 0.80–0.823. Grey sloped rehaut 0.731–0.80 with white minute bars, heavier every five minutes. Black dial to 0.731, with a separate printed minute track from 0.718 to 0.681 (0.669 every five minutes). |
| Markers | 0.54–0.656, about 0.106 wide, slightly narrower at the inner end. 6 and 9: long bars from 0.472. 12: double shield 0.47–0.65. Narrow 0.008 lume insets retain visible metal frames without oversized borders. |
| Date | At 3. White aperture 0.15 × 0.104, centred at (0.577, 0.011), with a metal frame and larger, width-controlled date numeral. |
| Printing | SEIKO, cap 0.06, baseline −0.262, 0.36 wide. Prospex X centred at 0.256. AUTOMATIC, baseline 0.361. DIVER’S 200m, bold, baseline 0.432. |
| Hands | Hour 0.444 long and 0.082 wide, lume 0.198–0.39, tail 0.156. Minute 0.72 long and 0.053 wide, lume 0.12–0.60, tail 0.155. Seconds: needle to 0.62, tail 0.29, angular framed paddle 0.069 wide, with a 0.023-radius red dot at 0.462 and lume to 0.565. |

## Refinement workflow and validation

- Fix the case openings before adjusting bracelet shading. `spb151Case()` receives the actual lug width; a strap of the correct width cannot fix a case path that covers the opening.
- The Willard oyster bracelet uses a 50% centre-link width. Its end-link starts just under the bezel seat, keeping the reflection within the visible end-link rather than largely hidden beneath the dial. Other oyster bracelets retain their default 40% centre.
- Keep the outer contour sparse and smooth. Horizontal endpoint tangents soften the lug-tip transitions; fewer landmarks also reduce the cost of repeated case and clipping paths.
- **Visual comparison:** checked in the browser beside the supplied photograph, aligned by bezel centre and diameter. Reviewed the recessed bracelet fit, case shoulders, crown guard, scalloped rim, dial track, indices and hands.
- **Other views:** visually checked SPB257, rubber, NATO, outline and wrist previews. The existing automated suite exercises catalogue/strap rendering and SVG budgets.
- **Budget:** at `strapLen: 12`, the refined SPB151 is 214 elements and approximately 45.8 KB (10.0 KB gzipped), below the existing 320-element / 50 KB limits. Compound tooth paths add geometric detail without a separate element for every tooth; simplifying the case contour offsets much of their byte cost.
- **Checks:** `npm run build` passes type checking, all 20 tests and the production build.

## Remaining approximations

- **Numerals:** Arial stands in for Seiko's rounder bezel figures; the weight and size are visually approximated. The wordmark also uses a font rather than exact logo outlines.
- **Micro-printing:** left out. The rehaut's reflected printing in the photo is a crystal reflection and isn't drawn.
- **Bracelet:** uses the shared oyster renderer with a wider brushed centre and divided end-links. Link curvature and reflections remain simplified.
- **Case finish:** simplified to brushing, narrow polished edges and soft lighting.

### Hand finish

Hour and minute hands use two solid metal tones, split down the centre of each blade and counterweight: muted brushed metal and a lighter polished face. Keep the lume inserts separate. Avoid multi-stop metal gradients on these hands; the crisp two-tone split is the intended finish.
