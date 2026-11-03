# Casio A168WA-1W — illustration notes

Drawn to the [watch illustration standard](../watch-illustration-standard.md), 3 November 2026. The second digital watch; it reuses the F-91W's shared [digital display](../watch-illustration-standard.md#digital-displays) and [backlight](../lume.md#digital-displays-and-backlights) conventions, and is the first with an electroluminescent backlight and a bracelet wider than its lugs.

## Reference and dimensions

- **Photos:** Casio's A168WA-1 product photo (500 × 600 px, roughly front-on) for proportions, and a 2000 px close-up of the face, shot from slightly below, for the printing and display. Both were supplied for this work and aren't stored in the repository.
- **Specs:** [A168WA-1W on Casio](https://www.casio.com/intl/watches/casio/product.A168WA-1/), confirmed against screenshots of Casio's page supplied for this work:
  - **Case:** 38.6 × 36.3 × 9.6 mm (L × W × H), 50 g, resin case and bezel, chrome plated, resin glass, stainless steel band with an adjustable clasp, for 145–205 mm wrists.
  - **Power and features:** "Water Resistant" with no depth, about 7 years on a CR2016, ±30 seconds a month, electro-luminescent backlight in blue green. 12/24-hour time with hour, minute, second, pm, date and day; daily alarm and hourly signal; 1/100-second stopwatch to 59'59.99" with split and 1st–2nd place times; auto-calendar set at 28 days for February.
- **Reference:** Casio's international page labels it A168WA-1W but its URL uses A168WA-1. The same watch is A168WA-1YES in the UK, A168WA-1 in Austria, A168W-1 in the US, and A168WA-1A2WJR in Japan, where Casio notes the reference changed from A168WA-1 with no change to the watch. Casio Australia sells it as A168WA-1W. The A158, A168WE and A168 variants with other dials or finishes are different watches and aren't covered.
- **Module:** 3298, from the operation-guide link on Casio's page. The catalogue records quartz digital, module 3298.
- **Case size:** `caseShape: "rectangular"`. `diameter` holds the 36.3 mm width and `lugToLug` the 38.6 mm length.
- **Case material:** chrome-plated resin, not steel; the details page says so in Bezel ("Chrome-plated resin case, no bezel").
- **Bracelet:** 18 mm between the case's spring bars, as strap retailers list it ([CNS Watch Bands](https://cnswatchbands.com/blog/best-watch-straps-for-the-casio-a168-and-a158/)); Casio doesn't publish it. The supplied bracelet's links are about 21 mm across where they leave the case, measured on both photos, so the catalogue sets `lugWidth: 18` and the bracelet `fitted: 21`. The bracelet is drawn at 21 mm and tapers to 18 mm over 70 mm; other straps fit the 18 mm attachment.
- **Scale:** the front-on photo fits Casio's dimensions at one uniform scale, 7.9 px/mm: 287 px across the button guards (36.3 mm) and 306 px from top to bottom edge (38.6 mm). So 36.3 mm is the width across the guards, not the button tips, and 38.6 mm the full length. The window is centred in the case. The close-up was measured at one uniform 46.95 px/mm, from the blue ring, which agrees with the front-on photo (27.6 × 23.9 mm) in both directions. Being shot from below, it shows more of the lower sloped faces than the upper ones, so case features were averaged top and bottom and checked against the front-on photo.

## Where it lives

- **Selection:** `shape: "a168"` sends the drawing to `a168SVG()` in [a168.ts](../../src/render/a168.ts). The display uses the shared [LCD helpers](../../src/render/lcd.ts).
- **Bracelet:** the `oyster` bracelet style in [strap.ts](../../src/render/strap.ts), with the A168's options passed from [watch.ts](../../src/render/watch.ts), and the bracelet's new `fitted` width.
  - **Links:** centre width 0.36, link pitch 4 mm, and flat links with crisp seams (`linkShade: "flat"`, as on the Submariner).
  - **Finish and taper:** brushing along the bracelet's length (`brush: "along"`), and a taper to 17 mm over 40 mm (`clasp`, `taperLen`).
- **Live time:** `setDisplays()` in [liveTime.ts](../../src/lib/liveTime.ts), unchanged from the F-91W.

## Measurements used

All in millimetres from the case centre, at 36.3 × 38.6 mm.

| Feature | Value |
|---|---|
| Case | Top and bottom edges 22.1 mm across at ±19.3, slightly rounded at the corners. Sloped blocks from there to ±16.1, 25.1 mm across. Straight shoulders out to (±16.3, ∓9.95), then a rounded step out to the guards at ±18.15 from ±3.9 to ±8.2, with a slight waist at ±17.75 between ±3.5. |
| Front | The sloped blocks (where the bracelet enters), a facet down to ±14.6, polished flanks down the sides, and a flat surround inside them: top and bottom at ±14.6, shoulders parallel to the case's, sides at ±16.35. Lit from the top left, as in the photo: bright blocks and surround, with the flanks and facets in shade between them. Restrained white highlights across each block, along the surround's top-left corner and down the left flank. |
| Buttons | Chrome cylinders 2.44 mm tall, standing out to ±19.25: LIGHT at −5.95 and MODE at 5.95 on the left, START/STOP at 5.95 on the right. |
| Window | Black, 30 × 25.8 mm, centred, corners rounded at about 7.2 mm. A 0.4 mm blue ring centred 27.64 × 23.92 mm across (corners about 6.3 mm), and a 0.27 mm silver line at 26.22 × 22.42 mm. |
| Printing | The CASIO logo drawn as paths in silver-white, 1.24 mm tall from −8.79 to −1.93: squared C, S and O with tight rounded corners (0.28 mm strokes), a flat-topped A with a low crossbar, and a plain I; ALARM CHRONO in gold, 0.81 mm caps, −0.65 to 9.42. The blue band from −7.88 to −5.9, its arrow tip at −10.32, with ELECTRO (−8.19 to −2.33) and LUMINESCENCE (−2.10 to 8.25) in silver italic small capitals, each large initial its own text so the share-image renderer draws them reliably. LIGHT and MODE read down the left at −11.9, START/STOP up the right at 12.2, with red dots at (∓11.35, −5.82 / 5.92). ILLUMINATOR in red italic, −6.14 to 5.95, between red arrows. A silver rule at 7.93. WATER and RESIST in gold, and WR in bold italic, slanted 14° by a transform so every renderer draws the slant, in a gold badge (−2.61 to 2.69, 8.48 to 10.35) with two corners cut. |
| LCD | Grey panel 19.58 × 9.67 mm from −4.96, corners 1 mm, shaded under its top edge. Ink `#141613`; unlit segments at the shared ghost opacity. |
| Main time | Digits 4.39 mm tall from −0.51, 2.35 mm wide, strokes 0.6. Hour tens (1 or blank, 0.62 stroke) ending at −6.75, hour −5.92, colon −2.63 (dots at 0.79 and 2.58), minutes −1.7 and 1.52. |
| Seconds | 3.13 mm tall from 0.77, bottom-aligned with the main digits, about 1.7 mm wide, strokes 0.46, at 4.72 and 6.93. |
| Top row | Day letters (nine segments) 2.03 mm tall at −0.86 and 1.16, strokes 0.3. Date 2.22 mm tall at 4.46 and 6.42, strokes 0.37 (leading zero blank). PM below the hourly-signal bars and alarm bell at the left. |
| Bracelet | Three rows, the centre 0.36 of the width and staggered half a link, 4 mm pitch. Flat links with crisp seams, brushed along the bracelet's length; a three-piece end link with the centre piece running further. 21 mm wide at the case, tapering to 17 mm 40 mm away. |
| Crystal | A faint reflection across the upper-left glass, fading from 16% to nothing before the display. |
| EL backlight | One flat layer of `#6FE0D2` at 90% over the whole panel, with a little shade under its top edge. Shown at Night only. |

## Display and live time

- **Sample moment:** Sunday the 30th, 10:58:50 pm, as in Casio's photo, in 12-hour format with PM lit. It's the same moment as the F-91W's, since Casio photographs both at it.
- **Live time:** with live time on, the display shows the device's local time, day and date in 12-hour format, changing on each second, from the shared clock. Turning live time off restores the sample.
- **Indicators:** the hourly-signal and alarm indicators are drawn off; the photo shows them on, but a still drawing shouldn't claim an alarm is set. Stopwatch and alarm modes aren't simulated.

## Lighting

No lume. Casio lists an electro-luminescent backlight in blue green, which the dial's ELECTRO LUMINESCENCE and ILLUMINATOR printing refer to. An EL panel lights the whole display evenly, unlike the F-91W's LED at one side, so it's drawn as one flat layer. Following the shared convention, Day and Dusk show the display unlit, and Night shows the light switched on, as if LIGHT were pressed; the details caption names the EL backlight. The exact shade was chosen to match Casio's "blue green"; no calibrated night photo was used. Evidence is in [lume and dark mode](../lume.md).

## Prices

Current Casio prices in four markets, all checked 3 November 2026, Japan first as Casio's home market:

- ¥3,300 including tax (A168WA-1A2WJR, Casio Japan)
- £40.00 (A168WA-1YES, Casio UK)
- €39.90 including VAT (A168WA-1, Casio Austria; Casio Germany's store didn't list it)
- US$39.95 (A168W-1, Casio America)

Casio itself has no Australian site or store (casio.com/au doesn't exist). CASIO Australia's store is "owned and operated by SHRIRO, official distributor of CASIO products in Australia", in its own words, so it isn't the maker and its A$139 isn't recorded (WC-071, 3 November 2026). Australian visitors see a marked conversion from the Japanese price. No launch price from Casio was found.

## Validation

- **Overlay:** the finished drawing was laid at 50% over both photos at their uniform scales (46.95 and 7.9 px/mm), centred on the window. The window, blue ring, silver line, printing, LCD panel, every digit and indicator, and the buttons fall on the photo's. The case sides, shoulders and guards follow the front-on photo; in the close-up the upper and lower blocks differ from the drawing by the camera's tilt, as expected.
- **Other views:** checked the details page in Day and Night (caption included), Compare side by side with the F-91W and Submariner and as stacked outlines, the 17 cm wrist, sidebar thumbnails, an 18 mm leather strap (narrower than the case blocks, as on the real watch), and the share-preview image.
- **Live time:** matched the device clock to the second and kept advancing; turning it off restored the sample. Tests cover the shared 12-hour edge cases and minute, day and month rollover.
- **Regression:** renders of every other catalogue watch (7 views each) are byte-identical before and after, apart from the night-glow filter's running id number.
- **Budget:** at `strapLen: 12`, 281 elements and about 21.8 KB (5.0 KB gzipped), within the 320-element and 50 KB limits.
- **Checks:** `npm run build` passes type checking, all tests and the production build.

## Review refinements

A review the same day kept the proportions, face and LCD layout, and asked for finishing touches:
- **Chrome:** more contrast between the bright surround and blocks and the darker flanks and facets, with a few restrained highlights.
- **Bracelet:** a subtle taper, crisper link seams and lengthwise brushing.
- **Lettering:** the CASIO logo drawn in Casio's squared shapes, and WR in bold italic.
- **Crystal:** a faint reflection on the upper-left glass.

A before/after render dump showed only the A168's views changed.

## Remaining approximations

- **Lettering:** the CASIO logo is drawn from the photo, but ELECTRO LUMINESCENCE and the small labels use Arial bold, not Casio's own lettering.
- **Digits:** upright; the photo's digits lean very slightly (about 0.1 mm over a digit's height). The day letters use the shared nine-segment layout.
- **Chrome:** the plated finish is drawn as a few faces with gradients and a handful of highlights; the photo's full reflections aren't modelled.
- **Bracelet:** the shared oyster bracelet at the A168's proportions, with a curved centre end piece; the real end link is a squarer T-shape and its links are folded steel. The clasp width (17 mm) is estimated from the photo's taper; Casio doesn't give it.
- **EL backlight:** one flat colour; real panels are slightly uneven and dim towards the edges.
