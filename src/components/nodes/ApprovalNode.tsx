import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CheckSquare } from 'lucide-react';
import { ApprovalNodeData } from '../../types/workflow';
import { BaseNode } from './BaseNode';

const ApprovalNode = ({ id, data, selected }: NodeProps<ApprovalNodeData>) => (
  <>
    <Handle type="target" position={Position.Top} />
    <BaseNode
      id={id}
      selected={selected}
      accentColor="border-amber-500"
      glowColor="shadow-amber-900/50"
      headerBg="bg-amber-500/10"
      icon={<CheckSquare size={13} className="text-amber-400" />}
      typeLabel="Approval"
      title={data.title}
      subtitle={`Role: ${data.approverRole}`}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export default memo(ApprovalNode);
