import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkflowNode, AutomatedStepNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { useAutomations } from '../../hooks/useAutomations';
import { Field, inputClass, selectClass } from './shared/Field';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  actionId: z.string(),
  actionParams: z.record(z.string()),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  node: WorkflowNode;
}

export const AutomatedStepNodeForm: React.FC<Props> = ({ node }) => {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data as AutomatedStepNodeData;
  const { automations, loading, error } = useAutomations();

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      actionId: data.actionId,
      actionParams: data.actionParams,
    },
    mode: 'onChange',
  });

  const watchedActionId = watch('actionId');
  const watchedParams = watch('actionParams');

  const selectedAutomation = automations.find(a => a.id === watchedActionId);

  useEffect(() => {
    setValue('actionParams', {});
  }, [watchedActionId, setValue]);

  useEffect(() => {
    const sub = watch(values => {
      updateNodeData(node.id, {
        title: values.title ?? '',
        actionId: values.actionId ?? '',
        actionParams: values.actionParams ?? {},
      });
    });
    return () => sub.unsubscribe();
  }, [watch, node.id, updateNodeData]);

  return (
    <div className="space-y-4">
      <Field label="Title" required error={errors.title?.message}>
        <input
          {...register('title')}
          className={inputClass}
          placeholder="e.g. Send Welcome Email"
        />
      </Field>

      <Field label="Action">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Loading automations...
          </div>
        ) : error ? (
          <p className="text-red-400 text-xs">{error}</p>
        ) : (
          <select {...register('actionId')} className={selectClass}>
            <option value="">— Select an action —</option>
            {automations.map(a => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        )}
      </Field>

      {selectedAutomation && selectedAutomation.params.length > 0 && (
        <div className="space-y-3 pt-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Action Parameters
          </p>
          {selectedAutomation.params.map(param => (
            <Field key={param} label={param.replace(/_/g, ' ')}>
              <input
                className={inputClass}
                placeholder={`Enter ${param}`}
                value={watchedParams?.[param] ?? ''}
                onChange={e =>
                  setValue(
                    'actionParams',
                    { ...watchedParams, [param]: e.target.value },
                    { shouldDirty: true }
                  )
                }
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
};
