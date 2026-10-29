# Seiko SPB451 "1965 Heritage Diver" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 24 October 2026; refined against the larger supplied reference on 25 October 2026.

## Reference and dimensions

- **Photo:** the supplied front-on Seiko product photo (1102 px square). It isn't stored in the repo.
- **Specs:** [SPB451J1](https://www.seikowatches.com/au-en/products/prospex/spb451j1). Catalogue values kept: 40.0 mm diameter, 46.4 mm lug to lug, 13.0 mm thick, 20 mm between the lugs, 6R55, 300 m.
- **Unit:** k, the outer radius of the blue bezel insert. In the photo k ≈ 300 px, centred near (524, 512).
- **Scale:** the case crest at 9 o'clock is about 1.045 k. Taking that as the 40 mm diameter gives k ≈ 19.14 mm. On that scale the specified lug-to-lug is 1.21 k. The photo's lug tips read about 0.8 mm shorter; the drawing keeps the published 46.4 mm.

## Where it lives

- **Selection:** `shape: "heritage"` sends the drawing to `spb451SVG()` in [spb451.ts](../../src/render/spb451.ts).
- **Scope:** everything above the strap: case and crown, coin-edge bezel, chapter ring, dial, markers, date, printing and hands.
- **Shared with recent drawings:** the hour and minute hands use the same sword construction as the Willard and SPB317 (arrow tip, lume insert, counterweight, brushed and polished halves). The day-of-month window is the SPB317's black disc at 4:30, with a light numeral, rather than the Willard's framed window at 3.

## Measurements used

| Feature | Value (k unless stated) |
|---|---|
| Case | Circle of radius 1.045, which is the 40 mm crest. Lug openings are exactly 20 mm. Lightly sloped tips at the 46.4 mm lug-to-lug, outer tip about 2.5 mm outside the opening. Recess seats at ±0.975 let the bezel overlap the central case edge; small corner radii and continuous shoulder tangents avoid a flared end. Shoulders meet the circle near 70° from 12. |
| Crown | At 3 o'clock, 6.6 mm across, about 3.6 mm proud, with a rounded end and fine ridges. |
| Bezel | 120 rounded teeth. Blue insert about 0.80–1.00. Triangle and lume pip at 12. Dots on the other minutes, bars at the five-minute marks, numerals 10–50 centred near 0.90. |
| Chapter | Narrow dark crystal seat at 0.764–0.790. Minute ticks extend from about 0.755 to 0.688 on the blue dial; bar at 12 and square pip at 6. |
| Markers | Lightly rounded bars from 0.47–0.65 and 0.115 wide, with distinct steel borders, including at 3. The 12 is a double bar. |
| Date | Black disc at 4:30, radius 0.05, centred near 0.57 at 135°, in the gap inside the 4 and 5 markers. Light "6". |
| Printing | SEIKO baseline near −0.27, about 0.35 wide. Prospex X near 0.20. AUTOMATIC 3 DAYS, then DIVER'S 300m. |
| Hands | Hour about 0.45 long and 0.096 wide, lume 0.19–0.415, tail 0.16. Minute about 0.69 long and 0.062 wide, lume 0.09–0.63, tail 0.15. Seconds: needle to the minute track, rectangular lume capsule, no coloured dot. |

## Validation

- **Visual comparison:** checked in the browser against the photograph, aligned on the bezel-insert centre and diameter, and as a standalone drawing at gallery size.
- **Other views:** outline, wrist, and the strap samples are covered by the renderer suite. The refinement was also visually checked on rubber, NATO, in outline mode and on the wrist.
- **Budget:** at `strapLen: 12`, the SPB451 is 228 elements and approximately 44.3 KB, under the existing 320-element / 50 KB limits.
- **Checks:** `npm run build` passes type checking, all 22 tests and the production build.

## Remaining approximations

- **Numerals and wordmark:** Arial and Georgia stand in for Seiko's bezel figures and logo. Weight and width are matched visually.
- **Micro-printing:** the tiny "JAPAN 6R55" line above 6 is left out, as on the other refined dials.
- **Bracelet:** the shared oyster renderer, with a brushed centre and a slightly wider centre row. Link shape stays simplified.
- **Case finish:** restrained brushing, narrow edge highlights and tapered lug-flank chamfers. Lighting remains an illustration, rather than a reproduction of every photographed reflection.
- **Lug-to-lug:** the published 46.4 mm is a little longer than the tips read in this photo.

### Hand finish

Hour and minute hands use two solid metal tones, split down the centre of each blade and counterweight: muted brushed metal and a lighter polished face. Keep the lume inserts separate. Avoid multi-stop metal gradients on these hands.

### Colour and layer order

The supplied photo reads as dark navy: bezel `#04132F`, dial `#09264D`, with cooler off-white lume (`#E8EDE6`). Use subdued radial shading and two broad sunburst lobes; the previous large white-mixed hotspot washed the dial out. These colours match this reference lighting rather than defining how the physical watch appears in every environment.

Draw the blue dial before the chapter ticks so the fine printing remains visible. Keep the steel crystal seat narrow: a wide grey ring crowds the dial and changes its apparent colour. The lug recess must extend under the bezel crest; increasing the bezel diameter to cover a misplaced recess would distort the watch's scale.
