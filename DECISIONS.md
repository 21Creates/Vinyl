# Vinyl — Decisions Log

Every choice made without asking, one line each.

1. Fresh rebuild. Old repo at 21Creates/music is reference only, not base.
2. Brand colors carried over from reference repo spec: Vinyl Black #0D0C0B, Groove Charcoal #1B1917, Sleeve Cream #F3ECDD, White Label Acid #DFFF3F, Groove Gray #8A8378, Test Pressing Red #FF4D3D.
3. Tagline: "unreleased. first." — carried from reference spec.
4. Offline language: "available offline in Vinyl" — never "downloaded".
5. lucide-react used for icons (already in package.json, no extra install needed).
6. Tailwind config as .ts file (tailwind.config.ts) for type safety, matching reference repo convention.
7. No React Router — using simple state-based view switching to keep the stack boring and avoid routing complexity for a PWA.
8. Supabase auth: email/password only. No magic links, no social providers.
9. Email confirmation OFF — reduces friction for a small community app.
10. Admin status determined server-side via profiles table is_admin column + RLS. Never client-side.
11. Premium activation is server-only via a SECURITY DEFINER function. No client path to self-activate.
12. Payment flow: user uploads proof screenshot → status pending → admin approves → server function sets tier. Webhook sends HMAC-signed message to Google Apps Script.
13. Invite codes: 12 characters, generated server-side, never shown in discovery.
14. Free offline cap 3, premium offline cap 50 — both editable from admin settings.
15. No React Query / TanStack Query — plain Supabase queries with React hooks to keep dependencies minimal.
