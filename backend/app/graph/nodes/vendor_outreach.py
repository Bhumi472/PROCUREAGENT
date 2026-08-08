import logging
from typing import Dict, Any
from backend.app.graph.state import ProcureOSState
from backend.app.mcp_servers.email_mcp import email_mcp_server

logger = logging.getLogger("procureos.node.vendor_outreach")

def vendor_outreach_node(state: ProcureOSState) -> Dict[str, Any]:
    """Node 4: Vendor Outreach Agent Node (MCP SMTP Dispatch).
    Sends custom RFQ packages to verified compliant suppliers via Email MCP server.
    """
    logger.info("Executing [Node 4: Vendor Outreach & RFQ Dispatch Agent (MCP Node)]")
    vendors = state.get("matched_vendors", [])
    line_items = state.get("line_items", [])
    
    dispatched_count = 0
    for v in vendors:
        subject = f"RFQ Request: Custom Procurement Assembly - Project {state.get('project_id', 'PROJ-001')}"
        body = f"""Dear {v['company_name']} Sales Team,

ProcureOS invites your organization to submit a Request for Quotation (RFQ) for the following engineering parts:

"""
        for item in line_items:
            body += f"- Part #{item['part_number']}: {item['description']} (Qty: {item['quantity']} units, Spec: {item['material_spec']})\n"
            
        body += "\nPlease reply with unit pricing, lead times, and RoHS compliance confirmation.\n\nBest Regards,\nProcureOS Autonomous Sourcing Department"
        
        email_mcp_server.send_rfq_email(v["contact_email"], subject, body)
        dispatched_count += 1
        
    log_entry = f"Vendor Outreach Agent dispatched {dispatched_count} RFQ packages via SMTP MCP Server."
    logger.info(log_entry)
    
    return {
        "current_node": "vendor_outreach",
        "logs": [log_entry]
    }
