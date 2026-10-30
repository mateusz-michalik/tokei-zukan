# Seiko SPB507 "Prospex Alpinist" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 30 October 2026.

## Reference and dimensions

- **Why this reference:** the library plan named the SPB121J1. That green Alpinist is discontinued. Its successor, the SPB507J1 (launched November 2025), has the same layout and colours, so the maintainer chose to add the current reference instead. The SPB121 is not in the catalogue, and this drawing doesn't stand in for it: the SPB507 has the 6R55 ("AUTOMATIC 3 DAYS") and is 12.7 mm thick.
- **Photo:** Seiko's front-on SPB507J1 product photo (1102 px square, transparent background), supplied for this work. It is not stored in the repository.
- **Specs:** [SPB507J1 on Seiko](https://www.seikowatches.com/global-en/products/prospex/spb507j1): 39.5 mm diameter, 46.4 mm lug to lug, 12.7 mm thick, 20 mm between the lugs, sapphire with a magnifier and an inner anti-reflective coating, 6R55 automatic with about 72 hours' reserve, 20 bar, LumiBrite on hands and indices, cow leather strap with a three-fold push-button clasp, 88 g. Seiko's AU and Japanese pages give the same figures.
- **Variant:** green sunburst dial, gold hands, numerals and print, inner rotating compass ring, brown crocodile-pattern cow leather strap. The Japanese domestic SBDC211 (a Seiko Global Brand Core Shop model) is the same watch: Seiko Japan's photo and specifications match, and its prices are recorded under that reference.
- **Movement rate:** the 6R55 runs at 21,600 vph, so `beats` is 6.
- **Scale:** the case at 9 o'clock is 312 px from the case axis. Taking that as the published 39.5 mm diameter gives 15.8 px/mm. The photo's lug tips are 727 px apart (46.0 mm), close to the published 46.4 mm, which the drawing uses.
- **Parallax:** the dial rings are centred at (516, 518) px and the hand pivot at (513, 510) px, and the case axis is about 4 px right of the dial. The drawing keeps everything concentric, measuring dial features from the dial's centre and hand lengths from the pivot.

## Where it lives

- **Selection:** `shape: "spb507"` sends the drawing to `spb507SVG()` in [spb507.ts](../../src/render/spb507.ts).
- **Scope:** everything above the strap: case, both crowns, bezel, compass ring, dial, track, markers, numerals, date and magnifier, printing and hands. The SEIKO wordmark and the numeral outlines reuse the vector shapes from [ssk003.ts](../../src/render/ssk003.ts).
- **Strap:** the catalogue strap is leather with `texture: "croc"`, drawn by [strap.ts](../../src/render/strap.ts) as a column of large embossed scales down the middle with smaller offset ones towards the edges, and tonal stitching. Other leather straps are unchanged.

## Measurements used

All in millimetres, at the 39.5 mm size.

| Feature | Value |
|---|---|
| Case | A 19.75 mm circle with straight flanks tangent to it, running out to lug tips 1.9 mm wide (outer edge at 11.9). The flank is measured at a slope of 0.44 through (17.2, 10.2) and (12.1, 21.6). Between the lugs the case edge is an 18.9 mm arc; the openings are 20 mm. |
| Crown boss | The case steps out to 21.1 mm from −4.5 to +4.0 mm around the 3 o'clock crown, with curved transitions from about ±7 mm. |
| Crowns | 3 o'clock: 5.7 mm across, from 19.5 to 23.5 mm, six broad flutes. 4 o'clock (compass ring): axis at 119°, 4.3 mm across, from 18.6 to 22.3 mm, four flutes. Both are drawn beneath the case. |
| Bezel | Wide polished steel from 16.9 to 18.6 mm, with a dark gasket inside it. |
| Compass ring | 14.35–15.95 mm. Gold degree numerals every 30° (0.95 mm), each with a small square dot inside it. Triangles at the cardinal points: red with a white N, gold with dark E, S and W. NE and NW in red and SE and SW in gold, each over a small triangle. Short dashes midway between each pair of marks, counted from the photo. |
| Track | A gold circle at 13.1 mm with a tick every quarter minute, to 13.6 mm, 13.85 mm on the half minute and 14.15 mm on the minute. Hour dots at 13.5 mm: 0.34 mm lume in 1.0 mm gold square frames. |
| Indices | Gold triangles at 1, 5, 7, 9 and 11, from 12.35 to a point at 9.55 mm, 1.32 mm wide. Hollow numerals 12, 2, 4, 6, 8 and 10 centred at 10.65 mm and 2.75 mm tall: a monoline digit stroked in gold, with a narrower stroke in the dial's gradient inside. |
| Date | Dark green wheel with a white numeral in a 4.2 × 3.25 mm gold frame centred at 10.45 mm, under a 5.3 × 4.5 mm magnifier. |
| Printing | SEIKO 1.49 mm tall and 7.12 mm wide, top at −7.63. Alpinist script at −4.3, 5.5 mm wide, between two tapered gold lines. Prospex X at 3.45–4.55. AUTOMATIC 3 DAYS centred at 5.43 (9.27 mm wide) and 20 BAR at 6.69 (3.39 mm wide). |
| Hands | Pose 10:08:42. Hour: slim stem, onion-shaped blade 2 mm wide with lume divided by a centre rib and a curved cross rib, spike to 8.8. Minute: open-framed stem to 3.8, blade 1.1 mm wide with lume windows 4.25–7.0 and 7.25–11.15, needle to 13.2. Seconds: gold needle to 13.4, lume teardrop 7.85–9.9, spade tail to 4.95. Gold hub 2 mm across. |

## Live time

The hour, minute and seconds hands are tagged for live time; the seconds hand sweeps at 6 beats a second. The compass ring is drawn fixed with N at 12.

## Lume

Seiko states "LumiBrite on hands and index(es)". The hour and minute hand lume glows with the hands, the seconds teardrop with `seconds`, and the twelve white hour dots with the indices. The gold triangles and hollow numerals are applied metal with no lume visible in the product photo, so they stay dark. That's an inference from the photo: no night photo of this reference was found. Nothing on the compass ring glows.

## Validation

- **Overlay:** rendered the catalogue entry at the photo's scale (15.8 px/mm) and overlaid it at 50% opacity. The case, lugs, crown boss, both crowns, compass ring, hour dots, triangles, numerals, date and hands fall on the photo's features.
- **Other views:** checked the details page, Compare side by side and as outlines with the SSK003 and SPB519, a 17 cm wrist, the gallery thumbnail, a NATO strap, and Night lighting.
- **Budget:** at `strapLen: 12`, 162 elements and about 30.4 KB (6.9 KB gzipped), within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Lugs:** the photo shows long, slim lugs with a brushed top and polished bevel. The drawing has a flat brushed top, a polished edge and one facet line per lug.
- **Typography:** SEIKO and the numeral shapes reuse the SSK003's hand-built vector marks; the Alpinist's 2 and 4 are rounder in the photo. Alpinist uses the system's script font, which varies by platform; the compass and dial text use Arial bold. The Prospex X is simplified, and the tiny "JAPAN 6R55-00N0 R 2" print is omitted.
- **Dial finish:** a soft radial falloff and a diagonal sheen stand in for the sunburst.
- **Strap:** the crocodile grain is a regular grid of scales, quieter and more even than the real embossing.
- **Magnifier:** an outlined tint; it doesn't optically enlarge the date.
