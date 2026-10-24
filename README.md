# Vinyl

Unreleased-music community and player. Discover unreleased tracks, play them, save them offline, and upgrade to premium for full access.

## Features

- **Browse & Play** — Stream unreleased tracks with a persistent now-playing bar and lock-screen controls (Media Session API).
- **Offline Library** — Save tracks to IndexedDB blob cache for offline playback. Free tier: 3 tracks. Premium: 50 (admin-configurable).
- **Rooms** — Create private listening rooms with invite codes. Share links for auto-join. Creators approve/reject members.
- **Premium** — Bank-transfer payment with receipt upload to private storage. Admin approves, webhook upgrades tier.
- **Admin Panel** — Payment approval, app settings (batch save with dirty indicator), settings audit log, Apps Script webhook template.
- **PWA** — Installable on mobile/desktop. Service worker caches app shell (never audio). Auto-update flow with refresh banner.

## Stack

- React 18 + Vite 7 + TypeScript (strict)
- Tailwind CSS 3
- Supabase (Postgres, Auth, Storage, Edge Functions)
- lucide-react (icons)
- PWA (service worker, manifest, installable)

## Security

- Row Level Security on every table, one policy per CRUD verb (no FOR ALL)
- Anon role fully revoked — signed-in app only
- SECURITY DEFINER functions with internal `is_admin()` guards for privileged operations
- HMAC-signed payment webhook (SHA-256)
- Private storage bucket for payment proofs (user-scoped paths)
- No `dangerouslySetInnerHTML`, `eval`, or `innerHTML` anywhere in source
- No client-side secrets — service role key only in edge function (Deno env)

## Local Development

```bash
npm install
cp .env.example .env
# Fill in your Supabase URL and anon key
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to Netlify via GitHub

1. Push this repo to your GitHub account.
2. Go to [netlify.com](https://netlify.com) → Add new site → Import existing project → select your repo.
3. Build settings are pre-configured in `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Every push to main auto-deploys.

## Environment Variables

### Client (Vite)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key

### Server-only (Edge Function secrets)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (never in client)
- `VINYL_WEBHOOK_SECRET` — HMAC secret shared between Apps Script and edge function

## Database Migrations

| # | Name | Description |
|---|------|-------------|
| 0001 | profiles_for_auth | profiles table + handle_new_user trigger |
| 0002 | core_schema | tracks, rooms, room_members, room_tracks, payments, app_settings, admin functions |
| 0003 | revoke_anon_access | REVOKE ALL from anon role |
| 0004 | seed_demo_tracks | 5 demo tracks |
| 0005 | payment_proof_storage | payment-proofs private storage bucket |
| 0006 | room_management_functions | regenerate_invite_code, approve/reject_room_member |
| 0007 | security_hardening | Fix search_path, revoke unnecessary EXECUTE grants |

## Project Structure

```
/
├── AGENTS.md          # Agent instructions (read HANDOFF.md first)
├── HANDOFF.md         # Build progress and resumption point
├── DECISIONS.md       # Decisions made without asking
├── LAUNCH.md          # Launch checklist and known limitations
├── docs/VINYL-SPEC.md # One-page product spec
├── src/               # Application source
├── supabase/          # Migrations, edge functions, config
├── netlify.toml       # Netlify build + deploy config
└── .env.example       # Environment variable template
```

## Brand

- Vinyl Black `#0D0C0B` — background
- Groove Charcoal `#1B1917` — surfaces
- Sleeve Cream `#F3ECDD` — text
- White Label Acid `#DFFF3F` — accent
- Groove Gray `#8A8378` — secondary text
- Test Pressing Red `#FF4D3D` — errors/destructive
- Tagline: "unreleased. first."
