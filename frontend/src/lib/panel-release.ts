export const PANEL_REPO_URL = 'https://github.com/W1tFzQq08pTv/3x-ui';
export const PANEL_RELEASES_URL = `${PANEL_REPO_URL}/releases`;

const DATE_RELEASE_TAG_RE = /^\d{4}\.\d{2}\.\d{2}$/;
const SEMVER_RELEASE_TAG_RE = /^\d+\.\d+\.\d+(?:[-+].*)?$/;

export function formatPanelVersionTag(version: string): string {
  const value = version.trim();
  if (!value || value === '?') return value || '?';
  if (DATE_RELEASE_TAG_RE.test(value)) return value;
  if (value.startsWith('v')) return value;
  if (SEMVER_RELEASE_TAG_RE.test(value)) return `v${value}`;
  return value;
}

export function getPanelReleaseUrl(version: string): string {
  const label = formatPanelVersionTag(version);
  if (!label || label === '?') return PANEL_RELEASES_URL;
  return `${PANEL_RELEASES_URL}/tag/${encodeURIComponent(label)}`;
}
