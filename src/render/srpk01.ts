import type { FullLook } from '../catalog/schema';
import { esc, shade } from '../lib/util';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

// Seiko King Turtle pair: SRPK01 PADI and the black-grid SRPE03, measured from product photos.
// They share case, bezel and furniture geometry; the variant selects edition-specific colour and printing.
// Furniture uses k, the ceramic insert radius; the case and attachment remain in millimetres.
// See docs/models/seiko-srpk01.md and docs/models/seiko-srpe03.md.

const f = (n: number) => +n.toFixed(3);
const pt = (r: number, a: number) => P(r, a).map(f).join(',');

/** Continuous cushion shoulders; the lug tips end at the inner slot rather than flaring outward. */
export function srpk01Case(D: number, LL: number, lw: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, k = R / 1.137, u = D / 45;
  const seat = k * .982;
  const p = (x: number, y: number) => `${f(x)},${f(y)}`;
  const d = `M${p(slot, -seat)}V${f(-H + .25 * u)}Q${p(slot, -H)} ${p(slot + .25 * u, -H + .08 * u)}`
    + `C${p(slot + 3 * u, -H + .6 * u)} ${p(slot + 4.6 * u, -H + 2.6 * u)} ${p(slot + 6.1 * u, -H + 4.8 * u)}`
    + `C${p(R * .96, -k * .63)} ${p(R, -k * .34)} ${p(R, 0)}`
    + `C${p(R, k * .34)} ${p(R * .96, k * .63)} ${p(slot + 6.1 * u, H - 4.8 * u)}`
    + `C${p(slot + 4.6 * u, H - 2.6 * u)} ${p(slot + 3 * u, H - .6 * u)} ${p(slot + .25 * u, H - .08 * u)}`
    + `Q${p(slot, H)} ${p(slot, H - .25 * u)}V${f(seat)}Q0,${f(seat - .35)} ${p(-slot, seat)}V${f(H - .25 * u)}`
    + `Q${p(-slot, H)} ${p(-slot - .25 * u, H - .08 * u)}C${p(-slot - 3 * u, H - .6 * u)} ${p(-slot - 4.6 * u, H - 2.6 * u)} ${p(-slot - 6.1 * u, H - 4.8 * u)}`
    + `C${p(-R * .96, k * .63)} ${p(-R, k * .34)} ${p(-R, 0)}`
    + `C${p(-R, -k * .34)} ${p(-R * .96, -k * .63)} ${p(-slot - 6.1 * u, -H + 4.8 * u)}`
    + `C${p(-slot - 4.6 * u, -H + 2.6 * u)} ${p(-slot - 3 * u, -H + .6 * u)} ${p(-slot - .25 * u, -H + .08 * u)}`
    + `Q${p(-slot, -H)} ${p(-slot, -H + .25 * u)}V${f(-seat)}Q0,${f(-seat + .35)} ${p(slot, -seat)}Z`;
  return { d, k };
}

function rrect(x: number, y: number, w: number, h: number, r: number) {
  const x2 = x + w, y2 = y + h, rr = Math.min(r, w / 2, h / 2);
  return `M${f(x + rr)},${f(y)}H${f(x2 - rr)}Q${f(x2)},${f(y)} ${f(x2)},${f(y + rr)}V${f(y2 - rr)}Q${f(x2)},${f(y2)} ${f(x2 - rr)},${f(y2)}H${f(x + rr)}Q${f(x)},${f(y2)} ${f(x)},${f(y2 - rr)}V${f(y + rr)}Q${f(x)},${f(y)} ${f(x + rr)},${f(y)}Z`;
}

function defs(id: string, L: FullLook, k: number, variant: SRPK01Options['variant']) {
  const padi = variant === 'srpk01';
  // The photographed waffle has roughly 17 squares across the dial, with recessed joints.
  const pitch = f(k * .09), inset = f(k * .007), tile = f(k * .076);
  const grid = !padi ? `<linearGradient id="${id}tile" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.dial, .075)}"/><stop offset="1" stop-color="${shade(L.dial, -.1)}"/></linearGradient><pattern id="${id}gr" patternUnits="userSpaceOnUse" width="${pitch}" height="${pitch}"><rect width="${pitch}" height="${pitch}" fill="#090c0c"/><rect x="${inset}" y="${inset}" width="${tile}" height="${tile}" rx="${f(k * .004)}" fill="url(#${id}tile)"/><path d="M${inset},${f(inset + tile)}V${inset}H${f(inset + tile)}" fill="none" stroke="#606865" stroke-width="${f(k * .003)}" opacity=".35"/></pattern>` : '';
  return `<defs>${grid}
<linearGradient id="${id}st" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fafbf7"/><stop offset=".42" stop-color="${L.handColor}"/><stop offset=".58" stop-color="#7d888b"/><stop offset=".75" stop-color="#e4e9e7"/><stop offset="1" stop-color="#98a3a5"/></linearGradient>
<linearGradient id="${id}lu" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.lume, .06)}"/><stop offset="1" stop-color="${shade(L.lume, -.08)}"/></linearGradient>
<linearGradient id="${id}cy" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(L.caseColor, -.48)}"/><stop offset=".28" stop-color="${shade(L.caseColor, .45)}"/><stop offset=".5" stop-color="${shade(L.caseColor, .7)}"/><stop offset="1" stop-color="${shade(L.caseColor, -.38)}"/></linearGradient>
<linearGradient id="${id}re" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${padi ? '#aab9c1' : '#b9bfbd'}"/><stop offset=".35" stop-color="${padi ? '#3c5363' : '#4b5351'}"/><stop offset=".7" stop-color="${padi ? '#0b1d2e' : '#101716'}"/><stop offset="1" stop-color="${padi ? '#71828a' : '#78817d'}"/></linearGradient>
<linearGradient id="${id}be" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${shade(L.bezel, .08)}"/><stop offset=".55" stop-color="${L.bezel}"/><stop offset="1" stop-color="${shade(L.bezel, -.25)}"/></linearGradient>
<linearGradient id="${id}dl" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${shade(L.dial, -.55)}"/><stop offset=".3" stop-color="${shade(L.dial, .025)}"/><stop offset=".52" stop-color="${L.dial}"/><stop offset=".78" stop-color="${shade(L.dial, -.32)}"/><stop offset="1" stop-color="${shade(L.dial, -.85)}"/></linearGradient>
<linearGradient id="${id}wv" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#74d3e6" stop-opacity=".03"/><stop offset=".35" stop-color="#74d3e6" stop-opacity=".25"/><stop offset=".7" stop-color="#2aabd0" stop-opacity=".12"/><stop offset="1" stop-color="#2aabd0" stop-opacity="0"/></linearGradient>
<linearGradient id="${id}cl" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${padi ? '#eefaff' : '#fafbf8'}" stop-opacity=".65"/><stop offset=".28" stop-color="${padi ? '#92d8ee' : '#d7ded9'}" stop-opacity=".08"/><stop offset=".7" stop-color="${padi ? '#4db7dc' : '#8c9590'}" stop-opacity=".16"/><stop offset="1" stop-color="${padi ? '#d4f5ff' : '#edf1ec'}" stop-opacity=".5"/></linearGradient>
<pattern id="${id}br" patternUnits="userSpaceOnUse" width=".5" height=".5" patternTransform="rotate(48)"><path d="M0,0V.5M.22,0V.5" stroke="#fff" stroke-width=".05" opacity=".09"/><path d="M.11,0V.5M.38,0V.5" stroke="#4e565b" stroke-width=".04" opacity=".07"/></pattern>
<clipPath id="${id}dc"><circle r="${f(k * .776)}"/></clipPath>
</defs>`;
}

/** Crown seated through the case flank, with the exposed barrel above the case surface. */
function crown(R: number, id: string, L: FullLook, outline: boolean, stroke: string) {
  const angle = ({ 3: 0, 4: 24, 9: -90 } as Record<string, number>)[L.crown] ?? 24;
  const h = 3.25, proud = 3.85;
  let s = `<g transform="rotate(${angle}) translate(${f(R - 1)} 0)">`;
  if (!outline) s += `<rect x="-.55" y="${f(-h + .25)}" width="1.25" height="${f((h - .25) * 2)}" rx=".35" fill="${shade(L.caseColor, -.55)}"/>`;
  s += `<path d="M0,${-h}H${f(proud - 1)}Q${proud},${-h} ${proud},0Q${proud},${h} ${f(proud - 1)},${h}H0Z" fill="${outline ? 'none' : `url(#${id}cy)`}" ${stroke}/>`;
  if (!outline) {
    let grooves = '', lights = '';
    for (let i = -8; i <= 8; i++) {
      grooves += `M.15,${f(i * .36)}H${f(proud - 1.05)}`;
      lights += `M.2,${f(i * .36 + .12)}H${f(proud - 1.1)}`;
    }
    s += `<path d="${grooves}" stroke="${shade(L.caseColor, -.58)}" stroke-width=".13"/><path d="${lights}" stroke="#fff" stroke-width=".07" opacity=".75"/>`;
    s += `<path d="M${f(proud - .12)},${f(-h + .35)}Q${f(proud - .12)},0 ${f(proud - .12)},${f(h - .35)}" fill="none" stroke="#fff" stroke-width=".25" opacity=".7"/>`;
  }
  return s + '</g>';
}

/** Shared machined bezel; only the PADI has a cyan first twenty minutes. */
function bezel(k: number, id: string, L: FullLook, variant: SRPK01Options['variant']) {
  const padi = variant === 'srpk01';
  const cyan = padi ? L.bezel2 || L.accent : L.bezelText, silver = padi ? shade(L.bezelText, -.16) : L.bezelText;
  let crests = '', facets = '';
  const teeth = 48, step = 360 / teeth, half = step / 2;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    crests += `M${pt(k * 1.012, a - half * .9)}L${pt(k * 1.043, a - half * .72)}A${f(k * 1.043)},${f(k * 1.043)} 0 0 1 ${pt(k * 1.043, a + half * .72)}L${pt(k * 1.012, a + half * .9)}Z`;
    facets += `M${pt(k * 1.043, a + half * .72)}L${pt(k * 1.012, a + half * .9)}L${pt(k * 1.015, a + half * .55)}L${pt(k * 1.039, a + half * .53)}Z`;

  }
  let s = `<circle r="${f(k * 1.025)}" fill="url(#${id}cy)"/><path d="${crests}" fill="${shade(L.caseColor, .55)}" stroke="${shade(L.caseColor, -.25)}" stroke-width=".055"/><path d="${facets}" fill="${shade(L.caseColor, -.25)}" opacity=".5"/>`;
  s += `<circle r="${f(k * 1.005)}" fill="none" stroke="#f4f6f3" stroke-width=".15"/><circle r="${f(k * .998)}" fill="url(#${id}be)"/><circle r="${f(k * .998)}" fill="none" stroke="#d9e0e1" stroke-width=".1"/>`;
  let paleDots = '', cyanDots = '', paleBars = '', cyanBars = '';
  for (let m = 1; m < 60; m++) {
    if (m % 10 === 0) continue;
    const a = m * 6;
    if (m % 5 === 0) {
      const d = `M${pt(k * .975, a)}L${pt(k * .835, a)}`;
      if (padi && m < 20) cyanBars += d; else paleBars += d;
    } else {
      const [x, y] = P(k * .868, a), r = k * .013;
      const d = `M${f(x - r)},${f(y)}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0`;
      if (padi && m < 20) cyanDots += d; else paleDots += d;
    }
  }
  s += `<path d="${paleDots}" fill="${silver}"/><path d="${cyanDots}" fill="${cyan}"/><path d="${paleBars}" stroke="${silver}" stroke-width="${f(k * .026)}"/><path d="${cyanBars}" stroke="${cyan}" stroke-width="${f(k * .026)}"/>`;
  s += `<path d="M${f(-k * .137)},${f(-k * .988)}H${f(k * .137)}L0,${f(-k * .827)}Z" fill="${cyan}"/><circle cy="${f(-k * .925)}" r="${f(k * .037)}" fill="${L.lume}"${lu('bezel')} stroke="#233b48" stroke-width="${f(k * .014)}"/>`;
  s += `<g font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .178)}" font-weight="400" text-anchor="middle" dominant-baseline="central">`;
  for (const v of [10, 20, 30, 40, 50]) {
    const a = v * 6, [x, y] = P(k * .906, a);
    s += `<text x="${f(x)}" y="${f(y)}" fill="${v <= 20 ? cyan : silver}" transform="rotate(${a} ${f(x)} ${f(y)}) translate(${f(x)} ${f(y)}) scale(1.08 .88) translate(${f(-x)} ${f(-y)})">${v}</text>`;
  }
  return s + '</g>';
}

/** Polished crystal seat and the white minute printing on the dial. */
function chapter(k: number, id: string) {
  let minor = '', major = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6;
    if (i % 5) minor += `M${pt(k * .756, a)}L${pt(k * .697, a)}`;
    else major += `M${pt(k * .758, a)}L${pt(k * .685, a)}`;
  }
  return `<circle r="${f(k * .786)}" fill="none" stroke="url(#${id}re)" stroke-width="${f(k * .026)}"/><circle r="${f(k * .799)}" fill="none" stroke="#dce5e7" stroke-width=".12"/>`
    + `<path d="${minor}" stroke="#e8f0ef" stroke-width="${f(k * .009)}"/><path d="${major}" stroke="#f7f8f2" stroke-width="${f(k * .019)}"/>`;
}

/** Circular plots, long 6 and 9 batons and the broad divided 12 marker. */
function markers(k: number, id: string) {
  let shadow = '', metal = '', lume = '';
  for (const h of [1, 2, 4, 5, 7, 8, 10, 11]) {
    const [x, y] = P(k * .58, h * 30), r = k * .067;
    shadow += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
    metal += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
    lume += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r - k * .011)}"/>`;
  }
  const bar = (a: number) => {
    const t = ` transform="rotate(${a})"`;
    const d = `M${f(-k * .06)},${f(-k * .655)}Q${f(-k * .065)},${f(-k * .65)} ${f(-k * .06)},${f(-k * .63)}L${f(-k * .047)},${f(-k * .47)}Q0,${f(-k * .45)} ${f(k * .047)},${f(-k * .47)}L${f(k * .06)},${f(-k * .63)}Q${f(k * .065)},${f(-k * .65)} ${f(k * .06)},${f(-k * .655)}Z`;
    shadow += `<path d="${d}"${t}/>`;
    metal += `<path d="M${f(-k * .006)},${f(-k * .47)}V${f(-k * .37)}Q0,${f(-k * .35)} ${f(k * .006)},${f(-k * .37)}V${f(-k * .47)}Z"${t}/><path d="${d}"${t}/>`;
    lume += `<path d="M${f(-k * .045)},${f(-k * .639)}H${f(k * .045)}L${f(k * .032)},${f(-k * .484)}H${f(-k * .032)}Z"${t}/>`;
  };
  bar(270); bar(180);
  const shield = `M${f(-k * .12)},${f(-k * .65)}Q${f(-k * .13)},${f(-k * .65)} ${f(-k * .117)},${f(-k * .61)}L${f(-k * .075)},${f(-k * .45)}Q${f(-k * .07)},${f(-k * .43)} ${f(-k * .035)},${f(-k * .425)}L${f(-k * .012)},${f(-k * .41)}L${f(-k * .006)},${f(-k * .36)}H${f(k * .006)}L${f(k * .012)},${f(-k * .41)}L${f(k * .035)},${f(-k * .425)}Q${f(k * .07)},${f(-k * .43)} ${f(k * .075)},${f(-k * .45)}L${f(k * .117)},${f(-k * .61)}Q${f(k * .13)},${f(-k * .65)} ${f(k * .12)},${f(-k * .65)}Z`;
  shadow += `<path d="${shield}"/>`;
  metal += `<path d="${shield}"/>`;
  for (const side of [-1, 1]) lume += `<path d="M${f(k * .011)},${f(-k * .63)}H${f(k * .099)}L${f(k * .058)},${f(-k * .466)}H${f(k * .011)}Z" transform="scale(${side} 1)"/>`;
  return `<g fill="#00101d" opacity=".35" transform="translate(.09 .13)">${shadow}</g><g fill="url(#${id}st)" stroke="#d7e0dc" stroke-width=".06">${metal}</g><g fill="url(#${id}lu)"${lu('indices')} stroke="#87958d" stroke-width=".05">${lume}</g>`;
}

/** Combined day/date at 3 and the sapphire cyclops above it. */
function dayDate(k: number, id: string, L: FullLook, variant: SRPK01Options['variant']) {
  if (!L.date) return '';
  // Match the enlarged reading through the cyclops, not an unmagnified aperture.
  const x = k * .425, y = k * .01, w = k * .43, h = k * .132;
  let s = `<path d="${rrect(x - w / 2 - k * .012, y - h / 2 - k * .012, w + k * .024, h + k * .024, k * .012)}" fill="url(#${id}st)" stroke="#6b787b" stroke-width=".07"/>`;
  s += `<path d="${rrect(x - w / 2, y - h / 2, w, h, k * .006)}" fill="#f5f7f3"/>`;
  s += `<g fill="#111820" font-family="Arial,Helvetica,sans-serif" text-anchor="middle" dominant-baseline="central"><text x="${f(x - k * .085)}" y="${f(y)}" font-size="${f(k * .12)}" textLength="${f(k * .235)}" lengthAdjust="spacingAndGlyphs">MON</text><text x="${f(x + k * .13)}" y="${f(y)}" font-size="${f(k * .15)}" textLength="${f(k * .14)}" lengthAdjust="spacingAndGlyphs">6</text></g>`;
  const lw = k * .51, lh = k * .245;
  const lens = `M${f(x - lw * .45)},${f(y - lh / 2)}H${f(x + lw * .45)}Q${f(x + lw * .57)},${f(y)} ${f(x + lw * .45)},${f(y + lh / 2)}H${f(x - lw * .45)}Q${f(x - lw * .57)},${f(y)} ${f(x - lw * .45)},${f(y - lh / 2)}Z`;
  s += `<path d="${lens}" fill="url(#${id}cl)" stroke="${variant === 'srpk01' ? '#b4e1ec' : '#c3ccc6'}" stroke-width="${f(k * .008)}"/>`;
  s += `<path d="M${f(x - lw * .4)},${f(y - lh * .42)}H${f(x + lw * .4)}M${f(x - lw * .4)},${f(y + lh * .44)}H${f(x + lw * .4)}" fill="none" stroke="${variant === 'srpk01' ? '#effcff' : '#f5f7f2'}" stroke-width="${f(k * .009)}" opacity=".65"/>`;
  return s;
}

function printing(k: number, L: FullLook, brand: string, variant: SRPK01Options['variant']) {
  const ink = L.bezelText, xs = k * .04;
  const xMark = (y: number) => `<g transform="translate(0 ${f(y)})"><path d="M${f(xs * .45)},${f(-xs * .8)}H${f(xs * 1.1)}L${f(-xs * .45)},${f(xs * .8)}H${f(-xs * 1.1)}Z" fill="none" stroke="${ink}" stroke-width="${f(xs * .13)}"/><path d="M${f(-xs * 1.2)},${f(-xs * .8)}H${f(-xs * .3)}L${f(xs * 1.2)},${f(xs * .8)}H${f(xs * .3)}Z" fill="${ink}"/></g>`;
  let s = `<text y="${f(-k * .252)}" font-family="Georgia,'Times New Roman',serif" font-size="${f(k * .087)}" font-weight="700" textLength="${f(k * .35)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">${esc(brand.toUpperCase())}</text>`;
  s += variant === 'srpk01' ? xMark(-k * .182) + `<text y="${f(k * .18)}" font-family="Arial,Helvetica,sans-serif" font-size="${f(k * .10)}" font-weight="700" textLength="${f(k * .205)}" lengthAdjust="spacingAndGlyphs" text-anchor="middle" fill="${ink}">PADI</text>` : xMark(k * .18);
  s += `<g font-family="Arial,Helvetica,sans-serif" text-anchor="middle"><text y="${f(k * .278)}" font-size="${f(k * .055)}" textLength="${f(k * .32)}" lengthAdjust="spacingAndGlyphs" fill="${ink}">AUTOMATIC</text><text y="${f(k * .348)}" font-size="${f(k * .055)}" font-weight="700" textLength="${f(k * .47)}" lengthAdjust="spacingAndGlyphs" fill="${variant === 'srpe03' ? L.accent : ink}">DIVER’S 200m</text></g>`;
  return s;
}

/** Shared steel arrow hands; the PADI minute is cyan, the SRPE03 seconds and lower text are gold. */
function hands(k: number, id: string, L: FullLook, variant: SRPK01Options['variant']) {
  const padi = variant === 'srpk01', minuteColor = padi ? L.bezel2 || L.accent : L.handColor;
  const hw = k * .122;
  const hour = `M${f(-hw * .30)},${f(k * .025)}L${f(-hw * .28)},${f(-k * .13)}L${f(-hw / 2)},${f(-k * .17)}V${f(-k * .37)}L${f(-hw * .16)},${f(-k * .40)}L0,${f(-k * .445)}L${f(hw * .16)},${f(-k * .40)}L${f(hw / 2)},${f(-k * .37)}V${f(-k * .17)}L${f(hw * .28)},${f(-k * .13)}L${f(hw * .30)},${f(k * .025)}Z`;
  const hourTail = `M${f(-hw * .3)},0V${f(k * .085)}L0,${f(k * .105)}L${f(hw * .3)},${f(k * .085)}V0Z`;
  const hourLume = `M${f(-hw * .35)},${f(-k * .18)}V${f(-k * .35)}L0,${f(-k * .39)}L${f(hw * .35)},${f(-k * .35)}V${f(-k * .18)}Z`;
  const hourFace = `M0,${f(-k * .445)}L${f(hw * .16)},${f(-k * .40)}L${f(hw / 2)},${f(-k * .37)}V${f(-k * .17)}L${f(hw * .28)},${f(-k * .13)}L${f(hw * .30)},${f(k * .025)}H0Z M0,0H${f(hw * .3)}V${f(k * .085)}L0,${f(k * .105)}Z`;
  const mw = k * .09;
  const minute = `M${f(-mw / 2)},${f(k * .02)}L${f(-mw * .6)},${f(-k * .08)}L${f(-mw * .4)},${f(-k * .16)}L${f(-mw * .36)},${f(-k * .46)}L${f(-k * .075)},${f(-k * .46)}L0,${f(-k * .64)}L${f(k * .075)},${f(-k * .46)}L${f(mw * .36)},${f(-k * .46)}L${f(mw * .4)},${f(-k * .16)}L${f(mw * .6)},${f(-k * .08)}L${f(mw / 2)},${f(k * .02)}Z`;
  const minuteLume = `M${f(-mw * .28)},${f(-k * .09)}L${f(-mw * .25)},${f(-k * .475)}H${f(-k * .049)}L0,${f(-k * .605)}L${f(k * .049)},${f(-k * .475)}H${f(mw * .25)}L${f(mw * .28)},${f(-k * .09)}Z`;
  const minuteFace = `M0,${f(-k * .64)}L${f(k * .075)},${f(-k * .46)}L${f(mw * .36)},${f(-k * .46)}L${f(mw * .4)},${f(-k * .16)}L${f(mw * .6)},${f(-k * .08)}L${f(mw / 2)},${f(k * .02)}H0Z M0,0H${f(mw / 2)}V${f(k * .115)}H0Z`;
  const minuteTail = `M${f(-mw / 2)},0V${f(k * .115)}H${f(mw / 2)}V0Z`;
  const ha = 304.2, ma = 53.5, sa = 252.4;
  const brushed = shade(L.handColor, -.28);
  let s = `<g fill="#00101a" opacity=".3" transform="translate(.15 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${hourTail}" ${handRole('hour')}transform="rotate(${ha})"/><path d="${minute}" ${handRole('minute')}transform="rotate(${ma})"/><path d="${minuteTail}" ${handRole('minute')}transform="rotate(${ma})"/></g>`;
  s += `<g ${handRole('hour')}transform="rotate(${ha})"><path d="${hourTail}" fill="${brushed}"/><path d="${hour}" fill="${brushed}" stroke="#edf2ed" stroke-width=".07"/><path d="${hourFace}" fill="${L.handColor}"/><path d="${hourLume}" fill="url(#${id}lu)"${lu('hands')} stroke="#8e9d92" stroke-width=".05"/></g>`;
  s += `<g ${handRole('minute')}transform="rotate(${ma})"><path d="${minuteTail}" fill="${padi ? shade(minuteColor, -.22) : brushed}"/><path d="${minute}" fill="${padi ? shade(minuteColor, -.12) : brushed}" stroke="${padi ? '#80d9ec' : '#edf2ed'}" stroke-width=".07"/>${padi ? '' : `<path d="${minuteFace}" fill="${L.handColor}"/>`}<path d="${minuteLume}" fill="url(#${id}lu)"${lu('hands')} stroke="${padi ? '#4ba5b8' : '#9ca99f'}" stroke-width=".06"/></g>`;
  // This reference has a circular lume counterweight opposite the long seconds needle.
  s += `<g ${handRole('second')}transform="rotate(${sa})"><path d="M${f(-k * .004)},${f(k * .43)}H${f(k * .004)}L${f(k * .002)},${f(-k * .638)}H${f(-k * .002)}Z" fill="${padi ? L.handColor : L.accent}"/><circle cy="${f(k * .35)}" r="${f(k * .043)}" fill="url(#${id}st)" stroke="#71817f" stroke-width=".05"/><circle cy="${f(k * .35)}" r="${f(k * .034)}" fill="${L.lume}"${lu('seconds')}/></g>`;
  if (!padi) return s + `<circle r="${f(k * .04)}" fill="#101716" stroke="#8d9690" stroke-width=".05"/><circle r="${f(k * .009)}" fill="${L.accent}"/>`;
  return s + `<circle r="${f(k * .03)}" fill="url(#${id}st)" stroke="#e6ece6" stroke-width=".06"/><circle r="${f(k * .012)}" fill="#657476"/>`;
}

export interface SRPK01Options { D: number; LL: number; lw: number; id: string; L: FullLook; brand: string; variant: 'srpk01' | 'srpe03'; outline: boolean; stroke: string; outlineColor: string; sw: number }

/** Everything above the strap for the SRPK01 and SRPE03 King Turtle pair. */
export function srpk01SVG(o: SRPK01Options) {
  const { D, LL, lw, id, L, outline } = o;
  const { d, k } = srpk01Case(D, LL, lw);
  let s = outline ? '' : defs(id, L, k, o.variant);
  s += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? o.stroke : `stroke="${shade(L.caseColor, -.3)}" stroke-width=".12"`}/>`;
  if (outline) return s + crown(D / 2, id, L, true, o.stroke) + `<circle r="${f(k * 1.05)}" fill="none" ${o.stroke}/><circle r="${f(k * .776)}" fill="none" stroke="${o.outlineColor}" stroke-width="${f(o.sw * .6)}" stroke-dasharray="1.2 .8"/>`;
  s += `<defs><clipPath id="${id}cc"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id}cc)"><path d="${d}" fill="url(#${id}br)"/><path d="${d}" fill="none" stroke="${shade(L.caseColor, -.34)}" stroke-width=".5"/><path d="${d}" fill="none" stroke="${shade(L.caseColor, .6)}" stroke-width=".18"/></g>`;
  // The top surface rolls down into a small polished chamfer around the crown seat.
  // Clip it to the cushion silhouette; the crown covers the middle of the sloping face.
  const crownAngle = ({ 3: 0, 4: 24, 9: -90 } as Record<string, number>)[L.crown] ?? 24;
  const seat = D / 2 - 1;
  const chamfer = `M${f(seat - 1.1)},-4.2Q${f(seat + .1)},-3.9 ${f(seat + 2.5)},-3.5V3.6Q${f(seat + .3)},4.2 ${f(seat - 1.05)},4.2L${f(seat - 1.45)},4.0Q${f(seat - .7)},0 ${f(seat - 1.45)},-4.2Z`;
  s += `<g clip-path="url(#${id}cc)"><g transform="rotate(${crownAngle})"><path d="${chamfer}" fill="${shade(L.caseColor, .13)}"/><path d="M${f(seat - 1.05)},4.2L${f(seat - 1.45)},4.0Q${f(seat - .7)},0 ${f(seat - 1.45)},-4.2" fill="none" stroke="${shade(L.caseColor, -.15)}" stroke-width=".12"/><path d="M${f(seat - 1.1)},-4.2Q${f(seat + .1)},-3.9 ${f(seat + 2.5)},-3.5" fill="none" stroke="${shade(L.caseColor, .6)}" stroke-width=".15"/></g></g>`;
  s += crown(D / 2, id, L, false, o.stroke);
  s += bezel(k, id, L, o.variant);
  s += `<circle r="${f(k * .777)}" fill="url(#${id}dl)"/>`;
  if (o.variant === 'srpe03') s += `<circle r="${f(k * .686)}" fill="url(#${id}gr)"/>`;
  if (o.variant === 'srpk01') {
  // Fine, irregular surface reflections in two compound paths; no bitmap or noise filter.
  let lightRipples = '', darkRipples = '';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 4; col++) {
      const x = -.8 + col * .4 + (row % 2) * .14;
      const y = -.58 + row * .085 + .018 * Math.sin(row * 3 + col * 2);
      const w = .26 + .10 * Math.sin(row * 2.1 + col * 1.7), h = .012 + .008 * (1 + Math.sin(row + col));
      const p = (dx: number, dy: number) => `${f(k * (x + dx))},${f(k * (y + dy))}`;
      const d = `M${p(0, 0)}Q${p(w * .22, -h)} ${p(w * .48, -h * .3)}L${p(w, h * .4)}Q${p(w * .64, h * .8)} ${p(w * .38, h * .35)}Z`;
      if ((row + col) % 3) lightRipples += d; else darkRipples += d;
    }
  }
  s += `<g clip-path="url(#${id}dc)"><path d="${lightRipples}" fill="url(#${id}wv)"/><path d="${darkRipples}" fill="#001c32" opacity=".22"/></g>`;
  }
  s += chapter(k, id);
  s += markers(k, id);
  s += dayDate(k, id, L, o.variant);
  s += printing(k, L, o.brand, o.variant);
  s += hands(k, id, L, o.variant);
  s += `<path d="M${f(-k * .55)},${f(-k * .18)}A${f(k * .72)},${f(k * .72)} 0 0 1 ${f(k * .18)},${f(-k * .55)}A${f(k * .95)},${f(k * .95)} 0 0 0 ${f(-k * .55)},${f(-k * .18)}Z" fill="#fff" opacity=".035"/>`;
  return s;
}
