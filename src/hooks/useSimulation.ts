import { useState, useCallback } from 'react';
import { SimulationResult } from '../types/workflow';
import { postSimulate } from '../api/simulation';
import { useWorkflowStore } from './useWorkflowStore';

interface UseSimulationResult {
  result: SimulationResult | null;
  loading: boolean;
  error: string | null;
  run: () => Promise<void>;
  reset: () => void;
}

export function useSimulation(): UseSimulationResult {
  const { nodes, edges } = useWorkflowStore();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await postSimulate({ nodes, edges });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, [nodes, edges]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, run, reset };
}
