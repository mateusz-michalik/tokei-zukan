/** Where the project lives and who made it. Shared by the footer and the watch-request links. */
export const REPO_URL = 'https://github.com/mateusz-michalik/tokei-zukan';
export const CREATOR = { handle: '@MudMilchek', url: 'https://x.com/MudMilchek' };

/**
 * GitHub's watch-request form (.github/ISSUE_TEMPLATE/watch-request.yml). An optional search term pre-fills the title;
 * the visitor still reviews and submits it on GitHub, which needs a free GitHub account.
 */
export function watchRequestUrl(search?: string) {
  const q = new URLSearchParams({ template: 'watch-request.yml' });
  if (search?.trim()) q.set('title', `Watch request: ${search.trim()}`);
  return `${REPO_URL}/issues/new?${q}`;
}
