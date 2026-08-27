import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass

from rag.settings import get_settings

logger = logging.getLogger(__name__)


@dataclass
class WebResult:
    title: str
    url: str
    snippet: str


class WebSearchProvider(ABC):
    @abstractmethod
    def search(self, query: str, max_results: int) -> list[WebResult]:
        raise NotImplementedError


class DuckDuckGoProvider(WebSearchProvider):
    """Free, no-API-key web search. Swap for TavilyProvider/SerperProvider later by
    changing WEB_SEARCH_PROVIDER — both would implement the same WebSearchProvider interface."""

    def search(self, query: str, max_results: int) -> list[WebResult]:
        try:
            from ddgs import DDGS

            raw = DDGS().text(query, max_results=max_results)
        except Exception as exc:  # noqa: BLE001 - web search must never crash the request
            logger.warning("DuckDuckGo search failed for %r: %s", query, exc)
            return []

        return [
            WebResult(title=r.get("title", ""), url=r.get("href", ""), snippet=r.get("body", ""))
            for r in raw
        ]


_PROVIDERS: dict[str, type[WebSearchProvider]] = {
    "duckduckgo": DuckDuckGoProvider,
}


def get_web_provider() -> WebSearchProvider:
    settings = get_settings()
    provider_cls = _PROVIDERS.get(settings.web_search_provider.lower())
    if provider_cls is None:
        logger.warning(
            "Unknown WEB_SEARCH_PROVIDER=%r, falling back to duckduckgo", settings.web_search_provider
        )
        provider_cls = DuckDuckGoProvider
    return provider_cls()


def search_web(query: str, max_results: int | None = None) -> list[WebResult]:
    settings = get_settings()
    provider = get_web_provider()
    return provider.search(query, max_results or settings.web_search_max_results)
