import { l2l } from '../lib/util';
import { wristMetrics, wristSVG } from '../render/wrist';
import type { Watch } from '../store/types';
import { useStore } from '../store/useStore';
import { CmInput, Svg } from './common';
import { StrapPicker } from './StrapPicker';

export function WristView() {
  const { state, watches, byId, update } = useStore();
  const { lighting } = state;
  const w = byId(state.wrist.watchId) || byId(state.selectedId);
  const outline = byId(state.wrist.outlineId);
  // A watch outlined over itself would just look like a drawing glitch.
  const ghostFor = (x: Watch) => (outline && outline.id !== x.id ? outline : undefined);
  const cm = state.wrist.cm || 17;
  if (!w) return <p className="empty">Pick a watch in the list to see it on the wrist.</p>;

  const g = ghostFor(w);
  const byName = (a: Watch, b: Watch) => a.brand.localeCompare(b.brand) || a.ref.localeCompare(b.ref);
  const owned = watches.filter(x => x.owned).sort(byName), others = watches.filter(x => !x.owned).sort(byName);
  const option = (x: Watch) => <option key={x.id} value={x.id}>{x.brand} {x.ref}</option>;
  const { flat } = wristMetrics(cm), over = l2l(w) - flat;
  const verdict = over <= -2
    ? <><b>Sits inside the flat top</b> of a {cm} cm wrist with about {(-over).toFixed(1)} mm to spare.</>
    : over <= 1.5
      ? <><b>Right at the edge</b> of the flat top. Lugs should just reach where the wrist starts to curve, which is about as big as you'd want.</>
      : <><b>Lugs go {over.toFixed(1)} mm past the flat top</b>, so the ends may sit off the wrist edges. Trying one on beats this guess, especially for cushion cases.</>;
  const cmp = state.compare.map(byId).filter((x): x is Watch => !!x);

  return <>
    <div className="wrist-ctrl">
      <label>Watch <select value={w.id} onChange={e => { const v = e.target.value; update(s => { s.wrist.watchId = v; }); }}>
        {watches.map(x => <option key={x.id} value={x.id}>{x.ref} · {x.model}</option>)}
      </select></label>
      <label>Wrist <CmInput /> cm</label>
      <label>Outline <select value={outline?.id ?? ''} onChange={e => { const v = e.target.value; update(s => { s.wrist.outlineId = v; }); }}>
        <option value="">None</option>
        {owned.length > 0 && <optgroup label="Watches you own">{owned.map(option)}</optgroup>}
        <optgroup label={owned.length ? 'Other watches' : 'All watches'}>{others.map(option)}</optgroup>
      </select></label>
    </div>
    <StrapPicker w={w} compact />
    <Svg className={`wrist-stage ${lighting !== 'day' ? 'after-dark' : ''}`} html={wristSVG(w, cm, g, { lighting })} />
    <p className="verdict">{verdict} {g ? `The red outline is ${g.owned ? 'your' : 'the'} ${g.ref} for reference.` : outline ? `The outline is the ${outline.ref} itself, so it isn't drawn.` : ''}{' '}
      <span className="est">Looking down at your left wrist. Flat top is a rule of thumb, roughly 29% of wrist circumference.</span></p>
    {cmp.length > 1 && <>
      <h3 style={{ fontSize: 14, margin: '24px 0 0' }}>Everything you're comparing, on the same wrist</h3>
      <div className="mini-wrists">{cmp.map(x => (
        <div className={`wrist-stage ${lighting !== 'day' ? 'after-dark' : ''}`} key={x.id} onClick={() => { update(s => { s.wrist.watchId = x.id; }); document.querySelector('.view')?.scrollTo({ top: 0 }); }}>
          <div className="lbl">{x.ref} <span>{l2l(x)} mm lug to lug</span></div>
          <Svg html={wristSVG(x, cm, ghostFor(x), { left: 42, right: 48, top: 40, bottom: 40, lighting })} />
        </div>
      ))}</div>
    </>}
  </>;
}
