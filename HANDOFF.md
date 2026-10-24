# Vinyl — Handoff

Phase 0 complete. Phase 1 complete. Fresh rebuild continues at Phase 2.

## Where we are

Phase 1 complete. Project skeleton built. Next: Phase 2 (Netlify deploy config verification).

## What's finished (verified)

- Security check on reference repo (21Creates/music): PASSED — no leaked credentials found.
- Phase 0: All governance files created (AGENTS.md, HANDOFF.md, DECISIONS.md, docs/VINYL-SPEC.md, README.md, package.json, vite.config.ts, tsconfig.json, tailwind.config.ts, netlify.toml, .env.example, .gitignore).
- Phase 1: Project skeleton built (index.html with Inter + JetBrains Mono fonts, src/main.tsx, src/App.tsx with Vinyl Black bg + cream wordmark + acid tagline, src/index.css with Tailwind + safe-area utilities).

## What's half-done

Nothing.

## What's next

Phase 2 — Confirm netlify.toml is correct. Update HANDOFF.md with "Live URL: pending Netlify connection." Push. Then Phase 3 (Supabase + Auth).

## Blocked on

Nothing.

## Live URL

Pending Netlify connection.

## Rules (verbatim)

1. Tool-agnostic. No AI-specific features. Any agent can read the repo and continue.
2. Boring stack. React + Vite + TypeScript + Tailwind + Supabase. No exotic dependencies.
3. The repo tells the story. If it isn't in a file, it doesn't exist.
4. Every phase ends with a commit and push. No uncommitted progress.
5. Complete files only. Never partial edits.
6. No placeholders, no TODOs, no stubs. Unbuilt = listed in HANDOFF.md, not shipped as code.
7. HANDOFF.md is updated and pushed in the SAME commit as the phase's files.
8. The repo is PUBLIC. No secrets in any file. No `.env` with real values. `.env.example` only.

## Environment

- Client env vars (set in Netlify dashboard or local `.env`):
  - `VITE_SUPABASE_URL` — Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — Supabase anon (public) key
- Server-only (NEVER in client code):
  - `SUPABASE_SERVICE_ROLE_KEY` — used only in Edge Functions
  - `VINYL_WEBHOOK_SECRET` — HMAC secret for payment webhook verification
