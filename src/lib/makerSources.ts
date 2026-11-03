/**
 * Watch links and price citations on the site lead only to the makers themselves (see "Links to makers" in
 * docs/pricing-standard.md). These are the domains each brand's maker owns and runs, checked against each site's own
 * operator notice, not guessed from the name: an official distributor's or authorised dealer's shop isn't the maker.
 * A subdomain counts as its domain. A brand that isn't listed has no official domains yet, so none of its links pass.
 */
export const MAKER_DOMAINS: Record<string, readonly string[]> = {
  Baltic: ['baltic-watches.com'],
  Casio: ['casio.com'],
  'Christopher Ward': ['christopherward.com'],
  Hamilton: ['hamiltonwatch.com'],
  Omega: ['omegawatches.com', 'omegawatches.cn'],
  Oris: ['oris.ch'],
  Rolex: ['rolex.com'],
  // Seiko's own regional shops: Seiko Watch of America and Seiko Watch Corporation's Australian boutique.
  Seiko: ['seikowatches.com', 'seikousa.com', 'seikoboutique.com.au'],
  Serica: ['serica-watches.com'],
  Tudor: ['tudorwatch.com'],
};

const ARCHIVE = /^https?:\/\/web\.archive\.org\/web\/[^/]+\/(.+)$/;

/** The page an Internet Archive capture is of, or the address itself when it isn't a capture. */
export function archivedPage(url: string) {
  const m = url.match(ARCHIVE);
  return m ? m[1].replace(/^(https?:\/)([^/])/, '$1/$2') : url;
}

/** True when the address, or the page a Wayback Machine capture is of, is on one of this brand's maker domains. */
export function isMakerUrl(brand: string, url: string) {
  let host: string;
  try {
    const u = new URL(archivedPage(url));
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    host = u.hostname.toLowerCase();
  } catch {
    return false;
  }
  return (MAKER_DOMAINS[brand] ?? []).some(d => host === d || host.endsWith('.' + d));
}
