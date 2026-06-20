# GitHub Secrets and Variables Guide — myanmardev.com

## Overview

The deploy workflow (`.github/workflows/deploy.yml`) builds the Astro frontend
and deploys it to GitHub Pages. During the build step, environment variables are
injected so Firebase and the Cloudflare Worker are configured in the production
build.

There are two categories:

- **Variables** — non-sensitive config values (Firebase public keys, API URLs)
- **Secrets** — sensitive values (Cloudflare API token, zone ID — used by the Worker only)

---

## Step 1: GitHub Actions Variables (Required for Frontend Build)

Go to: https://github.com/vibecode-ting/myanmardev.com/settings/variables/actions

Click **"New repository variable"** for each of these:

| Variable Name                  | Value                                  |
|-------------------------------|----------------------------------------|
| `PUBLIC_WORKER_API_URL`       | `https://subdomain-api.myanmardev.com` |
| `PUBLIC_FIREBASE_API_KEY`     | From Firebase Console                  |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | `ting-51902.firebaseapp.com`           |
| `PUBLIC_FIREBASE_PROJECT_ID`  | `ting-51902`                           |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | `ting-51902.firebasestorage.app`    |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1029883464067`                |
| `PUBLIC_FIREBASE_APP_ID`      | `1:1029883464067:web:c206751c630f1f4a8c4eb6` |
| `PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-ZTVB76MM6W`                    |

**Where to find Firebase values:**
Firebase Console -> Project Settings -> General -> Your apps -> Web app config.

These are all `PUBLIC_` prefixed — they are embedded in the client-side bundle
and are NOT secret. They go under **Variables**, not Secrets.

---

## Step 2: GitHub Actions Secrets (Worker Only)

Go to: https://github.com/vibecode-ting/myanmardev.com/settings/secrets/actions

These are only needed if you deploy the Cloudflare Worker from GitHub Actions
(currently the Worker is deployed manually via `wrangler deploy`):

| Secret Name             | Purpose                              |
|------------------------|--------------------------------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for DNS editing |
| `CLOUDFLARE_ZONE_ID`   | Zone ID for myanmardev.com           |

If you deploy the Worker locally, you set these as Wrangler secrets instead:
```bash
cd workers
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put CLOUDFLARE_ZONE_ID
```

---

## Step 3: GitHub Pages Setup

1. Go to https://github.com/vibecode-ting/myanmardev.com/settings/pages
2. Under **"Build and deployment"** -> Source: **GitHub Actions**
3. Under **"Custom domain"**: Enter `myanmardev.com`
4. Check **"Enforce HTTPS"** (may take a few minutes to enable)

---

## Step 4: Custom Domain DNS Setup

In Cloudflare DNS, add these records for `myanmardev.com`:

| Type  | Name | Content                |
|-------|------|------------------------|
| CNAME | `@`  | `vibecode-ting.github.io` |
| CNAME | `www`| `myanmardev.com`       |

Or use GitHub's IPs for the apex domain:

| Type | Name | Content           |
|------|------|-------------------|
| A    | `@`  | `185.199.108.153` |
| A    | `@`  | `185.199.109.153` |
| A    | `@`  | `185.199.110.153` |
| A    | `@`  | `185.199.111.153` |

---

## How the Build Uses These Variables

The deploy workflow (`.github/workflows/deploy.yml`) passes each variable as
an environment variable during `pnpm build`:

```yaml
- name: Build
  env:
    PUBLIC_WORKER_API_URL: ${{ vars.PUBLIC_WORKER_API_URL || 'https://subdomain-api.myanmardev.com' }}
    PUBLIC_FIREBASE_API_KEY: ${{ vars.PUBLIC_FIREBASE_API_KEY }}
    PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ vars.PUBLIC_FIREBASE_AUTH_DOMAIN }}
    PUBLIC_FIREBASE_PROJECT_ID: ${{ vars.PUBLIC_FIREBASE_PROJECT_ID }}
    PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ vars.PUBLIC_FIREBASE_STORAGE_BUCKET }}
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ vars.PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
    PUBLIC_FIREBASE_APP_ID: ${{ vars.PUBLIC_FIREBASE_APP_ID }}
    PUBLIC_FIREBASE_MEASUREMENT_ID: ${{ vars.PUBLIC_FIREBASE_MEASUREMENT_ID }}
  run: pnpm build
```

Astro bakes `PUBLIC_*` env vars into the client bundle at build time.

---

## Security Checklist

- [ ] All `PUBLIC_FIREBASE_*` vars set as **Variables** (not Secrets)
- [ ] Cloudflare API token scoped to Zone:DNS:Edit on myanmardev.com only
- [ ] Worker secrets set via `wrangler secret put` (token + zone ID)
- [ ] Frontend only calls Worker — never Cloudflare API directly
- [ ] CORS restricted to `https://myanmardev.com`
- [ ] `.env` is in `.gitignore` (never committed)
- [ ] Worker `CLOUDFLARE_API_TOKEN` never exposed to frontend
