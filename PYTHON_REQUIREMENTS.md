# Python Requirements

## Important: Multiple Requirements Files

This project has different requirements for different environments:

### `requirements-dev.txt` (Local Development)
**For running the Flask server locally:**
```bash
pip install -r requirements-dev.txt
python server.py
```

Contains heavy ML packages:
- flask, flask-cors
- langchain, langchain-groq
- sentence-transformers
- faiss-cpu
- chromadb
- pypdf, pymupdf
- langgraph
- etc.

### `requirements-netlify.txt` (Netlify Production)
**For Netlify deployment:**
- Empty!
- Netlify doesn't need Python
- Frontend is static HTML/CSS/JS
- Backend is Node.js serverless functions

## Why No `requirements.txt`?

We renamed `requirements.txt` → `requirements-dev.txt` to prevent Netlify from auto-detecting and trying to install Python packages.

**Netlify auto-installs when it finds:**
- ❌ `requirements.txt` → tries `pip install -r requirements.txt`
- ✅ `requirements-dev.txt` → ignored (custom name)

## Local Development Setup

```bash
# 1. Create virtual environment
python -m venv .venv

# 2. Activate
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Mac/Linux

# 3. Install dependencies
pip install -r requirements-dev.txt

# 4. Set up .env
# Copy .env.example to .env and add your GROQ_API_KEY

# 5. Run Flask server
python server.py

# 6. Open browser
# http://localhost:5000
```

## Netlify Deployment

Netlify deployment uses:
- ✅ Node.js 18 (see `.nvmrc`)
- ✅ `npm run build` (see `package.json`)
- ✅ Node.js functions (see `netlify/functions/`)
- ❌ No Python installation

## Troubleshooting

**Q: Why is `langgraph` missing?**
A: You're trying to run `pip install -r requirements.txt` but that file doesn't exist anymore. Use `requirements-dev.txt` instead.

**Q: Netlify build fails with Python errors?**
A: Make sure `requirements.txt` doesn't exist in the repo. Only `requirements-dev.txt` and `requirements-netlify.txt` should be present.

**Q: How do I add a new Python package?**
A: Add it to `requirements-dev.txt` (for local development only).
