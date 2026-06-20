#!/usr/bin/env node

/**
 * Add tokens to a user's balance
 *
 * Usage:
 *   node scripts/add-tokens.mjs --email user@example.com --tokens 10
 *   node scripts/add-tokens.mjs --uid abc123 --tokens 10
 *   node scripts/add-tokens.mjs --order-id abc123 --approve
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
    if (arg === '--email' && args[i + 1]) {
      result.email = args[++i];
    } else if (arg === '--uid' && args[i + 1]) {
      result.uid = args[++i];
    } else if (arg === '--tokens' && args[i + 1]) {
      result.tokens = parseInt(args[++i], 10);
    } else if (arg === '--order-id' && args[i + 1]) {
      result.orderId = args[++i];
    } else if (arg === '--approve') {
      result.approve = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage:
  node scripts/add-tokens.mjs --email user@example.com --tokens 10
  node scripts/add-tokens.mjs --uid abc123 --tokens 10
  node scripts/add-tokens.mjs --order-id abc123 --approve

Options:
  --email     User email to look up
  --uid       User ID to update directly
  --tokens    Number of tokens to add
  --order-id  Order ID to approve
  --approve   Approve the order (used with --order-id)
  --help      Show this help message
      `);
      process.exit(0);
    }
  }

  return result;
}

// ─── Firebase REST API ───────────────────────────────────

async function findUserByEmail(email, env) {
  // Use Firebase Auth REST API to find user by email
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.PUBLIC_FIREBASE_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: [email] }),
  });

  const data = await response.json();

  if (data.users && data.users.length > 0) {
    return data.users[0];
  }
  return null;
}

async function getUserProfile(uid, env) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}?key=${env.PUBLIC_FIREBASE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    return null;
  }

  return data;
}

async function addTokensToUser(uid, tokens, env) {
  // First get current balance
  const profile = await getUserProfile(uid, env);
  if (!profile) {
    throw new Error('User profile not found');
  }

  const currentBalance = profile.fields?.tokenBalance?.integerValue || 0;
  const newBalance = currentBalance + tokens;

  // Update the document
  const url = `https://firestore.googleapis.com/v1/projects/${env.PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}?key=${env.PUBLIC_FIREBASE_API_KEY}&updateMask.fieldPaths=tokenBalance`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        tokenBalance: { integerValue: newBalance },
      },
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return { currentBalance, newBalance };
}

async function approveOrder(orderId, env) {
  // Get the order
  const orderUrl = `https://firestore.googleapis.com/v1/projects/${env.PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${orderId}?key=${env.PUBLIC_FIREBASE_API_KEY}`;

  const orderResponse = await fetch(orderUrl);
  const orderData = await orderResponse.json();

  if (orderData.error) {
    throw new Error('Order not found');
  }

  const order = orderData.fields;
  const status = order.status?.stringValue;
  const userId = order.userId?.stringValue;
  const tokenAmount = order.tokenAmount?.integerValue;

  if (status !== 'pending') {
    throw new Error(`Order is already ${status}`);
  }

  if (!userId || !tokenAmount) {
    throw new Error('Invalid order data');
  }

  // 1. Add tokens to user
  await addTokensToUser(userId, tokenAmount, env);

  // 2. Update order status
  const updateUrl = `https://firestore.googleapis.com/v1/projects/${env.PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${orderId}?key=${env.PUBLIC_FIREBASE_API_KEY}&updateMask.fieldPaths=status&updateMask.fieldPaths=processedAt`;

  await fetch(updateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        status: { stringValue: 'approved' },
        processedAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  return { userId, tokenAmount };
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const env = loadEnv();

  try {
    if (args.orderId && args.approve) {
      // Approve order
      console.log(`📦 Approving order ${args.orderId}...`);
      const result = await approveOrder(args.orderId, env);
      console.log(`✅ Order approved! Added ${result.tokenAmount} tokens to user ${result.userId}`);
    } else if (args.email && args.tokens) {
      // Find user by email and add tokens
      console.log(`🔍 Looking up user by email: ${args.email}`);
      const user = await findUserByEmail(args.email, env);

      if (!user) {
        console.error('❌ User not found with that email');
        process.exit(1);
      }

      console.log(`✅ Found user: ${user.localId}`);
      const result = await addTokensToUser(user.localId, args.tokens, env);
      console.log(`✅ Added ${args.tokens} tokens. Balance: ${result.currentBalance} → ${result.newBalance}`);
    } else if (args.uid && args.tokens) {
      // Add tokens by UID
      console.log(`💰 Adding ${args.tokens} tokens to user ${args.uid}...`);
      const result = await addTokensToUser(args.uid, args.tokens, env);
      console.log✅ Added ${args.tokens} tokens. Balance: ${result.currentBalance} → ${result.newBalance}`);
    } else {
      console.error('❌ Invalid arguments. Use --help for usage information.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
