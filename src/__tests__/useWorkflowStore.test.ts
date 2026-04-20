import { act } from 'react';
import { useWorkflowStore } from '../hooks/useWorkflowStore';
import { WorkflowNode } from '../types/workflow';

// Helper to reset Zustand store between tests
const resetStore = () => {
  act(() => {
    useWorkflowStore.getState().clearWorkflow();
  });
};

const makeNode = (id: string, type: string): WorkflowNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { type: type as any, title: `Node ${id}` } as any,
});

describe('useWorkflowStore', () => {
  beforeEach(resetStore);

  // ── addNode ──────────────────────────────────────────────────────────────

  describe('addNode', () => {
    it('adds a node of the given type to the canvas', () => {
      act(() => {
        useWorkflowStore.getState().addNode('start', { x: 0, y: 0 });
      });
      const { nodes } = useWorkflowStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].data.type).toBe('start');
    });

    it('generates unique IDs for multiple nodes', () => {
      act(() => {
        useWorkflowStore.getState().addNode('task', { x: 0, y: 0 });
        useWorkflowStore.getState().addNode('task', { x: 100, y: 0 });
      });
      const { nodes } = useWorkflowStore.getState();
      const ids = nodes.map(n => n.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('positions node at the given coordinates', () => {
      act(() => {
        useWorkflowStore.getState().addNode('end', { x: 250, y: 400 });
      });
      const { nodes } = useWorkflowStore.getState();
      expect(nodes[0].position).toEqual({ x: 250, y: 400 });
    });
  });

  // ── deleteNode ───────────────────────────────────────────────────────────

  describe('deleteNode', () => {
    it('removes the node with the given ID', () => {
      act(() => {
        useWorkflowStore.getState().setNodes([makeNode('n1', 'task'), makeNode('n2', 'end')]);
      });
      act(() => {
        useWorkflowStore.getState().deleteNode('n1');
      });
      const { nodes } = useWorkflowStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('n2');
    });

    it('removes all edges connected to the deleted node', () => {
      act(() => {
        useWorkflowStore.getState().setNodes([makeNode('a', 'start'), makeNode('b', 'end')]);
        useWorkflowStore.getState().setEdges([{ id: 'e1', source: 'a', target: 'b' }]);
      });
      act(() => {
        useWorkflowStore.getState().deleteNode('a');
      });
      expect(useWorkflowStore.getState().edges).toHaveLength(0);
    });

    it('clears selectedNodeId if deleted node was selected', () => {
      act(() => {
        useWorkflowStore.getState().setNodes([makeNode('n1', 'task')]);
        useWorkflowStore.getState().selectNode('n1');
      });
      act(() => {
        useWorkflowStore.getState().deleteNode('n1');
      });
      expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
    });
  });

  // ── updateNodeData ───────────────────────────────────────────────────────

  describe('updateNodeData', () => {
    it('updates data fields on the correct node', () => {
      act(() => {
        useWorkflowStore.getState().setNodes([makeNode('n1', 'task')]);
      });
      act(() => {
        useWorkflowStore.getState().updateNodeData('n1', { title: 'Updated Title' } as any);
      });
      const node = useWorkflowStore.getState().nodes.find(n => n.id === 'n1');
      expect((node?.data as any).title).toBe('Updated Title');
    });

    it('does not affect other nodes', () => {
      act(() => {
        useWorkflowStore.getState().setNodes([makeNode('n1', 'task'), makeNode('n2', 'end')]);
      });
      act(() => {
        useWorkflowStore.getState().updateNodeData('n1', { title: 'Changed' } as any);
      });
      const n2 = useWorkflowStore.getState().nodes.find(n => n.id === 'n2');
      expect((n2?.data as any).title).toBe('Node n2');
    });
  });

  // ── selectNode ───────────────────────────────────────────────────────────

  describe('selectNode', () => {
    it('sets selectedNodeId', () => {
      act(() => {
        useWorkflowStore.getState().selectNode('n1');
      });
      expect(useWorkflowStore.getState().selectedNodeId).toBe('n1');
    });

    it('clears selectedNodeId when null is passed', () => {
      act(() => {
        useWorkflowStore.getState().selectNode('n1');
        useWorkflowStore.getState().selectNode(null);
      });
      expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
    });
  });

  // ── clearWorkflow ────────────────────────────────────────────────────────

  describe('clearWorkflow', () => {
    it('removes all nodes and edges', () => {
      act(() => {
        useWorkflowStore.getState().setNodes([makeNode('n1', 'start')]);
        useWorkflowStore.getState().setEdges([{ id: 'e1', source: 'n1', target: 'n2' }]);
      });
      act(() => {
        useWorkflowStore.getState().clearWorkflow();
      });
      const { nodes, edges } = useWorkflowStore.getState();
      expect(nodes).toHaveLength(0);
      expect(edges).toHaveLength(0);
    });
  });

  // ── setWorkflowName ──────────────────────────────────────────────────────

  describe('setWorkflowName', () => {
    it('updates the workflow name', () => {
      act(() => {
        useWorkflowStore.getState().setWorkflowName('Employee Onboarding');
      });
      expect(useWorkflowStore.getState().workflowName).toBe('Employee Onboarding');
    });
  });
});
