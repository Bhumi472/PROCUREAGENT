import React from 'react';
import { 
  Bot, 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Play, 
  Clock,
  Sparkles,
  BarChart3,
  GitFork,
  FileSpreadsheet,
  FileText,
  Crown
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'orchestrator' | 'dag' | 'negotiation' | 'bi';
  setActiveTab: (tab: 'dashboard' | 'orchestrator' | 'dag' | 'negotiation' | 'bi') => void;
  systemOnline: boolean;
  activeThreadId: string;
  onTriggerExecution: () => void;
  isExecuting: boolean;
  selectedBom: string;
  setSelectedBom: (bom: string) => void;
  availableBoms: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemOnline,
  activeThreadId,
  onTriggerExecution,
  isExecuting,
  selectedBom,
  setSelectedBom,
  availableBoms
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0C14]/90 backdrop-blur-lg border-b border-[#D4AF37]/30 px-6 py-3.5 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand & Telemetry */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#E5A93C]/20 to-[#9A7B2C]/10 border border-[#D4AF37]/40 text-[#F5D061] shadow-md shadow-[#D4AF37]/10">
            <Crown className="w-6 h-6 text-[#F5D061]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-gold-gradient">
                ProcureOS
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#E5A93C]/10 text-[#F5D061] border border-[#D4AF37]/30">
                Royal Gold Edition
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${systemOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-500' : 'bg-red-500'}`} title={systemOnline ? "FastAPI Backend Operational" : "Backend Offline"} />
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Autonomous Procurement Operating System</span>
              <span className="text-[#9A7B2C]">•</span>
              <span className="text-[#F5D061] flex items-center gap-1 font-mono text-[11px]">
                <Activity className="w-3 h-3 text-[#E5A93C]" /> LangGraph Multi-Agent Engine
              </span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 p-1.5 rounded-xl bg-[#11121F] border border-[#D4AF37]/20">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'btn-royal-gold shadow-md'
                : 'text-slate-400 hover:text-[#F5D061] hover:bg-[#1A1C2E]'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Executive Command
          </button>

          <button
            onClick={() => setActiveTab('orchestrator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orchestrator'
                ? 'btn-royal-gold shadow-md'
                : 'text-slate-400 hover:text-[#F5D061] hover:bg-[#1A1C2E]'
            }`}
          >
            <Zap className="w-4 h-4 text-[#F5D061]" /> Live Orchestrator
          </button>

          <button
            onClick={() => setActiveTab('dag')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dag'
                ? 'btn-royal-gold shadow-md'
                : 'text-slate-400 hover:text-[#F5D061] hover:bg-[#1A1C2E]'
            }`}
          >
            <GitFork className="w-4 h-4 text-indigo-300" /> Multi-Agent 3D DAG
          </button>

          <button
            onClick={() => setActiveTab('negotiation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'negotiation'
                ? 'btn-royal-gold shadow-md'
                : 'text-slate-400 hover:text-[#F5D061] hover:bg-[#1A1C2E]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-300" /> RFQ Negotiation Hub
          </button>

          <button
            onClick={() => setActiveTab('bi')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bi'
                ? 'btn-royal-gold shadow-md'
                : 'text-slate-400 hover:text-[#F5D061] hover:bg-[#1A1C2E]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F5D061]" /> C-Suite BI Studio
          </button>
        </nav>

        {/* Live Controls & Telemetry */}
        <div className="flex items-center gap-3">
          
          {/* BOM Dropdown Selector */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11121F] border border-[#D4AF37]/30 text-xs">
            <FileText className="w-3.5 h-3.5 text-[#E5A93C]" />
            <select 
              value={selectedBom} 
              onChange={(e) => setSelectedBom(e.target.value)}
              className="bg-transparent text-[#F5D061] text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {availableBoms.map((b) => (
                <option key={b} value={b} className="bg-[#11121F] text-[#F3F4F6]">
                  {b.split('/').pop()}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11121F] border border-[#D4AF37]/20 text-[11px] font-mono text-slate-400">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>FastAPI: <strong className="text-emerald-400">8000</strong></span>
            <span className="text-[#9A7B2C]">|</span>
            <Database className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span className="text-[#F5D061]">Qdrant RAG</span>
          </div>

          <button
            onClick={onTriggerExecution}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              isExecuting
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                : 'btn-royal-gold'
            }`}
          >
            {isExecuting ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-amber-300" /> Running Sourcing Pipeline...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" /> Run Sourcing Pipeline
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
