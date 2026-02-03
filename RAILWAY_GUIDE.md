# 🚂 Switching to Railway (Recommended)

Since Render's free tier (512MB RAM) is too small for our RAG model, we will switch to **Railway**.

## ✅ Why Railway?
- **More RAM:** Variables usage (handles 1GB+ easily)
- **$5 Free Credit:** Monthly (~500 hours of runtime)
- **Faster Build:** detailed logs and faster containerization
- **No "Sleep" Lag:** Keeps running longer than Render

---

## 🚀 Deployment Steps

### 1. Prepare your Repository
Make sure you have pushed the latest changes (including `Procfile`):
```bash
git add Procfile
git commit -m "Add Procfile for Railway"
git push origin main
```

### 2. Set up Railway
1. **Go to**: [railway.app](https://railway.app)
2. **Login** with GitHub.
3. Click **"New Project"** -> **"Deploy from GitHub repo"**.
4. Select `SandeepCodez24/vcet-ai-chatbot`.
5. Click **"Deploy Now"**.

### 3. Configure the Build
Railway usually auto-detects Python, but since we renamed `requirements.txt` to `requirements-dev.txt`, we need to tell it what to install.

1. Go to your project dashboard on Railway.
2. Click on the **Settings** tab.
3. Scroll to **Build** section.
4. Set **Build Command**:
   ```bash
   pip install -r requirements-dev.txt
   ```
   *(If you don't see a "Build Command" field, Railway might try to auto-detect. If the build fails, we will add a `nixpacks.toml` file to force it - see below).*

### 4. Set Environment Variables
Go to the **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | `your_groq_api_key_here` |
| `PORT` | `8080` (Railway default) |
| `PYTHON_VERSION`| `3.9` |

### 5. Generate Public Domain
1. Go to the **Settings** tab.
2. Under **Public Networking**, click **"Generate Domain"**.
3. It will create something like: `vcet-ai-chatbot-production.up.railway.app`

---

## 🔗 Connect Frontend (Netlify)

Once Railway gives you the URL (e.g., `https://web-production-1234.up.railway.app`):

1. **Go to Netlify Dashboard**.
2. Select your site.
3. **Site Settings** -> **Environment Variables**.
4. Add/Update:
   ```
   VITE_API_URL = https://web-production-1234.up.railway.app
   ```
   *(Or update `static/js/services/api.js` manually if you hardcoded it)*

5. **Redeploy Netlify** to apply changes.

---

## 🛠 Troubleshooting

**Issue: "No requirements.txt found"**
If Railway complains, create a file named `nixpacks.toml` in your repo:

```toml
[phases.setup]
nixPkgs = ["python39"]

[phases.install]
cmds = ["python -m venv .venv", ". .venv/bin/activate", "pip install -r requirements-dev.txt"]

[phases.build]
cmds = []

[start]
cmd = ". .venv/bin/activate && gunicorn server:app"
```

**Issue: Out of Credits**
Railway gives $5/month. If you run out:
1. It pauses the service.
2. You can switch to a "Developer" plan ($5/mo) or just spin it down when not demonstrating.

---

## ✅ Final Success Check

1. Open your Netlify URL.
2. Ask "Who is the principal?".
3. If it answers without "Loading model..." hanging forever, **IT WORKS!** 🎉
