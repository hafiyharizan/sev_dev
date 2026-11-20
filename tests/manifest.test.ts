import { describe, it, expect } from 'vitest';
import manifest from '@/app/manifest';

describe('web app manifest', () => {
  const m = manifest();

  it('installs as a standalone app that opens on the home page with the pwa source tag', () => {
    expect(m.name).toBe('Surau Elmina Valley');
    expect(m.short_name).toBe('SEV');
    expect(m.start_url).toBe('/?src=pwa');
    expect(m.display).toBe('standalone');
    expect(m.lang).toBe('ms');
    expect(m.theme_color).toBe('#00224A');
  });

  it('ships 192, 512 and maskable icons', () => {
    const icons = m.icons ?? [];
    expect(icons.some((i) => i.sizes === '192x192' && i.purpose !== 'maskable')).toBe(true);
    expect(icons.some((i) => i.sizes === '512x512' && i.purpose !== 'maskable')).toBe(true);
    expect(icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true);
  });
});
