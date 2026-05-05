import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export function Toast({ onClose, toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  const tone = isError
    ? 'border-red-200 bg-red-50 text-red-800'
    : isWarning
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800';
  const Icon = isError || isWarning ? AlertCircle : CheckCircle;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg ${tone}`}>
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p className="text-sm font-medium">{toast.message}</p>
      <button className="ml-2 rounded p-1 hover:bg-black/5" onClick={onClose} type="button">
        <X size={14} />
      </button>
    </div>
  );
}
