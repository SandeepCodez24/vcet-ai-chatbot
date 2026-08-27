# Full Production Architecture Document  
**College Student Assistant Chatbot**  
*(Hybrid RAG + Behavior-Tuned LLM + Web Grounding)*  

**Version 1.0 | August 2026**

---

## 1. Executive Summary

This system is a production-grade AI assistant for college students. It combines:

- **Behavior fine-tuning** → consistent “college assistant” personality, tone, and response style
- **Internal RAG** → accurate answers from official college documents (.txt corpus)
- **Web RAG** → current information and external knowledge when needed
- **Strong grounding & citation** → reduces hallucination and builds trust

The architecture prioritizes **accuracy, maintainability, cost control, privacy, and scalability**.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  Web App / Mobile / College Portal / WhatsApp / Telegram    │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────┐
│                     API Gateway / Backend                   │
│  FastAPI (or NestJS) + Auth + Rate Limiting + Logging       │
└──────┬──────────────┬──────────────────┬────────────────────┘
       │              │                  │
       ▼              ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐
│ Query        │ │ Dual         │ │ LLM Orchestration        │
│ Understanding│ │ Retrieval    │ │ (Prompt + Generation)    │
│ & Routing    │ │ Service      │ │                          │
└──────────────┘ └──────┬───────┘ └────────────┬─────────────┘
                        │                      │
          ┌─────────────┴──────────┐           │
          ▼                        ▼           ▼
┌──────────────────┐    ┌──────────────────┐  ┌─────────────────┐
│ Internal Vector  │    │ Web Search       │  │ LLM Serving     │
│ Database         │    │ Service          │  │ (Fine-tuned or  │
│ (College Docs)   │    │ (Tavily / etc.)  │  │  strong base)   │
└──────────────────┘    └──────────────────┘  └─────────────────┘
```

---

## 3. Core Components

### 3.1 Data Ingestion & Knowledge Base

| Component              | Responsibility                                      | Technology Recommendation          |
|------------------------|-----------------------------------------------------|------------------------------------|
| Document Store         | Raw college .txt / PDF / DOCX files                 | S3 / MinIO / local + Git LFS       |
| Ingestion Pipeline     | Clean → Chunk → Embed → Index                       | LlamaIndex or custom Python        |
| Chunking Strategy      | Semantic + metadata-aware (400–800 tokens)          | LlamaIndex SentenceSplitter + metadata |
| Embedding Model        | High-quality dense embeddings                       | `BAAI/bge-large-en-v1.5` or Nomic  |
| Vector Database        | Store + similarity search                           | Qdrant (recommended) / Chroma / LanceDB / Pinecone |
| Metadata               | Department, year, document type, last_updated, source | Stored with every chunk            |
| Update Pipeline        | Incremental re-indexing when documents change       | Scheduled job + webhook            |

**Best practices:**
- Keep original documents versioned
- Store `last_updated` and `source_file` with every chunk
- Support hybrid search (vector + keyword/BM25) if needed

### 3.2 Dual Retrieval Service

**Internal Retrieval**
- Top-k (usually 5–8) chunks from vector DB
- Optional re-ranking with a cross-encoder
- Metadata filtering (e.g., only “Fees” or “Academic Year 2026”)

**Web Retrieval**
- Triggered when:
  - Internal retrieval confidence is low, **or**
  - Query is about current events / external resources, **or**
  - User explicitly asks for latest information
- Providers: Tavily (preferred), Serper, Brave, Bing
- Return clean snippets + URLs + titles

**Context Assembly**
- Deduplicate
- Rank by relevance + recency
- Truncate to fit model context window
- Clearly label sources in the prompt:
  - `### Official College Documents`
  - `### Web Sources`

### 3.3 LLM Layer

**Two recommended paths:**

**Path A – Behavior Fine-Tuned Model (Recommended long-term)**
- Base model: Llama-3.1-8B-Instruct / Qwen2.5-7B/14B / Mistral / Gemma-2
- Fine-tuning method: LoRA / QLoRA (Unsloth or LLaMA-Factory)
- Training focus: personality, tone, structure, refusal behavior, source prioritization
- Serving: Hugging Face Inference Endpoints **or** vLLM / TGI on GPU

**Path B – Strong Base Model + Excellent Prompting (Faster start)**
- Use Groq, Together AI, Fireworks, or Hugging Face Inference Providers
- Heavy system prompt + few-shot examples
- Move to fine-tuning only if persona consistency is insufficient

**LLM Responsibilities**
- Generate the final answer
- Follow source priority rules
- Cite sources when useful
- Admit uncertainty cleanly
- Maintain conversation history

### 3.4 Backend (Orchestration)

**Recommended**: FastAPI

Key modules:
- Authentication & authorization (JWT / college SSO)
- Rate limiting & quota per student
- Conversation memory (Redis or Postgres)
- Request logging & tracing
- Feedback collection endpoint
- Admin endpoints for document management

### 3.5 Frontend / Channels

- Primary: Responsive web app (React / Next.js) embedded in college portal
- Secondary: Gradio/Streamlit demo for testing
- Optional: WhatsApp / Telegram bot, mobile app

---

## 4. Detailed Request Flow

1. Student sends message
2. Backend authenticates user and loads conversation history
3. Optional: Query rewriting / intent classification
4. Parallel retrieval:
   - Internal vector search
   - Conditional web search
5. Context building + token budgeting
6. Prompt construction (system + contexts + history + question)
7. LLM generation (streaming preferred)
8. Post-processing (citations, safety checks)
9. Response returned + logged
10. Optional: User feedback stored

---

## 5. Technology Stack (Production Recommendation)

| Layer                  | Technology                                      | Notes |
|------------------------|-------------------------------------------------|-------|
| Framework              | LlamaIndex (primary) or LangChain               | Excellent RAG abstractions |
| Backend                | FastAPI + Uvicorn                               | Async, fast, easy |
| Vector DB              | Qdrant (self-hosted or cloud)                   | Strong filtering + hybrid search |
| Embeddings             | BGE-large or Nomic                              | Run locally or via API |
| Web Search             | Tavily                                          | Best quality for agents |
| LLM Serving (start)    | Groq / Together AI                              | Extremely fast |
| LLM Serving (prod)     | Hugging Face Inference Endpoints or vLLM        | Your fine-tuned model |
| Database               | PostgreSQL + Redis                              | Users, conversations, feedback |
| Object Storage         | S3-compatible                                   | Documents |
| Monitoring             | Prometheus + Grafana / Langfuse / Helicone      | Traces, cost, quality |
| Deployment             | Docker + Kubernetes or Railway / Render / Fly.io| Or college on-prem |

---

## 6. Deployment Architecture

**Recommended Production Setup**

```
Internet
   │
   ▼
Load Balancer / CDN
   │
   ▼
API Gateway (FastAPI)  ←── Horizontal scaling
   │
   ├──→ Qdrant Cluster
   ├──→ Redis
   ├──→ PostgreSQL
   ├──→ LLM Endpoint (HF Inference Endpoints or GPU cluster)
   └──→ Tavily / Web Search
```

**Hugging Face Specific Options**
- **Demo / Internal testing**: Gradio Space (CPU or ZeroGPU)
- **Production LLM**: Inference Endpoints (scale-to-zero possible)
- Model repo: Private model on Hugging Face Hub

**Alternative low-cost path**
- Self-host vLLM on RunPod / Vast.ai / college GPU servers
- Keep orchestration on normal cloud VMs

---

## 7. Security, Privacy & Compliance

- All college documents stay in your controlled vector DB
- Student conversations encrypted at rest
- Authentication via college SSO / LDAP / OAuth if possible
- Rate limiting + abuse detection
- PII detection and redaction (optional)
- Clear data retention policy
- Audit logs for admin actions and document updates
- Model never trained on live student conversations without consent

---

## 8. Observability & Quality

Track at minimum:
- Retrieval quality (hit rate, relevance scores)
- Answer faithfulness (LLM-as-judge or human review)
- Latency (retrieval + generation)
- Cost per query
- User feedback (thumbs up/down + comments)
- Hallucination / refusal rate

Tools: Langfuse, Helicone, Phoenix, or custom logging + Grafana.

---

## 9. Cost Estimation (Approximate, 2026)

| Component                    | Monthly Cost (small–medium college) | Notes |
|-----------------------------|-------------------------------------|-------|
| Vector DB (Qdrant)          | $0 – $50                            | Self-host almost free |
| Web Search (Tavily)         | $20 – $100                          | Depends on volume |
| LLM Inference               | $50 – $400                          | Biggest variable |
| Backend + DB                | $20 – $80                           | |
| **Total (realistic)**       | **$100 – $600 / month**             | Can be lower with self-hosting |

Fine-tuning cost is one-time (usually $5–50 on rented GPUs).

---

## 10. Implementation Phases

**Phase 1 – MVP (2–4 weeks)**
- Internal RAG only
- Strong system prompt (no fine-tuning yet)
- FastAPI + Gradio demo
- Basic web search optional

**Phase 2 – Production Core (4–6 weeks)**
- Proper vector DB + metadata
- Conversation memory
- Authentication
- Monitoring & feedback
- Deploy LLM on managed endpoint

**Phase 3 – Behavior Tuning & Polish**
- Collect real queries → create fine-tuning dataset
- LoRA fine-tune
- Better re-ranking + hybrid search
- Citations + source links
- Multi-channel support

**Phase 4 – Scale & Governance**
- Document update workflow for admin staff
- Advanced analytics
- A/B testing of prompts/models
- On-prem option if required

---

## 11. Key Design Principles

1. **Knowledge stays external** → easy to update
2. **Behavior is controlled** → fine-tuning or excellent prompting
3. **Always ground answers** → retrieve first, generate second
4. **Fail gracefully** → admit when information is missing
5. **Observable by default** → every query is traceable
6. **Cost-aware** → scale-to-zero and efficient models

---

## 12. Next Immediate Actions

1. Finalize embedding model + vector DB choice
2. Build the document ingestion pipeline
3. Create a strong system prompt and test with a base model
4. Decide LLM serving path (managed vs self-hosted)
5. Set up basic FastAPI + retrieval service

---

## Appendix A: Example Prompt Template

```text
You are CampusBot, the official AI assistant of [College Name].
You are helpful, clear, and student-friendly.
Always prioritize Official College Information when available.
If you use web sources, clearly mention it.
If the information is missing or conflicting, say so honestly.
Never invent college rules, fees, or policies.

### Official College Context:
{college_context}

### Web Context:
{web_context}

### Conversation History:
{history}

### Student Question:
{question}

Give a clear, accurate, and helpful answer:
```

---

## Appendix B: Suggested Folder Structure

```
college-assistant/
├── data/
│   ├── raw/                 # Original .txt / PDF files
│   └── processed/           # Cleaned chunks (optional)
├── ingestion/
│   ├── load_documents.py
│   ├── chunking.py
│   └── embed_and_index.py
├── retrieval/
│   ├── internal_retriever.py
│   ├── web_retriever.py
│   └── context_builder.py
├── llm/
│   ├── client.py            # Groq / HF / vLLM client
│   └── prompts.py
├── api/
│   ├── main.py              # FastAPI app
│   ├── routes/
│   ├── auth.py
│   └── memory.py
├── frontend/                # Optional React / Gradio
├── scripts/
│   ├── fine_tune.py
│   └── evaluate.py
├── docker/
├── requirements.txt
├── .env.example
└── README.md
```

---

**Document End**

*This architecture is designed to be practical, cost-effective, and production-ready for a college environment. It can be implemented incrementally starting from a simple RAG MVP.*
