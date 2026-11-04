# Citizen NJ0150-56L "Tsuyosa" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 4 November 2026, and refined the same day after the owner's review against Citizen's catalogue image (see Refinement). The first Citizen in the catalogue.

## Reference and dimensions

- **Reference:** NJ0150-56L, the 40 mm Tsuyosa with the blue sunray dial on its integrated steel bracelet, as sold in the US and Canada. Europe sells what appears to be the same watch as NJ0150-81L; Citizen Australia doesn't list the blue dial (it has the -81Z, -81E, -81A and -56W). Not the 37 mm Tsuyosa, the Tsuyosa 60 or the Small Seconds.
- **Photos:** Citizen's product images for this reference on its [US product page](https://www.citizenwatch.com/us/en/product/NJ0150-56L) (front, back, side and a line drawing); the front one is the catalogue image the owner supplied. They aren't stored in the repository.
- **Specs:** [NJ0150-56L on Citizen US](https://www.citizenwatch.com/us/en/product/NJ0150-56L) and [Citizen Canada](https://www.citizenwatch.com/ca/en/product/NJ0150-56L.html), checked 4 November 2026:
  - **Case:** 40 mm, stainless steel. Sapphire crystal, anti-reflective (US description).
  - **Movement:** calibre 8210 automatic, hacking, 42-hour power reserve. The 8210 runs at 21,600 vph, so `beats` is 6. (Citizen's European site gives 40 hours; the US and Canadian pages, used here, give 42.)
  - **Water resistance:** WR50, 5 bar, "Swimming". **Weight:** 138 g. **Clasp:** fold-over with push buttons.
  - **"Lug 9.1 mm":** Citizen's figure is the width of the fixed polished centre link set between the horns, which measures 9.0 to 9.5 mm on the photo. It isn't the bracelet's attachment width.
- **Not published by Citizen:**
  - **Thickness:** 11.7 mm, from [Windup Watch Shop's NJ015 listing](https://windupwatchshop.com/en-au/collections/dial-black/products/nj015-tsuyosa); [Teddy Baldassarre's review](https://teddybaldassarre.com/blogs/watches/citizen-tsuyosa-review) gives 11.8 mm.
  - **Lug to lug:** 45 mm, horn tip to horn tip, from Teddy Baldassarre's review, which notes the fixed centre link isn't counted. Windup gives 49 mm, which matches the length including the centre links, each about 2 mm past the horns. The catalogue uses 45; the drawing adds the centre links.
  - **Bracelet width:** 22 mm at the case, tapering to 18 mm near the clasp (Teddy Baldassarre). The photo agrees: 21.9 mm just past the horns.
- **Scale:** one uniform 28.27 px/mm, at which the case is 40 mm across at 3 and 9 (Citizen's 2,048 px front image).
- **Perspective:** the photo's case is 43.9 mm from horn tip to horn tip against the reviewed 45 mm, and its lower half reads 0.6 mm wider than its upper half: the horns turn down away from the camera. The case is drawn at 40 × 45 mm from the average of the two halves, rather than stretching the photo.

## Where it lives

- **Selection:** `shape: "nj015056l"` sends the drawing to `nj015056lSVG()` in [nj015056l.ts](../../src/render/nj015056l.ts).
- **Bracelet:** the strap renderer's `oyster` style with a polished centre, measured on the photo below the case, where it's least foreshortened:
  - **Pitch:** 4.0 mm. Autocorrelating the photo's rows gives 3.96 mm on the outer rows and 4.07 mm on the centre; above the case the bracelet turns away and reads 2.7 mm, so that half isn't used.
  - **Centre:** 0.41 of the width (Citizen's 9.1 mm of 22). Each pitch holds two polished pieces in line with the outer links, not staggered: a rounded 2.25 mm block (`pill`) and a 1.75 mm recessed bridge with a seam (`mirrorFlat`). This is the strap renderer's `centreSplit` option, built from the shared `FACES`.
  - **Outer links:** brushed across, with a faint crease in line with the centre's seam (the shared `creased` face), so the bracelet carries a line about every 2 mm as the photo does. Only the outer rows are brushed.
  - **Taper:** towards 18 mm, 70 mm out (`clasp`, `taperLen`).
- **Canadian price:** Canadian dollars were added as a price currency for this watch, with the ECB's rate for the same day as the others (see Prices).

## Measurements used

Photo millimetres from the hand pivot unless stated.

| Feature | Value |
|---|---|
| Case | Drawn at 40 × 45 mm. Flat horn tips 23.4 mm across, a small rounded corner, then a straight flank to (17.35, 10.4) curving into the side at 20. Finish: fine brushing along the watch's length, as on the photo's shoulders and horns, quiet at normal size; the horns lit softly from above (`lugTopLight` at 0.45); a fine crease where the horns meet the body at 19.5; a polished bevel down each flank; and the bezel's soft shadow. |
| Centre links | Fixed, polished, 9.1 mm wide, from the crease at 19.5 to 2.15 mm past the horn tips (24.6 on the photo's lower half), with rounded outer corners: a dark rim, a broad highlight and one soft reflection. |
| Crown | At 4 o'clock, square to the lower right flank, its root 12.6 mm below the centre. On the photo it meets the flank over 4.9 mm and its domed end stands 2.5 mm out. Drawn as a fluted barrel 4.9 mm long with rounded shoulders, its outermost point 2.3 mm proud, and a polished domed end. It sits in a dark recess cut 0.8 mm into the flank, which runs on below it into the small access notch (about 1 mm deep), the grip notch Teddy Baldassarre's review describes below the crown. |
| Bezel | Smooth and polished, brighter than the brushed case: a narrow darker step from 18.95 to 19.2, then the sloping polished face down to the crystal's thin dark edge at 17.1, shaded towards its foot, with a soft highlight at the upper left and a fainter one at the lower right. The first version's separate rings (a light line, a dark band, a grey lip and a dark ring) are gone. |
| Dial | Blue sunray to 16.95. Sampled round the photo at 4.5, 8.5 and 12.3 mm, the base is #19305A, brightest (#1C4273) in broad sectors towards 128° and 308°, and darkest (#0C2243) towards 38° and 218°, following cos 2θ, with little change with radius. Drawn as the base colour (darkening 15% at the rim) under eight nested pairs of wedges each way, each at a low opacity, so the change is gradual. They are in the dial's own hue, brighter (×1.5) or darker (×0.3), so the blue stays rich rather than greying. A lighter sloping flange from 16.0. The flange's tiny printed minute figures aren't drawn. |
| Minute track | White dashes 0.13 mm wide from 14.85 to 15.6 at each minute; a lume square 0.72 mm across at each hour, 15.22 out. |
| Markers | Applied polished steel batons 1.02 mm wide from 10.15 to 14.25, each with a white lume strip 0.44 mm wide. Pairs 0.26 mm apart at 12 and 6; a short baton from 13.2 at 3, beyond the date. |
| Date | At 3, as seen through the magnifier: a white window enlarged to 3.43 × 2.87 mm centred at (10.17, 0.51), showing 7, under a cushion-shaped lens 5.95 × 4.5 mm centred at (10.37, −0.35). |
| Printing | Measured on photo and drawing alike, aligned on the pivot. CITIZEN in bold serif capitals: baseline at −6.61 and cap top at −8.07 on the photo; the drawing matched within 0.1 mm but its glyphs came out 0.15 mm narrow, so its length was raised to 8.25 mm (8.1 mm of ink). AUTOMATIC in sans capitals: baseline at 8.35 on both; its length was raised to 8.1 mm to fill the photo's 7.95 mm of ink. Neither needed moving. |
| Hands | Pose as in the photo: hour 304°, minute 57.8°, seconds 208°. Faceted steel batons, one side lit and the other shaded. Hour 1.05 mm wide to 9.9 with a tail to 2.2 and a lume strip from 5 to 9.35. Minute 1.0 mm wide to 14.0 with a tail to 2.5 and a lume strip from 7 to 13.4. Seconds: a 0.18 mm needle to 15.8 with a tail to 3.4. Polished hub 1.7 mm across. |

## Live time

The hour, minute and seconds hands are tagged. The seconds hand sweeps at 6 beats a second (21,600 vph).

## Lume

Citizen doesn't describe the lume. Windup Watch Shop's NJ015 listing mentions "luminous plots" and lumed hour and minute hands, and Teddy Baldassarre's review calls the lume "decent". In the product photo the batons' strips, the hour squares and the hands' strips are the same white. So the hands and indices (strips and squares) are lit; the seconds hand isn't. No night photo with a clear colour or a material grade was found, so the glow is a generic green (`#8CFF6E`) with certainty `uncertain`.

## Prices

- **Canada:** CA$650.00 on Citizen Canada's page, checked 4 November 2026, with no tax wording. The owner supplied this figure and chose it as the source; other currencies are converted from it at the ECB rate.
- **US:** Citizen US lists US$495.00, shown at US$396.00 in a 20% sale on 4 November 2026. It isn't recorded, so US visitors see the conversion from the Canadian price.
- **Australia:** Citizen Australia (citizenwatches.com.au) doesn't list the blue NJ0150; its other NJ0150 colours are A$650 to A$699.

## Refinement

The owner's review of the first version asked for:
- **Bracelet construction:** a closer link rhythm.
- **Case finish:** quieter brushing along the case rather than bands across the shoulders.
- **Crown:** a rounded crown seated in the flank, with its access recess.
- **Surfaces:** clearer separation between polished and brushed surfaces, with fewer rings round the dial.
- **Dial:** a richer, smoother sunray.
- **Printing:** CITIZEN and AUTOMATIC checked for size and position.

Each change is recorded above. Before and after renders at 18 and 8 px/mm, Day, Dusk and Night, and thumbnail size were compared from the direct catalogue render, without personal overrides. The shared changes to `strap.ts` (`centreSplit` and the `creased` face) leave every other watch's render byte-for-byte unchanged.

## Validation

- **Overlay:** the drawing was rendered at the photo's 28.27 px/mm and overlaid at 50% on the hand pivot. The bezel, dial, minute track, markers, hands, date and printing line up. The horns run 1.1 mm longer than the photo shows, as explained above, and the 6 o'clock markers sit slightly lower in the photo, from its perspective.
- **Other views:** checked in Details in Day, Dusk and Night and on every strap type (as sold, sample bracelet, NATO, rubber and leather), as a thumbnail, in Compare side by side next to the Black Bay 58 and Submariner and as stacked outlines, and on the wrist.
- **Budget:** at `strapLen: 12`, 307 elements and about 24.3 KB (273 and 22.2 KB before the refinement: the smoother sunray and the split centre links add elements), within the 320-element and 50 KB limits.
- **No regressions:** every other catalogue drawing renders byte-for-byte as on `main` in all seven views, apart from the night pass's filter numbering, which counts every drawing rendered.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Type:** CITIZEN uses bold Times New Roman and AUTOMATIC Helvetica or Arial, not Citizen's lettering. The date shows a fixed 7.
- **Magnifier:** drawn as the photo shows it, with the window enlarged; the lens's refraction isn't modelled.
- **Case:** drawn flat; the horns' downward curve isn't modelled.
- **Bracelet:** one pitch along its length, drawn flat, so the upper half doesn't foreshorten as the photo's does; the clasp isn't drawn.
- **Crown:** the flutes are a flat pattern of ridges, and the recess is a flat dark shape rather than a modelled cut.
- **Sunray:** eight steps each way, smooth at normal size; at large sizes the wedge edges can just be seen near the rim.
- **Glow colour:** a generic green, not confirmed.
