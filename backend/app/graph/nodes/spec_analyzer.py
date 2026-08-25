import logging
from typing import Dict, Any
from backend.app.graph.state import ProcureOSState
from backend.app.mcp_servers.doc_parser_mcp import doc_parser_mcp_server

logger = logging.getLogger("procureos.node.spec_analyzer")

def spec_analyzer_node(state: ProcureOSState) -> Dict[str, Any]:
    """Node 1: Spec & BOM Analyzer Agent Node.
    Parses technical BOM file into structured line items and company context using Document Parser MCP.
    """
    logger.info("Executing [Node 1: Spec & BOM Analyzer Agent]")
    bom_path = state.get("bom_file_path", "")
    
    details = doc_parser_mcp_server.extract_bom_details(bom_path)
    state_company = state.get("company_name")
    company_name = state_company if state_company and state_company.strip() else details.get("company_name", "Apex Precision Components Pvt Ltd")
    line_items = details.get("line_items", [])

    
    total_budget_est = sum(item["quantity"] * item["target_price"] for item in line_items)
    budget_ceiling = total_budget_est * 1.15
    
    log_entry = f"Spec Analyzer parsed {len(line_items)} BOM items for company '{company_name}'. Budget Ceiling: ₹{budget_ceiling:,.2f}"
    logger.info(log_entry)
    
    return {
        "company_name": company_name,
        "line_items": line_items,
        "budget_ceiling": budget_ceiling, # 15% ceiling flexibility guardrail
        "current_node": "spec_analyzer",
        "logs": [log_entry]
    }

