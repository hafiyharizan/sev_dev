# Surau Elmina Valley Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static SEV site into an installable PWA with prayer times, a poster-style kuliah schedule (plus a generated poster image), shareable announcements, forms/links, analytics, and a mobile-first AJK admin panel.

**Architecture:** The app stays as Next.js 14.2 App Router on Vercel Hobby. Supabase supplies Postgres (with RLS), Auth (6-digit email codes, sign-ups off) and Storage (`media` bucket).
- **Data access:** public pages are server components that read Supabase through a tagged `fetch`. Admin Server Actions write using the logged-in user's client, then call `revalidateTag`.
- **Pure logic** (time, month, poster model, invite, ICS) lives in `lib/` and is unit-tested with Vitest.

**Tech Stack:** Next.js 14.2, React 18, TypeScript, Tailwind 3, `@supabase/supabase-js`, `@supabase/ssr`, Supabase CLI, `next/og`, `motion`, `@serwist/next`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-20-surau-web-app-design.md`. Read it before starting any task. Section numbers below (§) refer to it.

## Global Constraints

- **Budget:** RM0. Vercel Hobby and Supabase Free only. Nothing may need a paid plan.
- **Language:** all UI text is in Bahasa Melayu; code and comments are in English.
- **Timezone:** always `Asia/Kuala_Lumpur` (UTC+8, no DST). Vercel servers run in UTC, so never use the server's local date for "today".
- **Package manager:** npm (keep `package-lock.json`; delete `yarn.lock` in Task 1).
- **Next.js:** stay on 14.2.x (no upgrade).
- **Environment:** no project URLs, keys or IDs in source. Everything comes from env vars, listed in `.env.example`.
- **Every admin Server Action and admin route handler** starts with `await requireUser()`.
- **The service-role key** is used only in `app/api/cron/daily`, `app/api/track`, and the invite accept/list actions. It must never be exposed to client code.
- **Deletes are permanent,** behind a confirm dialog ("Padam? Tindakan ini tidak boleh dibatalkan."), and also delete the attached Storage file.
- **Uploads:** resized in the browser to a longest side of 1600px (WebP, falling back to JPEG). The bucket allows JPEG/PNG/WebP/PDF, max 10MB.
- **Login codes** are 6-digit email OTPs, with expiry set to 10 minutes in Supabase Auth settings.
- **Invite links** expire 7 days after generation. Generating a new one replaces the old.
- **Old links** `/khairat`, `/siak` and `/tabung` must keep working (§11).
- **Animations** use `motion` via `LazyMotion` + `domAnimation` + `m`, are 150–300ms, are wrapped in `MotionConfig reducedMotion="user"`, and never delay content (§11).
- **Tap targets** are at least 44px. Admin layouts stack on phones.

## Review Focus

1. **Around midnight, "today" is UTC, not Malaysia time.** At 00:30 MYT the server's date is still yesterday. "Malam ini", the prayer widget and the schedule must use `todayMY()`. Tested in Task 3.
2. **Prayer times missing for a date** (sync failed, or a month boundary before the next month is fetched). Session times fall back to the label only ("Selepas Maghrib"), the widget shows "Waktu solat belum tersedia", and nothing crashes. Tested in Tasks 3 and 9.
3. **After Isyak,** the next prayer is tomorrow's Subuh, and the countdown must roll over rather than disappear. Tested in Task 3.
4. **Copying into a month without a 5th week** (and February / leap years). Those sessions are skipped and listed to the admin, never silently dropped or put on the wrong day. Tested in Task 3.
5. **A crowded poster day** (2+ sessions, long topic or ustaz name, a session with no speaker or photo). The text is shortened with an ellipsis, a placeholder replaces the missing photo, and the cell is flagged as crowded. Tested in Task 8.

---

## File Structure

```
lib/
  types.ts                 shared domain types
  time/clock.ts            toMinutes, addMinutes, formatTimeMY, todayMY, nowMinutesMY
  time/prayer.ts           iqamahTimes, nextPrayer
  time/session-time.ts     resolveTiming, sessionTimeLabel
  time/month.ts            weekdayPosition, dateForPosition, copyMonthDates, weekdaysInMonth, monthGrid
  slug.ts                  slugify, sessionSlug
  invite.ts                newInvite, checkInvite
  ics.ts                   buildIcs
  poster/model.ts          buildPosterModel, truncate
  prayer-source/jakim.ts   parseJakimMonth, fetchJakimMonth
  supabase/server.ts       createClient()          (cookie session, for admin)
  supabase/public.ts       createPublicClient(tags) (anon + tagged fetch, for public reads)
  supabase/service.ts      createServiceClient()   (service role, server-only)
  auth.ts                  requireUser()
  storage.ts               publicUrl, deleteFile
  cache-tags.ts            TAGS
  image/resize.ts          fitWithin (pure) + resizeImage (browser)
  data/*.ts                read queries per table (posts, sessions, prayer, links, settings, analytics)
supabase/
  config.toml, migrations/0001_init.sql, seed.sql
middleware.ts
app/
  (public pages) page.tsx, waktu-solat/, jadual/, jadual/[slug]/, jadual/[month]/poster.png/route.tsx,
  hebahan/, hebahan/[slug]/, borang/, siak/ (redirect), khairat/, tabung/ (unchanged)
  admin/ login/, jemput/[code]/, (panel)/layout.tsx, (panel)/page.tsx (dashboard),
         (panel)/hebahan/, (panel)/jadual/, (panel)/jadual/jenis/, (panel)/jadual/ustaz/,
         (panel)/borang/, (panel)/tetapan/, (panel)/tetapan/jemputan/
  api/cron/daily/route.ts, api/track/route.ts, jadual/[slug]/ics/route.ts
  components/ (new) BottomNav, PrayerWidget, SessionCard, PostCard, ShareButton, InstallPrompt,
                    OfflineBanner, MotionProvider, admin/* (ImageUpload, ConfirmDelete, forms)
  manifest.ts, sw.ts
tests/   mirrors lib/ (*.test.ts); tests/rls.test.ts (needs local Supabase)
```

---

### Task 1: Tooling, env, Supabase project skeleton

**Files:**
- Modify: `package.json`, `next.config.js`, `.gitignore`
- Create: `vitest.config.ts`, `.env.example`, `supabase/config.toml` (via `npx supabase init`), `tests/smoke.test.ts`
- Delete: `yarn.lock`

**Interfaces:**
- Produces: `npm test` (vitest run), `npm run typecheck` (`tsc --noEmit`), and the env var names used everywhere:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`.

- [ ] **Step 1:** Install the dependencies:
  - runtime: `@supabase/supabase-js @supabase/ssr motion @serwist/next`
  - dev: `vitest supabase serwist`
- [ ] **Step 2:** Add scripts: `"test": "vitest run"`, `"typecheck": "tsc --noEmit"`, `"db:types": "supabase gen types typescript --local > lib/database.types.ts"`. Then create `vitest.config.ts` (node environment, `@/` alias to the repo root).
- [ ] **Step 3:** Write `tests/smoke.test.ts`: `expect(1 + 1).toBe(2)`. Run `npm test`. Expected: 1 passed.
- [ ] **Step 4:** Run `npx supabase init`. Write `.env.example` with the five vars above and comments. Add `.env*.local` and `supabase/.temp` to `.gitignore`.
- [ ] **Step 5:** Run `npm run build`. Expected: the existing site still builds.
- [ ] **Step 6:** Commit: `chore: add vitest, supabase cli and env template`.

### Task 2: Database schema, RLS, storage bucket, base seed

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `supabase/seed.sql`, `tests/rls.test.ts`, `lib/database.types.ts` (generated)

**Interfaces:**
- Produces these tables (columns exactly as spec §7):
  - `posts`
  - `program_types`
  - `speakers`
  - `sessions`
  - `links`
  - `settings`: key text pk, value jsonb
  - `invites`: a single row (`id int pk check (id=1)`, `code text`, `expires_at timestamptz`)
  - `prayer_times`
  - `analytics_events`
- Produces the bucket `media`.

Builder note on the invite code: per §7 it must not be anon-readable. The `invites` table, with RLS enabled and **no** client policies, is that choice.

- [ ] **Step 1: Write the failing RLS test** in `tests/rls.test.ts`. Wrap it in `describe.skipIf(!process.env.SUPABASE_TEST_URL)`; it uses the local stack's anon key from env.
  - `anon can read posts`: `select` returns no error.
  - `anon cannot insert posts`: `insert({type:'pengumuman', slug:'x', title:'x'})` returns an error.
  - `anon cannot read invites`: `select` on `invites` returns 0 rows.
  - `anon cannot insert analytics_events`: an error is returned.
  - `anon cannot upload to media`: `storage.from('media').upload('t.txt', ...)` returns an error.
- [ ] **Step 2:** Run `npx supabase start`, then `SUPABASE_TEST_URL=http://127.0.0.1:54321 npm test -- rls`. Expected: FAIL (the tables don't exist yet).
- [ ] **Step 3: Write `0001_init.sql`:**
  - **Tables,** with:
    - `CHECK` constraints for: URL fields (`~ '^(https?://|/)'`), `posts.type in ('pengumuman','buletin')`, `program_types.time_mode in ('prayer','fixed')`, `anchor_prayer in ('subuh','zohor','asar','maghrib','isyak')`, `sessions.status in ('scheduled','cancelled')`, `links.category in ('Borang','Dokumen','Program','Sumbangan','Media','Umum')`, `analytics_events.type in ('qr_scan','pwa_install','share_click')`, and length limits (title 200, url 500).
    - Unique constraints on `posts.slug` and `sessions.slug`.
    - Indexes on `sessions(date)` and `posts(published_at desc)`.
  - **RLS:** enable on all tables.
    - Content tables (`posts`, `program_types`, `speakers`, `sessions`, `links`, `settings`, `prayer_times`): `select` to `anon, authenticated`; `insert/update/delete` to `authenticated`.
    - `invites` and `analytics_events`: no client policies.
  - **Storage:** insert the bucket `media` (public, `file_size_limit` 10485760, `allowed_mime_types` `{image/jpeg,image/png,image/webp,application/pdf}`), plus storage policies: `authenticated` can insert/update/delete in `media`.
  - **`updated_at` trigger** on content tables.
- [ ] **Step 4: Write `seed.sql`:**
  - The five program types with these colours, taken from the November 2026 poster legend:

    | Program type | Colour | Timing |
    |---|---|---|
    | Kuliah Maghrib | `#A87BF0` | prayer / maghrib / 0 |
    | Kuliah Subuh | `#3DDC97` | prayer / subuh / 0 |
    | Yassin / Tahlil / Doa Selamat | `#D9D9D9` | prayer / maghrib / 0 |
    | Si Cilik Mengaji | `#F2547D` | prayer / maghrib / 0 (the AJK can edit it) |
    | Kuliah Dhuha | `#E3B04B` | fixed 09:00 |

  - `settings`: `prayer_zone = "SGR01"`, `iqamah_offsets = {"subuh":15,"zohor":10,"asar":10,"maghrib":10,"isyak":10}` (placeholder values; the AJK confirm them in Tetapan).
  - `invites`: one row with null code.
- [ ] **Step 5:** Run `npx supabase db reset && npm run db:types && SUPABASE_TEST_URL=... npm test -- rls`. Expected: 5 passed.
- [ ] **Step 6:** Commit: `feat(db): schema, rls, media bucket and base seed`.

### Task 3: Time and month logic (pure)

**Files:**
- Create: `lib/types.ts`, `lib/time/clock.ts`, `lib/time/prayer.ts`, `lib/time/session-time.ts`, `lib/time/month.ts`
- Test: `tests/time/*.test.ts`

**Interfaces (Produces):**
```ts
// lib/types.ts
export type Prayer = 'subuh' | 'zohor' | 'asar' | 'maghrib' | 'isyak';
export type DayTimes = { date: string /* YYYY-MM-DD */; imsak: string; subuh: string; syuruk: string;
  zohor: string; asar: string; maghrib: string; isyak: string /* HH:MM */ };
export type IqamahOffsets = Record<Prayer, number>;
export type Timing = { mode: 'prayer'; anchor: Prayer; offsetMinutes: number } | { mode: 'fixed'; time: string };
// clock.ts
toMinutes(hhmm: string): number; addMinutes(hhmm: string, n: number): string;
formatTimeMY(hhmm: string): string;          // "7:24 mlm"
todayMY(now?: Date): string;                 // YYYY-MM-DD in UTC+8
nowMinutesMY(now?: Date): number;
// prayer.ts
iqamahTimes(day: DayTimes, offsets: IqamahOffsets): Record<Prayer, string>;
nextPrayer(today: DayTimes | null, tomorrow: DayTimes | null, nowMin: number):
  { prayer: Prayer; time: string; minutesUntil: number; isTomorrow: boolean } | null;
// session-time.ts
resolveTiming(override: Timing | null, typeDefault: Timing): Timing;
sessionTimeLabel(t: Timing, day: DayTimes | null): { label: string; time: string | null };
// month.ts
weekdayPosition(date: string): { weekday: number /*0=Sun*/; nth: number /*1-5*/ };
dateForPosition(year: number, month: number /*1-12*/, weekday: number, nth: number): string | null;
copyMonthDates<T extends { date: string }>(src: T[], year: number, month: number):
  { mapped: (T & { newDate: string })[]; skipped: T[] };
weekdaysInMonth(year: number, month: number, weekday: number): string[];
monthGrid(year: number, month: number): (string | null)[][]; // Monday-first weeks, null padding
```

Exact rules:
- **`formatTimeMY` suffixes:** `pagi` <12:00, `tgh` 12:00–13:59, `ptg` 14:00–18:59, `mlm` ≥19:00. Use 12-hour format with no leading zero (13:16 → "1:16 tgh").
- **`sessionTimeLabel`:**
  - prayer mode: label `"Selepas " + capitalised anchor`; time = anchor + offset, or `null` if `day` is null.
  - fixed mode: label `formatTimeMY(time)` and time = `time`.

- [ ] **Step 1: Write the failing tests:**
  - `formatTimeMY('19:24') === '7:24 mlm'`, `'05:50' → '5:50 pagi'`, `'13:16' → '1:16 tgh'`, `'16:28' → '4:28 ptg'`
  - `todayMY(new Date('2026-11-19T16:30:00Z')) === '2026-11-20'` (Review Focus 1)
  - `iqamahTimes` adds the offsets (`maghrib '19:14' + 10 → '19:24'`)
  - `nextPrayer` at 14:00 with asar 16:28 → `{prayer:'asar', minutesUntil:148, isTomorrow:false}`
  - `nextPrayer` after isyak (22:00) → tomorrow's subuh with `isTomorrow:true` and `minutesUntil` spanning midnight (Review Focus 3)
  - `nextPrayer(null, null, …) === null`
  - `sessionTimeLabel(prayer maghrib 0, null)` → `{label:'Selepas Maghrib', time:null}` (Review Focus 2)
  - `sessionTimeLabel(prayer maghrib 0, day)` → `time` = `day.maghrib`
  - `sessionTimeLabel({mode:'fixed', time:'09:00'}, null)` → `{label:'9:00 pagi', time:'09:00'}`
  - `weekdayPosition('2026-11-11')` → `{weekday:3, nth:2}`
  - `copyMonthDates` from Nov 2026 (which has 4 Wednesdays: 4, 11, 18, 25) into Dec 2026 maps the 2nd Wednesday → `'2026-12-09'`. A source on the 5th Sunday (Nov 29) into Feb 2027 (only 4 Sundays) lands in `skipped` (Review Focus 4).
  - `weekdaysInMonth(2026, 11, 4)` → `['2026-11-05','2026-11-12','2026-11-19','2026-11-26']`
  - `monthGrid(2026, 11)` has 6 rows: the first is `[null×6, '2026-11-01']` (Nov 1 2026 is a Sunday) and the last is `['2026-11-30', null×6]`
  - `monthGrid(2028, 2)` has 29 dates
- [ ] **Step 2:** Run `npm test -- time`. Expected: FAIL (modules not found).
- [ ] **Step 3:** Implement the five files. Do date math on `YYYY-MM-DD` strings using UTC `Date` objects (never the local timezone).
- [ ] **Step 4:** Run `npm test -- time`. Expected: all pass.
- [ ] **Step 5:** Commit: `feat: prayer, session-time and month logic`.

### Task 4: Supabase clients, auth guard, middleware, slug, cache tags, storage helpers

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/public.ts`, `lib/supabase/service.ts`, `lib/auth.ts`, `lib/cache-tags.ts`, `lib/slug.ts`, `lib/storage.ts`, `lib/image/resize.ts`, `middleware.ts`
- Test: `tests/slug.test.ts`, `tests/auth.test.ts`, `tests/image.test.ts`

**Interfaces (Produces):**
```ts
createClient(): SupabaseClient<Database>                  // @supabase/ssr + next/headers cookies
createPublicClient(tags: string[]): SupabaseClient<Database>
  // anon key; global.fetch = (u, i) => fetch(u, { ...i, next: { tags, revalidate: 3600 } })
createServiceClient(): SupabaseClient<Database>           // import 'server-only'
requireUser(): Promise<{ id: string; email: string }>     // getUser(); throws Error('UNAUTHORIZED') if none
export const TAGS = { posts: 'posts', sessions: 'sessions', programTypes: 'program_types',
  speakers: 'speakers', links: 'links', settings: 'settings', prayer: 'prayer_times' } as const;
slugify(text: string): string            // lowercase, a-z0-9 and '-', collapse dashes, max 80
sessionSlug(date: string, topic: string): string   // `${date}-${slugify(topic)}`
publicUrl(path: string): string; deleteFile(path: string | null): Promise<void>
fitWithin(w: number, h: number, max = 1600): { width: number; height: number }
resizeImage(file: File): Promise<Blob>   // browser only: canvas, webp 0.82, fallback jpeg
```

- [ ] **Step 1: Write the failing tests:**
  - `slugify('Kuliah Maghrib: Akidah!') === 'kuliah-maghrib-akidah'`
  - `sessionSlug('2026-11-11','Akidah') === '2026-11-11-akidah'`
  - `fitWithin(4000,3000)` → `{width:1600, height:1200}`
  - `fitWithin(800,600)` is unchanged
  - `requireUser` (mock `createClient` returning `getUser → {data:{user:null}}`) rejects with `UNAUTHORIZED`; with a user, it resolves `{id, email}`
- [ ] **Step 2:** Run `npm test`. Expected: the new tests fail.
- [ ] **Step 3:** Implement the files. `middleware.ts` matches `/admin/:path*`, refreshes the session using the standard `@supabase/ssr` pattern, and redirects to `/admin/login?redirect=…` when there's no user. It must let `/admin/login` and `/admin/jemput/*` through.
- [ ] **Step 4:** Run `npm test && npm run typecheck`. Expected: pass.
- [ ] **Step 5:** Commit: `feat: supabase clients, requireUser, middleware and helpers`.

### Task 5: Prayer-times sync (JAKIM adapter + daily cron)

**Files:**
- Create: `lib/prayer-source/jakim.ts`, `app/api/cron/daily/route.ts`, `vercel.json`, `lib/data/prayer.ts`, `tests/fixtures/jakim-month.json`
- Test: `tests/jakim.test.ts`, `tests/cron.test.ts`

**Interfaces:**
- Consumes: `DayTimes`, `createServiceClient`, `TAGS.prayer`.
- Produces:
  - `parseJakimMonth(json: unknown): DayTimes[]` and `fetchJakimMonth(zone: string, year: number, month: number): Promise<DayTimes[]>`
  - `getPrayerDays(from: string, to: string): Promise<DayTimes[]>` and `getLatestFetchedAt(): Promise<string | null>` (in `lib/data/prayer.ts`, using `createPublicClient([TAGS.prayer])`)

Notes:
- **JAKIM source:** the e-Solat API `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=month&zone=SGR01` returns a `prayerTime[]` array with `date` like `"01-Nov-2026"` and times like `"05:50:00"` (`imsak, fajr, syuruk, dhuhr, asr, maghrib, isha`). **Verify the endpoint and zone first.** If the endpoint has changed, keep the adapter's signature and adapt only the inside.
- **Mapping:** `fajr→subuh`, `dhuhr→zohor`, `asr→asar`, `isha→isyak`. Times are trimmed to `HH:MM`.

- [ ] **Step 1: Write the failing tests:**
  - `parseJakimMonth(fixture)` returns 30 days for November, and day 1 is `{date:'2026-11-01', subuh:'05:50', ...}` (shape the fixture on the real response).
  - Malformed input throws.
  - The cron route returns 401 without `Authorization: Bearer ${CRON_SECRET}`, and 200 with it (mock `fetchJakimMonth` and the service client).
- [ ] **Step 2:** Run `npm test -- jakim cron`. Expected: FAIL.
- [ ] **Step 3: Implement.** The cron route:
  - checks the secret
  - reads `prayer_zone` from `settings`
  - fetches the current MY month, plus the next month when `todayMY()` is within the last 7 days of the month
  - upserts into `prayer_times` with `fetched_at = now()`
  - calls `revalidateTag(TAGS.prayer)`
  - on fetch failure, logs `{event:'prayer_sync_failed'}` and returns 200 with `ok:false`, leaving the existing rows untouched

  `vercel.json`: `{"crons":[{"path":"/api/cron/daily","schedule":"10 16 * * *"}]}` (16:10 UTC = 00:10 MYT).
- [ ] **Step 4:** Run `npm test`. Expected: pass. Then do a manual run: `curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/daily`. Expected: rows appear in local `prayer_times`.
- [ ] **Step 5:** Commit: `feat: daily JAKIM prayer-times sync`.

### Task 6: Admin login, invite link, admin shell and dashboard

**Files:**
- Create: `lib/invite.ts`, `app/admin/login/page.tsx`, `app/admin/login/actions.ts`, `app/admin/jemput/[code]/page.tsx`, `app/admin/jemput/[code]/actions.ts`, `app/admin/(panel)/layout.tsx`, `app/admin/(panel)/page.tsx`, `app/admin/(panel)/tetapan/jemputan/page.tsx`, `app/admin/(panel)/tetapan/jemputan/actions.ts`, `app/admin/(panel)/tetapan/page.tsx`, `app/admin/(panel)/tetapan/actions.ts`, `app/components/admin/ConfirmDelete.tsx`, `lib/data/analytics.ts`
- Test: `tests/invite.test.ts`

**Interfaces:**
- Produces:
  - `newInvite(now?: Date): { code: string; expiresAt: string }`: 24 url-safe random characters from `crypto.getRandomValues`, valid for 7 days.
  - `checkInvite(stored: { code: string | null; expiresAt: string | null }, given: string, now?: Date): 'ok' | 'invalid' | 'expired'`: constant-time comparison.
  - `<ConfirmDelete action={fn} label="..." />`, used by all later admin lists.
  - `getMonthlyCounts(year: number, month: number): Promise<Record<'qr_scan'|'pwa_install'|'share_click', number>>`, using the service client.

**Behaviour:**
- **Login:** an email field, then `signInWithOtp({ email, options: { shouldCreateUser: false } })`, then a 6-digit code field, then `verifyOtp({ email, token, type: 'email' })`, then a redirect to `?redirect` or `/admin`. Messages:
  - wrong or expired code: "Kod salah atau telah tamat tempoh."
  - unknown email: "Kod tidak dapat dihantar. Pastikan e-mel anda didaftarkan oleh AJK."
- **Invite accept:** if `checkInvite` returns `'ok'`, call `auth.admin.createUser({ email, email_confirm: true })` (ignoring "already registered"), then send the OTP, then go to the code step. Otherwise show "Pautan jemputan tidak sah atau telah tamat tempoh."
- **Jemputan page:**
  - "Jana pautan jemputan" saves `newInvite()`
  - shows `${NEXT_PUBLIC_SITE_URL}/admin/jemput/${code}`, the expiry date, a "Kongsi ke WhatsApp" link and a "Batalkan pautan" button (sets the code to null)
  - shows the admin list from `auth.admin.listUsers()`: email, `created_at`, `last_sign_in_at`
- **Tetapan:** iqamah offsets (5 number inputs, 0–60) and prayer zone, saved to `settings` with `revalidateTag(TAGS.settings)`.
- **Panel layout:**
  - phones: a top bar plus a bottom tab bar (Utama, Hebahan, Jadual, Borang, Tetapan)
  - desktop (≥768px): a sidebar
  - a logout button (`signOut`)
- **Dashboard:**
  - content counts
  - `getMonthlyCounts`
  - a link to Vercel Analytics
  - "Waktu solat dikemas kini: [date]" (`getLatestFetchedAt`)
  - "+ Hebahan" / "+ Sesi" buttons

- [ ] **Step 1: Write the failing tests:** `checkInvite` returns `'ok'` for the matching code within 7 days, `'expired'` 7 days + 1 minute later, `'invalid'` for a wrong code, and `'invalid'` when the stored code is null (cancelled or replaced). `newInvite().code` matches `/^[A-Za-z0-9_-]{24}$/`.
- [ ] **Step 2:** Run `npm test -- invite`. Expected: FAIL.
- [ ] **Step 3:** Implement `lib/invite.ts`, then the pages and actions. Every action in `(panel)` starts with `requireUser()`. The invite accept action is the only unauthenticated action that uses the service client.
- [ ] **Step 4:** Run `npm test && npm run typecheck`. Then check manually against local Supabase (Inbucket at `localhost:54324` shows the OTP emails):
  - generate an invite, open it in a private window, register an email, enter the code, and land on the dashboard
  - cancel the invite, and confirm the old link shows the invalid message
- [ ] **Step 5:** Commit: `feat(admin): otp login, invite link, panel shell, dashboard, settings`.

### Task 7: Posts (Hebahan): admin and public

**Files:**
- Create: `app/components/admin/ImageUpload.tsx`, `lib/data/posts.ts`, `app/admin/(panel)/hebahan/page.tsx`, `app/admin/(panel)/hebahan/[id]/page.tsx` (`id` = `baru` for new), `app/admin/(panel)/hebahan/actions.ts`, `app/hebahan/page.tsx`, `app/hebahan/[slug]/page.tsx`, `app/components/PostCard.tsx`, `app/components/ShareButton.tsx`
- Modify: `app/siak/page.tsx` → `redirect('/hebahan/kekosongan-jawatan-siak')`
- Test: `tests/posts-actions.test.ts`

**Interfaces:**
- Consumes: `requireUser`, `createClient`, `deleteFile`, `resizeImage`, `slugify`, `TAGS.posts`.
- Produces:
  - `<ImageUpload table="posts" value={path|null} onChange={(path|null) => void} accept="image" | "image+pdf" />`: resizes images, uploads to `uploads/{table}/{uuid}.{ext}` with the browser Supabase client, and shows progress and errors ("Muat naik gagal. Cuba lagi.").
  - `<ShareButton url title />`: uses Web Share API when available, otherwise opens `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`; records `share_click` via `/api/track` (built in Task 10), as a fire-and-forget `fetch` that ignores errors.
  - `listPosts({ type?, limit? })`, `getPostBySlug(slug)` in `lib/data/posts.ts`: pinned first, then `published_at desc`.
  - Server actions `savePost(formData)` and `deletePost(id)`.

**Behaviour:**
- **The "+ Hebahan" form** has these fields in this order (§13): photo, title, type (default Pengumuman), text, link.
- **Slug:** generated from the title. On a collision, append `-2`, `-3`, and so on.
- **Saving** calls `revalidateTag(TAGS.posts)`, then shows the share link with "Kongsi ke WhatsApp".
- **Replacing or deleting** an image deletes the old file.
- **`/hebahan/[slug]`** uses `generateMetadata` (`title`, `description` = the first 160 chars of `body` or `subtitle`, `openGraph.images` = the image's public URL), and returns 404 if not found.

- [ ] **Step 1: Write the failing tests** (with `createClient`/`requireUser` mocked):
  - `savePost` rejects with `UNAUTHORIZED` when there's no user
  - it rejects an `external_url` of `javascript:alert(1)` with "Pautan mesti bermula dengan http://, https:// atau /"
  - with a duplicate title, the slug becomes `...-2`
  - `deletePost` calls `deleteFile` with the post's `image_path`
- [ ] **Step 2:** Run `npm test -- posts`. Expected: FAIL.
- [ ] **Step 3:** Implement the data functions, the actions, the admin list and form, and the public list and detail pages.
- [ ] **Step 4:** Run `npm test && npm run typecheck`. Manual check: create a post on a phone-width viewport in under a minute; it appears on `/hebahan` immediately; opening `/siak` redirects (after seeding in Task 11).
- [ ] **Step 5:** Commit: `feat: hebahan posts admin and public pages`.

### Task 8: Schedule: program types, ustaz, sessions, copy month, poster

**Files:**
- Create: `lib/data/schedule.ts`, `lib/poster/model.ts`, `app/admin/(panel)/jadual/page.tsx`, `app/admin/(panel)/jadual/sesi/[id]/page.tsx`, `app/admin/(panel)/jadual/actions.ts`, `app/admin/(panel)/jadual/jenis/page.tsx` (+ actions), `app/admin/(panel)/jadual/ustaz/page.tsx` (+ actions), `app/jadual/[month]/poster.png/route.tsx`, `public/poster/donation-panel.png` (cropped from the current poster's QR + Bank Islam panel), `public/fonts/` (one bold display font + one regular, OFL-licensed)
- Test: `tests/poster-model.test.ts`, `tests/schedule-actions.test.ts`

**Interfaces:**
- Consumes: `copyMonthDates`, `weekdaysInMonth`, `monthGrid`, `resolveTiming`, `sessionTimeLabel`, `sessionSlug`, `ImageUpload`, `ConfirmDelete`, `TAGS.sessions/programTypes/speakers`.
- Produces:
  - `type SessionView = { id; slug; date; status; topic; kitab: string|null; notes: string|null; type: { id; name; colour }; speaker: { name; titleLine: string|null; photoUrl: string|null } | null; timing: Timing }`
  - `listSessions(from: string, to: string): Promise<SessionView[]>`, `getSessionBySlug(slug): Promise<SessionView | null>`, `listProgramTypes()`, `listSpeakers()`
  - actions `saveSession(fd)`, `deleteSession(id)`, `copyLastMonth(year, month): Promise<{ created: number; skipped: { date: string; topic: string }[] }>`, `saveProgramType(fd)`, `saveSpeaker(fd)`, `deleteSpeaker(id)`
  - `buildPosterModel(year, month, sessions: SessionView[], types): PosterModel` and `truncate(text: string, max: number): string`

```ts
type PosterBlock = { colour: string; topic: string; kitab: string | null; speakerName: string | null;
  photoUrl: string | null; cancelled: boolean };
type PosterModel = { title: string /* "NOV 2026" */; legend: { name: string; colour: string }[];
  weeks: { date: string | null; day: number | null; blocks: PosterBlock[]; crowded: boolean }[][] };
```

**Behaviour:**
- **Saving a session:**
  - the timing override is stored only when "Masa khas" (custom time) is ticked
  - "Ulang setiap minggu" creates one session per `weekdaysInMonth` date
  - slug = `sessionSlug(date, topic)`, with a `-2` suffix on collision
- **Copy month:** copies the previous month's `scheduled` sessions using `copyMonthDates` and shows the skipped list in a dialog (Review Focus 4).
- **Poster model limits:** topic ≤ 22 chars, kitab ≤ 26, speaker ≤ 28 (ending with `…`). `crowded = blocks.length > 2 || any field was truncated`. A null speaker photo uses a placeholder silhouette.
- **Poster route (`/jadual/2026-11/poster.png`):**
  - public, rendered with `ImageResponse` at 2160×1368, flex-only layout per §9b
  - left panel: logo, `title`, "JADUAL KULIAH & PROGRAM IMARAH", donation panel image, legend
  - grid: ISNIN…AHAD headers, then the cells
  - cache: `Cache-Control: public, max-age=300, s-maxage=86400`, plus `revalidateTag(TAGS.sessions)` dependency via the tagged reads. Builder's call: use this instead of a Storage copy if it stays within Vercel Hobby limits; it satisfies §9b's "regenerated when a session changes".
- **Admin Jadual page:**
  - month switcher; list on phones, grid at ≥768px
  - "+ Sesi", "Salin bulan lepas", "Jana poster" (opens a preview `<img>` with Muat turun (download) and Kongsi (Web Share with the file))
  - crowded cells highlighted
  - links to Jenis Program and Ustaz

- [ ] **Step 1: Write the failing tests:**
  - **November 2026 grid:** `buildPosterModel(2026, 11, sessions, types)` has 6 weeks (from `monthGrid`), and Nov 4 holds a block `{topic:'Mastika Hadith'}`.
  - **Crowded day (Review Focus 5):** a day with 2 blocks where one topic is 40 chars long becomes 22 chars ending in `…` and is marked `crowded:true`. A session with `speaker: null` gives `speakerName:null, photoUrl:null` without throwing.
  - **Copy last month:** with a mocked January 2027 source session on 2027-01-29 (the 5th Friday; February 2027 has only 4 Fridays), `copyLastMonth(2027, 2)` → `skipped` contains it and `created` is 0.
  - **Auth:** `saveSession` without a user rejects with `UNAUTHORIZED`.
- [ ] **Step 2:** Run `npm test -- poster schedule`. Expected: FAIL.
- [ ] **Step 3:** Implement the data functions, the actions, the admin pages (types, ustaz with `ImageUpload table="speakers"`, sessions), `buildPosterModel`, and the poster route.
- [ ] **Step 4:** Run `npm test && npm run typecheck`. Then open `/jadual/2026-11/poster.png` locally after seeding (Task 11), check it against the reference poster's layout, and attach the screenshot to the commit message.
- [ ] **Step 5:** Commit: `feat: schedule admin, copy month and generated poster`.

### Task 9: Public schedule, prayer pages, homepage, navigation, Borang

**Files:**
- Create: `app/jadual/page.tsx`, `app/jadual/[slug]/page.tsx`, `app/jadual/[slug]/ics/route.ts`, `lib/ics.ts`, `app/waktu-solat/page.tsx`, `app/components/PrayerWidget.tsx` (client), `app/components/SessionCard.tsx`, `app/components/BottomNav.tsx`, `app/borang/page.tsx`, `lib/data/links.ts`, `lib/data/settings.ts`, `app/admin/(panel)/borang/page.tsx` (+ actions)
- Modify: `app/page.tsx`, `app/layout.tsx`, `app/components/Navbar/Navbar.tsx` + `Drawerdata.tsx` (route links instead of `#` anchors). Delete the `Aboutus`, `Articles` and `Featured` components and their imports.
- Test: `tests/ics.test.ts`

**Interfaces:**
- Consumes: `listSessions`, `getSessionBySlug`, `getPrayerDays`, `iqamahTimes`, `nextPrayer`, `sessionTimeLabel`, `todayMY`, `nowMinutesMY`, `formatTimeMY`, `listPosts`, `ShareButton`.
- Produces: `buildIcs(e: { uid: string; title: string; description: string; startUtc: Date; durationMinutes: number; location: string }): string`, `getSettings(): Promise<{ prayerZone: string; iqamahOffsets: IqamahOffsets }>`, `listLinks()`.

**Behaviour:**
- **`PrayerWidget`** gets today's and tomorrow's `DayTimes | null` plus the offsets as props, and ticks every 30 seconds:
  - shows six azan times, with iqamah beside the five prayers
  - highlights the next prayer with "Asar dalam 42 minit"
  - shows "Waktu solat belum tersedia" if today is null (Review Focus 2)
- **Home** (§11, in order):
  - `Banner`
  - `PrayerWidget`
  - "Malam ini / Hari ini" sessions for `todayMY()`, then the next 3
  - pinned and latest posts (6)
  - `FAQ`
  - `Dedicated`
- **`/jadual`:**
  - `?bulan=YYYY-MM`, defaulting to the current MY month
  - phones: agenda groups "Malam ini", "Esok", "Minggu ini", then "Bulan ini"
  - ≥768px: month grid
  - filter chips per program type (`?jenis=id`)
  - a "Poster bulan ini" link
  - cancelled sessions shown struck through
- **Session page:** `generateMetadata` (OG image = the speaker photo, otherwise the month poster), share button, and "+ Kalendar" → `/jadual/[slug]/ics`. The ICS has a 60-minute default duration (unless the program type sets one) and start = the computed time; if the time is null, it's an all-day event.
- **`/waktu-solat`:** the widget plus a table for the month.
- **`/borang`:** links grouped by category. The admin Borang page does CRUD with `ImageUpload accept="image+pdf"` for documents (stores the `publicUrl` in `url`).
- **`BottomNav`** (phones only): Utama, Waktu Solat, Jadual, Hebahan, Lagi. "Lagi" opens a sheet with Borang, Khairat, Tabung and Hubungi.

- [ ] **Step 1: Write the failing tests:**
  - `buildIcs` contains `BEGIN:VEVENT`, `DTSTART:20261111T112400Z` for 19:24 MYT on 2026-11-11, `LOCATION:Surau Elmina Valley`, and uses CRLF line endings
  - escapes commas and semicolons in `title`
- [ ] **Step 2:** Run `npm test -- ics`. Expected: FAIL.
- [ ] **Step 3:** Implement everything above.
- [ ] **Step 4:** Run `npm test && npm run typecheck && npm run build`. Manual check at 375px and 1280px:
  - home order matches
  - the widget countdown works
  - setting the device clock past Isyak shows tomorrow's Subuh
  - `/jadual` shows a list on phones and a grid on desktop
  - `/khairat` and `/tabung` are unchanged
- [ ] **Step 5:** Commit: `feat: public schedule, prayer times, homepage and navigation`.

### Task 10: PWA, analytics, motion

**Files:**
- Create: `app/manifest.ts`, `app/sw.ts`, `app/components/InstallPrompt.tsx`, `app/components/OfflineBanner.tsx`, `app/components/MotionProvider.tsx`, `app/api/track/route.ts`, `app/components/TrackQr.tsx`, icons `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (from `sevlogo`)
- Modify: `next.config.js` (wrap with `withSerwist({ swSrc: 'app/sw.ts', swDest: 'public/sw.js', disable: dev })`), `app/layout.tsx`, and the components named in Behaviour below (add `m.*` animations)
- Test: `tests/track.test.ts`

**Interfaces:**
- Consumes: `createServiceClient`, `ShareButton` (already posts `share_click`).
- Produces: `POST /api/track` with body `{ type: 'qr_scan'|'pwa_install'|'share_click', path: string }`. It returns 204, or 400 for an unknown type or a `path` longer than 300 characters.

**Behaviour:**
- **Manifest:** `name: "Surau Elmina Valley"`, `short_name: "SEV"`, `start_url: "/?src=pwa"`, `display: "standalone"`, theme `#00224A`, background `#ffffff`, and the three icons.
- **`sw.ts` (Serwist):**
  - precache the build
  - `NetworkFirst` for navigations, with an offline fallback to cache
  - `CacheFirst` for `/storage/v1/object/public/` images (max 200 entries, 30 days)
  - `NetworkFirst` for `/waktu-solat`
  - **never cache** `/admin` or `/api` (a `NetworkOnly` matcher)
  - add an empty `push` listener stub comment for release 2
- **`InstallPrompt`:**
  - Android: capture `beforeinstallprompt` and show a "Pasang aplikasi" button
  - iOS Safari, not standalone: a one-time dismissible sheet with Share → "Add to Home Screen" (remember the dismissal in `localStorage` inside try/catch)
  - post `pwa_install` on `appinstalled`
- **`TrackQr`:** on first load, if `?src=qr` is present, post `qr_scan` once per session (`sessionStorage` guard).
- **`OfflineBanner`:** shows "Anda di luar talian" when `navigator.onLine` is false.
- **`MotionProvider`:** wraps `LazyMotion features={domAnimation}` + `MotionConfig reducedMotion="user"` in the root layout. Add `m.*` fade/slide (150–300ms) to:
  - SessionCard and PostCard on enter
  - the BottomNav "Lagi" sheet and the InstallPrompt sheet
  - the jadual list↔grid switch
  - the PrayerWidget next-prayer highlight
  - the admin publish confirmation
- **Analytics:** keep `@vercel/analytics`. Document the Cloudflare rate-limit rule for `/api/track` in the README (Task 11).

- [ ] **Step 1: Write the failing tests:** `POST /api/track` with `{type:'qr_scan', path:'/'}` → 204 (service client mocked, insert called once); `{type:'hack'}` → 400; a `path` of 301 characters → 400.
- [ ] **Step 2:** Run `npm test -- track`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm run build && npm start`, then check in Chrome DevTools:
  - Application → Manifest shows installable
  - Lighthouse PWA "installable" passes
  - offline reload of a visited page works
  - `/admin` is not served from cache
  - with reduced motion on, nothing animates

  Run `npm test`. Expected: pass.
- [ ] **Step 5:** Commit: `feat: pwa, install prompts, tracking and motion`.

### Task 11: Seed real content, README, beta deploy

**Files:**
- Create: `supabase/seed-content.sql` (or `scripts/seed-content.ts` using the service client and uploading images from `public/images/`)
- Modify: `README.md`

**Content to seed** (from the current components and the November 2026 poster):
- **Posts:**
  - from `Aboutus`: SIAK with slug `kekosongan-jawatan-siak` (image `siak.jpg`), and Tabung Khairat (`external_url` Jotform)
  - every item in `Articles` as `buletin`, with the original dates
  - from `Featured`: Qurban 2024 and Eidul-Adha (Drive link)
- **Links:** Khairat (Jotform, `Borang`), Tabung (`/tabung`, `Sumbangan`).
- **Speakers** (with photos when the AJK provide them, otherwise null):
  - Ustaz Prof Madya Dr Khader Ahmad
  - Ustaz Mohd Ayub Wari
  - Imam Farid
  - Ustaz Haji Nazrin
  - Ustaz Ahmad Salahuddin
  - Imam Sobri
  - Ustaz Dr Mohd Sobri Ellias
  - Ustaz Nik Taufik
  - Ustaz Suhail Sufian
  - Ustaz Hadi Talhah
  - Ustaz Dr Anzaruddin
- **November 2026 sessions,** transcribed from the poster:

  | Date | Program type | Topic | Kitab | Speaker |
  |---|---|---|---|---|
  | 4 | Kuliah Maghrib | Mastika Hadith | | Ustaz Prof Madya Dr Khader Ahmad |
  | 5 | Kuliah Maghrib | Tafsir/Tadabur | | Ustaz Mohd Ayub Wari |
  | 6, 13, 20, 27 | Si Cilik Mengaji | | | Imam Farid |
  | 8 | Kuliah Maghrib | Hadith Akhir Zaman | | Ustaz Haji Nazrin |
  | 9 | Kuliah Maghrib | Umum | | Ustaz Ahmad Salahuddin |
  | 10 | Kuliah Maghrib | Bahasa Arab | | Imam Sobri |
  | 11 | Kuliah Maghrib | Akidah | Sullamut Taufiq | Ustaz Dr Mohd Sobri Ellias |
  | 12, 19, 26 | Yassin / Tahlil / Doa Selamat | | | |
  | 18 | Kuliah Maghrib | Fiqah | Bulughul Maram | Ustaz Suhail Sufian |
  | 20 | Kuliah Maghrib | Al-Quran | | Ustaz Nik Taufik |
  | 22 | Kuliah Maghrib | Hadith | | Ustaz Hadi Talhah |
  | 24 | Kuliah Maghrib | Tasawuf | | Imam Sobri |
  | 29 | Kuliah Maghrib | Sirah Nabawi | | Ustaz Dr Anzaruddin |

  The poster's small kitab text for some sessions is unreadable, so leave those kitab fields null for the AJK to fill in. Ask the AJK to confirm names and spellings during the demo.

- [ ] **Step 1:** Write the seed and run it on local Supabase. Expected: `/hebahan`, `/jadual?bulan=2026-11` and the poster show the data; `/siak` redirects to the SIAK post.
- [ ] **Step 2: README** sections (Malay headings are fine): Setup (env, `supabase start`, `npm run dev`), Deploy, "Tambah / buang admin" (invite link; remove via Supabase → Authentication → Users), Cloudflare rate-limit rule for `/api/track`, domain registrar and login holder (Hafiy to fill in), and account transfer steps (§15).
- [ ] **Step 3: Beta deploy checklist** (manual, Hafiy). Record the outcomes in the PR description.
  - Create the Supabase project (personal account), run `supabase db push` and the seed, set Auth to email OTP, sign-ups off, OTP expiry 600s.
  - Set the Vercel env vars for Preview, and attach `beta.surauelminavalley.com` to the branch, with a CNAME in Cloudflare.
  - Generate an invite and add Hafiy first.
  - Smoke test on an Android and an iPhone: install, prayer widget, jadual, share to WhatsApp (preview card shows), admin post in under a minute, poster download.
- [ ] **Step 4:** Run `npm test && npm run typecheck && npm run build`. Expected: all pass.
- [ ] **Step 5:** Commit: `feat: seed current content and document admin/deploy`.

---

## Self-review notes

- **Spec coverage:**

  | Spec section | Task |
  |---|---|
  | §2 goals | Tasks 5–10 |
  | §6 | Tasks 4, 6 |
  | §7 | Task 2 |
  | §8 | Tasks 4, 7 |
  | §9 | Tasks 3, 5, 9 |
  | §9b | Task 8 |
  | §11 | Task 9 |
  | §11 animation | Task 10 |
  | §12 | Task 10 |
  | §13 | Tasks 6–9 |
  | §14 | Tasks 6, 10, 11 |
  | §15 | Tasks 5, 11 |
  | §16 | Tasks 4, 7, 10 |
  | §10 (release 2) | Nothing to build; Task 10 leaves the push stub, and storage access is centralised in `lib/storage.ts` |
- **Deviation from the spec, flagged:**
  - **Poster caching:** the spec said cache the PNG in Storage keyed by a hash. The plan uses HTTP/CDN caching tied to the sessions tag instead. It's simpler, with the same behaviour for users, and stays switchable if Hobby limits bite.
  - **Invite code storage:** it lives in its own `invites` table, an option §7 allows.
