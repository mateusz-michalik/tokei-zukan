import { l2l, num } from '../lib/util';
import { dimColours, type Lighting } from './night';
import { watchGroup, type RenderableWatch } from './watch';

let wristRenderId = 0;

export interface WristViewport {
  left?: number; right?: number; top?: number; bottom?: number;
  /** At dusk or night the skin and watch dim and the lume glows; guides and labels turn light to stay readable. */
  lighting?: Lighting;
}

/** Width across the top of the wrist and the flat-top estimate, both in mm, from circumference in cm. */
export const wristMetrics = (cm: number) => ({ width: cm * 10 * 0.36, flat: cm * 10 * 0.29 });

/** Top-down view of a left wrist with the watch on it and an optional outline of another watch. */
export function wristSVG(w: RenderableWatch | undefined, cm: number, ghost?: RenderableWatch | null, o: WristViewport = {}) {
  const { width: W, flat } = wristMetrics(cm), s = W / 60;
  const hw = W / 2;
  const compact = o.left !== undefined || o.right !== undefined || o.top !== undefined || o.bottom !== undefined;
  // Anatomical illustration in a 60 mm wrist frame, scaled independently of the watch.
  // The watch stays at the measured wrist section (0,0); the hand begins beyond it.
  const skinId = `wrist-skin-${++wristRenderId}`;
  let g = `<defs><linearGradient id="${skinId}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#DCC7B5"/><stop offset=".42" stop-color="#EADACB"/><stop offset=".75" stop-color="#E7D4C2"/><stop offset="1" stop-color="#D8BFA9"/></linearGradient></defs>`;
  // One continuous contour avoids seams at the webs and thumb. From top to bottom:
  // little, ring, middle and index finger, then the thumb (left hand, back facing up).
  g += `<g transform="scale(${s})">
    <path d="M-170,-40
      C-105,-38 -40,-31 0,-30
      C16,-30 25,-29 35,-30
      C52,-31 68,-36 83,-35
      C94,-35 104,-35 112,-36
      L137,-38 C142,-38.4 145,-36.5 145.5,-33.5
      C146,-30.5 144,-28.2 140,-27.5
      C129,-25.7 119,-24.5 109,-22.5
      C106,-22 104.5,-20 106,-18
      C116,-17.8 126,-20 137,-20.5
      L163,-22 C168,-22.3 171,-20.3 171.5,-16.5
      C172,-12.7 169.5,-10.2 165,-9.5
      L140,-7 C130,-6 120,-4.5 111,-4
      Q107,-3 110,0
      C123,1 136,.2 148,.8
      L178,2 C183,2.2 186,4.8 186,8.2
      C186,11.8 183,14 178,14.3
      L148,14.4 C135,14.3 123,15.5 112,14.5
      Q108,15 110,18
      C121,20.3 131,21.5 142,24
      L164,29 C168.8,30.2 171,33.3 170,36.7
      C169,40.2 165.8,41.9 161.5,41.3
      L138,37 C127,34.7 117,33 107,31
      C101,29.9 98,31.6 98.8,36
      C101,42 109,48 115,54
      L125,64 C128,67.2 128.4,70.6 126,73
      C123.4,75.5 120,75.1 116,72.8
      C105,66.5 96,59 85,53.5
      C70,46 63,43 54,39
      C44,34.5 36,31.5 27,31
      C18,30 8,30 0,30
      C-40,31 -105,38 -170,40Z"
      fill="url(#${skinId})" stroke="#BAA18A" stroke-width=".35" stroke-linejoin="round"/>
    <!-- Gentle knuckle and tendon contours; finger shafts narrow towards the tips. -->
    <g fill="none" stroke="#AC8E75" stroke-linecap="round">
      <path d="M24,-25 Q29,-27 33,-25.8" stroke-width=".35" opacity=".28"/>
      <path d="M43,-18 C59,-21 73,-27 90,-27 M44,-7 C62,-8 79,-10 97,-11 M44,5 C65,5 83,7 99,8" stroke-width=".3" opacity=".12"/>
      <path d="M91,29 C88,33 89,37 92,40 M77,45 Q85,48 90,53" stroke-width=".35" opacity=".24"/>
      <path d="M117,-33.7 Q116,-30.4 118,-28.5 M143,-18 Q142,-14.3 143.5,-11.8 M155,4 Q153.8,8 155,11.6 M144,27.5 Q142.2,31 143,34 M112,57 Q109.5,58.5 109,61" stroke-width=".3" opacity=".25"/>
    </g>
    <!-- Small inset nails follow the tapered finger tips, without a heavy outline. -->
    <g fill="#F0E1D6" fill-opacity=".65" stroke="#C3AB97" stroke-width=".2" stroke-opacity=".35">
      <path d="M134,-35 Q139,-37 142,-34.8 Q144,-32.5 141,-30 L134,-29.5Q133,-32 134,-35Z"/>
      <path d="M159,-19 Q165,-20.8 168,-17.5 Q170,-14.5 166,-12.5 L159,-11.8Q157.8,-15.4 159,-19Z"/>
      <path d="M174,4 Q181,3.8 183,7.3 Q184,10.5 180,11.8 L174,12Q172.8,8 174,4Z"/>
      <path d="M159,30.2 Q165,30.7 167.4,34 Q168,37.2 163.5,38.4 L157.5,37Q157.4,33.2 159,30.2Z"/>
      <path d="M118,63 Q123,65 125,68.5 Q126,71 122.6,72 L116,68Q115.5,65.6 118,63Z"/>
    </g>
  </g>`;
  const dark = o.lighting === 'dusk' || o.lighting === 'night';
  if (dark) g = dimColours(g, o.lighting as 'dusk' | 'night');
  const guide = dark ? '#C9C7C0' : '#151515', label = dark ? '#E7E6E1' : '#151515';
  // flat-top guides
  if (!compact) {
    const ext = W * 1.15;
    g += `<g stroke="${guide}" stroke-width=".35" stroke-dasharray="1.5 1.2" opacity=".75"><line x1="${-ext}" y1="${-flat / 2}" x2="${-W * 0.55}" y2="${-flat / 2}"/><line x1="${-ext}" y1="${flat / 2}" x2="${-W * 0.55}" y2="${flat / 2}"/></g>`;
    g += `<text x="${-ext}" y="${-flat / 2 - 1.6}" font-size="3.9" font-family="IBM Plex Mono,monospace" fill="${guide}">flat top ≈ ${flat.toFixed(0)} mm</text>`;
  }
  // strap across wrist
  if (w) {
    const LL = l2l(w);
    // The strap runs across the top of the wrist and out of sight at its edges.
    g += watchGroup(w, { strapLen: Math.max(0, hw + 1 - LL / 2), lighting: o.lighting }).g;
    // lug-to-lug dimension
    if (!compact) {
      const dx = (num(w.diameter) || 40) / 2 + 7;
      g += `<g stroke="${label}" stroke-width=".3"><line x1="${dx}" y1="${-LL / 2}" x2="${dx}" y2="${LL / 2}"/><line x1="${dx - 1.5}" y1="${-LL / 2}" x2="${dx + 1.5}" y2="${-LL / 2}"/><line x1="${dx - 1.5}" y1="${LL / 2}" x2="${dx + 1.5}" y2="${LL / 2}"/></g>`;
      g += `<text x="${dx + 2}" y="1" font-size="4.1" font-family="IBM Plex Mono,monospace" fill="${label}">${LL} mm${num(w.lugToLug) ? '' : ' (est.)'}</text>`;
    }
  }
  if (ghost && w && ghost.id !== w.id) g += watchGroup(ghost, { outline: true, color: '#B4432B', sw: .55 }).g;
  const vx = -(o.left ?? 100) * s, vw = ((o.left ?? 100) + (o.right ?? 197)) * s, vy = -(o.top ?? 52) * s, vh = ((o.top ?? 52) + (o.bottom ?? 83)) * s;
  return `<svg viewBox="${vx} ${vy} ${vw} ${vh}" role="img" aria-label="Top-down view of a ${cm} cm left wrist">${g}</svg>`;
}
