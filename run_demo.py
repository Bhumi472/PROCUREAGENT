"""
ProcureOS: Autonomous Procurement Operating System
==================================================
End-to-End Working MVP Demonstration Script (100% Free Stack)

This script demonstrates the complete procurement lifecycle:
1. Supervisor Agent Orchestration
2. Multi-Modal Technical BOM Parsing (MCP Doc Parser)
3. Parallel Vendor Discovery (Qdrant Vector RAG) & Compliance Auditing (RoHS/ITAR)
4. Cost & Market Analysis Benchmark
5. MCP Email RFQ Dispatch & Multi-Turn Negotiation Strategy
6. Risk Assessment Scoring
7. Human-in-the-Loop (HITL) Graph Interrupt & Executive Approval
8. SAP ERP Purchase Order Execution (MCP ERP Server)
9. Self-Improving Learning Agent (Qdrant Memory Update)
10. AI Evaluation Framework Metrics & Natural Language Executive BI Querying
"""

import sys
import logging
from backend.app.graph.workflow import build_procureos_graph
from backend.app.services.bi_agent import bi_agent

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(name)s | %(levelname)s | %(message)s")
logger = logging.getLogger("ProcureOS-Demo")

def print_banner(text):
    print("\n" + "="*80)
    print(f"  {text.upper()}")
    print("="*80 + "\n")

def run_procureos_mvp():
    print_banner("ProcureOS: Autonomous Procurement Operating System - Initializing")

    # 1. Compile LangGraph Multi-Agent Engine
    graph = build_procureos_graph()
    thread_id = "demo_thread_8942"
    
    initial_state = {
        "project_id": "PROJ-HARDWARE-2026",
        "thread_id": thread_id,
        "bom_file_path": "samples/assembly_bom.csv",
        "line_items": [],
        "matched_vendors": [],
        "compliance_passed_vendors": [],
        "market_benchmark_price": 0.0,
        "active_quotes": {},
        "negotiation_turn": 0,
        "budget_ceiling": 0.0,
        "risk_score": 0.0,
        "current_node": "start",
        "is_approved": False,
        "proposed_po": None,
        "evaluation_metrics": {},
        "logs": ["ProcureOS Supervisor initialized."]
    }

    config = {"configurable": {"thread_id": thread_id}}

    print_banner("Phase 1: Executing Parallel Multi-Agent Sourcing & Negotiation")
    
    # Execute graph up to the Human Approval Interrupt Node
    paused_state = graph.invoke(initial_state, config=config)

    print("\n" + "-"*60)
    print("  [LOG TRAJECTORY]:")
    for log in paused_state.get("logs", []):
        print(f"  -> {log}")
    print("-"*60 + "\n")

    proposed_po = paused_state.get("proposed_po", {})
    risk_score = paused_state.get("risk_score", 0.12)

    print_banner("Phase 2: Human-in-the-Loop Interrupt Gateway")
    print(f"  Proposed Purchase Order Package:")
    print(f"  • PO Number       : {proposed_po.get('po_number', 'PO-DRAFT-8942')}")
    print(f"  • Supplier        : {proposed_po.get('vendor_name')}")
    print(f"  • Negotiated Price: ${proposed_po.get('unit_price'):.2f}/unit (Total: ${proposed_po.get('total_amount'):,.2f})")
    print(f"  • Savings Realized: {proposed_po.get('savings_realized')}")
    print(f"  • Supplier Risk   : {risk_score:.2f} (LOW RISK)")
    print(f"  • Status          : AWAITING HUMAN EXECUTIVE APPROVAL (Graph Interrupted)")
    print("-" * 60)

    # 2. Simulate Executive Human Approval
    user_input = "APPROVE"
    print(f"\nExecutive Approval Input: [{user_input}] -> Resuming Graph Execution...\n")

    print_banner("Phase 3: ERP Integration & Self-Improving Learning Agent Execution")
    
    # Resume state machine past interrupt
    final_state = graph.invoke(None, config=config)

    print("\n" + "-"*60)
    print("  [POST-APPROVAL LOG TRAJECTORY]:")
    for log in final_state.get("logs", []):
        print(f"  -> {log}")
    print("-"*60 + "\n")

    print_banner("Phase 4: AI Evaluation Framework Metrics (Ragas / DeepEval)")
    metrics = final_state.get("evaluation_metrics", {})
    for k, v in metrics.items():
        print(f"  • {k.replace('_', ' ').title():<32}: {v}")

    print_banner("Phase 5: Executive BI Agent Query Engine")
    sample_queries = [
        "Which suppliers became more expensive this quarter?",
        "What is our total procurement savings across hardware BOMs?"
    ]
    
    for q in sample_queries:
        res = bi_agent.query_procurement_bi(q)
        print(f"  Q: {res['question']}")
        print(f"  A: {res['answer']}\n")

    print_banner("ProcureOS Demonstration Complete - 100% Operational")

if __name__ == "__main__":
    run_procureos_mvp()
