# SAGEC website + CMS — progress and handoff

The new SAGEC site lives in `web/`: one Next.js app holding both the public website and a hand-built CMS
at `/admin`, built the same way as the BrightLink CMS (Next.js + Prisma + PostgreSQL + Cloudflare R2), with
every BrightLink feature **except languages** (SAGEC is English only: no translation tables, no `/fr` routes).

`cms/` (Payload + MongoDB) and `frontend/` (Vite) stay in the repo, untouched, until Phase 7: they are the
reference for the content and design being moved over, and the source of the content import.

Each phase is one pull request. Web CI (`.github/workflows/web-ci.yml`) must be green before merging.
**sagecltd.com goes live once, after Phase 7.**

| # | Phase | Status |
|---|---|---|
| 1 | Foundation: schema, login, users, activity log, R2 media library, SAGEC-branded admin shell, CI | **this PR** |
| 2 | Site settings (company, contact, socials, logos, SEO defaults, **Google Analytics**, Search Console, fonts, parallax/smooth-scroll), header and footer editors with draft → publish → version history | |
| 3 | Collections: services, projects (+ gallery), testimonials, partners, stats, job openings, messages (+ email notification, Turnstile, rate limit, CSV export), trash, slug redirects | |
| 4 | Page builder: SAGEC section catalogue built from the existing site's sections, layouts, backgrounds, SEO panel, draft/publish, versions | |
| 5 | Blog: categories, tags, authors, Tiptap editor, scheduling, comment moderation, SEO assistant, RSS | |
| 6 | Public site ported from `frontend/` into Next.js and drawn from the CMS: real share previews, sitemap, canonical addresses, Google Analytics on public pages | |
| 7 | Content import from the old Atlas database + local images → PostgreSQL + R2, deploy (Caddy block, PM2, GitHub Actions releases, nightly backup), remove `cms/` and `frontend/` | |

## What Phase 1 added
- `prisma/schema.prisma` + `prisma/migrations/…_init`: users, sessions, media assets (one `alt` field), activity log.
  Later phases add their own tables with their own migrations.
- Login (scrypt passwords, hashed session tokens, 5-failure lockout), `/admin/users` (add, deactivate, reset
  passwords, change your own), `/admin/activity`, middleware guard on every `/admin` page.
- `/admin/media`: photos converted to WebP in up to 4 widths (≤2400 / 1600 / 960 / 480) with a blur placeholder;
  videos uploaded from the browser straight to R2; descriptions (alt text); search; trash / restore / delete.
- SAGEC look: navy `#1B2A4A` / orange `#F26522` tokens in `src/styles/admin-tokens.css` (contrast checked),
  Plus Jakarta Sans + Inter self-hosted from npm (no Google Fonts request), SAGEC logo on the login screen and
  a light version on the navy sidebar.
- The sidebar only lists screens that exist; each phase adds its links.
- `src/app/(site)/page.tsx` is a placeholder until Phase 6.

## Verified (Phase 1)
In the sandbox, against PostgreSQL 16 and an S3 emulator standing in for R2, on the production build
(standalone server, as on the VPS):
typecheck · lint · 10 unit tests · `next build` · init migration applies with 0 errors · CI smoke checks
(all CMS screens redirect without a session, a forged session cookie is refused after a database check, the
upload endpoint answers 401) · in a real Chrome: wrong password refused, right password → dashboard, photo
upload (4 WebP sizes stored), description saved and kept after reload, second user added, activity log shows
both, logout locks the CMS, no JavaScript errors, phone layout.

## Not tested — check these yourself
- **Real Cloudflare R2** (only an emulator): upload, the public address, the CORS rule for video uploads.
- **Video upload** (needs the R2 CORS rule; not exercised against the emulator).
- ~~`prisma migrate deploy`~~ confirmed by Web CI on PR #3. (Prisma's engines could not be downloaded in the sandbox, so the init SQL was
  taken from BrightLink's Prisma-generated migration for the same tables and applied with `psql`. The CI
  step "Migrations match the schema" runs Prisma's own comparison on GitHub and fails if they ever differ.)

## Decisions to keep
- English only. Text lives on the row; no `*Translation` tables, no locale routes, no language switcher.
- PostgreSQL on the VPS (the one BrightLink already uses — no second database engine), media on Cloudflare R2.
- Public site moves into Next.js (Phase 6) for real share previews on WhatsApp/LinkedIn and one PM2 process.
- Session cookie: `sagec_admin_session`, scoped to `/admin`.
- Local database on port 5434 (`docker compose up -d`), so it runs next to BrightLink's on 5433.
