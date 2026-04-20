import { apiClient } from './client';
import { Automation } from '../types/workflow';

export const getAutomations = (): Promise<Automation[]> =>
  apiClient.get<Automation[]>('/automations');
