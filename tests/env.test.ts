import { describe, it, expect, afterEach } from 'vitest';
import { supabaseUrl, serviceRoleKey } from '@/lib/env';

const saved = { ...process.env };
afterEach(() => { process.env = { ...saved }; });

describe('env', () => {
  it('names the missing variable', () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => serviceRoleKey()).toThrow('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('returns the value when set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    expect(supabaseUrl()).toBe('https://abc.supabase.co');
  });
});
