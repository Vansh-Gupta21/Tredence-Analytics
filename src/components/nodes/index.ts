import { NodeTypes } from 'reactflow';
import StartNode from './StartNode';
import TaskNode from './TaskNode';
import ApprovalNode from './ApprovalNode';
import AutomatedStepNode from './AutomatedStepNode';
import EndNode from './EndNode';

// IMPORTANT: This object must be defined outside any React component
// so React Flow doesn't re-create it on every render (causes flickering)
export const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedStepNode,
  end: EndNode,
};
