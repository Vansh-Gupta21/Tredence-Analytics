import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { Sidebar } from './components/canvas/Sidebar';
import { Toolbar } from './components/canvas/Toolbar';
import { NodeFormPanel } from './components/forms/NodeFormPanel';
import { SimulationPanel } from './components/simulation/SimulationPanel';

const App: React.FC = () => {
  const [showSimulation, setShowSimulation] = useState(false);

  return (
    // ReactFlowProvider must wrap everything that uses React Flow hooks
    <ReactFlowProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Top toolbar */}
        <Toolbar onSimulate={() => setShowSimulation(true)} />

        {/* Main layout: sidebar | canvas | form panel */}
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <WorkflowCanvas />
          <NodeFormPanel />
        </div>

        {/* Simulation modal */}
        {showSimulation && (
          <SimulationPanel onClose={() => setShowSimulation(false)} />
        )}
      </div>
    </ReactFlowProvider>
  );
};

export default App;
