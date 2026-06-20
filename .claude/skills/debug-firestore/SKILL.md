# Skill: Debug Firestore

## What it does
Debug Firestore-related issues by reading client code, security rules, and suggesting fixes.

## When to use
- When a Firestore operation fails or returns unexpected results
- When debugging token balance discrepancies
- When testing security rule changes

## Instructions
1. Read the relevant source file (e.g., `redeem.ts`, `orders.ts`, `auth.ts`)
2. Read `firestore.rules`
3. Trace the data flow from component through lib to Firestore
4. Identify rule/code mismatches
5. Suggest either rule changes or code fixes
