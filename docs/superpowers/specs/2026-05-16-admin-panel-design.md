# Admin Panel Design Spec
**Date:** 2026-05-16  
**Project:** Surau Elmina Valley (SEV) — Next.js 14 / TypeScript / TailwindCSS  
**Status:** Approved (rev 2 — post-review hardening)

---

## Overview

Add a password-protected admin panel at `/admin` for non-engineer team members to manage four content types: Pengumuman, Buletin, Galeri, and Pautan. Content is stored in Supabase (PostgreSQL + Storage). The public site reads from Supabase with Next.js caching; the admin panel writes via Next.js Server Actions.

---

## Architecture

### Page Structure

```
middleware.ts               ← project root, matcher: /admin/:path*
app/
  admin/
    layout.tsx              ← separate layout, no public Navbar/Footer
    login/
      page.tsx              ← password form
    dashboard/
      page.tsx              ← overview with stat cards per section
    pengumuman/
      page.tsx              ← list + add/edit form
    buletin/
      page.tsx
    galeri/
      page.tsx
    pautan/
      page.tsx
  api/admin/
    auth/
      route.ts              ← POST: login; DELETE: logout
    upload/
      route.ts              ← POST: multipart → Supabase Storage → public URL
```

### Middleware

`middleware.ts` at the **project root** with matcher `/admin/:path*`. Runs on all `/admin/*` routes except `/admin/login`. Reads `sev-admin-session` cookie. If missing or invalid, redirects to `/admin/login?redirect=<original-path>`.

Cookie value: HMAC-SHA256 of `ADMIN_PASSWORD` using a `SESSION_SECRET` env var as the key — this means rotating the password also invalidates existing sessions.

### Authentication

- `ADMIN_PASSWORD` in `.env.local` — the password admins type
- `SESSION_SECRET` in `.env.local` — random 32-byte hex string used to sign the session cookie
- `POST /api/admin/auth`: timing-safe comparison of submitted password against `ADMIN_PASSWORD`; on match sets `sev-admin-session` (httpOnly, Secure, SameSite=Lax, 7-day expiry)
- **Rate limiting**: max 5 failed attempts per IP per 15 minutes (in-memory counter, resets on server restart — sufficient for this scale)
- `DELETE /api/admin/auth`: clears the cookie (logout)
- Changing `ADMIN_PASSWORD` env var and redeploying invalidates all existing sessions (HMAC key changes)
- No user accounts, no registration

### Image Uploads

- Client POSTs multipart form data to `/api/admin/upload`
- Server-side validation before accepting:
  - Max 500KB (reject with 413 if exceeded)
  - MIME type validated against actual file bytes (not just extension): allow `image/jpeg`, `image/png`, `image/webp`
  - Filename sanitised: stored as `{uuid}.{ext}` under `thumbnails/{table}/` — no original filename retained
  - EXIF data stripped before upload (using `sharp`) to prevent GPS/metadata leakage
- Upload to Supabase Storage `thumbnails/` bucket; returns public URL
- **On record delete**: Server Action also deletes the associated Storage object by path

---

## Data Layer (Supabase)

### Tables

**pengumuman**
| Column | Type | Constraints |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| heading | varchar(200) | NOT NULL |
| thumbnail_url | text | NOT NULL |
| description | text | NOT NULL |
| link | varchar(500) | NOT NULL |
| sort_order | integer | NOT NULL default 0 |
| deleted_at | timestamptz | nullable — soft delete |
| created_at | timestamptz | NOT NULL default now() |

**buletin**
| Column | Type | Constraints |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| heading | varchar(200) | NOT NULL |
| heading2 | varchar(200) | NOT NULL |
| thumbnail_url | text | NOT NULL |
| date | timestamptz | NOT NULL — stored as full timestamp, formatted for display using locale (e.g. "16 Mei 2026") |
| link | varchar(500) | NOT NULL |
| sort_order | integer | NOT NULL default 0 |
| deleted_at | timestamptz | nullable |
| created_at | timestamptz | NOT NULL default now() |

**galeri**
| Column | Type | Constraints |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| heading | varchar(200) | NOT NULL |
| thumbnail_url | text | NOT NULL |
| link | varchar(500) | NOT NULL — Google Drive album or YouTube URL |
| type | varchar(10) | NOT NULL, CHECK (type IN ('photo','video')) |
| sort_order | integer | NOT NULL default 0 |
| deleted_at | timestamptz | nullable |
| created_at | timestamptz | NOT NULL default now() |

**pautan**
| Column | Type | Constraints |
|---|---|---|
| id | uuid (PK) | default gen_random_uuid() |
| title | varchar(200) | NOT NULL |
| url | varchar(500) | NOT NULL |
| description | varchar(500) | nullable |
| category | varchar(50) | NOT NULL default 'Umum' — see categories below |
| sort_order | integer | NOT NULL default 0 |
| deleted_at | timestamptz | nullable |
| created_at | timestamptz | NOT NULL default now() |

**Pautan categories** (stored as text, no separate table): `Borang`, `Dokumen`, `Program`, `Sumbangan`, `Media`, `Umum`

### Soft Delete

All tables have `deleted_at`. Admin "Padam" sets `deleted_at = now()`. Public site and admin list queries filter `WHERE deleted_at IS NULL`. No restore UI in this phase — recovery via Supabase dashboard if needed.

### App-Level Validation

All URL fields: must start with `http://`, `https://`, or `/` (relative internal path). Enforced in the Server Action before writing. `varchar` length limits are enforced both at the form level (maxLength) and DB level (column constraint).

### Supabase Setup

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public site reads (SELECT only via RLS)
- `SUPABASE_SERVICE_ROLE_KEY` — Server Actions/API routes writes — never sent to browser
- Storage bucket `thumbnails`: public read access, service-role write
- RLS on all tables: anon gets `SELECT WHERE deleted_at IS NULL`; writes require service role

---

## Public Site Data Fetching

Buletin and Galeri components will become async Server Components. Pengumuman and Pautan will be new async Server Components.

Fetching strategy:
- Use `supabase` client with Next.js `fetch` cache tags per table (e.g., `tags: ['buletin']`)
- Each Server Action that mutates a table calls `revalidateTag('<table>')` to bust the cache
- Cache TTL: 1 hour (`revalidate: 3600`) as fallback — mutations bust it immediately via tag

This means the public site does not hit Supabase on every visitor request; only on cache miss or after admin edits.

---

## Admin Panel UI

### Responsive Requirements

Admin panel must be fully usable on **mobile and tablet** (committee members use phones). Specific requirements:
- Sidebar collapses to a hamburger menu on screens < 768px
- Two-panel CRUD layout stacks vertically on mobile (form below list)
- Upload zone tap-friendly (min 44px tap targets)
- Drag-to-reorder degrades to up/down arrow buttons on touch devices where drag is unreliable

### Layout

Sidebar with Malay labels: Dashboard, Pengumuman, Buletin, Galeri, Pautan, Log Keluar.

### Dashboard (`/admin/dashboard`)

- Four stat cards (item count per section), each linking to that section
- Recent Pengumuman table with Edit/Padam actions
- **Loading state**: skeleton cards while counts load
- **Empty state**: each section card shows "Tiada rekod" if count is 0

### Section Pages (same pattern for all 4)

Two-panel layout (stacks on mobile):
- **Left** — item list with drag handles, Edit/Padam per item, "+ Tambah Baharu" button
- **Right** — form panel, opens on Edit or new; closes on Save/Batal

**Loading states**: list shows skeleton rows on initial load  
**Empty state**: "Tiada rekod lagi. Klik '+ Tambah Baharu' untuk mula." centred in the list panel  
**Upload progress**: progress bar shown inside the upload zone while file is uploading

### Forms per Section

**Pengumuman:** Tajuk (max 200), Thumbnail (upload), Penerangan, Pautan (URL)

**Buletin:** Tajuk Utama (max 200), Tajuk Kecil (max 200), Thumbnail (upload), Tarikh (datetime-local picker → stored as `timestamptz`, displayed with Malay locale formatting), Pautan (URL)

**Galeri:** Tajuk (max 200), Thumbnail (upload), Pautan Album/Video (URL), Jenis (Photo / Video toggle)

**Pautan:** Tajuk (max 200), URL, Penerangan (optional, max 500), Kategori (dropdown: Borang / Dokumen / Program / Sumbangan / Media / Umum)

### Drag-to-Reorder

Uses `@dnd-kit/core` and `@dnd-kit/sortable`. On drop, saves updated `sort_order` for all items in the list via a single Server Action. On mobile/touch, falls back to up/down arrow buttons that swap adjacent `sort_order` values.

**Known limitation**: if two admins reorder simultaneously (extremely unlikely for this use case), the last write wins. No optimistic locking needed at this scale.

---

## Public Site Integration

**Buletin** (`Articles/index.tsx`) — replace hardcoded array with Supabase read, convert to Server Component.

**Galeri** (`Featured/index.tsx`) — same.

**Pengumuman** — new section inserted between Banner and Aboutus.

**Pautan** — new section inserted between FAQ and Dedicated.

---

## Observability / Logging

Structured `console.error` logs (picked up by Vercel logs) for:
- Auth failures: `{ event: 'auth_failure', ip, timestamp }`
- Rate limit hit: `{ event: 'auth_rate_limited', ip, timestamp }`
- Upload failures: `{ event: 'upload_failure', error, filename_hash, size }`
- Server Action errors: `{ event: 'action_error', action, error }`

No external logging service needed at this scale.

---

## Environment Variables

```
ADMIN_PASSWORD=             # password admins type at login
SESSION_SECRET=             # random 32-byte hex, signs session cookie
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Error Handling

- Upload fails: inline error under upload zone; record not saved
- MIME/size rejected: inline error; no Supabase call made
- Supabase write fails: toast error; form stays open with existing values
- Wrong password: "Kata laluan salah" inline; no cookie set
- Rate limited: "Terlalu banyak percubaan. Cuba lagi selepas 15 minit."
- Middleware rejects: redirect to `/admin/login?redirect=<path>`

---

## Out of Scope

- Slug fields and detail pages (future enhancement — add when per-item pages are needed)
- Multiple admin accounts / user management
- Draft/publish workflow (all saves are immediately live)
- Rich text editor (plain textarea)
- Image cropping or resizing
- Restore UI for soft-deleted records (use Supabase dashboard)
- Audit log / change history
- Concurrency/optimistic locking (single-admin use case)
