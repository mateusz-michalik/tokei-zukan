# Contributing to Tokei Zukan

Thanks for helping. You don't need to write code to contribute: requesting a watch or reporting something that looks wrong is just as useful.

## Request a watch

[Open a watch request](https://github.com/mateusz-michalik/tokei-zukan/issues/new?template=watch-request.yml). Tell us the brand and model, and link the maker's page if you can. You don't need to draw anything or know the specs.

## Report a problem

[Open a bug report](https://github.com/mateusz-michalik/tokei-zukan/issues/new?template=bug-report.yml) for anything broken, a wrong spec or price, or a drawing that doesn't match the real watch. A link to where you saw the right information helps a lot.

## Add or improve a watch

Each watch is a JSON file in `catalog/watches/<brand>/<ref>.json`, plus, for detailed drawings, a renderer in `src/render/`. Before starting, read:

- the README's [Adding a watch to the catalogue](README.md#adding-a-watch-to-the-catalogue) steps;
- the [watch illustration standard](docs/watch-illustration-standard.md), including [Hands and live time](docs/watch-illustration-standard.md#hands-and-live-time);
- the [pricing standard](docs/pricing-standard.md);
- [lume and dark mode](docs/lume.md).

Every addition needs evidence:

- **Specs:** link the maker's specification page, or the best source you have, in the model notes (`docs/models/<id>.md`).
- **Prices:** each price records its source, as the pricing standard describes. Never estimates, dealer, sale or used prices.
- **Lume:** the lumed parts and glow colour, with sources and an honest certainty, added to `docs/lume.md`.
- **Reference photos:** link to them; don't add them to the repository. Product photos belong to their makers and photographers. Screenshots of your own drawing are fine in a pull request.

Check your work:

1. `npm ci`, then `npm run dev` and look at the watch in Details, Compare (side by side and outlines), On the wrist, every strap type, dark mode with Day/Dusk/Night lighting, and with live time on.
2. Run `npm run build`. It type-checks, runs the tests (including schema, drawing-budget and hand-tag checks) and builds the site, including the watch's link-preview image in `dist/share/<slug>.jpg`: give it a look. It must pass; CI runs the same command on every pull request.
3. In the pull request, add before and after screenshots of the drawing and fill in the checklist.

Nothing here needs an account, a database or credentials: browsing, drawing and the tests all run from a clean checkout. Leave the optional analytics settings in `.env.example` unset; they're for the production site only.

## Code changes

Keep changes focused, match the surrounding code's style and comment density, and add tests for logic you change. User-facing text uses plain, concise British English.

## Licence and review

Tokei Zukan is licensed under the [MIT licence](LICENSE). By submitting a contribution, you agree that it's licensed under the same terms and that you have the right to contribute it. Watch brands and logos remain their owners' trademarks; see [NOTICE.md](NOTICE.md).

The maintainer reviews pull requests and decides what's merged and when it's released. Issues are the public place for requests and discussion.
