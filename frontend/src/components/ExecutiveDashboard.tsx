import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Bot, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  Database,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { AgentFlowDag } from './AgentFlowDag';

export const ExecutiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dag' | 'bi'>('dashboard');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [poStatus, setPoStatus] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [biQuery, setBiQuery] = useState('');
  const [biAnswer, setBiAnswer] = useState<string | null>(null);

  const kpis = [
    { title: 'Total Savings Realized', value: '$142,500', change: '+18.6% Margin', icon: TrendingUp, color: 'text-emerald-400' },
    { title: 'Sourcing ROI Multiple', value: '14.2x', change: 'Zero API Cost', icon: Zap, color: 'text-cyan-400' },
    { title: 'Cycle Time Reduction', value: '98.4%', change: '21 Days -> 4 Hours', icon: Cpu, color: 'text-purple-400' },
    { title: 'Compliance Audit Rate', value: '99.1%', change: 'RoHS / ITAR Passed', icon: ShieldCheck, color: 'text-blue-400' }
  ];

  const handleBiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!biQuery) return;
    setBiAnswer(`ProcureOS Executive BI Insight: Stainless Steel fasteners from 'FastTrack Corp' increased by 4.2% in Q3, whereas 'Apex Precision CNC' decreased prices by 8.5% due to ProcureOS multi-turn negotiations.`);
  };

  const handleApprovePo = () => {
    setPoStatus('APPROVED');
    setShowApprovalModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                ProcureOS
              </h1>
              <p className="text-sm text-slate-400">The Autonomous Procurement Operating System</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Executive KPIs
          </button>
          <button 
            onClick={() => setActiveTab('dag')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dag' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Live Agent DAG Flow
          </button>
          <button 
            onClick={() => setActiveTab('bi')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'bi' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
          >
            BI Natural Language Agent
          </button>
        </div>
      </div>

      {/* KPI Section */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">{kpi.title}</span>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-slate-100">{kpi.value}</div>
                  <div className="mt-1 text-xs font-semibold text-emerald-400">{kpi.change}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Sourcing Project Card */}
          <div className="glass-card-glow p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ACTION REQUIRED: LangGraph Interrupt Node Active
                </span>
                <h2 className="text-xl font-bold text-slate-100 mt-2">Assembly BOM #PROJ-HARDWARE-2026</h2>
                <p className="text-sm text-slate-400">Target Budget Ceiling: $35,000.00 | 500 Custom CNC Machined Aluminum Brackets</p>
              </div>

              <button 
                onClick={() => setShowApprovalModal(true)}
                disabled={poStatus === 'APPROVED'}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                  poStatus === 'APPROVED' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20'
                }`}
              >
                {poStatus === 'APPROVED' ? 'PO Executed in SAP ERP' : 'Review & Approve PO ($29,500)'}
              </button>
            </div>

            {/* Trajectory Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">1. Technical Spec Parsing</span>
                <div className="text-sm font-semibold text-emerald-400 mt-1">2 Line Items Extracted</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">2. Parallel Vendor RAG & Audit</span>
                <div className="text-sm font-semibold text-emerald-400 mt-1">RoHS Verified (2 Passed)</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">3. Turn 2 Negotiation</span>
                <div className="text-sm font-semibold text-cyan-400 mt-1">$11.80/unit Accepted (18.6% Save)</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">4. Risk Assessment</span>
                <div className="text-sm font-semibold text-purple-400 mt-1">Risk Score: 0.12 (LOW)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAG Flow Visualizer */}
      {activeTab === 'dag' && (
        <AgentFlowDag />
      )}

      {/* Executive BI Natural Language Query Agent */}
      {activeTab === 'bi' && (
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" /> Business Intelligence Natural Language Query Agent
          </h2>
          <form onSubmit={handleBiSearch} className="flex gap-4">
            <input 
              type="text"
              value={biQuery}
              onChange={(e) => setBiQuery(e.target.value)}
              placeholder="Ask C-suite question e.g. 'Which suppliers became more expensive this quarter?'"
              className="flex-1 px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <button 
              type="submit"
              className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Query BI Engine
            </button>
          </form>

          {biAnswer && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
              <span className="text-xs font-semibold text-cyan-400">ProcureOS Semantic Memory Response:</span>
              <p className="text-slate-200 text-sm leading-relaxed">{biAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Human Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card-glow max-w-xl w-full p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Executive PO Approval Required
              </h3>
              <button onClick={() => setShowApprovalModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 rounded-lg bg-slate-900"><span className="text-slate-400">Supplier:</span><span className="font-semibold text-slate-100">Apex Precision CNC & Machining</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-900"><span className="text-slate-400">Negotiated Price:</span><span className="font-semibold text-emerald-400">$11.80 / unit ($29,500 Total)</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-900"><span className="text-slate-400">Verified Savings:</span><span className="font-semibold text-cyan-400">$6,750.00 (18.6% Savings)</span></div>
              <div className="flex justify-between p-3 rounded-lg bg-slate-900"><span className="text-slate-400">Supplier Risk Index:</span><span className="font-semibold text-purple-400">0.12 (LOW RISK)</span></div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowApprovalModal(false)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 font-semibold">Reject Terms</button>
              <button onClick={handleApprovePo} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20">Approve & Execute in SAP ERP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
