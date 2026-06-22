# GitHub OAuth App Setup Guide for myanmardev.com

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:

| Field | Value |
|-------|-------|
| **Application name** | `myanmardev.com` |
| **Homepage URL** | `https://app.myanmardev.com` |
| **Application description** | `Automated web services for Myanmar developers` |
| **Authorization callback URL** | `https://myanmardev-com.firebaseapp.com/__/auth/handler` |

4. Click **"Register application"**
5. Copy the **Client ID** (you'll need this for Firebase)
6. Click **"Generate a new client secret"** and copy it

## Step 2: Add GitHub Provider to Firebase

1. Go to [Firebase Console → Authentication → Sign-in method](https://console.firebase.google.com/project/_/authentication/providers)
2. Click **"GitHub"** provider
3. Enable it
4. Paste:
   - **Client ID** → from Step 1
   - **Client Secret** → from Step 1
5. Copy the **callback URL** shown in Firebase (should be `https://your-project.firebaseapp.com/__/auth/handler`)
6. Click **Save**

## Step 3: Enable Google Provider (if not already)

1. In Firebase Console → Authentication → Sign-in method
2. Click **"Google"** provider
3. Enable it
4. Set **Project support email** to your email
5. Click **Save**

## Step 4: Add Authorized Domains

1. In Firebase Console → Authentication → Settings → Authorized domains
2. Add these domains:
   - `app.myanmardev.com`
   - `myanmardev.com`
   - `localhost` (for local development)

## Step 5: Create `.env` File

Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

Then edit `.env` with your values from **Firebase Console → Project Settings → General → Your apps → Web app**:

```
PUBLIC_FIREBASE_API_KEY=AIzaSy...
PUBLIC_FIREBASE_AUTH_DOMAIN=myanmardev-com.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=myanmardev-com
PUBLIC_FIREBASE_STORAGE_BUCKET=myanmardev-com.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123
PUBLIC_WORKER_API_URL=https://subdomain-api.myanmardev.com
```

## Step 6: Test Locally

```bash
pnpm dev
# Open http://localhost:4321/auth/signin
# Try Google and GitHub sign-in
```

## Step 7: Set GitHub Actions Variables

For production builds, add these as **GitHub Actions Variables** (NOT Secrets — they're public client config):

1. Go to [GitHub repo → Settings → Secrets and variables → Actions](https://github.com/vibecode-ting/myanmardev.com/settings/variables/actions)
2. Click **"New repository variable"**
3. Add each `PUBLIC_FIREBASE_*` variable with its value

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `auth/popup-blocked` | Allow popups in browser |
| `auth/popup-closed-by-user` | User closed popup — normal |
| `auth/network-request-failed` | Check internet connection |
| `auth/invalid-api-key` | Check `PUBLIC_FIREBASE_API_KEY` in `.env` |
| GitHub callback mismatch | Ensure callback URL matches exactly in both GitHub OAuth App and Firebase |
| CORS errors | Add your domain to Firebase Authorized Domains |

## Security Notes

- `PUBLIC_FIREBASE_*` vars are **NOT secrets** — they're safe to expose in client code
- GitHub Client Secret is stored in Firebase only — never in code
- Never commit `.env` file — it's in `.gitignore`
