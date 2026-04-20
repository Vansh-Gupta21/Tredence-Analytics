import { http, HttpResponse } from 'msw';
import {
  Automation,
  WorkflowPayload,
  SimulationResult,
  SimulationStep,
  WorkflowNode,
} from '../types/workflow';
import { Edge } from 'reactflow';

const AUTOMATIONS: Automation[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create Ticket', params: ['system', 'priority', 'title'] },
  { id: 'update_hris', label: 'Update HRIS Record', params: ['employee_id', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['participants', 'duration', 'title'] },
];

function buildAdjacencyList(nodes: WorkflowNode[], edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => {
    const neighbors = adj.get(e.source) ?? [];
    neighbors.push(e.target);
    adj.set(e.source, neighbors);
  });
  return adj;
}

function bfsOrder(startId: string, adj: Map<string, string[]>): string[] {
  const visited = new Set<string>();
  const queue = [startId];
  const order: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    order.push(current);
    queue.push(...(adj.get(current) ?? []));
  }

  return order;
}

function getStepMessage(node: WorkflowNode): string {
  const d = node.data;
  switch (d.type) {
    case 'start':
      return `Workflow initiated: "${d.title}"`;
    case 'task':
      return `Task "${d.title}" assigned to ${d.assignee || 'Unassigned'}${d.dueDate ? ` (due ${d.dueDate})` : ''}`;
    case 'approval':
      return `Approval pending from ${d.approverRole}${d.autoApproveThreshold > 0 ? ` (auto-approves above ${d.autoApproveThreshold})` : ''}`;
    case 'automated': {
      const automation = AUTOMATIONS.find(a => a.id === d.actionId);
      return `Executing: ${(automation?.label ?? d.actionId) || 'No action configured'}`;
    }
    case 'end':
      return d.endMessage || 'Workflow completed';
  }
}

function getMockDuration(type: string): number {
  const durations: Record<string, number> = {
    start: 50,
    task: 800,
    approval: 1200,
    automated: 600,
    end: 100,
  };
  return durations[type] ?? 500;
}

export const handlers = [
  http.get('/automations', () => {
    return HttpResponse.json(AUTOMATIONS);
  }),

  http.post('/simulate', async ({ request }) => {
    const payload = await request.json() as WorkflowPayload;
    const { nodes, edges } = payload;

    const errors: string[] = [];
    const startNodes = nodes.filter(n => n.data.type === 'start');
    const endNodes = nodes.filter(n => n.data.type === 'end');

    if (startNodes.length === 0) errors.push('Workflow must have at least one Start node.');
    if (startNodes.length > 1) errors.push('Workflow must have exactly one Start node.');
    if (endNodes.length === 0) errors.push('Workflow must have at least one End node.');

    nodes.forEach(node => {
      if (node.data.type === 'start') return;
      const hasIncoming = edges.some(e => e.target === node.id);
      if (!hasIncoming) {
        const title = 'title' in node.data ? node.data.title : node.data.type;
        errors.push(`Node "${title}" has no incoming connection.`);
      }
    });

    if (errors.length > 0) {
      const result: SimulationResult = {
        success: false,
        steps: [],
        errors,
        totalDuration: 0,
      };
      return HttpResponse.json(result);
    }

    const startNode = startNodes[0];
    const adj = buildAdjacencyList(nodes, edges);
    const order = bfsOrder(startNode.id, adj);
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    const steps: SimulationStep[] = order.map(nodeId => {
      const node = nodeMap.get(nodeId)!;
      const duration = getMockDuration(node.data.type);
      return {
        nodeId,
        nodeTitle: 'title' in node.data ? node.data.title : node.data.type,
        nodeType: node.data.type,
        status: 'success',
        message: getStepMessage(node),
        duration,
      };
    });

    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);

    const result: SimulationResult = {
      success: true,
      steps,
      errors: [],
      totalDuration,
    };

    return HttpResponse.json(result);
  }),
];
