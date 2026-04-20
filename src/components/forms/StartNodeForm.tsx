import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkflowNode, StartNodeData, KeyValuePair } from '../../types/workflow';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { Field, inputClass } from './shared/Field';
import { KeyValueEditor } from './shared/KeyValueEditor';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  metadata: z.array(z.object({ id: z.string(), key: z.string(), value: z.string() })),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  node: WorkflowNode;
}

export const StartNodeForm: React.FC<Props> = ({ node }) => {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data as StartNodeData;

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: data.title, metadata: data.metadata },
    mode: 'onChange',
  });

  // Auto-save every change to the store
  useEffect(() => {
    const sub = watch(values => {
      updateNodeData(node.id, {
        title: values.title ?? '',
        metadata: (values.metadata as KeyValuePair[]) ?? [],
      });
    });
    return () => sub.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  const metadata = watch('metadata');

  return (
    <div className="space-y-4">
      <Field label="Title" required error={errors.title?.message}>
        <input
          {...register('title')}
          className={inputClass}
          placeholder="e.g. Employee Onboarding Start"
        />
      </Field>

      <KeyValueEditor
        label="Metadata"
        pairs={metadata ?? []}
        onChange={pairs => setValue('metadata', pairs, { shouldDirty: true })}
        keyPlaceholder="e.g. department"
        valuePlaceholder="e.g. Engineering"
      />
    </div>
  );
};
