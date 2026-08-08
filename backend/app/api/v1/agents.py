import uuid
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.app.graph.workflow import build_procureos_graph

router = APIRouter(prefix="/agents", tags=["Agent Graph Orchestrator"])

app_graph = build_procureos_graph()

# In-Memory Execution State Cache for instant frontend visualizer updates
GRAPH_STATE_CACHE: Dict[str, Any] = {}

class StartGraphRequest(BaseModel):
    project_id: str
    bom_file_path: str = "samples/assembly_bom.csv"

@router.post("/start-execution")
async def start_agent_execution(req: StartGraphRequest, background_tasks: BackgroundTasks):
    """Triggers ProcureOS LangGraph multi-agent execution pipeline."""
    thread_id = f"thread_{uuid.uuid4().hex[:8]}"
    
    initial_state = {
        "project_id": req.project_id,
        "thread_id": thread_id,
        "bom_file_path": req.bom_file_path,
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
        "logs": ["ProcureOS Orchestrator Initialized."]
    }

    # Execute graph synchronously for reliable state reporting
    config = {"configurable": {"thread_id": thread_id}}
    final_state = app_graph.invoke(initial_state, config=config)
    
    GRAPH_STATE_CACHE[thread_id] = final_state
    
    return {
        "status": "AWAITING_HUMAN_APPROVAL",
        "thread_id": thread_id,
        "current_node": final_state.get("current_node"),
        "proposed_po": final_state.get("proposed_po"),
        "risk_score": final_state.get("risk_score"),
        "logs": final_state.get("logs", [])
    }

@router.get("/state/{thread_id}")
async def get_agent_state(thread_id: str):
    """Fetches real-time state of running agent graph for frontend React Flow visualizer."""
    state = GRAPH_STATE_CACHE.get(thread_id)
    if not state:
        return {"status": "NOT_FOUND", "logs": ["Graph state initializing..."]}
    return state

@router.post("/approve-po/{thread_id}")
async def approve_purchase_order(thread_id: str):
    """Resumes graph from Human Approval Interrupt Node to execute ERP PO write and Learning Agent update."""
    state = GRAPH_STATE_CACHE.get(thread_id)
    if not state:
        return {"status": "ERROR", "message": "Thread not found"}

    config = {"configurable": {"thread_id": thread_id}}
    # Resume execution past the human approval interrupt point
    resumed_state = app_graph.invoke(None, config=config)
    GRAPH_STATE_CACHE[thread_id] = resumed_state
    
    return {
        "status": "COMPLETED",
        "message": "Purchase Order approved and executed in SAP ERP Sandbox. Learning Agent updated.",
        "evaluation_metrics": resumed_state.get("evaluation_metrics"),
        "logs": resumed_state.get("logs")
    }
