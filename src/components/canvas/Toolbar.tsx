import React, { useRef, useState } from 'react';
import {
  Play,
  Download,
  Upload,
  Undo2,
  Redo2,
  LayoutDashboard,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useWorkflowValidation } from '../../hooks/useWorkflowValidation';
import { getLayoutedElements } from '../../utils/autoLayout';
import { downloadWorkflowFile, importWorkflow } from '../../utils/workflowSerializer';
import { WorkflowNode } from '../../types/workflow';
import { Edge } from 'reactflow';
import { Button } from '../ui/Button';

interface ToolbarProps {
  onSimulate: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onSimulate }) => {
  const {
    nodes,
    edges,
    workflowName,
    setWorkflowName,
    setNodes,
    setEdges,
    clearWorkflow,
  } = useWorkflowStore();

  const { errors, isValid } = useWorkflowValidation();
  const errorCount = errors.filter(e => e.severity === 'error').length;

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(workflowName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUndo = () => useWorkflowStore.temporal.getState().undo();
  const handleRedo = () => useWorkflowStore.temporal.getState().redo();

  const handleAutoLayout = () => {
    if (nodes.length === 0) return;
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
    setNodes(ln as WorkflowNode[]);
    setEdges(le);
  };

  const handleExport = () => {
    downloadWorkflowFile(nodes, edges, workflowName);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const result = importWorkflow(ev.target?.result as string);
        setNodes(result.nodes);
        setEdges(result.edges as Edge[]);
        setWorkflowName(result.name);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to import workflow');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const commitName = () => {
    setWorkflowName(nameInput.trim() || 'Untitled Workflow');
    setEditingName(false);
  };

  return (
    <header className="h-12 bg-surface border-b border-border flex items-center px-3 gap-2 flex-shrink-0 z-10">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {editingName ? (
          <input
            autoFocus
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') setEditingName(false); }}
            className="bg-surface-2 border border-blue-500 rounded-md px-2 py-1 text-sm text-gray-200 focus:outline-none w-48"
          />
        ) : (
          <button
            onClick={() => { setEditingName(true); setNameInput(workflowName); }}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
          >
            {workflowName}
            <Edit3 size={11} className="text-gray-600 group-hover:text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-2">
        {nodes.length === 0 ? null : isValid ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 size={12} /> Valid
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <AlertTriangle size={12} /> {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="w-px h-5 bg-border" />

      <Button size="sm" variant="ghost" onClick={handleUndo} title="Undo (Ctrl+Z)">
        <Undo2 size={14} />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleRedo} title="Redo (Ctrl+Y)">
        <Redo2 size={14} />
      </Button>

      <div className="w-px h-5 bg-border" />

      <Button size="sm" variant="ghost" onClick={handleAutoLayout} title="Auto Layout">
        <LayoutDashboard size={14} />
        <span className="hidden sm:inline">Layout</span>
      </Button>
      <Button size="sm" variant="ghost" onClick={handleExport} title="Export JSON">
        <Download size={14} />
        <span className="hidden sm:inline">Export</span>
      </Button>
      <Button size="sm" variant="ghost" onClick={handleImportClick} title="Import JSON">
        <Upload size={14} />
        <span className="hidden sm:inline">Import</span>
      </Button>

      <div className="w-px h-5 bg-border" />

      <Button size="sm" variant="danger" onClick={clearWorkflow} title="Clear canvas">
        <Trash2 size={14} />
      </Button>

      <Button size="sm" variant="primary" onClick={onSimulate}>
        <Play size={13} />
        Simulate
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </header>
  );
};
