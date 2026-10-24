# Vinyl — Handoff

Phase 0 complete. Phase 1 complete. Phase 2 complete. Phase 3 complete. Phase 4 complete. Fresh rebuild continues at Phase 5.

## Where we are

Phase 4 complete. Database schema + RLS built. Next: Phase 5 (Listen loop).

## What's finished (verified)

- Security check on reference repo (21Creates/music): PASSED — no leaked credentials found.
- Phase 0: All governance files created.
- Phase 1: Project skeleton built.
- Phase 2: Netlify deploy config verified.
- Phase 3: Supabase client, auth context, signup/login/logout, session persistence, protected dashboard. Build verified.
- Phase 4: Core database schema — tracks, rooms, room_members, room_tracks, payments, app_settings, settings_audit_log. All tables have RLS. All policies scoped per CRUD verb. SECURITY DEFINER functions for admin-only operations (insert/update/delete tracks, update payment status, update settings). is_admin() helper. generate_invite_code(). Default settings seeded. Anon access fully revoked (signed-in app). verify_schema.sql with exploit demonstrations. Security posture verified.

## What's half-done

Nothing.

## What's next

Phase 5 — Listen loop. Browse, search, filter, player (play/pause/next/prev/seek), media session, now-playing bar with safe-area. Seed 3-5 demo tracks in a migration.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection. If Netlify is not yet connected to your GitHub repo, connect it at netlify.com → Add new site → Import existing project → select your repo. Once connected, every push auto-deploys.

## Environment

- Client env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (pre-populated in hosted environment)
- Server-only: SUPABASE_SERVICE_ROLE_KEY, VINYL_WEBHOOK_SECRET
