# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**myanmardev.com** — Automated web services platform for Myanmar developers with token economy.

- **Frontend**: Astro 6 + React 19 + Tailwind CSS 4
- **Backend**: Firebase (Auth + Firestore) + Cloudflare Worker
- **Deployment**: GitHub Pages (frontend) + Cloudflare Workers (API)
- **i18n**: English + Burmese (Myanmar)

## Key Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
npx wrangler deploy   # Deploy Cloudflare Worker
```

## Architecture

```
Browser → Astro (static) → React (interactive)
                ↓
        Firebase Auth (Google + GitHub)
                ↓
        Firestore (users, orders, redeemCodes)
                ↓
        Cloudflare Worker → Cloudflare DNS API
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | Firebase initialization |
| `src/lib/auth.ts` | User profiles + token functions |
| `src/lib/orders.ts` | Order management |
| `src/lib/redeem.ts` | Promo code system |
| `src/components/SubdomainBuilder.tsx` | Main product UI |
| `workers/subdomain-api.js` | Cloudflare Worker |
| `firestore.rules` | Security rules |

## Token Economy

- Users buy tokens → Admin approves → Tokens added
- Users redeem promo codes → Tokens added
- Users spend tokens on products → Tokens deducted
- New users start with 0 tokens

**Token Packages**: Starter (5/$2.50), Basic (10/$4), Pro (25/$8), Business (50/$12)

## Environment Variables

Required in GitHub Actions (Variables, not Secrets):
- `PUBLIC_FIREBASE_*` — Firebase config (7 vars)
- `PUBLIC_WORKER_API_URL` — Worker endpoint

## Admin Scripts

```bash
node scripts/list-users.mjs                           # List all users
node scripts/add-tokens.mjs --email user@mail.com --tokens 10  # Add tokens
node scripts/create-redeem-code.mjs --code WELCOME --tokens 5 --max-uses 100  # Create promo code
```

## i18n

Translations in `src/i18n/en.json` and `src/i18n/my.json`. Use `t(lang, 'key')` function.

## Security Notes

- Token operations use atomic `increment()` to prevent race conditions
- Firestore rules enforce user can only read/write own profile
- Order status updates are admin-only (via scripts)
- Redeem codes track usage per user to prevent duplicates
