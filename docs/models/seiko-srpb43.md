# Seiko SRPB43 "Presage Cocktail Time" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 30 October 2026.

## Reference and dimensions

- **Photo:** Seiko's front-on SRPB43J1 product photo (1102 px square, transparent background), supplied for this work. It is not stored in the repository.
- **Specs:** [SRPB43J1 on Seiko](https://www.seikowatches.com/global-en/products/presage/srpb43j1): 40.5 mm diameter, 11.8 mm thick, 20 mm between the lugs, box-shaped Hardlex, 4R35 automatic with about 41 hours' reserve, 5 bar, cow leather strap with a three-fold push-button clasp, see-through screw case back, 70 g. Seiko's German and Australian pages give the same figures. Seiko's global page gives no lug-to-lug; [Seiko USA](https://seikousa.com/products/srpb43) lists its "Length" as 47.5 mm, which the catalogue uses. The photo measures about 47.2 mm, as [Worn & Wound](https://wornandwound.com/review/hands-on-video-with-the-seiko-presage-cocktail-time-ref-srpb43/) also gives.
- **Variant:** light-blue "Sky Diving" dial with pressed radial lines, polished steel indices and hands, blue seconds hand, black leather strap with blue stitching. Seiko USA sells it as SRPB43; elsewhere it is the SRPB43J1. Its Japanese domestic twin, the SARY075, no longer has a page on Seiko Japan, so no yen price is recorded.
- **Movement rate:** the 4R35 runs at 21,600 vph (Seiko USA), so `beats` is 6.
- **Scale:** the case at 9 o'clock is 309 px from the bezel's centre at (518, 512) px, and the top edge 308 px. Taking that as the published 40.5 mm diameter gives 15.23 px/mm.
- **Perspective:** the photo is taken slightly from the right: the case flank shows beyond the bezel at 3 o'clock, and the lugs measure 9.3 mm left and 11.2 mm right of centre. The drawing is symmetric, using the average of the two sides. The hand pivot is at (516.5, 512.3) px, within 2 px of the bezel's centre.

## Where it lives

- **Selection:** `shape: "srpb43"` sends the drawing to `srpb43SVG()` in [srpb43.ts](../../src/render/srpb43.ts).
- **Scope:** everything above the strap: case, crown, bezel, crystal rim, dial texture, minute track, indices, date, printing and hands. The applied SEIKO reuses the vector wordmark from [ssk003.ts](../../src/render/ssk003.ts), stretched to this logo's wider proportions.
- **Strap:** the catalogue strap is plain black leather with navy stitching, drawn by [strap.ts](../../src/render/strap.ts).
- **No lume:** the catalogue's `night` block has no parts, so the watch only dims at Dusk and Night, and the caption says it has no lume. See [lume and dark mode](../lume.md).

## Measurements used

All in millimetres, at the 40.5 mm size.

| Feature | Value |
|---|---|
| Case | A 20.25 mm circle. The lug openings are 20 mm and the inner edges run straight to the circle. Lug tips are 2 mm wide (outer edge at 12) with rounded corners; each outer flank runs almost straight from the tip into the circle at ±14.2 mm. |
| Crown | 3 o'clock: a short neck from 20 to 20.45, then a fluted barrel to 23.7 mm, 6.6 mm across with twelve flutes, and a smooth domed end to 24.4 mm. Drawn beneath the case. |
| Bezel | Polished steel sloping from 20.25 to 18.8 mm, with a step at 19.9 mm. |
| Crystal rim | 17.9–18.8 mm: the dial edge seen through the box crystal's thick wall, drawn as a dark grey-blue band with a bright inner line. |
| Dial | Pressed radial lines: ridges every 3°, fine lines between them, and 60 brighter rays. Each line starts at a slightly different radius (ridges and rays between 1.3 and 4.5 mm, fine lines between 5 and 10 mm), so the texture thins towards the hub without forming rings. |
| Minute track | Printed in dark navy: a long tick on each minute from 15.9 to 16.95 mm, and four short ticks between from 16.35 mm. Ticks under an index are left out. |
| Indices | Applied faceted daggers pointing inwards, widest at 16.3 mm and cut square at 17 mm. 1.25 mm wide, 1.6 mm at 12 and 6. They start at 10.8 mm at 12, 6 and 9, and 11.2 mm elsewhere. At 3, a 1.4 mm bar from 13.7 to 16.4 mm points outwards to 17.1 mm. The facet facing the upper left is bright. |
| Date | White wheel with a black numeral in a 4.1 × 3.2 mm polished frame centred at 11.05 mm. |
| Printing | Applied SEIKO 1.32 mm tall and 7.9 mm wide, top at −7.85: darker steel faces over a bright rim offset to the upper left, with a dark edge. PRESAGE centred at 7.15 mm (6.1 mm wide) and AUTOMATIC at 8.5 mm (5.6 mm wide), in a serif. "MADE IN JAPAN" and "4R35-01M2 R 2" at 15.2 mm, either side of 6. |
| Hands | Pose as in the photo: hour at 305°, minute at 52°, seconds at 252°. Hour: dauphine to 10.1 mm, 1.45 mm wide, with a pointed tail to 2.4 mm. Minute: dauphine to 16.8 mm, 1.3 mm wide, tail to 2.3 mm. Both are split into a bright and a dark facet. Seconds: dark blue needle to 15.9 mm, with a tail to a hollow diamond from 3.4 to 5.4 mm. Blue hub 1.24 mm across. |

## Live time

The hour, minute and seconds hands are tagged for live time; the seconds hand sweeps at 6 beats a second.

## Validation

- **Overlay:** rendered the catalogue entry at the photo's scale (15.23 px/mm) and overlaid it at 50% opacity. The case, lugs, crown, bezel, indices, date, printing and hands fall on the photo's features.
- **Other views:** checked the details page in Day, Dusk and Night, Compare side by side and as outlines with the SPB317 and SPB507, a 17 cm wrist, a thumbnail and a NATO strap.
- **Budget:** at `strapLen: 12`, 112 elements and about 31.5 KB (9.0 KB gzipped), within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.
- **Review:** a reviewer's comparison found the minute hand at 60.5° (measured off the 2 o'clock index under it) instead of the photo's 52°, rings in the dial texture where groups of lines started at the same radius, and a pale, hollow-looking SEIKO. All three are corrected.

## Remaining approximations

- **Dial:** the pressed pattern is a few hundred straight radial lines. The real dial's lines are finer and catch the light in a shifting starburst; at small sizes the drawn lines can shimmer (moiré).
- **Case finish:** the case is mirror-polished. The drawing uses one reflection along each lug's flank, a polished rim and a banded bezel, not the photo's full reflections.
- **Typography:** SEIKO reuses the SSK003's vector wordmark, stretched wider; the real logo has heavier serifs. PRESAGE and AUTOMATIC use the system's serif font; the small print uses Arial. The date numeral is Helvetica, widened.
- **Crystal:** the box Hardlex's distortion at the dial edge is reduced to a dark rim and one soft reflection.
