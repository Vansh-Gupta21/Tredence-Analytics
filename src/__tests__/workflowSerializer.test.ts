import { exportWorkflow, importWorkflow } from '../utils/workflowSerializer';
import { WorkflowNode } from '../types/workflow';
import { Edge } from 'reactflow';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleNodes: WorkflowNode[] = [
  {
    id: 'node_1',
    type: 'start',
    position: { x: 100, y: 100 },
    data: { type: 'start', title: 'Onboarding Start', metadata: [] },
  },
  {
    id: 'node_2',
    type: 'task',
    position: { x: 100, y: 250 },
    data: {
      type: 'task',
      title: 'Collect Documents',
      description: 'Ask new hire to upload ID and contract.',
      assignee: 'HR Admin',
      dueDate: '2025-01-15',
      customFields: [{ id: 'cf1', key: 'priority', value: 'high' }],
    },
  },
  {
    id: 'node_3',
    type: 'end',
    position: { x: 100, y: 400 },
    data: { type: 'end', endMessage: 'Done!', summaryFlag: true },
  },
];

const sampleEdges: Edge[] = [
  { id: 'e1', source: 'node_1', target: 'node_2' },
  { id: 'e2', source: 'node_2', target: 'node_3' },
];

// ─── exportWorkflow ───────────────────────────────────────────────────────────

describe('exportWorkflow', () => {
  it('returns a valid JSON string', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('includes the correct version field', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe('1.0');
  });

  it('includes the workflow name', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges, 'My Test Workflow');
    const parsed = JSON.parse(json);
    expect(parsed.name).toBe('My Test Workflow');
  });

  it('uses default name when none provided', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    const parsed = JSON.parse(json);
    expect(parsed.name).toBe('My Workflow');
  });

  it('includes exportedAt ISO timestamp', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    const parsed = JSON.parse(json);
    expect(new Date(parsed.exportedAt).toString()).not.toBe('Invalid Date');
  });

  it('serializes all nodes correctly', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    const parsed = JSON.parse(json);
    expect(parsed.nodes).toHaveLength(3);
    expect(parsed.nodes[0].id).toBe('node_1');
    expect(parsed.nodes[1].data.type).toBe('task');
  });

  it('serializes all edges correctly', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    const parsed = JSON.parse(json);
    expect(parsed.edges).toHaveLength(2);
    expect(parsed.edges[0].source).toBe('node_1');
  });
});

// ─── importWorkflow ───────────────────────────────────────────────────────────

describe('importWorkflow', () => {
  it('successfully parses a valid exported workflow', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges, 'Round Trip');
    const result = importWorkflow(json);
    expect(result.name).toBe('Round Trip');
    expect(result.nodes).toHaveLength(3);
    expect(result.edges).toHaveLength(2);
  });

  it('round-trips nodes without data loss', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    const result = importWorkflow(json);
    expect(result.nodes).toEqual(sampleNodes);
  });

  it('round-trips edges without data loss', () => {
    const json = exportWorkflow(sampleNodes, sampleEdges);
    const result = importWorkflow(json);
    expect(result.edges).toEqual(sampleEdges);
  });

  it('throws on invalid JSON string', () => {
    expect(() => importWorkflow('not { valid json')).toThrow('Invalid JSON');
  });

  it('throws on unsupported version', () => {
    const bad = JSON.stringify({ version: '2.0', name: 'x', nodes: [], edges: [] });
    expect(() => importWorkflow(bad)).toThrow('Unsupported workflow version');
  });

  it('throws when nodes array is missing', () => {
    const bad = JSON.stringify({ version: '1.0', name: 'x', edges: [] });
    expect(() => importWorkflow(bad)).toThrow();
  });

  it('throws when edges array is missing', () => {
    const bad = JSON.stringify({ version: '1.0', name: 'x', nodes: [] });
    expect(() => importWorkflow(bad)).toThrow();
  });

  it('throws for completely non-object JSON', () => {
    expect(() => importWorkflow('"just a string"')).toThrow('Invalid workflow file format');
  });
});
