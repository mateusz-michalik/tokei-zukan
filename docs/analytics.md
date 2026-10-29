# Analytics

Tokei Zukan counts visits with [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/about/): aggregate page views, referrers, countries, browsers and page-load performance, enough to tell whether the site is useful. Nothing else is measured: no Google Analytics, no product events, no session replay, no visitor profiles.

## Current setup

Production runs at `www.tokeizukan.com`, which is the hostname registered in Cloudflare and set as `VITE_ANALYTICS_HOST` (since 2026-10-29). The apex `tokeizukan.com` and the old `wrist-check-ten.vercel.app` address redirect to it, so it's the only host that serves pages. Moving to another domain later: redirect the current one to it in Vercel, edit the hostname under Cloudflare's **Manage site** (the token stays the same), update `VITE_ANALYTICS_HOST`, and redeploy, all at once, since only one hostname is counted.

## How it's set up

| Piece | Where |
| --- | --- |
| Loader | [`src/lib/analytics.ts`](../src/lib/analytics.ts), called once from [`src/main.tsx`](../src/main.tsx). It adds the same script as Cloudflare's snippet, a module script with the token in `data-cf-beacon`. |
| Configuration | `VITE_CF_ANALYTICS_TOKEN` and `VITE_ANALYTICS_HOST`, build-time environment variables; see [`.env.example`](../.env.example). |
| Disclosure | The footer's Privacy link ([`src/components/Privacy.tsx`](../src/components/Privacy.tsx)). It describes analytics only when it's actually on. |

The beacon loads only when **both** variables are set **and** the page's hostname is exactly `VITE_ANALYTICS_HOST`. That keeps localhost, Vercel preview deployments, contributors' builds and the dev drawing gallery out of the reports, even if a token leaks into a preview build. Without the variables, the app works exactly the same and loads nothing.

Cloudflare's single-page-app support is on by default: the beacon follows the app's address changes (the History API and Back/Forward) itself, so there is no page-view code of our own and no risk of double counting. The app's addresses contain nothing personal: `/watches/<id>`, `/watches/<id>/wrist`, `/compare` and `/owned`, with no query strings. Saved watches, boxes and settings live in local storage and are never sent.

## Turning it on

1. In the Cloudflare dashboard, go to **Web Analytics**, add a site with the production hostname, and copy the token from the snippet under **Manage site**. Don't add the snippet to `index.html` as well; the loader injects the same script.
2. In Vercel, open the project's **Settings → Environment Variables** and add `VITE_CF_ANALYTICS_TOKEN` (the token) and `VITE_ANALYTICS_HOST` (the hostname, e.g. `wristcheck.example`, without `https://` or `www.` unless that's the real host), for the **Production** environment only. Vercel flags the token because of its name and the public `VITE_` prefix; choose the public **config** type (`vercel env add VITE_CF_ANALYTICS_TOKEN --environment production --type config --value <token>`). It's meant to be public: it's in the snippet Cloudflare gives you.
3. Redeploy production. The token is the public site token that ends up in every visitor's browser, not an account or API secret; never put Cloudflare account credentials anywhere in this project.

## Checking it

- On the production site, open the browser's developer tools. The Network tab should show `beacon.min.js` loading once and a request to `cloudflareinsights.com` on the first page view and on each change of address, including Back/Forward, with no repeats. The Application tab should show no new cookies and no local storage keys except Tokei Zukan's own `wristcheck.v2`.
- On a preview deployment and on `localhost`, neither request appears.
- Reports appear in the Cloudflare dashboard after a short processing delay. Visitor numbers are estimates, not counts of unique people.
- With a content blocker on, the beacon is blocked and the site works normally. Don't add workarounds for blockers.

## Turning it off

Remove either variable from Vercel's Production environment and redeploy. The Privacy note then says the site doesn't measure visits.

If you ever add cookies, persistent identifiers, personalised analytics or another analytics service, reassess whether visitors must be asked first, and update the Privacy note.
