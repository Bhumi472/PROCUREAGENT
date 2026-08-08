from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services.bi_agent import bi_agent

router = APIRouter(prefix="/analytics", tags=["Analytics & BI Dashboard"])

class BIQueryRequest(BaseModel):
    question: str

@router.get("/executive-kpis")
async def get_executive_kpis():
    """Returns Executive C-Suite Dashboard KPIs."""
    return {
        "total_savings_usd": 142500.00,
        "total_savings_pct": 18.6,
        "roi_multiple": "14.2x",
        "active_sourcing_pipelines": 4,
        "completed_projects_count": 34,
        "average_cycle_time_reduction": "98.4% (21 days -> 4 hours)",
        "compliance_audit_pass_rate": "99.1%",
        "supplier_risk_index": "0.14 (LOW RISK)",
        "avg_negotiation_success_rate": "94.2%"
    }

@router.post("/bi-query")
async def query_bi_agent(request: BIQueryRequest):
    """Processes natural language executive BI question using Executive BI Agent."""
    res = bi_agent.query_procurement_bi(request.question)
    return res
