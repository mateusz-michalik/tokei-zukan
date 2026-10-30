# Link previews

When someone shares a Tokei Zukan address in WhatsApp, Messages, Slack, X or similar, the app fetching it shows a preview card. A watch's address shows that watch: its name, size and drawing. Every other address shows the site's own card.

## How it works

Preview crawlers read the HTML a server sends and don't run JavaScript, so the tags have to be in the file itself. The app is a single page, so `npm run build` writes a copy of `index.html` for every watch address, with that watch's tags in its head:

| File in `dist/` | Served for | Preview |
| --- | --- | --- |
| `index.html` | `/`, `/compare`, `/owned` and anything else outside `/watches/` | The site's card: `share/tokei-zukan.jpg` |
| `watches/<slug>.html` | `/watches/<slug>` | The watch: title, size, `share/<slug>.jpg` |
| `watches/<slug>/index.html` | `/watches/<slug>/` | The same |
| `watches/<slug>/wrist.html` | `/watches/<slug>/wrist` | The watch "on the wrist" |
| `watch-not-found.html` | any other `/watches/…` address | "Watch not found", no canonical address, `noindex` |

`vercel.json` turns on `cleanUrls`, so `/watches/<slug>` serves `watches/<slug>.html`; with it on, rewrite destinations are written without `.html` (`/watch-not-found`, `/`). Vercel serves a file that exists before applying rewrites, so the rewrites only catch addresses with no file: unknown watch addresses get the not-found page and everything else gets `index.html`. Every copy loads the same app, which then shows the page as before.

- **Tags:** [`src/lib/share.ts`](../src/lib/share.ts) decides them: `<title>`, description, canonical address, Open Graph (`og:title`, `og:description`, `og:url`, `og:image` with its type, size and alt text, `og:site_name`, `og:type`) and the X large-image card. Addresses are absolute, on `https://www.tokeizukan.com` (the bare domain redirects there). The root page's tags are written into [`index.html`](../index.html) between the `share:start` and `share:end` markers; a test checks they match the code.
- **Images:** [`scripts/share-previews.mjs`](../scripts/share-previews.mjs) runs after `vite build`. It draws each watch with the app's own renderer into a 1200 × 630 card (`previewSVG()` in `share.ts`), rasterises it with resvg and saves it as JPEG, about 80–130 KB each. Text keeps 60 px clear of every edge.
- **Fonts:** a build server has none of the fonts the drawings ask for. The script bundles Arimo and Tinos (metric-compatible with Arial and Times New Roman), Archivo, EB Garamond, IBM Plex Mono and Dancing Script for script lettering, from the `@expo-google-fonts` packages, and swaps each `font-family` in the drawing for the matching one. These are used only to make the images; the site still loads its fonts from Google Fonts.
- **Root entry:** visiting `/` opens a random watch in the browser, but the HTML for `/` is always the site's card, so a shared root link never previews some other watch.

## New watches

Nothing extra to do. A catalogue file is picked up by the build like the rest of the app: `npm run build` prints how many pages and images it wrote, and the tests check every catalogue watch has its three pages and a well-formed image.

To look at a new watch's card, run `npm run build` and open `dist/share/<slug>.jpg`. To check its tags, open `dist/watches/<slug>.html` and look between the share markers.

## Checking a deployment

Fetch the address without JavaScript and check the tags and the image:

```bash
curl -s https://www.tokeizukan.com/watches/seiko-srpb43 | grep -E 'og:|twitter:|canonical|<title>'
curl -sI https://www.tokeizukan.com/share/seiko-srpb43.jpg
```

Apps cache previews, often for days, keyed on the exact address. After changing a card, test with an address that hasn't been shared yet (adding `?v=2` works) or use a platform's own debugger, such as Facebook's Sharing Debugger, which also refreshes its cache. How a card looks varies by app: WhatsApp shows a large image for some links and a small square thumbnail for others, cropped from the centre.
