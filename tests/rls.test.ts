import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';

// Real Supabase provides roles, auth.uid() and the storage schema. We stub just
// enough of them so the real migration + seed run unchanged in-process.
const STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean default false,
    file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets(id), name text, owner uuid);
  alter table storage.objects enable row level security;
  grant usage on schema public, storage to anon, authenticated;
  grant all on all tables in schema storage to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
`;

const root = path.resolve(__dirname, '..');
const migration = () => fs.readFileSync(path.join(root, 'supabase/migrations/0001_init.sql'), 'utf8');
const seed = () => fs.readFileSync(path.join(root, 'supabase/seed.sql'), 'utf8');

let db: PGlite;

async function as<T>(role: 'anon' | 'authenticated', fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec('reset role');
  }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(STUBS);
  await db.exec(migration());
  await db.exec(`insert into public.posts (type, slug, title) values ('pengumuman', 'seed-post', 'Seed');`);
  await db.exec(`insert into public.invites (id, code) values (1, 'SECRET') on conflict (id) do update set code = 'SECRET';`);
});

describe('row level security', () => {
  it('anon can read posts', async () => {
    const r = await as('anon', () => db.query('select slug from public.posts'));
    expect(r.rows).toEqual([{ slug: 'seed-post' }]);
  });

  it('anon cannot insert posts', async () => {
    await expect(
      as('anon', () => db.query(`insert into public.posts (type, slug, title) values ('pengumuman', 'x', 'x')`)),
    ).rejects.toThrow(/row-level security|permission denied/);
  });

  it('authenticated can insert posts', async () => {
    await as('authenticated', () =>
      db.query(`insert into public.posts (type, slug, title) values ('buletin', 'auth-post', 'Auth')`),
    );
    const r = await db.query(`select 1 from public.posts where slug = 'auth-post'`);
    expect(r.rows).toHaveLength(1);
  });

  it('anon cannot read invites', async () => {
    const r = await as('anon', () => db.query('select * from public.invites'));
    expect(r.rows).toHaveLength(0);
  });

  it('authenticated cannot read invites either', async () => {
    const r = await as('authenticated', () => db.query('select * from public.invites'));
    expect(r.rows).toHaveLength(0);
  });

  it('anon cannot insert analytics_events', async () => {
    await expect(
      as('anon', () => db.query(`insert into public.analytics_events (type, path) values ('qr_scan', '/')`)),
    ).rejects.toThrow(/row-level security|permission denied/);
  });

  it('authenticated cannot write prayer_times (cron only)', async () => {
    await expect(
      as('authenticated', () =>
        db.query(
          `insert into public.prayer_times (date, imsak, subuh, syuruk, zohor, asar, maghrib, isyak, zone)
           values ('2026-11-01','05:40','05:50','07:00','13:10','16:20','19:10','20:20','SGR01')`,
        ),
      ),
    ).rejects.toThrow(/row-level security|permission denied/);
  });

  it('anon cannot upload to the media bucket, authenticated can', async () => {
    await expect(
      as('anon', () => db.query(`insert into storage.objects (bucket_id, name) values ('media', 'a.webp')`)),
    ).rejects.toThrow(/row-level security|permission denied/);
    await as('authenticated', () =>
      db.query(`insert into storage.objects (bucket_id, name) values ('media', 'b.webp')`),
    );
  });
});

describe('constraints and seed', () => {
  it('rejects a javascript: url in links', async () => {
    await expect(
      db.query(`insert into public.links (title, url) values ('Bad', 'javascript:alert(1)')`),
    ).rejects.toThrow(/check constraint/);
  });

  it('the media bucket is public and limited to 10MB images/pdf', async () => {
    const r = await db.query<{ public: boolean; file_size_limit: string }>(
      `select public, file_size_limit from storage.buckets where id = 'media'`,
    );
    expect(r.rows[0].public).toBe(true);
    expect(Number(r.rows[0].file_size_limit)).toBe(10485760);
  });

  it('seed loads five program types and the base settings', async () => {
    await db.exec(seed());
    const types = await db.query<{ name: string }>('select name from public.program_types order by sort_order');
    expect(types.rows.map((t) => t.name)).toEqual([
      'Kuliah Maghrib',
      'Kuliah Subuh',
      'Yassin / Tahlil / Doa Selamat',
      'Si Cilik Mengaji',
      'Kuliah Dhuha',
    ]);
    const s = await db.query<{ value: unknown }>(`select value from public.settings where key = 'prayer_zone'`);
    expect(s.rows[0].value).toBe('SGR01');
  });
});
