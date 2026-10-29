import { useEffect, useId, useRef } from 'react';
import { analyticsEnabled } from '../lib/analytics';

/** What the site stores and sends, matching how this build is actually set up. */
export function Privacy({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); }, [open]);
  const measured = analyticsEnabled();
  // The footer appears twice (sidebar and page end), so each copy's dialog needs its own heading id.
  const title = useId();

  return (
    <dialog ref={dialog} onClose={onClose} className="settings privacy" aria-labelledby={title}>
      <form method="dialog" className="form">
        <div className="modal-head"><h2 id={title}>PRIVACY</h2><button className="btn ghost" value="close">Done</button></div>
        <div className="settings-body">
          <h3>Your watches and settings stay in this browser</h3>
          <p>
            Watches you own, your watch box, your settings and other choices are saved in this browser's local storage. They're never
            sent to us or anyone else, they don't sync to other devices, and clearing your browser data removes them. Addresses you
            share, like a watch's link, contain nothing personal.
          </p>
          <h3>Visit statistics</h3>
          {measured ? (
            <p>
              We count visits with <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer">Cloudflare Web Analytics<span className="sr"> (opens in a new tab)</span></a> to
              see whether the site is useful. It records which pages are viewed, the site you came from, your country, browser and
              device type, and how quickly pages load. The results are totals, not profiles of anyone. Cloudflare says it uses no
              cookies or local storage for this and doesn't fingerprint visitors. Your saved watches and settings are never included.
              If you block it, the site works just the same.
            </p>
          ) : <p>This version of the site doesn't measure visits.</p>}
          <h3>Other services</h3>
          <p>
            The site's fonts load from Google Fonts, so your browser contacts Google to fetch them. Links to GitHub and X take you to
            those sites, which have their own privacy policies.
          </p>
        </div>
      </form>
    </dialog>
  );
}
