import React from 'react';
import {
  PlayCircle,
  ClipboardList,
  CheckSquare,
  Zap,
  StopCircle,
  GitBranch,
} from 'lucide-react';
import { WorkflowNodeType } from '../../types/workflow';

interface NodeDefinition {
  type: WorkflowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
  borderClass: string;
}

const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <PlayCircle size={16} className="text-emerald-400" />,
    accentClass: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Human action step',
    icon: <ClipboardList size={16} className="text-blue-400" />,
    accentClass: 'bg-blue-500/10 hover:bg-blue-500/20',
    borderClass: 'border-blue-500/30 hover:border-blue-500/60',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Manager review step',
    icon: <CheckSquare size={16} className="text-amber-400" />,
    accentClass: 'bg-amber-500/10 hover:bg-amber-500/20',
    borderClass: 'border-amber-500/30 hover:border-amber-500/60',
  },
  {
    type: 'automated',
    label: 'Automated',
    description: 'System-triggered action',
    icon: <Zap size={16} className="text-violet-400" />,
    accentClass: 'bg-violet-500/10 hover:bg-violet-500/20',
    borderClass: 'border-violet-500/30 hover:border-violet-500/60',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: <StopCircle size={16} className="text-rose-400" />,
    accentClass: 'bg-rose-500/10 hover:bg-rose-500/20',
    borderClass: 'border-rose-500/30 hover:border-rose-500/60',
  },
];

export const Sidebar: React.FC = () => {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, nodeType: WorkflowNodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-52 bg-surface border-r border-border flex flex-col flex-shrink-0">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <GitBranch size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">HR Flow</p>
            <p className="text-xs text-gray-600 leading-none mt-0.5">Designer</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-1 mb-3">
          Nodes
        </p>

        {NODE_DEFINITIONS.map(def => (
          <div
            key={def.type}
            draggable
            onDragStart={e => onDragStart(e, def.type)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg border
              cursor-grab active:cursor-grabbing select-none
              transition-all duration-150
              ${def.accentClass} ${def.borderClass}
            `}
          >
            <span className="flex-shrink-0">{def.icon}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-200 leading-none">{def.label}</p>
              <p className="text-xs text-gray-500 leading-none mt-0.5 truncate">{def.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-border space-y-1">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">Shortcuts</p>
        {[
          ['Del / ⌫', 'Delete node'],
          ['Ctrl+Z', 'Undo'],
          ['Ctrl+Y', 'Redo'],
        ].map(([key, action]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{action}</span>
            <kbd className="text-xs bg-surface-2 border border-border rounded px-1.5 py-0.5 text-gray-400 font-mono">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </aside>
  );
};
