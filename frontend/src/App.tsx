import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { OrchestratorView } from './components/OrchestratorView';
import { AgentFlowDag } from './components/AgentFlowDag';
import { NegotiationHub } from './components/NegotiationHub';
import { BiAssistant } from './components/BiAssistant';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orchestrator' | 'dag' | 'negotiation' | 'bi'>('dashboard');
  const [poApproved, setPoApproved] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState<string>("PROJ-HARDWARE-2026");
  const [graphState, setGraphState] = useState<any>(null);
  const [availableBoms, setAvailableBoms] = useState<string[]>(["samples/assembly_bom.csv"]);
  const [selectedBom, setSelectedBom] = useState<string>("samples/assembly_bom.csv");

  // Check Backend Health & Available BOMs on Mount + Run Initial Sourcing Pipeline
  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then(res => {
        if (res.ok) setSystemOnline(true);
      })
      .catch(() => setSystemOnline(false));

    fetch('http://127.0.0.1:8000/api/v1/agents/boms')
      .then(res => res.json())
      .then(data => {
        if (data.boms && data.boms.length > 0) {
          setAvailableBoms(data.boms);
          const defaultBom = data.boms[0];
          setSelectedBom(defaultBom);
          handleRunExecution(defaultBom, false);
        }
      })
      .catch(() => {
        handleRunExecution("samples/assembly_bom.csv", false);
      });
  }, []);

  const handleRunExecution = async (bomPath?: string, switchTab: boolean = true) => {
    const targetBom = bomPath || selectedBom;
    setIsExecuting(true);
    setPoApproved(false);
    if (switchTab) setActiveTab('orchestrator');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/agents/start-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: `PROJ-${Math.floor(1000 + Math.random() * 9000)}`,
          bom_file_path: targetBom
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveThreadId(data.thread_id || "PROJ-HARDWARE-2026");
        setGraphState(data.state);
        
        // Refresh available BOMs list from backend
        fetch('http://127.0.0.1:8000/api/v1/agents/boms')
          .then(res => res.json())
          .then(bData => {
            if (bData.boms) setAvailableBoms(bData.boms);
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('Backend execution call fallback:', e);
    } finally {
      setIsExecuting(false);
    }
  };


  const handleApprovePo = async () => {
    setPoApproved(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/agents/approve-po/${activeThreadId}`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.state) {
          setGraphState(data.state);
        }
      }
    } catch (e) {
      console.warn('PO Approval local fallback active:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white bg-grid-pattern">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemOnline={systemOnline}
        activeThreadId={activeThreadId}
        onTriggerExecution={() => handleRunExecution(selectedBom)}
        isExecuting={isExecuting}
        selectedBom={selectedBom}
        setSelectedBom={setSelectedBom}
        availableBoms={availableBoms}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            onApprovePo={handleApprovePo}
            poApproved={poApproved}
            onNavigateToTab={setActiveTab}
            graphState={graphState}
            activeThreadId={activeThreadId}
          />
        )}

        {activeTab === 'orchestrator' && (
          <OrchestratorView
            onApprovePo={handleApprovePo}
            poApproved={poApproved}
            graphState={graphState}
            onRunPipeline={handleRunExecution}
            isExecuting={isExecuting}
            availableBoms={availableBoms}
            selectedBom={selectedBom}
            setSelectedBom={setSelectedBom}
          />
        )}

        {activeTab === 'dag' && (
          <AgentFlowDag
            graphState={graphState}
          />
        )}

        {activeTab === 'negotiation' && (
          <NegotiationHub
            graphState={graphState}
          />
        )}

        {activeTab === 'bi' && (
          <BiAssistant />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-5 border-t border-slate-800/80 text-xs font-mono text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          ProcureOS Autonomous Procurement Operating System • 100% Operational Architecture
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>FastAPI</span>
          <span>•</span>
          <span>LangGraph</span>
          <span>•</span>
          <span>Qdrant Vector RAG</span>
          <span>•</span>
          <span>SAP ERP MCP</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
