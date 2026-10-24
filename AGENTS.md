# Vinyl — Agent Instructions

> If you are an AI reading this, read HANDOFF.md before doing anything. Then continue from "What's next" in HANDOFF.md.

## What is Vinyl?

Vinyl is an unreleased-music community and player. Core loop: discover unreleased tracks → play → save offline → pay for premium. Premium users auto-join rooms they find in discovery; free users request (creator approves). Invite links auto-join both tiers. Admin configures everything from a panel without code.

## Stack

- **Frontend:** React 18 + Vite 7 + TypeScript (strict) + Tailwind CSS 3
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions)
- **Icons:** lucide-react
- **Deploy:** Netlify (via GitHub auto-deploy)
- **PWA:** service worker, manifest, installable

No exotic dependencies. Boring, proven stack only.

## The 8 Hard Rules

1. Tool-agnostic. No AI-specific features. Any agent can read the repo and continue.
2. Boring stack. React + Vite + TypeScript + Tailwind + Supabase. No exotic dependencies.
3. The repo tells the story. If it isn't in a file, it doesn't exist.
4. Every phase ends with a commit and push. No uncommitted progress.
5. Complete files only. Never partial edits.
6. No placeholders, no TODOs, no stubs. Unbuilt = listed in HANDOFF.md, not shipped as code.
7. HANDOFF.md is updated and pushed in the SAME commit as the phase's files.
8. The repo is PUBLIC. No secrets in any file. No `.env` with real values. `.env.example` only.

## Phase List

- Phase 0 — Governance files
- Phase 1 — Project skeleton
- Phase 2 — Netlify deploy config verification
- Phase 3 — Supabase + Auth
- Phase 4 — Database schema + RLS
- Phase 5 — Listen loop
- Phase 6 — Offline library
- Phase 7 — Premium + payment
- Phase 8 — Rooms
- Phase 9 — Admin + Settings
- Phase 10 — PWA + install
- Phase 11 — Hardening + launch

## Forbidden Patterns

- No `service_role` key in client code. Ever.
- No `DISABLE ROW LEVEL SECURITY` on any table.
- No `USING (true)` policies unless the data is intentionally public/shared.
- No `auth.uid()` bypassed via `current_user`.
- No client-side admin checks (isAdmin in React state). Admin status comes from the server.
- No `.env` file with real values committed. `.env.example` only.
- No `FOR ALL` RLS policies. One policy per CRUD verb.
- No URL-based offline caching. Offline = blob storage, never a link.
- No service worker interception of unsaved audio. Streaming audio passes through untouched.
- No self-activation of premium. Only an admin (server function) can set tier to premium.
- No hardcoded payment amounts. Price comes from `app_settings`.
- No purple/indigo/violet color schemes. Vinyl uses black/cream/acid green.
- No emojis in code or UI text.
- No `TODO`, `FIXME`, or stub implementations. If it's not built, it's in HANDOFF.md.

## Reference

- Reference repo (read-only, NOT the base): https://github.com/21Creates/music
- Product spec: `docs/VINYL-SPEC.md`
- Brand colors: Vinyl Black `#0D0C0B`, Groove Charcoal `#1B1917`, Sleeve Cream `#F3ECDD`, White Label Acid `#DFFF3F`, Groove Gray `#8A8378`, Test Pressing Red `#FF4D3D`
- Tagline: "unreleased. first."
- Offline language: "available offline in Vinyl", never "downloaded"
