# Seiko SPB253 Black Series 1965 — illustration notes

Refined against the supplied references on 25 October 2026. Follow the [illustration standard](../watch-illustration-standard.md).

## References and dimensions

The user supplied `SPB253a.png` (288 × 468), a dial close-up and the [Seiko Black Series collection page](https://www.seikowatches.com/global-en/products/prospex/special/blackseries_limited-2nd). Seiko identifies SPB253 as the 1965 reinterpretation and describes the orange accents, Seichu braided strap and included black silicone strap. The family shares its visual palette with SPB257, but not its case or date layout.

Catalogue dimensions remain 40.5 mm diameter, 47.6 mm lug-to-lug, 13.2 mm thickness and 20 mm lug spacing. No specification was changed to fit the photograph. The full photo has perspective and unequal visible lug lengths; use uniform scaling around the bezel centre, approximately (144, 179), with insert radius about 117 pixels.

## Implementation

`shape: "spb253"` selects [spb253.ts](../../src/render/spb253.ts). It owns the case, crown, bezel, dial furniture and hands. The case uses k = (diameter / 2) / 1.045, with exact 20 mm openings and narrow tapered lug shoulders. Its crown is at 3, without guards.

The shared [strap renderer](../../src/render/strap.ts) receives an optional `seichu` geometry flag for this reference. It supplies a repeating braided pattern and a dark Seiko keeper on nylon straps; other strap types follow their usual rendering paths. This does not change the SPB257 or other catalogue renderings.

## Important proportions and finishes

| Feature | Final treatment |
| --- | --- |
| Bezel | Dark-coated 60-tooth plateau-crested edge matching the Black Series family, small minute dots at 0.868 k. Orange triangle, dots and five-minute bars through 15; only the 10 numeral is orange. The 20 is grey. |
| Chapter | Thin reflective crystal seat, darker above and lighter below, with separate minute ticks. |
| Indices | Batons from 0.47–0.64 k, 0.10 k wide. A single frame with two ivory inserts at 12. A short lume plot survives outboard of the date at 3. |
| Date | White rectangular aperture centred at 0.575 k, approximately 0.15 × 0.10 k; dark surround and a broad black 6. No magnifier. |
| Printing | SEIKO baseline −0.255 k; Prospex below the pivot; AUTOMATIC and DIVER’S 200m. Dial printing is lighter than the grey bezel markings. |
| Hands | Hour length 0.45 k and minute length 0.69 k, with two flat metal finishes and separate inserts. Orange minute insert; grey seconds needle with an ivory rectangular capsule. Pose: 300°, 53°, 252°. |
| Colour | Charcoal case/dial, grey bezel markings, ivory lume. Orange `#F4A12A` follows the brighter supplied reference; SPB257 retains its existing palette. Nylon is muted brown `#514239`. |

## Validation and budget

Compared the enlarged SVG with the photograph, then checked supplied nylon, silicone, NATO, outline and wrist views. A before SVG and temporary reference comparisons are outside tracked source.

At `strapLen: 12`, the final illustration contains 179 elements and 38,059 bytes of markup (approximately 7.05 KB gzipped), within the existing 320-element / 50 KB limits. All tests, type checking and production build pass.

## Remaining approximations

The case remains symmetric and dimensionally consistent rather than reproducing photographic perspective. The braid uses a compact repeating pattern rather than individual fibres; the keeper is simplified and the top buckle is omitted. Bracelet and alternative strap details remain shared. Arial and Georgia approximate the lettering, the Prospex symbol is simplified and tiny movement printing is omitted. Reflections suggest the dark coating and curved crystal without expensive filters or raster assets.

The refinement corrected the earlier rectangular bezel minute marks, incomplete orange sector, overlong hands and markers, absent 3 o'clock lume plot, high wordmark, bright silver bezel teeth and generic horizontal nylon ribs.
