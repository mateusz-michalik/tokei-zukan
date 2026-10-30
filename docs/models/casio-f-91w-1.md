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
- **Strap:** 18 mm between the case's spring bars, as retailers selling Casio's replacement band list it ([Watch.co.uk](https://www.watch.co.uk/casio-f-91w-black-resin-strap-71604002.htm)). The band itself is 22 mm where it meets the case and 16 mm at the clasp. The catalogue sets `lugWidth: 18` with a fitted resin strap (`fitted: 22`, narrowing straight over `fittedLength: 20`), so other straps fit the 18 mm attachment.
- **Scale:** one uniform scale, 15.8 px/mm, fits both of Casio's dimensions. The case spans 34.9 mm across its button steps and 38.6 mm from top to bottom edge in the photo, so 35.2 mm is the width across the button steps (not the button tips) and 38.2 mm the full length. The window sits centred in the case: about 7 mm of resin above and below it. A first pass mistook a step on the face for the case's bottom edge and scaled width and length separately to make an overlay fit; that hid the error and produced a squat case with rounded side wings. The case was rebuilt from a flat-colour silhouette compared at uniform scale (see Validation).
- **Perspective:** the photo shows a little of the right flank, so the silhouette was matched against the left edge and mirrored.

## Where it lives

- **Selection:** `shape: "f91w"` sends the drawing to `f91wSVG()` in [f91w.ts](../../src/render/f91w.ts). The display uses the shared [LCD helpers](../../src/render/lcd.ts).
- **Strap:** the `ribbed` rubber style in [strap.ts](../../src/render/strap.ts): shallow grooves across the band every 4.5 mm.
- **Live time:** `setDisplays()` in [liveTime.ts](../../src/lib/liveTime.ts), in the same loop as analogue hands.

## Measurements used

All in millimetres from the case centre, at 35.2 × 38.2 mm.

| Feature | Value |
|---|---|
| Case | Top and bottom edges 21.2 mm across at ±19.1. Straight chamfered shoulders from there out to (±16.3, ∓9.3). Straight sides at ±17.2, with small angular steps out to ±17.6 round the buttons (−5.4 to −2.3 and 2.3 to 5.4) and a slight waist at ±16.7 between them. |
| Moulded front | Drawn as its own shapes: a step across each shoulder at −15.2 and 14.9, where the band enters, and an angular frame round the window (straight sides at ±15.4, top at −13.4, bottom at 13.1, corners cut parallel to the shoulders), each lit along its top and left. |
| Buttons | Chrome, 1.9 mm tall, standing out to ±18.8: two on the left at −4.3 (LIGHT) and 4.1 (MODE), one on the right at 4.1. |
| Window | Black, 28 × 23.75 mm from −12 to 11.75, centred in the case, with 2.8 mm chamfered corners softened slightly. A 0.42 mm blue ring just inside its edge, and a fine silver line at ±12.5, −10.6 to 10.3. |
| Printing | CASIO in white and F-91W in gold italic, 1.14 mm caps on a baseline at −8.5, 6.5 and 6.2 mm wide. A blue rule at −7.37. LIGHT and MODE in grey with red arrows. ALARM CHRONOGRAPH in gold, 13.95 mm wide. ALARM ON·OFF/24HR, blue rules at 7.78, WATER and RESIST, and WR in red italic in a 7.2 × 2.47 mm blue rounded box. |
| LCD | Grey panel 19.9 × 10 mm from −4.49 to 5.51, inside a silver frame. Ink `#1d201c`; unlit segments at 7% opacity. |
| Main time | Digits 4.68 mm tall from 0, 2.47 mm wide, strokes 0.5. Hour tens (1 or blank) at −8.3, hour −6.01, colon −2.66, minutes −1.65 and 1.52. |
| Seconds | 3.6 mm tall, bottom-aligned with the main digits, about 1.73 wide, strokes 0.4, at 4.81 and 7.15. |
| Top row | Day letters (nine segments) 2.15 mm tall at −2.97 and −0.89. Date 2.47 mm tall at 5.25 and 7.28 (leading zero blank). PM, the hourly-signal bars and the alarm bell at the left. |
| Strap | 22 mm wide where it leaves the case, matching the case's top edge, narrowing in a straight line to the 18 mm lug width over 20 mm (`fittedLength`), then the usual slow taper. Ribs every 4.5 mm. |
| LED | A radial glow from the panel's left edge (−9.8, 0.5), fading to a quarter strength at the right. Shown at Night only. |

## Display and live time

- **Sample moment:** Sunday the 30th, 10:58:50 pm, as in Casio's photo, in 12-hour format with PM lit.
- **Live time:** with live time on, the display shows the device's local time, day and date in 12-hour format, changing on each second. It uses the shared clock, so in Compare it agrees with every other watch. Turning live time off restores the sample moment.
- **Indicators:** the alarm and hourly-signal indicators are drawn off. The photo shows them on, but a still drawing shouldn't claim an alarm is set. Stopwatch and alarm modes aren't simulated.

## Lighting

No lume. The LED light is pale green and lights the display unevenly from the left, as reviews describe ([Ben's Watch Club](https://benswatchclub.squarespace.com/blog/casio-f-91w-review), [HiConsumption](https://hiconsumption.com/watches/casio-f91w-review/)). Following the shared convention, Day and Dusk show the display unlit, and Night shows the light switched on, as if LIGHT were pressed. The details caption says so. Evidence is in [lume and dark mode](../lume.md).

## Prices

Current Casio prices for the same watch in four markets, Japan first as Casio's home market: ¥2,200 including tax (F-91W-1JH), €19.90 (F-91W-1YEG, Casio Germany), A$59.95 (CASIO Australia's store, run by Shriro, Casio's official distributor; a A$49.00 sale price at the time isn't recorded) and US$29.95. The F-91W launched in 1989; no launch price from Casio was found, so none is recorded.

## Validation

- **Silhouette:** before any shading, the case outline, window outline, buttons and strap attachment were drawn as flat outlines at the photo's uniform 15.8 px/mm and laid over it. The case follows the photo's left edge through the shoulders, side steps and waist; the window follows the blue ring; the buttons sit on the photo's. The full drawing was then overlaid at 50%, also at uniform scale: the window, printing, LCD digits and indicators fall on the photo's.
- **Other views:** checked the details page in Day, Dusk and Night, Compare side by side and as outlines with the SRPB43 and SSK003, the 17 cm wrist, a thumbnail, NATO and bracelet straps, and the share-preview image.
- **Live time:** checked against the device clock, through seconds changing and a hidden-then-visible tab. Turning it off restored the sample. In Compare, the display and the analogue hands followed the same clock. Tests cover 12-hour edge cases (midnight, noon, single-digit hours) and minute, day and month rollover.
- **Budget:** at `strapLen: 12`, 169 elements and about 16.0 KB (4.1 KB gzipped), within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Remaining approximations

- **Lettering:** CASIO, F-91W and the small labels use Arial bold, not Casio's own lettering.
- **Day letters:** they use a nine-segment layout. The real module's day segments differ in small ways, especially for M and W.
- **Case finish:** flat resin with one lit edge per moulded step; the photo's soft highlights on the shoulders aren't modelled.
- **Strap:** straight-edged and flat. The real band curves away from the case, which the top-down drawing doesn't show.
- **LED:** one radial gradient, not the light's real hot spot and falloff.
