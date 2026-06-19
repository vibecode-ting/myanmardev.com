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
| 7 | 3 GitHub stars ⭐ | Project repo | ❌ 1/3 |
| 8 | `report.md` | `ch-3/vibecode-ting/report.md` in team-05 | ✅ Done |
| 9 | `doctor.sh ch-3` — all green | Terminal | ❌ TODO |
| 10 | Post in `#ch-3` Discord | Discord | ❌ TODO |

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
| ⭐ 2 | Ask a teammate | ❌ |
| ⭐ 3 | Ask a teammate | ❌ |

**Send your repo link in your team channel:**
> Hey team, please ⭐ my ch-3 project: https://github.com/vibecode-ting/myanmardev.com — I'll star yours back!

**Teammates to ask:** a-k-m, itotheconnn, samm24tt, winnaingsoe6666, zhiqiangwu1406

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

### Step 6 — Run doctor.sh

```bash
bash doctor.sh ch-3
```

This checks:
- 3 AI files exist in your project repo
- 3 stars on your repo
- 6 slides with 20s auto-advance
- report.md filled in team repo

Fix any red ❌ until everything is green ✅.

---

### Step 7 — Submit in Discord

Post in `#ch-3`:
```
@vibecode-ting ch-3 submission
Repo: https://github.com/vibecode-ting/myanmardev.com
Report: ch-3/vibecode-ting/report.md
Slides: slides/pitch.md
```

Instructor reacts ✅ → you unlock Chapter 4.

---

## What's Still Missing (Priority Order)

| Priority | Task | Effort |
|---|---|---|
| 🔴 **P1** | Get 2 more stars from teammates (have 1/3) | Ask now |
| 🔴 **P1** | Push AI files + slides to GitHub: `cd ~/myanmardev.com && git add . && git commit -m "ch-3: add MCP, skill, agent, and slides" && git push` | 2 min |
| 🟢 **P2** | Run `doctor.sh ch-3` | 2 min |
| 🟢 **P2** | Post in Discord `#ch-3` | 1 min |

---

## myanmardev.com Project Snapshot

```
myanmardev.com/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── src/
│   ├── components/     (Header, Hero, HowItWorks, ProductCard, LanguageSwitcher, etc.)
│   ├── i18n/           (en.json, my.json, utils.ts)
│   ├── layouts/        (Layout.astro)
│   ├── lib/            (api.ts, firebase.ts, firestore.ts)
│   └── pages/          (index.astro)
├── workers/            (subdomain-api.js, wrangler.toml)
├── migrate/            (migration project)
├── public/             (favicon.svg)
└── .github/workflows/  (deploy.yml)
```

---

## Notes

- Your proposal is now aligned with myanmardev.com — what's in `member-proposals/vibecode-ting.md` matches what you're building.
- `slides_url` MUST be a file path like `slides/pitch.md`, NOT a full `https://` link. This is the #1 mistake people make.
- The report goes in the TEAM repo (`team-05/ch-3/vibecode-ting/report.md`), NOT in myanmardev.com.
- Team-level files (`team-proposal.md`, `spec.md`, `working-agreement.md`, `decision.md`) are for the TEAM project — you don't need those for your personal ch-3 submission.
