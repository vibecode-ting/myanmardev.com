/**
 * Cloudflare Worker — Subdomain API
 *
 * Proxies requests from the frontend to Cloudflare DNS API.
 * Deploy with: npx wrangler deploy workers/subdomain-api.js
 *
 * You need two secrets set on the Worker:
 *   CLOUDFLARE_API_TOKEN — Cloudflare API token (Zone → DNS → Edit)
 *   CLOUDFLARE_ZONE_ID   — Zone ID for myanmardev.com
 *   ALLOWED_ORIGIN       — CORS allow origin (https://myanmardev.com)
 *
 * Endpoints:
 *   POST /check  — Check if a subdomain DNS record exists
 *   POST /create — Create a CNAME record for the subdomain
 */

// ─── Configuration ──────────────────────────────────────

const ZONE_ID = globalThis.CLOUDFLARE_ZONE_ID;
const API_TOKEN = globalThis.CLOUDFLARE_API_TOKEN;
const ALLOWED_ORIGIN = globalThis.ALLOWED_ORIGIN || 'https://myanmardev.com';
const ROOT_DOMAIN = 'myanmardev.com';

// ─── CORS Headers ───────────────────────────────────────

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// ─── Cloudflare API Helpers ─────────────────────────────

/** List all DNS records matching a given name */
async function getDNSRecord(name) {
  const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  return data;
}

/** Create a CNAME DNS record */
async function createDNSRecord(name, content) {
  const url = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'CNAME',
      name: name,
      content: content,
      ttl: 1, // Auto TTL
      proxied: false, // Don't proxy DNS-only records
    }),
  });

  const data = await res.json();
  return data;
}

// ─── Request Handlers ───────────────────────────────────

/** POST /check — Check if a subdomain is available */
async function handleCheck(request) {
  const origin = request.headers.get('Origin');
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { available: false, error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  const { subdomain } = body;

  if (!subdomain || typeof subdomain !== 'string') {
    return Response.json(
      { available: false, error: 'subdomain is required' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Validate subdomain format
  const trimmed = subdomain.trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed)) {
    return Response.json(
      { available: false, error: 'Invalid subdomain format. Use letters, numbers, and hyphens only.' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Check for reserved subdomains
  const reserved = ['www', 'mail', 'api', 'admin', 'cdn', 'dev'];
  if (reserved.includes(trimmed)) {
    return Response.json(
      { available: false, subdomain: trimmed, message: `${trimmed}.${ROOT_DOMAIN} is a reserved subdomain.` },
      { status: 200, headers: corsHeaders(origin) }
    );
  }

  try {
    const recordName = `${trimmed}.${ROOT_DOMAIN}`;
    const result = await getDNSRecord(recordName);

    if (!result.success) {
      return Response.json(
        { available: false, error: 'Failed to query DNS records' },
        { status: 500, headers: corsHeaders(origin) }
      );
    }

    const exists = result.result && result.result.length > 0;

    if (exists) {
      return Response.json(
        { available: false, subdomain: trimmed, message: `${recordName} is already in use.` },
        { headers: corsHeaders(origin) }
      );
    }

    return Response.json(
      { available: true, subdomain: trimmed, message: `${recordName} is available!` },
      { headers: corsHeaders(origin) }
    );
  } catch (err) {
    return Response.json(
      { available: false, error: 'DNS check failed. Please try again.' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

/** POST /create — Create a CNAME record */
async function handleCreate(request) {
  const origin = request.headers.get('Origin');
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  const { subdomain, platform, sourceUrl } = body;

  if (!subdomain || !platform || !sourceUrl) {
    return Response.json(
      { success: false, error: 'subdomain, platform, and sourceUrl are required' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  const trimmed = subdomain.trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed)) {
    return Response.json(
      { success: false, error: 'Invalid subdomain format.' },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Determine CNAME target based on platform
  let cnameTarget;
  switch (platform) {
    case 'github':
      cnameTarget = `${sourceUrl.trim()}.github.io`;
      break;
    case 'vercel':
      cnameTarget = 'cname.vercel-dns.com';
      break;
    case 'netlify':
      cnameTarget = `${sourceUrl.trim()}.netlify.app`;
      break;
    case 'custom':
      cnameTarget = sourceUrl.trim();
      break;
    default:
      return Response.json(
        { success: false, error: 'Unsupported platform. Use: github, vercel, netlify, or custom.' },
        { status: 400, headers: corsHeaders(origin) }
      );
  }

  try {
    const recordName = `${trimmed}.${ROOT_DOMAIN}`;

    // Check if already exists
    const existing = await getDNSRecord(recordName);
    if (existing.success && existing.result && existing.result.length > 0) {
      return Response.json(
        { success: false, error: `${recordName} already exists. Choose another subdomain.` },
        { status: 409, headers: corsHeaders(origin) }
      );
    }

    // Create the record
    const result = await createDNSRecord(recordName, cnameTarget);

    if (!result.success) {
      const errors = result.errors?.map(e => e.message).join(', ') || 'Unknown error';
      return Response.json(
        { success: false, error: `Failed to create DNS record: ${errors}` },
        { status: 500, headers: corsHeaders(origin) }
      );
    }

    return Response.json(
      {
        success: true,
        subdomain: recordName,
        record: {
          type: 'CNAME',
          name: recordName,
          content: cnameTarget,
        },
        message: `${recordName} has been created and points to ${cnameTarget}`,
      },
      { headers: corsHeaders(origin) }
    );
  } catch (err) {
    return Response.json(
      { success: false, error: 'DNS creation failed. Please try again.' },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

// ─── Main Router ────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    // Override global vars with Worker secrets
    globalThis.CLOUDFLARE_API_TOKEN = env.CLOUDFLARE_API_TOKEN;
    globalThis.CLOUDFLARE_ZONE_ID = env.CLOUDFLARE_ZONE_ID;
    globalThis.ALLOWED_ORIGIN = env.ALLOWED_ORIGIN || 'https://myanmardev.com';

    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // Route requests
    if (request.method === 'POST' && url.pathname === '/check') {
      return handleCheck(request);
    }

    if (request.method === 'POST' && url.pathname === '/create') {
      return handleCreate(request);
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json(
        { status: 'ok', domain: ROOT_DOMAIN },
        { headers: corsHeaders(origin) }
      );
    }

    // 404
    return Response.json(
      { error: 'Not found. Use POST /check or POST /create' },
      { status: 404, headers: corsHeaders(origin) }
    );
  },
};
