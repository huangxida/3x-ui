import { describe, it, expect } from 'vitest';

import { formatPanelVersionTag, getPanelReleaseUrl } from '@/lib/panel-release';
import { formatPanelVersion, isPanelUpdateAvailable } from '@/lib/panel-version';

// Parity with web/service/panel.go isNewerVersion.
describe('isPanelUpdateAvailable', () => {
  it('flags a strictly newer latest', () => {
    expect(isPanelUpdateAvailable('2.6.5', '2.6.4')).toBe(true);
    expect(isPanelUpdateAvailable('v2.7.0', 'v2.6.9')).toBe(true);
    expect(isPanelUpdateAvailable('3.0.0', '2.9.9')).toBe(true);
  });

  it('returns false when equal or the node is ahead', () => {
    expect(isPanelUpdateAvailable('2.6.4', '2.6.4')).toBe(false);
    expect(isPanelUpdateAvailable('v2.6.4', '2.6.4')).toBe(false);
    expect(isPanelUpdateAvailable('2.6.4', '2.6.5')).toBe(false);
  });

  it('ignores a leading v on either side', () => {
    expect(isPanelUpdateAvailable('v2.6.5', '2.6.4')).toBe(true);
    expect(isPanelUpdateAvailable('2.6.5', 'v2.6.4')).toBe(true);
  });

  it('never flags when a version is unknown', () => {
    expect(isPanelUpdateAvailable('', '2.6.4')).toBe(false);
    expect(isPanelUpdateAvailable('2.6.5', '')).toBe(false);
  });

  it('falls back to string inequality for non-semver tags', () => {
    expect(isPanelUpdateAvailable('nightly-2', 'nightly-1')).toBe(true);
    expect(isPanelUpdateAvailable('nightly-1', 'nightly-1')).toBe(false);
  });
});

describe('panel release links', () => {
  it('formats semantic versions as fork release tags', () => {
    expect(formatPanelVersionTag('2.9.0')).toBe('v2.9.0');
    expect(formatPanelVersionTag('v2.9.0')).toBe('v2.9.0');
  });

  it('keeps non-semver release tags intact', () => {
    expect(formatPanelVersionTag('nightly-1')).toBe('nightly-1');
    expect(formatPanelVersionTag('?')).toBe('?');
  });

  it('builds release URLs for the fork repository', () => {
    expect(getPanelReleaseUrl('2.9.0')).toBe('https://github.com/huangxida/3x-ui/releases/tag/v2.9.0');
    expect(getPanelReleaseUrl('?')).toBe('https://github.com/huangxida/3x-ui/releases');
  });
});

describe('formatPanelVersion', () => {
  it('adds a single v prefix to bare semantic versions', () => {
    expect(formatPanelVersion('3.4.0')).toBe('v3.4.0');
    expect(formatPanelVersion('2.6.5')).toBe('v2.6.5');
  });

  it('does not double up the v on already-prefixed tags', () => {
    expect(formatPanelVersion('v3.4.0')).toBe('v3.4.0');
    expect(formatPanelVersion('V3.4.0')).toBe('v3.4.0');
  });

  it('shows dev builds verbatim without a v prefix', () => {
    expect(formatPanelVersion('dev+1a2b3c4d')).toBe('dev+1a2b3c4d');
    expect(formatPanelVersion('dev')).toBe('dev');
  });

  it('returns empty for blank input and leaves unknown markers untouched', () => {
    expect(formatPanelVersion('')).toBe('');
    expect(formatPanelVersion(undefined)).toBe('');
    expect(formatPanelVersion('?')).toBe('?');
  });
});
