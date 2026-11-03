# Casio G-Shock DW-5600UE-1 — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 3 November 2026. The third digital watch and the first G-Shock; it reuses the shared [digital display](../watch-illustration-standard.md#digital-displays) and [backlight](../lume.md#digital-displays-and-backlights) conventions, and adds month cells, leaning digits and a resin band wider than its attachment.

## Reference and dimensions

- **Photo:** Casio's front-on DW-5600UE-1 product photo (2000 px square), supplied for this work. It isn't stored in the repository.
- **Specs:** [DW-5600UE-1 on Casio](https://www.casio.com/intl/watches/gshock/product.DW-5600UE-1/), confirmed against screenshots of Casio's page supplied for this work:
  - **Case:** 48.9 × 42.8 × 13.4 mm (L × W × H), 52 g, resin case and bezel, resin band, mineral glass, shock resistant, 200 m water resistance, for 145–205 mm wrists.
  - **Power and features:** about 5 years on a CR2016, ±15 seconds a month. LED backlight (Super Illuminator) in white, with afterglow. 12/24-hour time with hour, minute, second, pm, month, date and day; full auto-calendar to 2099; 1/100-second stopwatch; countdown timer; multi-function alarm, hourly signal and flash alert.
- **Reference:** the current UE version with the white LED, not the older DW-5600E with its EL backlight, nor the solar or radio-controlled derivatives. The same watch is DW-5600UE-1JF in Japan, DW-5600UE-1ER in the UK, DW-5600UE-1 in Germany and DW5600UE-1D in Australia. Casio America's DW-5600UE-1 address redirects to the older DW5600E-1V, so there's no US price.
- **Module:** 3525, from the operation-guide link on Casio's page and Casio Australia's listing.
- **Case size:** `caseShape: "rectangular"`. `diameter` holds the 42.8 mm width, across the bezel's widest point, and `lugToLug` the 48.9 mm length, from the top of the upper lug block to the bottom of the lower one.
- **Band:** 16 mm between the spring bars, as retailers list Casio's DW-5600 band ([Watchband Direct](https://watchband.direct/es/blogs/watch-compendium/casio-g-shock-watch-bands-complete-guide-2026), [Sakura Watches, band 10512401](https://www.sakurawatches.com/casio-g-shock-band-10512401)); Casio doesn't publish it. Measured on the photo, the band is 25.2 mm where it meets the lug block, 22.3 mm about 8 mm out, and about 20 mm from 12 mm on. So the catalogue sets `lugWidth: 16` and the band `width: 20`, `fitted: 25.2` and `fittedLength: 12`; other straps fit the 16 mm attachment.
- **Scale:** one uniform scale, 23.25 px/mm, fits both of Casio's dimensions: 995 px across the bezel's widest point (42.8 mm) and about 1137 px from lug block to lug block (48.9 mm). The bezel is centred in the case; the photo shows the lower lug block slightly taller than the upper one (7.5 against 6.7 mm), from a slight camera tilt, so both are drawn at their average. The face sits about 0.75 mm above the bezel's centre, as measured.

## Where it lives

- **Selection:** `shape: "dw5600ue"` sends the drawing to `dw5600ueSVG()` in [dw5600ue.ts](../../src/render/dw5600ue.ts). The display uses the shared [LCD helpers](../../src/render/lcd.ts), and the CASIO logo, chrome buttons and outline helpers come from [casio.ts](../../src/render/casio.ts), shared with the A168.
- **Band:** the `segmented` resin style in [strap.ts](../../src/render/strap.ts): stepped segments every 4.75 mm, each overhanging the next, with moulded dimples on the two nearest the case. The resin band's own `width` is new.
- **Live time:** `setDisplays()` in [liveTime.ts](../../src/lib/liveTime.ts), unchanged; `lcdChars()` now also gives the month.

## Measurements used

All in millimetres from the case centre, at 42.8 × 48.9 mm.

| Feature | Value |
|---|---|
| Lug blocks | Flat, 25.5 mm across at ±24.45, widening to 30 mm where they meet the bezel at ±15.5. Two recessed circles each, 2.84 mm across with a raised lip and a shaded dish, at (±9.95, ±20.7). |
| Bezel | Traced from the photo row by row and averaged top and bottom, as deliberate angular steps: top edge at ±17.2, a 45° shoulder from (14.45, ∓17.05) to (17.85, ∓13.5), a short flat at 17.95, a step out at ∓12 to the upper guard (19.05 sloping to 19.85), the recess the button stands out of at 19.45 (∓9.15 to ∓5.6), a chamfer out to the flat-faced middle block, and that block at the full 21.4 across ±3.45. Two small slots in the rim at each corner. |
| Bezel layers | The bezel's main raised body, measured on the photo's top-right and bottom-left corners and averaged: its top edge runs out only to the plates' corners (±9.5 to ±10.5), then one long sweep curves down to straight sides at ±18.55 by ±6.5, through (±14.9, ∓14.4) and (±17.6, ∓11.5). The stepped guards, slots and the flat-faced middle block sit outside it, a level lower. The two layers are close in tone, as in the photo, and are separated by the body's edge, lit along its top left and turning to shade at its bottom right, with a soft shadow where it drops away. The middle blocks catch a little more light. Inside the body, a slope about 1 mm wide runs down into the face, lit at the top left and in shade at the bottom right. |
| Plates | Subtly raised trapezoids following the bezel, measured on the photo from the bezel's edge in to the face: from ±11.1 at −16.75 to ±9.75 at −13.4 above, and from ±9.85 at 12.35 to ±11.1 at 15.95 below. They're lit along their upper edges and shaded on their lower right. PROTECTION (1.33 mm caps, baseline −14.41) and G-SHOCK (1.81 mm caps, baseline 15.06) sit at the centre of their plates, as shallow moulded letters with a faint shadow on their lower right. |
| Buttons | Chrome cylinders 3.1 mm tall with rounded ends, standing out to ±20.65 at ±7.3 from their recesses: START/STOP and LIGHT on the right, MODE lower left. ADJUST, upper left, is recessed in its guard and drawn as a dark cap. |
| Window | Traced on the photo's lower left and mirrored about a centre line 0.21 mm above the case's: the black face's edge at ±14.84 and 12.31 above and below its centre line, the silver line at ±14.3 and 11.87, each turning through a long diagonal about 5 mm across and 6 mm down. The contours are smoothed through the measured points, so the straight runs stay straight. |
| Printing | PROTECTION, 1.33 mm caps from −8.17 to 8.17, baseline −14.75; G-SHOCK, 1.81 mm caps from −8.43 to 8.73, baseline 14.84, both white. The CASIO logo (as on the A168, placed by a transform) from −3.3 to 3.27, 1.26 mm tall. WATER 20BAR RESIST in cyan, −8.56 to 8.65; ILLUMINATOR in silver italic between small arrows, −5.51 to 5.59. ADJUST and MODE reading up the left at −12.65, START/STOP and LIGHT down the right at 12.73, with gold dots at (±12.95, −6.36 / 5.6). LED BACKLIGHT in white, −5.51 to 5.63; ALARM and CHRONO in gold. |
| Badge | SHOCK RESIST: a gold-outlined shield from −2.87 to 3.05 and 8.17 to 11.12, with the two words in gold and a red chevron at its point. |
| LCD | A grey surround (±11.92, −8.65 to 7.75, corners 1.4 mm), lighter at the top where it catches the light, holding ILLUMINATOR in its top band and LED BACKLIGHT in its bottom one. Inside it, a dark frame (±10.92, −7.31 to 6.54) with a fine light line, and the light grey panel (±10.28, −6.71 to 5.94), shaded under its top and left edges. Ink `#101110`; unlit segments at the shared ghost opacity. |
| Main time | Digits 4.61 mm tall from 0.17, 2.3 mm wide, strokes 0.62, leaning 5.7° about their mid-height (2.475). Hour tens (1 or blank) ending at −6.97, hour −5.95, colon about −2.55 (dots at 1.41 and 3.56), minutes −1.55 and 1.81. |
| Seconds | 3.45 mm tall from 1.41, bottom-aligned, 1.72 mm wide, strokes 0.52, at 5.1 and 7.45, leaning the same. |
| Top row | Day letters (nine segments) 2.75 mm tall at −6.63 and −3.99. Month and date, 2.95 mm tall, in a printed box (−1.39 to 9.47, −5.69 to −1.29): month at −0.3 and 1.6 (leading zero blank), a fixed dash, date at 5.1 and 7. All leaning 5.7°. PM below the hourly-signal bars and alarm bell at the left. |
| Light icon | The burst above the seconds (6.02 to 8.65, −0.74 to 0.81), an indicator drawn off. |
| Band | 25.2 mm at the case, narrowing straight to 20 mm over 12 mm, then the usual slow taper. Rounded segments every 4.75 mm, each shaded as one slab by a repeating gradient: a deep shadow under the step, a lit crown, shade rolling into the far edge and a lit lip there. Recessed dimples, 2.5 mm across, at ±8.45, 3.1 mm into the first two segments. |
| LED | A near-even white glow (`#EEF4FF`) over the panel, falling to about two-thirds at its corners. Shown at Night only. |

## Display and live time

- **Sample moment:** Sunday 30 June, 10:58:50 pm, as in Casio's photo, in 12-hour format with PM lit. The photo shows the month, so the sample is a date in June that falls on a Sunday (30 June 2024); the F-91W and A168 show the same time on another Sunday the 30th.
- **Live time:** with live time on, the display shows the device's local time, day, month and date, changing on each second, from the shared clock. Turning live time off restores the sample.
- **Indicators:** the hourly-signal, alarm and light indicators are drawn off; the photo shows them on, but a still drawing shouldn't claim an alarm is set. The stopwatch, timer, alarms and flash alert aren't simulated.

## Lighting

No lume. Casio lists an LED backlight (Super Illuminator) in white, with afterglow. Super Illuminator is designed to light the whole display, so the light is drawn nearly even with a gentle fall-off, unlike the F-91W's LED at one side. Following the shared convention, Day and Dusk show the display unlit, and Night shows the light switched on, as if LIGHT were pressed; the details caption says so. The afterglow isn't shown. Evidence is in [lume and dark mode](../lume.md).

## Prices

Current Casio prices in three markets, all checked 3 November 2026, Japan first as Casio's home market:

- ¥14,300 including tax (DW-5600UE-1JF, Casio Japan)
- £99.90 (DW-5600UE-1ER, Casio UK)
- €99.90 including VAT (Casio Germany)

Casio itself has no Australian site or store (casio.com/au doesn't exist). CASIO Australia's store is "owned and operated by SHRIRO, official distributor of CASIO products in Australia", in its own words, so it isn't the maker and its A$249 isn't recorded (WC-071, 3 November 2026). Australian visitors see a marked conversion from the Japanese price. Casio America doesn't list this reference. No launch price from Casio was found.

## Validation

- **Overlay:** the finished drawing was laid at 50% over the photo at its uniform 23.25 px/mm. The bezel outline, lug blocks and bosses, buttons, plates, window and silver line, all the printing, the LCD panel and box, and every digit and indicator fall on the photo's.
- **Other views:** checked the details page in Day and Night (caption included), Compare side by side with the A168 and F-91W, the 17 cm wrist and the other watches on the same wrist, and the share-preview image.
- **Live time:** matched the device clock to the second, including the month and date, and kept advancing; turning it off restored the sample. Tests cover the month's blank leading zero and month and year rollover.
- **Regression:** renders of every other catalogue watch (7 views each) are byte-identical to `main`, including after moving the shared Casio pieces into `casio.ts`.
- **Budget:** at `strapLen: 12`, 302 elements and about 34.5 KB (7.7 KB gzipped), within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Review refinements

A review the same day found the case too blocky, and asked to keep the dimensions and scale and to redistribute the volume instead:
- **Face:** the black face, silver line and the bezel's slope round them were rebuilt from contours traced on the photo, with long diagonal transitions instead of a rectangle with small radii.
- **Bezel corners:** they gained the reference's broad 45° shoulders and corner planes.
- **Side guards:** the outline was retraced as deliberate angular steps: the guard step, the recess each button stands out of, and the flat-faced middle block, with two small slots in the rim at each corner. The buttons were corrected to 3.1 mm cylinders.
- **Layers:** the bezel now reads in three layers: the outer rim, the front with a lit edge, and the slope into the face.
- **Plates:** PROTECTION and G-SHOCK sit on subtly raised plates instead of between dark cut lines.
- **Band junction:** the lug blocks' circles are larger and recessed, and the band's segments are shaded as rounded slabs.
- **Main body:** a second review pointed out that the bezel's raised body still ran almost square out to the guards. It's now a rounded octagon traced on the photo, with the guards a level below it. Its contour was drawn over the lifted photo to confirm it follows the visible edge between the body and the stepped layer.
- **Plates and screen:** a third review found PROTECTION and G-SHOCK sitting off-centre on their plates; the plates were the wrong size, so they were re-measured and the words centred on them. It also found the grey surround round the LCD, which holds ILLUMINATOR, missing; it was measured and added.
- **Checks:** the before and after outlines were laid over the photo at its uniform 23.25 px/mm, then compared side by side and in close-ups of the corner and band. Repeated details are drawn as one path each to stay within the element budget. No other watch's render changed.

## Remaining approximations

- **Lettering:** PROTECTION, G-SHOCK and the small labels use Arial bold, not Casio's lettering; the CASIO logo is drawn.
- **Bezel:** its rim, front and slope are flat faces with gradients and a few lit edges; the photo's soft moulded highlights are simplified.
- **Band:** straight-edged; each segment's rounded profile is one repeating gradient. Only the two segments nearest the case carry dimples, as in the photo. The keeper and buckle aren't drawn.
- **Digits:** the shared nine-segment day letters; the photo's faint shadows under the segments aren't drawn.
- **LED:** one radial gradient; the afterglow isn't shown.
