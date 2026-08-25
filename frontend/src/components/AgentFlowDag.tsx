import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  GitFork, 
  Layers, 
  ShieldCheck, 
  Search, 
  TrendingUp, 
  Mail, 
  Scale, 
  AlertTriangle, 
  Database, 
  BrainCircuit,
  Crown
} from 'lucide-react';
import { GoldenCore3D } from './GoldenCore3D';

interface AgentFlowDagProps {
  graphState?: any;
}

export const AgentFlowDag: React.FC<AgentFlowDagProps> = ({ graphState }) => {
  const [selectedNode, setSelectedNode] = useState<string>('supervisor');

  const lineItemsCount = graphState?.line_items?.length || 4;
  const matchedVendorsCount = graphState?.matched_vendors?.length || 3;
  const compliancePassedCount = graphState?.compliance_passed_vendors?.length || 2;
  const proposedPo = graphState?.proposed_po;
  const isApproved = graphState?.is_approved || false;

  const nodes = [
    { 
      id: 'supervisor', 
      name: 'Supervisor Orchestrator', 
      type: 'supervisor', 
      status: 'completed', 
      icon: Cpu, 
      desc: 'LangGraph Plan & Router', 
      output: 'Scheduled parallel execution plan: Vendor Discovery + Compliance Audit + Cost Analyzer.' 
    },
    { 
      id: 'spec', 
      name: 'BOM Spec Analyzer', 
      type: 'sequential', 
      status: 'completed', 
      icon: Layers, 
      desc: 'Doc Parser MCP (Multi-modal)', 
      output: `Parsed ${lineItemsCount} line items from BOM. Estimated Budget Ceiling: $${(graphState?.budget_ceiling || 52925).toLocaleString(undefined, {minimumFractionDigits: 2})}` 
    },
    { 
      id: 'discovery', 
      name: 'Vendor Discovery RAG', 
      type: 'parallel', 
      status: 'completed', 
      icon: Search, 
      desc: 'Qdrant Vector Search (bge-m3)', 
      output: `Matched ${matchedVendorsCount} suppliers from vector store (Apex Precision, Global Hardware, FastTrack Corp).` 
    },
    { 
      id: 'compliance', 
      name: 'Compliance Auditor', 
      type: 'parallel', 
      status: 'completed', 
      icon: ShieldCheck, 
      desc: 'ISO / RoHS / ITAR Verification', 
      output: `Audit Passed: ${compliancePassedCount} suppliers (Apex Precision, Global Hardware). REJECTED: FastTrack Corp (Failed RoHS).` 
    },
    { 
      id: 'cost', 
      name: 'Cost & Market Analyzer', 
      type: 'parallel', 
      status: 'completed', 
      icon: TrendingUp, 
      desc: 'Historical Price Benchmark', 
      output: `Established baseline benchmark target price of $11.80/unit based on historical Qdrant trends.` 
    },
    { 
      id: 'outreach', 
      name: 'Vendor Outreach MCP', 
      type: 'sequential', 
      status: 'completed', 
      icon: Mail, 
      desc: 'SMTP Email MCP Dispatch', 
      output: `Dispatched customized RFQ email packages to ${compliancePassedCount} compliant suppliers via SMTP MCP Server.` 
    },
    { 
      id: 'negotiation', 
      name: 'Dynamic Negotiator', 
      type: 'sequential', 
      status: 'completed', 
      icon: Scale, 
      desc: 'Strategic Multi-Turn Strategy', 
      output: `Turn 1: Initial quote $14.50/unit countered. Turn 2: Apex Precision ACCEPTED $11.80/unit ($43,070.00 Total, 18.6% saved).` 
    },
    { 
      id: 'risk', 
      name: 'Risk Assessment Agent', 
      type: 'sequential', 
      status: 'completed', 
      icon: AlertTriangle, 
      desc: 'Lead-Time & Reliability Index', 
      output: `Supplier Risk Score: ${graphState?.risk_score || 0.12} (LOW RISK - 14 Days Lead Time).` 
    },
    { 
      id: 'hitl', 
      name: 'Human Approval Gate', 
      type: 'interrupt', 
      status: isApproved ? 'completed' : 'active', 
      icon: Clock, 
      desc: 'LangGraph Interrupt Checkpoint', 
      output: isApproved ? 'Executive Human Sign-Off APPROVED.' : 'Awaiting Executive Approval in React UI before executing SAP ERP write.' 
    },
    { 
      id: 'erp', 
      name: 'SAP ERP Integration', 
      type: 'sequential', 
      status: isApproved ? 'completed' : 'pending', 
      icon: Database, 
      desc: 'SAP BAPI Purchase Order Write', 
      output: isApproved ? `Executed Purchase Order write-back to SAP Sandbox! PO: ${proposedPo?.po_number || 'PO-SAP-A0243949'}` : 'Pending PO write execution upon human sign-off.' 
    },
    { 
      id: 'learning', 
      name: 'Self-Improving Learning Agent', 
      type: 'learning', 
      status: isApproved ? 'completed' : 'pending', 
      icon: BrainCircuit, 
      desc: 'Qdrant Memory & Score Update', 
      output: isApproved ? 'Updated supplier reliability score (+0.05 boost) and saved negotiation outcome vector to Qdrant memory.' : 'Pending post-execution memory write.' 
    }
  ];

  const activeNodeObj = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div className="space-y-6">
      {/* Topology Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gold-gradient flex items-center gap-2">
            <GitFork className="w-5 h-5 text-[#E5A93C]" /> Multi-Agent 3D Topology & State Graph
          </h2>
          <p className="text-xs text-slate-400">Interactive 3D visualizer of LangGraph state machine node transitions & payloads</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
          <span className="flex items-center gap-1.5 text-[#F5D061]"><Clock className="w-3.5 h-3.5" /> Active</span>
          <span className="flex items-center gap-1.5 text-slate-500"><Clock className="w-3.5 h-3.5" /> Pending</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Node Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'active';

            return (
              <div 
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected 
                    ? 'bg-[#181A2B] border-[#D4AF37] ring-1 ring-[#D4AF37]/40 shadow-lg' 
                    : isActive
                    ? 'bg-[#181A2B]/90 border-amber-500/50 shadow-md'
                    : isCompleted
                    ? 'bg-[#11121F] border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                    : 'bg-[#08080C] border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${
                      isActive ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                      isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                      <node.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#FFF8DC]">{node.name}</h3>
                      <span className="text-[11px] text-slate-400">{node.desc}</span>
                    </div>
                  </div>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isActive && <Clock className="w-4 h-4 text-amber-400 animate-spin" />}
                </div>

                {node.type === 'parallel' && (
                  <div className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5A93C]/10 text-[#F5D061] border border-[#D4AF37]/30">
                    <GitFork className="w-3 h-3" /> Parallel Node
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Col: Three.js Dynamic 3D Mesh Component */}
        <div className="glass-card p-4 flex flex-col justify-between space-y-3 border-[#D4AF37]/40">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
            <span className="text-xs font-bold text-[#F5D061] flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#E5A93C]" /> 3D Mesh Topology Core
            </span>
          </div>

          <div className="flex-1 min-h-[220px]">
            <GoldenCore3D isExecuting={true} />
          </div>

          <div className="p-3 rounded-xl bg-[#090A10] border border-[#D4AF37]/20 text-xs">
            <div className="text-[10px] font-mono text-[#E5A93C] uppercase tracking-wider mb-1">// Selected Node:</div>
            <div className="font-bold text-white text-xs">{activeNodeObj.name}</div>
            <p className="text-[11px] text-slate-400 mt-1">{activeNodeObj.desc}</p>
          </div>
        </div>

      </div>

      {/* Selected Node Inspector Drawer */}
      <div className="glass-card p-5 space-y-3 border-[#D4AF37]/30">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
          <div className="flex items-center gap-2">
            <activeNodeObj.icon className="w-4 h-4 text-[#F5D061]" />
            <h4 className="text-sm font-bold text-[#FFF8DC]">Node State Inspector: {activeNodeObj.name}</h4>
          </div>
          <span className="text-xs font-mono text-[#F5D061] bg-[#E5A93C]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
            {activeNodeObj.id}
          </span>
        </div>
        <p className="text-xs text-slate-400">{activeNodeObj.desc}</p>
        <div className="p-3.5 rounded-xl bg-[#08080C] border border-[#D4AF37]/20 font-mono text-xs text-emerald-400 space-y-1">
          <div className="text-slate-500">// Output Log Payload:</div>
          <div>{activeNodeObj.output}</div>
        </div>
      </div>
    </div>
  );
};
