# Surau Elmina Valley (SEV)

Installable web app (PWA) for the surau: prayer times, the kuliah and program schedule (with a generated monthly poster), announcements, forms, and a mobile-first AJK admin panel.

- **Stack:** Next.js 14 (App Router) on Vercel, Supabase (Postgres, Auth, Storage), Tailwind, Motion, Serwist (service worker).
- **Design and plan:** `docs/superpowers/specs/2026-11-20-surau-web-app-design.md` and `docs/superpowers/plans/2026-11-20-surau-web-app.md`.

## Local setup

Requires Node 22.18 or newer.

```powershell
npm install
Copy-Item .env.example .env.local   # then fill it in (see below)
npm run dev
```

Other scripts: `npm test`, `npm run typecheck`, `npm run build`, `npm run seed:content`.

## Supabase setup (once per project)

1. Create a Supabase project. For the demo it can sit in a personal account; see "Accounts and transfer".
2. In **SQL Editor**, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. **Authentication → Providers → Email:**
   - turn **off** "Allow new users to sign up" (only invited people may log in)
   - set the email OTP expiry to **600** seconds
4. **Authentication → Email Templates → Magic Link:** the app logs people in with a 6-digit code, so the template must contain the code. Add `{{ .Token }}` to the body, for example: `Kod log masuk anda: {{ .Token }}`.
5. **Email delivery:** Supabase's built-in email sender allows only a handful of emails per hour. Before the AJK start using the app, set up **custom SMTP** (Authentication → SMTP Settings, for example Resend's free tier). Otherwise logins will fail with "email rate limit exceeded".
6. Copy the project URL, `anon` key and `service_role` key (Settings → API) into `.env.local` / Vercel. The service-role key is secret and never goes into client code.
7. Load the current content: `npm run seed:content -- --dry-run`, then `npm run seed:content`. It refuses to run twice.
8. Create the first admin yourself: **Authentication → Users → Add user** (your email, tick auto-confirm). Everyone else joins through an invite link.

## Vercel deploy

1. Import the repo. Set the five variables from `.env.example` for Production and Preview. `CRON_SECRET` can be any long random string; Vercel sends it automatically to the cron job.
2. `vercel.json` schedules `/api/cron/daily` once a day (00:10 Malaysia time). It downloads prayer times from JAKIM and keeps the free Supabase project active.
3. **Beta site:** add `beta.surauelminavalley.com` to the Vercel project, and add the CNAME record it asks for in the Cloudflare DNS zone. The main domain keeps serving the old site until go-live.
4. Set `NEXT_PUBLIC_SITE_URL` to the origin you are deploying (for example `https://beta.surauelminavalley.com`); invite links use it.

## Cloudflare rate limit for `/api/track`

The public counter endpoint has no in-app rate limit (serverless instances do not share memory). Add one rule in Cloudflare (Security → WAF → Rate limiting rules, free plan): requests to `/api/track` limited to about 30 per minute per IP, action "Block".

## Panduan AJK (Bahasa Melayu)

- **Hebahan baharu:** Admin → Hebahan → **+ Hebahan**. Pilih gambar, tulis tajuk, tekan **Siarkan**. Selepas itu tekan **Kongsi ke WhatsApp**.
- **Jadual bulan baharu:** Admin → Jadual → pilih bulan → **Salin bulan lepas**, kemudian sunting topik dan ustaz. Untuk program mingguan, gunakan **+ Sesi** dan tanda **Ulang setiap minggu**.
- **Poster jadual:** Admin → Jadual → **Jana poster**, kemudian **Muat turun** atau **Kongsi**.
- **Tambah AJK:** Admin → Tetapan → Jemputan → **Jana pautan jemputan**, hantar pautan dalam kumpulan WhatsApp AJK sahaja. Pautan sah 7 hari.
- **Buang AJK:** minta Hafiy memadam pengguna di Supabase (Authentication → Users). Capaian mereka terhenti serta-merta.

## Accounts and transfer

The demo runs on personal Vercel and Supabase accounts. If the AJK approve, move both to a surau-owned account (`elminavalley@gmail.com` was created on 2026-11-20; add a second trusted AJK member as admin):

1. **Supabase:** Project Settings → General → Transfer project (to an organisation owned by the surau account). No data moves.
2. **Vercel:** transfer the project to the surau team, or re-import the repo there and copy the environment variables.
3. **Cloudflare DNS:** the zone `surauelminavalley.com` is in a personal Cloudflare account. Moving it to the surau account is a separate change, done a few days before go-live (copy all DNS records first; update nameservers at the registrar if Cloudflare gives new ones).

No project URLs, keys or IDs are hard-coded; everything comes from environment variables.

**Domain registrar and login holder:** _to be filled in by Hafiy._

## Before launch checklist

- [ ] **First of all:** in Supabase, Authentication → Providers → Email, "Allow new users to sign up" is OFF. It is ON by default in new projects, and while it is on, anyone holding the public key can sign up and write to the database.
- [ ] Confirm the donation details printed on the generated poster (`lib/poster/donation.ts`) match the real bank account.
- [ ] Confirm the JAKIM zone for Elmina (`SGR01` is assumed) in Tetapan, and the iqamah offsets (placeholders: Subuh 15, others 10 minutes).
- [ ] Ask the AJK to check ustaz names and spellings, and to upload their photos (Admin → Jadual → Ustaz).
- [ ] Custom SMTP is configured (see Supabase setup, step 5).
- [ ] Test on a real Android phone (Chrome: install prompt, offline) and a real iPhone (Safari: Add to Home Screen guide).
- [ ] Share a `/hebahan/...` link and a `/jadual?bulan=...` link in WhatsApp and check the preview card.
- [ ] Add the Cloudflare rate-limit rule for `/api/track`.
- [ ] Printed QR codes point to `/?src=qr` so scans are counted.

## Release 2 (parked)

Azan push notifications, the donations/collections section, and the photo gallery. See section 10 of the design document.
