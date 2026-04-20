import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { KeyValuePair } from '../../../types/workflow';
import { inputClass } from './Field';

interface KeyValueEditorProps {
  label?: string;
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  label = 'Custom Fields',
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}) => {
  const addRow = () => {
    onChange([...pairs, { id: uid(), key: '', value: '' }]);
  };

  const removeRow = (id: string) => {
    onChange(pairs.filter(p => p.id !== id));
  };

  const updateRow = (id: string, field: 'key' | 'value', val: string) => {
    onChange(pairs.map(p => (p.id === id ? { ...p, [field]: val } : p)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      {pairs.length === 0 && (
        <p className="text-xs text-gray-600 italic py-1">No fields added yet.</p>
      )}

      {pairs.map(pair => (
        <div key={pair.id} className="flex gap-2 items-center">
          <input
            className={inputClass + ' flex-1'}
            placeholder={keyPlaceholder}
            value={pair.key}
            onChange={e => updateRow(pair.id, 'key', e.target.value)}
          />
          <input
            className={inputClass + ' flex-1'}
            placeholder={valuePlaceholder}
            value={pair.value}
            onChange={e => updateRow(pair.id, 'value', e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeRow(pair.id)}
            className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
