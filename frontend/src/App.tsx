import React from 'react';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ExecutiveDashboard />
    </div>
  );
};

export default App;
