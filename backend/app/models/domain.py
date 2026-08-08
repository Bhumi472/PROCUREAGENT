import uuid
import datetime
from sqlalchemy import Column, String, Text, Numeric, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="PROCUREMENT_MANAGER")
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class RfqProject(Base):
    __tablename__ = "rfq_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="DRAFT") # DRAFT, ACTIVE, AWAITING_APPROVAL, COMPLETED
    bom_file_path = Column(Text, nullable=True)
    target_budget = Column(Numeric(12, 2), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    
    quotations = relationship("Quotation", back_populates="project")
    approval_tasks = relationship("HumanApprovalTask", back_populates="project")

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    iso_certified = Column(Boolean, default=True)
    rohs_compliant = Column(Boolean, default=True)
    itar_registered = Column(Boolean, default=False)
    quality_rating = Column(Numeric(3, 2), default=4.80)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("rfq_projects.id"))
    vendor_id = Column(UUID(as_uuid=True), ForeignKey("vendors.id"))
    unit_price = Column(Numeric(10, 2), nullable=False)
    lead_time_days = Column(Integer, nullable=False)
    raw_quote_text = Column(Text, nullable=True)
    status = Column(String(50), default="RECEIVED") # RECEIVED, COUNTER_OFFERED, ACCEPTED
    received_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    project = relationship("RfqProject", back_populates="quotations")
    vendor = relationship("Vendor")

class HumanApprovalTask(Base):
    __tablename__ = "human_approval_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("rfq_projects.id"))
    proposed_po_data = Column(JSON, nullable=False)
    status = Column(String(50), default="PENDING") # PENDING, APPROVED, REJECTED
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    project = relationship("RfqProject", back_populates="approval_tasks")

class AgentExecutionLog(Base):
    __tablename__ = "agent_execution_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), nullable=True)
    thread_id = Column(String(255), nullable=False)
    agent_name = Column(String(100), nullable=False)
    step_name = Column(String(100), nullable=False)
    input_state = Column(JSON, nullable=False)
    output_state = Column(JSON, nullable=False)
    tokens_used = Column(Integer, default=0)
    execution_time_ms = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
