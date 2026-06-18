# 🔐 Cloudflare Setup Guide — myanmardev.com

## Step 1: Get Your Cloudflare Zone ID

1. Go to https://dash.cloudflare.com/
2. Select `myanmardev.com`
3. Scroll to **API** section on the right sidebar
4. Copy the **Zone ID** — it looks like `abc123def456...`

## Step 2: Create an API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"** → Under **Custom Token**, click **"Get started"**
3. Configure:

| Field | Value |
|-------|-------|
| Token name | `myanmardev.com DNS Manager` |
| Permissions | Zone → DNS → Edit |
| Zone Resources | Include → Specific zone → `myanmardev.com` |

4. Click **"Continue to summary"** → **"Create Token"**
5. **Copy the token immediately** — you won't see it again!

## Step 3: Deploy the Worker

```bash
# Install Wrangler if you don't have it
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set secrets
wrangler secret put CLOUDFLARE_API_TOKEN   # Paste your API token
wrangler secret put CLOUDFLARE_ZONE_ID     # Paste your zone ID

# Deploy the worker
cd workers
wrangler deploy
```

The worker will deploy to `https://subdomain-api.myanmardev.com` (or whatever subdomain you configured).

## Step 4: Create the Worker Subdomain

You'll need to create a CNAME record for `subdomain-api` pointing to your Cloudflare Worker in the Workers & Pages dashboard.

## Step 5: Verify

```bash
# Test health check
curl https://subdomain-api.myanmardev.com/health

# Test checking a subdomain
curl -X POST https://subdomain-api.myanmardev.com/check \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "test"}'
```

## Step 6: Add to GitHub Actions Variables

Go to https://github.com/vibecode-ting/myanmardev.com/settings/variables/actions

Add variable:
- `PUBLIC_WORKER_API_URL` = `https://subdomain-api.myanmardev.com`

(This is already set as a default in the deploy workflow, but add it as a variable too.)
