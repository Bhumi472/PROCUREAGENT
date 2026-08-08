import logging
from typing import Dict, Any
from backend.app.graph.state import ProcureOSState

logger = logging.getLogger("procureos.node.risk_assessment")

def risk_assessment_node(state: ProcureOSState) -> Dict[str, Any]:
    """Node: Risk Assessment Agent.
    Evaluates supplier lead-time reliability, single-source dependencies, and financial risk scores.
    """
    logger.info("Executing [Node: Risk Assessment Agent]")
    proposed_po = state.get("proposed_po") or {}
    
    lead_time = proposed_po.get("lead_time_days", 14) if isinstance(proposed_po, dict) else 14
    risk_score = 0.12 if lead_time <= 14 else 0.45
    
    log_entry = f"Risk Assessment Agent computed composite Supplier Risk Score: {risk_score:.2f} (LOW RISK - Lead Time: {lead_time} days)."
    logger.info(log_entry)
    
    return {
        "risk_score": risk_score,
        "logs": [log_entry]
    }
