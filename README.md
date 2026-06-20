# myanmardev.com

Automated web services platform for Myanmar developers. Claim a `.myanmardev.com` subdomain, deploy websites, and manage everything through a token-based economy -- no credit card required, no human approval queues.

## Features

- **Dual Authentication** -- Sign in with Google or GitHub via Firebase Auth
- **Token Economy** -- Universal currency across all products; buy tokens, spend on any service
- **Public Product Showcase** -- Browse all products without signing in
- **Token-Gated Ordering** -- Must be authenticated and have sufficient token balance to purchase
- **Redeem Code System** -- Promotional codes that grant free tokens (one use per user per code)
- **User Dashboard** -- View token balance, order history, and account details
- **Admin Scripts** -- CLI tools for managing users, tokens, orders, and promo codes
- **Bilingual i18n** -- Full English and Burmese language support with client-side switching
- **4 Token Packages** -- Starter, Basic, Pro, and Business tiers
- **Subdomain Builder** -- Automated DNS record creation via Cloudflare API
- **Cloudflare Worker** -- Serverless API proxy for subdomain management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Astro 6 + React 19 |
| Styling | Tailwind CSS 4 |
| Auth & Database | Firebase (Auth + Firestore) |
| API Proxy | Cloudflare Worker (serverless) |
| DNS | Cloudflare API |
| Deployment | GitHub Pages (static) |

## Architecture

```
myanmardev.com/
|-- src/
|   |-- components/          # React + Astro UI components
|   |   |-- AuthButton.tsx       # Sign in/out button
|   |   |-- AuthProvider.tsx     # Firebase auth context provider
|   |   |-- AuthGuard.tsx        # Route-level auth gate
|   |   |-- AccessGate.tsx       # Token-balance gating
|   |   |-- BuyTokensModal.tsx   # Token purchase modal
|   |   |-- RedeemCodeModal.tsx  # Promo code redemption
|   |   |-- DashboardContent.tsx # Logged-in user dashboard
|   |   |-- OrderHistory.tsx     # Order list component
|   |   |-- TokenBalance.tsx     # Balance display
|   |   |-- LanguageSwitcher.tsx # EN/MY toggle
|   |   |-- SubdomainBuilder.tsx # Subdomain creation flow
|   |   |-- ProductCard.astro    # Product display card
|   |   |-- Pricing.astro        # Token package pricing section
|   |   +-- ...                  # Header, Hero, HowItWorks, etc.
|   |-- i18n/
|   |   |-- en.json              # English translations
|   |   |-- my.json              # Burmese translations
|   |   +-- utils.ts             # i18n helper functions
|   |-- layouts/
|   |   +-- Layout.astro         # Root layout
|   |-- lib/
|   |   |-- firebase.ts          # Firebase app init + providers
|   |   |-- auth.ts              # User profile CRUD, token balance
|   |   |-- firestore.ts         # Generic Firestore helpers
|   |   |-- orders.ts            # Order creation & token packages
|   |   |-- redeem.ts            # Redeem code logic
|   |   +-- api.ts               # API utilities
|   +-- pages/
|       |-- index.astro          # Landing page
|       +-- en/                  # English locale pages
|-- workers/
|   |-- subdomain-api.js         # Cloudflare Worker source
|   +-- wrangler.toml            # Worker config
|-- scripts/
|   |-- list-users.mjs           # List all users (with CSV export)
|   |-- add-tokens.mjs           # Add tokens by email/uid or approve order
|   |-- approve-user.mjs         # Manage legacy GitHub approval list
|   +-- create-redeem-code.mjs   # Create promotional redeem codes
|-- firestore.rules              # Firestore security rules
|-- astro.config.mjs             # Astro config (static output)
+-- package.json
```

## How Tokens Work

Tokens are the platform's universal currency. Users buy a token package, then spend tokens on any product.

**Flow:**
1. User signs in (Google or GitHub)
2. User buys a token package (creates a pending order)
3. Admin approves the order and credits tokens (via `add-tokens.mjs --order-id <id> --approve`)
4. User spends tokens on products (tokens deducted immediately)
5. Alternatively, user redeems a promo code for free tokens

### Token Packages

| Package | Tokens | Price (USD) | Cost per Token |
|---------|--------|-------------|----------------|
| Starter | 5 | $2.50 | $0.50 |
| Basic | 10 | $4.00 | $0.40 |
| Pro | 25 | $8.00 | $0.32 |
| Business | 50 | $12.00 | $0.24 |

Token balances are stored in Firestore under the user's profile document and updated via atomic `increment()` operations.

### Redeem Codes

Admins create promo codes with `scripts/create-redeem-code.mjs`. Each code has a token reward, max use count, and optional expiration date. A user can only redeem a given code once. Redemptions are tracked in a `userRedeems` collection.

## Setup

### 1. Firebase Project

Create a Firebase project with:
- **Authentication** enabled with Google and GitHub providers
- **Firestore** database in native mode
- Deploy the `firestore.rules` file

### 2. Environment Variables

Create a `.env` file in the project root:

```env
PUBLIC_FIREBASE_API_KEY=your-api-key
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

All variables are prefixed with `PUBLIC_` so they are available client-side in Astro.

### 3. Cloudflare Worker

The `workers/` directory contains the subdomain API proxy. Configure it:

```bash
cd workers
# Set Cloudflare secrets
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put CLOUDFLARE_ZONE_ID

# Deploy
npx wrangler deploy
```

Update `ALLOWED_ORIGIN` in `workers/wrangler.toml` to match your deployed domain.

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The dev server runs at `http://localhost:4321` by default.

## Deployment

The site is built as a static Astro site and deployed to GitHub Pages:

```bash
pnpm build
# The dist/ output is deployed via GitHub Actions
```

The Cloudflare Worker is deployed separately:

```bash
cd workers
npx wrangler deploy
```

## Admin Commands

All admin scripts are in `scripts/` and use the Firebase REST API via the `.env` file. No service account is required.

### List Users

```bash
# List all users with token balances
node scripts/list-users.mjs

# Export to CSV
node scripts/list-users.mjs --export users.csv
```

### Add Tokens

```bash
# Add tokens by email
node scripts/add-tokens.mjs --email user@example.com --tokens 10

# Add tokens by UID
node scripts/add-tokens.mjs --uid abc123 --tokens 10

# Approve a pending token purchase order
node scripts/add-tokens.mjs --order-id <order-id> --approve
```

### Create Redeem Code

```bash
# Basic code
node scripts/create-redeem-code.mjs --code WELCOME --tokens 5 --max-uses 100

# Code with expiration
node scripts/create-redeem-code.mjs --code LAUNCH --tokens 10 --max-uses 50 --expires 2026-12-31

# Code with description
node scripts/create-redeem-code.mjs --code EARLYBIRD --tokens 3 --max-uses 200 --description "Early adopter bonus"
```

### Manage Approved Users (Legacy)

```bash
node scripts/approve-user.mjs add <github-username>
node scripts/approve-user.mjs remove <github-username>
node scripts/approve-user.mjs list
```

## Firestore Collections

| Collection | Purpose | Access |
|------------|---------|--------|
| `users` | User profiles with token balance | Owner read/write |
| `orders` | Token purchases and product orders | Owner read, anyone create |
| `redeemCodes` | Promotional codes | Authenticated read, admin write |
| `userRedeems` | Redemption history per user | Owner read/write |
| `approved_users` | Legacy GitHub approval list | Public read, admin write |
| `products` | Product catalog | Public read, admin write |

## i18n

The site supports English (`en`) and Burmese (`my`). Translation files are in `src/i18n/`. The `LanguageSwitcher` component toggles between languages client-side. All user-facing strings are keyed through the translation system.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Ensure `pnpm build` succeeds with no errors
5. Commit your changes with a descriptive message
6. Push to your fork and open a Pull Request

### Guidelines

- Keep components small and focused. Prefer composition over large monolithic files.
- All user-facing text must go through the i18n system (`src/i18n/en.json` and `src/i18n/my.json`).
- Do not commit `.env` files or Firebase credentials.
- Firestore security rules in `firestore.rules` should remain restrictive. Test any rule changes locally before deploying.
- Admin scripts should use the Firestore REST API (no service account dependency).

## License

Proprietary. All rights reserved.
