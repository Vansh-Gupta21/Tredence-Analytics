import { useMemo } from 'react';
import { useWorkflowStore } from './useWorkflowStore';
import { validateWorkflow, buildNodeErrorMap } from '../utils/graphValidation';
import { ValidationError } from '../types/workflow';

interface UseWorkflowValidationResult {
  errors: ValidationError[];
  nodeErrorMap: Map<string, string>;
  isValid: boolean;
  globalErrors: ValidationError[];
}

export function useWorkflowValidation(): UseWorkflowValidationResult {
  const nodes = useWorkflowStore(s => s.nodes);
  const edges = useWorkflowStore(s => s.edges);

  return useMemo(() => {
    const errors = validateWorkflow(nodes, edges);
    const nodeErrorMap = buildNodeErrorMap(errors);
    const globalErrors = errors.filter(e => !e.nodeId);
    const isValid = errors.filter(e => e.severity === 'error').length === 0;

    return { errors, nodeErrorMap, isValid, globalErrors };
  }, [nodes, edges]);
}
