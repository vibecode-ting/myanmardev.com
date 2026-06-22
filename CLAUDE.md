# CLAUDE.md — Project Guide for Claude Code

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

## Token Economy

- Users buy tokens → Admin approves → Tokens added
- Users redeem promo codes → Tokens added
- Users spend tokens on products → Tokens deducted
- New users start with 0 tokens

**Token Packages**: Starter (5/$2.50), Basic (10/$4), Pro (25/$8), Business (50/$12)

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

## Firestore Collections

- `users/{uid}` — User profiles with token balance
- `orders/{orderId}` — Token purchases + product orders
- `redeemCodes/{code}` — Promo codes for free tokens
- `userRedeems/{userId}` — Redemption history
- `approved_users/{username}` — Legacy GitHub approval

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

---

## Claude Orchestrator System

This project is managed by the **vibecode-ting** global orchestrator (see `../CLAUDE.md`).

### Git Branch Rules

```
✅ CORRECT: git push origin ting_remotework → create PR → main
❌ WRONG:   git push origin main (NEVER do this)
```

- **Always** commit and push to `ting_remotework` branch
- **Never** push directly to `main`
- Create PR: `ting_remotework` → `main`, user merges manually

### Available MCP Servers

| Server | Type | Purpose |
|--------|------|---------|
| context7 | stdio | Real-time framework docs (Astro, React, Tailwind, Firebase) |
| memory | stdio | Persistent knowledge graph across sessions |
| github | stdio | GitHub API — issues, PRs, repo management |
| cloudflare | http | Cloudflare DNS, Workers, Pages management |
| playwright | stdio | Browser automation — E2E testing |
| standout | http | Standout MCP — project management, task tracking (global config, auth in ~/.claude.json) |

### Global Agents (8)

All agents live in `../.claude/agents/` and are available in this project:

| Agent | Purpose |
|-------|---------|
| `task-splitter` | Decomposes tasks into parallel subtasks |
| `security-scanner` | Scans for vulnerabilities, secrets, misconfigurations |
| `brainstorm-agent` | Generates multiple solution approaches |
| `code-blamer` | Git blame analysis — who, when, why |
| `auto-deployer` | CI/CD pipeline — build, test, deploy |
| `code-reviewer` | Code review — correctness, perf, security, style |
| `test-generator` | Generates unit, integration, E2E tests |
| `doc-writer` | Generates README, API docs, inline comments |

### Project-Specific Agents (2)

| Agent | Purpose |
|-------|---------|
| `cf-worker-helper` | Cloudflare Worker development + DNS API |
| `i18n-audit-agent` | Bilingual translation consistency audit |

### Global Skills (3)

| Skill | Command |
|-------|---------|
| `init-project` | `/init-project` — auto-detect stack, create CLAUDE.md, configure CI/CD |
| `run-pipeline` | `/run-pipeline` — full parallel pipeline: split → build → review → security → deploy |
| `audit-all` | `/audit-all` — run all audits (security, i18n, perf, a11y, quality, tests) |

### Project-Specific Skills (4)

| Skill | Command |
|-------|---------|
| `debug-firestore` | `/debug-firestore` — debug Firestore issues, trace data flow |
| `deploy-cloudflare` | `/deploy-cloudflare` — deploy worker + frontend to Cloudflare |
| `i18n-sync` | `/i18n-sync` — sync translation files, find missing keys |
| `test-worker` | `/test-worker` — test Cloudflare Worker endpoints locally |

### How To Use

```
# Build a feature (auto-split + parallel agents)
"Build a user dashboard with stats and charts"

# Security audit
"Run security audit"

# Deploy to production
"Deploy myanmardev.com to production"

# Debug a regression
"Something broke the login flow — figure out what changed"

# Run all audits
/audit-all

# Deploy Cloudflare Worker + frontend
/deploy-cloudflare

# Sync i18n translations
/i18n-sync
```
