#!/usr/bin/env node

/**
 * Create a redeem code for free tokens
 *
 * Usage:
 *   node scripts/create-redeem-code.mjs --code WELCOME2024 --tokens 5 --max-uses 100
 *   node scripts/create-redeem-code.mjs --code LAUNCH --tokens 10 --max-uses 50 --expires 2024-12-31
 *   node scripts/create-redeem-code.mjs --code EARLYBIRD --tokens 3 --description "Early adopter bonus"
 *
 * Requires .env file with Firebase config
 */

import { readFileSync } from 'fs';
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
    if (arg === '--code' && args[i + 1]) {
      result.code = args[++i].toUpperCase();
    } else if (arg === '--tokens' && args[i + 1]) {
      result.tokens = parseInt(args[++i], 10);
    } else if (arg === '--max-uses' && args[i + 1]) {
      result.maxUses = parseInt(args[++i], 10);
    } else if (arg === '--expires' && args[i + 1]) {
      result.expires = args[++i];
    } else if (arg === '--description' && args[i + 1]) {
      result.description = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage:
  node scripts/create-redeem-code.mjs --code WELCOME2024 --tokens 5 --max-uses 100

Options:
  --code        Promo code (required, will be uppercased)
  --tokens      Number of tokens to grant (required)
  --max-uses    Maximum number of times this code can be used (required)
  --expires     Expiration date in YYYY-MM-DD format (optional)
  --description Description of this code (optional)
  --help        Show this help message

Examples:
  node scripts/create-redeem-code.mjs --code WELCOME --tokens 5 --max-uses 100
  node scripts/create-redeem-code.mjs --code LAUNCH --tokens 10 --max-uses 50 --expires 2024-12-31
      `);
      process.exit(0);
    }
  }

  return result;
}

// ─── Firebase REST API ───────────────────────────────────

async function createRedeemCode(code, tokens, maxUses, expiresAt, description, env) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/redeemCodes/${code}?key=${env.PUBLIC_FIREBASE_API_KEY}`;

  const fields = {
    code: { stringValue: code },
    tokenAmount: { integerValue: tokens },
    maxUses: { integerValue: maxUses },
    currentUses: { integerValue: 0 },
    usedBy: { arrayValue: { values: [] } },
    createdAt: { timestampValue: new Date().toISOString() },
    createdBy: { stringValue: 'admin-script' },
  };

  if (expiresAt) {
    fields.expiresAt = { timestampValue: new Date(expiresAt).toISOString() };
  }

  if (description) {
    fields.description = { stringValue: description };
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const env = loadEnv();

  // Validate required arguments
  if (!args.code) {
    console.error('❌ --code is required');
    process.exit(1);
  }

  if (!args.tokens || args.tokens <= 0) {
    console.error('❌ --tokens must be a positive number');
    process.exit(1);
  }

  if (!args.maxUses || args.maxUses <= 0) {
    console.error('❌ --max-uses must be a positive number');
    process.exit(1);
  }

  try {
    console.log(`🎟️  Creating redeem code: ${args.code}`);
    console.log(`   Tokens: ${args.tokens}`);
    console.log(`   Max Uses: ${args.maxUses}`);
    if (args.expires) console.log(`   Expires: ${args.expires}`);
    if (args.description) console.log(`   Description: ${args.description}`);

    await createRedeemCode(
      args.code,
      args.tokens,
      args.maxUses,
      args.expires,
      args.description,
      env
    );

    console.log(`\n✅ Redeem code created successfully!`);
    console.log(`\nShare this code with users:`);
    console.log(`   Code: ${args.code}`);
    console.log(`   Reward: ${args.tokens} tokens`);
    console.log(`   Uses: ${args.maxUses}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
