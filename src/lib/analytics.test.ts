import { afterEach, describe, expect, test, vi } from 'vitest';
import { analyticsEnabled } from './analytics';

describe('analytics', () => {
  afterEach(() => vi.unstubAllEnvs());
  test('stays off without both settings', () => {
    expect(analyticsEnabled('wristcheck.example')).toBe(false);
    vi.stubEnv('VITE_CF_ANALYTICS_TOKEN', 'abc');
    expect(analyticsEnabled('wristcheck.example')).toBe(false);
  });
  test('runs only on the production hostname, never on previews or localhost', () => {
    vi.stubEnv('VITE_CF_ANALYTICS_TOKEN', 'abc');
    vi.stubEnv('VITE_ANALYTICS_HOST', 'wristcheck.example');
    expect(analyticsEnabled('wristcheck.example')).toBe(true);
    for (const h of ['localhost', '127.0.0.1', 'wrist-check-git-branch-mateusz.vercel.app', 'www.wristcheck.example']) expect(analyticsEnabled(h), h).toBe(false);
  });
});
