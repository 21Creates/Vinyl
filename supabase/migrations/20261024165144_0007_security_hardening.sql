-- Phase 11 security hardening: fix mutable search_path + revoke unnecessary EXECUTE grants

-- Fix mutable search_path on utility functions
ALTER FUNCTION public.generate_invite_code() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

-- handle_new_user is a trigger function — no role needs direct EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- is_admin is used in RLS policies and client checks — authenticated needs it, anon does not
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;

-- Admin-only SECURITY DEFINER functions: revoke from anon (already revoked in 0003, but be explicit)
REVOKE EXECUTE ON FUNCTION public.admin_delete_track(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_insert_track(text, text, integer, text, text, boolean, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_settings(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_track(uuid, text, text, integer, text, boolean, text) FROM PUBLIC, anon;

-- Room management functions: revoke from anon
REVOKE EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_room_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_room_member(uuid, uuid) FROM PUBLIC, anon;
