import { Edge } from 'reactflow';
import { WorkflowNode, WorkflowJSON } from '../types/workflow';

export function exportWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
  name = 'My Workflow'
): string {
  const payload: WorkflowJSON = {
    version: '1.0',
    name,
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
  };
  return JSON.stringify(payload, null, 2);
}

export function importWorkflow(json: string): WorkflowJSON {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid JSON — could not parse file.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid workflow file format.');
  }

  const workflow = parsed as Record<string, unknown>;

  if (workflow['version'] !== '1.0') {
    throw new Error(`Unsupported workflow version: ${workflow['version']}`);
  }

  if (!Array.isArray(workflow['nodes']) || !Array.isArray(workflow['edges'])) {
    throw new Error('Workflow file must contain nodes and edges arrays.');
  }

  return workflow as unknown as WorkflowJSON;
}

export function downloadWorkflowFile(
  nodes: WorkflowNode[],
  edges: Edge[],
  name = 'My Workflow'
): void {
  const json = exportWorkflow(nodes, edges, name);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `workflow-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
