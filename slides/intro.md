<!--
  Marp template — "product-demo" (customized for myanmardev.com)
  Render:  marp slides/intro.md -o slides.html
-->
---
marp: true
paginate: true
size: 16:9
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@500&display=swap');
:root { --bg:#08090A; --surface:#0F1117; --ink:#E2E8F0; --muted:#5A6578; --accent:#00D4AA; --border:#1A1F2E; }
section {
  background:var(--bg); color:var(--ink);
  font-family:'Space Grotesk','Noto Sans','Pyidaungsu',sans-serif;
  font-size:26px; line-height:1.5; padding:48px 64px;
}
h1 { color:var(--ink); font-weight:700; font-size:1.6em; letter-spacing:-0.03em; }
h2 { color:var(--accent); font-weight:600; }
h3 { color:var(--muted); font-weight:600; }
strong { color:var(--accent); }
a { color:var(--accent); text-decoration:none; }
img { border-radius:8px; box-shadow:0 12px 30px rgba(0,0,0,.5); }
code { background:var(--surface); color:var(--accent); padding:.06em .35em; border-radius:4px; font-family:'JetBrains Mono',monospace; border:1px solid var(--border); }
pre  { background:var(--surface); border-radius:8px; border:1px solid var(--border); }
pre code { background:none; color:var(--ink); border:none; }
blockquote { border-left:4px solid var(--accent); background:rgba(0,212,170,0.08); color:var(--ink); padding:.5em 1em; }
header,footer,section::after { color:var(--muted); font-size:.5em; }
section.cover {
  background:radial-gradient(800px 360px at 82% 14%, rgba(0,212,170,0.12), transparent 60%), var(--bg);
}
section.cover h1 { font-size:2.3em; }
section.cover h2 { color:var(--muted); font-weight:400; }
section.shot { background:var(--surface); color:var(--ink); padding:0; display:flex; align-items:center; justify-content:center; }
section.shot img { box-shadow:0 20px 50px rgba(0,0,0,.5); border-radius:8px; max-width:88%; max-height:82%; }
</style>

<!-- _class: cover -->

# myanmardev.com

## Zero Config. True Serverless. Instant Production.

Htet Aung Hlaing · [@vibecode-ting](https://github.com/vibecode-ting) · [app.myanmardev.com](https://app.myanmardev.com)

---

# What you get

- **Free `.myanmardev.com` subdomain** — claim `yourapp.myanmardev.com` in 30 seconds
- **No credit card needed** — token-based system, buy with local payment (MMK)
- **No DNS knowledge required** — we handle all the Cloudflare config
- **Guest-first** — browse everything without signing in
- **Bilingual** — full English + Myanmar language support

---

<!-- _class: shot -->

![Landing page](../screenshots/01-landing.png)

---

# Who it's for

- Myanmar developers who want a **professional URL** for their portfolio or app
- Students building projects who need a **deployed link** fast
- Anyone tired of `localhost` and confusing DNS panels

---

<!-- _class: shot -->

![Subdomain builder](../screenshots/02-builder.png)

---

# How it works

1. **Sign in** with Google or GitHub (Firebase Auth)
2. **Pick a name** — check availability instantly
3. **Pay 1 token** — CNAME record created via Cloudflare API

Stack: **Astro 6 + React 19 + Tailwind CSS 4 + Firebase + Cloudflare Workers**

Built with Claude Code

---

<!-- _class: shot -->

![Dashboard](../screenshots/03-dashboard.png)

---

# Try it

- **Live:** [app.myanmardev.com](https://app.myanmardev.com)
- **Repo:** [github.com/vibecode-ting/myanmardev.com](https://github.com/vibecode-ting/myanmardev.com)
- **License:** [PolyForm Shield 1.0.0](https://polyformproject.org/licenses/shield/1.0.0/)
