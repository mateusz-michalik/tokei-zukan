# Seiko SSK003 "5 Sports GMT" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 30 October 2026.

## Reference and dimensions

- **Photo:** Seiko's front-on SSK003K1 product photo (1102 px square, transparent background), supplied for this work. It is not stored in the repository.
- **Specs:** [SSK003 on Seiko AU](https://www.seikowatches.com/au-en/products/5sports/ssk003): 42.5 mm diameter, 46.0 mm lug to lug, 13.6 mm thick, 22 mm between the lugs, Hardlex with a magnifier, 4R34 automatic with a 24-hour hand, about 41 hours, 10 bar, LumiBrite on hands and indices. The US and German pages give the same case figures.
- **Variant:** blue sunburst dial, black and blue two-tone 24-hour bezel, red GMT hand, five-row steel bracelet. The Japanese domestic SBSC003 is the same watch: Seiko Japan's product photo matches, and its prices are recorded under that reference.
- **Movement rate:** the 4R34 runs at 21,600 vph, so `beats` is 6.
- **Unit:** k, the outer radius of the bezel insert. The insert is 300 px in the photo, centred at (528, 506).
- **Scale:** the case at 9 o'clock is about 1.108 k from the centre, averaging both flanks. Taking that as the published 42.5 mm diameter gives k = R / 1.108 ≈ 19.18 mm. The photo foreshortens the lugs to about 44.7 mm, so the case keeps the published 46 mm lug to lug rather than following the photo.
- **Parallax:** the dial furniture is centred about 4 px right of and 6 px below the bezel in the photo, from the camera angle. The drawing keeps everything concentric and measured dial features from the dial's own centre.

## Where it lives

- **Selection:** `shape: "ssk003"` sends the drawing to `ssk003SVG()` in [ssk003.ts](../../src/render/ssk003.ts).
- **Scope:** everything above the bracelet: case and crown guards, crown, coin-edge bezel and insert, rehaut, dial, markers, date and magnifier, printing and hands.
- **Shared marks:** the vector SEIKO wordmark (`WORDMARK`) and the monoline digits (`DIGITS`) are exported and reused by the [SPB507](seiko-spb507.md) drawing.
- **Bracelet:** the catalogue strap is a jubilee labelled "Five-row bracelet", as Seiko describes it. For this shape, [strap.ts](../../src/render/strap.ts) draws it as the SKX-style five-row bracelet (`fiveRow`): long, flat, square-cornered links at one 4.3 mm pitch, rows at 0–0.3–0.435–0.565–0.7–1 of the width, the two flanking centre rows offset half a link, and a straight end link divided into the same five pieces. Other watches' jubilees are unchanged. Other strap choices go through the shared renderer.

## Measurements used

| Feature | Value (k unless stated) |
|---|---|
| Case | Straight SKX flanks through (19.0, 9.3) mm with a slope of 0.44, rounding to the 21.25 mm crest at 9 o'clock. Lug ends are flat with rounded outer corners and open 22 mm attachments. The bracelet tucks under at 1.02. |
| Crown guards | The upper guard sweeps out from 3 o'clock to a nose just above the crown's end, about 23.6 mm from the centre. Below the crown the flank runs straight back to the lug. The guards' faces overlap the crown by 0.15 mm so no gap shows. |
| Crown | Axis at 113.8°, 6.4 mm across, seated at 20.6 mm and ending at 24.4 mm, measured from the end face. Drawn beneath the case, so the guards cover its root. |
| Bezel | 60 flat crests at 1.09 with rounded notches down to 1.043, counted from the photo. Sloping steel ring 1.0–1.035. Hardlex insert 0.85–1.0, black above 3 and 9, blue below. Even-hour numerals centred at 0.922 and 0.11 tall, drawn as heavy monoline vector digits with a 0.022 stroke (about twice Arial's weight), a plain 1 and a flat-based 2. Odd-hour dots at 0.93; a metallic triangle at 24 from 0.983 to 0.865. None of it is lumed. |
| Rehaut | 0.695–0.85, with a lighter outer slope from 0.78. Even-hour numerals 24, 2 … 22 at 0.745 and a tick every 6° from 0.726 to 0.766. |
| Markers | Plots centred at 0.595, 0.06 radius including a 0.014 frame. The 12 o'clock triangle runs from 0.68 to a point at 0.463, 0.25 wide, with a stem to 0.373. Stadium batons at 6 (0.48–0.71) and 9 (0.45–0.665), 0.12 wide, each with a short stick towards the centre. |
| Date | White window centred at (0.567, 0.012), 0.21 × 0.143, under a cushion-shaped magnifier centred at (0.553, −0.01), 0.37 × 0.30. |
| Dial | Navy with a broad radial falloff and a soft sheen across the upper left. No visible sunburst rays: the photo's finish reads as a smooth light transition. |
| Printing | SEIKO as vector serif capitals, 0.063 tall with the baseline at −0.247 and 0.354 wide, with a fine dark edge. The Seiko 5 emblem as a vector slanted hexagonal badge from −0.22 to −0.14, cut by two diagonal slots. Script Automatic at 0.272; red serif GMT at 0.347. The tiny 4R34 calibre printing is omitted. |
| Hands | Pose 10:08:42 with the GMT hand at 152°. Hour: a chamfered lume blade 0.148–0.407 on a metal neck, 0.125 wide, with a fine spike to 0.475. Minute: broad base to 0.2, narrower shaft to 0.448, barbed arrowhead 0.188 wide at 0.458 with a spike to 0.66. GMT: red shaft 0.038 wide, open arrowhead from 0.40 to 0.60 filled with lume, and a needle to 0.69. Seconds: silver needle to 0.69; dark tail with a framed lume disc at 0.32; dark hub. |

## Live time

The GMT hand is tagged `hour24`, so with live time on it shows local time on the 24-hour scale, one turn a day. The app has no second time zone, so the GMT hand and the hour hand always agree. The seconds hand sweeps at 6 beats a second.

## Lume

Seiko's AU page says "Lumibrite on hands and index(es)", and its US page says the GMT hand "has a generous layer of Lumibrite". The hour, minute and GMT lume glow with the hands, and every plot, baton, triangle and stem glows with the indices. The seconds counterweight disc is lume-coloured but not mentioned by Seiko, so it is tagged `seconds` but stays dark at night. The bezel has no lume.

## Validation

- **Overlay:** rendered the catalogue entry at the photo's scale (15.65 px/mm) and overlaid it at 50% opacity. The bezel numerals, plots, batons, date, hands and crown fall on the photo's features.
- **Other views:** checked the details page, Compare side by side with the SPB519, outlines, a 17 cm wrist, a thumbnail, rubber and NATO straps, and Dusk and Night lighting.
- **Budget:** at `strapLen: 12`, 226 elements and about 39.9 KB (7.9 KB gzipped), within the 320-element and 50 KB limits.
- **Review feedback (30 October 2026):** replaced the bead-like shared jubilee with the five-row bracelet and divided end link; replaced Georgia and the boxed 5 with vector marks; removed the dial's spoke pattern; and drew heavier bezel numerals.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Bracelet:** links are flat-shaded rectangles. The real links' curvature, brushing direction and the bracelet bending away from the camera are simplified.
- **Case finish:** the flanks are a brushed fill with a narrow polished edge. The photo's broad polished bevel and reflections are simplified.
- **Lug length:** drawn to the published 46 mm, so the lugs look slightly longer than in the foreshortened photo.
- **Typography:** the SEIKO wordmark, 5 emblem and bezel digits are hand-built approximations, not Seiko's artwork. Arial bold stands in for the small rehaut numerals and Georgia for GMT. Automatic uses the system's script font, which varies by platform.
- **Magnifier:** a tinted cushion with an edge highlight. It doesn't optically enlarge the date.
