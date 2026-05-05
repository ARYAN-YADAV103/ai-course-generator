import React from 'react';

export function ProgressBar({ value }) {
  const width = `${Math.min(100, Math.max(0, value || 0))}%`;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width }} />
    </div>
  );
}
