/**
 * API client for the Subdomain Builder Cloudflare Worker.
 *
 * The Worker endpoint is configured via PUBLIC_WORKER_API_URL env var.
 * In production, this points to https://subdomain-api.myanmardev.com
 */

interface CheckResponse {
  available: boolean;
  subdomain: string;
  domain: string;
  message: string;
}

interface CreateResponse {
  success: boolean;
  subdomain: string;
  domain: string;
  record: {
    type: string;
    name: string;
    content: string;
  };
  message: string;
}

interface ErrorResponse {
  success: false;
  error: string;
}

const API_URL = import.meta.env.PUBLIC_WORKER_API_URL || 'http://localhost:8787';

/** Get list of available domains */
export async function getDomains(): Promise<string[]> {
  const res = await fetch(`${API_URL}/domains`);
  if (!res.ok) return ['myanmardev.com']; // fallback
  const data = await res.json();
  return data.domains || ['myanmardev.com'];
}

/** Check if a subdomain is available */
export async function checkSubdomain(subdomain: string, domain: string): Promise<CheckResponse> {
  const res = await fetch(`${API_URL}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subdomain, domain }),
  });

  if (!res.ok) {
    const err: ErrorResponse = await res.json();
    return { available: false, subdomain, domain, message: err.error || 'DNS check failed' };
  }

  return res.json();
}

/** Create a CNAME record for the subdomain */
export async function createSubdomain(params: {
  subdomain: string;
  domain: string;
  platform: string;
  sourceUrl: string;
}): Promise<CreateResponse> {
  const res = await fetch(`${API_URL}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err: ErrorResponse = await res.json();
    throw new Error(err.error || 'DNS creation failed');
  }

  return res.json();
}
