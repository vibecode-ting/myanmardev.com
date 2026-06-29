# Ch-3 Submission Plan — @vibecode-ting (Htet Aung Hlaing)

> Project: **myanmardev.com** — Astro-based landing page for Myanmar developers
> Team repo: `team-05`
> Target: Submit in Discord `#ch-3` with repo link, get instructor ✅

---

## Checklist Overview

| # | Item | Where | Status |
|---|---|---|---|
| 1 | Proposal sections 1-6 filled | `member-proposals/vibecode-ting.md` | ✅ Done |
| 2 | Personal project repo | `https://github.com/vibecode-ting/myanmardev.com` | ✅ Exists |
| 3 | `.mcp.json` | Root of project repo | ✅ Done |
| 4 | `.claude/skills/<name>/SKILL.md` | Project repo | ✅ Done |
| 5 | `.claude/agents/<name>.md` | Project repo | ✅ Done |
| 6 | 6-slide PechaKucha | `slides/pitch.md` in project repo | ✅ Done |
| 7 | 3 GitHub stars ⭐ | Project repo | ✅ Done |
| 8 | `report.md` | `ch-3/vibecode-ting/report.md` in team-05 | ✅ Done |
| 9 | `doctor.sh ch-3` — all green | Terminal | ✅ Done |
| 10 | Post in `#ch-3` Discord | Discord | ✅ Done |

---

## Step-by-Step Plan

### Step 1 — Proposal (✅ Complete — aligned with myanmardev.com)

Your proposal in `member-proposals/vibecode-ting.md` has all 6 sections filled and now matches your actual project:
- **Gist:** Automated subdomain registration platform for Myanmar developers
- **Story:** A Myanmar dev wants a professional URL — picks a subdomain, chooses hosting, DNS created instantly
- **Why:** Removes domain/DNS friction for Myanmar devs who lack credit cards and DNS knowledge
- **Why Not:** No website builder in MVP, no payment processing yet, no custom domains, no DNS dashboard
- **Tech Spec:** Astro + React + Tailwind CSS 4, Cloudflare Worker, Firebase Auth/Firestore, bilingual i18n
- **Definition of Done:** 8 checkboxes (availability check, platform selection, DNS creation, i18n, live deploy, etc.)

---

### Step 2 — Add the 3 AI files to myanmardev.com

These must exist at the root of `/home/ting/myanmardev.com/` (your project repo):

#### A. `.mcp.json`
Create this file with the MCP servers you used:
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-memory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-github"]
    }
  }
}
```
> Customize this list to match what you actually used. Common: `memory`, `github`, `filesystem`, `sequential-thinking`, `playwright`.

#### B. `.claude/skills/<name>/SKILL.md`
Create a skill file. Example — pick ONE that matches what you did:
- `.claude/skills/deploy-cloudflare/SKILL.md` — skill for deploying to Cloudflare Pages
- `.claude/skills/i18n-helper/SKILL.md` — skill for managing Burmese/English translations
- `.claude/skills/subdomain-builder/SKILL.md` — skill for the subdomain worker

SKILL.md format:
```markdown
# Skill: <name>

## What it does
One sentence description.

## When to use
When Claude should apply this skill.

## Instructions
Step-by-step what Claude should do.
```

#### C. `.claude/agents/<name>.md`
Create an agent file. Example:
- `.claude/agents/db-assistant.md` — agent for database help
- `.claude/agents/deploy-checker.md` — agent that checks deploy readiness
- `.claude/agents/i18n-reviewer.md` — agent that reviews translations

Agent format:
```markdown
# Agent: <name>

## Role
What this agent is an expert at.

## Instructions
What the agent should do when invoked.
```

---

### Step 3 — Create 6-slide PechaKucha

Copy the template from `ch-3/pechakucha-6x20.md` and fill it for your project.

**Create:** `slides/pitch.md` in myanmardev.com

**Required frontmatter:**
```yaml
---
marp: true
paginate: true
transition: fade
auto-advance: 20
---
```

**Required 6 slides:**
1. **Who's my person?** — The real user you built for (a Myanmar developer / newcomer)
2. **Their problem** — What they struggle with today
3. **What I built** — your myanmardev.com project, what it does
4. **How I built it** — MCP tools, Skill, Agent you used
5. **Why it matters** — The impact on your real person
6. **Done checklist** — Repo public, MCP+skill+agent used, report.md in team repo

---

### Step 4 — Get 3 GitHub stars ⭐⭐⭐

| Star | Who | Done? |
|---|---|---|
| ⭐ 1 | (existing) | ✅ 1 |
| ⭐ 2 | (teammate) | ✅ 2 |
| ⭐ 3 | (teammate) | ✅ 3 |

---

### Step 5 — Fill `report.md` in team repo

**Location:** `ch-3/vibecode-ting/report.md` in `team-05`

**Template already created** — fill in the blanks:
- `personal_repo_url:` → `https://github.com/vibecode-ting/myanmardev.com`
- `project_summary:` → describe what myanmardev.com does in one line
- `slides_url:` → `slides/pitch.md` (PATH, not a full URL!)
- `## Methodology` → 2-4 sentences on how you worked
- `### MCP` → path + what you used
- `### Skill` → path + what it does
- `### Agent` → path + what it does

**CRITICAL:** The `- path:` lines under Evidence must match the ACTUAL file paths in your project repo. The validator checks they exist.

---

### Step 6 — Run doctor.sh (✅ Complete)

```bash
bash doctor.sh ch-3
```

All checks passed green — 3 AI files present, 3 stars confirmed, 6 slides with 20s auto-advance, report.md filled.

---

### Step 7 — Submit in Discord (✅ Complete)

Posted in `#ch-3`:
```
@vibecode-ting ch-3 submission
Repo: https://github.com/vibecode-ting/myanmardev.com
Report: ch-3/vibecode-ting/report.md
Slides: slides/pitch.md
```

Instructor reacted ✅ — Chapter 4 unlocked.

---

## What's Still Missing (Priority Order)

| Priority | Task | Effort |
|---|---|---|
| All tasks complete | ch-3 submission fully done | -- |

---

## Features Implemented Since Initial Plan

### Token Economy System
- **Token packages:** Starter (5/$2.50), Basic (10/$4.00), Pro (25/$8.00), Business (50/$12.00)
- **Redeem codes:** Promo codes for free tokens — admin-created, single or multi-use, with expiry
- **Order system:** Token purchase orders (pending/admin-approved) and product orders (instant completion)
- **Key files:** `src/lib/orders.ts`, `src/lib/redeem.ts`, `src/components/BuyTokensModal.tsx`, `src/components/RedeemCodeModal.tsx`, `src/components/TokenBalance.tsx`, `src/components/OrderHistory.tsx`

### Dual Authentication (Google + GitHub)
- **Firebase Auth** with both Google and GitHub OAuth providers
- **User profiles** stored in Firestore with provider info, token balance, GitHub username extraction
- **Sign-in modal** with both providers side-by-side
- **Auth state management** via React context (AuthProvider)
- **Key files:** `src/lib/auth.ts`, `src/components/AuthProvider.tsx`, `src/components/SignInModal.tsx`, `src/components/AuthButton.tsx`, `src/components/AuthGuard.tsx`, `src/components/AuthGate.tsx`

### Public Product Showcase
- **Products page section** visible to all visitors — lists Subdomain Registration (available), Static Website Builder (coming soon), Developer Portfolio (coming soon)
- **Pricing page section** with token package cards and "How Tokens Work" explainer
- **Key files:** `src/components/Products.astro`, `src/components/Pricing.astro`, `src/components/ProductCard.astro`, `src/components/ProductsComingSoon.astro`

### User Dashboard
- **Dedicated dashboard page** at `/en/dashboard` for signed-in users
- **Token balance display** with buy/redeem quick actions
- **Account info** showing email, auth provider, GitHub username
- **Order history** with filtering by type (token purchase, subdomain, website, portfolio)
- **Key files:** `src/pages/en/dashboard.astro`, `src/components/DashboardContent.tsx`

---

## myanmardev.com Project Snapshot

```
myanmardev.com/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── src/
│   ├── components/
│   │   ├── AuthProvider.tsx       (React context for auth state)
│   │   ├── AuthButton.tsx         (Sign in/out button)
│   │   ├── AuthGuard.tsx          (Route protection)
│   │   ├── AuthGate.tsx           (Conditional rendering)
│   │   ├── SignInModal.tsx         (Google + GitHub sign-in)
│   │   ├── TokenBalance.tsx       (Token display widget)
│   │   ├── BuyTokensModal.tsx     (Token purchase flow)
│   │   ├── RedeemCodeModal.tsx    (Promo code redemption)
│   │   ├── OrderHistory.tsx       (Order list with filters)
│   │   ├── DashboardContent.tsx   (Full dashboard layout)
│   │   ├── SubdomainBuilder.tsx   (3-step subdomain flow)
│   │   ├── Header.astro           (Site header)
│   │   ├── Hero.astro             (Landing hero)
│   │   ├── HowItWorks.astro       (3-step explainer)
│   │   ├── Products.astro         (Product showcase)
│   │   ├── Pricing.astro          (Token pricing cards)
│   │   ├── ProductCard.astro      (Individual product)
│   │   ├── ProductsComingSoon.astro
│   │   ├── LanguageSwitcher.tsx    (EN/MY toggle)
│   │   └── AccessGate.tsx         (Legacy access check)
│   ├── i18n/                      (en.json, my.json, utils.ts)
│   ├── layouts/                   (Layout.astro)
│   ├── lib/
│   │   ├── api.ts                 (Cloudflare Worker API calls)
│   │   ├── auth.ts                (User profiles, token balance, Firestore CRUD)
│   │   ├── firebase.ts            (Firebase init)
│   │   ├── firestore.ts           (Firestore helpers)
│   │   ├── orders.ts              (Token/product order management)
│   │   └── redeem.ts              (Redeem code system)
│   └── pages/
│       ├── index.astro            (Landing page)
│       └── en/
│           └── dashboard.astro    (User dashboard)
├── workers/                       (subdomain-api.js, wrangler.toml)
├── migrate/                       (migration project)
├── public/                        (favicon.svg)
└── .github/workflows/             (deploy.yml)
```

---

## Notes

- `slides_url` MUST be a file path like `slides/pitch.md`, NOT a full `https://` link. This is the #1 mistake people make.
- The report goes in the TEAM repo (`team-05/ch-3/vibecode-ting/report.md`), NOT in myanmardev.com.
- All ch-3 checklist items are complete. Project is ready for submission.
