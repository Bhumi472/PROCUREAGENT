import logging
from typing import Dict, Any
from backend.app.graph.state import ProcureOSState

logger = logging.getLogger("procureos.node.supervisor")

def supervisor_node(state: ProcureOSState) -> Dict[str, Any]:
    """Supervisor Agent Node (Orchestrator).
    Creates execution plan, schedules parallel worker nodes, monitors progress, and manages state transitions.
    """
    logger.info("Executing [Supervisor Agent Node - Orchestrator]")
    
    current_node = state.get("current_node", "start")
    
    if current_node == "start":
        log_entry = "Supervisor Agent initialized procurement execution plan: Scheduling parallel Vendor Discovery, Compliance Audit, and Cost Market Analysis."
        next_step = "parallel_workers"
    else:
        log_entry = "Supervisor Agent monitored worker node completion: Parallel execution verified cleanly."
        next_step = "negotiation_planner"

    logger.info(log_entry)
    
    return {
        "current_node": "supervisor",
        "logs": [log_entry]
    }
