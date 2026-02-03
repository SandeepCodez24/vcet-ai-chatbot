# VCET AI Chatbot - Full Stack Deployment Guide

## 🏗️ Architecture

```
┌──────────────────────────────┐
│  Frontend (Netlify CDN)      │
│  - Static HTML/CSS/JS        │  
│  - Fast global delivery      │
└──────────┬───────────────────┘
           │
           ▼ API Calls
┌──────────────────────────────┐
│  Backend (Render/Railway)    │
│  - Flask Server              │
│  - RAG + FAISS               │
│  - ML Models (heavy)         │
└──────────────────────────────┘
```

## 🚀 Step 1: Deploy Flask Backend on Render

### 1.1 Sign Up for Render
- Go to: https://render.com
- Sign up using your GitHub account

### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `SandeepCodez24/vcet-ai-chatbot`
3. Configure:
   ```
   Name: vcet-ai-backend
   Region: Singapore (or closest to you)
   Branch: main
   Root Directory: (leave empty)
   Environment: Python 3
   Build Command: pip install -r requirements-dev.txt
   Start Command: gunicorn server:app --bind 0.0.0.0:$PORT
   Plan: Free
   ```

### 1.3 Add Environment Variables
In Render dashboard → Environment:
```
GROQ_API_KEY = your_groq_api_key_here
PYTHON_VERSION = 3.9
PORT = 10000
```

### 1.4 Deploy
- Click **"Create Web Service"**
- Wait ~5-10 minutes for first deploy (installing ML packages)
- Your backend URL will be: `https://vcet-ai-backend.onrender.com`

## 🌐 Step 2: Connect Frontend to Backend

### 2.1 Update API Base URL
Your frontend on Netlify needs to point to the Render backend:

1. In Netlify dashboard:
   - Go to **Site settings** → **Environment variables**
   - Add:
     ```
     VITE_API_URL = https://vcet-ai-backend.onrender.com
     ```

2. Or update `static/js/services/api.js`:
   ```javascript
   const API_BASE_URL = 'https://vcet-ai-backend.onrender.com';
   ```

### 2.2 Update CORS in Flask
Make sure `server.py` allows requests from your Netlify domain:

```python
CORS(app, origins=[
    'https://vcetai.netlify.app',
    'http://localhost:3000',  # for local dev
])
```

## 📝 Step 3: Test the Full Stack

### 3.1 Test Backend
```bash
curl https://vcet-ai-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "rag_initialized": true,
  "timestamp": "..."
}
```

### 3.2 Test Frontend
1. Visit: https://vcetai.netlify.app/
2. Wait for "Model Loaded" message
3. Ask a question
4. Should get response from backend!

## 🆓 Free Tier Limits

### Render Free Tier
- ✅ 750 hours/month (enough for 24/7)
- ✅ Supports Python + ML packages
- ⚠️ Sleeps after 15 min inactivity (first request takes ~30s to wake)
- ⚠️ Rebuilds every month

### Netlify Free Tier
- ✅ 100GB bandwidth/month
- ✅ Unlimited static sites
- ✅ Always fast (no sleep)

## 🔄 Alternative: Railway Deployment

If Render is slow, try Railway:

### Railway Steps:
1. Go to: https://railway.app
2. Sign in with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Select: `SandeepCodez24/vcet-ai-chatbot`
5. Add Environment Variables:
   ```
   GROQ_API_KEY = your_key
   PORT = 8080
   ```
6. Railway auto-detects Python and runs:
   ```
   pip install -r requirements-dev.txt
   gunicorn server:app
   ```

Your backend will be at: `https://vcet-ai-backend.up.railway.app`

## 🐛 Troubleshooting

### Backend: "Application failed to respond"
- Check Render logs
- Verify FAISS index exists in `faiss_store/`
- Check if all packages installed

### Frontend: Stuck on "Loading model"
- Check browser console for CORS errors
- Verify API_BASE_URL points to your backend
- Check backend /api/health endpoint

### Backend: Out of memory
- Render free tier has 512MB RAM
- Try Railway (4GB RAM on free tier)
- Or reduce vector store size

## 💡 Pro Tips

### 1. Faster Cold Starts
Add to `render.yaml`:
```yaml
healthCheckPath: /api/health
autoDeploy: true
```

### 2. Keep Backend Awake
Use a free service like UptimeRobot to ping your backend every 5 minutes

### 3. Optimize Performance
- Enable response caching
- Reduce FAISS index size
- Use smaller embedding model

## 📊 Cost Comparison

| Platform | Free Tier | ML Support | Sleep? |
|----------|-----------|------------|--------|
| **Render** | 750h/month | ✅ | After 15min |
| **Railway** | $5 credit | ✅ | After 1h |
| **Heroku** | $5/month | ✅ | After 30min |
| **Fly.io** | 3 VMs | ✅ | Never |

## ✅ Final Checklist

Backend (Render/Railway):
- [ ] Deployed successfully
- [ ] Environment variables added
- [ ] /api/health returns 200
- [ ] FAISS index loaded
- [ ] No build errors

Frontend (Netlify):
- [ ] Deployed successfully  
- [ ] API_BASE_URL updated
- [ ] CORS working
- [ ] Chat responds correctly

---

**Your VCET AI Chatbot is now fully deployed!** 🎉
