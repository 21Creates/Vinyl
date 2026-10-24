# Vinyl

Unreleased-music community and player. Discover unreleased tracks, play them, save them offline, and upgrade to premium for full access.

## Stack

- React 18 + Vite 7 + TypeScript (strict)
- Tailwind CSS 3
- Supabase (Postgres, Auth, Storage, Edge Functions)
- lucide-react (icons)
- PWA (service worker, manifest, installable)

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

## Project Structure

```
/
├── AGENTS.md          # Agent instructions (read HANDOFF.md first)
├── HANDOFF.md         # Build progress and resumption point
├── DECISIONS.md       # Decisions made without asking
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
- Tagline: "unreleased. first."
