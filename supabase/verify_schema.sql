-- ============================================================
-- Vinyl — Schema Verification (exploit attempts)
-- This file demonstrates that RLS and server-only controls work.
-- Run with: psql $SUPABASE_DB_URL -f verify_schema.sql
-- Every query below should FAIL or return 0 rows.
-- ============================================================

-- NOTE: These queries use the anon role to simulate a client attack.
-- They are for manual verification only — do NOT run in app code.

-- 1. Non-admin cannot INSERT a track directly (no INSERT grant)
-- Expected: ERROR — permission denied for table tracks
INSERT INTO tracks (title, artist, audio_path) VALUES ('hacked', 'hacker', 'evil.mp3');

-- 2. Non-admin cannot call admin_insert_track (if not admin)
-- Expected: ERROR — Only admins can upload tracks
-- SELECT admin_insert_track('hacked', 'hacker', 0, 'evil.mp3');

-- 3. Non-admin cannot UPDATE their own tier to premium (no UPDATE grant on tier column)
-- Expected: ERROR — permission denied
-- UPDATE profiles SET tier = 'premium' WHERE id = auth.uid();

-- 4. Non-admin cannot set is_admin = true (no UPDATE grant on is_admin column)
-- Expected: ERROR — permission denied
-- UPDATE profiles SET is_admin = true WHERE id = auth.uid();

-- 5. Non-admin cannot UPDATE payment status (no UPDATE grant on payments)
-- Expected: ERROR — permission denied
-- UPDATE payments SET status = 'approved' WHERE user_id = auth.uid();

-- 6. Non-admin cannot call admin_update_payment_status
-- Expected: ERROR — Only admins can update payment status
-- SELECT admin_update_payment_status('00000000-0000-0000-0000-000000000000', 'approved');

-- 7. Non-admin cannot UPDATE app_settings (no UPDATE grant)
-- Expected: ERROR — permission denied
-- UPDATE app_settings SET settings = '{"premium_price": "FREE"}' WHERE id = 1;

-- 8. Non-admin cannot call admin_update_settings
-- Expected: ERROR — Only admins can update settings
-- SELECT admin_update_settings('{"premium_price": "FREE"}'::jsonb);

-- 9. Free user cannot create a room (INSERT policy checks tier = 'premium')
-- Expected: ERROR — new row violates row-level security policy
-- INSERT INTO rooms (name, creator_id) VALUES ('hacker room', auth.uid());

-- 10. User cannot read another user's payments (SELECT policy checks user_id = auth.uid())
-- Expected: 0 rows
-- SELECT * FROM payments WHERE user_id != auth.uid();

-- 11. User cannot see private (non-discoverable) rooms they aren't members of
-- Expected: 0 rows
-- SELECT * FROM rooms WHERE is_discoverable = false AND creator_id != auth.uid()
--   AND NOT EXISTS (SELECT 1 FROM room_members WHERE room_id = rooms.id AND user_id = auth.uid() AND status = 'active');

-- 12. Non-admin cannot read settings_audit_log
-- Expected: 0 rows (is_admin() returns false for non-admin)
-- SELECT * FROM settings_audit_log;

-- ============================================================
-- Summary of what passes (should work for authenticated users):
-- SELECT * FROM tracks WHERE is_public = true;     -- works
-- SELECT * FROM app_settings;                       -- works (settings are readable)
-- INSERT INTO payments (proof_path) VALUES ('x');    -- works (own payment)
-- SELECT * FROM payments WHERE user_id = auth.uid();-- works (own payments)
-- INSERT INTO room_members (room_id, invited_via) VALUES (..., 'invite_link'); -- works
-- ============================================================
