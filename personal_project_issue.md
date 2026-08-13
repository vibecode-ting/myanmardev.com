# Personal Project Missing from Vibe Code Tours Live Gallery

**Author:** tinghah (Htet Aung Hlaing / Ting)
**Repo (project):** https://github.com/tinghah/app.myanmardev.com
**Live site:** https://app.myanmardev.com
**Team:** Team-05 (team-05 repo member)
**Date:** 2026-08-14

---

## 1. What is wrong

My personal project **does not appear** in the Personal Project Gallery on the
live Vibe Code Tours site (`vibe-code-tours.github.io` → `/projects/personal`),
even though:

- My GitHub account `tinghah` is a member of `team-05`.
- My builder card exists and is live: `src/content/builders/tinghah.md` in the
  site repo (`github: tinghah`, `cohort: 1`, `role: builder`).
- `src/data/levels.json` in the site repo contains `"tinghah": 7` (level 7).
- The site repo's `src/data/projects.json` — which drives the personal gallery —
  has **no entry** for `tinghah`, `vibecode-ting`, or `app.myanmardev.com`.

---

## 2. Root cause (analysis of site repo git history)

The project was **originally listed** under my **old GitHub username**:

```
"github":    "vibecode-ting",
"name":      "vibecode-ting",
"title":     "myanmardev.com",
"repo_url":  "https://github.com/vibecode-ting/myanmardev.com",
"live_url":  "https://app.myanmardev.com",
"chapter":   6
```

Timeline of what happened (evidence from `vibe-code-tours.github.io` git log):

1. `5fd6a01` — Personal project `myanmardev.com` was live in the gallery under
   `github: vibecode-ting`, repo `vibecode-ting/myanmardev.com`.
2. I renamed my GitHub account **`vibecode-ting` → `tinghah`** and the project
   repo **`myanmardev.com` → `app.myanmardev.com`**.
   - `5b05283` "update tinghah profile and remove vibecode-ting (#395)" — renamed
     the builder card `vibecode-ting.md` → `tinghah.md`.
   - `0ea0856` "point repo to the project repo (app.myanmardev.com)" — builder
     profile now points to `https://github.com/tinghah/app.myanmardev.com`.
3. `9ecbbd6` (Jul 20, author `vibecode-team-repos[bot]`, "data: refresh project
   gallery") — the bot **removed the `vibecode-ting` entry entirely** from
   `src/data/projects.json`. It was never re-added under the new name.

### Why the bot dropped it

`src/data/projects.json` is **auto-generated** by the bot
(`channels/scripts/export-gallery.mjs`) and committed by
`vibecode-team-repos[bot]`. It discovers a builder's project by **GitHub
username + repo URL**. After my rename:

- `vibecode-ting/myanmardev.com` no longer exists (404),
- so the bot deleted the stale entry,
- and nothing told it to re-scan `tinghah/app.myanmardev.com`.

Result: my project is now missing from the gallery even though I am on the team
and my builder card + level are intact.

---

## 3. Impact

- My personal project `app.myanmardev.com` is invisible on the public
  `vibecode.tours` personal-gallery page (English + Burmese routes).
- Visitors, mentors, and judges cannot find the project or its slides from the
  site.
- My builder card (`src/content/builders/tinghah.md`) still links to the repo and
  live site, so the card alone works — but the project is not in the gallery.

---

## 4. What is already correct (so it can be picked up again)

- Builder profile: `src/content/builders/tinghah.md`
  - `github: tinghah`
  - `repo: https://github.com/tinghah/app.myanmardev.com`
  - `website: https://app.myanmardev.com`
- Level: `src/data/levels.json` → `"tinghah": 7`
- Project repo has the expected structure for the gallery export:
  - `slides/intro.md` and `slides/pitch.md`
  - `screenshots/` with screenshots (`01_main.png`, etc.)
  - default branch `main`

---

## 5. Questions

1. Can the gallery export bot be re-run so it re-scans `tinghah/app.myanmardev.com`
   and re-adds the project to `src/data/projects.json`?
2. Does the export script key strictly on the `repo` field of the builder card
   (`src/content/builders/<github>.md`), and is that enough now that the card
   points at the new repo?
3. Is there an exact repo layout requirement (e.g. `slides/intro.md` path,
   `screenshots/` folder name, branch `main` vs `master`) that must be met for
   the bot to include a project? I believe my repo already matches, but please
   confirm.
4. If the bot cannot be re-run soon, is a manual PR that appends my entry to
   `src/data/projects.json` acceptable (acknowledging a later bot refresh would
   overwrite it)?

---

## 6. How to fix

### Option A — recommended: ask admin/mentor to re-run the gallery bot

1. Share this issue with a mentor/admin in the cohort channel (Discord/Telegram).
2. Ask them to re-run `export-gallery.mjs` (or equivalent) so `projects.json`
   is refreshed from current builder profiles + repos.
3. After the refresh, verify `tinghah` appears in `src/data/projects.json` and
   the live gallery at `vibecode.tours/projects/personal`.

### Option B — manual entry via PR (if bot re-run is slow)

Append the following entry to `src/data/projects.json` (will be overwritten by
the next bot refresh, but restores visibility immediately):

```json
{
  "github": "tinghah",
  "name": "tinghah",
  "title": "app.myanmardev.com",
  "desc": "Free `.myanmardev.com` subdomains for Myanmar developers — no credit card, no DNS setup required.",
  "repo_url": "https://github.com/tinghah/app.myanmardev.com",
  "live_url": "https://app.myanmardev.com",
  "slides_raw": "https://raw.githubusercontent.com/tinghah/app.myanmardev.com/main/slides/intro.md",
  "slides_base": "https://raw.githubusercontent.com/tinghah/app.myanmardev.com/main/slides/",
  "screenshot_url": "https://raw.githubusercontent.com/tinghah/app.myanmardev.com/main/screenshots/01_main.png",
  "screenshots": [
    "https://raw.githubusercontent.com/tinghah/app.myanmardev.com/main/screenshots/01_main.png",
    "https://raw.githubusercontent.com/tinghah/app.myanmardev.com/main/screenshots/01_main_mm.png",
    "https://raw.githubusercontent.com/tinghah/app.myanmardev.com/main/screenshots/09_DOMAINS.png"
  ],
  "type": "web-app",
  "stack": ["TypeScript", "Astro", "JavaScript"],
  "chapter": 7,
  "team": 5
}
```

### Option C — fix within my repo (if the bot needs it)

If the bot requires the repo to be owned by the exact username in `projects.json`,
double-check nothing still references the old `vibecode-ting` name anywhere
(GitHub username, repo description, website links) so future exports match.

---

## 7. Summary / key points

- ✅ I am on Team-05; builder card + level (7) are live and correct.
- ❌ My personal project is **not** in `src/data/projects.json`, so it is not in
  the live personal gallery.
- 🔍 Root cause: **GitHub account/repo rename** (`vibecode-ting` → `tinghah`,
  `myanmardev.com` → `app.myanmardev.com`) caused the bot's refresh
  (`9ecbbd6`) to **delete** the stale `vibecode-ting` entry, and it was never
  re-added.
- 🛠 Fix: ask admin/mentor to **re-run the gallery export bot**, or approve a
  manual `projects.json` entry via PR.
- ✅ Project repo already has `slides/` + `screenshots/` on `main`, so it should
  be picked up on the next export.
