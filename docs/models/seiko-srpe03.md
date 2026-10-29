# Seiko SRPE03 King Turtle — illustration notes

Refined against the supplied SRPE03K1 photograph on 25 October 2026. Follow the [illustration standard](../watch-illustration-standard.md) and the shared [SRPK01 geometry notes](seiko-srpk01.md).

## Reference and dimensions

The user supplied `SRPE03K1.png`, a 1102 × 1102 product photograph. Approximate bezel centre: (532, 511); insert radius: 313 px. These measurements guide proportions, not physical specifications. Catalogue dimensions are retained: 45 mm diameter, 47.7 mm lug-to-lug and 22 mm lug opening. The reference is kept outside production assets.

`shape: "srpe03"` selects the SRPE03 variant of `srpk01SVG()` in [srpk01.ts](../../src/render/srpk01.ts). Sharing this reference-named module is deliberate: both editions use the same rounded cushion case, flush attachment, crown chamfer, bezel teeth and dial furniture. Keep edition-specific changes behind the variant selection.

## Edition details

- **Black ceramic bezel:** pale markings throughout, without the PADI cyan sector.
- **Waffle dial:** square pitch 0.09 k, about 28 px in the source photograph, where k is the ceramic insert radius. Raised tiles have a restrained neutral gradient, a fine lit upper/left edge and recessed dark joints. One repeating SVG pattern supplies the entire texture. It ends at radius 0.686 k, inside the smooth minute chapter.
- **Lume:** warm ivory `#F0EFE3`, distinct from the green-white PADI edition.
- **Hands:** the hour and steel minute arrows use two flat metal tones for brushed and polished halves, plus separate lume inserts. Gold seconds needle and a circular ivory counterweight on the opposite side of the pivot. The pivot is black with a small gold centre.
- **Day/date:** enlarged MON/6 remains under a curved-sided magnifier. Lens and crystal-seat reflections are neutral silver rather than blue.
- **Printing:** SEIKO above the pivot; Prospex below it; white AUTOMATIC and gold DIVER’S 200m. No PADI wordmark.

## Validation

Compared the enlarged SVG with the photograph using uniform scaling and aligned bezel centres, then reviewed rubber, NATO, outline and wrist views. At `strapLen: 12`, the SVG contains 245 elements, 30,852 bytes of markup and approximately 6.45 KB gzipped, within the 320-element / 50 KB budget.

`npm run build` passes type checking, all 29 tests and production bundling. Rendering fingerprints confirm all 13 other catalogue models are unchanged across normal, outline, sample-strap and wrist views, including SRPK01.

## Remaining approximations

The case and bracelet remain a dimensionally consistent illustration rather than a trace of the photograph's perspective. The shared bracelet simplifies individual link reflections. Waffle texture uses a compact repeating pattern; it omits photographic grain. The cyclops suggests magnification with enlarged text and highlights rather than optical distortion. Typography and the Prospex symbol are approximations, and tiny movement printing is omitted.
