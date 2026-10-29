import { CATALOG } from '../catalog';
import { sampleStraps } from '../catalog/straps';
import { strapLabel } from '../render/strap';
import { watchSVG } from '../render/watch';
import { wristSVG } from '../render/wrist';
import { Svg } from './common';

/**
 * Dev-only review sheet at #gallery: every catalogue watch at hero size and thumbnail size, on the wrist,
 * and one watch on every kind of strap. Use it to check drawings against the drawing standard.
 */
export function Gallery() {
  const sample = CATALOG.find(w => w.id === 'seiko-spb317') ?? CATALOG[0];
  return (
    <div className="gallery-page">
      <h1>Drawing gallery</h1>
      <h2>Catalogue</h2>
      <div className="g-grid">
        {CATALOG.map(w => (
          <figure key={w.id}>
            <Svg html={watchSVG(w, 5, { strapLen: 16 })} />
            <Svg className="g-thumb" html={watchSVG(w, 1, { strapLen: 3 })} />
            <figcaption><b>{w.ref}</b> {w.look.shape ?? 'round'} · {w.strap ? strapLabel(w.strap) : 'no strap set'}</figcaption>
          </figure>
        ))}
      </div>
      <h2>On a 17 cm wrist</h2>
      <div className="g-grid">
        {CATALOG.map(w => <figure key={w.id}><Svg html={wristSVG(w, 17, null, { left: 42, right: 48, top: 40, bottom: 40 })} /><figcaption>{w.ref}</figcaption></figure>)}
      </div>
      <h2>Straps on the {sample.ref}</h2>
      <div className="g-grid">
        {sampleStraps().map((s, i) => (
          <figure key={i}><Svg html={watchSVG(sample, 5, { strapLen: 16, strap: s })} /><figcaption>{strapLabel(s)}</figcaption></figure>
        ))}
      </div>
    </div>
  );
}
