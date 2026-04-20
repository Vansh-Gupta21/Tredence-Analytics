import { apiClient } from './client';
import { WorkflowPayload, SimulationResult } from '../types/workflow';

export const postSimulate = (payload: WorkflowPayload): Promise<SimulationResult> =>
  apiClient.post<SimulationResult>('/simulate', payload);
