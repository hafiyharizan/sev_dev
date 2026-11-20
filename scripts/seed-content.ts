// Loads today's posts/links and the November 2026 schedule into a Supabase project.
//   npm run seed:content -- --dry-run     (no network, prints what it would do)
//   npm run seed:content                  (needs .env.local with the service-role key; Node >= 22.18)
// Run supabase/migrations/0001_init.sql and supabase/seed.sql first. Refuses to run twice.
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SEED_LINKS, SEED_POSTS, SEED_SPEAKERS, novemberSessions, uploadExt } from '../lib/seed/content.ts';
import { sessionSlug } from '../lib/slug.ts';

const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;
const sessions = novemberSessions();

if (process.argv.includes('--dry-run')) {
  console.log(`Would upload ${SEED_POSTS.filter((p) => p.imageFile).length} images and insert:`);
  console.log(`  ${SEED_POSTS.length} posts, ${SEED_LINKS.length} links, ${SEED_SPEAKERS.length} speakers, ${sessions.length} sessions`);
  process.exit(0);
}

async function main() {
  try {
    process.loadEnvFile('.env.local');
  } catch {
    // no .env.local: rely on the real environment
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).');
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  function fail(message: string, error?: unknown): never {
    console.error(message, error ?? '');
    process.exit(1);
  }

  const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) fail('The posts table is not empty. Refusing to seed twice.');

  const { data: types } = await supabase.from('program_types').select('id, name');
  const typeId = new Map((types ?? []).map((t: { id: string; name: string }) => [t.name, t.id]));
  if (typeId.size === 0) fail('No program types found. Run supabase/seed.sql first.');

  async function upload(table: string, file: string): Promise<string> {
    const ext = uploadExt(file);
    const storagePath = `uploads/${table}/${crypto.randomUUID()}.${ext}`;
    const body = fs.readFileSync(path.join('public', file));
    const { error } = await supabase.storage.from('media').upload(storagePath, body, { contentType: MIME[ext], cacheControl: '31536000' });
    if (error) fail(`Upload failed for ${file}`, error);
    return storagePath;
  }

  for (const p of SEED_POSTS) {
    const { error } = await supabase.from('posts').insert({
      type: p.type, slug: p.slug, title: p.title, subtitle: p.subtitle, body: p.body,
      image_path: p.imageFile ? await upload('posts', p.imageFile) : null,
      external_url: p.externalUrl, published_at: p.publishedAt, pinned: p.pinned,
    });
    if (error) fail(`Could not insert post ${p.slug}`, error);
  }
  console.log(`posts: ${SEED_POSTS.length}`);

  const { error: linkError } = await supabase.from('links').insert(SEED_LINKS.map((l, i) => ({ ...l, sort_order: i })));
  if (linkError) fail('Could not insert links', linkError);
  console.log(`links: ${SEED_LINKS.length}`);

  const { data: speakers, error: speakerError } = await supabase.from('speakers').insert(SEED_SPEAKERS.map((name) => ({ name }))).select('id, name');
  if (speakerError) fail('Could not insert speakers', speakerError);
  const speakerId = new Map((speakers ?? []).map((s: { id: string; name: string }) => [s.name, s.id]));

  const taken = new Set<string>();
  const rows = sessions.map((s) => {
    let slug = sessionSlug(s.date, s.topic || s.typeName);
    for (let n = 2; taken.has(slug); n++) slug = `${sessionSlug(s.date, s.topic || s.typeName)}-${n}`;
    taken.add(slug);
    const program_type_id = typeId.get(s.typeName);
    if (!program_type_id) fail(`Program type missing: ${s.typeName}`);
    return {
      date: s.date, program_type_id, speaker_id: s.speaker ? speakerId.get(s.speaker) ?? null : null,
      topic: s.topic, kitab: s.kitab, slug, status: 'scheduled',
    };
  });
  const { error: sessionError } = await supabase.from('sessions').insert(rows);
  if (sessionError) fail('Could not insert sessions', sessionError);
  console.log(`sessions: ${rows.length}`);
  console.log('Done. Ask the AJK to add the ustaz photos and check the names.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
