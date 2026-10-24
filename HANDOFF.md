# Vinyl — Handoff

Phase 0-9 complete. Fresh rebuild continues at Phase 10.

## Where we are

Phase 9 complete. Admin + Settings built. Next: Phase 10 (PWA + install).

## What's finished (verified)

- Phase 0: Governance files.
- Phase 1: Project skeleton.
- Phase 2: Netlify config verified.
- Phase 3: Supabase + Auth (client, context, signup/login/logout, session, dashboard).
- Phase 4: Database schema + RLS (8 tables, SECURITY DEFINER functions, anon revoked, verify_schema.sql).
- Phase 5: Listen loop — browse page, audio player, media session API, now-playing bar, bottom nav. 5 demo tracks seeded.
- Phase 6: Offline library — IndexedDB blob cache, OfflineContext, service worker, Library page, resolveAudioSrc.
- Phase 7: Premium + payment — Upgrade page, Admin payment approval, payment-webhook edge function (HMAC-signed).
- Phase 8: Rooms — RoomsPage, RoomDetailPage, invite codes, auto-join via link, member approval, regenerate code.
- Phase 9: Admin + Settings — Full Settings tab with batch save, dirty indicator, all app_settings fields configurable, audit log tab showing settings change history. App falls back to DEFAULT_SETTINGS if fetch fails. Build verified.

## What's half-done

Nothing.

## What's next

Phase 10 — PWA + install. Manifest, icons (mark at 16x16), maskable, apple-touch-icon, splash, install prompt, SW update flow, honest push scoping.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection.

## Environment

- Client env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (pre-populated in hosted environment)
- Server-only: SUPABASE_SERVICE_ROLE_KEY, VINYL_WEBHOOK_SECRET
- Edge function deployed: payment-webhook (verify_jwt=false, HMAC-signed)
