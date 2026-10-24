# Vinyl — Handoff

Phase 0-7 complete. Fresh rebuild continues at Phase 8.

## Where we are

Phase 7 complete. Premium + payment built. Next: Phase 8 (Rooms).

## What's finished (verified)

- Phase 0: Governance files.
- Phase 1: Project skeleton.
- Phase 2: Netlify config verified.
- Phase 3: Supabase + Auth (client, context, signup/login/logout, session, dashboard).
- Phase 4: Database schema + RLS (8 tables, SECURITY DEFINER functions, anon revoked, verify_schema.sql).
- Phase 5: Listen loop — browse page with search + filter, audio player, media session API, now-playing bar, bottom nav. 5 demo tracks seeded.
- Phase 6: Offline library — IndexedDB blob cache, OfflineContext with tier-aware caps, service worker, Library page, resolveAudioSrc.
- Phase 7: Premium + payment — Upgrade page (pricing from settings, bank details, proof upload to private storage bucket), Admin page (payment approval queue with approve/reject via admin_update_payment_status RPC, Apps Script webhook template with HMAC signing), payment-webhook edge function deployed (HMAC signature verification, status: submitted/approved/rejected, free users can never self-activate — only admin RPC or signed webhook can upgrade tier). Build verified.

## What's half-done

Nothing.

## What's next

Phase 8 — Rooms. Invite codes (≥10 chars), invite-link auto-join both tiers, discovery join (free=pending, premium=active), creator approval queue, private rooms hidden, regenerate code.

## Blocked on

Nothing.

## Live URL

Pending Netlify connection.

## Environment

- Client env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (pre-populated in hosted environment)
- Server-only: SUPABASE_SERVICE_ROLE_KEY, VINYL_WEBHOOK_SECRET
- Edge function deployed: payment-webhook (verify_jwt=false, HMAC-signed)
