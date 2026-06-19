# Skill: deploy-cloudflare

## What it does
Deploys the myanmardev.com project to Cloudflare Pages (frontend) and Cloudflare Workers (API proxy), running build, secrets check, and deploy in one flow.

## When to use
When changes are ready to ship — Claude applies this skill to build the Astro site, deploy the Worker with secrets, and verify the deployment is live.

## Instructions
1. Run `pnpm build` to verify the Astro frontend builds clean
2. Check that `workers/wrangler.toml` is present and `workers/subdomain-api.js` is unchanged
3. Deploy the Worker: `npx wrangler deploy workers/subdomain-api.js` (secrets are already set on the Worker)
4. Deploy the frontend: push to main — Cloudflare Pages auto-deploys from the GitHub integration
5. Verify: curl `https://myanmardev.com/health` for 200, and check the subdomain builder loads at the root
