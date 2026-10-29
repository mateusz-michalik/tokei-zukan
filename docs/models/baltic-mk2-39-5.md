# Baltic Aquascaphe MK2 39.5 (Blue) — illustration notes

Refined against the supplied front-facing product photograph and official specifications on 25 October 2026. Follow the [watch illustration standard](../watch-illustration-standard.md).

## Reference and dimensions

- **Photo:** the supplied front-on Baltic Aquascaphe MK2 39.5 Blue FKM photograph (`692 × 1024` px after decoding from the `1353 × 2000` WebP asset). It is not stored in production source.
- **Specs:** [Aquascaphe MK2 Blue](https://baltic-watches.com/en/products/aquascaphe-mk2-blue). Catalogue dimensions retained: 39.5 mm diameter at the bezel, 47.0 mm lug-to-lug, 12.9 mm thickness (10.7 mm without glass), 20 mm lug width, double-domed sapphire crystal with internal AR, unidirectional 120-click sapphire bezel, Miyota 9039 automatic (42 h power reserve), 200 m water resistance.
- **Unit:** `k`, the outer radius of the sapphire bezel insert. In the decoded reference image, the insert is centred near `(340.5, 474.0)` with radius `k ≈ 257.5 px` and the 80-tooth bezel crest reaches `1.048 k` (`269.9 px`).
- **Scale:** taking the bezel tooth crest (`1.048 k`) as the specified 39.5 mm diameter (`R = 19.75 mm`) gives `k = R / 1.048 ≈ 18.845 mm`. The case uses the published 47.0 mm lug-to-lug (`±23.5 mm`) and exact 20 mm (`±10 mm`) lug openings.

## Where it lives

- **Selection:** `shape: "mk2-39-5"` dispatches to `mk2395SVG()` in [mk2395.ts](../../src/render/mk2395.ts).
- **Scope:** everything above the strap: 316L steel case with vertically brushed lugs and flat-top crown guards, screw-down crown, 80-tooth coin-edge bezel with glossy sapphire insert, double-domed sapphire optical edge halo, glossy blue dial with scaled railway minute track, 3D BGW9 lumicast appliques, printing and handset.
- **Strap:** supplied on the blue FKM Tropic-style vulcanised rubber strap (`#3E5A6F`), rendered through [strap.ts](../../src/render/strap.ts) with a fine diamond basketweave pattern, smooth outer edge rails, soft lug-seat bend shading, and alternating 2–1–2 round perforations. Baltic's Beads of Rice, Flat Link, and Black FKM Rubber options are included in `strapOptions`.

## Measurements used

| Feature | Value (`k` unless stated) |
| --- | --- |
| Case & guards | 39.5 mm bezel crest (`R = 19.75 mm = 1.048 k`), 47.0 mm lug-to-lug (`±23.5 mm`), exact 20 mm open lug slots (`x = −10..+10 mm`) with recessed seats at `±0.955 k`. Outer lug tips sit at `±12.22 mm`, tapering smoothly into the bezel near `±13.65 mm`. Vertical brushing and narrow flank chamfers on the lugs. Right flank integrates the MK2 flat-top crown guards (`x = 20.85..21.41 mm`, `y = ±3.25..±5.65 mm`) with polished upper bevels flanking the crown pocket. |
| Crown | Screw-down knurled barrel at 3 o'clock (`6.0 mm` tall, projecting to `22.67 mm`, or `2.92 mm` proud of `R`), with 11 horizontal grooves and a smooth polished domed end cap. |
| Bezel | 80-tooth coin-edge steel rim (`1.012–1.050 k`). Glossy deep navy sapphire insert (`0.848–0.998 k`) with diagonal sapphire reflections, continuous white inner ring at `0.854 k`, inner-half minute ticks (`0.854–0.913 k`), full-width five-minute bars (`0.854–0.974 k`), inverted BGW9 triangle at 12 (`0.874–0.971 k`, half-width `0.068 k`), and bold geometric numerals at `15`, `30` and `45` centred at `0.918 k`. |
| Crystal & railway track | Polished steel inner bezel lip (`0.826–0.848 k`) and double-domed sapphire crystal edge refraction halo (`0.772–0.825 k`). Glossy marine blue dial (`0.766 k`) encircled by a continuous white railway ring at `0.738 k`, outward five-minute bridge ticks (`0.738–0.765 k`), inward minute ticks (`0.678–0.738 k`), extended crosshairs to `0.616 k` at 3/6/9, and upright five-minute numerals (`5, 10, 20, 25, 35, 40, 50, 55`) centred at `0.684 k`. |
| Markers | 3D BGW9 lumicast appliques with silver-grey 3D rims and drop shadows: applied geometric `12` (`−0.600..−0.448 k`), rounded shark-tooth triangles at 3, 6 and 9 (`0.414–0.614 k`, base width `0.132 k`), and circular plots at 1, 2, 4, 5, 7, 8, 10 and 11 (centre `0.556 k`, outer radius `0.053 k`, lume radius `0.045 k`). |
| Printing | Wide-tracked geometric `BALTIC` wordmark at `y = −0.242 k` (`0.348 k` wide); `AQUASCAPHE` at `+0.239 k` (`0.332 k` wide) and `200M` at `+0.291 k` (`0.138 k` wide). |
| Hands | Circular hub collar (`r = 0.068 k`). Faceted pencil hour hand (`303.5°`, length `0.476 k`, width `0.092 k`, lume `0.122–0.442 k`) and minute hand (`48.0°`, length `0.695 k`, width `0.074 k`, longer metal root with lume `0.208–0.654 k`), each split down the centre into brushed and polished metal halves. Slender silver lollipop seconds hand (`223.0°`, tip `0.725 k`, tail `0.198 k`, lumed lollipop at `0.433 k` with outer radius `0.045 k` and inner radius `0.033 k`). |

## Validation and budget

- **Visual comparison:** compared against the supplied photograph at matching centre and bezel-insert scale, in enlarged dial view, full comparison view, and thumbnail size.
- **Other views:** checked on the supplied blue FKM rubber strap, Beads of Rice bracelet, Flat Link bracelet, black FKM rubber, NATO strap, outline mode and 17 cm wrist view.
- **Budget:** at `strapLen: 12`, the refined `baltic-mk2-39-5` illustration uses 171 elements and 32,684 bytes of UTF-8 markup, down from 335 elements and 44,164 bytes on the previous generic rendering and well below the 320-element / 50 KB budget.
- **Checks:** `npm run build` passes type checking, all Vitest tests, and the production build; SHA-256 rendering fingerprints confirm all 13 other catalogue models remain unchanged.

## Remaining approximations

- **Case & strap:** the case outline and lug openings are symmetric and true to Baltic's published dimensions rather than reproducing photographic perspective or drilled-lug side holes invisible from the front. The FKM strap's diamond texture and 2–1–2 perforations use compact repeating SVG geometry.
- **Typography:** system geometric sans-serif fonts (`Gill Sans` / `Trebuchet MS` / `Arial`) with explicit width control stand in for the dial printing and bezel numerals, while the applied `12` is drawn as an exact vector path.
