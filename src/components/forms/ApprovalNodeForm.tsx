import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkflowNode, ApprovalNodeData } from '../../types/workflow';
import { useWorkflowStore } from '../../hooks/useWorkflowStore';
import { Field, inputClass, selectClass } from './shared/Field';

const APPROVER_ROLES = ['Manager', 'HRBP', 'Director', 'VP', 'C-Suite', 'Legal'];

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  approverRole: z.string().min(1, 'Approver role is required'),
  autoApproveThreshold: z.coerce.number().min(0, 'Must be 0 or greater'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  node: WorkflowNode;
}

export const ApprovalNodeForm: React.FC<Props> = ({ node }) => {
  const updateNodeData = useWorkflowStore(s => s.updateNodeData);
  const data = node.data as ApprovalNodeData;

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: data.title,
      approverRole: data.approverRole,
      autoApproveThreshold: data.autoApproveThreshold,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const sub = watch(values => {
      updateNodeData(node.id, {
        title: values.title ?? '',
        approverRole: values.approverRole ?? '',
        autoApproveThreshold: values.autoApproveThreshold ?? 0,
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
          placeholder="e.g. Manager Approval"
        />
      </Field>

      <Field label="Approver Role" required error={errors.approverRole?.message}>
        <select {...register('approverRole')} className={selectClass}>
          {APPROVER_ROLES.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </Field>

      <Field
        label="Auto-Approve Threshold"
        error={errors.autoApproveThreshold?.message}
      >
        <input
          {...register('autoApproveThreshold')}
          type="number"
          min={0}
          className={inputClass}
          placeholder="0 = manual approval always"
        />
        <p className="text-xs text-gray-600">
          Set to 0 to always require manual approval. Any value above 0 will auto-approve when the threshold is met.
        </p>
      </Field>
    </div>
  );
};
