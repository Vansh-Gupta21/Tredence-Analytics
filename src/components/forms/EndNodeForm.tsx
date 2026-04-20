import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkflowNode, EndNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { Field, textareaClass } from './shared/Field';

const schema = z.object({
  endMessage: z.string(),
  summaryFlag: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  node: WorkflowNode;
}

export const EndNodeForm: React.FC<Props> = ({ node }) => {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data as EndNodeData;

  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      endMessage: data.endMessage,
      summaryFlag: data.summaryFlag,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const sub = watch(values => {
      updateNodeData(node.id, {
        endMessage: values.endMessage ?? '',
        summaryFlag: values.summaryFlag ?? false,
      });
    });
    return () => sub.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  return (
    <div className="space-y-4">
      <Field label="Completion Message">
        <textarea
          {...register('endMessage')}
          className={textareaClass}
          rows={3}
          placeholder="e.g. Onboarding workflow completed successfully."
        />
      </Field>

      <div className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg border border-border">
        <div>
          <p className="text-sm text-gray-300 font-medium">Generate Summary</p>
          <p className="text-xs text-gray-500">Show a summary report at workflow completion</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            {...register('summaryFlag')}
            type="checkbox"
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-surface-2 border border-border peer-checked:bg-blue-600 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-gray-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
        </label>
      </div>
    </div>
  );
};
