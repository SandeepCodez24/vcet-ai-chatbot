from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed application configuration, loaded from environment / .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- LLM (Groq) ---
    groq_api_key: str = ""
    llm_model: str = "qwen/qwen3.6-27b"
    llm_temperature: float = 0.2

    # --- Embeddings ---
    embedding_model: str = "BAAI/bge-base-en-v1.5"

    # --- Ingestion / chunking ---
    data_dir: str = "data"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    # Some third-party loaders (unstructured/pypdf) can hang indefinitely on a malformed
    # file or a blocked network call (e.g. NLTK data fetch); never let one file stall
    # the whole ingestion run.
    ingestion_file_timeout_seconds: int = 30

    # --- Vector store (Chroma) ---
    chroma_dir: str = "chroma_store"
    chroma_collection: str = "vcet_docs"
    top_k: int = 5

    # --- Re-ranking ---
    # Cross-encoder re-ranking: fetch a wider candidate pool from the vector store
    # (cheap, embedding-similarity search) then re-score each candidate against the
    # raw query with a cross-encoder, which reads query+doc together instead of
    # comparing two independently-embedded vectors. This consistently reorders the
    # candidate pool more accurately than cosine similarity alone.
    rerank_enabled: bool = True
    reranker_model: str = "BAAI/bge-reranker-base"
    rerank_candidate_pool: int = 20

    # --- HyDE (Hypothetical Document Embeddings) ---
    # When the raw query's best cosine similarity is below this, generate a short
    # hypothetical answer with the LLM and also search using *that* embedding —
    # a fabricated answer often sits closer in embedding space to the real answer
    # chunk than a short/vague student question does. Skipped when the raw query
    # already retrieves confidently, to avoid paying for an extra LLM call.
    hyde_enabled: bool = True
    hyde_score_threshold: float = 0.45

    # --- Retrieval routing ---
    retrieval_score_threshold: float = 0.35
    web_search_provider: str = "duckduckgo"
    web_search_max_results: int = 4

    # --- Conversation memory ---
    sqlite_path: str = "rag_memory.db"
    history_token_budget: int = 1500
    max_history_messages: int = 20

    # --- API ---
    admin_token: str = "changeme-admin-token"
    cors_origins: str = "*"
    rate_limit_enabled: bool = True
    max_requests_per_minute: int = 30

    # --- Logging ---
    log_level: str = "INFO"
    log_file: str = "vcet_chatbot.log"


@lru_cache
def get_settings() -> Settings:
    return Settings()
