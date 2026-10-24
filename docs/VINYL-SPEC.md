# Vinyl — Product Spec

## Core Loop

Discover unreleased tracks → play → save offline → pay for premium.

## Brand

- Vinyl Black `#0D0C0B` — background
- Groove Charcoal `#1B1917` — cards, surfaces
- Sleeve Cream `#F3ECDD` — primary text
- White Label Acid `#DFFF3F` — accent (under 10% of screen)
- Groove Gray `#8A8378` — muted text
- Test Pressing Red `#FF4D3D` — errors only
- Tagline: "unreleased. first."
- Offline language: "available offline in Vinyl", never "downloaded"

## Personas

### Free Listener
- Browses and plays free tracks
- Saves up to 3 tracks offline
- Requests to join discovered rooms (pending creator/admin approval)
- Joins by invite link instantly

### Premium Listener
- All free features
- Access to premium tracks
- Saves up to 50 tracks offline (admin-configurable)
- Instant discovery joins (no approval needed)
- Creates rooms

### Admin
- Uploads tracks (file upload only, source/rights note required)
- Approves/rejects payments (with proof preview)
- Edits all settings (audit-logged; protected settings are read-only)
- Sets up and tests the webhook
- Approves/rejects room join requests

## Rooms

- Every room has an invite code (12 characters, never shown in discovery)
- Invite link = instant join for both free and premium
- Discovery join: free = pending until creator/admin approves; premium = instant
- Global discovery toggle + per-room "discoverable" flag
- Private rooms never listed in discovery
- Creator can: add tracks, regenerate code, approve/reject join requests, remove members
- Rejected user waits `rooms.rejection_cooldown_days` (default 7) before requesting again

## Offline

- Per-track toggle stores the whole audio file in browser cache (blob, never a URL)
- Caps: free 3, premium 50 (both admin-configurable)
- Counts enforced on the server
- On app open, missing files shown as not saved
- Unsaved tracks stream normally; service worker never touches audio

## Premium and Payment

- One plan. Price, bank details, and instructions all come from admin settings.
- User uploads a payment screenshot → status becomes `pending`
- Only an admin can activate premium (server function) — users can never self-activate
- A signed (HMAC) message is sent to a Google Apps Script web app that emails the admin

## Admin Scope

- Approve/reject payments (with proof preview)
- Upload tracks (file only, source required)
- Edit settings (audit-logged; protected settings are read-only)
- Webhook test ping
- Copyable Apps Script template
- Approve/reject room join requests

## Out of Scope

- Push notifications
- Queue drawer
- Artwork
- Ads
- Watermarking
- Room chat
- Analytics
- Admin two-step login
