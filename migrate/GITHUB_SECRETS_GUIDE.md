# GitHub Secrets Setup Guide (Migration Archive)

> **Note:** This file is from the ch-3 migration project. For the current
> myanmardev.com setup, see the root `GITHUB_SECRETS_GUIDE.md`.

---

## Why Use Secrets and Variables?

Firebase config values must be available during the GitHub Actions build but
never committed to the repository. GitHub provides two mechanisms:

- **Variables** — for non-sensitive config (Firebase public keys, API URLs)
- **Secrets** — for sensitive values (API tokens, service account keys)

The `PUBLIC_` prefixed Firebase values are **not secret** — they are embedded
in the client-side bundle. They should go under **Variables**, not Secrets.

---

## Step 1: Go to Repository Settings

1. Open your repo on GitHub
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** -> **Actions**

## Step 2: Add Variables (Non-Sensitive)

Click **"New repository variable"** for each:

| Variable Name                     | Value (from your `.env`)             |
|----------------------------------|--------------------------------------|
| `PUBLIC_WORKER_API_URL`          | `https://subdomain-api.myanmardev.com` |
| `PUBLIC_FIREBASE_API_KEY`        | From Firebase Console                |
| `PUBLIC_FIREBASE_AUTH_DOMAIN`    | `ting-51902.firebaseapp.com`         |
| `PUBLIC_FIREBASE_PROJECT_ID`     | `ting-51902`                         |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | `ting-51902.firebasestorage.app`     |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1029883464067`                 |
| `PUBLIC_FIREBASE_APP_ID`         | `1:1029883464067:web:...`            |
| `PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-ZTVB76MM6W`                       |

**Where to find Firebase values:**
Firebase Console -> Project Settings -> General -> Your apps -> Web app config.

## Step 3: Add Secrets (Sensitive — Worker Only)

Click **"New repository secret"** for each:

| Secret Name             | Purpose                              |
|------------------------|--------------------------------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for DNS editing |
| `CLOUDFLARE_ZONE_ID`   | Zone ID for myanmardev.com           |

These are only needed if deploying the Worker from GitHub Actions. If deploying
locally via `wrangler deploy`, set them as Wrangler secrets instead.

## Step 4: Verify the Workflow

The deploy workflow reads variables at build time:

```yaml
- name: Build
  env:
    PUBLIC_WORKER_API_URL: ${{ vars.PUBLIC_WORKER_API_URL || 'https://subdomain-api.myanmardev.com' }}
    PUBLIC_FIREBASE_API_KEY: ${{ vars.PUBLIC_FIREBASE_API_KEY }}
    PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ vars.PUBLIC_FIREBASE_AUTH_DOMAIN }}
    # ... etc
  run: pnpm build
```

## Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has NO real keys — only placeholders
- [ ] All 7 Firebase vars are added as GitHub **Variables** (not Secrets)
- [ ] Cloudflare secrets are set (if deploying Worker from Actions)
- [ ] The deploy workflow passes on `main`
