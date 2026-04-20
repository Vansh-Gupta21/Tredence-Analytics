import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkflowNode, TaskNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { Field, inputClass, textareaClass } from './shared/Field';
import { KeyValueEditor } from './shared/KeyValueEditor';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  assignee: z.string(),
  dueDate: z.string(),
  customFields: z.array(z.object({ id: z.string(), key: z.string(), value: z.string() })),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  node: WorkflowNode;
}

export const TaskNodeForm: React.FC<Props> = ({ node }) => {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data as TaskNodeData;

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      description: data.description,
      assignee: data.assignee,
      dueDate: data.dueDate,
      customFields: data.customFields,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const sub = watch(values => {
      updateNodeData(node.id, {
        title: values.title ?? '',
        description: values.description ?? '',
        assignee: values.assignee ?? '',
        dueDate: values.dueDate ?? '',
        customFields: values.customFields ?? [],
      });
    });
    return () => sub.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  const customFields = watch('customFields');

  return (
    <div className="space-y-4">
      <Field label="Title" required error={errors.title?.message}>
        <input
          {...register('title')}
          className={inputClass}
          placeholder="e.g. Collect Employee Documents"
          aria-label="Title"
        />
      </Field>

      <Field label="Description">
        <textarea
          {...register('description')}
          className={textareaClass}
          rows={3}
          placeholder="Describe what needs to be done..."
          aria-label="Description"
        />
      </Field>

      <Field label="Assignee">
        <input
          {...register('assignee')}
          className={inputClass}
          placeholder="e.g. HR Manager"
          aria-label="Assignee"
        />
      </Field>

      <Field label="Due Date">
        <input
          {...register('dueDate')}
          type="date"
          className={inputClass}
          aria-label="Due Date"
        />
      </Field>

      <KeyValueEditor
        label="Custom Fields"
        pairs={customFields ?? []}
        onChange={pairs => setValue('customFields', pairs, { shouldDirty: true })}
        keyPlaceholder="Field name"
        valuePlaceholder="Value"
      />
    </div>
  );
};
