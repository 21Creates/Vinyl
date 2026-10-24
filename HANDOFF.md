# Vinyl — Handoff

Phase 0-8 complete. Fresh rebuild continues at Phase 9.

## Where we are

Phase 8 complete. Rooms built. Next: Phase 9 (Admin + Settings).

## What's finished (verified)

- Phase 0: Governance files.
- Phase 1: Project skeleton.
- Phase 2: Netlify config verified.
- Phase 3: Supabase + Auth (client, context, signup/login/logout, session, dashboard).
- Phase 4: Database schema + RLS (8 tables, SECURITY DEFINER functions, anon revoked, verify_schema.sql).
- Phase 5: Listen loop — browse page with search + filter, audio player, media session API, now-playing bar, bottom nav. 5 demo tracks seeded.
- Phase 6: Offline library — IndexedDB blob cache, OfflineContext with tier-aware caps, service worker, Library page, resolveAudioSrc.
- Phase 7: Premium + payment — Upgrade page, Admin page (payment approval, Apps Script template), payment-webhook edge function (HMAC-signed). Build verified.
- Phase 8: Rooms — RoomsPage (list my rooms, discoverable rooms, create room premium-only, join by invite code, auto-join via ?invite=LINK), RoomDetailPage (invite code copy + regenerate, pending member approval/reject for creators, track list with play, leave room), migration 0006 (regenerate_invite_code, approve_room_member, reject_room_member SECURITY DEFINER functions, delete rooms policy). Build verified.

## What's half-done

Nothing.

## What's next

Phase 9 — Admin + Settings. Feature config (single source of truth, batch save with dirty indicator), file uploads only (no URLs), subscription approvals, room approvals, Settings page with audit log and is_protected flag. App falls back to DEFAULT_SETTINGS if fetch fails.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection.

## Environment

- Client env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (pre-populated in hosted environment)
- Server-only: SUPABASE_SERVICE_ROLE_KEY, VINYL_WEBHOOK_SECRET
- Edge function deployed: payment-webhook (verify_jwt=false, HMAC-signed)
