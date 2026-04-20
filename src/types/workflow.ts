import { Node, Edge } from 'reactflow';

export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface StartNodeData {
  type: 'start';
  title: string;
  metadata: KeyValuePair[];
}

export interface TaskNodeData {
  type: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

export interface ApprovalNodeData {
  type: 'approval';
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedStepNodeData {
  type: 'automated';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

export interface EndNodeData {
  type: 'end';
  endMessage: string;
  summaryFlag: boolean;
}

// discriminated union — TS narrows automatically via the `type` field
export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;

export interface Automation {
  id: string;
  label: string;
  params: string[];
}

export type SimulationStepStatus = 'pending' | 'running' | 'success' | 'skipped' | 'error';

export interface SimulationStep {
  nodeId: string;
  nodeTitle: string;
  nodeType: WorkflowNodeType;
  status: SimulationStepStatus;
  message: string;
  duration: number;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  totalDuration: number;
}

export interface WorkflowPayload {
  nodes: WorkflowNode[];
  edges: Edge[];
}

export interface WorkflowJSON {
  version: '1.0';
  name: string;
  exportedAt: string;
  nodes: WorkflowNode[];
  edges: Edge[];
}

export interface ValidationError {
  nodeId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export function createDefaultNodeData(type: WorkflowNodeType): WorkflowNodeData {
  switch (type) {
    case 'start':
      return { type: 'start', title: 'Workflow Start', metadata: [] };
    case 'task':
      return {
        type: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      };
    case 'approval':
      return {
        type: 'approval',
        title: 'Approval Step',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
      };
    case 'automated':
      return {
        type: 'automated',
        title: 'Automated Step',
        actionId: '',
        actionParams: {},
      };
    case 'end':
      return { type: 'end', endMessage: 'Workflow completed successfully.', summaryFlag: true };
  }
}
