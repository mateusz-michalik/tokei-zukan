# Seiko SRPK01 "PADI Great Blue King Turtle" — illustration notes

Refined to the [watch illustration standard](../watch-illustration-standard.md), 25 October 2026.

## Reference and dimensions

- **Photo:** the supplied front-on Seiko SRPK01K1 product photo (1102 px square, transparent background). It is not stored in the production source.
- **Specs:** [SRPK01](https://www.seikowatches.com/au-en/products/prospex/srpk01). The manufacturer's 45.0 mm diameter, 47.7 mm lug-to-lug, 13.2 mm thickness, 22 mm lug spacing, 4R36, 41-hour reserve and 200 m rating agree with the catalogue. The page specifies a sapphire crystal with magnifier, ceramic bezel display, day/date and a PADI Special Edition.
- **Unit:** k, the outer radius of the ceramic bezel insert. The insert is approximately 313 px in the photo, centred near (535.5, 511).
- **Scale:** the case at 9 o'clock is about 1.137 k. Taking that crest as the published 45 mm diameter gives k = R / 1.137 ≈ 19.79 mm. The case outline uses the published 47.7 mm lug-to-lug rather than stretching the drawing to the photograph.
- **Edition colours:** navy ceramic with cyan through 20 minutes, a blue wave dial, pale green-white lume and a cyan minute hand. The supplied bracelet has a broad brushed centre row.

## Where it lives

- **Selection:** `shape: "srpk01"` sends the drawing to `srpk01SVG()` in [srpk01.ts](../../src/render/srpk01.ts).
- **Scope:** everything above the strap: cushion case and crown, machined bezel, chapter printing, wave dial, applied plots, day/date and cyclops, printing and hands.
- **Bracelet:** shared oyster renderer with a 50% brushed centre row and the exact 22 mm attachment. Other strap choices continue through the same renderer.

## Measurements used

| Feature | Value (k unless stated) |
|---|---|
| Case | Broad rounded shoulders reaching the specified 45 mm crest at 3 and 9. Continuous rounded shoulders end at the inner lug tips, retaining the 47.7 mm catalogue span and exact 22 mm openings. Avoid a flat projecting lip or a change of direction at the tip. Seats near ±0.982 tuck the end link under the bezel. |
| Crown | At 4 o'clock, 6.5 mm across and approximately 3.9 mm proud, with a dark root, fine grooves and a rounded end. Its axis is drawn at 24° from horizontal, seated at R − 1 mm, and layered above the brushed case flank so the exposed barrel is visible. A small dark root defines the seating. A clipped polished chamfer slopes from the top surface towards the crown, with restrained edge shading. |
| Bezel | 48 broad block-shaped teeth with curved outer plateaus near 1.043, matching the visible coarse pitch approximately. Ceramic insert to 1.0. Numerals centred near 0.906; dots near 0.868; five-minute bars 0.835–0.975. Cyan triangle, pip surround, dots, bars and numerals through 20; remaining marks use a muted silver tone distinct from the white dial printing. |
| Chapter | Narrow reflective crystal seat around 0.786. Fine minute ticks 0.697–0.756 and heavier five-minute ticks 0.685–0.758 on the blue dial. |
| Markers | Circular plots centred at 0.58, radius 0.067, with separate steel rims and lume. Tapered 6 and 9 markers span 0.47–0.655, with slender stems towards 0.35. The wider divided 12 shield spans 0.425–0.65 with a short tip to 0.36. The 9 marker is explicitly at 270°, not hidden under the date at 3. |
| Day/date | White MON/6 aperture at 3, centred at (0.425, 0.01), approximately 0.43 × 0.132, with a steel rim. This is the apparent enlarged aperture through the magnifier. A curved-sided cyclops about 0.51 × 0.245 sits over it, with enlarged MON/6 text and restrained edge highlights. |
| Printing | SEIKO baseline near −0.252, 0.35 wide. Prospex X near −0.182. PADI baseline near 0.18, AUTOMATIC near 0.278 and DIVER’S 200m near 0.348. |
| Hands | Hour at 304.2°, length 0.445, broad arrow and separate lume. Cyan minute at 53.5°, length 0.64, with a broader shaft and triangular barbs around its separate lume. Silver seconds at 252.4°, needle to 0.638, tail to 0.43 and a circular lume counterweight centred at +0.35, opposite the long needle. There is no lume capsule on the long needle in this reference. |

## Validation

- **Before image:** saved in ignored `review-artifacts/` before editing. The previous generic cushion had solid lug ends, a generic bezel and baton hands, no wave pattern and no day/date magnifier.
- **Visual comparison:** rendered the catalogue entry directly and compared the enlarged drawing with the supplied photograph. Reviewed the case and bracelet attachment, two-tone bezel, dial furniture, cyan minute arrow, day/date lens and lower printing.
- **Other views:** visually checked rubber and NATO attachments, outline mode, a thumbnail and a 17 cm wrist view. The renderer suite also exercises every catalogue watch on every sample strap and checks unique SVG ids. The gallery remains available at `/#gallery` for ongoing comparisons.
- **Budget:** at `strapLen: 12`, the refined SRPK01 is 240 elements and approximately 33.4 KB (7.83 KB gzipped), below the existing 320-element / 50 KB limits. The previous generic drawing was 381 elements and approximately 47.4 KB.
- **Checks:** `npm run build` passes type checking, all 27 tests and the production build.

## Remaining approximations

- **Case:** the outline is a sparse symmetric interpretation of the photographed cushion and lugs. Small contour and reflection differences are intentionally simplified; the crown projection remains within the renderer's comparison bounds.
- **Wave dial:** fine irregular ripple shapes combined into two paths and a deeper vertical blue gradient stand in for the photographed water texture. No raster image or turbulence filter is used, and the pattern becomes quieter towards the dark lower dial.
- **Typography and logos:** Arial and Georgia stand in for the bezel numerals and SEIKO wordmark. The Prospex X is simplified; PADI is text rather than exact logo artwork. Tiny movement/Japan printing is omitted.
- **Cyclops and crystal:** the magnifier uses a translucent rounded lens and edge highlight. It does not optically warp the underlying day/date text.
- **Bracelet:** the shared oyster renderer supplies the three-piece end link and broad brushed centre. Individual link curvature and photographic reflections remain illustrative.

### Hand finish

The steel hour hand uses two solid metal tones split down the blade and counterweight, with a separate lume insert. The cyan minute hand has its own model-specific outline and lume; it does not borrow a generic sword or baton. The seconds hand is silver with an uncoloured circular lume counterweight on the opposite side of the pivot from the long needle.

### Refinement notes

The second pass corrected the flared lug ends, crown occlusion, missing 9 o'clock baton, undersized day/date magnifier and seconds-hand counterweight placement. The hour blade, cyan minute arrow, broad bezel teeth and lower printing were also adjusted against the supplied photo. Keep these details model-specific: the SRPK01 is not a Willard with a different dial colour.
