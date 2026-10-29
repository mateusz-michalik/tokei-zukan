import { shade } from '../lib/util';
import type { FullLook } from '../catalog/schema';
import { P } from './geom';
import { lu } from './night';
import { handRole } from './hands';

const f = (n: number) => +n.toFixed(3);
const point = (r: number, a: number) => P(r, a).map(f).join(',');

/** Slim cushion case with open lug slots. Coordinates remain in physical millimetres. */
export function slimCase(D: number, LL: number, lw: number, id: string, metal: string, outline: boolean, stroke: string, crownAngle: number) {
  const R = D / 2, H = LL / 2, slot = lw / 2, seat = H - 4.1;
  // The opening is exactly the nominal lug width. Rounded tips turn into the
  // shoulders gradually, without the pointed junction of the old short curves.
  const d = `M${-slot},${-seat} Q0,${-seat + .45} ${slot},${-seat}
    L${slot},${-H + .65} Q${slot},${-H} ${slot + .65},${-H}
    C${slot + 1.5},${-H} ${slot + 1.85},${-H + 1} ${slot + 2.7},${-H + 2.2}
    C${R * .88},${-H * .62} ${R},${-H * .36} ${R},0
    C${R},${H * .36} ${R * .88},${H * .62} ${slot + 2.7},${H - 2.2}
    C${slot + 1.85},${H - 1} ${slot + 1.5},${H} ${slot + .65},${H}
    Q${slot},${H} ${slot},${H - .65} L${slot},${seat}
    Q0,${seat - .45} ${-slot},${seat} L${-slot},${H - .65}
    Q${-slot},${H} ${-slot - .65},${H}
    C${-slot - 1.5},${H} ${-slot - 1.85},${H - 1} ${-slot - 2.7},${H - 2.2}
    C${-R * .88},${H * .62} ${-R},${H * .36} ${-R},0
    C${-R},${-H * .36} ${-R * .88},${-H * .62} ${-slot - 2.7},${-H + 2.2}
    C${-slot - 1.85},${-H + 1} ${-slot - 1.5},${-H} ${-slot - .65},${-H}
    Q${-slot},${-H} ${-slot},${-H + .65}Z`;
  let svg = `<defs><clipPath id="${id}case"><path d="${d}"/></clipPath></defs>`;
  svg += `<path d="${d}" fill="${outline ? 'none' : `url(#${id}c)`}" ${outline ? stroke : `stroke="${shade(metal, -.25)}" stroke-width=".12"`}/>`;
  if (!outline) {
    svg += `<g clip-path="url(#${id}case)">`;
    // One tile replaces hundreds of separate strokes, regardless of rendered size.
    svg += `<defs><pattern id="${id}brush" patternUnits="userSpaceOnUse" width=".56" height=".56" patternTransform="rotate(48)"><path d="M0,0V.56M.24,0V.56" stroke="#fff" stroke-width=".055" opacity=".23"/><path d="M.12,0V.56M.42,0V.56" stroke="#555a53" stroke-width=".04" opacity=".16"/></pattern></defs><path d="${d}" fill="url(#${id}brush)"/>`;
    svg += `<path d="${d}" fill="none" stroke="${shade(metal, -.26)}" stroke-width=".75"/><path d="${d}" fill="none" stroke="${shade(metal, .55)}" stroke-width=".28"/></g>`;
  }
  // A dark seat under the crown gives it a recessed root while leaving the knurled barrel exposed.
  const root = R * .91;
  svg += `<g transform="rotate(${crownAngle - 90}) translate(${root} 0)">`;
  if (!outline) svg += `<rect x="-.6" y="-2.9" width="1.5" height="5.8" rx=".65" fill="${shade(metal, -.5)}"/>`;
  svg += `<rect x="0" y="-2.55" width="4.5" height="5.1" rx=".65" fill="${outline ? 'none' : `url(#${id}c)`}" ${stroke}/>`;
  if (!outline) {
    svg += `<defs><linearGradient id="${id}crown" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#858981"/><stop offset=".25" stop-color="#e2e3dd"/><stop offset=".5" stop-color="#fafaf3"/><stop offset="1" stop-color="#92978e"/></linearGradient></defs><rect x=".18" y="-2.4" width="4.1" height="4.8" rx=".4" fill="url(#${id}crown)"/>`;
    for (let i = -6; i <= 6; i++) {
      svg += `<path d="M.45,${i * .35}H4.1" stroke="${shade(metal, -.5)}" stroke-width=".13"/><path d="M.5,${i * .35 + .12}H4" stroke="#fff" stroke-width=".09" opacity=".8"/>`;
    }
    svg += `<path d="M4,-2.1V2.1" stroke="${shade(metal, -.3)}" stroke-width=".2"/>`;
  }
  return svg + '</g>';
}


/** Shared metal/lume finishes for the applied furniture; no raster filters. */
export function slimDialDefs(id: string, L: FullLook) {
  return `<defs><linearGradient id="${id}steel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fcfcf1"/><stop offset=".38" stop-color="${L.handColor}"/><stop offset=".52" stop-color="#858c86"/><stop offset=".62" stop-color="#e1e3d9"/><stop offset="1" stop-color="#a0a79e"/></linearGradient><linearGradient id="${id}lume" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${L.lume}"/><stop offset="1" stop-color="${shade(L.lume, -.09)}"/></linearGradient></defs>`;
}

/** Two compound paths describe the alternating facets of the machined bezel edge. */
export function slimBezelEdge(r: number, id: string) {
  let bright = '', dark = '';
  for (let i = 0; i < 120; i++) {
    const a = i * 3;
    bright += `M${point(r - .82, a - 1.5)}L${point(r, a)}L${point(r - .68, a + 1.5)}Z`;
    dark += `M${point(r, a)}L${point(r - .82, a + 1.5)}L${point(r - .68, a + .6)}Z`;
  }
  return `<circle r="${r - .35}" fill="url(#${id}steel)"/><path d="${bright}" fill="#ecede7" stroke="#949c95" stroke-width=".035"/><path d="${dark}" fill="#666e68"/><circle r="${r - .79}" fill="none" stroke="#f8f8ee" stroke-width=".14"/>`;
}

export function slimChapter(r: number, id: string) {
  let minutes = '', hours = '';
  for (let i = 0; i < 60; i++) {
    const line = `M${point(r * .989, i * 6)}L${point(r * (i % 5 ? .9 : .885), i * 6)}`;
    if (i % 5) minutes += line; else hours += line;
  }
  return `<circle r="${r * .978}" fill="none" stroke="#89948e" stroke-width="${r * .026}" opacity=".42"/><circle r="${r * .995}" fill="none" stroke="#c6cbc1" stroke-width=".09"/><path d="${minutes}" stroke="#bdc4bd" stroke-width=".095"/><path d="${hours}" stroke="url(#${id}steel)" stroke-width=".38"/><circle r="${r * .952}" fill="none" stroke="#171e1d" stroke-width=".1"/>`;
}

export function slimMarker(h: number, r: number, id: string) {
  const top = -r * .855, len = r * (h === 0 ? .26 : .23), width = r * (h % 3 ? .105 : .12);
  let d: string;
  if (h === 0) {
    const w = r * .118;
    d = `M${-w},${top}H${w}L${w * .97},${top + len * .88}L0,${top + len}L${-w * .97},${top + len * .88}Z`;
  } else {
    const x = -width / 2, c = .09;
    d = `M${x + c},${top}H${-x - c}Q${-x},${top} ${-x},${top + c}V${top + len - c}Q${-x},${top + len} ${-x - c},${top + len}H${x + c}Q${x},${top + len} ${x},${top + len - c}V${top + c}Q${x},${top} ${x + c},${top}Z`;
  }
  // Insetting about the marker centre preserves a visible polished rim on all four sides.
  const cy = top + len / 2;
  return `<g transform="rotate(${h * 30})"><path d="${d}" fill="#090e0d" stroke="#080b0a" stroke-width=".35" transform="translate(.07 .1)"/><path d="${d}" fill="url(#${id}steel)" stroke="#dadfd4" stroke-width=".09"/><path d="${d}" fill="url(#${id}lume)"${lu('indices')} transform="translate(0 ${cy}) scale(${h === 0 ? .86 : .79} .88) translate(0 ${-cy})"/>${h === 0 ? `<path d="M0,${top + .15}V${top + len - .13}" stroke="#979f95" stroke-width=".14"/>` : ''}</g>`;
}

/** The hour hand has a short lume insert and long brushed root; the seconds tip has a framed paddle. */
export function slimHands(r: number, id: string, L: FullLook) {
  const hour = `M-.7,2.35L-.85,-7.9L-.48,-8.5H.48L.85,-7.9L.7,2.35L.4,2.6H-.4Z`;
  const minute = `M-.41,2.5L-.55,-12.05L0,-12.8L.55,-12.05L.41,2.5Z`;
  // Flat brushed and polished halves, split along the centre of the blade and tail.
  const brushed = shade(L.handColor, -.28), polished = L.handColor;
  const hourFace = `M0,-8.5H.48L.85,-7.9L.7,2.35L.4,2.6H0Z`;
  const minuteFace = `M0,-12.8L.55,-12.05L.41,2.5H0Z`;
  const scale = r / 14.6;
  return `<g transform="scale(${scale})"><g fill="#000" opacity=".28" transform="translate(.16 .22)"><path d="${hour}" ${handRole('hour')}transform="rotate(304.5)"/><path d="${minute}" ${handRole('minute')}transform="rotate(53)"/></g><g ${handRole('hour')}transform="rotate(304.5)"><path d="${hour}" fill="${brushed}" stroke="#f1f1df" stroke-width=".08"/><path d="${hourFace}" fill="${polished}"/><path d="M-.57,-4.2L-.61,-7.65L-.31,-8.05H.31L.61,-7.65L.57,-4.2Z" fill="url(#${id}lume)"${lu('hands')} stroke="#aeb4a4" stroke-width=".07"/></g><g ${handRole('minute')}transform="rotate(53)"><path d="${minute}" fill="${brushed}" stroke="#edf0df" stroke-width=".08"/><path d="${minuteFace}" fill="${polished}"/><path d="M-.28,-1.55V-11.8L0,-12.25L.28,-11.8V-1.55Z" fill="url(#${id}lume)"${lu('hands')}/></g><g ${handRole('second')}transform="rotate(254)"><path d="M-.14,5.5H.14L.09,-13H-.09Z" fill="url(#${id}steel)" stroke="#f6f3db" stroke-width=".045"/><path d="M-.12,4.35H.12V5.5H-.12Z" fill="#d7dbcd"/><path d="M-.52,-8.3V-10.35L0,-10.8L.52,-10.35V-8.3Z" fill="url(#${id}steel)" stroke="#727a6e" stroke-width=".08"/><path d="M-.38,-8.5V-10.2L0,-10.6L.38,-10.2V-8.5Z" fill="${L.lume}"${lu('seconds')}/><circle cy="-8.7" r=".47" fill="${L.secondsDot || L.accent}" stroke="#fbf9df" stroke-width=".065"/></g><circle r=".5" fill="url(#${id}steel)" stroke="#e6ead8" stroke-width=".09"/><circle r=".21" fill="#929a8b"/><circle r=".1" fill="#353d35"/><path d="M-.25,.19L.25,-.19" stroke="#e3e8d8" stroke-width=".075"/></g>`;
}
