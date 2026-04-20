import { useState, useEffect } from 'react';
import { Automation } from '../types/workflow';
import { getAutomations } from '../api/automations';

interface UseAutomationsResult {
  automations: Automation[];
  loading: boolean;
  error: string | null;
}

export function useAutomations(): UseAutomationsResult {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getAutomations()
      .then(data => {
        if (!cancelled) {
          setAutomations(data);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { automations, loading, error };
}
