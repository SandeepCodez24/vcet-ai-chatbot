from collections.abc import Iterator

from groq import Groq

from rag.settings import get_settings


def _make_client(api_key: str | None = None) -> Groq:
    settings = get_settings()
    key = api_key or settings.groq_api_key
    if not key:
        raise ValueError(
            "No Groq API key available. Set GROQ_API_KEY in .env, or pass a per-request key."
        )
    return Groq(api_key=key)


def generate(
    messages: list[dict[str, str]],
    api_key: str | None = None,
    model: str | None = None,
    max_tokens: int | None = None,
) -> str:
    settings = get_settings()
    client = _make_client(api_key)
    response = client.chat.completions.create(
        model=model or settings.llm_model,
        messages=messages,
        temperature=settings.llm_temperature,
        max_tokens=max_tokens,
        # qwen3.6 (and other reasoning-capable Groq models) emit a <think>...</think>
        # block before the answer unless told not to — hide it, we only want the answer.
        reasoning_format="hidden",
    )
    return response.choices[0].message.content or ""


def stream_generate(
    messages: list[dict[str, str]],
    api_key: str | None = None,
    model: str | None = None,
) -> Iterator[str]:
    settings = get_settings()
    client = _make_client(api_key)
    stream = client.chat.completions.create(
        model=model or settings.llm_model,
        messages=messages,
        temperature=settings.llm_temperature,
        reasoning_format="hidden",
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
