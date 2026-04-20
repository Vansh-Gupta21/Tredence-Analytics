import React from 'react';
import clsx from 'clsx';
import { useWorkflowValidation } from '../../hooks/useWorkflowValidation';

interface BaseNodeProps {
  id: string;
  selected: boolean;
  accentColor: string;
  glowColor: string;
  headerBg: string;
  icon: React.ReactNode;
  typeLabel: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  id,
  selected,
  accentColor,
  glowColor,
  headerBg,
  icon,
  typeLabel,
  title,
  subtitle,
  children,
}) => {
  const { nodeErrorMap } = useWorkflowValidation();
  const error = nodeErrorMap.get(id);

  return (
    <div
      className={clsx(
        'relative bg-surface border rounded-xl min-w-[190px] max-w-[220px]',
        'transition-all duration-200 cursor-pointer',
        error ? 'border-red-500/70' : selected ? accentColor : 'border-border',
        selected && !error && `shadow-lg ${glowColor}`
      )}
    >
      <div className={clsx('absolute left-0 top-3 bottom-3 w-0.5 rounded-full', accentColor.replace('border-', 'bg-'))} />

      {error && (
        <div
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-10 shadow-lg"
          title={error}
        >
          <span className="text-white text-xs font-bold leading-none">!</span>
        </div>
      )}

      <div className={clsx('flex items-center gap-2 px-3 pt-3 pb-2 rounded-t-xl', headerBg)}>
        <span className="flex-shrink-0">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          {typeLabel}
        </span>
      </div>

      <div className="px-3 pb-3">
        <p className="text-sm font-semibold text-gray-200 truncate mt-1">{title || 'Untitled'}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>
        )}
        {children}
        {error && (
          <p className="text-xs text-red-400 mt-1.5 line-clamp-2">{error}</p>
        )}
      </div>
    </div>
  );
};
