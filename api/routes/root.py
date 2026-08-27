from fastapi import APIRouter
from fastapi.responses import HTMLResponse, Response

from rag.settings import get_settings
from rag.vectorstore import get_collection

router = APIRouter()

# Same asterism mark as Frontend/src/components/ui/LogoMark.jsx, so the backend's
# "is this thing on" page and the React app read as the same product.
_LOGO_SVG = """
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>
"""

_FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect width="24" height="24" rx="5" fill="#131313"/>
  <g stroke="#ffb59e" stroke-width="1.8" stroke-linecap="round">
    <line x1="12" y1="3" x2="12" y2="21"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/>
    <line x1="18.5" y1="5.5" x2="5.5" y2="18.5"/>
  </g>
</svg>"""


@router.get("/favicon.svg", include_in_schema=False)
def favicon() -> Response:
    return Response(content=_FAVICON_SVG, media_type="image/svg+xml")


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
def root() -> str:
    settings = get_settings()
    try:
        chunk_count = get_collection().count()
        store_ok = True
    except Exception:
        chunk_count = 0
        store_ok = False
    groq_ok = bool(settings.groq_api_key)
    all_ok = store_ok and groq_ok

    dot_color = "#7ee787" if all_ok else "#ffb59e" if store_ok or groq_ok else "#ff6b6b"
    status_text = "All systems go" if all_ok else "Running, but check config below"

    def row(label: str, ok: bool, detail: str) -> str:
        icon = "✓" if ok else "✗"
        color = "#7ee787" if ok else "#ff6b6b"
        return (
            f'<div class="row"><span class="row-icon" style="color:{color}">{icon}</span>'
            f'<span class="row-label">{label}</span><span class="row-detail">{detail}</span></div>'
        )

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VCET RAG API</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
  :root {{
    --surface: #131313;
    --surface-container: #1c1b1b;
    --on-surface: #e5e2e1;
    --primary: #ffb59e;
    --outline-variant: #3a3a3a;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--surface); color: var(--on-surface);
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
  }}
  .card {{
    width: min(480px, 92vw); background: var(--surface-container); border: 1px solid var(--outline-variant);
    border-radius: 20px; padding: 2.25rem; text-align: center;
  }}
  .logo {{ width: 40px; height: 40px; color: var(--primary); margin: 0 auto 0.75rem; }}
  h1 {{ font-size: 1.35rem; margin: 0 0 0.25rem; letter-spacing: 0.02em; }}
  .status {{ display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem; color: #a3a3a3; font-size: 0.9rem; }}
  .dot {{ width: 9px; height: 9px; border-radius: 50%; background: {dot_color}; box-shadow: 0 0 8px {dot_color}; }}
  .rows {{ text-align: left; border-top: 1px solid var(--outline-variant); padding-top: 1rem; margin-bottom: 1.5rem; }}
  .row {{ display: flex; align-items: center; gap: 0.6rem; padding: 0.35rem 0; font-size: 0.88rem; }}
  .row-icon {{ font-weight: 700; width: 1rem; }}
  .row-label {{ flex: 1; color: var(--on-surface); }}
  .row-detail {{ color: #8a8a8a; }}
  .links {{ display: flex; gap: 0.75rem; justify-content: center; }}
  .links a {{
    color: var(--surface); background: var(--primary); text-decoration: none; font-weight: 600;
    padding: 0.55rem 1.1rem; border-radius: 999px; font-size: 0.85rem;
  }}
  .links a.secondary {{ background: transparent; color: var(--primary); border: 1px solid var(--primary); }}
</style>
</head>
<body>
  <div class="card">
    <div class="logo">{_LOGO_SVG}</div>
    <h1>VCET RAG API</h1>
    <div class="status"><span class="dot"></span>{status_text}</div>
    <div class="rows">
      {row("Vector store (Chroma)", store_ok, f"{chunk_count} chunks indexed")}
      {row("Groq LLM key", groq_ok, settings.llm_model if groq_ok else "not set in .env")}
    </div>
    <div class="links">
      <a href="/docs">API Docs</a>
      <a class="secondary" href="/api/health">Health JSON</a>
    </div>
  </div>
</body>
</html>"""
