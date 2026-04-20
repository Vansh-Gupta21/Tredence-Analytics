import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayCircle } from 'lucide-react';
import { StartNodeData } from '../../types/workflow';
import { BaseNode } from './BaseNode';

const StartNode = ({ id, data, selected }: NodeProps<StartNodeData>) => (
  <>
    <BaseNode
      id={id}
      selected={selected}
      accentColor="border-emerald-500"
      glowColor="shadow-emerald-900/50"
      headerBg="bg-emerald-500/10"
      icon={<PlayCircle size={13} className="text-emerald-400" />}
      typeLabel="Start"
      title={data.title}
      subtitle={data.metadata.length > 0 ? `${data.metadata.length} metadata field(s)` : undefined}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export default memo(StartNode);
