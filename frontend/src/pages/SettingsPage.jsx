import React, { useState } from 'react';
import { Download, KeyRound, Moon, Server, Sun, Trash2 } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card, CardHeader } from '../components/Card.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function SettingsPage({ apiKey, backendStatus, onApiKeyChange, onClearData, onExportData, onThemeChange, theme }) {
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || '');

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Manage appearance, backend status, and saved browser data.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Backend" description="The frontend talks to the configured Flask API." action={<StatusBadge status={backendStatus} />} />
          <div className="flex items-center gap-3 p-5">
            <span className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Server size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{backendStatus.detail}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{backendStatus.engine || 'No engine details available'}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Appearance" description="Use a simple light or dark workspace theme." />
          <div className="flex flex-wrap gap-3 p-5">
            <Button onClick={() => onThemeChange('light')} variant={theme === 'light' ? 'primary' : 'secondary'}>
              <Sun size={16} />
              Light
            </Button>
            <Button onClick={() => onThemeChange('dark')} variant={theme === 'dark' ? 'primary' : 'secondary'}>
              <Moon size={16} />
              Dark
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Optional API key" description="Kept for compatibility with existing saved settings. The current backend still uses g4f." />
          <div className="space-y-4 p-5">
            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <KeyRound size={16} />
                Saved key
              </span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                onChange={(event) => setApiKeyInput(event.target.value)}
                placeholder="Optional"
                type="password"
                value={apiKeyInput}
              />
            </label>
            <Button onClick={() => onApiKeyChange(apiKeyInput)}>Save key</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Saved data" description="Export or clear locally stored courses, progress, and notes." />
          <div className="flex flex-wrap gap-3 p-5">
            <Button onClick={onExportData} variant="secondary">
              <Download size={16} />
              Export data
            </Button>
            <Button onClick={onClearData} variant="danger">
              <Trash2 size={16} />
              Clear saved data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
