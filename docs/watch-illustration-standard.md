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
- Give the catalogue entry `beats`, the seconds hand's steps per second: 1 for quartz, 6 for 21,600 vph, 8 for 28,800 vph.

`npm test` checks every watch: hour, minute and a seconds hand tagged, each transform ending in a rotate, and seconds hands carrying the watch's beats.

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
| [Case helpers](../src/render/cases.ts) | Shared bezel proportions. Model-specific case outlines live in their model modules. |
| [Strap renderer](../src/render/strap.ts) | Attachment width, taper, materials and repeating textures. |
| [Geometry helpers](../src/render/geom.ts) | Polar coordinates, arcs and ring segments. |
| [Schema](../src/catalog/schema.ts), [constants](../src/catalog/constants.ts), [strap names](../src/catalog/straps.ts) | Allowed appearance options and their UI names. |
| [Drawing gallery](../src/components/Gallery.tsx) | Catalogue, thumbnail, wrist and alternate-strap review at `/#gallery`. |
| [Renderer tests](../src/render/render.test.ts) | Catalogue/strap rendering checks, unique ids, complexity budgets for the detailed models, and model-specific outline checks. |
| [Model notes](models/) | Per-model reference, measurements, validation and remaining approximations. |

Trace the active code path before editing. For example, `willard-modern` dispatches to `slimCase()` in `spb317.ts`, `willard` to `spb151SVG()` in `spb151.ts`, `speedtimer` to `ssc947SVG()` in `ssc947.ts`, `heritage` to `spb451SVG()` in `spb451.ts`, `heritage-gmt` to `spb519SVG()` in `spb519.ts`, both `srpk01` and `srpe03` to `srpk01SVG()` in `srpk01.ts`, `spb253` to `spb253SVG()` in `spb253.ts`, `spb255` to `spb255SVG()` in `spb255.ts`, `mk2-39-5` to `mk2395SVG()` in `mk2395.ts`, `c60-pro-300` to `c60300SVG()` in `c60300.ts`, `oris-771` to `oris771SVG()` in `oris771.ts`, `serica-5303` to `serica5303SVG()` in `serica5303.ts`, `ssk003` to `ssk003SVG()` in `ssk003.ts`, and `spb507` to `spb507SVG()` in `spb507.ts`.

### File naming and temporary reviews

Name a model-specific renderer after its catalogue reference in lowercase: `spb151.ts`, `spb317.ts`, `ssc947.ts`, `spb451.ts`, `spb519.ts`, `spb253.ts`, `spb255.ts`, `mk2395.ts`, `c60300.ts`, `oris771.ts`, `ssk003.ts`, `spb507.ts`. Prefix a purely numeric reference with its brand, as in `serica5303.ts`, so the module and its exports have valid names. Use corresponding reference-based exports such as `spb451SVG()` and `spb451Case()`. Avoid family or marketing names such as Willard, Speedtimer or Heritage as module names: those names can cover multiple different watches.

An intentionally shared drawing stays in the reference module used as its baseline, with every supported reference documented. For example, `spb151.ts` also supplies the SPB257 colour variant. Generic geometry and strap helpers keep descriptive names. If another brand introduces a conflicting reference, group its modules in a brand subdirectory.

The existing `look.shape` values (`willard`, `willard-modern`, `speedtimer`, `heritage`, `heritage-gmt`, `srpk01`, `srpe03`, `spb253`, `spb255`, `mk2-39-5`, `c60-pro-300`, `oris-771`, `serica-5303`, `ssk003`, `spb507`) remain compatibility keys for catalogue and saved/imported watches. Renaming files or functions does not rename those stored values. Any future replacement of these keys requires a data migration.

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
