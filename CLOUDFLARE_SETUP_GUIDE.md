# Cloudflare Setup Guide — myanmardev.com

## Overview

The Cloudflare Worker is a serverless API proxy that handles DNS record
management. It is the only component that holds the Cloudflare API token —
the Astro frontend never has direct access.

**Flow:**
```
Browser -> Astro Frontend -> Cloudflare Worker -> Cloudflare API -> DNS
```

The Worker exposes three endpoints:
- `GET  /health`  — Health check
- `POST /check`   — Check if a subdomain is available
- `POST /create`  — Create a CNAME DNS record for a subdomain

---

## Step 1: Get Your Cloudflare Zone ID

1. Go to https://dash.cloudflare.com/
2. Select `myanmardev.com`
3. Scroll to **API** section on the right sidebar
4. Copy the **Zone ID** — it looks like `abc123def456...`

---

## Step 2: Create an API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"** -> Under **Custom Token**, click **"Get started"**
3. Configure:

| Field           | Value                                       |
|-----------------|---------------------------------------------|
| Token name      | `myanmardev.com DNS Manager`                |
| Permissions     | Zone -> DNS -> Edit                         |
| Zone Resources  | Include -> Specific zone -> `myanmardev.com`|

4. Click **"Continue to summary"** -> **"Create Token"**
5. **Copy the token immediately** — you won't see it again!

---

## Step 3: Deploy the Worker

```bash
# Install Wrangler if you don't have it
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to workers directory
cd workers

# Set secrets (paste your values when prompted)
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put CLOUDFLARE_ZONE_ID

# Deploy the worker
wrangler deploy
```

The worker will deploy to `https://subdomain-api.myanmardev.com` (or whatever
subdomain you configured in `wrangler.toml`).

---

## Step 4: Create the Worker Subdomain

You need a DNS record for the Worker subdomain. In the Cloudflare dashboard:

1. Go to Workers & Pages -> your worker -> Settings -> Domains & Routes
2. Add a custom domain: `subdomain-api.myanmardev.com`

Or create a CNAME record manually pointing `subdomain-api` to your worker.

---

## Step 5: Verify

```bash
# Test health check
curl https://subdomain-api.myanmardev.com/health

# Test checking a subdomain
curl -X POST https://subdomain-api.myanmardev.com/check \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "test"}'
```

---

## Step 6: Configure Frontend Environment Variable

The Astro frontend needs to know where the Worker is. Set:

```
PUBLIC_WORKER_API_URL=https://subdomain-api.myanmardev.com
```

- For local development: add to `.env` (copy from `.env.example`)
- For GitHub Actions: add as a Variable at:
  https://github.com/vibecode-ting/myanmardev.com/settings/variables/actions

See `GITHUB_SECRETS_GUIDE.md` for the full list of required variables.

---

## How It Fits the Token System

When an authenticated user creates a subdomain:

1. User has enough tokens in their Firestore profile (`users/{uid}.tokenBalance`)
2. Tokens are deducted via `deductTokens()` in `src/lib/firestore.ts`
3. A product order is created in Firestore (`orders` collection)
4. The frontend calls the Worker's `/create` endpoint
5. Worker creates the DNS CNAME record via Cloudflare API

If the user has insufficient tokens, the request is blocked client-side before
calling the Worker.
