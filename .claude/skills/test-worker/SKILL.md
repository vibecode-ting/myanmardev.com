# Skill: Test Worker

## What it does
Test the Cloudflare Worker endpoints locally before deployment.

## When to use
- After modifying `workers/subdomain-api.js`
- Before running `wrangler deploy`
- When debugging DNS-related issues

## Instructions
1. Start local worker with `npx wrangler dev workers/subdomain-api.js`
2. Test `GET /health` returns 200
3. Test `POST /check` with valid and invalid subdomains
4. Test `POST /create` with mock data
5. Verify CORS headers are correct
6. Test edge cases: reserved subdomains, invalid formats, missing body fields
