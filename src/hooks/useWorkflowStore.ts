import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
} from 'reactflow';
import { WorkflowNodeData, WorkflowNode, createDefaultNodeData, WorkflowNodeType } from '../types/workflow';

let nodeCounter = 1;
export const generateNodeId = () => `node_${nodeCounter++}`;

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  workflowName: string;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (type: WorkflowNodeType, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void;

  selectNode: (id: string | null) => void;

  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setWorkflowName: (name: string) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      workflowName: 'Untitled Workflow',

      onNodesChange: (changes: NodeChange[]) =>
        set({ nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[] }),

      onEdgesChange: (changes: EdgeChange[]) =>
        set({ edges: applyEdgeChanges(changes, get().edges) }),

      onConnect: (connection: Connection) =>
        set({
          edges: addEdge(
            { ...connection, animated: true, style: { stroke: '#4a5568', strokeWidth: 2 } },
            get().edges
          ),
        }),

      addNode: (type: WorkflowNodeType, position: { x: number; y: number }) => {
        const id = generateNodeId();
        const newNode: WorkflowNode = {
          id,
          type,
          position,
          data: createDefaultNodeData(type),
        };
        set({ nodes: [...get().nodes, newNode] });
      },

      deleteNode: (id: string) => {
        set({
          nodes: get().nodes.filter(n => n.id !== id),
          edges: get().edges.filter(e => e.source !== id && e.target !== id),
          selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        });
      },

      updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => {
        set({
          nodes: get().nodes.map(n =>
            n.id === id
              ? { ...n, data: { ...n.data, ...data } as WorkflowNodeData }
              : n
          ),
        });
      },

      selectNode: (id: string | null) => set({ selectedNodeId: id }),

      setNodes: (nodes: WorkflowNode[]) => set({ nodes }),
      setEdges: (edges: Edge[]) => set({ edges }),
      setWorkflowName: (name: string) => set({ workflowName: name }),

      clearWorkflow: () =>
        set({ nodes: [], edges: [], selectedNodeId: null }),
    }),
    // only track nodes/edges in history, not selection or name
    {
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);

export const useTemporalStore = () => useWorkflowStore.temporal.getState();
