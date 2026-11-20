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
