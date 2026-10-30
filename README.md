# Tokei Zukan

Explore a catalogue of watches: specs, to-scale illustrations, stacked outlines, and a top-down view on a configurable wrist. Live at **[www.tokeizukan.com](https://www.tokeizukan.com)**.

*Tokei zukan* (時計図鑑) is Japanese for "illustrated watch guide". The project was called Wrist Check while it was in private development, which is why the browser storage key is still `wristcheck.v2`.

## Run it

```bash
npm install
npm run dev
```

`npm run build` type-checks, runs the tests, and writes a static site to `dist/`, including a page and a preview image for every watch address so shared links show that watch ([link previews](docs/sharing.md)). Vercel deploys it; `vercel.json` serves those pages with clean addresses and sends every other path to `index.html`, so any address works when opened directly. Another static host needs the same: clean `.html` addresses, then a single-page-app fallback.

### Addresses

The address bar follows what's on screen, so any view can be shared or bookmarked:

| Address | Shows |
| --- | --- |
| `/watches/<id>` | A watch's details, e.g. `/watches/seiko-spb257` |
| `/watches/<id>/wrist` | That watch on the wrist |
| `/compare` | Compare, with the visitor's own selection |
| `/` | A catalogue watch picked at random, then its own address replaces `/` |

An address wins over the visitor's saved selection and holds nothing personal. Only catalogue watches have addresses. The Oris chronograph keeps its old stored id, `oris-01-733-7707`, but its address is `/watches/oris-01-771-7791`; the old form still works. Unknown addresses show "Watch not found". Routes live in `src/lib/route.ts`. In development, `/#gallery` still opens the drawing review sheet.

## How it's put together

| Where | What |
| --- | --- |
| `catalog/watches/<brand>/<ref>.json` | One file per watch model: specs and how to draw it. Shared by everyone. |
| `src/data/rates.json` | Exchange rates for converting prices, with their source and date. |
| `catalog/straps.json` | Colour presets offered in the strap picker (NATO, rubber, leather). |
| `src/catalog/schema.ts` | The schema every catalogue file must match. |
| `src/data/starter-list.json` | The shortlist a new visitor starts with. |
| `src/render/` | Pure functions that turn a watch into SVG, in millimetres. No DOM or React. |
| `src/store/` | The user's own data, merged with the catalogue for display. |
| `src/components/` | The React UI. |
| `public/` | Files served as they are. The tab icon follows the page theme: `favicon-light.svg` (the day dial) in light mode and `favicon.svg` (the dusk-lume dial) in dark, swapped by the theme script in `index.html` and `src/lib/theme.ts`. `favicon.svg` is also the default without JavaScript and the source of the other icons, which don't change with the theme; `favicon.ico` and `icon-192.png`/`icon-512.png` are exports of it. `apple-touch-icon.png` and `icon-maskable-512.png` put the same art on a square tile, the maskable one with the dial shrunk into the central safe zone, because iOS and Android round or crop icons themselves. `site.webmanifest` lists them. |

### Catalogue vs. user data

The catalogue holds facts about a model, including its verified retail prices. Everything personal stays in the browser:
- likes, ownership and the watch box, the reference watch, the price currency, light or dark mode, lighting, live time, strap choices and comparison settings. Liking, owning and comparing a watch are independent; a watch can be any combination.
- custom watches, notes, overrides and photos saved by earlier versions, kept so older lists load unchanged. Older front-runner and owned statuses become likes and ownership on load.

Everything is kept in localStorage, and a v1 list already there is migrated automatically. Browsers keep it per site address, so anything saved on the old `wrist-check-ten.vercel.app` address doesn't carry over to `www.tokeizukan.com`. Every catalogue watch is always listed: new ones are added on the next visit, and ones removed in older versions come back. Watches are added and changed in the catalogue JSON files, not in the app.

The starter list has no preselected ownership, favourites, reference watch or buying-advice notes. Empty note sections are hidden. Older saved lists have unchanged factory recommendations removed once, using per-watch text fingerprints in `src/data/legacy-starter-copy.json`. Edited lines and other personal data are preserved. Unverified starter prices are removed the same way, using `src/data/legacy-starter-prices.json`. Do not add contributor preferences or prices to the shared starter list.

### Adding a watch to the catalogue

Read the [watch illustration standard](docs/watch-illustration-standard.md) before creating or refining a drawing. The refined SPB317 sets the default quality level; the guide covers reference measurements, SVG construction, review and performance budgets.

Read the [pricing standard](docs/pricing-standard.md) before adding or changing prices. It covers which prices to record, acceptable sources, conversions and exchange rates.

Production visit counts use Cloudflare Web Analytics, which is off unless configured; see [analytics](docs/analytics.md). Nothing in `.env.example` is needed to build or run the app.

Read [lume and dark mode](docs/lume.md) before adding lume to a drawing. Each watch's `night` block records the colour its lume glows and which parts carry it, with the evidence in that file.

1. Create `catalog/watches/<brand>/<ref>.json`, with brand and ref in lowercase and spaces turned into hyphens.
2. Set `"id"` to `"<brand>-<ref>"`, for example `"seiko-spb257"` in `catalog/watches/seiko/spb257.json`.
3. Fill in the specs and a `look` block. Any `look` field you leave out uses the default from `src/catalog/defaults.ts`.
4. Set `strap` to what it's sold on, and `strapOptions` to any other straps or bracelets the maker offers. For example:
   - `{ "type": "bracelet", "style": "oyster", "centre": "polished" }`. Styles are oyster, jubilee, beads, president and mesh.
   - `{ "type": "rubber", "style": "tropic", "color": "#1A1B1D" }`
5. Tag the lume in its drawing and add `night`, following [lume and dark mode](docs/lume.md). Tag its hands and set `beats` so live time can move them (see [Hands and live time](docs/watch-illustration-standard.md#hands-and-live-time)).
6. Add `prices`, following the [pricing standard](docs/pricing-standard.md): the maker's RRP for that reference and strap in each market you can verify, each with its source. Never estimates or dealer prices.
7. Run `npm test`. It checks every file against the schema and the id rule.
8. With `npm run dev` running, open `/#gallery` to see every watch, on the wrist and on every kind of strap.
9. Run `npm run build` and look at the watch's link preview in `dist/share/<slug>.jpg` (see [link previews](docs/sharing.md)).

## Contributing

Watch requests, bug reports and pull requests are welcome; you don't need to code to request a watch. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add or improve a watch, the evidence each one needs, and how pull requests are reviewed. Everything runs from a clean checkout with `npm ci` and `npm run build`; no accounts or credentials are needed.

## Licence

[MIT](LICENSE) © 2026 Mateusz Michalik. The licence covers the code, illustrations, catalogue data and documentation created for this project. Watch brands, names and logos belong to their owners and aren't covered; see [NOTICE.md](NOTICE.md).
