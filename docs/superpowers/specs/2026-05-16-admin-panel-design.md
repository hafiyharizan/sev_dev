# Admin Panel Design Spec
**Date:** 2026-05-16  
**Project:** Surau Elmina Valley (SEV) — Next.js 14 / TypeScript / TailwindCSS  
**Status:** Approved

---

## Overview

Add a password-protected admin panel at `/admin` for non-engineer team members to manage four content types: Pengumuman, Buletin, Galeri, and Pautan. Content is stored in Supabase (PostgreSQL + Storage). The public site reads from Supabase; the admin panel writes to it via Next.js Server Actions.

---

## Architecture

### Page Structure

```
app/
  admin/
    layout.tsx          ← separate layout, no public Navbar/Footer
    middleware.ts        ← redirects all /admin/* to /admin/login if no session cookie
    login/
      page.tsx           ← password form
    dashboard/
      page.tsx           ← overview with stat cards per section
    pengumuman/
      page.tsx           ← list + add/edit form
    buletin/
      page.tsx
    galeri/
      page.tsx
    pautan/
      page.tsx
  api/admin/
    auth/
      route.ts           ← POST: checks ADMIN_PASSWORD env var, sets httpOnly cookie; DELETE: clears cookie (logout)
    upload/
      route.ts           ← POST: accepts multipart form, streams to Supabase Storage, returns public URL
```

### Middleware

`middleware.ts` lives at the **project root** (Next.js requirement) with a matcher for `/admin/:path*`. It runs on all `/admin/*` routes except `/admin/login`. Reads a session cookie (`sev-admin-session`). If missing or invalid, redirects to `/admin/login`. The cookie value is a static token derived from `ADMIN_PASSWORD` (SHA-256 hash) — no JWT library required.

### Authentication

- Single password stored in `.env.local` as `ADMIN_PASSWORD`
- `POST /api/admin/auth` compares submitted password against env var
- On match: sets `sev-admin-session` httpOnly cookie (7-day expiry)
- On mismatch: returns 401
- Logout: `DELETE /api/admin/auth` clears the cookie
- No user accounts, no registration flow

### Image Uploads

- Admin uploads thumbnail via the UI form
- Client POSTs multipart form data to `/api/admin/upload`
- API route streams the file to Supabase Storage bucket `thumbnails/`
- Returns the public URL, which is saved in the database record
- Max file size enforced: 500KB (checked server-side before upload)
- Accepted formats: JPG, PNG, WebP

---

## Data Layer (Supabase)

### Tables

**pengumuman**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | auto-generated |
| heading | text | required |
| thumbnail_url | text | Supabase Storage public URL |
| description | text | required |
| link | text | internal path or external URL |
| sort_order | integer | controls display order on site |
| created_at | timestamptz | auto |

**buletin**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| heading | text | main heading |
| heading2 | text | subtitle |
| thumbnail_url | text | |
| date | text | display date string e.g. "Mei 16, 2026" |
| link | text | |
| sort_order | integer | |
| created_at | timestamptz | |

**galeri**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| heading | text | |
| thumbnail_url | text | shown in carousel |
| link | text | Google Drive album URL or YouTube embed URL |
| type | text | `photo` or `video` — CHECK constraint enforced at DB level |
| sort_order | integer | |
| created_at | timestamptz | |

**pautan**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| title | text | |
| url | text | |
| description | text | optional short description |
| sort_order | integer | |
| created_at | timestamptz | |

### Supabase Setup

- Public anon key: used by the public site to read data (select only)
- Service role key: used by Server Actions/API routes to write data — stored in `SUPABASE_SERVICE_ROLE_KEY` env var, never exposed to the browser
- Storage bucket `thumbnails`: public read, service-role write
- Row Level Security (RLS): enable on all tables; anon role gets SELECT only; writes require service role

---

## Admin Panel UI

### Layout

All admin pages share a sidebar layout (`app/admin/layout.tsx`) with no public Navbar or Footer. Sidebar links: Dashboard, Pengumuman, Buletin, Galeri, Pautan, Log Keluar. All labels in Malay.

### Dashboard (`/admin/dashboard`)

- Four stat cards showing item count per section
- Each card links to that section's management page
- Recent items table (Pengumuman) with quick Edit/Padam actions

### Section Pages (same structure for all 4)

Two-panel layout:
- **Left panel** — list of existing items as cards, drag handles for reordering (`sort_order`), Edit and Padam buttons per item, "+ Tambah Baharu" button at top
- **Right panel** — form that opens when Edit or "+ Tambah Baharu" is clicked; closes (returns to empty state) on Save or Batal

### Forms per Section

**Pengumuman form fields:** Tajuk, Thumbnail (upload), Penerangan, Pautan (URL)

**Buletin form fields:** Tajuk Utama, Tajuk Kecil, Thumbnail (upload), Tarikh (text), Pautan (URL)

**Galeri form fields:** Tajuk, Thumbnail (upload), Pautan Album/Video (URL), Jenis (photo / video toggle)

**Pautan form fields:** Tajuk, URL, Penerangan (optional)

### Drag-to-Reorder

Items have a drag handle (`⠿`). Uses `@dnd-kit/core` and `@dnd-kit/sortable` for drag interaction. On drop, saves the new `sort_order` values for all affected items via a single Server Action call. The public site reads items ordered by `sort_order ASC`.

---

## Public Site Integration

The existing hardcoded data in `Articles/index.tsx` (Buletin) and `Featured/index.tsx` (Galeri) will be replaced with Supabase reads. These components will become async Server Components that fetch from Supabase on each request.

Pengumuman will be a new section inserted between Banner and Aboutus (prominent placement for announcements). Pautan will be a new section inserted between FAQ and Dedicated (utility links near the bottom). Both will be async Server Components reading from Supabase.

---

## Environment Variables

```
ADMIN_PASSWORD=          # plain text password for admin login
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Error Handling

- Upload fails: show inline error under the upload zone, do not save the record
- Supabase write fails: show toast error, keep the form open with existing values
- Login wrong password: show "Kata laluan salah" inline, do not set cookie
- Middleware rejects: redirect to `/admin/login` with a `?redirect` param so the user lands back after login

---

## Out of Scope

- Multiple admin accounts / user management
- Draft/publish workflow (all saved items are live immediately)
- Rich text editor for descriptions (plain textarea)
- Image cropping or resizing in the browser
- Audit log / change history
