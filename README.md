# myanmardev.com

Subdomain builder automation for `myanmardev.com` — automated DNS record creation via Cloudflare API.

## How It Works

1. Enter a subdomain → check if it's available
2. Choose your hosting platform (GitHub Pages, Vercel, Netlify, Custom)
3. Enter source URL → create the DNS record automatically
4. Your `myapp.myanmardev.com` is live!

## Tech Stack

- **Frontend:** Astro + React + Tailwind CSS 4
- **API Proxy:** Cloudflare Worker (serverless)
- **DNS:** Cloudflare API
- **Deployment:** GitHub Pages

## Setup

See `CLOUDFLARE_SETUP_GUIDE.md` and `GITHUB_SECRETS_GUIDE.md` for full setup instructions.

## # Local Development

```bash
pnpm install
pnpm dev
```
