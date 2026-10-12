
import logging
import os
import uuid
from pathlib import Path
from typing import Any, Dict

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from backend.app.graph.workflow import build_procureos_graph

logger = logging.getLogger("procureos.agents")

router = APIRouter(prefix="/agents", tags=["Agent Graph Orchestrator"])

app_graph = build_procureos_graph()

# In-memory execution state cache.
GRAPH_STATE_CACHE: Dict[str, Any] = {}

SAMPLES_DIR = Path("samples").resolve()
ALLOWED_BOM_EXTENSIONS = {".csv", ".xlsx", ".xls"}
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 MB


class StartGraphRequest(BaseModel):
    project_id: str = Field(
        default="PROJ-HARDWARE-2026",
        min_length=1,
        max_length=100,
    )
    bom_file_path: str = "samples/assembly_bom.csv"
    company_name: str = Field(default="", max_length=200)


@router.get("/boms")
async def list_available_boms():
    """Return BOM files that actually exist on the server."""
    if not SAMPLES_DIR.is_dir():
        return {"boms": []}

    files = sorted(
        str(Path("samples") / file.name)
        for file in SAMPLES_DIR.iterdir()
        if file.is_file() and file.suffix.lower() == ".csv"
    )

    return {"boms": files}


@router.post("/upload-bom")
async def upload_bom_file(file: UploadFile = File(...)):
    """Upload a CSV or Excel BOM file for agent execution."""
    original_name = Path(file.filename or "").name

    if not original_name:
        raise HTTPException(
            status_code=400,
            detail="Please select a BOM file to upload.",
        )

    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_BOM_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Upload a CSV, XLSX, or XLS file.",
        )

    try:
        contents = await file.read(MAX_UPLOAD_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded BOM file is empty.",
            )

        if len(contents) > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail="The BOM file exceeds the 10 MB upload limit.",
            )

        SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

        filename = f"uploaded_{uuid.uuid4().hex[:12]}{extension}"
        destination = SAMPLES_DIR / filename

        # Keep uploads inside the configured samples directory.
        if destination.resolve().parent != SAMPLES_DIR:
            raise HTTPException(
                status_code=400,
                detail="Invalid upload destination.",
            )

        with destination.open("wb") as output:
            output.write(contents)

        return {
            "status": "SUCCESS",
            "file_path": str(destination.relative_to(Path.cwd().resolve())),
            "filename": filename,
            "message": f"Successfully uploaded BOM '{original_name}'.",
        }

    except HTTPException:
        raise
    except OSError as exc:
        logger.exception("Failed to save uploaded BOM")
        raise HTTPException(
            status_code=500,
            detail="The server could not save the uploaded BOM.",
        ) from exc
    finally:
        await file.close()


@router.post("/start-execution")
async def start_agent_execution(req: StartGraphRequest):
    """Run the procurement graph and pause before ERP execution."""
    bom_path = Path(req.bom_file_path)

    if not bom_path.is_absolute():
        bom_path = (Path.cwd() / bom_path).resolve()
    else:
        bom_path = bom_path.resolve()

    # Prevent arbitrary file paths from being passed to the parser.
    try:
        bom_path.relative_to(SAMPLES_DIR)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="The BOM path must refer to a file inside the samples directory.",
        )

    if not bom_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="BOM file not found. Upload a BOM or select an existing file.",
        )

    if bom_path.suffix.lower() not in ALLOWED_BOM_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported BOM format. Use CSV, XLSX, or XLS.",
        )

    thread_id = f"thread_{uuid.uuid4().hex[:8]}"

    initial_state = {
        "project_id": req.project_id,
        "thread_id": thread_id,
        "company_name": req.company_name,
        "bom_file_path": str(bom_path),
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
        "logs": ["ProcureOS Orchestrator Initialized."],
    }

    config = {"configurable": {"thread_id": thread_id}}

    try:
        final_state = app_graph.invoke(initial_state, config=config)
    except (ValueError, FileNotFoundError) as exc:
        logger.warning("BOM execution validation failed: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("ProcureOS graph execution failed")
        raise HTTPException(
            status_code=500,
            detail="Procurement execution failed. Check the backend logs.",
        ) from exc

    GRAPH_STATE_CACHE[thread_id] = final_state

    return {
        "status": "AWAITING_HUMAN_APPROVAL",
        "thread_id": thread_id,
        "state": final_state,
        "current_node": final_state.get("current_node"),
        "proposed_po": final_state.get("proposed_po"),
        "risk_score": final_state.get("risk_score"),
        "logs": final_state.get("logs", []),
    }


@router.get("/state/{thread_id}")
async def get_agent_state(thread_id: str):
    """Return the cached state for an execution thread."""
    state = GRAPH_STATE_CACHE.get(thread_id)

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Execution thread not found. It may have expired or restarted.",
        )

    return state


@router.post("/approve-po/{thread_id}")
async def approve_purchase_order(thread_id: str):
    """Resume graph execution after human approval."""
    state = GRAPH_STATE_CACHE.get(thread_id)

    if state is None:
        raise HTTPException(
            status_code=404,
            detail="Execution thread not found. Start a new execution.",
        )

    if state.get("is_approved"):
        raise HTTPException(
            status_code=409,
            detail="This purchase order has already been approved.",
        )

    config = {"configurable": {"thread_id": thread_id}}

    try:
        resumed_state = app_graph.invoke(None, config=config)
    except Exception as exc:
        logger.exception("Purchase order approval failed for %s", thread_id)
        raise HTTPException(
            status_code=500,
            detail="Purchase order execution failed. Check the backend logs.",
        ) from exc

    GRAPH_STATE_CACHE[thread_id] = resumed_state

    return {
        "status": "COMPLETED",
        "message": (
            "Graph execution resumed. Check the execution state "
            "to verify the ERP result."
        ),
        "state": resumed_state,
        "evaluation_metrics": resumed_state.get("evaluation_metrics"),
        "logs": resumed_state.get("logs"),
    }
