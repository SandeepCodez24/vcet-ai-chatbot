from dataclasses import dataclass, field
from typing import Any

from rag.retrieval.internal import InternalResult
from rag.retrieval.web import WebResult

DEFAULT_CONTEXT_TOKEN_BUDGET = 6000


def _estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)


@dataclass
class BuiltContext:
    prompt_context: str
    citations: list[dict[str, Any]] = field(default_factory=list)


def build_context(
    internal_results: list[InternalResult],
    web_results: list[WebResult],
    token_budget: int = DEFAULT_CONTEXT_TOKEN_BUDGET,
) -> BuiltContext:
    """Dedupe, rank (results already arrive ranked by their retriever), truncate to a
    token budget, and format into labeled sections per Appendix A of the architecture doc
    so the LLM (and later the UI) can distinguish official vs. web-sourced claims."""
    citations: list[dict[str, Any]] = []
    sections: list[str] = []

    if internal_results:
        seen: set[tuple] = set()
        lines: list[str] = []
        budget_used = 0
        for r in internal_results:
            key = (r.metadata.get("source"), r.metadata.get("chunk_index"))
            if key in seen:
                continue
            seen.add(key)
            tokens = _estimate_tokens(r.text)
            if budget_used + tokens > token_budget:
                break
            budget_used += tokens

            source = r.metadata.get("source", "unknown")
            department = r.metadata.get("department") or r.metadata.get("category", "")
            lines.append(f"[Doc: {source}]\n{r.text}")
            citations.append(
                {
                    "type": "internal",
                    "source": source,
                    "department": department,
                    "similarity": round(r.similarity, 3),
                }
            )
        if lines:
            sections.append("### Official College Documents\n\n" + "\n\n".join(lines))

    if web_results:
        lines = []
        budget_used = 0
        for r in web_results:
            tokens = _estimate_tokens(r.snippet)
            if budget_used + tokens > token_budget:
                break
            budget_used += tokens

            lines.append(f"[{r.title}]({r.url})\n{r.snippet}")
            citations.append({"type": "web", "title": r.title, "url": r.url})
        if lines:
            sections.append("### Web Sources\n\n" + "\n\n".join(lines))

    prompt_context = "\n\n".join(sections) if sections else "No relevant information found."
    return BuiltContext(prompt_context=prompt_context, citations=citations)
