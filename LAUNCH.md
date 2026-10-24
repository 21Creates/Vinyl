# Vinyl — Launch Checklist

## Pre-launch

- [ ] Set Supabase edge function secrets:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VINYL_WEBHOOK_SECRET`
- [ ] Deploy edge function: `payment-webhook`
- [ ] Set Netlify environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Connect Netlify to GitHub repo `21Creates/Vinyl`
- [ ] Verify first deploy succeeds
- [ ] Test signup/login flow
- [ ] Test audio playback (browse + play)
- [ ] Test offline save + offline playback
- [ ] Test room creation + invite code join
- [ ] Test payment submission + admin approval
- [ ] Test PWA install prompt on mobile
- [ ] Test service worker update flow

## Post-launch monitoring

- [ ] Watch Supabase auth logs for failed signups
- [ ] Watch edge function logs for webhook errors
- [ ] Monitor storage bucket size for payment proofs
- [ ] Check Lighthouse PWA score (target: 90+)

## Known limitations

- **Icons are SVG** — PWA icons use SVG format. Some older Android browsers may not render them in install prompts. If needed, generate PNG versions (192x192, 512x512) and add to manifest.
- **Storage RLS** — The `payment-proofs` bucket is private but has no explicit storage RLS policies (Supabase dashboard limitation). Access is controlled by the bucket being private + admin reading via service role in the edge function.
- **Payment flow** — Manual bank-transfer + receipt upload. No automatic payment verification. Admin approves payments manually or via Apps Script webhook.
- **Audio sources** — Demo tracks use external URLs. Production needs real audio files uploaded to Supabase Storage or a CDN.
- **Push notifications** — Not implemented. The service worker is scoped to app shell caching only (honest push scoping — no fake push support).

## Architecture decisions (from DECISIONS.md)

1. No React Router — state-based view switching
2. Offline caching via IndexedDB blobs (never URLs)
3. Service worker never touches audio/media
4. Media Session API for lock-screen controls
5. SECURITY DEFINER functions for admin-only operations
6. HMAC-signed webhook for payment status sync
7. Private storage bucket for payment proofs
