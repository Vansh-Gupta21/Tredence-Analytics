import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { AutomatedStepNodeData } from '../../types/workflow';
import { BaseNode } from './BaseNode';

const AutomatedStepNode = ({ id, data, selected }: NodeProps<AutomatedStepNodeData>) => (
  <>
    <Handle type="target" position={Position.Top} />
    <BaseNode
      id={id}
      selected={selected}
      accentColor="border-violet-500"
      glowColor="shadow-violet-900/50"
      headerBg="bg-violet-500/10"
      icon={<Zap size={13} className="text-violet-400" />}
      typeLabel="Automated"
      title={data.title}
      subtitle={data.actionId ? `⚡ ${data.actionId.replace(/_/g, ' ')}` : 'No action selected'}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export default memo(AutomatedStepNode);
