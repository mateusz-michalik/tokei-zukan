# Casio F-91W-1 — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 30 October 2026. The first digital watch and the first rectangular case in the catalogue; it set the shared conventions in [Digital displays](../watch-illustration-standard.md#digital-displays) and [Digital displays and backlights](../lume.md#digital-displays-and-backlights).

## Reference and dimensions

- **Photo:** Casio's front-on F-91W-1 product photo (1214 px square), supplied for this work. It is not stored in the repository.
- **Specs:** [F-91W-1 on Casio](https://www.casio.com/intl/watches/casio/product.F-91W-1/), confirmed against a screenshot of Casio's page supplied for this work:
  - **Case:** 38.2 × 35.2 × 8.5 mm (L × W × H), 21 g, resin case, bezel and band, resin glass.
  - **Power and features:** "Water resistant" with no depth, about 7 years on a CR2016, ±30 seconds a month, LED light. 12/24-hour time with hour, minute, second, pm, date and day; daily alarm and hourly signal; 1/100-second stopwatch to 59'59.99"; auto-calendar set at 28 days for February. Band fits 145–200 mm wrists.
- **Variant:** black resin case and band, blue-ringed black window with gold F-91W and ALARM CHRONOGRAPH, positive LCD. Casio sells the same watch as F-91W-1JH in Japan, F-91W-1YEG in Germany and F91W-1 in the US and Australia; the suffixes mark the market. The F-91W derivatives (F-105W and others) are different watches and aren't covered.
- **Module:** 593. The catalogue records quartz digital, module 593; mechanical fields such as `beats` don't apply.
- **Case size:** `caseShape: "rectangular"`. `diameter` holds the 35.2 mm width and `lugToLug` the 38.2 mm length (Casio's L, which runs to the case's top and bottom edges, where the band enters). The app labels them Width and Length.
- **Strap:** 18 mm between the case's spring bars, as retailers selling Casio's replacement band list it ([Watch.co.uk](https://www.watch.co.uk/casio-f-91w-black-resin-strap-71604002.htm)). The band itself is 22 mm where it meets the case and 16 mm at the clasp. The catalogue sets `lugWidth: 18` with a fitted resin strap (`fitted: 22`), so other straps fit the 18 mm attachment.
- **Scale and perspective:** the photo is taken from slightly above, so the case looks taller than its published proportions (1.24 against 1.085). Horizontal positions use the 35.2 mm width across the button bulges (15.5 px/mm); vertical ones use the 38.2 mm length (14.35 px/mm). The drawing is symmetric; the photo shows more of the right flank.

## Where it lives

- **Selection:** `shape: "f91w"` sends the drawing to `f91wSVG()` in [f91w.ts](../../src/render/f91w.ts). The display uses the shared [LCD helpers](../../src/render/lcd.ts).
- **Strap:** the `ribbed` rubber style in [strap.ts](../../src/render/strap.ts): shallow grooves across the band every 4.5 mm.
- **Live time:** `setDisplays()` in [liveTime.ts](../../src/lib/liveTime.ts), in the same loop as analogue hands.

## Measurements used

All in millimetres from the case centre, at 35.2 × 38.2 mm.

| Feature | Value |
|---|---|
| Case | Top and bottom edges 22.4 and 22.2 mm across at ±19.1. Chamfered corners to sides at ±14.3 from −14.4 to −9.9 and 10.5 to 14.4, with bulges out to ±17.6 between −7.2 and 7.6 for the buttons. The face is an inset copy of the outline (95.5%), lit along the top and left. |
| Buttons | Chrome, 1.7 mm tall, standing out to ±19.1: two on the left at −3.55 (LIGHT) and 6.3 (MODE), one on the right at 6.3. |
| Window | Black, 28.3 × 26.15 mm from −11.25 to 14.9, corners 2.6. A 0.42 mm blue ring inside its edge and a fine silver line at 12.8 × 9.7 to 13.4. |
| Printing | CASIO in white and F-91W in gold italic, both 1.25 mm caps at −7.42, 6.7 and 6.3 mm wide. A blue rule at −6.1. LIGHT and MODE in grey with red arrows. ALARM CHRONOGRAPH in gold, 14.3 mm wide. ALARM ON·OFF/24HR, blue rules at 10.6, WATER and RESIST, and WR in red italic in a 7.4 × 2.8 mm blue rounded box. |
| LCD | Grey panel 20.3 × 11.0 mm from −2.93 to 8.08, inside a silver frame. Ink `#1d201c`; unlit segments at 7% opacity. |
| Main time | Digits 5.16 mm tall from 2.02, 2.52 mm wide, strokes 0.55. Hour tens (1 or blank) at −8.55, hour −6.13, colon −2.71, minutes −1.68 and 1.55. |
| Seconds | 3.98 mm tall, bottom-aligned with the main digits, 1.81 wide, strokes 0.43, at 4.9 and 7.29. |
| Top row | Day letters (nine segments) 2.37 mm tall at −3.03 and −0.9. Date 2.68 mm tall at 5.35 and 7.42 (leading zero blank). PM, the hourly-signal bars and the alarm bell at the left. |
| LED | A radial glow from the panel's left edge (−10.4, 2.6), fading to a quarter strength at the right. Shown at Night only. |

## Display and live time

- **Sample moment:** Sunday the 30th, 10:58:50 pm, as in Casio's photo, in 12-hour format with PM lit.
- **Live time:** with live time on, the display shows the device's local time, day and date in 12-hour format, changing on each second. It uses the shared clock, so in Compare it agrees with every other watch. Turning live time off restores the sample moment.
- **Indicators:** the alarm and hourly-signal indicators are drawn off. The photo shows them on, but a still drawing shouldn't claim an alarm is set. Stopwatch and alarm modes aren't simulated.

## Lighting

No lume. The LED light is pale green and lights the display unevenly from the left, as reviews describe ([Ben's Watch Club](https://benswatchclub.squarespace.com/blog/casio-f-91w-review), [HiConsumption](https://hiconsumption.com/watches/casio-f91w-review/)). Following the shared convention, Day and Dusk show the display unlit, and Night shows the light switched on, as if LIGHT were pressed. The details caption says so. Evidence is in [lume and dark mode](../lume.md).

## Prices

Current Casio prices for the same watch in four markets, Japan first as Casio's home market: ¥2,200 including tax (F-91W-1JH), €19.90 (F-91W-1YEG, Casio Germany), A$59.95 (CASIO Australia's store, run by Shriro, Casio's official distributor; a A$49.00 sale price at the time isn't recorded) and US$29.95. The F-91W launched in 1989; no launch price from Casio was found, so none is recorded.

## Validation

- **Overlay:** rendered at the photo's horizontal scale and squeezed to its vertical scale, then overlaid at 50%. The window, printing, LCD digits, indicators and buttons fall on the photo's features.
- **Other views:** checked the details page in Day, Dusk and Night, Compare side by side and as outlines with the SRPB43 and SSK003, the 17 cm wrist, a thumbnail, NATO and bracelet straps, and the share-preview image.
- **Live time:** checked against the device clock, through seconds changing and a hidden-then-visible tab. Turning it off restored the sample. In Compare, the display and the analogue hands followed the same clock. Tests cover 12-hour edge cases (midnight, noon, single-digit hours) and minute, day and month rollover.
- **Budget:** at `strapLen: 12`, 172 elements and about 16.7 KB (4.1 KB gzipped), within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Lettering:** CASIO, F-91W and the small labels use Arial bold, not Casio's own lettering.
- **Day letters:** they use a nine-segment layout. The real module's day segments differ in small ways, especially for M and W.
- **Case finish:** the resin case is a flat gradient with one lit edge. The photo's moulded steps round the window and where the band enters aren't modelled.
- **Strap:** the fitted end narrows from 22 to 18 mm over 9 mm, quicker than the photo's band.
- **LED:** one radial gradient, not the light's real hot spot and falloff.
