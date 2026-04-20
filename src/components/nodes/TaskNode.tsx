import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ClipboardList } from 'lucide-react';
import { TaskNodeData } from '../../types/workflow';
import { BaseNode } from './BaseNode';

const TaskNode = ({ id, data, selected }: NodeProps<TaskNodeData>) => (
  <>
    <Handle type="target" position={Position.Top} />
    <BaseNode
      id={id}
      selected={selected}
      accentColor="border-blue-500"
      glowColor="shadow-blue-900/50"
      headerBg="bg-blue-500/10"
      icon={<ClipboardList size={13} className="text-blue-400" />}
      typeLabel="Task"
      title={data.title}
      subtitle={data.assignee ? `👤 ${data.assignee}` : 'Unassigned'}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export default memo(TaskNode);
