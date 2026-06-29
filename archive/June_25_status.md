# 🇲🇲 myanmardev.com — Project Status Report

**Date:** June 25, 2026

---

## 📍 Location
`/home/ting/myanmardev.com`

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Astro 6.4** (static output) |
| UI | **React 19** (interactive islands) |
| Styling | **Tailwind CSS 4** |
| Auth & DB | **Firebase** (Auth + Firestore) |
| API | **Cloudflare Worker** (DNS management) |
| Deployment | **GitHub Pages** via GitHub Actions |
| Package Manager | **pnpm 10.30** |

## 📊 Project Health: **7.5/10**

---

## ✅ Strengths

- **Well-structured codebase** — clean separation: components, lib, pages, workers, scripts
- **Solid security** — Firestore rules with per-collection access control, env vars gitignored, atomic token operations
- **i18n ready** — English + Burmese translations
- **CI/CD** — automated GitHub Pages deployment
- **Admin tooling** — scripts for token/redeem code management
- **Dark/light theme** — no flash on load
- **Comprehensive docs** — CLAUDE.md, .env.example with inline docs

## ⚠️ Issues Found

| Priority | Issue |
|---|---|
| 🔴 | **Uncommitted WIP** — 4 files modified (152 insertions, 82 deletions), especially `workers/subdomain-api.js` rewrite |
| 🔴 | **Stale build** — `dist/` from June 19, doesn't reflect current source |
| 🟡 | **No tests** — zero test files, no test runner configured |
| 🟡 | **`migrate/` directory** — dead weight, legacy backup not part of active codebase |
| 🟢 | **`node_modules`** — only 7 top-level entries visible (likely pnpm hoisting artifact) |

## 📁 Architecture

```
Browser → Astro (static HTML) → React islands
              ↓
         Firebase Auth (Google + GitHub OAuth)
         Firestore (users, orders, redeemCodes, products)
              ↓
         Cloudflare Worker → Cloudflare DNS API
```

**5 pages:** Landing (`/`, `/my/`), Dashboard (`/en/dashboard`), Products (`/products/`, `/products/subdomain`)

**Token economy:** 4 packages ($2.50–$12), admin-approved purchases, promo code system

## 🎯 Recommended Actions

1. **Commit or stash** the 4 uncommitted files (especially the worker rewrite)
2. **Rebuild** — `pnpm build` to update stale `dist/`
3. **Clean up** — consider removing or archiving `migrate/` directory
4. **Add tests** — at least basic smoke tests for critical flows (auth, payment, subdomain creation)
