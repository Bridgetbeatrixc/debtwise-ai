# Deploy DebtWise Backend to Railway

Follow these steps to deploy the backend to Railway.

## 1. Prerequisites

- [Railway account](https://railway.app) (free tier works)
- GitHub repo with your code pushed
- Supabase (or other) PostgreSQL connection string
- Google AI (Gemini) API key

---

## 2. Deploy via Railway Dashboard

### Step 1: Create a new project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your `debtwise-ai` repository
5. Railway will prompt to add a service — choose **"Add service"** or **"Configure"**

### Step 2: Set the root directory

1. Click on the new service
2. Go to **Settings** → **Source**
3. Set **Root Directory** to: `backend`
4. Set **Watch Paths** to: `backend/**` (optional, for monorepo)

### Step 3: Add environment variables

1. Go to **Variables** tab
2. Add these variables (click **"+ New Variable"** for each):

| Variable       | Description                                           |
|----------------|-------------------------------------------------------|
| `GOOGLE_API_KEY` | Your Gemini API key from [Google AI Studio](https://aistudio.google.com) |
| `DATABASE_URL`   | PostgreSQL connection string (from Supabase: Settings → Database → Connection string) |
| `JWT_SECRET`     | A long random string for signing tokens (e.g. `openssl rand -hex 32`) |

### Step 4: Generate a public URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** or **"Add Public Networking"**
3. Copy the URL (e.g. `https://debtwise-backend-production.up.railway.app`)

### Step 5: Verify deployment

1. Visit `https://your-url.up.railway.app/health` — should return `{"status": "healthy"}`
2. Visit `https://your-url.up.railway.app/` — should return the API info

---

## 3. Connect your Vercel frontend

In your Vercel project:

1. Go to **Settings** → **Environment Variables**
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-railway-url.up.railway.app`
3. Redeploy the frontend

---

## 4. Alternative: Deploy via Railway CLI

If you prefer the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login (opens browser)
railway login

# From project root, link or create project
cd backend
railway init   # Creates new project or links existing

# Add variables (or set in dashboard)
railway variables set GOOGLE_API_KEY=your-key
railway variables set DATABASE_URL=your-connection-string
railway variables set JWT_SECRET=your-secret

# Deploy
railway up
```

---

## 5. Database setup (first-time)

If your Supabase DB is empty, run the schema once locally:

```bash
cd backend
# Set DATABASE_URL in .env, then:
python init_db.py
```

Or use Supabase SQL Editor to run `schema.sql`.
