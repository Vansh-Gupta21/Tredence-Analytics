import { Edge } from 'reactflow';
import { WorkflowNode, ValidationError } from '../types/workflow';

export function hasCycle(nodes: WorkflowNode[], edges: Edge[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = edges
      .filter(e => e.source === nodeId)
      .map(e => e.target);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
      if (recursionStack.has(neighbor)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) return true;
  }

  return false;
}

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  const startNodes = nodes.filter(n => n.data.type === 'start');
  if (startNodes.length === 0) {
    errors.push({ message: 'Workflow must have a Start node', severity: 'error' });
  } else if (startNodes.length > 1) {
    errors.push({ message: 'Only one Start node is allowed', severity: 'error' });
  }

  const endNodes = nodes.filter(n => n.data.type === 'end');
  if (endNodes.length === 0) {
    errors.push({ message: 'Workflow must have an End node', severity: 'error' });
  }

  if (hasCycle(nodes, edges)) {
    errors.push({ message: 'Workflow contains a cycle — remove the circular connection', severity: 'error' });
  }

  nodes.forEach(node => {
    if (node.data.type === 'start') return;
    const hasIncoming = edges.some(e => e.target === node.id);
    if (!hasIncoming) {
      const title = 'title' in node.data ? node.data.title : node.data.type;
      errors.push({
        nodeId: node.id,
        message: `"${title}" has no incoming connection`,
        severity: 'error',
      });
    }
  });

  startNodes.forEach(start => {
    const hasOutgoing = edges.some(e => e.source === start.id);
    if (!hasOutgoing && nodes.length > 1) {
      errors.push({
        nodeId: start.id,
        message: 'Start node has no outgoing connection',
        severity: 'warning',
      });
    }
  });

  nodes.forEach(node => {
    if (node.data.type === 'task' && !node.data.title.trim()) {
      errors.push({
        nodeId: node.id,
        message: 'Task node requires a title',
        severity: 'error',
      });
    }
  });

  return errors;
}

// returns a map of nodeId -> first error message for that node
export function buildNodeErrorMap(errors: ValidationError[]): Map<string, string> {
  const map = new Map<string, string>();
  errors.forEach(err => {
    if (err.nodeId && !map.has(err.nodeId)) {
      map.set(err.nodeId, err.message);
    }
  });
  return map;
}
