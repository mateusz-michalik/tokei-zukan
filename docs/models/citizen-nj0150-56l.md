# Citizen NJ0150-56L "Tsuyosa" — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 4 November 2026. The first Citizen in the catalogue.

## Reference and dimensions

- **Reference:** NJ0150-56L, the 40 mm Tsuyosa with the blue sunray dial on its integrated steel bracelet, as sold in the US and Canada. Europe sells what appears to be the same watch as NJ0150-81L; Citizen Australia doesn't list the blue dial (it has the -81Z, -81E, -81A and -56W). Not the 37 mm Tsuyosa, the Tsuyosa 60 or the Small Seconds.
- **Photos:** Citizen's product images for this reference on citizenwatch.com (front, back, side and a line drawing), and the owner's copy of the front image. They aren't stored in the repository.
- **Specs:** [NJ0150-56L on Citizen US](https://www.citizenwatch.com/us/en/product/NJ0150-56L) and [Citizen Canada](https://www.citizenwatch.com/ca/en/product/NJ0150-56L.html), checked 4 November 2026:
  - **Case:** 40 mm, stainless steel. Sapphire crystal, anti-reflective (US description).
  - **Movement:** calibre 8210 automatic, hacking, 42-hour power reserve. The 8210 runs at 21,600 vph, so `beats` is 6. (Citizen's European site gives 40 hours; the US and Canadian pages, used here, give 42.)
  - **Water resistance:** WR50, 5 bar, "Swimming". **Weight:** 138 g. **Clasp:** fold-over with push buttons.
  - **"Lug 9.1 mm":** Citizen's figure is the width of the fixed polished centre link set between the horns, which measures 9.0 to 9.5 mm on the photo. It isn't the bracelet's attachment width.
- **Not published by Citizen:**
  - **Thickness:** 11.7 mm, from Windup Watch Shop's NJ015 listing; Teddy Baldassarre's review gives 11.8 mm.
  - **Lug to lug:** 45 mm, horn tip to horn tip, from Teddy Baldassarre's review, which notes the fixed centre link isn't counted. Windup gives 49 mm, which matches the length including the centre links, each about 2 mm past the horns. The catalogue uses 45; the drawing adds the centre links.
  - **Bracelet width:** 22 mm at the case, tapering to 18 mm near the clasp (Teddy Baldassarre). The photo agrees: 21.9 mm just past the horns.
- **Scale:** one uniform 28.27 px/mm, at which the case is 40 mm across at 3 and 9 (Citizen's 2,048 px front image).
- **Perspective:** the photo's case is 43.9 mm from horn tip to horn tip against the reviewed 45 mm, and its lower half reads 0.6 mm wider than its upper half: the horns turn down away from the camera. The case is drawn at 40 × 45 mm from the average of the two halves, rather than stretching the photo.

## Where it lives

- **Selection:** `shape: "nj015056l"` sends the drawing to `nj015056lSVG()` in [nj015056l.ts](../../src/render/nj015056l.ts).
- **Bracelet:** the strap renderer's `oyster` style with a polished centre: centre links 0.41 of the width (Citizen's 9.1 mm of 22), a 4.1 mm pitch (the photo's lower half, where it's least foreshortened), and its own taper towards 18 mm 70 mm out (`clasp`, `taperLen`).
- **Canadian price:** Canadian dollars were added as a price currency for this watch, with the ECB's rate for the same day as the others (see Prices).

## Measurements used

Photo millimetres from the hand pivot unless stated.

| Feature | Value |
|---|---|
| Case | Drawn at 40 × 45 mm. Flat horn tips 23.4 mm across, a small rounded corner, then a straight flank to (17.35, 10.4) curving into the side at 20. Finish: brushed across, horns lit from above, a crease where the horns meet the body at 19.5, a polished bevel down each flank, and the bezel's soft shadow. |
| Centre links | Fixed, polished, 9.1 mm wide, from the crease at 19.5 to 2 mm past the horn tips, with rounded outer corners. |
| Crown | At 4 o'clock (the photo puts its centre at 126°), square to the lower right flank: 4 mm tall, standing 1.8 mm proud, with nine flutes along its axis and a polished end. The grip notch below it isn't drawn. |
| Bezel | Smooth and polished: a darker outer step from 18.85 to 19.2, the sloping polished face to 17.35, then the crystal's grey inner lip to the dial at 16.95. |
| Dial | Blue sunray to 16.95, brightest towards the upper left and lower right as in the photo. A lighter sloping flange from 16.0. The flange's tiny printed minute figures aren't drawn. |
| Minute track | White dashes 0.13 mm wide from 14.85 to 15.6 at each minute; a lume square 0.72 mm across at each hour, 15.22 out. |
| Markers | Applied polished steel batons 1.02 mm wide from 10.15 to 14.25, each with a white lume strip 0.44 mm wide. Pairs 0.26 mm apart at 12 and 6; a short baton from 13.2 at 3, beyond the date. |
| Date | At 3, as seen through the magnifier: a white window enlarged to 3.43 × 2.87 mm centred at (10.17, 0.51), showing 7, under a cushion-shaped lens 5.95 × 4.5 mm centred at (10.37, −0.35). |
| Printing | CITIZEN in bold serif capitals, 8.1 mm wide, baseline at −6.62. AUTOMATIC in sans capitals, 7.95 mm wide, baseline at 8.35. |
| Hands | Pose as in the photo: hour 304°, minute 57.8°, seconds 208°. Faceted steel batons, one side lit and the other shaded. Hour 1.05 mm wide to 9.9 with a tail to 2.2 and a lume strip from 5 to 9.35. Minute 1.0 mm wide to 14.0 with a tail to 2.5 and a lume strip from 7 to 13.4. Seconds: a 0.18 mm needle to 15.8 with a tail to 3.4. Polished hub 1.7 mm across. |

## Live time

The hour, minute and seconds hands are tagged. The seconds hand sweeps at 6 beats a second (21,600 vph).

## Lume

Citizen doesn't describe the lume. Windup Watch Shop's NJ015 listing mentions "luminous plots" and lumed hour and minute hands, and Teddy Baldassarre's review calls the lume "decent". In the product photo the batons' strips, the hour squares and the hands' strips are the same white. So the hands and indices (strips and squares) are lit; the seconds hand isn't. No night photo with a clear colour or a material grade was found, so the glow is a generic green (`#8CFF6E`) with certainty `uncertain`.

## Prices

- **Canada:** CA$650.00 on Citizen Canada's page, checked 4 November 2026, with no tax wording. The owner supplied this figure and chose it as the source; other currencies are converted from it at the ECB rate.
- **US:** Citizen US lists US$495.00, shown at US$396.00 in a 20% sale on 4 November 2026. It isn't recorded, so US visitors see the conversion from the Canadian price.
- **Australia:** Citizen Australia (citizenwatches.com.au) doesn't list the blue NJ0150; its other NJ0150 colours are A$650 to A$699.

## Validation

- **Overlay:** the drawing was rendered at the photo's 28.27 px/mm and overlaid at 50% on the hand pivot. The bezel, dial, minute track, markers, hands, date and printing line up. The horns run 1.1 mm longer than the photo shows, as explained above, and the 6 o'clock markers sit slightly lower in the photo, from its perspective.
- **Other views:** checked in Details, Day, Dusk and Night, as an outline and a thumbnail, in Compare and on the wrist.
- **Budget:** at `strapLen: 12`, 273 elements and about 22.2 KB, within the 320-element and 50 KB limits.
- **No regressions:** every other catalogue drawing renders byte-for-byte as on `main` in all seven views, apart from the night pass's filter numbering, which counts every drawing rendered.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Type:** CITIZEN uses bold Times New Roman and AUTOMATIC Helvetica or Arial, not Citizen's lettering. The date shows a fixed 7.
- **Magnifier:** drawn as the photo shows it, with the window enlarged; the lens's refraction isn't modelled.
- **Case:** drawn flat; the horns' downward curve and the grip notch below the crown aren't modelled.
- **Bracelet:** the shared oyster links, with the centre row offset half a link (the photo's offset is nearer a third), at one pitch; the clasp isn't drawn.
- **Glow colour:** a generic green, not confirmed.
