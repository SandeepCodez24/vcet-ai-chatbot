import logging

from rag.llm.client import generate

logger = logging.getLogger(__name__)

_HYDE_SYSTEM_PROMPT = (
    "You write short, plausible-sounding answers to questions about Velammal College "
    "of Engineering and Technology (VCET) for the sole purpose of improving document "
    "search. Write 2-4 sentences that read like an excerpt from an official college "
    "document answering the question directly. Do not hedge, ask for clarification, "
    "or say you don't know — invent concrete-sounding but plausible details if needed. "
    "This text is never shown to the user."
)


def generate_hypothetical_answer(query: str, api_key: str | None = None) -> str | None:
    """HyDE: ask the LLM to write a fake-but-plausible answer, then embed *that* instead
    of the raw query. A short student question ("hostel fees?") often sits far from the
    real answer chunk in embedding space; a fabricated answer in the same register as the
    source documents tends to land much closer to it.

    Returns None on any failure (missing/invalid API key, rate limit, network) so a HyDE
    hiccup degrades to plain retrieval instead of failing the whole request — mirrors how
    rag/retrieval/web.py never lets a provider error crash the chat flow."""
    messages = [
        {"role": "system", "content": _HYDE_SYSTEM_PROMPT},
        {"role": "user", "content": query},
    ]
    try:
        return generate(messages, api_key=api_key, max_tokens=150)
    except Exception as exc:  # noqa: BLE001 - HyDE must never crash the request
        logger.warning("HyDE generation failed for %r: %s", query, exc)
        return None
