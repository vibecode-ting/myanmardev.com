# 🔐 GitHub Secrets Setup Guide

This guide walks you through securing sensitive environment variables for your project.

---

## 📋 Why Use Secrets?

Your Firebase API keys, tokens, and other credentials must **never** be committed to the repository. Even if `.env` is in `.gitignore`, the values still need to be available during the GitHub Actions build. **GitHub Secrets** solve this by encrypting your values and injecting them securely at build time.

---

## 🗂️ File Structure (What Goes Where)

```
personal_project_for_ch-3/
├── .env                    ← ❌ NEVER commit (in .gitignore)
├── .env.example            ← ✅ SAFE to commit (template only, no real keys)
├── .github/workflows/deploy.yml  ← reads secrets at build time
└── src/lib/firebase.ts     ← reads from import.meta.env.PUBLIC_*
```

| File | Purpose | Committed? |
|------|---------|------------|
| `.env` | Real keys for local development | ❌ No |
| `.env.example` | Template showing required vars | ✅ Yes |
| `.github/workflows/deploy.yml` | CI/CD that reads secrets | ✅ Yes |

---

## 🔧 Step-by-Step: Add Secrets to GitHub

### Step 1: Go to Repository Settings

1. Open your repo on GitHub: `https://github.com/vibecode-ting/personal_project_for_ch-3`
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Each Secret

Click **New repository secret** and add each variable **one at a time**:

| Secret Name | Value (from your `.env`) |
|-------------|--------------------------|
| `PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | `ting-51902.firebaseapp.com` |
| `PUBLIC_FIREBASE_PROJECT_ID` | `ting-51902` |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | `ting-51902.firebasestorage.app` |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1029883464067` |
| `PUBLIC_FIREBASE_APP_ID` | `1:1029883464067:web:...` |
| `PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-ZTVB76MM6W` |

> 💡 **Tip:** Copy each value exactly from your Firebase Console → Project Settings → General → Your apps → Web app.

### Step 3: Verify the Workflow

Your `.github/workflows/deploy.yml` already references these secrets:

```yaml
- name: Build
  env:
    PUBLIC_FIREBASE_API_KEY: ${{ secrets.PUBLIC_FIREBASE_API_KEY }}
    PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.PUBLIC_FIREBASE_AUTH_DOMAIN }}
    # ... etc
  run: pnpm build
```

### Step 4: Test

Push a commit to `main` and check the Actions tab. If the build passes, everything is wired up correctly.

---

## 🛠️ Local Development Setup

### 1. Create your `.env` file

```bash
cp .env.example .env
```

### 2. Fill in your real values

Edit `.env` and replace placeholders with your actual Firebase keys.

### 3. Start the dev server

```bash
pnpm dev
```

The Astro dev server will automatically load `.env` — your `src/lib/firebase.ts` reads from `import.meta.env.PUBLIC_*` and everything works.

---

## 🚨 Security Checklist

- [ ] `.env` is in `.gitignore` ✅ (already done)
- [ ] `.env.example` has NO real keys — only placeholders
- [ ] All 7 Firebase secrets are added to GitHub Actions
- [ ] The deploy workflow passes on `main`
- [ ] `.env` file is NOT staged in git:

```bash
git status   # .env should NOT appear
```

- [ ] If `.env` was ever committed, scrub it:

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 📚 Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_FIREBASE_API_KEY` | ✅ Yes | Firebase API key |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ Yes | Firebase Auth domain |
| `PUBLIC_FIREBASE_PROJECT_ID` | ✅ Yes | Firebase project ID |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ Yes | Firebase storage bucket |
| `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ Yes | Firebase messaging sender ID |
| `PUBLIC_FIREBASE_APP_ID` | ✅ Yes | Firebase app ID |
| `PUBLIC_FIREBASE_MEASUREMENT_ID` | ❌ Optional | Google Analytics measurement ID |

> 🔹 **Astro convention:** `PUBLIC_` prefixed env vars are available client-side.  
> 🔹 **Never** expose server-side secrets by prefixing them with `PUBLIC_` unless they're safe for the browser.

---

## 🔄 Rotating Secrets

If you need to regenerate your Firebase keys:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your project → Project Settings
3. Under "Your apps", copy the new config
4. Update `.env` locally
5. Update all secrets on GitHub (Settings → Secrets → Actions → Update)
6. Test by pushing to `main`

---

Need help? Open an issue or contact the team.
