# Hamilton H69439931 "Khaki Field Mechanical 38mm" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 30 October 2026. The first Hamilton in the catalogue.

## Reference and dimensions

- **Photo:** Hamilton's front-on H69439931 product photo (2000 px square, AVIF), supplied for this work. It is not stored in the repository.
- **Specs:** [H69439931 on Hamilton](https://www.hamiltonwatch.com/en-us/h69439931-khaki-field-mechanical.html):
  - **Case:** 38 mm, 9.5 mm thick, 47 mm lug to lug, 20 mm lugs, stainless steel (matte), sapphire.
  - **Movement:** H-50 hand-wound, 80-hour reserve, Nivachron balance spring.
  - **Water resistance:** 5 bar (50 m).
  - **Strap:** NATO.
- **Variant:** black dial, green textile NATO trimmed with brown leather, no date. Not the Khaki Field Auto, the 42 mm, bronze or date versions.
- **Movement rate:** the H-50 runs at 21,600 vph (based on the ETA 2801), so `beats` is 6.
- **Scale:** one uniform 24.2 px/mm. The case is 920 px across (38 mm), and lug to lug measures 46.9 mm against Hamilton's 47. Width and length agree at that single scale.

## Where it lives

- **Selection:** `shape: "h69439931"` sends the drawing to `h69439931SVG()` in [h69439931.ts](../../src/render/h69439931.ts).
- **Strap:** a single-colour NATO with `leather: "#6B4327"`. NATOs with that field get brown leather tabs and no steel keeper by the case, as on Hamilton's strap ([strap.ts](../../src/render/strap.ts)). The tabs sit at a fixed place on the strap, 12.4 mm past each lug end as measured on the photo; a shorter drawn strap simply doesn't reach them, so they never move with the drawn length.

## Measurements used

All in millimetres, at 38 mm.

| Feature | Value |
|---|---|
| Case | A 19 mm circle. Straight lugs 2.45 mm wide at the tips (inner edge ±10, outer ±12.45), ending at ±23.5; each outer flank runs straight to meet the case at ±15.6. Matte bead-blast finish as a faint grain with soft light on the upper left. |
| Crown | At 3, from 18.6 (tube) to 23.05 mm, 6.4 mm tall, finely knurled. |
| Bezel | Flat matte steel from 19 to 16.4 mm, with a step at 18.3. A dark sloped inner ring from 16.4 to the dial at 15. |
| Track | White minute dashes from 12.75 to 14.35. Beige triangles at the hours, 1.1 mm at the base (14.45) pointing in to 12.75. |
| Numerals | Drawn as strokes, not a font: rounded digits with round ends and a plain vertical bar for 1, as on the dial. Hours 2.9 mm tall with 0.6 mm strokes, centred at 10.95; the 13–24 ring 1.3 mm tall with 0.26 mm strokes at 7.6. Printed white, not lume. HAMILTON at −3.97, 8.8 mm wide. SWISS and MADE either side of 6. |
| Hands | Pose 10:09:37, as in the photo. Hour: a white-framed pencil 1.28 mm wide, its beige lume running from 1.9 mm (close to the pivot) to 7.3, lance tip to 8.5. Minute: 1.02 mm wide, lume from 2.3 to 10.9, tip to 12.1. Seconds: a white needle with a 1.7 mm beige lume arrowhead to 12.6, and a round counterweight 0.9 mm across at 5.8 mm behind the pivot. White hub. Widths and lume panels were matched to the photo at the same scale. |

## Live time

The hour, minute and seconds hands are tagged; the seconds hand moves at 6 beats a second, the H-50's 21,600 vph.

## Lume

Hamilton's copy says "luminescent numerals, indexes showing hours and minutes", but the photo shows the hour numerals and minute dashes in flat white print. Only the hour triangles carry the beige lume colour of the hands. The photo is the stronger evidence, so lume is on the beige triangles (as indices), the hands' beige panels (hands) and the seconds tip (seconds). The numerals, dashes, 13–24 ring and print stay dark at night.

Hamilton doesn't name the material or colour, and no night photo of this reference was found. The glow is a generic green (`#8CFF6E`) with certainty `uncertain`; the beige daytime paint isn't evidence of the night colour. A first version lit the numerals and dashes too, following Hamilton's wording, and a review against the photo corrected it. The shared glow strength wasn't changed: it applies to every watch.

## Prices

Hamilton's own stores, current: CHF 550 (Switzerland, first as Hamilton's home market), €625 (Germany), A$1,000, US$675 and ¥94,600. No launch price could be verified from Hamilton or reputable press; reports of the 2018 H-50 launch price weren't confirmed, so none is recorded.

## Validation

- **Overlay:** the drawing was rendered at the photo's uniform 24.2 px/mm and overlaid at 50%. The case, lugs, crown, bezel, track, triangles, numerals and hands line up; the numeral positions were adjusted against it.
- **Other views:** checked Day, Dusk and Night, outline, thumbnail, the leather-tipped NATO, bracelet and leather straps.
- **Budget:** at `strapLen: 12`, 100 elements and about 13.8 KB, within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Numerals:** hand-drawn stroke shapes approximating Hamilton's; the 2, 4 and 7 in particular differ slightly in their curves and angles.
- **Case finish:** the bead-blast texture is a faint grain; the photo's subtle edge shading isn't modelled.
- **Strap:** the NATO's weave is an offset block pattern suggesting woven nylon, not the real ribbed weave. The leather tabs are flat bands, without the photo's folded leather keeper shape.
