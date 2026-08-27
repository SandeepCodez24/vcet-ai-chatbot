# Legacy code (archived, not deleted)

Everything under `legacy/` is superseded by the production rebuild in `rag/` + `api/` (backend)
and `Frontend/` (React UI). Kept for reference / rollback only — nothing here is imported by
the current system.

- **`flask_app/`** — the original beginner-level Flask backend (`app.py`, `server.py`,
  `server-optimized.py`, `config.py`), its `templates/` and `utils/` (rate limiter, cache,
  logger), and the hand-rolled FAISS RAG implementation (`src/`, `faiss_store/`). Replaced by
  `api/main.py` (FastAPI) and `rag/` (Chroma + LangGraph dual-retrieval pipeline).
- **`netlify_static_site/`** — the old vanilla-JS/static frontend's build tooling and Netlify
  serverless function proxies (`netlify/functions/*.js` call the old Flask API and will not
  work against the new FastAPI backend), plus its root `package.json`, ESLint/Prettier config,
  and `.nvmrc`. Replaced by the `Frontend/` Vite + React app.
- **`data_extraction_scripts/`** — one-off, single-use scripts written to pull and triage
  source documents (EEE/IT/MBA/SNH departments) while building `data/custom_dataset_build/`.
  Not part of any repeatable pipeline; safe to ignore.

If nothing here has been needed after the new system is verified in production, this whole
directory can be deleted.
