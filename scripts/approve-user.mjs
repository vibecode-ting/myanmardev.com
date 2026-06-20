#!/usr/bin/env node
/**
 * Manage approved GitHub usernames in Firestore.
 *
 * Usage:
 *   node scripts/approve-user.mjs add <github-username>
 *   node scripts/approve-user.mjs remove <github-username>
 *   node scripts/approve-user.mjs list
 *
 * Reads Firebase config from ../.env (PUBLIC_FIREBASE_* vars).
 * Uses the Firestore REST API — no service account needed.
 *
 * Prerequisites:
 *   - Firebase project must have Firestore created (native mode)
 *   - Firestore rules must allow writes:
 *       rules_version = '2';
 *       service cloud.firestore {
 *         match /databases/{db}/documents {
 *           match /approved_users/{doc} {
 *             allow read: if true;
 *             allow write: if true;  // or restrict later
 *           }
 *         }
 *       }
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '..', '.env');

// ─── Parse .env ──────────────────────────────────────────

function parseEnv(path) {
  const content = readFileSync(path, 'utf-8');
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    vars[key] = value;
  }
  return vars;
}

const env = parseEnv(ENV_PATH);

const PROJECT_ID = env.PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = env.PUBLIC_FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error('❌ Missing PUBLIC_FIREBASE_PROJECT_ID or PUBLIC_FIREBASE_API_KEY in .env');
  process.exit(1);
}

// ─── Firestore REST helpers ──────────────────────────────

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const COLLECTION = 'approved_users';

async function listDocs() {
  const url = `${BASE}/${COLLECTION}`;
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Firestore error:', data.error?.message || JSON.stringify(data));
    return [];
  }

  return (data.documents || []).map(doc => {
    const fields = doc.fields || {};
    return {
      id: doc.name.split('/').pop(),
      githubUsername: fields.githubUsername?.stringValue || doc.name.split('/').pop(),
      addedAt: fields.addedAt?.stringValue || 'unknown',
    };
  });
}

async function addDoc(docId, fields) {
  const url = `${BASE}/${COLLECTION}?documentId=${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Failed to add:', data.error?.message || JSON.stringify(data));
    return false;
  }
  return true;
}

async function deleteDoc(docId) {
  const url = `${BASE}/${COLLECTION}/${encodeURIComponent(docId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'x-goog-api-key': API_KEY },
  });
  if (!res.ok && res.status !== 404) {
    const data = await res.json();
    console.error('❌ Failed to delete:', data.error?.message || JSON.stringify(data));
    return false;
  }
  return true;
}

// ─── CLI ─────────────────────────────────────────────────

const [cmd, username] = process.argv.slice(2);

function toFields(name) {
  return {
    githubUsername: { stringValue: name },
    addedAt: { stringValue: new Date().toISOString() },
  };
}

async function main() {
  switch (cmd) {
    case 'add': {
      if (!username) { console.error('Usage: approve-user.mjs add <github-username>'); process.exit(1); }
      const ok = await addDoc(username.toLowerCase(), toFields(username));
      if (ok) console.log(`✅ Approved: @${username} (doc: ${username.toLowerCase()})`);
      break;
    }
    case 'remove': {
      if (!username) { console.error('Usage: approve-user.mjs remove <github-username>'); process.exit(1); }
      const ok = await deleteDoc(username.toLowerCase());
      if (ok) console.log(`🗑 Removed: @${username}`);
      break;
    }
    case 'list': {
      const docs = await listDocs();
      if (docs.length === 0) {
        console.log('(No approved users)');
      } else {
        console.log(`\nApproved GitHub users (${docs.length}):`);
        console.log('─'.repeat(50));
        docs.forEach(d => console.log(`  @${d.githubUsername}  —  added ${new Date(d.addedAt).toLocaleDateString()}`));
        console.log('─'.repeat(50));
      }
      break;
    }
    default:
      console.log(`
Usage:
  node scripts/approve-user.mjs add <github-username>    — approve a user
  node scripts/approve-user.mjs remove <github-username> — revoke approval
  node scripts/approve-user.mjs list                     — list all approved users
`);
  }
}

main().catch(err => { console.error('❌ Unexpected error:', err); process.exit(1); });
