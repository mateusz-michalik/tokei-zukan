import { fmtShown, launchIn, rrpIn, shownPrice } from '../lib/price';
import { watchSVG } from '../render/watch';
import { useStore } from '../store/useStore';
import { strapLabel } from '../render/strap';
import type { Night } from '../catalog/schema';
import type { Watch } from '../store/types';
import { OwnedButton, Svg } from './common';
import { StrapPicker } from './StrapPicker';

/** Everything about one watch. Size comparisons live in Compare. */
export function DetailView() {
  const { state, watches, byId, update } = useStore();
  const { lighting } = state;
  const w = byId(state.selectedId) || watches[0];
  if (!w) return <p className="empty">No watches in the catalogue yet.</p>;

  const spec = (k: string, v: unknown, unit = '') => (
    <div className="spec" key={k}>
      <div className="k">{k}</div>
      <div className="v">
        {v == null || v === '' ? <span className="est">not confirmed</span> : String(v) + unit}
      </div>
    </div>
  );
  const lines = (t?: string) => (t || '').split('\n').filter(Boolean).map((x, i) => <li key={i}>{x}</li>);

  return (
    <div className="detail">
      <div>
        <div className={`hero ${lighting !== 'day' ? 'after-dark' : ''}`}><Svg html={watchSVG(w, 9, { lighting })} /><div className="cap">Illustration from the specs, to scale.{lighting !== 'day' && ' ' + lumeCaption(w.night)}</div></div>
        <StrapPicker w={w} />
      </div>
      <div>
        <div className="title-head">
          <div>
            <p className="title-ref">{w.ref}</p>
            <p className="title-name">{w.brand} {w.model}</p>
          </div>
          <OwnedButton w={w} />
        </div>
        <p className="title-sub">{w.limited ? 'Limited: ' + w.limited : ''}</p>
        <Price w={w} />
        <div className="specs">
          {spec('Diameter', w.diameter, ' mm')}{spec('Lug to lug', w.lugToLug, ' mm')}{spec('Thickness', w.thickness, ' mm')}{spec('Lug width', w.lugWidth, ' mm')}
          {spec('Crystal', w.crystal)}{spec('Bezel', w.bezel)}{spec('Movement', w.movement)}{spec('Power reserve', w.power)}{spec('Water resistance', w.water, ' m')}{spec('Sold on', w.strap && strapLabel(w.strap))}
        </div>
        {(w.pros || w.cons) && <div className="notes">
          {w.pros && <div><h3>Good</h3><ul>{lines(w.pros)}</ul></div>}
          {w.cons && <div><h3>Watch out for</h3><ul>{lines(w.cons)}</ul></div>}
        </div>}
        {w.notes && <div className="section"><h3>Notes</h3><p>{w.notes}</p></div>}
        {w.links.length > 0 && <div className="section links"><h3>Links</h3>{w.links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener">{l.label || l.url}</a>)}</div>}
        <div className="section" style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => update(s => { s.wrist.watchId = w.id; s.tab = 'wrist'; })}>See on the wrist</button>
          <button className="btn" onClick={() => update(s => { s.compare = s.compare.includes(w.id) ? s.compare.filter(x => x !== w.id) : [...s.compare, w.id]; })}>
            {state.compare.includes(w.id) ? 'Remove from compare' : 'Add to compare'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The price in the chosen currency, where it comes from, and the maker's RRP when an older saved price is shown instead. */
function Price({ w }: { w: Watch }) {
  const { state } = useStore();
  const shown = shownPrice(w, state.currency);
  const rrp = w.priceAUD != null ? rrpIn(w.prices, state.currency) : undefined;
  // Shows how the price has moved since release, unless the launch price is already the one shown.
  const launch = launchIn(w.prices, state.currency);
  const showLaunch = launch && launch.price !== (rrp ?? shown)?.price;
  if (!shown) return <div className="price">No verified price<small>{w.priceNote}</small></div>;
  return (
    <div className="price">
      {fmtShown(shown)}
      <small>{shown.price ? <a href={shown.price.source} target="_blank" rel="noopener">{shown.label}</a> : shown.label}</small>
      {rrp && <small className="rrp">RRP {fmtShown(rrp)}: {rrp.label}</small>}
      {showLaunch && <small className="rrp">At launch: {fmtShown(launch)} <span title={launch.label}>({launch.price!.effective?.slice(0, 4) ?? launch.label})</span></small>}
      {w.priceNote && <small className="rrp">{w.priceNote}</small>}
    </div>
  );
}

/** What the glow in the dark is based on, so a guessed colour isn't taken as fact. */
function lumeCaption(n?: Night) {
  if (!n) return 'No lume information yet, so nothing glows.';
  if (!n.parts.length) return 'This watch has no lume, so nothing glows.';
  const what = n.material ? `${n.material} lume` : 'Lume';
  return n.certainty === 'documented' ? `${what} in its documented glow colour.` : `${what}; glow colour ${n.certainty === 'likely' ? 'based on the material, not confirmed for this watch' : 'not confirmed'}.`;
}
