import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useWorkflowValidation } from '../../hooks/useWorkflowValidation';
import { StartNodeForm } from './StartNodeForm';
import { TaskNodeForm } from './TaskNodeForm';
import { ApprovalNodeForm } from './ApprovalNodeForm';
import { AutomatedStepNodeForm } from './AutomatedStepNodeForm';
import { EndNodeForm } from './EndNodeForm';
import { WorkflowNode } from '../../types/workflow';
import { Button } from '../ui/Button';

const NODE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  start: { label: 'Start Node', color: 'text-emerald-400' },
  task: { label: 'Task Node', color: 'text-blue-400' },
  approval: { label: 'Approval Node', color: 'text-amber-400' },
  automated: { label: 'Automated Step', color: 'text-violet-400' },
  end: { label: 'End Node', color: 'text-rose-400' },
};

function renderForm(node: WorkflowNode) {
  switch (node.data.type) {
    case 'start': return <StartNodeForm node={node} />;
    case 'task': return <TaskNodeForm node={node} />;
    case 'approval': return <ApprovalNodeForm node={node} />;
    case 'automated': return <AutomatedStepNodeForm node={node} />;
    case 'end': return <EndNodeForm node={node} />;
  }
}

export const NodeFormPanel: React.FC = () => {
  const { nodes, selectedNodeId, selectNode, deleteNode } = useWorkflowStore();
  const { nodeErrorMap } = useWorkflowValidation();

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-72 bg-surface border-l border-border flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-surface-2 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-400">Select a node</p>
        <p className="text-xs text-gray-600 mt-1">Click any node on the canvas to configure it</p>
      </aside>
    );
  }

  const typeInfo = NODE_TYPE_LABELS[selectedNode.data.type];
  const nodeError = nodeErrorMap.get(selectedNode.id);

  return (
    <aside className="w-72 bg-surface border-l border-border flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${typeInfo.color}`}>
            {typeInfo.label}
          </p>
          <p className="text-xs text-gray-600 font-mono mt-0.5">{selectedNode.id}</p>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-2 transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* Error banner */}
      {nodeError && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{nodeError}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {renderForm(selectedNode)}
      </div>

      <div className="border-t border-border p-3 flex-shrink-0">
        <Button
          variant="danger"
          size="sm"
          className="w-full justify-center"
          onClick={() => deleteNode(selectedNode.id)}
        >
          <Trash2 size={13} />
          Delete Node
        </Button>
      </div>
    </aside>
  );
};
