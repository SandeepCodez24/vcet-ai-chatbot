import time
from collections.abc import Iterator
from functools import lru_cache
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from rag.embeddings import embed_query
from rag.llm.client import generate, stream_generate
from rag.llm.prompts import build_messages
from rag.memory.store import get_history, log_query
from rag.retrieval.context_builder import build_context
from rag.retrieval.hyde import generate_hypothetical_answer
from rag.retrieval.internal import InternalResult, merge_results, search_internal
from rag.retrieval.rerank import rerank
from rag.retrieval.router import should_search_web
from rag.retrieval.web import WebResult, search_web
from rag.settings import get_settings


class RagState(TypedDict, total=False):
    query: str
    session_id: str
    api_key: str | None
    internal_results: list[InternalResult]
    web_results: list[WebResult]
    use_web: bool
    context: str
    citations: list[dict[str, Any]]


def _retrieve_internal(state: RagState) -> RagState:
    settings = get_settings()
    query = state["query"]
    pool_size = settings.rerank_candidate_pool if settings.rerank_enabled else settings.top_k

    candidates = search_internal(query, top_k=pool_size)

    top_similarity = max((r.similarity for r in candidates), default=0.0)
    if settings.hyde_enabled and top_similarity < settings.hyde_score_threshold:
        hypothetical = generate_hypothetical_answer(query, api_key=state.get("api_key"))
        if hypothetical:
            hyde_embedding = embed_query(hypothetical)
            hyde_candidates = search_internal(query, top_k=pool_size, query_embedding=hyde_embedding)
            candidates = merge_results(candidates, hyde_candidates)

    # should_search_web's threshold is calibrated against raw cosine similarity, so it
    # must see `candidates` (pre-rerank) rather than `results`: the cross-encoder's
    # sigmoid relevance score lives on a differently-shaped scale and isn't comparable
    # to RETRIEVAL_SCORE_THRESHOLD.
    use_web = should_search_web(query, candidates)

    if settings.rerank_enabled and candidates:
        results = rerank(query, candidates, top_k=settings.top_k)
    else:
        results = candidates[: settings.top_k]

    return {**state, "internal_results": results, "use_web": use_web}


def _retrieve_web(state: RagState) -> RagState:
    results = search_web(state["query"]) if state.get("use_web") else []
    return {**state, "web_results": results}


def _skip_web(state: RagState) -> RagState:
    return {**state, "web_results": []}


def _build_context_node(state: RagState) -> RagState:
    built = build_context(state.get("internal_results", []), state.get("web_results", []))
    return {**state, "context": built.prompt_context, "citations": built.citations}


def _route_condition(state: RagState) -> str:
    return "web" if state.get("use_web") else "skip_web"


@lru_cache
def _compiled_graph():
    graph = StateGraph(RagState)
    graph.add_node("retrieve_internal", _retrieve_internal)
    graph.add_node("retrieve_web", _retrieve_web)
    graph.add_node("skip_web", _skip_web)
    graph.add_node("build_context", _build_context_node)

    graph.set_entry_point("retrieve_internal")
    graph.add_conditional_edges(
        "retrieve_internal", _route_condition, {"web": "retrieve_web", "skip_web": "skip_web"}
    )
    graph.add_edge("retrieve_web", "build_context")
    graph.add_edge("skip_web", "build_context")
    graph.add_edge("build_context", END)
    return graph.compile()


class RagPipeline:
    """Retrieval (internal -> conditional web -> context assembly) runs as a LangGraph
    graph; generation is kept separate so the API layer can pick single-shot vs. streamed
    output without duplicating the retrieval logic."""

    def _run_retrieval(self, query: str, api_key: str | None = None) -> RagState:
        return _compiled_graph().invoke({"query": query, "api_key": api_key})

    def answer(self, query: str, session_id: str, api_key: str | None = None) -> dict[str, Any]:
        start = time.perf_counter()
        state = self._run_retrieval(query, api_key=api_key)
        history = get_history(session_id)
        messages = build_messages(query, state["context"], history)
        answer_text = generate(messages, api_key=api_key)
        latency_ms = (time.perf_counter() - start) * 1000

        route = "internal+web" if state.get("use_web") else "internal"
        log_query(
            session_id=session_id,
            query=query,
            route=route,
            latency_ms=latency_ms,
            num_internal_docs=len(state.get("internal_results", [])),
            num_web_docs=len(state.get("web_results", [])),
        )
        return {
            "answer": answer_text,
            "citations": state.get("citations", []),
            "route": route,
            "latency_ms": round(latency_ms, 1),
        }

    def stream_answer(
        self, query: str, session_id: str, api_key: str | None = None
    ) -> Iterator[dict[str, Any]]:
        """Yields {"type": "delta", "text": ...} chunks, then a final
        {"type": "done", "citations": ..., "route": ..., "latency_ms": ...}."""
        start = time.perf_counter()
        state = self._run_retrieval(query, api_key=api_key)
        history = get_history(session_id)
        messages = build_messages(query, state["context"], history)

        for delta in stream_generate(messages, api_key=api_key):
            yield {"type": "delta", "text": delta}

        latency_ms = (time.perf_counter() - start) * 1000
        route = "internal+web" if state.get("use_web") else "internal"
        log_query(
            session_id=session_id,
            query=query,
            route=route,
            latency_ms=latency_ms,
            num_internal_docs=len(state.get("internal_results", [])),
            num_web_docs=len(state.get("web_results", [])),
        )
        yield {
            "type": "done",
            "citations": state.get("citations", []),
            "route": route,
            "latency_ms": round(latency_ms, 1),
        }


_PIPELINE = RagPipeline()


def get_pipeline() -> RagPipeline:
    return _PIPELINE
