import React, { useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useSimulation } from '../../hooks/useSimulation';
import { SimulationStep, WorkflowNodeType } from '../../types/workflow';
import { Button } from '../ui/Button';

const NODE_TYPE_COLORS: Record<WorkflowNodeType, string> = {
  start: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  task: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  approval: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  automated: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  end: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

const StepRow: React.FC<{ step: SimulationStep; index: number; isLast: boolean }> = ({
  step,
  index,
  isLast,
}) => {
  const colors = NODE_TYPE_COLORS[step.nodeType];

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
          <CheckCircle2 size={14} className="text-emerald-400" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-${isLast ? '0' : '4'}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 font-mono">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors}`}>
              {step.nodeType}
            </span>
            <span className="text-sm font-semibold text-gray-200">{step.nodeTitle}</span>
          </div>
          <span className="text-xs text-gray-600 flex-shrink-0 flex items-center gap-1">
            <Clock size={10} />
            {step.duration}ms
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">{step.message}</p>
      </div>
    </div>
  );
};

interface SimulationPanelProps {
  onClose: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ onClose }) => {
  const { result, loading, error, run, reset } = useSimulation();

  // Auto-run on mount
  useEffect(() => {
    run();
    return () => reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-fade-in">

        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Play size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-200">Workflow Simulation</p>
              {result && (
                <p className="text-xs text-gray-500">
                  {result.steps.length} step{result.steps.length !== 1 ? 's' : ''} ·{' '}
                  {result.totalDuration}ms total
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={run} loading={loading}>
              <Play size={13} />
              Re-run
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-surface-2 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={28} className="text-blue-400 animate-spin" />
              <p className="text-sm text-gray-400">Running simulation…</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <XCircle size={18} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {result && !result.success && !loading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Simulation failed — fix these issues:</p>
                </div>
              </div>
              <ul className="space-y-2 pl-2">
                {result.errors.map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result && result.success && !loading && (
            <div className="space-y-0">
              <div className="flex items-center gap-2 mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <p className="text-sm text-emerald-300 font-medium">
                  All {result.steps.length} steps completed successfully
                </p>
              </div>
              {result.steps.map((step, i) => (
                <StepRow
                  key={step.nodeId}
                  step={step}
                  index={i}
                  isLast={i === result.steps.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
