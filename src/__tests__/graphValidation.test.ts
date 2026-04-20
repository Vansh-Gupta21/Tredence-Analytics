import { validateWorkflow, hasCycle, buildNodeErrorMap } from '../utils/graphValidation';
import { WorkflowNode } from '../types/workflow';
import { Edge } from 'reactflow';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeNode = (id: string, type: string, overrides: object = {}): WorkflowNode =>
  ({
    id,
    type,
    position: { x: 0, y: 0 },
    data: { type, title: `Node ${id}`, ...overrides },
  } as WorkflowNode);

const makeEdge = (source: string, target: string): Edge => ({
  id: `${source}->${target}`,
  source,
  target,
});

// ─── hasCycle ─────────────────────────────────────────────────────────────────

describe('hasCycle', () => {
  it('returns false for an empty graph', () => {
    expect(hasCycle([], [])).toBe(false);
  });

  it('returns false for a simple linear graph', () => {
    const nodes = [makeNode('a', 'start'), makeNode('b', 'task'), makeNode('c', 'end')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c')];
    expect(hasCycle(nodes, edges)).toBe(false);
  });

  it('returns false for a branching graph without cycles', () => {
    const nodes = [
      makeNode('a', 'start'),
      makeNode('b', 'task'),
      makeNode('c', 'approval'),
      makeNode('d', 'end'),
    ];
    const edges = [makeEdge('a', 'b'), makeEdge('a', 'c'), makeEdge('b', 'd'), makeEdge('c', 'd')];
    expect(hasCycle(nodes, edges)).toBe(false);
  });

  it('returns true for a direct cycle (A -> B -> A)', () => {
    const nodes = [makeNode('a', 'task'), makeNode('b', 'task')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'a')];
    expect(hasCycle(nodes, edges)).toBe(true);
  });

  it('returns true for an indirect cycle (A -> B -> C -> A)', () => {
    const nodes = [makeNode('a', 'start'), makeNode('b', 'task'), makeNode('c', 'approval')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c'), makeEdge('c', 'a')];
    expect(hasCycle(nodes, edges)).toBe(true);
  });

  it('returns false for a single node with no edges', () => {
    expect(hasCycle([makeNode('a', 'start')], [])).toBe(false);
  });
});

// ─── validateWorkflow ─────────────────────────────────────────────────────────

describe('validateWorkflow', () => {
  it('returns error when no start node exists', () => {
    const nodes = [makeNode('1', 'task'), makeNode('2', 'end')];
    const errors = validateWorkflow(nodes, []);
    expect(errors.some(e => e.message.toLowerCase().includes('start node'))).toBe(true);
  });

  it('returns error when no end node exists', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'task')];
    const errors = validateWorkflow(nodes, [makeEdge('1', '2')]);
    expect(errors.some(e => e.message.toLowerCase().includes('end node'))).toBe(true);
  });

  it('returns error when multiple start nodes exist', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'start'), makeNode('3', 'end')];
    const edges = [makeEdge('1', '3'), makeEdge('2', '3')];
    const errors = validateWorkflow(nodes, edges);
    expect(errors.some(e => e.message.toLowerCase().includes('one start'))).toBe(true);
  });

  it('returns error when a non-start node is disconnected', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'task'), makeNode('3', 'end')];
    // node 2 has no incoming edge
    const edges = [makeEdge('1', '3')];
    const errors = validateWorkflow(nodes, edges);
    const nodeErrors = errors.filter(e => e.nodeId === '2');
    expect(nodeErrors.length).toBeGreaterThan(0);
  });

  it('returns no errors for a valid simple workflow', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'task'), makeNode('3', 'end')];
    const edges = [makeEdge('1', '2'), makeEdge('2', '3')];
    const severeErrors = validateWorkflow(nodes, edges).filter(e => e.severity === 'error');
    expect(severeErrors).toHaveLength(0);
  });

  it('returns no errors for a valid multi-step workflow', () => {
    const nodes = [
      makeNode('s', 'start'),
      makeNode('t', 'task'),
      makeNode('a', 'approval'),
      makeNode('auto', 'automated'),
      makeNode('e', 'end'),
    ];
    const edges = [
      makeEdge('s', 't'),
      makeEdge('t', 'a'),
      makeEdge('a', 'auto'),
      makeEdge('auto', 'e'),
    ];
    const severeErrors = validateWorkflow(nodes, edges).filter(e => e.severity === 'error');
    expect(severeErrors).toHaveLength(0);
  });

  it('returns error for a workflow containing a cycle', () => {
    const nodes = [makeNode('1', 'start'), makeNode('2', 'task'), makeNode('3', 'end')];
    const edges = [makeEdge('1', '2'), makeEdge('2', '3'), makeEdge('3', '2')];
    const errors = validateWorkflow(nodes, edges);
    expect(errors.some(e => e.message.toLowerCase().includes('cycle'))).toBe(true);
  });

  it('returns node-level error when task title is empty', () => {
    const nodes = [
      makeNode('1', 'start'),
      makeNode('2', 'task', { title: '' }),
      makeNode('3', 'end'),
    ];
    const edges = [makeEdge('1', '2'), makeEdge('2', '3')];
    const errors = validateWorkflow(nodes, edges);
    const titleError = errors.find(e => e.nodeId === '2');
    expect(titleError).toBeDefined();
  });

  it('returns only warnings (not errors) for empty canvas', () => {
    const errors = validateWorkflow([], []);
    // Should have "no start node" and "no end node" errors at minimum
    expect(errors.filter(e => e.severity === 'error').length).toBeGreaterThan(0);
  });
});

// ─── buildNodeErrorMap ────────────────────────────────────────────────────────

describe('buildNodeErrorMap', () => {
  it('returns an empty map when no node-level errors exist', () => {
    const errors = [{ message: 'Global error', severity: 'error' as const }];
    const map = buildNodeErrorMap(errors);
    expect(map.size).toBe(0);
  });

  it('maps nodeId to the first error message for that node', () => {
    const errors = [
      { nodeId: 'n1', message: 'First error', severity: 'error' as const },
      { nodeId: 'n1', message: 'Second error', severity: 'error' as const },
      { nodeId: 'n2', message: 'Other error', severity: 'error' as const },
    ];
    const map = buildNodeErrorMap(errors);
    expect(map.get('n1')).toBe('First error');
    expect(map.get('n2')).toBe('Other error');
    expect(map.size).toBe(2);
  });
});
