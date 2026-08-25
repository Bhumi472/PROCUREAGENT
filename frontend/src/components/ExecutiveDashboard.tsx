import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Scale,
  Layers,
  Search,
  Crown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { GoldenCore3D } from './GoldenCore3D';

interface ExecutiveDashboardProps {
  onApprovePo: () => void;
  poApproved: boolean;
  onNavigateToTab: (tab: 'dashboard' | 'orchestrator' | 'dag' | 'negotiation' | 'bi') => void;
  graphState?: any;
  activeThreadId?: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onApprovePo,
  poApproved,
  onNavigateToTab,
  graphState,
  activeThreadId = "PROJ-HARDWARE-2026"
}) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [kpiData, setKpiData] = useState<any>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/analytics/executive-kpis')
      .then(res => res.json())
      .then(data => setKpiData(data))
      .catch(() => {
        setKpiData({
          total_savings_usd: 142500.00,
          total_savings_pct: 18.6,
          roi_multiple: "14.2x",
          completed_projects_count: 34,
          average_cycle_time_reduction: "98.4%",
          compliance_audit_pass_rate: "99.1%"
        });
      });
  }, []);

  const proposedPo = graphState?.proposed_po || {
    vendor_name: graphState?.company_name ? `${graphState.company_name} Machining & Mfg` : "Apex Precision Components Pvt Ltd",
    unit_price: 940.80,
    total_amount: 3433920.00,
    savings_realized: "₹7,84,750.00 (18.6% Savings)",
    lead_time_days: 14
  };

  const currentCompanyName = graphState?.company_name || proposedPo.company_name || proposedPo.vendor_name || "Apex Precision Components Pvt Ltd";
  const lineItemsCount = graphState?.line_items?.length || 4;
  const budgetCeiling = graphState?.budget_ceiling || 4108845.00;

  const totalSavingsFormatted = kpiData
    ? (kpiData.total_savings_inr ? `₹${Number(kpiData.total_savings_inr).toLocaleString('en-IN')}` : `₹${(kpiData.total_savings_usd * 82.5).toLocaleString('en-IN')}`)
    : '₹1,17,56,250';

  const kpis = [
    { 
      title: 'Total Realized Savings', 
      value: totalSavingsFormatted, 
      change: `+${kpiData?.total_savings_pct || 18.6}% Margin Saved`, 
      subText: `Across ${kpiData?.completed_projects_count || 34} Hardware BOMs`,
      icon: TrendingUp, 
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30'
    },
    { 
      title: 'ProcureOS Sourcing ROI', 
      value: kpiData?.roi_multiple || '14.2x', 
      change: '100% Zero API Cost', 
      subText: 'Groq / Llama-3 / Ollama Stack',
      icon: Zap, 
      color: 'text-[#F5D061]',
      bgColor: 'bg-[#E5A93C]/10 border-[#D4AF37]/30'
    },
    { 
      title: 'Sourcing Cycle Time', 
      value: '4.2 Hours', 
      change: `${kpiData?.average_cycle_time_reduction || '98.4%'} Faster`, 
      subText: 'Reduced from 21 Days Manual Sourcing',
      icon: Cpu, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30'
    },
    { 
      title: 'Compliance Audit Rate', 
      value: kpiData?.compliance_audit_pass_rate || '99.1%', 
      change: 'RoHS 3 / BIS Passed', 
      subText: 'Automated Certificate Verification',
      icon: ShieldCheck, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30'
    }
  ];

  const priceComparisonData = [
    { name: 'Initial Quote', price: Math.round(budgetCeiling * 1.08), fill: '#64748b' },
    { name: 'Target Ceiling', price: Math.round(budgetCeiling), fill: '#E5A93C' },
    { name: 'ProcureOS Negotiated', price: Math.round(proposedPo.total_amount || 3433920), fill: '#10b981' }
  ];

  const cycleTimeData = [
    { month: 'Jan', manualDays: 24, procureOsHours: 5.2 },
    { month: 'Feb', manualDays: 22, procureOsHours: 4.8 },
    { month: 'Mar', manualDays: 21, procureOsHours: 4.5 },
    { month: 'Apr', manualDays: 20, procureOsHours: 4.2 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gold-gradient flex items-center gap-3">
            <span>Executive Command Center</span>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-[#E5A93C]/10 text-[#F5D061] border border-[#D4AF37]/30">
              {currentCompanyName}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time autonomous procurement performance, active pipeline approvals, and 3D agent intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateToTab('orchestrator')}
            className="px-4 py-2 rounded-xl bg-[#11121F] border border-[#D4AF37]/30 hover:border-[#F5D061] text-[#F5D061] font-bold text-xs transition-all flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5 text-[#F5D061]" /> View Live Orchestrator
          </button>
        </div>
      </div>

      {/* KPI Cards & 3D Interactive Agent Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 4 KPI Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpis.map((kpi, idx) => (
            <div 
              key={idx} 
              className="glass-card glass-card-hover p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E5A93C]">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-lg border ${kpi.bgColor}`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-[#FFF8DC] tracking-tight">{kpi.value}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    {kpi.change}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">{kpi.subText}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Three.js Dynamic 3D Agent Core Component */}
        <div className="glass-card p-4 flex flex-col justify-between space-y-3 border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
            <span className="text-xs font-bold text-[#F5D061] flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#E5A93C]" /> Dynamic 3D Agent Intelligence
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="flex-1 min-h-[190px]">
            <GoldenCore3D isExecuting={graphState?.current_node && graphState.current_node !== 'start'} />
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            Interactive Three.js 3D Neural Agent Mesh (Drag/Hover to Rotate)
          </p>
        </div>

      </div>

      {/* Active Sourcing Project Highlight Box (HITL Trigger Card) */}
      <div className="glass-card-glow p-6 space-y-5 border-[#D4AF37]/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider border ${
                poApproved 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-gold-pulse'
              }`}>
                {poApproved ? 'COMPLETED: PO Executed in SAP ERP' : 'ACTION REQUIRED: Executive HITL Sign-Off Active'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#FFF8DC]">
              {currentCompanyName} #{activeThreadId}
            </h3>
            <p className="text-xs text-slate-400">
              {lineItemsCount} Hardware Part Lines • Budget Ceiling: ₹{budgetCeiling.toLocaleString('en-IN', {minimumFractionDigits: 2})}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowApprovalModal(true)}
              disabled={poApproved}
              className={`px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                poApproved
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'btn-royal-gold'
              }`}
            >
              {poApproved ? 'PO Executed in SAP ERP' : `Review & Approve PO (₹${(proposedPo.total_amount || 3433920).toLocaleString('en-IN')})`}
            </button>
          </div>
        </div>

        {/* Trajectory Timeline Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-[#D4AF37]/20">
          <div className="p-3.5 rounded-xl bg-[#0F1019] border border-[#D4AF37]/20 space-y-1">
            <span className="text-xs font-semibold text-[#E5A93C] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F5D061]" /> 1. Spec Extraction
            </span>
            <div className="text-xs font-bold text-slate-200">Doc Parser MCP Passed</div>
            <p className="text-[11px] text-slate-400">{lineItemsCount} Line Items Extracted</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F1019] border border-[#D4AF37]/20 space-y-1">
            <span className="text-xs font-semibold text-[#E5A93C] flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-purple-400" /> 2. Vector Search RAG
            </span>
            <div className="text-xs font-bold text-emerald-400">RoHS / BIS Passed</div>
            <p className="text-[11px] text-slate-400">{proposedPo.vendor_name} Verified</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F1019] border border-[#D4AF37]/20 space-y-1">
            <span className="text-xs font-semibold text-[#E5A93C] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" /> 3. Dynamic Negotiation
            </span>
            <div className="text-xs font-bold text-[#F5D061]">₹{proposedPo.unit_price || 940.80}/unit Accepted</div>
            <p className="text-[11px] text-slate-400">18.6% Discount Realized</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0F1019] border border-[#D4AF37]/20 space-y-1">
            <span className="text-xs font-semibold text-[#E5A93C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 4. Risk Index
            </span>
            <div className="text-xs font-bold text-slate-200">Risk Score: 0.12 (LOW)</div>
            <p className="text-[11px] text-slate-400">{proposedPo.lead_time_days || 14} Days Lead Time</p>
          </div>
        </div>
      </div>

      {/* Dynamic Real-Time Parsed Technical BOM Line Items Table */}
      {graphState?.line_items && graphState.line_items.length > 0 && (
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#FFF8DC]">Extracted BOM Line Items ({currentCompanyName})</h3>
              <p className="text-xs text-slate-400">Parsed dynamically from uploaded CSV spec file via Doc Parser MCP</p>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {lineItemsCount} Items Parsed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead>
                <tr className="border-b border-[#D4AF37]/20 text-[#E5A93C] uppercase text-[10px] tracking-wider">
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
                      <td className="py-2.5 text-right font-bold text-[#F5D061]">₹{lineTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Analytics Visualizer Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Price Comparison Chart */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
            <div>
              <h4 className="text-sm font-bold text-[#FFF8DC]">Price Benchmark & Savings Breakdown (₹)</h4>
              <p className="text-xs text-slate-400">Initial Quote vs Target Ceiling vs ProcureOS Negotiated</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {proposedPo.savings_realized || "Saved ₹7,84,750.00"}
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#9A7B2C" fontSize={11} tickLine={false} />
                <YAxis stroke="#9A7B2C" fontSize={11} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#11121F', borderColor: '#D4AF37', borderRadius: '8px', color: '#FFF8DC' }}
                />
                <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                  {priceComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cycle Time Reduction Chart */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
            <div>
              <h4 className="text-sm font-bold text-[#FFF8DC]">Procurement Cycle Time Optimization</h4>
              <p className="text-xs text-slate-400">Manual Sourcing Days vs ProcureOS Autonomous Hours</p>
            </div>
            <span className="text-xs font-bold text-[#F5D061] bg-[#E5A93C]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
              98.4% Efficiency Gain
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cycleTimeData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="month" stroke="#9A7B2C" fontSize={11} tickLine={false} />
                <YAxis stroke="#9A7B2C" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#11121F', borderColor: '#D4AF37', borderRadius: '8px', color: '#FFF8DC' }}
                />
                <Area type="monotone" dataKey="manualDays" name="Manual Days" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.15)" strokeWidth={2} />
                <Area type="monotone" dataKey="procureOsHours" name="ProcureOS Hours" stroke="#E5A93C" fill="rgba(229, 169, 60, 0.25)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Human Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 space-y-5 border-[#D4AF37]/50 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#FFF8DC]">Executive Purchase Order Sign-Off</h3>
                  <p className="text-xs text-[#E5A93C]">LangGraph Interrupt Node Checkpoint</p>
                </div>
              </div>

              <button 
                onClick={() => setShowApprovalModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 rounded-lg bg-[#0A0B12] border border-[#D4AF37]/20">
                <span className="text-slate-400">Target Enterprise / Vendor:</span>
                <span className="font-bold text-[#FFF8DC]">{proposedPo.vendor_name}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[#0A0B12] border border-[#D4AF37]/20">
                <span className="text-slate-400">Negotiated Unit Price:</span>
                <span className="font-mono font-bold text-emerald-400">₹{proposedPo.unit_price} / unit (₹{(proposedPo.total_amount || 3433920).toLocaleString('en-IN')} Total)</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[#0A0B12] border border-[#D4AF37]/20">
                <span className="text-slate-400">Savings Realized:</span>
                <span className="font-mono font-bold text-[#F5D061]">{proposedPo.savings_realized}</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[#0A0B12] border border-[#D4AF37]/20">
                <span className="text-slate-400">Compliance Audit:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> RoHS 3 & BIS / ISO Certified
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[#0A0B12] border border-[#D4AF37]/20">
                <span className="text-slate-400">Supplier Risk Score:</span>
                <span className="font-semibold text-slate-300">0.12 (LOW RISK - {proposedPo.lead_time_days || 14} Days Lead Time)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel / Reject
              </button>
              <button 
                onClick={() => {
                  onApprovePo();
                  setShowApprovalModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Approve & Write SAP PO (₹)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

