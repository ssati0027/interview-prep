git remote add origin https://github.com/YOUR_USERNAME/roadmap-app.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up / Sign in with GitHub
2. Click **Add New → Project**
3. Find `roadmap-app` and click **Import**
4. Under **Environment Variables**, add all of these:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Supabase pooled URL (port 6543) |
| `DIRECT_URL` | Your Supabase direct URL (port 5432) |
| `NEXTAUTH_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | `https://YOUR-APP.vercel.app` ← fill after deploy |
| `GOOGLE_CLIENT_ID` | From Google Console |
| `GOOGLE_CLIENT_SECRET` | From Google Console |
| `GROQ_API_KEY` | From console.groq.com |

5. Click **Deploy** — wait ~2 minutes

---

## Step 3 — After deploy

**Get your Vercel URL** (looks like `roadmap-app-abc123.vercel.app`)

**Update `NEXTAUTH_URL`:**
Vercel dashboard → Your project → Settings → Environment Variables → edit `NEXTAUTH_URL` → set it to `https://your-actual-url.vercel.app` → **Redeploy** (Deployments tab → 3 dots → Redeploy)

**Add Google OAuth redirect URI:**
Google Console → APIs & Services → Credentials → your OAuth client → add to Authorized redirect URIs:
```
https://your-actual-url.vercel.app/api/auth/callback/google