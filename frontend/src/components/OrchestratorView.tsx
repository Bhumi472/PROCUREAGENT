import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Terminal, 
  FileText, 
  AlertTriangle, 
  Database, 
  ShieldCheck, 
  Mail, 
  Scale, 
  BrainCircuit,
  Zap,
  TrendingUp,
  Upload
} from 'lucide-react';

interface OrchestratorViewProps {
  onApprovePo: () => void;
  poApproved: boolean;
  graphState?: any;
  onRunPipeline?: (bomPath?: string) => Promise<void>;
  isExecuting?: boolean;
  availableBoms?: string[];
  selectedBom?: string;
  setSelectedBom?: (bom: string) => void;
}

export const OrchestratorView: React.FC<OrchestratorViewProps> = ({ 
  onApprovePo, 
  poApproved, 
  graphState,
  onRunPipeline,
  isExecuting = false,
  availableBoms = ["samples/assembly_bom.csv"],
  selectedBom = "samples/assembly_bom.csv",
  setSelectedBom
}) => {
  const [uploading, setUploading] = useState(false);

  const logs: string[] = graphState?.logs || [
    "ProcureOS Supervisor initialized with LangGraph State Machine Engine.",
    "Ready for BOM document spec extraction (Doc Parser MCP)."
  ];

  const currentNode = graphState?.current_node || "start";

  const steps = [
    { id: 1, key: 'spec_analyzer', name: 'BOM Spec Analyzer', icon: FileText, desc: 'Doc Parser MCP' },
    { id: 2, key: 'vendor_discovery', name: 'Vendor Discovery RAG', icon: Cpu, desc: 'Qdrant Vector Search' },
    { id: 3, key: 'compliance_auditor', name: 'Compliance Auditor', icon: ShieldCheck, desc: 'RoHS / ITAR Verification' },
    { id: 4, key: 'cost_analyzer', name: 'Cost Benchmark', icon: TrendingUp, desc: 'Historical Price Index' },
    { id: 5, key: 'vendor_outreach', name: 'Email RFQ Dispatch', icon: Mail, desc: 'SMTP MCP Server' },
    { id: 6, key: 'negotiation_strategy', name: 'Multi-Turn Negotiation', icon: Scale, desc: 'Counter-Offer Engine' },
    { id: 7, key: 'risk_assessment', name: 'Risk Assessment Agent', icon: AlertTriangle, desc: 'Supplier Lead-Time Index' },
    { id: 8, key: 'hitl', name: 'Human Approval Gate', icon: Clock, desc: 'LangGraph Interrupt' },
    { id: 9, key: 'erp_executor', name: 'SAP ERP PO Execution', icon: Database, desc: 'SAP BAPI Write-Back' },
    { id: 10, key: 'learning_agent', name: 'Self-Improving Memory', icon: BrainCircuit, desc: 'Qdrant Score Update' }
  ];

  const currentStepIndex = (() => {
    if (poApproved) return 10;
    if (!graphState) return 0;
    const nodeMap: Record<string, number> = {
      'spec_analyzer': 1,
      'vendor_discovery': 2,
      'compliance_auditor': 3,
      'cost_analyzer': 4,
      'vendor_outreach': 5,
      'negotiation_strategy': 6,
      'risk_assessment': 8,
      'erp_executor': 9,
      'learning_agent': 10
    };
    return nodeMap[currentNode] || 8;
  })();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/agents/upload-bom', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.file_path) {
        if (setSelectedBom) setSelectedBom(data.file_path);
        if (onRunPipeline) await onRunPipeline(data.file_path);
      }
    } catch (err) {
      console.error('Failed to upload BOM file', err);
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Live Multi-Agent LangGraph Engine
            </span>
            <h2 className="text-xl font-bold text-white">
              Sourcing Pipeline Execution Hub
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-3">
              <span>Selected BOM: <strong className="font-mono text-indigo-300 font-semibold">{selectedBom}</strong></span>
              {graphState?.company_name && (
                <>
                  <span>•</span>
                  <span className="text-[#F5D061] font-bold">Enterprise: {graphState.company_name}</span>
                </>
              )}
            </p>
          </div>


          <div className="flex flex-wrap items-center gap-3">
            
            {/* Custom BOM File Upload Button */}
            <label className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-all flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              {uploading ? 'Uploading...' : 'Upload Custom BOM CSV'}
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => onRunPipeline && onRunPipeline(selectedBom)}
              disabled={isExecuting}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                isExecuting
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
              }`}
            >
              {isExecuting ? 'Executing Agent Pipeline...' : 'Run Pipeline Execution'}
            </button>

            {currentStepIndex >= 8 && !poApproved && (
              <button
                onClick={onApprovePo}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve PO & Execute SAP ERP
              </button>
            )}

            {poApproved && (
              <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PO Executed in SAP ERP
              </span>
            )}
          </div>
        </div>

        {/* Step Progress Tracker Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-4 border-t border-slate-800">
          {steps.map((s) => {
            const isDone = currentStepIndex > s.id || (s.id <= 8 && currentStepIndex >= 8) || (poApproved && s.id <= 10);
            const isCurrent = currentStepIndex === s.id && !poApproved;

            return (
              <div 
                key={s.id} 
                className={`p-2.5 rounded-xl text-center space-y-1.5 border transition-all ${
                  isDone 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : isCurrent 
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex justify-center">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <s.icon className="w-4 h-4 text-amber-400 animate-pulse" />
                  ) : (
                    <s.icon className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div className="text-[10px] font-bold truncate">{s.name}</div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Dynamic Real-Time Parsed Technical BOM Line Items Table */}
      {graphState?.line_items && graphState.line_items.length > 0 && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Parsed BOM Line Items ({graphState.company_name || 'Uploaded BOM'})</h3>
              <p className="text-xs text-slate-400">Parsed dynamically from uploaded CSV spec file via Doc Parser MCP</p>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {graphState.line_items.length} Items Parsed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-indigo-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Part Number</th>
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Material Spec</th>
                  <th className="pb-2 text-right">Quantity</th>
                  <th className="pb-2 text-right">Target Unit Price (₹)</th>
                  <th className="pb-2 text-right">Total Line Target (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {graphState.line_items.map((item: any, idx: number) => {
                  const lineTotal = (item.quantity || 0) * (item.target_price || 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 font-bold text-indigo-300">{item.part_number}</td>
                      <td className="py-2.5 text-slate-200">{item.description}</td>
                      <td className="py-2.5 text-slate-400">{item.material_spec}</td>
                      <td className="py-2.5 text-right font-bold text-amber-300">{(item.quantity || 0).toLocaleString()}</td>
                      <td className="py-2.5 text-right text-emerald-400">₹{Number(item.target_price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                      <td className="py-2.5 text-right font-bold text-amber-300">₹{lineTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Terminal Live Output Log Stream */}

      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Live Agent Trajectory Log Stream</h3>
              <p className="text-[11px] text-slate-400">Real-time server logs from LangGraph multi-agent graph execution</p>
            </div>
          </div>

          <span className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Connected to Backend
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 font-mono text-xs text-slate-300 h-72 overflow-y-auto space-y-2 leading-relaxed">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-slate-600 select-none">&gt;</span>
              <span className={log.includes('PASSED') || log.includes('ACCEPTED') || log.includes('write-back') ? 'text-emerald-300 font-semibold' : log.includes('REJECTED') ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
