# Seiko SSC947 "Pogue" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 24 October 2026.

## Reference

- **Photo:** the supplied front-on Seiko product photo (1102 px square, transparent background). It isn't stored in the repo.
- **Dimensions:** catalogue values of 41.4 mm diameter, 45.9 mm lug to lug and 21 mm lug width.
- **Unit of measurement:** k, the outer radius of the bezel insert. In the photo k = 318.8 px, centred at (522.5, 511).
- **Scale:** the case at 9 o'clock reaches 1.018 k. Taking that as the 41.4 mm diameter gives k = R / 1.018. On that scale the photo's lug-to-lug comes out at 1.12 k, which agrees with the 45.9 mm spec.
- **Perspective:** the photo is slightly asymmetric. The right-hand lugs read about 0.03–0.06 k wider than the left. The drawing uses the average of the two sides.

## Where it lives

- **Selection:** `shape: "speedtimer"` sends the drawing to `ssc947SVG()` in [ssc947.ts](../../src/render/ssc947.ts).
- **Scope:** that module draws everything above the strap: case, crown and pushers, bezel, flange, dial, subdials, printing and hands.
- **Not for other models:** the shape and its furniture are Seiko Speedtimer-specific. Don't assign it to another watch just to get the case.

## Measurements used

| Feature | Value (k unless stated) |
|---|---|
| Case circle | 1.005 R. Lug openings are exactly 21 mm. |
| Lugs | Outer tip at lug width/2 + 0.155 R. The tip is cut on a slant, 0.45 mm lower at the outside. The outer edge has a slope of ≈0.415 and joins the case circle at 2, 4, 8 and 10 o'clock. |
| Crown | At 3 o'clock, 6.9 mm tall, standing ≈3.6 mm proud. Domed outer corners. Seven raised ridges that taper to a point towards the case. |
| Pushers | At 64.5° and 115.5°. Broad case-side housing (4.2 mm) with a smaller, flat-ended button (3.4 mm) projecting from it and a lit end face. The housing shoulder remains visible on both sides of the button. Projection is 2.5 mm beyond the case radius, shortened by 0.8 mm after visual review. Corrected from the reversed step after review of the supplied close-up. |
| Bezel insert | 0.856–1.0. Blue, with red from 60 to 250 on the scale (0–86.4°). |
| Tachymeter scale | Angle = 21600 / value. Numerals: cap height ≈0.059, centred at 0.942, horizontal scale 0.82. Numerals between 112° and 248° are turned to read from inside the dial. TACHYMETER is centred on 23° and spans ≈0.44 k of arc. |
| Rings | Polished bevel edge ≈0.846. Near-black ring 0.77–0.83. Black flange 0.689–0.772 with 1/5-second ticks, heavier every second and every 5 seconds. |
| Dial | Radius 0.689. Smooth golden-orange glow with fine radial brushing (one compound path of hairlines). Broad alternating wedges looked unrealistic. |
| Subdials | (±0.364, 0) radius 0.237, and (0, 0.372) radius 0.224. Navy. |
| Markers | Regular: 0.545–0.672 long × 0.088 wide. 3, 6 and 9: bars 0.05 × 0.10 at 0.62–0.67. 12: double, 0.126 × 2 × 0.052. |
| Hands | Hour 0.47 long, 0.07 wide, lume 0.125–0.415. Minute 0.66 long, 0.058 wide, lume 0.135–0.61. Both tails 0.18. The red chronograph hand reaches 0.748, into the minute track, with a black tail of 0.29 and 0.5 mm wide. The small-seconds hand is a red teardrop with a broad, round base. |
| Date | 4:30 position, r 0.53 at 132°. Framed white aperture. |
| Printing | SEIKO wordmark centred at −0.36, 0.376 k wide. Prospex X at −0.25: a solid diagonal with serif bars, crossed by an outlined diagonal. F and E power-reserve marks outside the small seconds. |

## Validation

- **Visual comparison:** checked against the photo at the same scale and centre, full view and enlarged crops. Also checked at gallery size, as a thumbnail, on a 17 cm wrist, in outline mode, and on NATO, rubber, leather and the stock bracelet.
- **Budget:** 293 elements and 43.7 KB (10.6 KB gzipped) at `strapLen: 12` on the bracelet. Both are covered by the renderer's budget test.
- **Id test:** checks that every id is unique across all catalogue watches and straps. It caught the strap's brushing pattern colliding with this module's bezel sheen, and a mesh pattern that was defined twice.
- **Outline test:** checks the case outline is symmetric and has no zero-length arcs. It caught a real bug during the work, where the left arc collapsed into a straight chord.

## Remaining approximations

- **Case:** the finish is simplified to brushing with a narrow polished edge. The photo shows broader polished facets on the lug flanks.
- **Bracelet:** uses the shared oyster renderer, now with softer links, a broad reflection, fine brushing and a three-piece curved end link. It still keeps the generic 0.3/0.4/0.3 row widths; the SSC947's centre links are closer to 0.47 of the width.
- **Text:** the micro-printing ("MOV'T JAPAN", calibre code) is left out. The Prospex X is a simplified mark.
- **Subdials:** the 24-hour subdial's tick count (48) is an estimate.

### Hand finish

Hour and minute hands use two solid metal tones, split down the centre of each blade and counterweight: muted brushed metal and a lighter polished face. Keep the lume inserts separate. Avoid multi-stop metal gradients on these hands; the crisp two-tone split is the intended finish.
