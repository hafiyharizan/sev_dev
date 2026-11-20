import { describe, it, expect } from 'vitest';
import { isPublicAdminPath } from '@/lib/admin-paths';

describe('isPublicAdminPath', () => {
  it('lets the login page and invite links through', () => {
    expect(isPublicAdminPath('/admin/login')).toBe(true);
    expect(isPublicAdminPath('/admin/jemput/abc123')).toBe(true);
  });

  it('protects every other admin path, including look-alikes', () => {
    expect(isPublicAdminPath('/admin')).toBe(false);
    expect(isPublicAdminPath('/admin/hebahan')).toBe(false);
    expect(isPublicAdminPath('/admin/loginx')).toBe(false);
    expect(isPublicAdminPath('/admin/jemputan')).toBe(false);
    expect(isPublicAdminPath('/admin/tetapan/jemputan')).toBe(false);
  });
});

import { safeAdminRedirect } from '@/lib/admin-paths';

describe('safeAdminRedirect', () => {
  it('keeps in-admin paths (with query)', () => {
    expect(safeAdminRedirect('/admin/hebahan')).toBe('/admin/hebahan');
    expect(safeAdminRedirect('/admin/jadual?bulan=2026-11')).toBe('/admin/jadual?bulan=2026-11');
    expect(safeAdminRedirect('/admin')).toBe('/admin');
  });

  it('falls back to /admin for anything that could leave the site or the admin area', () => {
    for (const bad of ['//evil.com', 'https://evil.com', '/\evil.com', '/administrator', '/hebahan', '', null, undefined]) {
      expect(safeAdminRedirect(bad as string | null | undefined)).toBe('/admin');
    }
  });
});
