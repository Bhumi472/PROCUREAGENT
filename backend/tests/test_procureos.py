import pytest
from backend.app.graph.workflow import build_procureos_graph
from backend.app.services.evaluator import evaluator
from backend.app.services.bi_agent import bi_agent
from backend.app.mcp_servers.email_mcp import email_mcp_server
from backend.app.mcp_servers.erp_mcp import erp_mcp_server

def test_procureos_state_graph_building():
    """Verifies that the ProcureOS state graph compiles cleanly."""
    graph = build_procureos_graph()
    assert graph is not None

def test_mcp_email_dispatch():
    """Tests Email MCP Server tool execution."""
    res = email_mcp_server.send_rfq_email("test@supplier.com", "Test Subject", "Test Body")
    assert res["status"] == "SENT"
    assert "message_id" in res

def test_mcp_erp_po_creation():
    """Tests ERP SAP Mock MCP Server PO execution."""
    res = erp_mcp_server.create_purchase_order(
        vendor_name="Apex Precision",
        line_items=[{"part_number": "AL-6061", "quantity": 500}],
        total_amount=29500.0
    )
    assert res["status"] == "SUCCESS"
    assert res["po_number"].startswith("PO-SAP-")

def test_ai_evaluation_framework():
    """Tests Ragas/DeepEval AI Evaluation metrics calculation."""
    sample_state = {
        "line_items": [{"part_number": "AL-6061", "quantity": 500}],
        "proposed_po": {"total_amount": 5900.0}
    }
    metrics = evaluator.evaluate_execution(sample_state)
    assert metrics["procurement_savings_pct"] > 0
    assert metrics["tool_call_correctness"] == 1.0

def test_bi_natural_language_agent():
    """Tests Executive BI Query Agent responses."""
    res = bi_agent.query_procurement_bi("Which suppliers became more expensive this quarter?")
    assert "FastTrack Corp" in res["answer"]
