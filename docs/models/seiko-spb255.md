# Seiko SPB255 Black Series 1968 — illustration notes

Refined against the supplied references on 25 October 2026. Follow the [illustration standard](../watch-illustration-standard.md).

## References and dimensions

The user supplied the Seiko Black Series trio comparison (`SPB253J1`, `SPB255J1`, `SPB257J1`, 686 × 409) and an angled close-up of `SPB255J1` (823 × 452). SPB255 is the 1968 Diver's Modern Re-interpretation in the Black Series limited edition, pairing the 1968 case and 4 o'clock crown with matte black hard coating, orange 0–20 bezel markings, an orange minute hand, cream LumiBrite, and a brown Seichu braided nylon strap (plus an alternate black silicone strap).

Catalogue dimensions are retained: 42.0 mm diameter, 48.8 mm lug-to-lug, 12.5 mm thickness and 20 mm lug width. In the front-facing crop (`234 × 409`), the bezel insert is centred near `(109.5, 155.0)` with insert radius `k ≈ 80 px`. With the 1968 case construction, `k = (diameter / 2) / 1.045 ≈ 20.10 mm`.

## Implementation

- **Selection:** `shape: "spb255"` dispatches to `spb255SVG()` in [spb255.ts](../../src/render/spb255.ts).
- **Case:** reuses the 1968 rounded-shoulder silhouette and lug-flank bevel geometry (`spb519Case` from [spb519.ts](../../src/render/spb519.ts), exported as `spb255Case`), scaled to 42.0 × 48.8 mm with exact 20 mm open lug slots and dark charcoal hard-coat shading.
- **Strap:** passes `seichu: true` to [strap.ts](../../src/render/strap.ts) so the supplied brown nylon (`#514239`) renders with the repeating Seichu braid and dark `SEIKO` keeper.

## Important proportions and finishes

| Feature | Final treatment |
| --- | --- |
| Case & crown | 1968 rounded shoulders with dark-coated lug-flank bevels and fine crease highlights. Screw-down knurled crown at 4 o'clock (`28°`), seated beneath the case flank so the case masks its root. |
| Bezel | 60 broad rounded 1968 teeth in dark charcoal. Matte black insert (`#1B1D20`) with an orange (`#F4A12A`) sector across the full first 20 minutes: triangle at 12 with ivory lume pip, minute dots 1–19, five-minute bars at 5 and 15, and **both `10` and `20` numerals in orange** (unlike SPB253 where orange ends at 15 and `20` is grey). Marks from 21–59 and numerals `30`, `40`, `50` are muted grey (`#B5BCBD`). |
| Chapter | Narrow reflective dark-steel crystal seat around `0.784 k` and printed minute track on the matte black dial (`0.706–0.752 k` minor, `0.692–0.755 k` major, wider 12 mark), without the SPB519's 24-hour GMT rehaut. |
| Indices | Circular plots at `0.568 k` (radius `0.060 k`) at 1, 2, 4, 5, 7, 8, 10 and 11; framed batons at 6 and 9; divided pentagon shield at 12 (`0.43–0.65 k`); and a short framed lume plot (`0.676–0.722 k`) outboard of the 3 o'clock date aperture. |
| Date | White rectangular aperture at 3 o'clock (`dx = 0.562 k`, `0.148 × 0.102 k`) with a dark stepped frame and black `6`. |
| Printing | `SEIKO` baseline at `−0.260 k`; Prospex `X` at `+0.205 k`; `AUTOMATIC` at `+0.292 k`; bold `DIVER’S 200m` at `+0.362 k` in light off-white (`#E4E7DE`). |
| Hands | Broad 1968 hour hand (`0.455 k` long, `0.108 k` wide) with split brushed/polished dark metal and cream lume divided near the tip. Sword minute hand (`0.67 k` long, `0.066 k` wide) with a two-tone dark metal root/tail and bright orange insert (`#F4A12A`). Seconds needle (`256°`) with a framed paddle containing an inner red-orange dot (`#E85A34` at `0.485 k`) and outer cream lume rectangle. |

## Validation and budget

Compared the rendered SVG against both supplied photographs (front trio crop and angled close-up), then verified the supplied Seichu nylon, black waffle silicone option, NATO strap, outline mode, thumbnail and 17 cm wrist views.

At `strapLen: 12`, the refined SPB255 illustration contains 185 elements and 30,142 bytes of markup (approximately 6.82 KB gzipped), down from 266 elements and 36,099 bytes on the previous generic round rendering and well within the 320-element / 50 KB budget. `npm run build` passes type checking, all 35 tests and the production build, and SHA-256 rendering fingerprints confirm all 14 other catalogue models are unchanged.

## Remaining approximations

The case remains symmetric and true to catalogue dimensions rather than copying photographic perspective. The Seichu weave and dark keeper use compact repeating SVG geometry, Arial and Georgia approximate the numerals and wordmark, the Prospex symbol is simplified, and tiny movement/origin micro-printing at the bottom edge of the dial is omitted.
