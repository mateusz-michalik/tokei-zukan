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
| Lug blocks | Flat, 25.5 mm across at ±24.45, widening to 29.9 mm where they meet the bezel at ±15.75. Two moulded bosses each, 2.2 mm across, at (±9.95, ±20.7). |
| Bezel | Top and bottom edges at ±17.2, 21.8 mm across, rounding into the corners. The sides, measured on the photo and averaged top and bottom: a small step out to 19.45 at ±11.6, the guard to 19.9 at ±10.7, a notch to 19.5 round the buttons at ±9, then swelling to the full 21.4 between ±3. A flat front inside the stepped outer edge. |
| Plates | Grooves from (±11.1, ∓16.7) to (±9.75, ∓13.2) above, and from (±9.8, 11.9) to (±11.1, 16.7) below, framing PROTECTION and G-SHOCK. |
| Buttons | Chrome, 2.4 mm tall, standing out to ±20.45 at ±6.95: START/STOP and LIGHT on the right, MODE lower left. ADJUST, upper left, is recessed in its guard and drawn as a dark slot. |
| Window | Black, 29.4 mm across, from −12.65 to 12.1, corners about 3.8 mm. A 0.3 mm silver line at ±14.13, −12.08 to 11.55, corners about 3.3 mm. |
| Printing | PROTECTION, 1.33 mm caps from −8.17 to 8.17, baseline −14.75; G-SHOCK, 1.81 mm caps from −8.43 to 8.73, baseline 14.84, both white. The CASIO logo (as on the A168, placed by a transform) from −3.3 to 3.27, 1.26 mm tall. WATER 20BAR RESIST in cyan, −8.56 to 8.65; ILLUMINATOR in silver italic between small arrows, −5.51 to 5.59. ADJUST and MODE reading up the left at −12.65, START/STOP and LIGHT down the right at 12.73, with gold dots at (±12.95, −6.36 / 5.6). LED BACKLIGHT in white, −5.51 to 5.63; ALARM and CHRONO in gold. |
| Badge | SHOCK RESIST: a gold-outlined shield from −2.87 to 3.05 and 8.17 to 11.12, with the two words in gold and a red chevron at its point. |
| LCD | A dark frame (±10.92, −7.31 to 6.54) with a fine light line, and the light grey panel (±10.28, −6.71 to 5.94), shaded under its top and left edges. Ink `#101110`; unlit segments at the shared ghost opacity. |
| Main time | Digits 4.61 mm tall from 0.17, 2.3 mm wide, strokes 0.62, leaning 5.7° about their mid-height (2.475). Hour tens (1 or blank) ending at −6.97, hour −5.95, colon about −2.55 (dots at 1.41 and 3.56), minutes −1.55 and 1.81. |
| Seconds | 3.45 mm tall from 1.41, bottom-aligned, 1.72 mm wide, strokes 0.52, at 5.1 and 7.45, leaning the same. |
| Top row | Day letters (nine segments) 2.75 mm tall at −6.63 and −3.99. Month and date, 2.95 mm tall, in a printed box (−1.39 to 9.47, −5.69 to −1.29): month at −0.3 and 1.6 (leading zero blank), a fixed dash, date at 5.1 and 7. All leaning 5.7°. PM below the hourly-signal bars and alarm bell at the left. |
| Light icon | The burst above the seconds (6.02 to 8.65, −0.74 to 0.81), an indicator drawn off. |
| Band | 25.2 mm at the case, narrowing straight to 20 mm over 12 mm, then the usual slow taper. Stepped segments every 4.75 mm with a lit lip and a shadow at each step, a soft crown across each, and dimples at ±8.45, 3.25 mm into the first two segments. |
| LED | A near-even white glow (`#EEF4FF`) over the panel, falling to about two-thirds at its corners. Shown at Night only. |

## Display and live time

- **Sample moment:** Sunday 30 June, 10:58:50 pm, as in Casio's photo, in 12-hour format with PM lit. The photo shows the month, so the sample is a date in June that falls on a Sunday (30 June 2024); the F-91W and A168 show the same time on another Sunday the 30th.
- **Live time:** with live time on, the display shows the device's local time, day, month and date, changing on each second, from the shared clock. Turning live time off restores the sample.
- **Indicators:** the hourly-signal, alarm and light indicators are drawn off; the photo shows them on, but a still drawing shouldn't claim an alarm is set. The stopwatch, timer, alarms and flash alert aren't simulated.

## Lighting

No lume. Casio lists an LED backlight (Super Illuminator) in white, with afterglow. Super Illuminator is designed to light the whole display, so the light is drawn nearly even with a gentle fall-off, unlike the F-91W's LED at one side. Following the shared convention, Day and Dusk show the display unlit, and Night shows the light switched on, as if LIGHT were pressed; the details caption says so. The afterglow isn't shown. Evidence is in [lume and dark mode](../lume.md).

## Prices

Current Casio prices in four markets, all checked 3 November 2026, Japan first as Casio's home market:

- ¥14,300 including tax (DW-5600UE-1JF, Casio Japan)
- £99.90 (DW-5600UE-1ER, Casio UK)
- €99.90 including VAT (Casio Germany)
- A$249.00 (DW5600UE-1D, CASIO Australia's store, run by Shriro, Casio's official distributor, marked "In Stores Only")

As with the A168, the Australian RRP is well above the other markets and above what Australian retailers usually charge, about A$117. Those are dealer prices, which the [pricing standard](../pricing-standard.md) doesn't record, so the details page shows Casio Australia's A$249. Casio America doesn't list this reference. No launch price from Casio was found.

## Validation

- **Overlay:** the finished drawing was laid at 50% over the photo at its uniform 23.25 px/mm. The bezel outline, lug blocks and bosses, buttons, plates, window and silver line, all the printing, the LCD panel and box, and every digit and indicator fall on the photo's.
- **Other views:** checked the details page in Day and Night (caption included), Compare side by side with the A168 and F-91W, the 17 cm wrist and the other watches on the same wrist, and the share-preview image.
- **Live time:** matched the device clock to the second, including the month and date, and kept advancing; turning it off restored the sample. Tests cover the month's blank leading zero and month and year rollover.
- **Regression:** renders of every other catalogue watch (7 views each) are byte-identical to `main`, including after moving the shared Casio pieces into `casio.ts`.
- **Budget:** at `strapLen: 12`, 269 elements and about 28.8 KB (6.7 KB gzipped), within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Lettering:** PROTECTION, G-SHOCK and the small labels use Arial bold, not Casio's lettering; the CASIO logo is drawn.
- **Bezel:** its stepped outer edge and flat front are drawn as two flat faces with gradients; the photo's moulded steps and soft highlights round the corners are simplified.
- **Band:** straight-edged and flat; the segments' rounded profiles are a light band and a shadow each, and only the two nearest the case carry dimples, as in the photo. The keeper and buckle aren't drawn.
- **Digits:** the shared nine-segment day letters; the photo's faint shadows under the segments aren't drawn.
- **LED:** one radial gradient; the afterglow isn't shown.
