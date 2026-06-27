# Refactoring Plan: myanmardev.com → Static Product Site

## 1. Project Context

- **Application:** myanmardev.com — automated web services platform for Myanmar developers
- **Current Stack:** Astro 6 + React 19 + Tailwind CSS 4 + Firebase + Cloudflare Workers
- **Current State:** 3 pages (EN homepage, MY homepage, EN dashboard), 26 components, 1 live product (subdomain), 6 coming soon
- **Target Audience:** Myanmar new developers, freelancers, small businesses, any shop can create business website, QR code menu, Ordering system , Business Card designs logo site ( All in one product ). 

## 2. Refactoring Goals

### Primary Objectives
1. **Static-First Architecture** — Convert to fully static pages with minimal client JS. Only interactive components (auth, cart, payment) hydrate via React.
2. **Product Gallery with Click-to-Order** — Each product card links directly to an order flow. No multi-step navigation.
3. **My Business Page** — New page where authenticated users manage their products, orders, subdomains, and profile.
4. **Dual Currency (USD/MMK)** — Every price shows both USD and MMK with a default exchange rate. User can toggle preference.
5. **Multi-Payment Gateway** — Support Crypto ( USDT ), Local Banks (AYA/KBZ/CB/Wave), Local MMK Wallets.
6. **Clean, Simple, Elegant UI** — Professional design suitable for Burmese, no tech people, Tech people, Professional business thinking. Remove visual clutter.
7. **Automated Workers** — Cloudflare Workers handle subdomain provisioning, order processing, payment verification.
8. **Upcoming Products Pipeline** — Clear roadmap section with "Notify Me" for upcoming products.

### Product Recommendations (Launch Order)

| # | Product | Price (Tokens) | Status | Why |
|---|---------|---------------|--------|-----|
| 1 | **Subdomain Registration** | 1 | ✅ Live | Core product, already working |
| 2 | **Developer Portfolio Template** | 2 | 🔜 Q3 2026 | High demand, easy to build, showcases skills |
| 3 | **Static Website Builder** | 3 | 🔜 Q3 2026 | Natural next step after subdomain |
| 4 | **Business Landing Page** | 5 | 🔜 Q4 2026 | Myanmar SMEs need simple sites |
| 5 | **Restaurant QR Menu** | 4 | 🔜 Q4 2026 | Post-COVID Myanmar demand, tangible value |
| 6 | **Online Ordering System** | 8 | 2027 | Builds on QR Menu, higher value |
| 7 | **Point of Sale (POS)** | 10 | 2027 | Advanced, for established businesses |
| 8 | **Education Platform** | 8 | 2027 | Myanmar education tech gap |

### Constraint
- **No fake data** — Leave placeholders blank, remind to fill real data later
- **i18n first** — All new text must use translation keys (`en.json` + `my.json`)
- **Mobile-first** — Every component must work on 375px minimum width
- **Website on browser / desktop also works beautifylly. 

---

## 3. New Page Architecture

```
src/pages/
├── index.astro              ← Homepage (static hero + product gallery)
├── products/
│   ├── index.astro          ← Product gallery (all products, click-to-order)
│   ├── subdomain.astro      ← Subdomain product detail + order
│   ├── portfolio.astro      ← Portfolio product detail + order
│   └── website-builder.astro ← Website builder product detail + order
├── pricing.astro            ← Pricing page (token packages + dual currency)
├── my/
│   ├── index.astro          ← My Business dashboard (auth required)
│   ├── orders.astro         ← Order history
│   └── settings.astro       ← Profile + payment preferences
├── auth/
│   ├── signin.astro         ← Sign in page (replaces modal)
│   └── callback.astro       ← OAuth callback handler
├── api/                     ← Astro API routes (server-side)
│   ├── create-checkout.ts   ← Stripe/crypto checkout session
│   ├── verify-payment.ts    ← Payment verification webhook
│   └── notify-product.ts    ← "Notify Me" for upcoming products
└── en/ & my/                ← Language-prefixed routes (keep existing pattern)
```

---

## 4. Component Architecture & Execution Sequence

### Phase 1: Global Layout & Theme Cleanup
**Goal:** Clean, minimal, professional foundation

- [x] **Refactor `Layout.astro`** — Remove grain texture overlay, simplify to clean white/dark base. Keep Sora + Inter fonts.
- [x] **Create `ThemeToggle.astro`** — Dark/light mode toggle (already has CSS variables, just wire up)
- [x] **Refactor `Header.astro`** — Simplify nav: Home | Products | Pricing | My Business (auth-gated). Remove clutter.
- [x] **Create `CurrencyToggle.tsx`** — USD ↔ MMK toggle, persists to localStorage. Default: MMK for Myanmar users.
- [x] **Update i18n** — Add keys for new pages, dual currency display, payment methods

**Tools:**
| Tool | Use For |
|------|---------|
| `context7` | Fetch latest Astro 6 + Tailwind 4 docs for static-first patterns |
| `playwright` | Visual regression test on 375px mobile |
| `code-reviewer` | Review layout refactor for accessibility |

**Agent:** `task-splitter` → split Phase 1 into parallel subtasks (layout, header, currency toggle, i18n)

---

### Phase 2: Homepage Refactor (Static)
**Goal:** Clean landing page, product gallery preview, social proof

- [x] **Refactor `HeroSection.tsx` → `Hero.astro`** — Convert to static Astro component. Remove React hydration. Clean copy: "Build & Deploy. Myanmar Developer Platform."
- [x] **Create `ProductGallery.astro`** — Static grid of product cards. Each card: image, name, price (USD/MMK), status badge (Live/Soon), CTA button. And Product details.
- [x] **Refactor `PricingSection.tsx` → `Pricing.astro`** — Static pricing grid. Dual currency. Link to checkout.
- [x] **Create `Testimonials.astro`** — Placeholder for user testimonials (blank, remind to fill)
- [x] **Create `CTA.astro`** — Bottom CTA: "Start Building Today" → sign up

**Tools:**
| Tool | Use For |
|------|---------|
| `standout` | `get_design_direction` for clean/professional art direction |
| `standout` | `get_section_code` for hero, gallery, pricing sections |
| `playwright` | Visual test all breakpoints |

**Agent:** `brainstorm-agent` → generate 3 layout approaches for product gallery

---

### Phase 3: Product Detail Pages (Static + Interactive Order)
**Goal:** Each product gets its own page with click-to-order

- [x] **Create `ProductDetail.astro` layout** — Shared layout for product pages: hero image, description, features, pricing, order button
- [x] **Create `OrderButton.tsx`** — Interactive React component. Checks auth → shows payment modal → processes order. Only component that hydrates.
- [ ] **Create `SubdomainOrder.tsx`** — Refactored from `SubdomainBuilder.tsx`. Cleaner UI: input field → check availability → choose platform → pay → done.
- [x] **Create `PaymentModal.tsx`** — Unified payment modal. Shows:
  - Token balance (if logged in)
  - Price in USD + MMK
  - Payment methods: Tokens | Crypto (BTC/ETH/USDT) | Local Banks Muyanmar | MMK Wallets 
  - Each method shows its own flow
- [x] **Create `ProductFeatures.astro`** — Feature list with checkmarks, clean grid layout

**Tools:**
| Tool | Use For |
|------|---------|
| `context7` | Stripe API docs, crypto payment integration docs |
| `cloudflare` | Verify worker endpoints for subdomain provisioning |
| `playwright` | E2E test: browse product → click order → payment → confirm |
| `security-scanner` | Scan payment flow for vulnerabilities |

**Agent:** `cf-worker-helper` → extend worker for order processing endpoints

---

### Phase 4: My Business Dashboard (Auth-Required)
**Goal:** Central hub for users to manage everything

- [ ] **Refactor `DashboardContent.tsx`** — Cleaner layout: sidebar nav + main content area
- [x] **Create `MyProducts.tsx`** — List of purchased products with status (active, pending, expired)
- [x] **Create `MySubdomains.tsx`** — List of registered subdomains with DNS status, edit/delete actions
- [ ] **Create `OrderHistory.tsx`** → Refactor — Add filters (date, status, product type), export to CSV
- [x] **Create `PaymentSettings.tsx`** — Default payment method, saved wallets, currency preference
- [x] **Create `ProfileCard.tsx`** — User info, token balance, member since, quick actions
- [x] **Create `NotifyMe.tsx`** — "Get notified" button for upcoming products, stores email in Firestore

**Tools:**
| Tool | Use For |
|------|---------|
| `firebase` (MCP) | Firestore queries for user data, orders, subdomains |
| `playwright` | Test auth-gated routes, verify no data leaks |
| `security-scanner` | Audit Firestore rules for new collections |

**Agent:** `task-splitter` → parallel: dashboard layout, my-products, my-subdomains, payment settings

---

### Phase 5: Payment System Overhaul
**Goal:** Multi-payment support with dual currency

- [x] **Create `lib/payments.ts`** — Payment abstraction layer:
  ```typescript
  type PaymentMethod = 'tokens' | 'crypto' | 'bank' | 'mmk_wallet'
  type Currency = 'USD' | 'MMK'
  interface PaymentRequest { product: string, amount: number, currency: Currency, method: PaymentMethod }
  ```
- [x] **Create `lib/exchange-rate.ts`** — Default Fixed Rate on my site : 1 USD = 4,000 MMK Forever. 
- [ ] **Create `workers/payment-api.js`** — New Cloudflare Worker for payment processing:
  - `POST /create-checkout` — Create Stripe checkout session
  - `POST /verify-crypto` — Verify crypto payment (via blockchain API)
  - `POST /verify-bank` — Manual bank transfer verification (admin approval)
  - `POST /webhook/stripe` — Stripe webhook handler
- [ ] **Update `BuyTokensModal.tsx`** — Add Crypto + Card options alongside existing bank transfers
- [ ] **Create `PaymentSuccess.astro`** — Post-payment confirmation page

**Tools:**
| Tool | Use For |
|------|---------|
| `context7` | Stripe SDK docs, crypto payment API docs |
| `cloudflare` | Deploy new payment worker |
| `security-scanner` | CRITICAL: Scan all payment code for vulnerabilities |
| `cf-worker-helper` | Build + test payment worker |

**Agent:** `security-scanner` → mandatory scan before ANY payment code goes live

---

### Phase 6: Automated Workers (Cloudflare)
**Goal:** Backend automation for orders, provisioning, notifications

- [ ] **Extend `workers/subdomain-api.js`** — Add auto-provisioning after payment confirmed
- [ ] **Create `workers/order-processor.js`** — New worker:
  - Listen for payment webhooks
  - Update Firestore order status
  - Trigger product provisioning
  - Send confirmation (email/notification)
- [ ] **Create `workers/notify-worker.js`** — Handle "Notify Me" subscriptions:
  - Store in Firestore
  - Send email when product launches (via Resend/SendGrid)
- [ ] **Create `workers/exchange-rate.js`** — Cached MMK/USD rate endpoint

**Tools:**
| Tool | Use For |
|------|---------|
| `cloudflare` | Deploy all workers |
| `cf-worker-helper` | Build + test worker endpoints |
| `playwright` | E2E test: order → webhook → provision → confirm |

**Agent:** `cf-worker-helper` → build each worker, `test-generator` → worker unit tests

---

### Phase 7: Upcoming Products Pipeline
**Goal:** Roadmap page with notification system

- [ ] **Create `src/pages/roadmap.astro`** — Clean timeline layout showing upcoming products
- [ ] **Refactor `ProductsComingSoon.astro`** → cleaner design, remove horizontal scroll rail
- [ ] **Create `NotifyMeButton.tsx`** — Interactive button: click → enter email → stored in Firestore → confirmation
- [ ] **Add Firestore collection:** `product_notifications/{productId}/subscribers/{email}`
- [ ] **Connect to `notify-worker.js`** — Auto-email when product status changes to "live"

**Tools:**
| Tool | Use For |
|------|---------|
| `firebase` (MCP) | Firestore collection setup |
| `security-scanner` | Audit email storage for PII compliance |
| `playwright` | Test notification flow |

---

### Phase 8: UI/UX Polish & Accessibility
**Goal:** Clean, simple, elegant, professional

- [ ] **Audit all pages with `playwright`** — Visual regression at 375px, 768px, 1024px, 1440px
- [ ] **Run `code-reviewer`** — Accessibility audit (ARIA labels, keyboard nav, screen reader)
- [ ] **Simplify color palette** — Keep dark base (#0B0D10), accent blue (#73a5f9), add neutral grays. Remove unnecessary colors.
- [ ] **Typography cleanup** — Sora for headings only, Inter for body. Consistent sizing scale.
- [ ] **Spacing system** — Use 4px/8px grid consistently
- [ ] **Remove visual noise** — No grain texture, no excessive gradients, no decorative SVGs. Let content breathe.
- [ ] **Micro-interactions** — Subtle hover states, smooth transitions (200ms ease), loading skeletons
- [ ] **Myanmar-specific** — Test Burmese text rendering, ensure fonts support Myanmar script

**Tools:**
| Tool | Use For |
|------|---------|
| `standout` | `critique_design` on live site for professional feedback |
| `playwright` | Visual regression + mobile testing |
| `code-reviewer` | Accessibility + performance audit |

---

## 5. Payment Methods Detail

### Supported Payment Methods

| Method | Currencies | Flow | Status |
|--------|-----------|------|--------|
| **Tokens** | — | Pre-purchased, instant deduction | ✅ Live |
| **Crypto (USDT/BTC/ETH)** | USD | Wallet connect → send → verify on-chain | 🔜 New |
| **Card (Stripe)** | USD, MMK | Stripe Checkout → webhook → confirm | 🔜 New |
| **AYA Pay** | MMK | Manual transfer → screenshot → admin verify | ✅ Live |
| **KBZ Pay** | MMK | Manual transfer → screenshot → admin verify | ✅ Live |
| **Wave Pay** | MMK | Manual transfer → screenshot → admin verify | ✅ Live |
| **CB Pay** | MMK | Manual transfer → screenshot → admin verify | ✅ Live |
| **Bank Transfer** | USD, MMK | Manual transfer → admin verify | ✅ Live |

### Exchange Rate Logic

```typescript
// lib/exchange-rate.ts
const DEFAULT_RATE = 3800; // 1 USD = 3,800 MMK (fallback)
const CACHE_TTL = 3600; // 1 hour

async function getExchangeRate(): Promise<number> {
  // Try API first (e.g., exchangerate-api.com)
  // Fall back to cached value
  // Fall back to DEFAULT_RATE
  return rate;
}

function formatDualPrice(usd: number, mmkRate: number): string {
  return `$${usd.toFixed(2)} / ${(usd * mmkRate).toLocaleString()} MMK`;
}
```

---

## 6. Firestore Schema Updates

### New Collections

```
product_notifications/
  {productId}/
    subscribers/
      {email}: { email, userId?, createdAt, notified: boolean }

payment_methods/
  {userId}/
    methods/
      {methodId}: { type, label, last4?, walletAddress?, isDefault }

product_orders/
  {orderId}: {
    userId, productId, status, paymentMethod, currency,
    amountUSD, amountMMK, tokensSpent,
    createdAt, completedAt, metadata
  }
```

### Updated Rules

```javascript
// firestore.rules additions
match /product_notifications/{productId}/subscribers/{email} {
  allow create: if request.auth != null;
  allow read: if false; // admin only via scripts
}
match /payment_methods/{userId}/methods/{methodId} {
  allow read, write: if request.auth.uid == userId;
}
match /product_orders/{orderId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if request.auth != null;
  allow update: if false; // admin only via scripts
}
```

---

## 7. Strict Agent Rules

1. **No Unapproved Dependencies** — Do NOT install new npm packages without asking. Exception: `stripe` (for payments) is pre-approved.
2. **Visual Verification** — Use Playwright to test every new component at 375px, 768px, 1024px widths.
3. **Atomic Commits** — Commit after each Phase completes. Conventional commits: `refactor:`, `feat:`, `fix:`, `security:`.
4. **Branch Rules** — ALL commits to `ting_remotework` branch. NEVER push to `main`. Create PR for user review.
5. **i18n Required** — Every user-visible string must have `en.json` AND `my.json` keys. No hardcoded text.
6. **Security First** — Payment code MUST pass `security-scanner` before merge. No exceptions.
7. **Mobile First** — Design for 375px first, scale up. Test on real mobile viewport.
8. **No Fake Data** — Leave placeholders blank. Add `// TODO: fill real data` comments. Remind user.

---

## 8. Execution Pipeline

```
Phase 1: Global Layout & Theme
    ↓ (parallel agents: layout, header, currency, i18n)
Phase 2: Homepage Refactor
    ↓ (parallel agents: hero, gallery, pricing, testimonials)
Phase 3: Product Detail Pages
    ↓ (parallel agents: product pages, order flow, payment modal)
Phase 4: My Business Dashboard
    ↓ (parallel agents: dashboard, products, subdomains, settings)
Phase 5: Payment System
    ↓ (parallel agents: stripe, crypto, bank, wallet + security scan)
Phase 6: Automated Workers
    ↓ (parallel agents: order processor, notify, exchange rate)
Phase 7: Upcoming Products
    ↓ (parallel agents: roadmap page, notify button, email worker)
Phase 8: UI/UX Polish
    ↓ (parallel: visual audit, a11y, performance)
Phase 9: Security Review + Deploy
    ↓ security-scanner → auto-deployer
```

---

## 9. Tools & Agents Quick Reference

### MCP Servers Used

| Server | Phases | Purpose |
|--------|--------|---------|
| `context7` | 1-6 | Astro 6, React 19, Tailwind 4, Stripe, Firebase docs |
| `standout` | 2, 8 | Design direction, section code, design critique |
| `cloudflare` | 5, 6 | Deploy workers, DNS management |
| `playwright` | ALL | Visual testing, E2E testing |
| `firebase` | 4, 5, 7 | Firestore operations, auth |
| `github` | ALL | PRs, commits, issues |

### Global Agents Used

| Agent | Phases | Purpose |
|-------|--------|---------|
| `task-splitter` | ALL | Decompose phases into parallel subtasks |
| `brainstorm-agent` | 2, 3 | Generate layout/approach options |
| `security-scanner` | 5, 9 | Scan payment code, Firestore rules |
| `code-reviewer` | ALL | Review every phase before moving on |
| `test-generator` | 3, 5, 6 | Generate tests for new features |
| `auto-deployer` | 9 | Final build + deploy |
| `code-blamer` | — | Debug if regressions occur |
| `doc-writer` | 9 | Update README, API docs |

### Project-Specific Agents Used

| Agent | Phases | Purpose |
|-------|--------|---------|
| `cf-worker-helper` | 5, 6 | Build + deploy Cloudflare Workers |
| `i18n-audit-agent` | ALL | Ensure translation consistency |

### Skills Used

| Skill | When |
|-------|------|
| `/run-pipeline` | Kick off each phase |
| `/audit-all` | After Phase 8 (polish) |
| `/deploy-cloudflare` | Deploy workers after Phase 6 |
| `/i18n-sync` | After adding new translation keys |

---

## 10. Success Criteria

- [ ] All pages load in < 2s on 3G (Lighthouse score > 90)
- [x] Every price shows USD + MMK
- [ ] Payment works: Tokens, Crypto, Card, Bank, Wallet
- [ ] Subdomain order flow: browse → click → pay → provisioned in < 60s
- [x] My Business dashboard shows all user products, orders, subdomains
- [ ] Mobile-first: no horizontal scroll on 375px
- [x] i18n: EN + MY fully synced, no missing keys
- [ ] Security: all payment code scanned, Firestore rules audited
- [x] Upcoming products have "Notify Me" with email confirmation
- [ ] Zero hardcoded strings, zero fake data

---

## 11. Notes

- **Exchange rate default:** 1 USD = 4000 MMK (Fixed)
- **Crypto:** Start with USDT (TRC-20) for lowest fees, expand later
- **Admin approval** still required for bank transfers (manual verification)
- **Token system remains** — tokens are the internal currency, external payments convert to tokens
