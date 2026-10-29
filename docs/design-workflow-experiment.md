# Watch illustration workflow experiment

24 October 2026. Reference: the supplied detailed SPB317J photograph.

## Decision

Keep production illustrations in the existing SVG/TypeScript renderer. Follow the [watch illustration standard](watch-illustration-standard.md), refining geometry against photographs and physical specifications, then reviewing in the app.

Figma remains an optional aid when a human wants to edit a difficult silhouette interactively: bring back the specific path and integrate it into the renderer. Paper can support comparison boards and HTML/CSS interface work. Neither should be a mandatory intermediate step for catalogue illustrations based on this test.

## Scope and limitations

Built simplified watch studies in Paper (HTML/CSS plus SVG groups) and Figma (native rectangles, ellipses, vectors and text). These included straps, cases, crowns, dials, markers, bezel numerals, logos and hands. Tested targeted logo/numeral edits in Paper. Also imported the finished production SVG into both tools, inspected their canvases and exported SVG for structural comparison.

The native studies are unfinished workflow probes, not approved alternative illustrations. Both reused knowledge of the watch from earlier code work. This was not a blind, equal-quality, from-scratch timing benchmark. Further polishing stopped when the user reported rapid usage consumption and the practical tradeoffs were clear.

## Observations

| Route | Observed result |
|---|---|
| Direct code | Existing approved result; physical dimensions, configurable straps/colours and repeated detail remain expressed in the renderer. |
| Paper mixed HTML/SVG study | Canvas editing and JSX export worked. Whole-study SVG export was rejected as unsupported for that node. Its individual SVG case layer exported successfully. |
| Paper production SVG import/export | Preserved both vector patterns and the millimetre viewBox. Removed all six `dominant-baseline` attributes, visibly displacing bezel numerals and the date. |
| Figma production SVG import/export | Produced editable vector/group/text nodes, but substituted Inter for the supplied fonts. Strap and brushed-case patterns disappeared. Export changed the viewBox to pixel coordinates and outlined text. Integration would require restoring the physical scale. |

These describe the connected tools and this asset on the test date. Other versions or import methods may behave differently. Repairs may be possible; their full cost was not measured. Neither export was adopted into production.

## Measured output

Same production source, 10 pixels/mm, `strapLen: 10`. UTF-8 bytes, actual XML elements and local gzip measurements. Native sketches are excluded because their quality is not equivalent.

| Asset | Raw bytes | Gzip bytes | SVG elements | Vector patterns |
|---|---:|---:|---:|---:|
| Production baseline | 44,812 | 7,294 | 250 | 2 |
| Paper re-export | 39,534 | 6,798 | 250 | 2 |
| Figma re-export | 91,347 | 27,540 | 429 | 0 |

Smaller does not necessarily mean better: Paper's reduction accompanied a lost text attribute. Figma's larger output also lost visible detail.

## Usage and time

The user observed faster usage consumption with the design integrations. Exact per-route tokens, billing and comparable completion times were unavailable. Installation, connection troubleshooting, the user pause, tool discovery and export retrieval complicate wall-clock comparisons. No percentage saving or universal cost multiplier is justified.

Extra work included API-specific node construction, font discovery/loading, canvas inspection and export validation. Through MCP, both workflows still required the agent to calculate curves, positions and proportions in code. No automatic photo-to-faithful-vector advantage was demonstrated. Reusing the renderer avoids an additional conversion and review cycle, making it the best-supported default for this project.

## Guidance for future agents

Start in code unless the user requests another workflow or a specific shape benefits from human path editing. Reuse shared primitives, isolate model-specific geometry, keep dimensions in millimetres and compare at normal display size. If importing paths, check fonts, text baselines, clipping, patterns, IDs, scale and configurable behaviour before adoption.

Experiment canvases: [Paper](https://app.paper.design/file/01M5NZ7B69RW7T4AGD0RYJQC2K/p-1-0), [Figma](https://www.figma.com/design/9WrFZKguR0qCoIPmv9cK4E/Untitled). Both contain simplified studies and uncorrected production imports. They are not the production source of truth.
