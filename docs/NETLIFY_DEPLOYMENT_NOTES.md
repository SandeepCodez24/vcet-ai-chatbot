# VCET AI Chatbot - Netlify Deployment Notes

## Important: Python Dependencies

This project has TWO different runtime environments:

### 1. Local Development (Flask Server)
- Uses `requirements.txt` with ML packages
- Runs Python Flask server on port 5000
- Needs PyTorch, FAISS, LangChain, etc.

### 2. Netlify Production (Static + Serverless)
- **Frontend**: Static HTML/CSS/JS (no Python needed)
- **Backend**: Node.js serverless functions in `netlify/functions/`
- **Does NOT use Python** at all

## Why This Matters

Netlify was failing with "No space left on device" because it was trying to install heavy ML Python packages that aren't needed for production deployment.

## Solution Applied

1. Created `requirements-netlify.txt` (empty - no Python packages needed)
2. Updated `netlify.toml` with `PIP_NO_CACHE_DIR=1`
3. Netlify Functions are pure Node.js (see `netlify/functions/*.js`)

## Build Process

```bash
npm run build
```

This only:
- Converts templates to static HTML
- Copies CSS/JS/images to `public/`
- No Python installation required!

## Architecture

```
┌─────────────────────────────────────┐
│  Netlify CDN (Static Files)         │
│  - HTML, CSS, JS from public/       │
└─────────────────────────────────────┘
              │
              ├─► User Browser
              │
┌─────────────────────────────────────┐
│  Netlify Functions (Node.js)        │
│  - query.js (Groq API)              │
│  - health.js                         │
│  - stats.js                          │
│  - suggestions.js                    │
└─────────────────────────────────────┘
```

No Python server needed in production!
