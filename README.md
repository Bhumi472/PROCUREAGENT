


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



# System Design Document: ProcureOS
## The Autonomous Procurement Operating System (100% Zero-Cost Architecture)

---

![ProcureOS Architecture](C:/Users/User/.gemini/antigravity-ide/brain/57557546-c6a1-4485-accb-7281ee66d279/procureos_operating_system_architecture_1786098816494.png)

---

## 1. Executive System Overview

**ProcureOS** is an enterprise-grade **Autonomous Procurement Operating System**. Rather than acting as a simple AI script or linear chatbot, ProcureOS orchestrates the complete B2B sourcing lifecycle—from technical multi-modal BOM extraction, parallel supplier vector matching, and regulatory audit checks (RoHS/ITAR/ISO), to dynamic multi-turn email negotiation, automated self-learning, and ERP purchase order execution.

ProcureOS runs on a **100% zero-cost stack** using **Groq API** (`llama-3.3-70b-versatile`), **Local Ollama**, **Local HuggingFace Embeddings**, **Qdrant Vector DB**, **PostgreSQL**, **Redis**, **Arize Phoenix**, **FastAPI**, and **React 18**.

---

## 2. Supervisor & Parallel Multi-Agent Architecture

```
                                    +-----------------------------------+
                                    |     SUPERVISOR ORCHESTRATOR       |
                                    |   (LangGraph Plan & Schedule)     |
                                    +-----------------+-----------------+
                                                      |
                  +-----------------------------------+-----------------------------------+
                  | (Parallel Execution Node 1)       | (Parallel Execution Node 2)       | (Parallel Execution Node 3)
                  v                                   v                                   v
    +---------------------------+       +---------------------------+       +---------------------------+
    | Compliance Auditor Node   |       | Vendor Discovery Node     |       | Cost & Market Analyzer    |
    | (ISO/RoHS/ITAR Check)     |       | (Qdrant Vector RAG)       |       | (Price Benchmark Engine)  |
    +-------------+-------------+       +-------------+-------------+       +-------------+-------------+
                  |                                   |                                   |
                  +-----------------------------------+-----------------------------------+
                                                      |
                                                      v
                                    +-----------------------------------+
                                    | Negotiation Planner & Strategy    |
                                    +-----------------+-----------------+
                                                      |
                                                      v
                                    +-----------------------------------+
                                    | Risk Assessment Agent Node        |
                                    +-----------------+-----------------+
                                                      |
                                                      v
                                    +-----------------------------------+
                                    | HUMAN-IN-THE-LOOP INTERRUPT NODE  |
                                    | (Pauses for Executive Approval)   |
                                    +-----------------+-----------------+
                                                      | (Approved)
                                                      v
                                    +-----------------------------------+
                                    | ERP Integration & PO Node (MCP)   |
                                    +-----------------+-----------------+
                                                      |
                                                      v
                                    +-----------------------------------+
                                    | LEARNING & SELF-IMPROVING AGENT   |
                                    | (Updates Memory & Vendor Scores)  |
                                    +-----------------------------------+
```

---

## 3. Explicit 5-Layer Memory Architecture

1. **Layer 1: Working Memory (LangGraph Thread State)**: Ephemeral thread context storing active conversation variables, line item specs, and node step counters.
2. **Layer 2: Session Memory (Redis Checkpointer)**: In-memory state persistence enabling asynchronous graph pausing, retries, and Human-in-the-Loop graph resume.
3. **Layer 3: Semantic Memory (Qdrant Vector Database)**: Persistent vector embeddings of supplier quotes, technical CAD metadata, and historical price negotiation trends.
4. **Layer 4: Business Memory (PostgreSQL Relational DB)**: Immutable transaction database holding executed Purchase Orders, project audit trails, and supplier contracts.
5. **Layer 5: Learning & Evaluation Memory (Postgres JSONB Store)**: Longitudinal store tracking evaluation scores (hallucination, tool precision), negotiation success rates, and vendor reliability metrics.

---

## 4. AI Evaluation Framework (Ragas / DeepEval Integration)

After every procurement pipeline execution, the **AI Evaluation Engine** measures 8 critical quality metrics:

* **Procurement Savings %**: `(Initial Quoted Amount - Final Negotiated PO Amount) / Initial Quoted Amount * 100`
* **Negotiation Success Rate**: Boolean indicator of achieving target price within floor/ceiling budget guardrails.
* **Tool Call Correctness**: Percentage of MCP tool executions returning `200 OK` status without retries.
* **JSON Schema Validity**: Pydantic schema validation rate across document extraction nodes.
* **Hallucination & Faithfulness Score**: Semantic similarity between extracted BOM specs and source documents.
* **Cycle Time Reduction**: Percentage reduction in sourcing cycle time compared to manual baseline (21 days).
* **Compliance Accuracy Rate**: Zero-tolerance audit score for RoHS/ITAR certification verification.
* **Human Override Percentage**: Frequency of human manager modifying proposed PO terms before approval.

---

## 5. Business Intelligence (BI) Query Agent

ProcureOS features a dedicated **BI Query Agent** (`bi_agent.py`) capable of parsing natural language executive questions into SQL/Vector queries:
* *"Which suppliers became more expensive this quarter?"*
* *"What is our average negotiation savings across aluminum parts?"*
* *"Which vendors have the highest defect rate?"*

---

## 6. Model Context Protocol (MCP) Tools

1. **`mcp-email-server`**: Multi-thread SMTP/IMAP email dispatch and quote reply listener.
2. **`mcp-doc-parser`**: Multi-modal vision and document parser for PDFs, Excel BOMs, and CAD drawings.
3. **`mcp-erp-sandbox`**: Transactional SAP BAPI / NetSuite Purchase Order execution mock.

---

## 7. Executive Dashboard & Visual Flow UI

* **Executive KPIs**: Total Savings ($), Average Negotiation ROI %, Vendor Quality Rating, Active Pipeline Count.
* **Interactive React Flow DAG**: Live color-coded visualization of the Supervisor Agent routing parallel worker nodes.
* **Human Approval Gateway**: One-click review of draft POs, savings summaries, and risk indexes before ERP execution.

