# Christopher Ward C60 Trident Pro 300 (40 mm) — illustration notes

Refined against the supplied front-facing product photograph and official specifications on 25 October 2026. Follow the [watch illustration standard](../watch-illustration-standard.md).

## Reference and dimensions

- **Photo:** the supplied front-on Christopher Ward C60 Trident Pro 300 40 mm Black on Bader bracelet photograph (`1021 × 1024` px). It is not stored in production source.
- **Specs:** [C60 Trident Pro 300 (`C60-40ADA31S0KK1-B0`)](https://www.christopherward.com/trident-pro-300-watches/c60-trident-pro-300/C60-40ADA31S0KK1-B0.html). Catalogue specifications: 40.0 mm diameter, 47.45 mm lug-to-lug, 11.3 mm thickness, 20 mm lug width, flat anti-reflective sapphire crystal, two-part unidirectional zirconia ceramic and fixed steel bezel, Sellita SW200-1 automatic (38 h power reserve), 300 m water resistance.
- **Unit:** `k`, the outer radius of the black ceramic bezel insert. In the supplied photograph, the insert is centred near `(504.5, 511.0)` with radius `k ≈ 242.5 px` and the 120-tooth bezel crest reaches `1.033 k` (`250.5 px`).
- **Scale:** taking the bezel tooth crest (`1.033 k`) as the specified 40.0 mm diameter (`R = 20.0 mm`) gives `k = R / 1.033 ≈ 19.361 mm`. The case uses the published 47.45 mm lug-to-lug (`±23.725 mm`) and exact 20 mm (`±10 mm`) lug openings.

## Where it lives

- **Selection:** `shape: "c60-pro-300"` dispatches to `c60300SVG()` in [c60300.ts](../../src/render/c60300.ts).
- **Scope:** everything above the strap: Light-catcher™ 316L steel case with polished outer lug chamfers and sloped crown guards, deep-fluted screw-down crown, 120-tooth coin-edge bezel with outer black ceramic insert and fixed brushed steel inner minute ring, glossy black lacquer dial, outer minute track, applied twin-flags logo, diamond-faceted applied baton markers, 6 o'clock framed date aperture, lower printing, and Trident handset.
- **Bracelet & straps:** supplied on the brushed 3-link Bader bracelet (`type: "bracelet", style: "oyster", centre: "brushed"`, with a 46% centre link width), with `Hybrid rubber, black` and `Consort bracelet` in `strapOptions`.

## Measurements used

| Feature | Value (`k` unless stated) |
| --- | --- |
| Case & guards | 40.0 mm bezel crest (`R = 20.0 mm = 1.033 k`), 47.45 mm lug-to-lug (`±23.725 mm`), exact 20 mm open lug slots (`x = −10..+10 mm`) with recessed seats at `±0.962 k`. Angled outer lug tips slope from `(±10.25, ±23.725 mm)` to `(±12.86, ±21.18 mm)` with Light-catcher™ polished outer lug chamfers running into the bezel join at `(±14.75, ±14.0 mm)`. Right flank carries sloped crown guards (`x = 18.42..20.48 mm`, `y = ±3.35..±7.85 mm`). |
| Crown | Deep-fluted screw-down crown at 3 o'clock (`6.56 mm` tall, projecting to `23.27 mm`, or `3.27 mm` proud of `R`), with 11 horizontal flutes and a stepped end bevel. |
| Two-part bezel | 120-tooth coin-edge steel rim (`1.005–1.034 k`). Rotating outer black ceramic insert (`0.870–0.998 k`) with diagonal specular reflection bands, hollow white triangle at 12 (`0.888–0.984 k`), and bold Arabic numerals `5` through `55` at every five-minute position centred at `0.933 k`. Fixed brushed steel inner ring (`0.782–0.868 k`) with 60 dark radial minute marks (`0.814–0.864 k` major, `0.822–0.860 k` minor). |
| Dial & track | Glossy black lacquer dial (`0.775 k`) with white minute ticks (`0.688–0.742 k` major, `0.695–0.740 k` minor) and `SWISS` / `MADE` flanking the 6 o'clock marker at `0.715 k`. |
| Markers & date | Top-brushed, diamond-faceted applied baton markers filled with SLN X1 BL C1 lume: double baton at 12 (`0.500–0.728 k`, each `0.064 k` wide with a `0.022 k` gap), single batons at 1–5 and 7–11 (`0.504–0.728 k`, `0.068 k` wide), and a short baton (`0.660–0.728 k`) below the 6 o'clock date aperture. Stepped metallic date frame at 6 (`y = +0.556 k`, `0.136 × 0.168 k`) with a black date disc and white `8`. |
| Logo & printing | Applied metallic twin-flags logo centred at `y = −0.300 k` (English cross on the left, inverted Swiss cross of four squares on the right, each `3 × 3` grid of `0.032 k` cells). Lower dial printing: red `AUTOMATIC` (`#E03A2E`) at `y = +0.304 k` and white `300m|1000ft` at `y = +0.364 k`. |
| Hands | Broad triangular/spade hour hand (`291.5°`, tip `0.485 k`, head width `0.118 k`, tail `0.102 k`, triangular lume `0.136–0.432 k`) and tapered sword minute hand (`47.5°`, tip `0.702 k`, width `0.060 k`, tail `0.110 k`, lume `0.152–0.676 k`), both split down the centre into brushed and polished metal halves. Slender seconds hand (`199.5°`) with the 3-pronged Trident counterweight (`+0.142..+0.296 k`) and red-tipped lumed arrow pointer (`−0.500..−0.722 k`). |

## Validation and budget

- **Visual comparison:** compared against the supplied photograph at matching centre and bezel-insert scale, in enlarged dial view, full comparison view, and thumbnail size.
- **Other views:** checked on the supplied Bader bracelet, Hybrid rubber strap, Consort bracelet, Tropic rubber, Bond NATO, outline mode, and 17 cm wrist view.
- **Budget:** at `strapLen: 12`, the refined `christopher-ward-c60-pro-300` illustration uses 254 elements and 37,405 bytes of UTF-8 markup, down from 334 elements and 43,782 bytes on the previous generic rendering and well within the 320-element / 50 KB budget.
- **Checks:** `npm run build` passes type checking, all Vitest tests, and the production build.
