# 🔐 GitHub Secrets Guide — myanmardev.com

## Secrets You Need

| Secret Name | Where | Purpose |
|-------------|-------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Worker | DNS record management |
| `CLOUDFLARE_ZONE_ID` | Cloudflare Worker | Identify the zone |

## How to Set Worker Secrets

```bash
cd workers
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put CLOUDFLARE_ZONE_ID
```

## GitHub Actions Variables

Go to https://github.com/vibecode-ting/myanmardev.com/settings/variables/actions

| Variable | Value |
|----------|-------|
| `PUBLIC_WORKER_API_URL` | `https://subdomain-api.myanmardev.com` |

## GitHub Pages Setup

1. Go to https://github.com/vibecode-ting/myanmardev.com/settings/pages
2. Under **"Build and deployment"** → Source: **GitHub Actions**
3. Under **"Custom domain"**: Enter `myanmardev.com`
4. Check **"Enforce HTTPS"** (may take a few minutes to enable)

## Custom Domain DNS Setup (if not already done)

In Cloudflare DNS, add these records for `myanmardev.com`:

| Type | Name | Content |
|------|------|---------|
| CNAME | `@` | `vibecode-ting.github.io` |
| CNAME | `www` | `myanmardev.com` |

For the Apex domain, you can also use GitHub's IPs:

| Type | Name | Content |
|------|------|---------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

## Security Checklist

- [ ] Cloudflare API token scoped to Zone:DNS:Edit on myanmardev.com only
- [ ] Worker secrets set (token + zone ID)
- [ ] Frontend only calls Worker — never Cloudflare API directly
- [ ] CORS restricted to `https://myanmardev.com`
- [ ] `.env` is in `.gitignore`
- [ ] Worker CLOUDFLARE_API_TOKEN never exposed to frontend
