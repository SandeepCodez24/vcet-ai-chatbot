import re

from rag.retrieval.internal import InternalResult
from rag.settings import get_settings

_TEMPORAL_TRIGGERS = re.compile(
    r"\b(latest|today|current(ly)?|now|this (week|month|year)|recent(ly)?|upcoming|"
    r"news|deadline|last date|202[6-9]|203\d)\b",
    re.IGNORECASE,
)


def should_search_web(query: str, internal_results: list[InternalResult]) -> bool:
    """Decide whether to also hit the web, per architecture_analysis.md's hybrid design:
    fall back to web retrieval when internal confidence is low, results are empty, or
    the query is plainly about something time-sensitive the static corpus can't cover."""
    settings = get_settings()

    if not internal_results:
        return True

    top_similarity = max(r.similarity for r in internal_results)
    if top_similarity < settings.retrieval_score_threshold:
        return True

    if _TEMPORAL_TRIGGERS.search(query):
        return True

    return False
