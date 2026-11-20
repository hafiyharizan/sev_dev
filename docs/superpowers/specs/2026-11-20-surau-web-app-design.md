# Surau Elmina Valley Web App: Design

**Date:** 2026-11-20
**Project:** Surau Elmina Valley (SEV), Next.js / TypeScript / Tailwind on Vercel
**Status:** Approved 2026-11-20
**Supersedes:** `2026-05-16-admin-panel-design.md`. Its validation rules carry over; its auth, rate-limit and storage design is replaced. The review findings that motivated this are listed under "Lessons from the previous spec".

---

## 1. Intent

Today jemaah learn about kuliah, events and announcements through WhatsApp groups. Nothing is broken, but the surau has no home of its own and no way to see who is paying attention.

The goal is one installable web app (PWA) for the surau community:

1. **Public side.** Anyone can see the surau overview, prayer times, the kuliah and program schedule, announcements and bulletins, and forms. Donation collections follow in release 2.
2. **Admin side.** AJK members log in from their phones and add, edit or remove that content themselves, without a developer.

WhatsApp stays. It becomes the channel that sends people *into* the app: AJK share links to app pages instead of pasting full text and posters.

**Success looks like:** monthly visits, app installs and QR-code scans rising over time, and AJK keeping content current without asking Hafiy.

## 2. Goals, non-goals, anti-goals

**Goals (release 1)**
- PWA installable on Android and iOS, responsive from small phones to desktop, with basic offline support.
- Today's homepage content kept as the surau overview.
- Prayer times (azan and iqamah) with a countdown to the next prayer.
- Kuliah and program schedule (*Jadual Kuliah & Program Imarah*), replacing the hand-made monthly poster as the source of truth, with times that follow the prayer times.
- **The app generates the monthly schedule poster image** from the schedule data, for sharing on WhatsApp. This replaces the manual Canva step.
- Announcements and bulletins, each with its own shareable page and a WhatsApp preview card.
- Forms and links section (links to Jotform, Google Forms and documents).
- AJK admin panel, mobile-first, with per-person login.
- Analytics: monthly visits, QR scans, installs.

**Non-goals (release 1)**
- Push notifications of any kind. Azan notifications are parked for release 2 (see section 10).
- Gallery (release 2).
- Donations / collections section (release 2). The existing `/tabung` page stays as it is. Even later, there'll be no payment gateway: donations stay by bank QR only.
- A form builder. Forms stay on Jotform or Google Forms.
- Editing the overview sections (Banner, FAQ, Dedicated) from the admin panel. They stay in code for release 1.
- Draft/publish workflow, rich-text editor, image cropping.
- Moving hosting. The site stays on Vercel.

**Anti-goals (a failure even if it technically works)**
- **Posting is slower than WhatsApp.** If an AJK member can't publish an announcement from their phone in under a minute (photo, title, date, publish), they'll go back to WhatsApp-only and the app goes stale.
- **Breaking existing links.** `/khairat`, `/siak` and `/tabung` have been shared in WhatsApp groups and must keep working.
- **Running costs.** The budget is RM0: free plans only. Anything that needs a paid plan must be raised with Hafiy first.
- **A system only Hafiy can keep alive.** No self-managed servers.

## 3. Constraints

- **Users:** jemaah (all ages, mostly on phones, some older and less tech-savvy) and a small AJK admin group (realistically under 10).
- **Language:** the UI is in Bahasa Melayu. The code and this document are in English.
- **Budget:** RM0. Vercel Hobby and Supabase Free. Vercel Hobby is for non-commercial use, which a surau site is.
- **Maintainer:** one volunteer developer (Hafiy).
- **Existing code:** about 1,400 lines of Next.js 14 components with hardcoded content, deployed on Vercel. There is no backend, database or tests yet.

## 4. Approaches considered

| | **A. Vercel + Next.js + Supabase (chosen)** | B. Everything on Cloudflare | C. VPS running Supabase |
|---|---|---|---|
| Cost | RM0 | USD 5 a month to keep Next.js (Workers Paid); RM0 only by leaving Next.js for a static React app plus API worker | VPS fee, from about RM20 a month |
| Hosting change | None: the site is already on Vercel | Full move | Full move |
| Next.js | Native, works out of the box | Via the OpenNext adapter; images, caching and refresh need extra setup | Self-managed |
| Admin login | Supabase Auth (email one-time code) | Cloudflare Access | Self-managed |
| Can it pause? | Free Supabase pauses after a week of inactivity; mitigated (section 15) | No | No (unless the server dies) |
| Ops burden | Low | Low | High: backups, patches, security |

**Chosen: A.**
- **Why not B:** B was chosen first, for one platform that never sleeps. It was dropped once it became clear the choice was either USD 5 a month (Next.js on Workers Paid) or leaving Next.js for the free plan. Next.js's main benefits for this app are pages that arrive already filled in for jemaah opening WhatsApp links on mobile data, built-in share previews, and familiarity. Those are strongest on Vercel, at RM0, with no hosting move.
- **Why not C:** it makes a volunteer the sysadmin.
- **What A costs us:** the risk of the free Supabase project pausing, handled in section 15.

## 5. Architecture

| Need | Service |
|---|---|
| Website and admin (Next.js) | Vercel Hobby (existing project) |
| Database | Supabase Postgres |
| Admin login | Supabase Auth: email one-time code, sign-ups disabled |
| Uploaded posters, thumbnails, ustaz photos, PDFs | Supabase Storage |
| Monthly poster image | `next/og` (`ImageResponse`, the Satori engine) in a route handler |
| Daily jobs (prayer-times sync, cleanup) | Vercel Cron: one daily job |
| Visit analytics | Vercel Web Analytics (already installed), plus our own event counters in Postgres |
| DNS | Cloudflare (existing, proxied). Also used for a rate-limiting rule on the public tracking endpoint (section 14). |

**Free-plan limits to check before launch (from memory; confirm current numbers):**
- Supabase Free: about 500MB database, 1GB storage, 5GB egress a month; pauses after a week of inactivity.
- Vercel Hobby:
  - cron jobs run at most once a day, with imprecise timing within the hour
  - function request bodies are capped at about 4.5MB
  - Web Analytics and image optimisation have monthly caps

Section 15 covers what we do about each.

**Next.js version:** stay on 14.2 or upgrade to 15 (builder's call). If upgrading, do it as the first step before any feature work.

## 6. Admin authentication and authorisation

Kept deliberately simple: the only goal is "only AJK can edit". Everything here is built into Supabase.

- **Who is an admin:** every user in Supabase Auth is an admin. There are no roles and no admin table. **Public sign-ups are disabled**, so users only get in through an invite link or by Hafiy adding them.
- **Invite link (the normal way to add AJK):**
  - In **Tetapan → Jemputan**, any admin taps "Jana pautan jemputan" (generate invite link). This creates a random code with a **7-day expiry**, stored in `settings` as `invite_code` and `invite_expires_at`. The page shows the link `https://surauelminavalley.com/admin/jemput/<code>` with a "Kongsi ke WhatsApp" button, to post in the **AJK-only** WhatsApp group.
  - Opening the link shows a form asking for an email. If the code matches and hasn't expired, the server creates the Supabase user with the service role and sends the usual 6-digit login code. An invalid or expired code shows "Pautan jemputan tidak sah atau telah tamat tempoh" (invite link invalid or expired).
  - Generating a new link immediately invalidates the old one. There's also a "Batalkan pautan" (cancel link) button.
  - **Risk accepted:** anyone who gets the link while it's valid can become an admin, so it must only be posted in the AJK group. The spotting aid is the admin list below.
- **Admin list:** Tetapan → Jemputan also shows a read-only list of admin emails, with when each joined and last logged in, read from the Supabase Auth admin API on the server. That makes an unexpected admin easy to spot.
- **Removing an admin:** Hafiy deletes the user in the Supabase dashboard (Authentication → Users). They lose access on their next action. A short how-to goes in the README.
- **Login:** `/admin/login` asks for an email address. Supabase emails a **6-digit one-time code** (expiry set to 10 minutes), which the admin types in. We use a code rather than a link because links in email often open in a different browser than the installed app.
- **Sessions:** `@supabase/ssr` cookie sessions. Middleware redirects logged-out `/admin/*` requests to the login page.
- **The one rule that must not be skipped (fixes review finding 2):** every admin Server Action and route handler starts with `requireUser()`, which calls `supabase.auth.getUser()` and rejects the request if there's no user. This is a single line per action. The middleware alone is not enough, because Server Actions can be called directly.
- **Database rule (RLS):** anyone can read; only logged-in users can write (section 7).
- The service-role key is used only by the cron and tracking routes, and is never exposed to the browser.
- **Logout:** signs out and clears the cookies.

## 7. Data model (Supabase Postgres)

Content tables have `id` (uuid), `created_at` and `updated_at`. Timestamps are `timestamptz`. Display is always in `Asia/Kuala_Lumpur` with Malay formatting (e.g. "16 Mei 2026"). Schema changes go only through Supabase CLI migrations kept in the repo. **Deletes are real deletes** (after a confirmation dialog), and they remove the attached file too. There's no soft delete or recycle bin.

**RLS (the same two policies on every content table):**
- everyone (`anon`, `authenticated`) can `SELECT`
- `authenticated` can `INSERT` / `UPDATE` / `DELETE`

`analytics_events` has no client policies: only the tracking route writes to it, using the service role.

**posts** (announcements and bulletins in one table)
- `type`: `pengumuman` | `buletin`
- `slug`: unique, generated from the title and editable. Used for `/hebahan/[slug]`.
- `title` (max 200), `subtitle` (optional, max 200)
- `body` (plain text, optional; line breaks preserved)
- `image_path` (Storage path, optional)
- `external_url` (optional). If set, the card links out. The detail page still exists for sharing.
- `published_at` (defaults to now; shown as the date)
- `pinned` (boolean; pinned posts show first)

The schedule model is based on the AJK's existing monthly poster (*Jadual Kuliah & Program Imarah*, e.g. November 2026). On that poster:
- each session has a colour-coded **program type**, a **topic**, an optional **kitab**, and an **ustaz with a photo**;
- times are implied by the type (e.g. Kuliah Maghrib = after Maghrib);
- some programs repeat weekly (e.g. Yassin every Thursday);
- a day can hold more than one session.

**program_types** (managed in admin, seeded with the five on the current poster)
- `name` (e.g. Kuliah Maghrib, Kuliah Subuh, Yassin / Tahlil / Doa Selamat, Si Cilik Mengaji, Kuliah Dhuha), `colour` (hex), `sort_order`
- **Default timing**, one of:
  - `time_mode = 'prayer'` + `anchor_prayer` (`subuh` | `zohor` | `asar` | `maghrib` | `isyak`) + `offset_minutes` (e.g. after Maghrib = maghrib + 0, shown as "Selepas Maghrib")
  - `time_mode = 'fixed'` + `fixed_time` (`HH:MM`, e.g. Kuliah Dhuha 09:00)
- `default_duration_minutes` (optional)

**speakers** (ustaz library; entered once, reused every month)
- `name` (e.g. "Ustaz Dr. Mohd Sobri Ellias"), `title_line` (optional), `photo_path` (Storage, a cut-out or square photo), `active`

**sessions** (one row per actual session; no stored repeat rules)
- `date` (local date), `program_type_id`, `topic` (e.g. Akidah, Fiqah, Tafsir/Tadabur), `kitab` (optional, e.g. Sullamut Taufiq), `speaker_id` (optional)
- Timing override (optional): same fields as the program type's timing. If not set, the type's default is used.
- `notes` (optional), `slug` (for `/jadual/[slug]`), `status`: `scheduled` | `cancelled` (cancelled sessions show struck through, not hidden)
- The **displayed time is computed**: for prayer-based timing, it's that day's prayer time from `prayer_times` plus the offset, e.g. "Selepas Maghrib · 7:24 mlm". If prayer times are missing for that date, show only the label ("Selepas Maghrib").

**Admin helpers** (they generate ordinary `sessions` rows; nothing is linked afterwards):
- **"Salin bulan lepas"** (copy last month): copies last month's sessions into the target month by weekday position. For example, the 2nd Wednesday maps to the 2nd Wednesday, and if the target month has no 5th week those sessions are skipped and listed. The admin then edits topics and speakers. *(Builder note: mapping by weekday position is my call.)*
- **"Ulang setiap minggu"** (repeat weekly): when creating a session, tick "every [weekday] this month" to create one per matching day.

Storing each session individually makes editing or cancelling one day trivial, which matches how the AJK actually work.

**links** (forms and links)
- `title`, `url`, `description` (optional), `category`: `Borang` | `Dokumen` | `Program` | `Sumbangan` | `Media` | `Umum`, `sort_order`

**settings** (single row, key/value)
- `prayer_zone` (default `SGR01`, see section 9), `iqamah_offsets` (JSON minutes per prayer, e.g. `{"subuh":15,"zohor":10,...}`)
- `invite_code`, `invite_expires_at` (section 6). These are never readable by `anon`: either keep them in a separate table with no public read policy, or exclude them from the public select (builder's call).

**prayer_times**
- `date` (primary key), `imsak`, `subuh`, `syuruk`, `zohor`, `asar`, `maghrib`, `isyak` (local `HH:MM`), `zone`, `fetched_at`

**analytics_events**
- `type`: `qr_scan` | `pwa_install` | `share_click`, `path`, `created_at`. No IP addresses or personal data stored.

Validation carries over from the old spec: URL fields must start with `https://`, `http://` or `/`, with length limits enforced in both the form and the server (and as `CHECK` constraints).

## 8. Uploads (Supabase Storage)

- **The phone does the heavy lifting.** Before upload, the browser resizes images (longest side 1600px) and re-encodes them as WebP or JPEG. Re-encoding strips EXIF and GPS data, and the result is typically under 500KB. This fixes the "phone photos are 2–5MB" problem.
- **Upload straight from the browser** to Supabase Storage with the admin's logged-in session (`supabase.storage.upload`). Files go to `uploads/{table}/{uuid}.{ext}`. This avoids Vercel's ~4.5MB request limit with no extra server step.
- **One bucket, `media`:**
  - public read; logged-in users can write (a Storage RLS policy)
  - bucket settings restrict file types (JPEG, PNG, WebP, PDF) and size (10MB)
- Files are served with long cache lifetimes, since paths never change.
- **Deleting a record deletes its file.** Replacing an image deletes the old file.

## 9. Prayer times

- **Source:** JAKIM e-Solat data for the configured zone. **The zone must be confirmed:** Elmina is expected to be in `SGR01`, but this has to be checked against JAKIM's zone list before launch.
- **Daily sync:** the daily Vercel Cron job fetches the current month (and the next month in the last 7 days of a month) and upserts rows into `prayer_times`.
  - It's scheduled for about 00:10 MYT; Hobby timing may drift within the hour, which is fine.
  - Fetching a whole month gives weeks of slack: one missed run changes nothing.
  - If JAKIM is unreachable, the existing rows are kept and the app keeps showing the last good data.
- The builder chooses the access method: JAKIM's endpoint directly, or a well-maintained public mirror. Either way, it goes behind a small adapter so it can be swapped.
- **Iqamah = azan + the offset from settings.** Offsets are editable in the admin panel. Iqamah is display-only.
- **Homepage widget:** today's six times (Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak), the next prayer highlighted, and a live countdown ("Asar dalam 42 minit"), with iqamah shown beside azan. The countdown runs in the browser.
- **Offline:** the service worker caches the current month's times, so the widget works without internet.

## 9b. Generated schedule poster

The AJK currently hand-design a monthly poster and post it in WhatsApp. The app generates it from the `sessions` data instead.

- **Layout** follows the current poster:
  - **Left panel:** surau logo, month and year, the title "Jadual Kuliah & Program Imarah", the donation panel ("Jom Berinfaq & Imarah", QR code, Bank Islam account), and the program-type legend with colours.
  - **Right side:** a Monday-to-Sunday month grid (ISNIN … AHAD). Each day cell shows its sessions as colour blocks: topic, optional kitab, ustaz name and photo. A day with two sessions splits the cell.
- **The donation panel on the poster is a static asset in the repo** (QR image and bank text), changed only by a code deploy. *(Builder note: my call. It keeps the bank QR out of the admin panel entirely until donations are designed in release 2, so no admin account can swap it.)*
- **Output:** a PNG at the current poster's proportions, sized for WhatsApp (about 2160px wide).
- **Rendering:** a route handler using `next/og` `ImageResponse` (the Satori engine), with a bundled display font. Satori supports flexbox layout only, so the grid is built from flex rows. Ustaz photos are fetched from Storage and embedded.
- **Admin flow:** Jadual → choose month → "Jana poster" (generate poster) → preview → "Muat turun" (download) / "Kongsi" (Web Share API on phones, which goes straight to WhatsApp).
  - The PNG is cached in Storage, keyed by month plus a hash of the month's data, and is regenerated when any session in that month changes.
- **Public:** `/jadual/[yyyy-mm]/poster.png` is also the WhatsApp preview image for the month page.
- **Overflow:** if a cell has too much text, shorten long topics with an ellipsis. Names never shrink below a readable size. The admin preview flags crowded cells.

## 10. Release 2 (parked; listed so release 1 doesn't block it)

- **Donations / collections:** collection posters or PDFs, a QR code and bank details managed in admin (owner-only for the QR, because a swapped QR would redirect donations), plus the homepage "latest collection" card.
- **Azan push notifications.**
  - **Delivery:** Web Push (VAPID).
  - **Opt-in:** users opt in; all 5 azan are on by default after opt-in and can be unticked individually. No iqamah notifications.
  - **Scheduling:** Vercel Hobby cron can't do this (daily only). Instead, a daily Supabase `pg_cron` job books 5 one-off jobs at the exact azan minutes, and each one calls a Supabase Edge Function that sends the notifications and removes itself. Optionally, a free Cloudflare Worker can do the sending so it doesn't depend on Supabase.
  - **Storage:** subscriptions live in Postgres.
  - **Limits:** iOS requires the app to be installed to the Home Screen first. Notifications use the default sound, not azan audio.
- **Optional announcement notifications** reuse the same push setup.
- **Gallery:** albums with phone uploads, using the same resize pipeline. It starts in Supabase Storage and moves to Cloudflare R2 (10GB free, no egress fees) if the 1GB storage or the egress limit becomes tight. Storage access sits behind a small module, so swapping is local.

Release 1 must not paint these into a corner. In practice that means:
- a service worker that can later handle `push` events
- an upload pipeline general enough for gallery photos
- all Storage access going through one module

## 11. Public site

**Navigation**
- Bottom tab bar on phones: Utama, Waktu Solat, Jadual, Hebahan, Lagi.
- Top nav on desktop.

**Routes**
- `/`: overview. In order:
  - hero (`Banner`)
  - prayer-time widget
  - "Malam ini / Hari ini" (tonight/today) sessions beside the prayer widget, then the next 3 upcoming sessions
  - pinned and latest posts
  - the existing hardcoded sections that stay in code: `FAQ`, `Dedicated` (Pengerusi's message)
- **What happens to the other current homepage sections** *(builder note: my call)*:
  - `Aboutus` (the SIAK / Khairat / Kuliah Maghrib cards) is replaced by posts and the schedule. SIAK and Khairat become posts, and Kuliah Maghrib is covered by the schedule.
  - `Articles` (the Buletin grid) is replaced by posts of type `buletin`. Its current items are loaded into the database.
  - `Featured` (the "Galeri" slider) is removed. Qurban and Eidul-Adha become posts linking to their Drive albums. Tadarrus and Gotong Royong are added as program types if the AJK still run them. A real gallery returns in release 2.
  - The navigation's in-page anchors (`#galeri-section` etc.) are replaced by the routes below.
- `/waktu-solat`: today plus a month table.
- `/jadual`: the schedule.
  - **Phones:** an agenda list by default ("Malam ini", "Esok", "Minggu ini", then the rest of the month), because a 7-column grid of photos is unreadable at phone width.
  - **Tablet / desktop:** a month grid in the poster's style by default, with photos and type colours.
  - Filter chips by program type (the colour legend), month navigation, and a "Poster bulan ini" button.
  - `/jadual/[slug]` is the session page: type, topic, kitab, ustaz photo and name, the computed time ("Selepas Maghrib · 7:24 mlm"), "Kongsi ke WhatsApp", and "+ Kalendar" (downloads an `.ics` file).
- `/hebahan`: all posts, filterable by Pengumuman / Buletin. `/hebahan/[slug]` is the detail page.
- `/borang`: links grouped by category.
- `/khairat`, `/siak`, `/tabung`: kept working. `/siak` becomes a post and redirects to its `/hebahan/...` page. `/khairat` (Jotform) and `/tabung` (static page) stay as they are until release 2.

**Sharing:** every detail page sets Open Graph tags through Next.js `generateMetadata` (title, description, image) so WhatsApp shows a preview card. There's also a "Kongsi ke WhatsApp" button (`https://wa.me/?text=...`).

**Rendering and freshness:** public pages are server components that read Supabase with tag-based caching. Supabase calls go through a `fetch` that sets `next: { tags: [...] }`; supabase-js doesn't do this by itself (old review finding). Every admin save calls `revalidateTag` for the affected tables, so edits show publicly straight away. A 1-hour revalidate fallback also keeps Supabase load low.

**Animation:**
- **Library:** **Motion** (`motion`, formerly Framer Motion), loaded with `LazyMotion` + `domAnimation` and the `m` components, to keep the initial cost to a few KB. Simple hovers, presses and colour changes use plain CSS/Tailwind transitions.
- **Use it for:**
  - bottom sheets (the iOS install sheet, filters)
  - cards fading in on scroll
  - switching between the schedule list and month grid
  - tab changes
  - the prayer countdown and next-prayer highlight
  - the admin publish confirmation and poster preview
- **Rules:**
  - subtle and quick (about 150–300ms)
  - content is never hidden behind or delayed by an animation
  - respect `prefers-reduced-motion` (`MotionConfig reducedMotion="user"`)
  - no autoplaying video in release 1

## 12. PWA

- Web app manifest: name, short name "SEV", theme colours from the existing palette, icons (192, 512 and maskable, made from the existing logo), `display: standalone`, `start_url: /?src=pwa`.
- **Service worker:**
  - pre-caches the app shell
  - network-first for pages, falling back to the cached version when offline
  - caches images once seen
  - caches this month's prayer times
  - shows an "Anda di luar talian" offline banner when there's no connection
  - never caches `/admin` pages or admin responses
- **Install prompts:**
  - Android: a custom "Pasang aplikasi" button using `beforeinstallprompt`.
  - iOS: a one-time dismissible sheet showing Share → Add to Home Screen, shown only in Safari when the app isn't installed.
- **Install tracking:** the `appinstalled` event records an `analytics_events` row.

## 13. Admin panel

- **Mobile-first.** The old spec's responsive rules carry over: 44px tap targets, stacked layout on phones, up/down buttons instead of drag-to-reorder on touch.
- **Pages:**
  - Dashboard:
    - content counts
    - this month's installs / QR scans / shares (from `analytics_events`)
    - a link to Vercel Web Analytics for visits
    - "Waktu solat dikemas kini: [date]" (section 15)
    - quick "+ Hebahan" / "+ Sesi" buttons
  - Hebahan
  - Jadual:
    - a month view of sessions (list on phones, grid on larger screens)
    - add/edit a session
    - "Salin bulan lepas" (copy last month)
    - "Ulang setiap minggu" (repeat weekly) when adding
    - "Jana poster" (generate poster)
    - sub-pages for **Jenis Program** (program types: colour and timing) and **Ustaz** (speaker library with photos)
  - Borang & Pautan
  - Tetapan:
    - iqamah offsets and prayer zone
    - **Jemputan** (invite link and admin list, section 6)
- **The "under a minute" flow:** "+ Hebahan" opens a single-screen form with these fields in order:
  - photo (camera or gallery)
  - title
  - type (defaults to Pengumuman)
  - optional text
  - optional link

  Publish takes one tap. After publishing, it shows the share link with a "Kongsi ke WhatsApp" button.
- Delete asks for confirmation ("Padam? Tindakan ini tidak boleh dibatalkan.") and is permanent.
- **Error messages** (Malay, inline):
  - upload rejected (wrong type or too large)
  - save failed (the form keeps its values)
  - session expired (redirect to login)

## 14. Analytics

- **Vercel Web Analytics** (already installed) for visits, top pages and devices. Hafiy views these in the Vercel dashboard. *(Check the Hobby plan's monthly event cap. If it's exceeded, visits stop being counted but nothing breaks.)*
- **Our own counters in Postgres** for what Web Analytics can't attribute:
  - `qr_scan`: the printed QR code points to `/?src=qr`
  - `pwa_install`
  - `share_click`
- Counters are recorded by a public route handler (`/api/track`) that accepts only known event types and inserts with the service role.
- **Abuse protection:** the domain is proxied through Cloudflare, so a **Cloudflare rate-limiting rule** on `/api/track` (the free plan includes one rule) caps requests per IP. No in-memory counters (review finding 3).
- The admin dashboard shows monthly counts of these, plus a link to Vercel Web Analytics.

## 15. Accounts, keep-alive and rollout

**Current state (checked 2026-11-20):**
- **Domain:** `surauelminavalley.com` (plus `www`), served by Vercel.
- **DNS is on Cloudflare** (nameservers `zahir` / `brianna.ns.cloudflare.com`, proxied), in Hafiy's personal Cloudflare account.
- **No MX or TXT records**, so there's no email on the domain.

**Accounts, in two stages (decided 2026-11-20):**
- **Build and demo stage:** the Supabase project and the Vercel project live in **Hafiy's personal accounts**. The new version is demoed to the AJK at **`beta.surauelminavalley.com`**: a Vercel deployment of the feature branch with that subdomain attached, plus a CNAME in the existing Cloudflare zone. Meanwhile, the main domain keeps serving the current site.
- **Production stage:** if the AJK approve:
  1. Transfer the Supabase project to a surau-owned Supabase organisation (Supabase supports project transfer between organisations; no data moves).
  2. Move the Vercel project to a surau-owned Vercel account (Vercel project transfer, or simply re-import the repo, since Vercel holds no data).
  3. Use the surau email `elminavalley@gmail.com` for these accounts. Hafiy is admin, plus a second trusted AJK member as a backup.
  4. Optionally, move the Cloudflare DNS zone to the surau Cloudflare account (created 2026-11-20) later, as its own change. It only holds DNS records and the rate-limit rule.
- **Keep the move easy:** no project URLs, keys or IDs hard-coded in source. All come from environment variables. **Record the domain registrar and who holds its login** in the README.

**Keep-alive (pause risk):**
- The daily Vercel Cron job (`/api/cron/daily`, protected by `CRON_SECRET`) syncs prayer times. That's a guaranteed daily database query, on top of normal visitor traffic, so the free project shouldn't count as inactive.
- The admin dashboard shows "Waktu solat dikemas kini: [date]", the newest `fetched_at` in `prayer_times`. If it's old, something is wrong. No extra table is needed.
- **If pausing ever happens anyway:** upgrade Supabase to Pro (about USD 25 a month), after raising it with Hafiy first per the anti-goals.

**Free-limit watch items:**
- **Supabase egress (about 5GB a month):** images are pre-resized, posters are about 300–600KB, and responses get long cache headers behind the Cloudflare proxy. If egress gets tight, move media to R2 (section 10).
- **Vercel image optimisation cap:** prefer pre-sized uploads with plain `<img>`, or `next/image` with `unoptimized` for Storage images, so the cap isn't consumed (builder's call).

**Steps:**
1. Create the Supabase project (personal account), the schema migrations, RLS, the Storage bucket and Auth settings (one-time code, sign-ups disabled). Seed it with:
   - today's hardcoded posts and links
   - the five program types
   - the November 2026 schedule from the current poster (with the ustaz photos the AJK provide)
2. Build the features in this document on a feature branch.
3. Deploy the branch to `beta.surauelminavalley.com`, check every route (including the old ones), add the AJK as admins, and demo. Content the AJK enter is kept.
4. After AJK approval, transfer the accounts (above), then merge to `main` so `surauelminavalley.com` serves the new app.

## 16. Lessons from the previous spec (must not repeat)

1. Every admin Server Action and route handler checks the user itself (`requireUser()`), and RLS blocks writes from logged-out users. Covered in sections 6 and 7.
2. No in-memory rate limiting on serverless. Covered in section 14.
3. No shared password or static session token. Supabase Auth gives per-person sessions.
4. Upload limits must suit phone photos. Covered in section 8.
5. Tag-based caching needs a tagged `fetch` for supabase-js. Covered in section 11.

## 17. Left to the builder

- Whether to upgrade to Next.js 15 (as the first step if so).
- The query layer: supabase-js with generated types, or Drizzle against Postgres (within the RLS rule in section 6).
- The service worker tooling (e.g. Serwist or hand-written).
- Image handling within the watch items in section 15.
- The test approach. At minimum: unit tests for session time computation (prayer-based and fixed), "Salin bulan lepas" weekday-position mapping, iqamah calculation, `requireUser`, and invite-code validation (wrong code, expired, replaced); an RLS test proving logged-out users can't write; and a snapshot test of the poster layout.
- Visual design details within the existing colour palette and the bottom-tab layout.
