from typing import TypedDict, List, Dict, Any, Optional, Annotated
import operator

class LineItem(TypedDict):
    part_number: str
    description: str
    quantity: int
    material_spec: str
    target_price: float

class VendorProfile(TypedDict):
    vendor_id: str
    company_name: str
    contact_email: str
    iso_certified: bool
    rohs_compliant: bool
    itar_registered: bool
    quality_rating: float

class VendorQuote(TypedDict):
    vendor_id: str
    company_name: str
    unit_price: float
    lead_time_days: int
    rohs_compliant: bool
    status: str

class ProcureOSState(TypedDict):
    project_id: str
    thread_id: str
    bom_file_path: str
    line_items: List[LineItem]
    matched_vendors: List[VendorProfile]
    compliance_passed_vendors: List[VendorProfile]
    market_benchmark_price: float
    active_quotes: Dict[str, VendorQuote]
    negotiation_turn: int
    budget_ceiling: float
    risk_score: float  # 0.0 to 1.0
    current_node: str
    is_approved: bool
    proposed_po: Optional[Dict[str, Any]]
    evaluation_metrics: Dict[str, Any]
    logs: Annotated[List[str], operator.add]
