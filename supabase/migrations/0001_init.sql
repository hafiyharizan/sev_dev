-- Surau Elmina Valley: initial schema (design spec section 7)

create function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- content tables ----------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('pengumuman', 'buletin')),
  slug text not null unique,
  title varchar(200) not null,
  subtitle varchar(200),
  body text,
  image_path text,
  external_url varchar(500) check (external_url is null or external_url ~ '^(https?://|/)'),
  published_at timestamptz not null default now(),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_published_at_idx on public.posts (published_at desc);

create table public.program_types (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  colour text not null check (colour ~ '^#[0-9A-Fa-f]{6}$'),
  sort_order integer not null default 0,
  time_mode text not null check (time_mode in ('prayer', 'fixed')),
  anchor_prayer text check (anchor_prayer in ('subuh', 'zohor', 'asar', 'maghrib', 'isyak')),
  offset_minutes integer not null default 0,
  fixed_time text check (fixed_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  default_duration_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (time_mode = 'prayer' and anchor_prayer is not null) or
    (time_mode = 'fixed' and fixed_time is not null)
  )
);

create table public.speakers (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  title_line varchar(200),
  photo_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  program_type_id uuid not null references public.program_types (id) on delete restrict,
  speaker_id uuid references public.speakers (id) on delete set null,
  topic varchar(200),
  kitab varchar(200),
  notes text,
  slug text not null unique,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  -- optional timing override; null = use the program type's default
  time_mode text check (time_mode in ('prayer', 'fixed')),
  anchor_prayer text check (anchor_prayer in ('subuh', 'zohor', 'asar', 'maghrib', 'isyak')),
  offset_minutes integer,
  fixed_time text check (fixed_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sessions_date_idx on public.sessions (date);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  url varchar(500) not null check (url ~ '^(https?://|/)'),
  description varchar(500),
  category text not null default 'Umum'
    check (category in ('Borang', 'Dokumen', 'Program', 'Sumbangan', 'Media', 'Umum')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.prayer_times (
  date date primary key,
  imsak text not null check (imsak ~ '^[0-2][0-9]:[0-5][0-9]$'),
  subuh text not null check (subuh ~ '^[0-2][0-9]:[0-5][0-9]$'),
  syuruk text not null check (syuruk ~ '^[0-2][0-9]:[0-5][0-9]$'),
  zohor text not null check (zohor ~ '^[0-2][0-9]:[0-5][0-9]$'),
  asar text not null check (asar ~ '^[0-2][0-9]:[0-5][0-9]$'),
  maghrib text not null check (maghrib ~ '^[0-2][0-9]:[0-5][0-9]$'),
  isyak text not null check (isyak ~ '^[0-2][0-9]:[0-5][0-9]$'),
  zone text not null,
  fetched_at timestamptz not null default now()
);

-- ---------- server-only tables (no client policies) ----------

create table public.invites (
  id integer primary key default 1 check (id = 1),
  code text,
  expires_at timestamptz
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  type text not null check (type in ('qr_scan', 'pwa_install', 'share_click')),
  path text not null check (char_length(path) <= 300),
  created_at timestamptz not null default now()
);

-- ---------- updated_at triggers ----------

do $$
declare t text;
begin
  foreach t in array array['posts', 'program_types', 'speakers', 'sessions', 'links', 'settings'] loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- RLS ----------
-- Content tables: everyone reads; any logged-in user (every Supabase user is an admin) writes.

do $$
declare t text;
begin
  foreach t in array array['posts', 'program_types', 'speakers', 'sessions', 'links', 'settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admins write" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- prayer_times: read-only for clients; only the cron (service role, bypasses RLS) writes.
alter table public.prayer_times enable row level security;
create policy "public read" on public.prayer_times for select to anon, authenticated using (true);

-- invites and analytics_events: RLS on, deliberately NO policies. Service role only.
alter table public.invites enable row level security;
alter table public.analytics_events enable row level security;

-- ---------- storage ----------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy "media public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
create policy "media admins insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "media admins update" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
create policy "media admins delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
