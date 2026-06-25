---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->

**Myanmar developers** — students, freelancers, and junior devs building projects they want to share online.

They write code, push to GitHub or Vercel, but their URL is `username.github.io` — functional, but not their own.

They don't have a credit card for buying domains, and DNS setup feels intimidating.

---

<!-- slide 2 -->
# Their problem
<!-- 20s -->

To get a professional URL today, a Myanmar dev must:

1. Buy a domain (credit card required — most don't have one)
2. Learn DNS (CNAME, A records, propagation)
3. Wait hours or days for setup

**Result:** They default to subdomain URLs that don't feel like theirs. They never ship with a URL they're proud of.

---

<!-- slide 3 -->
# What I built
<!-- 20s -->

**myanmardev.com** — a full product platform for Myanmar developers.

**Guest-first storefront:** Product showcase, token pricing, 3-step subdomain builder — all visible without sign-in.

**Token economy:** Buy tokens (Starter to Business), redeem promo codes, spend across products.

**Dual auth:** Sign in with Google or GitHub — your dashboard tracks balance and order history.

**Terminal-grade UI:** Premium dark-mode developer aesthetic with Space Grotesk + JetBrains Mono.

Built in **Burmese + English**, full bilingual UI.

---

<!-- slide 4 -->
# How I built it
<!-- 20s -->

**Stack:** Astro 6 + React 19 + Tailwind CSS 4 + Cloudflare Workers + Firebase Auth/Firestore

- **MCP:** `context7` for API docs, `memory` for session context, `github` for repo workflow
- **Skill:** `deploy-cloudflare` — automates build → Worker deploy → Pages deploy → verify flow
- **Agent:** `cf-worker-helper` — expert Cloudflare Worker assistant for DNS API, subdomain validation, wrangler secrets, endpoint testing
- **New systems:** Token economy, dual OAuth (Google + GitHub), order management, user dashboard, public product showcase

Claude Code drove implementation, debugging, and review across the full stack.

---

<!-- slide 5 -->
# Why it matters
<!-- 20s -->

For a Myanmar dev shipping their first project:

- Goes from `username.github.io` → **`myapp.myanmardev.com`** in under 30 seconds
- Zero DNS knowledge needed
- No credit card barrier — buy tokens or redeem a promo code
- Personal dashboard tracks balance, orders, and deployments
- Professional URL = confidence to share their work

**The real person:** a university student who built a portfolio — now it lives at `theirname.myanmardev.com` instead of a generic subdomain.

---

<!-- slide 6 -->
# Done checklist
<!-- 20s -->

- [x] Repo public — `github.com/vibecode-ting/myanmardev.com`
- [x] MCP + skill + agent used — `.mcp.json`, `deploy-cloudflare` skill, `cf-worker-helper` agent
- [x] 3 AI files committed and pushed
- [x] report.md in team repo — `ch-3/vibecode-ting/report.md`
- [x] 3 GitHub stars ⭐⭐⭐
- [x] `doctor.sh ch-3` all green
- [x] Submitted in Discord `#ch-3`
- [x] License: [PolyForm Shield 1.0.0](https://polyformproject.org/licenses/shield/1.0.0/)
