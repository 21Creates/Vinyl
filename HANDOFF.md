# Vinyl — Handoff

Phase 0-5 complete. Fresh rebuild continues at Phase 6.

## Where we are

Phase 5 complete. Listen loop built. Next: Phase 6 (Offline library).

## What's finished (verified)

- Phase 0: Governance files.
- Phase 1: Project skeleton.
- Phase 2: Netlify config verified.
- Phase 3: Supabase + Auth (client, context, signup/login/logout, session, dashboard).
- Phase 4: Database schema + RLS (8 tables, SECURITY DEFINER functions, anon revoked, verify_schema.sql).
- Phase 5: Listen loop — browse page with search + filter (all/free/premium), audio player (play/pause/next/prev/seek/volume/mute), media session API, now-playing bar with progress seek, bottom nav. 5 demo tracks seeded. Build verified.

## What's half-done

Nothing.

## What's next

Phase 6 — Offline library. Service worker, per-track "Available offline in Vinyl" toggle, blob-based cache (NOT URLs), eviction reconciliation. Free cap 3, premium cap 50.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection.

## Environment

- Client env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (pre-populated in hosted environment)
- Server-only: SUPABASE_SERVICE_ROLE_KEY, VINYL_WEBHOOK_SECRET
