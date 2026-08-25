import logging
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from backend.app.graph.state import ProcureOSState
from backend.app.graph.nodes.supervisor import supervisor_node
from backend.app.graph.nodes.spec_analyzer import spec_analyzer_node
from backend.app.graph.nodes.vendor_discovery import vendor_discovery_node
from backend.app.graph.nodes.compliance_auditor import compliance_auditor_node
from backend.app.graph.nodes.cost_analyzer import cost_analyzer_node
from backend.app.graph.nodes.vendor_outreach import vendor_outreach_node
from backend.app.graph.nodes.negotiation_strategy import negotiation_strategy_node
from backend.app.graph.nodes.risk_assessment import risk_assessment_node
from backend.app.graph.nodes.learning_agent import learning_agent_node
from backend.app.services.evaluator import evaluator

logger = logging.getLogger("procureos.workflow")

def erp_executor_node_wrapper(state: ProcureOSState):
    """ERP Execution Node Wrapper."""
    proposed_po = state.get("proposed_po", {})
    from backend.app.mcp_servers.erp_mcp import erp_mcp_server
    
    vendor_name = proposed_po.get("vendor_name") or state.get("company_name", "Apex Precision Components Pvt Ltd")
    result = erp_mcp_server.create_purchase_order(
        vendor_name=vendor_name,
        line_items=state.get("line_items", []),
        total_amount=proposed_po.get("total_amount", 43070.0)
    )
    
    log_entry = f"ERP Integration Agent executed Purchase Order write-back to SAP Sandbox for '{vendor_name}'! PO Number: {result['po_number']}"

    logger.info(log_entry)
    
    # Run AI evaluation
    eval_metrics = evaluator.evaluate_execution(state)
    
    return {
        "is_approved": True,
        "evaluation_metrics": eval_metrics,
        "current_node": "erp_executor",
        "logs": [log_entry]
    }

def build_procureos_graph():
    """Builds stateful LangGraph Multi-Agent execution graph for ProcureOS."""
    workflow = StateGraph(ProcureOSState)
    
    # Add Nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("spec_analyzer", spec_analyzer_node)
    workflow.add_node("vendor_discovery", vendor_discovery_node)
    workflow.add_node("compliance_auditor", compliance_auditor_node)
    workflow.add_node("cost_analyzer", cost_analyzer_node)
    workflow.add_node("vendor_outreach", vendor_outreach_node)
    workflow.add_node("negotiation_strategy", negotiation_strategy_node)
    workflow.add_node("risk_assessment", risk_assessment_node)
    workflow.add_node("erp_executor", erp_executor_node_wrapper)
    workflow.add_node("learning_agent", learning_agent_node)
    
    # Set Entry Point
    workflow.set_entry_point("supervisor")
    
    # Define Edges
    workflow.add_edge("supervisor", "spec_analyzer")
    workflow.add_edge("spec_analyzer", "vendor_discovery")
    workflow.add_edge("vendor_discovery", "compliance_auditor")
    workflow.add_edge("compliance_auditor", "cost_analyzer")
    workflow.add_edge("cost_analyzer", "vendor_outreach")
    workflow.add_edge("vendor_outreach", "negotiation_strategy")
    workflow.add_edge("negotiation_strategy", "risk_assessment")
    
    def router_after_risk(state: ProcureOSState):
        if state.get("negotiation_turn", 1) < 2:
            return "negotiation_strategy"
        return "erp_executor"
        
    workflow.add_conditional_edges(
        "risk_assessment",
        router_after_risk,
        {
            "negotiation_strategy": "negotiation_strategy",
            "erp_executor": "erp_executor"
        }
    )
    
    workflow.add_edge("erp_executor", "learning_agent")
    workflow.add_edge("learning_agent", END)
    
    # In-Memory State Checkpointer for HITL Interrupt & Resume
    memory = MemorySaver()
    
    # Compile graph with human interrupt before ERP execution
    compiled_app = workflow.compile(
        checkpointer=memory,
        interrupt_before=["erp_executor"]
    )
    
    return compiled_app
