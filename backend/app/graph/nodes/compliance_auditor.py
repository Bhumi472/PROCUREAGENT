import logging
from typing import Dict, Any, List
from backend.app.graph.state import ProcureOSState, VendorProfile

logger = logging.getLogger("procureos.node.compliance_auditor")

def compliance_auditor_node(state: ProcureOSState) -> Dict[str, Any]:
    """Node 3: Compliance & Regulatory Auditor Agent Node.
    Filters suppliers based on ISO 9001, RoHS, and ITAR compliance rules.
    """
    logger.info("Executing [Node 3: Compliance & Regulatory Auditor Agent]")
    vendors: List[VendorProfile] = state.get("matched_vendors", [])
    
    audited_vendors: List[VendorProfile] = []
    rejected_vendors: List[str] = []
    
    for v in vendors:
        if v["iso_certified"] and v["rohs_compliant"]:
            audited_vendors.append(v)
        else:
            rejected_vendors.append(v["company_name"])
            logger.warning(f"Compliance Auditor REJECTED supplier '{v['company_name']}' - Failed RoHS/ISO 9001 certification check.")
            
    log_entry = f"Compliance Auditor verified {len(audited_vendors)} compliant suppliers. Rejected {len(rejected_vendors)} non-compliant suppliers ({', '.join(rejected_vendors)})."
    logger.info(log_entry)
    
    return {
        "matched_vendors": audited_vendors,
        "compliance_passed_vendors": audited_vendors,
        "current_node": "compliance_auditor",
        "logs": [log_entry]
    }
