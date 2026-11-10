# Watch illustration standard

The refined Seiko SPB317 is the default quality benchmark for new and updated watch illustrations. Match its level of model-specific observation, dimensional accuracy and finish—not its particular case shape, colours or dial design.

The goal is a recognisable, carefully proportioned illustration that works in a watch comparison. It should remain convincing when enlarged and readable at thumbnail size. It is not a photograph, and extra texture is not a substitute for correct geometry.

## Start here

1. Read this guide and inspect the target watch's catalogue entry and active rendering branch.
2. Obtain a clear photograph of the exact reference and confirm its dimensions.
3. Save a before image, then work from silhouette and attachment geometry inward to the dial details.
4. Compare the rendered result with the photograph throughout the work, including enlarged crops and normal app sizes.
5. Check straps, outline mode, wrist views and other affected models, in light and dark mode. Tag every lume element with `lu('part')` so it can glow at night (see [lume and dark mode](lume.md)). Run `npm run build` before handing over renderer changes.

The current SPB317 source is the benchmark. Earlier screenshots from its development omit later corrections, particularly the rounded lug ends, flush strap fit, shorter bezel numerals and lower brand logo.

## Hands and live time

Draw the hands at the reference photo's time; that pose is what visitors see with live time off, and what tests compare. Live time then turns the hands to the device's time without redrawing anything, so every hand must follow one rule:

- Wrap each hand, and its shadow, in an element whose `transform` ends in `rotate(angle)` about the hand's pivot: `rotate(a)` for the centre, `translate(x y) rotate(a)` for a subdial. Put any other offsets on a parent.
- Tag that element with `handRole(role)` from [`src/render/hands.ts`](../src/render/hands.ts), right before `transform`: `hour`, `minute` and `second` for the central hands, `small-seconds` for a running-seconds subdial, `hour24` for a GMT hand or 24-hour subdial (it shows local time), and `chrono` for chronograph hands and counters, which rest at zero.
- Give the catalogue entry `beats`, the seconds hand's steps per second: 1 for quartz, 6 for 21,600 vph, 7 for 25,200 vph (Omega's 3.5 Hz calibres), 8 for 28,800 vph.

`npm test` checks every watch: hour, minute and a seconds hand tagged, each transform ending in a rotate, and seconds hands carrying the watch's beats.

## Digital displays

The F-91W set the conventions for digital watches; later digitals reuse [`src/render/lcd.ts`](../src/render/lcd.ts), as the A168 does.

- **Catalogue:** set `"display": "digital"`. Live time then sets the display instead of hands; leave out `beats`. The hand tests skip digital watches, and `lcd.test.ts` checks their displays instead.
- **Segments, not a font:** build every character from segments with `lcdCell()`, sized and placed from the photo. Seven segments cover digits; day fields also use `k` and `n`, the upper and lower centre strokes Casio uses for M, T, W and R. A cell that only ever shows one shape, like the F-91W's hour tens (always 1 or blank), lists just the segments it has. Indicators such as PM use `lcdIndicator()`.
- **Every segment drawn:** lit segments use the display's ink; unlit ones stay drawn at `GHOST` opacity, the faint ghost a positive LCD shows. That keeps every segment in the DOM, so live time only changes `fill-opacity`.
- **Sample moment:** without live time a display shows a fixed sample moment, normally the one in the maker's photo (the F-91W shows Sunday the 30th, 10:58:50 pm). `lcdDisplay()` stores it, with the 12- or 24-hour format the watch shows, so live time can restore it.
- **Live time:** `setDisplays()` in [`src/lib/liveTime.ts`](../src/lib/liveTime.ts) runs in the same loop and reads the same clock as the hands, so every watch on a page agrees. Digits change on the second boundary; a hidden tab's loop pauses and re-reads the clock when it returns. With reduced motion it updates once a minute.
- **Status indicators:** draw alarm, hourly-signal and stopwatch indicators off (ghosted). A still drawing shouldn't claim an alarm is set or a stopwatch is running. Buttons and modes aren't simulated.
- **Light:** a backlight isn't lume. See [lume and dark mode](lume.md#digital-displays-and-backlights).
- **Case size:** a rectangular case sets `"caseShape": "rectangular"`. `diameter` holds its width and `lugToLug` its overall length (the maker's L), shown as Width and Length.
- **Wider than the lugs:** Casio's supplied straps and bracelets are often wider at the case than their spring bars. Keep `lugWidth` at the attachment, so other straps fit it, and draw the supplied one wider: a resin strap with `fitted` (and `fittedLength`) narrows back to the lug width, or to its own `width` where the band itself is wider than the attachment, as on the DW-5600UE's 20 mm band on 16 mm spring bars; a bracelet with `fitted` is drawn at that width throughout, as the A168's 21 mm links on an 18 mm attachment.
- **Month and leaning digits:** `lcdChars()` also gives `month-tens` and `month` (leading zero blank), for modules that show the month, like the DW-5600UE's "6-30". Fixed marks such as its dash are plain paths in the display's ink. Where a module's digits lean, wrap each row's cells in a skew about that row's mid-height, so cells measured at mid-height stay where they were measured.
- **Shared Casio pieces:** [`src/render/casio.ts`](../src/render/casio.ts) holds the drawn CASIO logo (placed and sized per watch with a transform), the chrome button gradient and the outline helpers.

## Where the drawing lives

| File | Responsibility |
| --- | --- |
| [SPB317 catalogue entry](../catalog/watches/seiko/spb317.json) | Physical specifications and configurable appearance. |
| [Watch renderer](../src/render/watch.ts) | SVG assembly, layer order, generic features, text and model-specific dispatch. |
| [SPB317 drawing helpers](../src/render/spb317.ts) | Dedicated case, bezel machining, chapter ring, markers and hands. |
| [SPB151 drawing](../src/render/spb151.ts) | 6105-reissue case family (SPB151, SPB257): traced case with guard and crown pocket, scalloped bezel, rehaut, markers and hands. See the [SPB151 notes](models/seiko-spb151.md). |
| [SSC947 drawing](../src/render/ssc947.ts) | Complete SSC947 case, tachymeter bezel, flange, subdials, markers and hands. See the [SSC947 notes](models/seiko-ssc947.md). |
| [SPB451 drawing](../src/render/spb451.ts) | 1965 diver case (SPB451): short lugs, coin-edge bezel, chapter ring, markers and hands. See the [SPB451 notes](models/seiko-spb451.md). |
| [SPB519 drawing](../src/render/spb519.ts) | 1968 diver's GMT (SPB519): rounded model-specific case, 4 o'clock crown, 24-hour rehaut, circular plots, date and red GMT hand. See the [SPB519 notes](models/seiko-spb519.md). |
| [SRPK01 drawing](../src/render/srpk01.ts) | PADI King Turtle (SRPK01): cushion case, two-tone ceramic bezel, wave dial, day/date magnifier and cyan minute hand. Also supplies the SRPE03 black waffle variant. See the [SRPK01 notes](models/seiko-srpk01.md) and [SRPE03 notes](models/seiko-srpe03.md). |
| [SPB253 drawing](../src/render/spb253.ts) | Black Series 1965 diver (SPB253): short lugs, coin-edge bezel, orange triangle and 10, date at 3 and an orange minute hand. See the [SPB253 notes](models/seiko-spb253.md). |
| [SPB255 drawing](../src/render/spb255.ts) | Black Series 1968 diver (SPB255): rounded 1968 case, 4 o'clock crown, orange 0–20 bezel sector, circular plots, date at 3 and orange minute hand. See the [SPB255 notes](models/seiko-spb255.md). |
| [MK2 39.5 drawing](../src/render/mk2395.ts) | Baltic Aquascaphe MK2 39.5 (Blue): flat-top crown guards, sapphire 15/30/45 bezel, double-domed crystal halo, railway track, 3D BGW9 lumicast markers, pencil hands and lollipop seconds. See the [MK2 39.5 notes](models/baltic-mk2-39-5.md). |
| [C60 Pro 300 drawing](../src/render/c60300.ts) | Christopher Ward C60 Trident Pro 300 40 mm: Light-catcher case, two-part ceramic/steel bezel, applied twin-flags logo, faceted batons, date at 6 and Trident seconds hand. See the [C60 Pro 300 notes](models/christopher-ward-c60-pro-300.md). |
| [Oris 771 drawing](../src/render/oris771.ts) | Oris Divers Sixty-Five Chronograph 40 mm (01 771 7791): sweeping vintage lugs, pump pushers, condensed bezel numerals, 1/5-second track, bicompax registers, shield 12 and segmented hour hand. See the [Oris 771 notes](models/oris-01-771-7791.md). |
| [Serica 5303 drawing](../src/render/serica5303.ts) | Serica 5303-1 Diving Chronometer 39 mm: twisted lyre lugs, 8 mm fluted crown, 120-tooth bezel with ceramic minutes ring over a steel 12-hour ring, domed lume plots joined to the track, broad-arrow hour hand and integrated woven-mesh end link. See the [Serica 5303 notes](models/serica-5303-1.md). |
| [SSK003 drawing](../src/render/ssk003.ts) | Seiko 5 Sports GMT (SSK003): SKX-style case with crown guards, 60-notch coin-edge bezel, two-tone 24-hour insert with vector digits, rehaut, vector SEIKO and 5 marks, cyclops date, red lumed GMT arrow and arrow minute hand. Its five-row bracelet and divided end link are drawn by the strap renderer's `fiveRow` option. See the [SSK003 notes](models/seiko-ssk003.md). |
| [SPB507 drawing](../src/render/spb507.ts) | Seiko Prospex Alpinist (SPB507): round case with tangent flanks to slim lugs, a crown boss at 3 and a 4 o'clock crown for the inner compass ring, wide polished bezel, gold railway track with framed lume dots, applied triangles, tilted gold numerals, cathedral hour hand and seconds spade. Its crocodile-grain leather is the strap renderer's `texture: "croc"`. See the [SPB507 notes](models/seiko-spb507.md). |
| [SRPB43 drawing](../src/render/srpb43.ts) | Seiko Presage Cocktail Time (SRPB43): fully polished round case with slim lugs, wide sloping bezel, box-crystal rim, pressed radial-line dial, faceted dagger indices, framed date at 3, dauphine hands and a blue seconds hand with a hollow diamond counterweight. No lume. See the [SRPB43 notes](models/seiko-srpb43.md). |
| [F-91W drawing](../src/render/f91w.ts) | Casio F-91W (F-91W-1): the first digital and first rectangular case. Octagonal resin case with button bulges, three chrome buttons, the blue-ringed printed window and a positive LCD built from the shared [LCD helpers](../src/render/lcd.ts). Its ribbed resin strap is the strap renderer's `ribbed` rubber style, fitted to 22 mm at the case. See the [F-91W notes](models/casio-f-91w-1.md) and [Digital displays](#digital-displays). |
| [A168 drawing](../src/render/a168.ts) | Casio A168 (A168WA-1W): chrome-plated resin case with sloped blocks top and bottom, long shoulders and slight guards round three chrome buttons, a flat polished surround inside the flanks, the blue-ringed window with the ELECTRO LUMINESCENCE arrow, ILLUMINATOR and the WR badge, and a positive LCD on the shared [LCD helpers](../src/render/lcd.ts) lit evenly by its EL panel at Night. Its three-row bracelet is the oyster style at 21 mm (`fitted`) on an 18 mm attachment, with flat links, lengthwise brushing (`brush: "along"`) and its own taper (`clasp`, `taperLen`). See the [A168 notes](models/casio-a168wa-1.md). |
| [DW-5600UE drawing](../src/render/dw5600ue.ts) | Casio G-Shock DW-5600UE (DW-5600UE-1): black resin square with flat lug blocks and moulded bosses, an octagonal bezel with stepped guards round four buttons (ADJUST recessed), PROTECTION and G-SHOCK plates, the silver-lined window with its printing and SHOCK RESIST badge, and a positive LCD with leaning digits and a month and date box. Its band is the strap renderer's `segmented` resin style at 20 mm (`width`), flaring to 25.2 mm at the case (`fitted`). See the [DW-5600UE notes](models/casio-dw-5600ue-1.md). |
| [Khaki Field Mechanical drawing](../src/render/h69439931.ts) | Hamilton Khaki Field Mechanical 38mm (H69439931): matte steel case with straight lugs, flat bezel over a dark inner slope, luminous Arabic hours with an inner 13–24 ring, minute dashes with beige triangles, framed pencil hands and a round seconds counterweight. Its NATO's leather tabs are the strap renderer's `leather` option. See the [H69439931 notes](models/hamilton-h69439931.md). |
| [Speedmaster Moonwatch drawing](../src/render/omega31030425001001.ts) | Omega Speedmaster Moonwatch Professional 42 mm (310.30.42.50.01.001): asymmetric case with twisted lyre lugs (a crease from each tip to the bezel between a brushed top and a sloped facet), polished flank bevels, crown guards and a recessed fluted crown, pushers angled outwards at 2 and 4, black aluminium tachymeter with upright figures and the dot over 90, step dial with a 1/3-second track, applied lume batons and Ω, three recessed registers with squared figures, white baton hands and the chronograph hand's lume lozenge. Its arched, tapering bracelet is the strap renderer's five-row `moonwatch` layout; its figures are [stroke digits](../src/render/strokeDigits.ts), shared with the Hamilton. See the [310.30.42.50.01.001 notes](models/omega-310-30-42-50-01-001.md). |
| [Seamaster Diver 300M drawing](../src/render/omega21030422003001.ts) | Omega Seamaster Diver 300M 42 mm (210.30.42.20.03.001): twisted lyre lugs (a soft crease from each slanted tip down to the flank, a broad feathered polished facet outside it), guards either side of a recess at 3 that the rounded knurled crown stands out of, drawn over the case, the conical fluted helium escape valve at 10, a twelve-sided scalloped steel bezel edge round a glossy blue ceramic insert with a white enamel scale (a dot at every minute, wide squared figures, the outlined zero triangle and its lumed pip), the polished blue ceramic dial with its laser-engraved waves as one repeating pattern, a bracketed minute track with light-blue hour marks, applied rhodium dots and batons filled with lume (doubled at 12, short under the framed date at 6), the applied Ω and the red Seamaster, and skeleton hands with the hour hand's lume circle, the minute hand's lume arrow and a lollipop seconds hand with a red tip. Its minute hand and pip glow green and the rest blue, with the minute hand tagged as its own lume part (`minute`). Its bracelet is the strap renderer's nine-row `diver300m` layout: brushed outer and centre links with a polished, brushed and polished row between them on each side, offset half a link, at a 9 mm pitch, with clear joints between links and fine lines between rows (`colGap`). Its bezel figures are [stroke digits](../src/render/strokeDigits.ts) with their own glyphs. See the [210.30.42.20.03.001 notes](models/omega-210-30-42-20-03-001.md). |
| [Submariner drawing](../src/render/rolex1240600001.ts) | Rolex Submariner 124060-0001 (no date): straight lugs whose brushed tops are lit from above, with a shaded outer slope and polished bevel, crown guards with flat faces round the fluted Triplock crown, 120-notch bezel with a glossy black Cerachrom insert and soft reflections, engraved squared platinum figures, minute bars to 15 on the insert's inner part and the zero triangle's Chromalight pip, recessed rehaut engraved ROLEX, white-gold-framed markers (triangle, batons at 3, 6 and 9, dots), the Mercedes hour hand, a sword minute hand and a lollipop seconds hand. Its Oyster bracelet is the strap renderer's `oyster` style with long links (`linkPitch`), shaded as flat faces lit from above (`linkShade: 'flat'`); its bezel figures are [stroke digits](../src/render/strokeDigits.ts) with their own glyphs. See the [124060-0001 notes](models/rolex-124060-0001.md). |
| [Black Bay 58 drawing](../src/render/m7939a1a0nu0001.ts) | Tudor Black Bay 58 M7939A1A0NU-0001: broad brushed lugs with a narrow polished bevel and fitted end links, an unguarded crown with a rounded end and separate grip ridges, 120-notch bezel with a matt black aluminium insert, gilt rounded figures, bars and minute marks on the insert's inner part, the red zero triangle and lumed pearl, the domed sapphire's grey edge, gilt minute track and gilt-framed markers, the snowflake hour hand, a lance minute hand and a lollipop seconds hand. Its five-link bracelet is the strap renderer's five-row `bb58` layout, with per-row finishes (`rowFinish`) and polished rows running through the end link (`through`). See the [M7939A1A0NU-0001 notes](models/tudor-m7939a1a0nu-0001.md). |
| [Tsuyosa drawing](../src/render/nj015056l.ts) | Citizen Tsuyosa NJ0150-56L: long straight flanks from the bracelet to round sides at 3 and 9, finely brushed along the watch with a polished bevel down each flank, short horns either side of a fixed polished centre link 9.1 mm wide that stands 2 mm past them, a small rounded fluted crown at 4 o'clock seated in a recess in the flank with an access notch below it, a wide polished sloping bezel, a blue sunray dial in the dial's own hue (sectors following cos 2θ) with a sloping flange, white minute dashes and a lume square at each hour, applied steel batons with lume strips (pairs at 12 and 6, short at 3), the white date at 3 under a magnifier, CITIZEN and AUTOMATIC, and faceted baton hands with lume strips. Its bracelet is the strap renderer's `oyster` style with a polished centre at 0.41 of its 22 mm width, a 4.0 mm pitch and its own taper towards 18 mm; `centreSplit` divides each centre link into a rounded block and a recessed bridge in line with the outer links, which take the `creased` face. See the [NJ0150-56L notes](models/citizen-nj0150-56l.md). |
| [PRX drawing](../src/render/t1374071104100.ts) | Tissot PRX Powermatic 80 40mm T137.407.11.041.00: a tonneau case whose straight flanks run from the bracelet out to round sides at 3 and 9, brushed along its length with a polished bevel down each flank, a flat top plane turning down at a crease into short sloping horns either side of a 12 mm opening where the bracelet enters, a fluted crown with a polished chamfered end at 3, a slim smooth polished bezel, a reflective blue-grey flange, the embossed waffle dial as one repeating pattern (a raised lattice through the centre round recessed squares, 1.2 mm apart, each with a shaded and a lit wall) under a blue sheen, white minute dashes, applied steel batons with white inlays and a grey channel at their inner ends (doubled at 12, short at 3), a bevelled applied date frame, TISSOT 1853, a drawn squared PRX, POWERMATIC 80 and SWISS MADE set square to its radius, and faceted baton hands with chamfered tips, grey channels and lume inlays. Its integrated bracelet is the strap renderer's `oyster` style at its `fitted` 27.3 mm with `stepped` links: single pieces across the width whose 11.1 mm middle stands 1.5 mm proud towards the case, each edge facing the case with a narrow polished bevel beside a fine seam (`slab` and `bevel` faces), softened inside corners, an outer edge that steps out at every joint, the first link's middle filling the case's opening under the case's shadow; a 6.3 mm pitch, lengthwise brushing and a taper to 17.2 mm. Other bracelets on it are drawn as usual at the 12 mm attachment. See the [T137.407.11.041.00 notes](models/tissot-t137-407-11-041-00.md). |
| [Case helpers](../src/render/cases.ts) | Shared bezel proportions. Model-specific case outlines live in their model modules. |
| [Strap renderer](../src/render/strap.ts) | Attachment width, taper, materials and repeating textures. |
| [Geometry helpers](../src/render/geom.ts) | Polar coordinates, arcs and ring segments. |
| [Schema](../src/catalog/schema.ts), [constants](../src/catalog/constants.ts), [strap names](../src/catalog/straps.ts) | Allowed appearance options and their UI names. |
| [Drawing gallery](../src/components/Gallery.tsx) | Catalogue, thumbnail, wrist and alternate-strap review at `/#gallery`. |
| [Renderer tests](../src/render/render.test.ts) | Catalogue/strap rendering checks, unique ids, complexity budgets for the detailed models, and model-specific outline checks. |
| [Model notes](models/) | Per-model reference, measurements, validation and remaining approximations. |

Trace the active code path before editing. For example, `willard-modern` dispatches to `slimCase()` in `spb317.ts`, `willard` to `spb151SVG()` in `spb151.ts`, `speedtimer` to `ssc947SVG()` in `ssc947.ts`, `heritage` to `spb451SVG()` in `spb451.ts`, `heritage-gmt` to `spb519SVG()` in `spb519.ts`, both `srpk01` and `srpe03` to `srpk01SVG()` in `srpk01.ts`, `spb253` to `spb253SVG()` in `spb253.ts`, `spb255` to `spb255SVG()` in `spb255.ts`, `mk2-39-5` to `mk2395SVG()` in `mk2395.ts`, `c60-pro-300` to `c60300SVG()` in `c60300.ts`, `oris-771` to `oris771SVG()` in `oris771.ts`, `serica-5303` to `serica5303SVG()` in `serica5303.ts`, `ssk003` to `ssk003SVG()` in `ssk003.ts`, `spb507` to `spb507SVG()` in `spb507.ts`, `srpb43` to `srpb43SVG()` in `srpb43.ts`, `f91w` to `f91wSVG()` in `f91w.ts`, `a168` to `a168SVG()` in `a168.ts`, `dw5600ue` to `dw5600ueSVG()` in `dw5600ue.ts`, `h69439931` to `h69439931SVG()` in `h69439931.ts`, `omega-31030425001001` to `omega31030425001001SVG()` in `omega31030425001001.ts`, `omega-21030422003001` to `omega21030422003001SVG()` in `omega21030422003001.ts`, `rolex-1240600001` to `rolex1240600001SVG()` in `rolex1240600001.ts`, `m7939a1a0nu0001` to `m7939a1a0nu0001SVG()` in `m7939a1a0nu0001.ts`, `nj015056l` to `nj015056lSVG()` in `nj015056l.ts`, and `t1374071104100` to `t1374071104100SVG()` in `t1374071104100.ts`.

### File naming and temporary reviews

Name a model-specific renderer after its catalogue reference in lowercase: `spb151.ts`, `spb317.ts`, `ssc947.ts`, `spb451.ts`, `spb519.ts`, `spb253.ts`, `spb255.ts`, `mk2395.ts`, `c60300.ts`, `oris771.ts`, `ssk003.ts`, `spb507.ts`, `srpb43.ts`, `f91w.ts` (a reference with hyphens drops them), `a168.ts` and `dw5600ue.ts` (a Casio reference drops its colour and market suffixes), `h69439931.ts`. Prefix a purely numeric reference with its brand, as in `serica5303.ts`, so the module and its exports have valid names; a dotted one drops its dots too, as in `omega31030425001001.ts` for Omega's 310.30.42.50.01.001 and `omega21030422003001.ts` for its 210.30.42.20.03.001, and so does a hyphenated one, as in `rolex1240600001.ts` for Rolex's 124060-0001 and `m7939a1a0nu0001.ts` for Tudor's M7939A1A0NU-0001. A Citizen reference keeps its colour suffix, which tells the many NJ0150 dials apart: `nj015056l.ts` for the blue NJ0150-56L. A Tissot reference drops its dots and keeps every digit, since its last groups mark the dial and strap: `t1374071104100.ts` for the blue T137.407.11.041.00 on its bracelet. Use corresponding reference-based exports such as `spb451SVG()` and `spb451Case()`. Avoid family or marketing names such as Willard, Speedtimer or Heritage as module names: those names can cover multiple different watches.

An intentionally shared drawing stays in the reference module used as its baseline, with every supported reference documented. For example, `spb151.ts` also supplies the SPB257 colour variant. Generic geometry and strap helpers keep descriptive names. If another brand introduces a conflicting reference, group its modules in a brand subdirectory.

The existing `look.shape` values (`willard`, `willard-modern`, `speedtimer`, `heritage`, `heritage-gmt`, `srpk01`, `srpe03`, `spb253`, `spb255`, `mk2-39-5`, `c60-pro-300`, `oris-771`, `serica-5303`, `ssk003`, `spb507`, `srpb43`, `f91w`, `a168`, `dw5600ue`, `h69439931`, `omega-31030425001001`, `omega-21030422003001`, `rolex-1240600001`, `m7939a1a0nu0001`, `nj015056l`, `t1374071104100`) remain compatibility keys for catalogue and saved/imported watches. Renaming files or functions does not rename those stored values. Any future replacement of these keys requires a data migration.

Use `/#gallery` for routine review. Keep temporary photo comparisons and screenshots outside the repository or in ignored `review-artifacts/`; root `.*-review.html` pages are also ignored. Do not commit embedded reference photos or generated comparison pages. Retain reference provenance, measurements and decisions in `docs/models/`.

## Establish the reference and dimensions

Use a high-resolution, nearly front-facing photograph of the exact model. Confirm the dial colour, bezel, handset, date position and supplied strap; similar references can have materially different details. A wider shot establishes proportions, while closeups resolve lug corners, crown seating and typography. Record the reference source and any uncertainties with the work.

Use manufacturer specifications for physical dimensions when available. The catalogue is the app's dimensional source of truth; verify questionable values before changing them. A product photo can contain perspective distortion, curved-glass refraction and a bent strap. Do not change known dimensions merely to fit its pixels.

The renderer uses these conventions:

| Quantity | Convention |
| --- | --- |
| SVG units | Millimetres. |
| Origin | Dial centre at `(0, 0)`. |
| Axes | Positive x points right; positive y points down. |
| Clock angles | `P(r, angle)` uses 0° at 12 o'clock, increasing clockwise. |
| Case | `R = diameter / 2`; `H = lugToLug / 2`. Check whether a source measurement includes a crown or guard. |
| Strap attachment | Nominal lug width, centred on x = 0. A 20 mm attachment spans x = −10 to +10. |
| Display scale | `watchSVG(watch, px, options)` uses `px` pixels per millimetre; changing it must not change the geometry. |

For the SPB317, the catalogue specifies a 41 mm case, 46.9 mm lug-to-lug, and 20 mm lug width. Crown projection and stroke extents must fit within the SVG bounds without redefining the case diameter.

For photographic measurement, identify the dial centre and a reliable circular feature such as the outer bezel. Express internal features as ratios of that radius. Align photo and drawing by centre and a consistent reference diameter, then compare. Use uniform scaling; independently stretching width and height can hide a proportion error. Keep strap cropping consistent where possible, but do not use the bent or cropped strap length as the scale reference.

## Refine in this order

### 1. Case silhouette and lug openings

Start with a flat silhouette. Match width, lug-to-lug, shoulder curvature, asymmetry, lug tips and crown location before adding metal shading.

Use a small number of deliberate Bézier curves when a generic case shape cannot capture the model. Inspect where curves meet: a short rounded segment followed by a differently directed shoulder can still make a pointed corner. Check the outer contour both with and without its highlight stroke. Closed interpolating splines can overshoot around flat ends.

Model the spaces between the lugs as actual openings in the case path, or equivalent transparent cutouts. Do not disguise a solid case with strap-coloured rectangles across its ends. Such patches caused the SPB317's original flared lips and fail with different strap colours or backgrounds.

The strap opening and strap attachment must agree numerically. For the SPB317 both are 20 mm. Keep the band full-width through the lug area and begin the taper outside the lug tips. A path drawn straight from a hidden wide root to a narrower far endpoint will already be too narrow at the lugs—even if the width calculation at the lug position is correct. Include vertices at the taper transition.

Allow small rounded transitions at the lug ends, but do not add unexplained clearance that appears as a white slit. Check the actual rendered edges, including antialiasing and strokes.

### 2. Crown, recess and layer order

Make the visible construction plausible. A useful starting order is:

1. Strap or bracelet behind the case.
2. Case body and its surface finish.
3. Crown seat/recess, followed by the exposed crown barrel.
4. Bezel edge, insert and markings.
5. Crystal edge/chapter ring, dial, applied markers and printing.
6. Hand shadows, hands, seconds hand and centre pin.
7. Restrained crystal highlights.

Adjust this for the actual construction. Some guards must overlap part of a crown. The SPB317 needed its exposed crown drawn after the case: drawing the whole crown first left only a stub visible. A small dark seat gives the root depth without requiring a complex 3D treatment.

Orient the barrel and its grooves in the crown's own coordinate system. Confirm that it projects by a believable amount and is not clipped in outline, wrist or comparison views.

### 3. Bezel and dial proportions

Check the outer metal edge, insert width, dial opening and chapter-ring width separately. A slightly oversized dial can make the entire watch look wrong even when the case dimensions are correct.

Match the actual distribution of dots, ticks and numerals. Leave room around numbers where the reference does, but do not accidentally omit dots adjacent to the 12 o'clock pip. Distinguish markings on the bezel from those on the chapter ring.

Treat numeral height, width, weight, rotation and radial placement as separate variables. On the SPB317, reducing font size would also have narrowed the numerals; scaling the text's local vertical axis to 82% preserved their width while shortening them. Apply that scale about each numeral's centre and in its rotated local frame, so a number at 4 o'clock is shortened in the same way as one at 6 o'clock.

### 4. Markers, hands and text

These features carry much of the model's identity. Match:

- Marker length, width, metal frame and luminous inset, including the distinctive 12 o'clock marker.
- Hour/minute hand lengths, widths, tip shape, luminous sections and counterweights.
- Seconds-hand paddle, lume/red dot, shaft and tail.
- Date aperture shape, background, numeral proportions and position.
- Brand and lower-dial printing: size, weight, spacing and baseline position.

Use separate metal and lume paths rather than a single flat white shape. Keep shadows small enough that they do not look like additional outlines. The SPB317 hour hand has a short luminous section and a longer metal root; a uniformly luminous generic sword hand loses that distinction.

Compare hand widths independently of their lengths. A small width change can matter more than extra texture. Keep the shadow and luminous inset aligned when widening a hand.

Position branding relative to the dial furniture and hand pivot, not merely in the available empty space. The SPB317 logo was finally moved from `−0.42 × dialRadius` to `−0.36 × dialRadius`, about 0.9 mm lower. This is model-specific, not a new default for all watches.

Use text where its font rendering is adequate; verify fallbacks in the browser. A small clean vector wordmark can be appropriate when typeface differences are conspicuous. Do not invent unreadable microprinting to make a dial seem detailed. Dial text and logos remain illustrations, not automatically exact reproductions of brand artwork.

For the SPB317, Willard and SSC947 hour/minute hands, represent the half-brushed, half-polished finish with two solid metal tones meeting down the blade and counterweight centre. Keep lume inserts separate; avoid multi-stop metal gradients and decorative stripes on these hands.

### 5. Material finish and strap texture

Add finish after the shapes are convincing. Use narrow highlights for metal edges, restrained gradients for metal/lume, and subtle brushing. A broad, dark bevel made the earlier SPB317 case look padded.

Observe the actual strap. The SPB317 reference has textured side panels around a smooth centre, not waves across its entire width. Let panel boundaries follow the taper and leave the correct plain shoulder near the case. A light gradient can suggest the strap bending into the lugs.

Texture should support the material at normal size, not turn into visual noise at thumbnail size. Repeating SVG patterns are usually sufficient; do not trace every grain or copy photographic reflections literally.

### Metal finish

All bracelets share one set of metal finishes, so the catalogue reads as one style whatever each bracelet's construction. They live in `FINISH` and `FACES` in [`src/render/strap.ts`](../src/render/strap.ts), as shade amounts on the bracelet's metal colour:

| Finish | Use |
| --- | --- |
| `joint` | The shadow between links and rows, the same on every bracelet. |
| `edge` | Where a link turns away at its ends. |
| `shade`, `face`, `lit` | A satin link's shaded, plain and lit parts. |
| `hi`, `dip` | A polished link's highlight and the dark reflection across it. |

The link faces built from them are `satin`, `polished`, `flat` (the Rolex Oyster's flat links), `mirrorFlat` and `pill` (the Black Bay 58's centre rows, and the Tsuyosa's split centre links), `creased` (the Tsuyosa's outer links, with a faint crease in line with the centre's seam), and `slab` and `bevel` (the PRX's broad single-piece links and the polished bevel along each edge facing the case). A new bracelet chooses from these faces, or builds a new one from `FINISH`, instead of its own colours. Keep it at this level: a bracelet that looks photographic next to the others is too far, as the first Black Bay 58 bracelet was. To change the level for every bracelet at once, adjust `FINISH` and review every bracelet watch side by side, on the wrist and in a contact sheet.

### Case finish

Each case keeps its own construction, but two finishing details are shared, from [`src/render/cases.ts`](../src/render/cases.ts), so every case is lit the same way. The light comes from the upper left.

| Helper | Use |
| --- | --- |
| `bezelShadow(r)` | The bezel's soft shadow on the case, below and to the right of it. `r` is about 0.1 mm outside the bezel's edge. Every case with a separate raised bezel has one. The F-91W, the SRPB43's sloping bezel and the Khaki Field's stepped bezel don't, because they aren't separate from the case. |
| `lugTopLight(id, D, LL, strength?)` | Brushed lug tops lit from above, at the Black Bay 58's strength: light at each lug tip, turning to shade towards the case. A matte case takes a lower `strength`; the Khaki Field uses 0.5. |
| `flankBevel(id, flanks, metal, black?)` | A polished bevel down the outer flanks: a light crease, the polished band with its dark reflection, and a fine dark edge. `flanks` is a path of just the outer flanks, which each case module builds from its own silhouette (`spb253Case`, `spb519Case`). Draw it after the case's edge strokes. `black` keeps a coated case in its own dark tones, as on the SPB253 and SPB255. |

Draw both inside the case's clip path, after its fill and brushing; then the bezel goes on top. `lugTopLight` goes before the case's edge strokes and bevels, and `bezelShadow` goes last. A new case starts with both, and a test checks every bezel case has exactly one shadow. The Rolex, Speedmaster and Black Bay 58 draw their own lug tops with model-specific creases, at the same level.

A polished bevel down the case's outer flank is model-specific, because it follows each silhouette. Build it as the Black Bay 58, Speedmaster and Willard family (SPB151, SPB257, SPB317) do: stroke a path of just the outer flanks, clipped to the case, with a light crease, a polished gradient (bright with a dark reflection) and a fine dark edge. Keep it bright rather than broad and dark; a broad, dark bevel made the earlier SPB317 case look padded.

## Keep the implementation reusable

Continue using the app's SVG renderer as the source of truth. Direct SVG refinement worked well for the SPB317 because dimensions, layering and alternate straps remain connected to app data. Figma or Paper can help trace a difficult contour, but are optional. If used, bring back cleaned, dimensioned paths rather than an entire exported scene with redundant groups, transforms and definitions.

Put genuine model-specific geometry in a dedicated helper module. Use catalogue settings for existing options such as colours and date position. Introduce a schema option only when it describes a useful supported feature; update defaults, allowed values, picker labels and relevant samples together.

Currently, the SPB317 refinements are selected through `shape === 'willard-modern'`. That branch also contains Seiko-specific furniture and printing. Do not assign that shape to an unrelated watch simply to obtain its silhouette. If another model needs the case but different furniture, separate the case selection from the model-specific dial treatment first. Do not copy Seiko wording, date styling or hand shapes into other models as a quality shortcut.

Preserve configurable colours, alternate straps, outline rendering and dimension scaling. Use unique IDs derived from the renderer's per-watch prefix for every gradient, clip path and pattern. Multiple watches share one document; fixed IDs can make one watch borrow another's styling. Straps use their own `<prefix>_s` namespace so their ids can't collide with a model module's suffixes, and the renderer tests fail on any duplicate id. Escape catalogue/user text before inserting it into SVG, as the existing renderer does.

## SVG complexity and web use

Default to the existing SVG/TypeScript renderer for new catalogue watches. The [Figma/Paper workflow experiment](design-workflow-experiment.md) found extra conversion work and visible export regressions; design tools remain optional aids for specific paths or human review.

SVG can support this level of detail. The practical costs are markup size, element count, path complexity, painting work and how often the drawing is regenerated. Sharpness alone does not make a large drawing cheap. Assess it with multiple watches visible, not only as an isolated export.

Prefer these techniques:

- Repeating patterns for brushing and strap texture instead of hundreds of individual strokes.
- Compound paths for repeated details that share a finish, such as bezel facets or chapter ticks.
- A small set of gradients and clip paths per watch.
- Sensible coordinate precision; the SPB317's generated detail paths round to three decimals in millimetres.
- Simple paths and gradients before blur, turbulence or other expensive filters.

The SPB317 detail pass reduced a measured example from about 75 KB/702 elements to roughly 45 KB/250 elements while adding visible detail. Gzip reduced those examples to about 8.1 KB and 7.3 KB respectively. These are historical measurements, not a promise for every render option; DOM reduction and compressed transfer savings are different things.

The current SPB317 regression guard uses `strapLen: 12` and requires fewer than 320 SVG elements and fewer than 50,000 UTF-8 bytes. Use this as a starting budget for comparable watches, not an arbitrary limit for every complication. Measure before increasing complexity, simplify repetition first, and explain any necessary increase. Do not remove recognisable features solely to reach a smaller number.

For consistent measurements, render the same watch/options, reset render IDs if comparing snapshots, count actual SVG elements, and measure UTF-8 bytes. Avoid counting an HTML preview with an embedded reference photograph as the watch asset. The production watch illustration should contain vector geometry, not a hidden photo or raster texture.

## Review and completion

Use the catalogue watch directly for the reference comparison. The normal app can merge personal appearance overrides from browser storage; these may conceal a catalogue change. Do not clear the user's data to fix a review discrepancy. Use the gallery or a temporary review page that imports the catalogue entry and `watchSVG` directly.

Compare at three levels: an enlarged detail view, the normal comparison size, and a small thumbnail. Also inspect outline mode, a wrist view, different strap colours/types, and any other watches affected by shared renderer changes. Do not judge a subtle improvement exclusively at extreme zoom.

Before calling a model complete, verify:

- [ ] The silhouette, lug-to-lug and case width agree with the specifications and reference.
- [ ] Strap and lug opening widths agree; the strap enters the lugs without flares or accidental gaps.
- [ ] Lug tips and shoulder joins have the observed curvature, with no spikes or spline overshoot.
- [ ] Crown projection, guard overlap and recess look plausible.
- [ ] Bezel/dial proportions and numeral height/width match the reference.
- [ ] Markers, hands, date and logo positions preserve the model's distinctive appearance.
- [ ] Textures and highlights remain quiet at normal and thumbnail sizes.
- [ ] Alternate straps, outlines, wrist views and other affected models still work.
- [ ] SVG definitions are unique and bounds contain all visible geometry.
- [ ] Complexity has been measured when significant detail was added.
- [ ] `npm run build` passes after renderer changes. It runs type checking, tests and the production build; it does not replace visual inspection.
- [ ] A final comparison image and any exported SVG reflect the latest source, including last-minute adjustments.

Save a concise handoff stating the reference used, dimensional assumptions, changed features, validation results and any remaining approximations. Keep useful review outputs in a durable, clearly named location. Do not leave temporary HTML pages, absolute paths to someone's Downloads folder or large base64 reference images in the production source. If producing a self-contained preview, verify that it opens independently and that its content was not truncated during export.

The stopping point is a faithful, useful comparison drawing at the SPB317's quality level—not an exhaustive tracing of photographic noise. Small corrections to strap fit, hand width, numeral proportions and logo position are part of that standard.
