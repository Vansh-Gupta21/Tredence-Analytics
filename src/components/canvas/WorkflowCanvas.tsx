import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { nodeTypes } from '../nodes';
import { WorkflowNodeType } from '../../types/workflow';

export const WorkflowCanvas: React.FC = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
  } = useWorkflowStore();

  useKeyboardShortcuts();

  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow') as WorkflowNodeType;
      if (!type || !rfInstanceRef.current) return;

      const position = rfInstanceRef.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode(type, position);
    },
    [addNode]
  );

  return (
    <div className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        onInit={instance => { rfInstanceRef.current = instance; }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#2e3348"
        />
        <Controls />
        <MiniMap
          nodeColor={node => {
            const colorMap: Record<string, string> = {
              start: '#22c55e',
              task: '#3b82f6',
              approval: '#f59e0b',
              automated: '#a855f7',
              end: '#ef4444',
            };
            return colorMap[node.type ?? ''] ?? '#4a5568';
          }}
          maskColor="rgba(15, 17, 23, 0.7)"
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                  d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500">Drag nodes from the sidebar</p>
            <p className="text-xs text-gray-600 mt-1">to build your workflow</p>
          </div>
        </div>
      )}
    </div>
  );
};
