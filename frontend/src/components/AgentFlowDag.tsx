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
  ArrowRight
} from 'lucide-react';

interface NodeItem {
  id: string;
  name: string;
  type: 'supervisor' | 'parallel' | 'sequential' | 'interrupt' | 'learning';
  status: 'completed' | 'active' | 'pending';
  icon: any;
  desc: string;
  output?: string;
}

export const AgentFlowDag: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('supervisor');

  const nodes: NodeItem[] = [
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
      output: 'Parsed 4 line items (Aluminum 6061, Stainless 316, Titanium Gr5, FR4 PCB). Est: $35,000.00' 
    },
    { 
      id: 'discovery', 
      name: 'Vendor Discovery RAG', 
      type: 'parallel', 
      status: 'completed', 
      icon: Search, 
      desc: 'Qdrant Vector Search (BAAI/bge)', 
      output: 'Matched 3 suppliers from vector database: Apex Precision, Global Alloys, FastTrack Corp.' 
    },
    { 
      id: 'compliance', 
      name: 'Compliance Auditor', 
      type: 'parallel', 
      status: 'completed', 
      icon: ShieldCheck, 
      desc: 'ISO / RoHS / ITAR Verification', 
      output: 'Audit Passed: Apex Precision, Global Alloys. REJECTED: FastTrack (Failed RoHS).' 
    },
    { 
      id: 'cost', 
      name: 'Cost & Market Analyzer', 
      type: 'parallel', 
      status: 'completed', 
      icon: TrendingUp, 
      desc: 'Historical Price Benchmark', 
      output: 'Established target ceiling: $7,084.00 (8% cost reduction target).' 
    },
    { 
      id: 'outreach', 
      name: 'Vendor Outreach MCP', 
      type: 'sequential', 
      status: 'completed', 
      icon: Mail, 
      desc: 'SMTP Email MCP Dispatch', 
      output: 'Dispatched custom RFQ email packages to 2 compliant suppliers.' 
    },
    { 
      id: 'negotiation', 
      name: 'Dynamic Negotiator', 
      type: 'sequential', 
      status: 'completed', 
      icon: Scale, 
      desc: 'Strategic Multi-Turn Strategy', 
      output: 'Turn 1 counter-offer sent ($11.80/unit). Turn 2: Supplier ACCEPTED ($29,500 total, 18.6% saved).' 
    },
    { 
      id: 'risk', 
      name: 'Risk Assessment Agent', 
      type: 'sequential', 
      status: 'completed', 
      icon: AlertTriangle, 
      desc: 'Lead-Time & Reliability Index', 
      output: 'Supplier Risk Score: 0.12 (LOW RISK - 14 Days Lead Time).' 
    },
    { 
      id: 'hitl', 
      name: 'Human Approval Interrupt', 
      type: 'interrupt', 
      status: 'active', 
      icon: Clock, 
      desc: 'LangGraph Interrupt Checkpoint', 
      output: 'Awaiting Executive Approval in React UI before executing SAP ERP write.' 
    },
    { 
      id: 'erp', 
      name: 'SAP ERP Integration', 
      type: 'sequential', 
      status: 'pending', 
      icon: Database, 
      desc: 'SAP BAPI / NetSuite MCP', 
      output: 'Pending PO write execution upon human sign-off.' 
    },
    { 
      id: 'learning', 
      name: 'Self-Improving Learning Agent', 
      type: 'learning', 
      status: 'pending', 
      icon: BrainCircuit, 
      desc: 'Qdrant Memory & Score Update', 
      output: 'Will update supplier score (+0.05) and write negotiation heuristics to Qdrant.' 
    }
  ];

  const activeNodeObj = nodes.find(n => n.id === selectedNode) || nodes[0];

  return (
    <div className="space-y-8">
      {/* Topology Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-cyan-400" /> ProcureOS Parallel Multi-Agent Topology
          </h2>
          <p className="text-sm text-slate-400">Live color-coded visualizer of LangGraph state machine node transitions</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Completed</span>
          <span className="flex items-center gap-1.5 text-amber-400"><Clock className="w-4 h-4 animate-pulse" /> Active Interrupt</span>
          <span className="flex items-center gap-1.5 text-slate-500"><Clock className="w-4 h-4" /> Pending</span>
        </div>
      </div>

      {/* DAG Visual Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {nodes.map((node) => {
          const isSelected = selectedNode === node.id;
          const isCompleted = node.status === 'completed';
          const isActive = node.status === 'active';

          return (
            <div 
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                isSelected 
                  ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10' 
                  : isActive
                  ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/10'
                  : isCompleted
                  ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isActive ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <node.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{node.name}</h3>
                    <span className="text-xs text-slate-400">{node.desc}</span>
                  </div>
                </div>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isActive && <Clock className="w-4 h-4 text-amber-400 animate-spin" />}
              </div>

              {node.type === 'parallel' && (
                <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <GitFork className="w-3 h-3" /> Parallel Worker
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Inspector Drawer */}
      <div className="glass-card-glow p-6 rounded-2xl border border-cyan-500/30 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <activeNodeObj.icon className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-slate-100">State Node Inspection: {activeNodeObj.name}</h4>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
            Node ID: {activeNodeObj.id}
          </span>
        </div>
        <p className="text-xs text-slate-400">{activeNodeObj.desc}</p>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
          <div className="text-slate-500">// Output Log Payload:</div>
          <div>{activeNodeObj.output}</div>
        </div>
      </div>
    </div>
  );
};
