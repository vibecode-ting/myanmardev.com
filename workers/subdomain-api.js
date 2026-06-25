/**
 * Cloudflare Worker — Subdomain API
 *
 * Proxies requests from the frontend to Cloudflare DNS API.
 * Supports multiple domains under the same Cloudflare account.
 *
 * Secrets:
 *   CLOUDFLARE_API_TOKEN — Cloudflare API token (Zone → DNS → Edit)
 *   ALLOWED_ORIGIN       — CORS allow origin (https://app.myanmardev.com)
 *
 * Endpoints:
 *   GET  /domains — List available domains
 *   POST /check   — Check if a subdomain DNS record exists
 *   POST /create  — Create a CNAME record for the subdomain
 */

// ─── Configuration ──────────────────────────────────────

// All domains this worker can manage
const DOMAINS = [
  { name: 'myanmardev.com', zoneId: '3647ed4e91b44f19f4c1dbcacfd8e028' },
  { name: 'myanmar.dpdns.org', zoneId: '968bf1c3672e6308546fe6ab555a5eed' },
  { name: 'tinghah.online', zoneId: 'cbada11d7a1dae8e19d583882a21f106' },
];

// ─── CORS Headers ───────────────────────────────────────

function corsHeaders(origin, allowedOrigin) {
  return {
    'Access-Control-Allow-Origin': origin || allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// ─── Cloudflare API Helpers ─────────────────────────────

/** Resolve domain to its zone config */
function resolveDomain(domain) {
  if (!domain) return DOMAINS[0]; // default to myanmardev.com
  const found = DOMAINS.find(d => d.name === domain.toLowerCase().trim());
  return found || null;
}

/** List all DNS records matching a given name */
async function getDNSRecord(zoneId, name, apiToken) {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
}

/** Create a CNAME DNS record */
async function createDNSRecord(zoneId, name, content, apiToken) {
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
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
  return res.json();
}

// ─── Request Handlers ───────────────────────────────────

/** GET /domains — List available domains */
function handleDomains(request, env) {
  const origin = request.headers.get('Origin');
  return Response.json(
    { domains: DOMAINS.map(d => d.name) },
    { headers: corsHeaders(origin, env.ALLOWED_ORIGIN) }
  );
}

/** POST /check — Check if a subdomain is available */
async function handleCheck(request, env) {
  const origin = request.headers.get('Origin');
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const allowedOrigin = env.ALLOWED_ORIGIN || 'https://app.myanmardev.com';

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { available: false, error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  const { subdomain, domain } = body;

  if (!subdomain || typeof subdomain !== 'string') {
    return Response.json(
      { available: false, error: 'subdomain is required' },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  const zone = resolveDomain(domain);
  if (!zone) {
    return Response.json(
      { available: false, error: `Unknown domain: ${domain}. Available: ${DOMAINS.map(d => d.name).join(', ')}` },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  // Validate subdomain format
  const trimmed = subdomain.trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed)) {
    return Response.json(
      { available: false, error: 'Invalid subdomain format. Use letters, numbers, and hyphens only.' },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  // Check for reserved subdomains
  const reserved = ['www', 'mail', 'api', 'admin', 'cdn', 'dev'];
  if (reserved.includes(trimmed)) {
    return Response.json(
      { available: false, subdomain: trimmed, message: `${trimmed}.${zone.name} is a reserved subdomain.` },
      { status: 200, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  try {
    const recordName = `${trimmed}.${zone.name}`;
    const result = await getDNSRecord(zone.zoneId, recordName, apiToken);

    if (!result.success) {
      return Response.json(
        { available: false, error: 'Failed to query DNS records' },
        { status: 500, headers: corsHeaders(origin, allowedOrigin) }
      );
    }

    const exists = result.result && result.result.length > 0;

    if (exists) {
      return Response.json(
        { available: false, subdomain: trimmed, message: `${recordName} is already in use.` },
        { headers: corsHeaders(origin, allowedOrigin) }
      );
    }

    return Response.json(
      { available: true, subdomain: trimmed, domain: zone.name, message: `${recordName} is available!` },
      { headers: corsHeaders(origin, allowedOrigin) }
    );
  } catch (err) {
    return Response.json(
      { available: false, error: 'DNS check failed. Please try again.' },
      { status: 500, headers: corsHeaders(origin, allowedOrigin) }
    );
  }
}

/** POST /create — Create a CNAME record */
async function handleCreate(request, env) {
  const origin = request.headers.get('Origin');
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  const allowedOrigin = env.ALLOWED_ORIGIN || 'https://app.myanmardev.com';

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  const { subdomain, domain, platform, sourceUrl } = body;

  if (!subdomain || !platform || !sourceUrl) {
    return Response.json(
      { success: false, error: 'subdomain, platform, and sourceUrl are required' },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  const zone = resolveDomain(domain);
  if (!zone) {
    return Response.json(
      { success: false, error: `Unknown domain: ${domain}` },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
    );
  }

  const trimmed = subdomain.trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(trimmed)) {
    return Response.json(
      { success: false, error: 'Invalid subdomain format.' },
      { status: 400, headers: corsHeaders(origin, allowedOrigin) }
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
        { status: 400, headers: corsHeaders(origin, allowedOrigin) }
      );
  }

  try {
    const recordName = `${trimmed}.${zone.name}`;

    // Check if already exists
    const existing = await getDNSRecord(zone.zoneId, recordName, apiToken);
    if (existing.success && existing.result && existing.result.length > 0) {
      return Response.json(
        { success: false, error: `${recordName} already exists. Choose another subdomain.` },
        { status: 409, headers: corsHeaders(origin, allowedOrigin) }
      );
    }

    // Create the record
    const result = await createDNSRecord(zone.zoneId, recordName, cnameTarget, apiToken);

    if (!result.success) {
      const errors = result.errors?.map(e => e.message).join(', ') || 'Unknown error';
      return Response.json(
        { success: false, error: `Failed to create DNS record: ${errors}` },
        { status: 500, headers: corsHeaders(origin, allowedOrigin) }
      );
    }

    return Response.json(
      {
        success: true,
        subdomain: recordName,
        domain: zone.name,
        record: {
          type: 'CNAME',
          name: recordName,
          content: cnameTarget,
        },
        message: `${recordName} has been created and points to ${cnameTarget}`,
      },
      { headers: corsHeaders(origin, allowedOrigin) }
    );
  } catch (err) {
    return Response.json(
      { success: false, error: 'DNS creation failed. Please try again.' },
      { status: 500, headers: corsHeaders(origin, allowedOrigin) }
    );
  }
}

// ─── Main Router ────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigin = env.ALLOWED_ORIGIN || 'https://app.myanmardev.com';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowedOrigin),
      });
    }

    // Route requests
    if (request.method === 'GET' && url.pathname === '/domains') {
      return handleDomains(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/check') {
      return handleCheck(request, env);
    }

    if (request.method === 'POST' && url.pathname === '/create') {
      return handleCreate(request, env);
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json(
        { status: 'ok', domains: DOMAINS.map(d => d.name) },
        { headers: corsHeaders(origin, allowedOrigin) }
      );
    }

    // 404
    return Response.json(
      { error: 'Not found. Use GET /domains, POST /check, or POST /create' },
      { status: 404, headers: corsHeaders(origin, allowedOrigin) }
    );
  },
};
