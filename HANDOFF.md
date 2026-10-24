# Vinyl — Handoff

Phase 0 complete. Phase 1 complete. Phase 2 complete. Phase 3 complete. Fresh rebuild continues at Phase 4.

## Where we are

Phase 3 complete. Supabase + Auth built. Next: Phase 4 (Database schema + RLS).

## What's finished (verified)

- Security check on reference repo (21Creates/music): PASSED — no leaked credentials found.
- Phase 0: All governance files created.
- Phase 1: Project skeleton built.
- Phase 2: Netlify deploy config verified.
- Phase 3: Supabase client, auth context (signup, login, logout, session persistence), profiles table with auto-create trigger, protected dashboard. Build verified (tsc + vite build pass). RLS enabled on profiles — users can only read/update their own profile, tier and is_admin are server-controlled (not in client grant).

## What's half-done

Nothing.

## What's next

Phase 4 — Database schema + RLS. Numbered migrations for tracks, rooms, room_members, offline_saves, payments, app_settings. Every table has RLS. Every policy has a comment. verify_schema.sql that attempts exploits and shows them failing.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection. If Netlify is not yet connected to your GitHub repo, connect it at netlify.com → Add new site → Import existing project → select your repo. Once connected, every push auto-deploys.

## Environment

- Client env vars (set in Netlify dashboard or local `.env`):
  - `VITE_SUPABASE_URL` — Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — Supabase anon (public) key
- Server-only (NEVER in client code):
  - `SUPABASE_SERVICE_ROLE_KEY` — used only in Edge Functions
  - `VINYL_WEBHOOK_SECRET` — HMAC secret for payment webhook verification
- Note: The Supabase instance is provisioned. These vars are pre-populated in the hosted environment. For local dev, copy .env.example to .env and fill in values.
