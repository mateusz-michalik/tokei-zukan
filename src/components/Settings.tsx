import { useEffect, useRef } from 'react';
import { CURRENCY_NAMES, ratesDate, ratesSource, type DisplayCurrency } from '../lib/price';
import { THEMES, type Theme } from '../lib/theme';
import { useStore } from '../store/useStore';
import { CmInput } from './common';

/** Personal settings. Every change saves straight away, in this browser only. */
export function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, watches, refWatch, update } = useStore();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);

  const owned = watches.filter(w => w.owned);
  // Watches you own first, as the likeliest references.
  const byOwned = [...watches].sort((a, b) => Number(!!b.owned) - Number(!!a.owned) || a.brand.localeCompare(b.brand) || a.ref.localeCompare(b.ref));

  return (
    <dialog ref={dialog} onClose={onClose} className="settings">
      <form method="dialog" className="form">
        <div className="modal-head"><h2>SETTINGS</h2><button className="btn ghost" value="close">Done</button></div>
        <div className="settings-body">
          <fieldset>
            <legend>Your wrist</legend>
            <label className="inline">Circumference <span><CmInput /> cm</span></label>
            <p className="hint">Measure just above the wrist bone with a strip of paper or a tape measure.</p>
          </fieldset>

          <fieldset>
            <legend>Interface</legend>
            <select value={state.theme} onChange={e => { const v = e.target.value as Theme; update(s => { s.theme = v; }); }}>
              {THEMES.map(([t, label]) => <option key={t} value={t}>{label}</option>)}
            </select>
            <p className="hint">Light or dark pages. How the watches are lit, from day to night with their lume glowing, is set by Lighting at the top of the list.</p>
          </fieldset>

          <fieldset>
            <legend>Watch hands</legend>
            <label className="check">
              <input type="checkbox" checked={state.liveTime} onChange={e => { const v = e.target.checked; update(s => { s.liveTime = v; }); }} />
              Live time: show this device's time
            </label>
            <p className="hint">
              Hands move like the real watch: quartz seconds tick, automatics sweep. Chronograph hands rest at zero, and GMT and
              24-hour hands show local time. With reduced motion turned on for this device, hands move once a minute. Off,
              each watch shows the time it was drawn at.
            </p>
          </fieldset>

          <fieldset>
            <legend>Show prices in</legend>
            <select value={state.currency} onChange={e => { const v = e.target.value as DisplayCurrency; update(s => { s.currency = v; }); }}>
              {Object.entries(CURRENCY_NAMES).map(([c, name]) => <option key={c} value={c}>{name} ({c})</option>)}
            </select>
            <p className="hint">
              Shows the maker's own price in that currency where there is one. Otherwise the price is converted at the{' '}
              <a href={ratesSource.url} target="_blank" rel="noopener">ECB reference rates</a> of {ratesDate} and marked ≈.
            </p>
          </fieldset>

          <fieldset>
            <legend>Compare sizes against</legend>
            <select value={state.referenceId} onChange={e => { const v = e.target.value; update(s => { s.referenceId = v; }); }}>
              <option value="">{owned.length ? `First watch you own (${owned[0].ref})` : 'First watch you own (none yet)'}</option>
              {byOwned.map(w => <option key={w.id} value={w.id}>{w.ref} · {w.model}{w.owned ? ' (owned)' : ''}</option>)}
            </select>
            <p className="hint">Size differences in Compare use this watch{refWatch ? `: currently ${refWatch.ref}` : ''}. Choose a wrist outline in On the wrist.</p>
          </fieldset>

          <p className="hint">Mark watches you own, or like, from their details page. These settings, likes and owned watches are saved in this browser only.</p>
        </div>
      </form>
    </dialog>
  );
}
