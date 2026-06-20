#!/usr/bin/env node

/**
 * List all users with their token balances
 *
 * Usage:
 *   node scripts/list-users.mjs
 *   node scripts/list-users.mjs --export users.csv
 *
 * Requires .env file with Firebase config
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Parse .env ──────────────────────────────────────────

function loadEnv() {
  try {
    const envPath = resolve(ROOT, '.env');
    const content = readFileSync(envPath, 'utf-8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
    return env;
  } catch (err) {
    console.error('❌ Failed to load .env file:', err.message);
    process.exit(1);
  }
}

// ─── Parse Arguments ─────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--export' && args[i + 1]) {
      result.export = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage:
  node scripts/list-users.mjs
  node scripts/list-users.mjs --export users.csv

Options:
  --export    Export to CSV file
  --help      Show this help message
      `);
      process.exit(0);
    }
  }

  return result;
}

// ─── Firebase REST API ───────────────────────────────────

async function listUsers(env) {
  // Use Firestore REST API to list all users
  const url = `https://firestore.googleapis.com/v1/projects/${env.PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/users?key=${env.PUBLIC_FIREBASE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.documents) {
    return [];
  }

  return data.documents.map(doc => {
    const fields = doc.fields;
    return {
      uid: fields.uid?.stringValue || '',
      email: fields.email?.stringValue || '',
      displayName: fields.displayName?.stringValue || '',
      provider: fields.provider?.stringValue || '',
      githubUsername: fields.githubUsername?.stringValue || '',
      tokenBalance: fields.tokenBalance?.integerValue || 0,
      createdAt: fields.createdAt?.timestampValue || '',
      lastLoginAt: fields.lastLoginAt?.timestampValue || '',
    };
  });
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const env = loadEnv();

  try {
    console.log('📋 Fetching users...\n');
    const users = await listUsers(env);

    if (users.length === 0) {
      console.log('No users found.');
      return;
    }

    // Sort by token balance (descending)
    users.sort((a, b) => b.tokenBalance - a.tokenBalance);

    // Display as table
    console.log('UID'.padEnd(28) + 'Email'.padEnd(32) + 'Provider'.padEnd(10) + 'Tokens'.padStart(8) + '  GitHub Username');
    console.log('─'.repeat(100));

    for (const user of users) {
      const uid = user.uid.substring(0, 26).padEnd(28);
      const email = (user.email || 'N/A').substring(0, 30).padEnd(32);
      const provider = user.provider.padEnd(10);
      const tokens = String(user.tokenBalance).padStart(8);
      const github = user.githubUsername ? `@${user.githubUsername}` : '';

      console.log(`${uid}${email}${provider}${tokens}  ${github}`);
    }

    console.log('─'.repeat(100));
    console.log(`\nTotal: ${users.length} users`);
    console.log(`Total tokens: ${users.reduce((sum, u) => sum + u.tokenBalance, 0)}`);

    // Export to CSV if requested
    if (args.export) {
      const csvHeader = 'uid,email,display_name,provider,github_username,token_balance,created_at,last_login_at';
      const csvRows = users.map(u =>
        `"${u.uid}","${u.email}","${u.displayName}","${u.provider}","${u.githubUsername}",${u.tokenBalance},"${u.createdAt}","${u.lastLoginAt}"`
      );
      const csvContent = [csvHeader, ...csvRows].join('\n');

      writeFileSync(args.export, csvContent, 'utf-8');
      console.log(`\n✅ Exported to ${args.export}`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
