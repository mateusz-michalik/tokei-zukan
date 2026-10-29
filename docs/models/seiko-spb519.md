# Seiko SPB519 "1968 Heritage Diver's GMT" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 25 October 2026.

## Reference and dimensions

- **Photo:** the supplied front-on Seiko SPB519J1 product photo (1102 px square, transparent background). It isn't stored in the production source. An initial SPB451J1 image was identified as the wrong reference and wasn't used.
- **Specs:** [SPB519J1](https://www.seikowatches.com/au-en/products/prospex/spb519j1). Catalogue values retained: 42.0 mm diameter, 48.6 mm lug to lug, 13.3 mm thick, 20 mm between the lugs, 6R54 GMT, 300 m.
- **Unit:** k, the outer radius of the blue bezel insert. With the model-specific rounded case construction, k = R / 1.045 = 20.1 mm and the machined bezel crest is the specified 42 mm diameter.
- **Appearance:** silvery-white dial, deep navy ceramic bezel, circular plots, red GMT arrow, framed date at 4:30 and crown at 4. These distinguish it from the blue-dial SPB451. Additional supplied product angles consistently read navy rather than the hero image's teal cast, so the illustration uses the restrained navy `#121E38`.

## Where it lives

- **Selection:** `shape: "heritage-gmt"` sends the drawing to `spb519SVG()` in [spb519.ts](../../src/render/spb519.ts).
- **Case:** uses `spb519Case()` with rounded 1968 shoulders, the catalogue dimensions and exact 20 mm openings. It no longer inherits the straighter SPB451 shoulders. The bracelet uses the shared oyster renderer with a 50% polished centre row.
- **Scope:** the dedicated module draws the crown, coin-edge bezel, ceramic insert, 24-hour rehaut, dial furniture, printing and four hands above the strap.

## Measurements used

| Feature | Value (k unless stated) |
|---|---|
| Case | Dedicated rounded-shoulder silhouette, scaled to 42.0 × 48.6 mm. Openings are exactly 20 mm. Broad polished lug-flank bevels, narrow inner-edge highlights and brushing follow the case path on all four shoulders. |
| Crown | At 4 o'clock, 6.6 mm across and about 3.6 mm proud, with a dark seat, rounded end and fine grooves. The crown is layered beneath the case so its root and inner grooves are masked by the metal; only the exposed barrel remains visible. |
| Bezel | 60 broad rounded teeth with wide, shallow crest plateaus and deep shaded recesses and an unchanged 42 mm outer crest. Navy insert about 0.80–1.00. Triangle and a light lume pip with a dark rim at 12, minute dots, five-minute bars and numerals 10–50 centred near 0.90. Numerals use 84% vertical scaling to preserve width without excess height. |
| Chapter | Polished crystal seat near 0.79. Sloping silver 24-hour rehaut from 0.677–0.774, triangles at the even unnumbered hours and dark odd-hour numerals without triangles. Inner minute ticks run from 0.674 towards 0.635, with longer five-minute marks. |
| Markers | Circular plots at 0.55 with radius 0.056 at 1, 2, 4, 5, 7, 8, 10 and 11. Framed bars at 3, 6 and 9. A divided shield spans 0.425–0.63 at 12. All have separate steel frames and lume insets. |
| Date | White rectangular aperture at 4:30, centre radius 0.565, approximately 0.13 × 0.105 with a steel rim. The frame and dark "6" rotate 45° with the aperture. Numeral size is 0.095. |
| Printing | SEIKO baseline near −0.27; Prospex X near −0.185. Red GMT near 0.235, then AUTOMATIC 3 DAYS and regular-weight DIVER'S 300m. |
| Hands | Hour about 0.46 long and 0.108 wide; minute about 0.65 long and 0.064 wide, with split brushed/polished metal and separate lume. Red GMT needle to 0.66, with its open arrowhead spanning 0.40–0.62 and aligned at 212° to the reference, with its short counterweight hidden near the pivot. Seconds needle to the minute track, framed lume capsule and red dot at the capsule's inner end, towards the pivot. |

## Validation

- **Before image:** saved and reviewed before editing. The old generic round rendering lacked the GMT hand, 24-hour chapter, circular plots, divided 12 marker and correct crown/date positions.
- **Visual comparison:** checked in Chrome against the exact supplied photograph, aligned by bezel centre and diameter, including enlarged furniture and normal comparison sizes.
- **Other views:** visually checked as a thumbnail, on rubber and NATO, in outline mode and on a 17 cm wrist. The renderer suite also exercises every catalogue watch on every sample strap and checks unique SVG ids.
- **Budget:** at `strapLen: 12`, the SPB519 is 244 elements and approximately 35.3 KB (7.55 KB gzipped), below the existing 320-element / 50 KB limits. The previous generic rendering was 386 elements and approximately 47.8 KB.
- **Checks:** `npm run build` passes type checking, all 24 tests and the production build.
- **Review output:** temporary photo-comparison pages are kept outside version control. Use `/#gallery` for ongoing catalogue, strap and wrist checks; keep new review captures outside the repo or in ignored `review-artifacts/`.

## Remaining approximations

- **Case:** the outline now follows the rounded 1968 shoulders rather than the shared straight-lug case. Tiny contour differences and photographic perspective remain approximations; catalogue dimensions are retained.
- **Numerals and wordmark:** Arial and Georgia stand in for Seiko's bezel figures and logo. The Prospex X is a simplified outlined vector mark.
- **Rehaut:** the sloped silver ring, triangles and numerals are drawn explicitly; complex photographed reflections are simplified.
- **Micro-printing:** the tiny movement and Japan lines above 6 are omitted, as on the other refined dials.
- **Bracelet:** the shared oyster renderer supplies the three-piece end-link and polished centre. Individual link curvature and reflections remain illustrative.

### Hand finish

Hour and minute hands use two solid metal tones, split down the centre of each blade and counterweight. Lume inserts remain separate. The GMT arrow is red with a light open centre; the seconds hand has the reference's red dot rather than borrowing the SPB451's uncoloured capsule.

### Final refinement

Aligned the supplied 1102 px reference near bezel centre (534, 510), insert radius approximately 313 px, with uniform scaling. Replaced the shared case with a compact continuous outline and curved chamfers, corrected the light bezel pip, brought the GMT arrow base towards the pivot, shortened its visible counterweight and strengthened the applied-marker borders. The existing navy bezel choice is retained because the earlier reference review also considered additional product angles. Visually checked the updated bracelet, rubber, NATO, outline and wrist views.
