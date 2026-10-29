import type { CSSProperties, MouseEvent } from 'react';
import { watchPath } from '../lib/route';
import { watchSVG } from '../render/watch';
import type { Watch } from '../store/types';
import { useStore } from '../store/useStore';
import { Svg } from './common';

/** Every watch in the box shares one scale, so sizes compare honestly. Pixels per mm. */
const BOX_SCALE = 3.6;

const byName = (a: Watch, b: Watch) => a.brand.localeCompare(b.brand) || a.ref.localeCompare(b.ref, undefined, { numeric: true });

/**
 * The visitor's owned watches, laid out in a watch box. Ownership is set on each watch's details; this screen only
 * arranges them. Owned watches not in a slot wait in a tray, so a full box never hides one.
 */
export function OwnedView() {
  const { state, watches, update } = useStore();
  const owned = watches.filter(w => w.owned).sort(byName);
  const box = state.boxes[0];
  const placed = new Set(state.boxes.flatMap(b => b.slots));
  const loose = owned.filter(w => !placed.has(w.id));
  const full = !box.slots.includes(null);
  const byId = (id: string) => owned.find(w => w.id === id);

  const place = (id: string, slot = box.slots.indexOf(null)) => update(s => { if (slot >= 0) s.boxes[0].slots[slot] = id; });
  const takeOut = (id: string) => update(s => { for (const b of s.boxes) b.slots = b.slots.map(x => (x === id ? null : x)); });
  // Plain clicks open the watch in the app; modifier and middle clicks are left to the browser.
  const open = (e: MouseEvent, id: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    update(s => { s.selectedId = id; s.wrist.watchId = id; s.tab = 'detail'; });
  };

  return (
    <div className="owned">
      <div className="owned-head">
        <h2>{box.name}</h2>
        <span className="owned-count">{owned.length ? `${owned.length} owned · ${owned.length - loose.length} in the box` : 'Nothing marked as owned yet'}</span>
      </div>

      {!owned.length && (
        <div className="owned-empty">
          <p>Own any of these watches? Open one and press the watch icon next to its name. It'll appear here, ready to place in your box. Browsing works just the same without it.</p>
          <button type="button" className="btn" onClick={() => update(s => { s.tab = 'detail'; })}>Browse watches</button>
        </div>
      )}

      <ol className={`watch-box ${state.lighting !== 'day' ? 'after-dark' : ''}`} aria-label={`${box.name}, ${box.slots.length} slots`}
        style={{ '--cols': box.slots.length > 6 ? 4 : 3 } as CSSProperties}>
        {box.slots.map((id, i) => {
          const w = id ? byId(id) : undefined;
          return (
            <li key={i} className={`slot ${w ? '' : 'empty'}`} aria-label={`Slot ${i + 1}: ${w ? `${w.brand} ${w.ref}` : 'empty'}`}>
              {/* The cushion is shorter than any watch with its strap, so a placed watch's strap covers its ends. */}
              <span className="mount">
                <span className="cushion" aria-hidden="true" />
                {w && (
                  <a className="slot-watch" href={watchPath(w.id)} onClick={e => open(e, w.id)} title={`${w.brand} ${w.ref}`}>
                    <Svg className="box-watch" html={watchSVG(w, BOX_SCALE, { strapLen: 5, lighting: state.lighting })} />
                    <span className="sr">{`${w.brand} ${w.ref}`}</span>
                  </a>
                )}
              </span>
              <span className="slot-foot">
                {w ? (
                  <button type="button" className="slot-out" onClick={() => takeOut(w.id)} aria-label={`Take the ${w.ref} out of the box`} title="Take out of the box">Take out</button>
                ) : loose.length > 0 && (
                  <select className="slot-pick" value="" aria-label={`Put a watch in slot ${i + 1}`} onChange={e => e.target.value && place(e.target.value, i)}>
                    <option value="">Add a watch…</option>
                    {loose.map(l => <option key={l.id} value={l.id}>{l.brand} {l.ref}</option>)}
                  </select>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {loose.length > 0 && (
        <section className="tray" aria-labelledby="tray-title">
          <h3 id="tray-title">Not in the box</h3>
          {full && <p className="hint">The box is full. Take a watch out to make room.</p>}
          <ul>
            {loose.map(w => (
              <li key={w.id}>
                <a className="tray-watch" href={watchPath(w.id)} onClick={e => open(e, w.id)}>
                  <Svg className="thumb" html={watchSVG(w, 1, { strapLen: 3, lighting: state.lighting }).replace(/ width="[^"]*" height="[^"]*"/, ' width="44" height="52"')} />
                  <span><b>{w.ref}</b><span className="muted">{w.brand} {w.model}</span></span>
                </a>
                <button type="button" className="btn" disabled={full} onClick={() => place(w.id)}>Put in the box</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="hint owned-note">Your owned watches and box are saved in this browser only. Clearing your browser data removes them, and they don't sync to other devices.</p>
    </div>
  );
}
