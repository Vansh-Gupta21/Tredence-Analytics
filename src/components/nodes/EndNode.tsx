import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { StopCircle } from 'lucide-react';
import { EndNodeData } from '../../types/workflow';
import { BaseNode } from './BaseNode';

const EndNode = ({ id, data, selected }: NodeProps<EndNodeData>) => (
  <>
    <Handle type="target" position={Position.Top} />
    <BaseNode
      id={id}
      selected={selected}
      accentColor="border-rose-500"
      glowColor="shadow-rose-900/50"
      headerBg="bg-rose-500/10"
      icon={<StopCircle size={13} className="text-rose-400" />}
      typeLabel="End"
      title="Workflow End"
      subtitle={data.summaryFlag ? '📋 Summary enabled' : undefined}
    />
  </>
);

export default memo(EndNode);
