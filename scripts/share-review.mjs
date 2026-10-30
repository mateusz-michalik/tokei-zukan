// `npm run share:review`: builds the site, then opens a local page showing what link previews will look like.
// It reads the share tags from the pages the build wrote (as a crawler would, without running the app) and draws
// approximate WhatsApp, X and Slack/iMessage cards for them, with the raw tags underneath. The images load from the
// local build; the tags themselves point at www.tokeizukan.com. Writes dist/share-review.html, which `npm run build`
// never produces, so it isn't deployed.
import { readFile, writeFile } from 'node:fs/promises';

const pages = [
  ['Home', 'index.html'],
  ['Watch', 'watches/seiko-srpb43.html'],
  ['Watch (long name)', 'watches/oris-01-771-7791.html'],
  ['On the wrist', 'watches/seiko-spb507/wrist.html'],
  ['Unknown watch', 'watch-not-found.html'],
];

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const unesc = s => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function tags(html) {
  const head = html.slice(html.indexOf('<!-- share:start -->'), html.indexOf('<!-- share:end -->'));
  const meta = {};
  for (const [, k, v] of head.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)) meta[k] = unesc(v);
  meta.title = unesc(head.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  meta.canonical = head.match(/rel="canonical" href="([^"]+)"/)?.[1];
  return { meta, head: head.replace('<!-- share:start -->', '').trim() };
}

let body = '';
for (const [label, file] of pages) {
  const { meta, head } = tags(await readFile(`dist/${file}`, 'utf8'));
  const img = (meta['og:image'] ?? '').replace('https://www.tokeizukan.com', '');
  const host = 'tokeizukan.com';
  body += `<section><h2>${esc(label)} <code>${esc(file)}</code></h2><div class="cards">
<figure><figcaption>WhatsApp</figcaption><div class="wa"><img src="${img}" alt=""><div class="t">${esc(meta['og:title'] ?? '')}</div><div class="d">${esc(meta['og:description'] ?? '')}</div><div class="h">${host}</div></div></figure>
<figure><figcaption>X</figcaption><div class="x"><div class="xi"><img src="${img}" alt=""><span>${esc(meta['twitter:title'] ?? '')}</span></div><div class="h">From ${host}</div></div></figure>
<figure><figcaption>Slack / iMessage</figcaption><div class="sl"><div class="h">Tokei Zukan</div><div class="t">${esc(meta['og:title'] ?? '')}</div><div class="d">${esc(meta['og:description'] ?? '')}</div><img src="${img}" alt=""></div></figure>
</div><details><summary>Tags</summary><pre>${esc(head)}</pre></details></section>`;
}

await writeFile('dist/share-review.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Link preview review</title>
<style>
body{font:14px/1.4 system-ui,sans-serif;background:#ECEBE6;color:#151515;margin:24px}
h1{margin:0 0 4px}p{margin:0 0 24px;color:#5E5C57}h2{font-size:16px;margin:32px 0 10px}code{font-size:12px;color:#5E5C57;font-weight:400}
.cards{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}figure{margin:0}figcaption{font-size:12px;color:#5E5C57;margin-bottom:6px}
img{display:block;width:100%}
.wa{width:330px;background:#d9fdd3;border-radius:8px;padding:4px;box-shadow:0 1px 1px #0002}.wa img{border-radius:6px 6px 0 0}
.wa .t,.wa .d,.wa .h{background:#c7ebc1;padding:2px 8px}.wa .t{font-weight:600;padding-top:6px}.wa .d{color:#333;font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.wa .h{color:#667;font-size:12px;padding-bottom:6px;border-radius:0 0 6px 6px}
.x{width:400px}.xi{position:relative;border:1px solid #cfd9de;border-radius:16px;overflow:hidden}.xi span{position:absolute;left:12px;bottom:12px;background:#0009;color:#fff;border-radius:4px;padding:1px 6px;font-size:13px;max-width:85%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.x .h{color:#536471;font-size:13px;margin-top:4px}
.sl{width:360px;border-left:4px solid #ddd;padding-left:10px}.sl .h{font-weight:700;font-size:13px}.sl .t{color:#1264a3;font-weight:700}.sl .d{margin-bottom:6px}.sl img{border-radius:6px;width:300px}
pre{white-space:pre-wrap;font-size:12px;background:#F3F2EE;padding:12px;border:1px solid #CFCDC6}
</style></head><body><h1>Link preview review</h1><p>Approximations of how apps lay out these tags; each app crops and truncates differently. Images are from the local build.</p>${body}</body></html>`);
console.log('wrote dist/share-review.html');
