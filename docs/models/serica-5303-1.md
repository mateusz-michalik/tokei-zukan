# Serica 5303-1 Diving Chronometer (black enamel) — illustration notes

Refined against Serica's official packshot, two supplied photographs and the official specifications on 26 October 2026. Follow the [watch illustration standard](../watch-illustration-standard.md).

## Reference and dimensions

- **Photos:** Serica's front-on packshot `5303-black-3h-packshot-01.jpg` (`1500 × 2100` px, served from the product page), used for all measurements; plus the supplied front-on product shot (`540 × 756`) and angled studio crop (`291 × 345`), used to confirm the bezel scales, crown and bracelet. They are not stored in production source.
- **Specs:** [Ref. 5303-1](https://serica-watches.com/en/collections/collection-5303/products/5303-1-diving-chronometer) (Care and specifications panel). Catalogue specifications: 39.0 mm diameter, 46.5 mm lug-to-lug, 12.2 mm thickness (glass included), 20 mm lug width, 2 mm double-domed sapphire with inner AR, 8 mm screw-down crown, polished black ceramic insert with double graduation (60 min, 12 h, 15 min countdown), Soprod M100 COSC automatic (42 h power reserve), 300 m water resistance, woven steel bracelet with integrated end links and hinged links (20 → 16 mm).
- **Unit:** `k`, the outer radius of the black ceramic ring. In the packshot the dial centre is near `(753, 980)`, the ceramic ring's outer edge is at `k ≈ 287 px` and the 120-tooth crest at `1.038 k` (`298 px`).
- **Scale:** taking the crest (`1.038 k`) as the specified 39.0 mm (`R = 19.5 mm`) gives `k = R / 1.038 ≈ 18.786 mm`. The case uses the published 46.5 mm lug-to-lug (`±23.25 mm`); the packshot's lug tips are foreshortened to about `±22.7 mm` by the curved lugs. The crown measures `8.2 mm` tall in the photo, matching the published 8 mm.

## Where it lives

- **Selection:** `shape: "serica-5303"` dispatches to `serica5303SVG()` in [serica5303.ts](../../src/render/serica5303.ts). The previous drawing used the generic `round` shape with a two-tone 0–15 bezel, bar markers, sword hands and a SERICA logo below 12, none of which match the watch.
- **Scope:** everything above the strap: case with twisted lyre lugs, 8 mm crown, coin-edge bezel with the ceramic minutes ring and steel 12-hour ring, polished inner bevel, rehaut, enamel dial, markers, printing and handset.
- **Bracelet:** supplied on the woven steel bracelet (`type: "bracelet", style: "mesh"`, named `Woven steel bracelet`). `meshLink` in [strap.ts](../../src/render/strap.ts) draws its integrated end link, hinged polished centre bar and solid terminal before the mesh. Other mesh bracelets keep the plain end link.

## Measurements used

| Feature | Value (`k` unless stated) |
| --- | --- |
| Case & lugs | 39.0 mm bezel crest (`R = 19.5 mm = 1.038 k`), 46.5 mm lug-to-lug (`±23.25 mm`), exact 20 mm open lug slots (`x = −10..+10 mm`) with seats at `±0.965 k`. Slightly angled flat lug tips from `(±10.25, ±23.25)` to `(±12.65, ±22.83 mm)`, flaring along a gently concave flank to `(±15.6, ±13.3 mm)`, just outside the crest, before turning under the bezel. A wide polished lyre bevel covers most of each lug, with a bright outer edge. |
| Crown | Unguarded screw-down crown at 3 o'clock: tube `18.9–19.95 mm` (`4.2 mm` tall); chamfered barrel `19.8–23.5 mm` (`8.0 mm` tall, `4.0 mm` proud of `R`) with 7 deep flutes. |
| Bezel | 120 pointed teeth (`1.008–1.038 k`). Polished black ceramic ring (`0.875–1.000 k`): `MINUTES` along the arc centred at `31°` (`0.945 k`) with a dot at 5 (`0.893 k`); numerals `10`, `20`, `30`, `40` at `0.94 k`; bars at 15, 25, 35, 45, 50 and 55 (`0.895–0.985 k`); minute ticks across the 45–60 countdown (`0.92–0.975 k`). Lume pearl at 12 in a polished cup (`0.89 k`, radius `0.057 k`) across the join with the steel ring. |
| 12-hour ring | Satin steel ring (`0.80–0.875 k`) with engraved black `HEURES` centred at 1 o'clock and `2`–`11` at `0.838 k`; polished inner bevel (`0.725–0.80 k`): a dark slope with a narrow bright band at 3 and 9, a bright outer lip at `0.797 k`, a fine inner edge at `0.73 k` and short reflections on the upper left and lower right. |
| Bezel numerals | Both scales are set radially with their tops outward, so `20`, `30`, `40` and `4`–`8` read upside down from the wearer's side, as on the watch. The exception is the `6`, which is printed upright so it cannot be mistaken for a 9. |
| Crystal & dial | Dark rehaut under the domed crystal (`0.632–0.725 k`) with a dark seat at `0.724 k`, a fine bright crystal rim at `0.719 k`, a faint inner ring at `0.70 k` and a narrow upper-left reflection. Glossy black enamel dial (`0.632 k`) with a thin track circle at `0.627 k` and 60 minute ticks (`0.601–0.629 k`). |
| Markers | Domed Super-LumiNova C3 (`#E9EDD6`): plots at 1, 2, 4, 5, 7, 8, 10 and 11 (centre `0.425 k`, radius `0.043 k`) each joined to the track by a fine white line; batons at 3 and 9 (`0.465–0.624 k`, `0.062 k` wide) and 6 (`0.49–0.624 k`, `0.066 k`); baton at 12 (`0.478–0.624 k`, `0.072 k`) flanked by plots at `±8.8°` (`0.598 k`, radius `0.035 k`). |
| Printing | `CHRONOMÈTRE` (baseline `+0.206 k`, `0.44 k` wide) and `300m-1000ft` with italic units (baseline `+0.27 k`, `0.30 k` wide); brand and `SWISS` curved along the lower track at `0.583 k`, letters upright, `2.35°` apart and clear of the 6 o'clock baton by about `2.5°` either side (`SWISS` centred at `168.5°`). No logo below 12. |
| Hands | White lacquered (`#F3F4F1`) at 10:10:38. Broad-arrow hour hand (`305°`, tip `0.385 k`, barbs `±0.118 k` at `0.20 k`, stem `0.034 k` wide, lume arrowhead). Lance minute hand (`60°`, tip `0.632 k`, maximum width `0.084 k` at `0.32 k`, tail `0.11 k`, lume `0.15–0.566 k` and `0.053 k` wide, leaving a broader white border). Needle seconds hand (`228°`, tip `0.63 k`, tail `0.17 k`) with a lumed lollipop at `0.52 k`. |

## Validation and budget

- **Visual comparison:** compared against the packshot at matching centre and crest scale, side by side and as a 50% overlay, in enlarged dial view, full comparison view and thumbnail size. Bezel rings, markers, hands, crown, lug tips and the bracelet's hinged bar coincide with the photograph.
- **Other views:** checked on the woven steel bracelet, Tropic rubber, an oyster bracelet, outline mode and wrist view, alongside the Oris 771, C60 Pro 300 and MK2 39.5.
- **Budget:** at `strapLen: 12`, the refined illustration uses 243 elements and 33,974 bytes of UTF-8 markup, down from 370 elements and 42,896 bytes on the generic rendering, within the 320-element / 50 KB budget.
- **Checks:** `npm run build` passes type checking, all Vitest tests and the production build.

## Remaining approximations

- Bezel and dial lettering uses system geometric sans-serif fonts (Avenir Next/Futura where available), not Serica's artwork.
- The woven mesh uses the shared diagonal mesh pattern rather than tracing the individual scales.
- The photograph shows the bezel rotated by roughly a degree; the drawing keeps it at zero.
