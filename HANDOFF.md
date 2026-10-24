# Vinyl — Handoff

Phase 0-11 complete. All phases built and pushed. Ready for launch.

## Where we are

Phase 11 complete. Hardening + launch docs done. All 12 phases (0-11) are finished.

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
- Phase 10: PWA + install — manifest.json with name/short_name/theme/background colors, SVG icons (vinyl record mark, maskable variant, favicon, apple-touch-icon), InstallBanner component with beforeinstallprompt event + dismiss persistence, UpdateBanner with SW update flow (updatefound → statechange → SKIP_WAITING → controllerchange → reload), service worker bumped to v2 with manifest+favicon caching, index.html with apple-mobile-web-app meta tags. Build verified.
- Phase 11: Hardening + launch — Forbidden-patterns scan (no dangerouslySetInnerHTML, eval, innerHTML, or client-side secrets found). Security advisor run: mutable search_path fixed, EXECUTE grants revoked from anon. Remaining advisor warnings are SECURITY DEFINER functions callable by authenticated — these are false positives since all admin functions have internal is_admin() guards. Final README and LAUNCH.md written. Build verified.

## What's half-done

Nothing.

## What's next

Launch. See LAUNCH.md for the pre-launch checklist.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection.

## Environment

- Client env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (pre-populated in hosted environment)
- Server-only: SUPABASE_SERVICE_ROLE_KEY, VINYL_WEBHOOK_SECRET
- Edge function deployed: payment-webhook (verify_jwt=false, HMAC-signed)
- Migrations applied: 0001-0007 (0007 = security hardening)
