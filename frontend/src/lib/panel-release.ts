export const PANEL_REPO_URL = 'https://github.com/huangxida/3x-ui';
export const PANEL_RELEASES_URL = `${PANEL_REPO_URL}/releases`;

export function formatPanelVersionTag(version: string): string {
  const value = version.trim();
  if (!value || value === '?') return value || '?';
  if (value.startsWith('v')) return value;
  if (/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(value)) return `v${value}`;
  return value;
}

export function getPanelReleaseUrl(version: string): string {
  const label = formatPanelVersionTag(version);
  if (!label || label === '?') return PANEL_RELEASES_URL;
  return `${PANEL_RELEASES_URL}/tag/${encodeURIComponent(label)}`;
}
