# Vinyl — Handoff

Phase 0-6 complete. Fresh rebuild continues at Phase 7.

## Where we are

Phase 6 complete. Offline library built. Next: Phase 7 (Premium + payment).

## What's finished (verified)

- Phase 0: Governance files.
- Phase 1: Project skeleton.
- Phase 2: Netlify config verified.
- Phase 3: Supabase + Auth (client, context, signup/login/logout, session, dashboard).
- Phase 4: Database schema + RLS (8 tables, SECURITY DEFINER functions, anon revoked, verify_schema.sql).
- Phase 5: Listen loop — browse page with search + filter (all/free/premium), audio player (play/pause/next/prev/seek/volume/mute), media session API, now-playing bar with progress seek, bottom nav. 5 demo tracks seeded. Build verified.
- Phase 6: Offline library — IndexedDB blob cache (audio-blobs store), OfflineContext with tier-aware caps (free 3, premium 50 from app_settings), service worker (caches app shell, never touches audio/media), per-track offline toggle on Browse page, Library page showing cached tracks with play/remove, resolveAudioSrc in PlayerContext checks cached blob before streaming. Build verified clean.

## What's half-done

Nothing.

## What's next

Phase 7 — Premium + payment. Plan config in admin, checkout from real settings, proof upload, HMAC-signed webhook with Apps Script template in admin. Free users can never self-activate.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection.

## Environment

- Client env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (pre-populated in hosted environment)
- Server-only: SUPABASE_SERVICE_ROLE_KEY, VINYL_WEBHOOK_SECRET
