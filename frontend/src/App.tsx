import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { OrchestratorView } from './components/OrchestratorView';
import { AgentFlowDag } from './components/AgentFlowDag';
import { NegotiationHub } from './components/NegotiationHub';
import { BiAssistant } from './components/BiAssistant';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orchestrator' | 'dag' | 'negotiation' | 'bi'
  >('dashboard');

  const [poApproved, setPoApproved] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [systemOnline, setSystemOnline] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string>(
    'PROJ-HARDWARE-2026'
  );
  const [graphState, setGraphState] = useState<any>(null);
  const [availableBoms, setAvailableBoms] = useState<string[]>([
    'samples/assembly_bom.csv',
  ]);
  const [selectedBom, setSelectedBom] = useState<string>(
    'samples/assembly_bom.csv'
  );

  useEffect(() => {
    let cancelled = false;

    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!cancelled) {
          setSystemOnline(response.ok);
        }
      } catch {
        if (!cancelled) {
          setSystemOnline(false);
        }
      }
    };

    const loadBoms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/agents/boms`);

        if (!response.ok) {
          throw new Error(`Failed to load BOMs: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (cancelled) return;

        if (Array.isArray(data.boms) && data.boms.length > 0) {
          setAvailableBoms(data.boms);
          setSelectedBom(data.boms[0]);
          await handleRunExecution(data.boms[0], false);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to load BOMs from backend:', error);
        }
      }
    };

    void checkBackend();
    void loadBoms();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRunExecution = async (
    bomPath?: string,
    switchTab: boolean = true
  ) => {
    const targetBom = bomPath || selectedBom;

    setIsExecuting(true);
    setPoApproved(false);

    if (switchTab) {
      setActiveTab('orchestrator');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/agents/start-execution`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: `PROJ-${Math.floor(1000 + Math.random() * 9000)}`,
            bom_file_path: targetBom,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Execution failed: HTTP ${response.status}`);
      }

      const data = await response.json();

      setActiveThreadId(data.thread_id || 'PROJ-HARDWARE-2026');
      setGraphState(data.state);

      const bomsResponse = await fetch(
        `${API_BASE_URL}/api/v1/agents/boms`
      );

      if (bomsResponse.ok) {
        const bomsData = await bomsResponse.json();

        if (Array.isArray(bomsData.boms)) {
          setAvailableBoms(bomsData.boms);
        }
      }

      setSystemOnline(true);
    } catch (error) {
      console.error('Backend execution failed:', error);
      setSystemOnline(false);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApprovePo = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/agents/approve-po/${encodeURIComponent(activeThreadId)}`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error(`PO approval failed: HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.state) {
        setGraphState(data.state);
      }

      setPoApproved(true);
    } catch (error) {
      console.error('PO approval failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white bg-grid-pattern">
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

        {activeTab === 'dag' && <AgentFlowDag graphState={graphState} />}

        {activeTab === 'negotiation' && (
          <NegotiationHub graphState={graphState} />
        )}

        {activeTab === 'bi' && <BiAssistant />}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-5 border-t border-slate-800/80 text-xs font-mono text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          ProcureOS Autonomous Procurement Operating System
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
