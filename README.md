# Implementation Plan: ProcureAgent (SourcingGraph AI)

ProcureAgent is an autonomous multi-agent enterprise platform built on **LangGraph**, **MCP**, **Qdrant**, **FastAPI**, **React**, **PostgreSQL**, **Redis**, and **OpenTelemetry**. It automates B2B industrial procurement, technical BOM parsing, multi-turn vendor negotiation via email, compliance verification (RoHS/ITAR/ISO), and ERP purchase order execution with Human-in-the-Loop guardrails.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions for Approval (100% FREE / ZERO-COST Stack)**:
> 1. **100% Free LLM Engine Options**:
>    - **Groq API (Free Tier)**: Ultra-fast, zero-cost inference using `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, or `deepseek-r1-distill-llama-70b`.
>    - **Google Gemini API (Free Tier)**: Zero-cost `gemini-1.5-flash` / `gemini-2.0-flash`.
>    - **Ollama (100% Local Free)**: Run open models like `llama3.1:8b` or `qwen2.5:7b` locally on CPU/GPU without spending a single dollar.
> 2. **100% Free Local Vector & Embedding Engine**:
>    - **Local HuggingFace Embeddings**: `BAAI/bge-small-en-v1.5` or `all-MiniLM-L6-v2` (runs 100% locally on CPU for free).
>    - **Qdrant / ChromaDB**: Local Docker container (100% free forever).
> 3. **100% Free Core Stack**: Python 3.11+, FastAPI, LangGraph, LangChain, PostgreSQL (Docker local), Redis (Docker local), Arize Phoenix (Local Docker OTEL tracing), React 18 + Vite, Tailwind CSS.

---

## Open Questions

> [!NOTE]
> 1. **Primary Free LLM Selection**: Should we use **Groq API** (`llama-3.3-70b-versatile` - zero cost with high intelligence) as the primary cloud model, with **Ollama** (`llama3.1:8b` local) as the fallback option? *(Recommended: Yes, both are 100% free)*
> 2. **Mocking External ERP/Email Interfaces**: Local sandbox mocks for Email SMTP and ERP BAPIs so you don't need any paid third-party enterprise subscriptions. *(100% free)*

---

## Proposed System Architecture & Component Plan

```
procureagent-app/
├── backend/
│   ├── app/
│   │   ├── api/ v1/ (auth, projects, agents, approvals, webhooks)
│   │   ├── core/ (config, security, telemetry, database setup)
│   │   ├── graph/ (LangGraph state graph, state schema, agent nodes)
│   │   ├── mcp_servers/ (SMTP Email MCP, Doc Parser MCP, ERP Connector MCP)
│   │   ├── models/ (SQLAlchemy domain models)
│   │   └── services/ (RAG Qdrant service, PDF/BOM extractor, negotiation logic)
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/ (AgentFlowDag visualizer, ApprovalModal, TelemetryChart)
│   │   ├── pages/ (Dashboard, ProjectDetails, ApprovalCenter)
│   │   └── services/ (API client, WebSocket subscriber)
│   └── package.json
├── docker-compose.yml
└── implementation_plan.md
```

---

### Component Breakdown

---

#### 1. Backend Core & Database Layer [NEW]
* **Files**:
  * `backend/app/core/config.py`
  * `backend/app/db/session.py`
  * `backend/app/db/qdrant_client.py`
  * `backend/app/models/domain.py`
* **Functionality**:
  * Configures PostgreSQL connection pool, Redis cache/state store connection, and Qdrant vector client.
  * Defines SQLAlchemy relational models: `Users`, `RfqProjects`, `Vendors`, `RfqLineItems`, `Quotations`, `HumanApprovalTasks`, `AgentExecutionLogs`.

---

#### 2. Model Context Protocol (MCP) Tools [NEW]
* **Files**:
  * `backend/app/mcp_servers/email_mcp.py`
  * `backend/app/mcp_servers/doc_parser_mcp.py`
  * `backend/app/mcp_servers/erp_mcp.py`
* **Functionality**:
  * **Email MCP**: Secure SMTP/IMAP protocol tool for sending RFQs, polling inbox for vendor quote emails, and retrieving PDF quote attachments.
  * **Doc Parser MCP**: Vision/OCR and structured table parser for extracting BOM line items and PDF quote matrices into Pydantic JSON schemas.
  * **ERP MCP**: Sandboxed execution server for querying inventory levels and executing Purchase Order creation.

---

#### 3. LangGraph Stateful Multi-Agent Engine [NEW]
* **Files**:
  * `backend/app/graph/state.py`
  * `backend/app/graph/nodes/spec_analyzer.py`
  * `backend/app/graph/nodes/vendor_discovery.py`
  * `backend/app/graph/nodes/compliance_auditor.py`
  * `backend/app/graph/nodes/vendor_outreach.py`
  * `backend/app/graph/nodes/negotiation_strategy.py`
  * `backend/app/graph/nodes/erp_executor.py`
  * `backend/app/graph/workflow.py`
* **Functionality**:
  * Defines the overall LangGraph state graph.
  * Implements node functions for BOM parsing, Qdrant RAG vector lookup for vendor matching, compliance verification (RoHS/ITAR/ISO), RFQ dispatch, dynamic negotiation, and human approval interrupts (`interrupt_before=['erp_executor']`).

---

#### 4. Observability & Telemetry Integration [NEW]
* **Files**:
  * `backend/app/core/telemetry.py`
* **Functionality**:
  * Configures **OpenTelemetry** traces and metrics exporter to stream execution spans, token costs, latency distributions, and node state transitions to Arize Phoenix / LangSmith.

---

#### 5. FastAPI Web Layer & Webhooks [NEW]
* **Files**:
  * `backend/app/api/v1/projects.py`
  * `backend/app/api/v1/agents.py`
  * `backend/app/api/v1/approvals.py`
  * `backend/app/api/v1/webhooks.py`
  * `backend/app/main.py`
* **Functionality**:
  * REST endpoints for project creation, BOM upload, agent graph execution, real-time WebSocket state streaming, and email webhook handling for incoming quote emails.

---

#### 6. React 18 Interactive Frontend [NEW]
* **Files**:
  * `frontend/src/components/AgentFlowDag.tsx`
  * `frontend/src/components/ApprovalModal.tsx`
  * `frontend/src/pages/Dashboard.tsx`
  * `frontend/src/pages/ProjectDetails.tsx`
* **Functionality**:
  * Renders real-time multi-agent graph state using **React Flow**, displays live step logs via WebSockets, and provides interactive Human-in-the-Loop review and approval interface for pending POs.

---

## Verification Plan

### Automated Tests
1. **Agent State Graph Execution Unit Tests**:
   * Test state graph flow from `spec_analyzer` to `vendor_discovery` to `compliance_auditor`.
   * Verify budget ceiling guardrails in `negotiation_strategy`.
2. **MCP Tool Integration Tests**:
   * Verify document parser MCP extracts valid JSON schema from sample BOM PDFs/Excels.
   * Verify ERP MCP sandbox correctly records mock Purchase Orders.
3. **Qdrant Vector RAG Search Tests**:
   * Verify hybrid dense/sparse search retrieves relevant vendor historical quotes.

### Manual Verification
1. **End-to-End Execution & HITL Flow**:
   * Upload sample assembly BOM in React Frontend.
   * Watch multi-agent DAG execute through nodes via WebSockets.
   * Receive vendor quote webhook, trigger dynamic negotiation counter-offer, and verify graph enters **Human Approval Interrupt State**.
   * Approve Purchase Order in UI and verify PO generation in ERP MCP execution log.
