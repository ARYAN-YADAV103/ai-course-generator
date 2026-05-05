import React from 'react';
import { BarChart3, BookOpen, Library, PlusCircle, Settings, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

const navItems = [
  { id: 'create', label: 'Create', icon: PlusCircle },
  { id: 'courses', label: 'Courses', icon: Library },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppShell({ activeView, backendStatus, children, coursesCount, onNavigate, stats, theme }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block dark:border-slate-800 dark:bg-slate-900">
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left" onClick={() => onNavigate('create')} type="button">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Sparkles size={20} />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">LearnIQ</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Course workspace</span>
          </span>
        </button>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id || (activeView === 'course' && item.id === 'courses');
            return (
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                key={item.id}
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen size={16} />
            {coursesCount} saved courses
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stats.completedLessons} lessons completed</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-64 dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">LearnIQ</p>
            <h1 className="text-base font-semibold text-slate-950 dark:text-white">AI Course Generator</h1>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <StatusBadge status={backendStatus} />
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>
        </div>
        <nav className="grid grid-cols-4 border-t border-slate-200 lg:hidden dark:border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id || (activeView === 'course' && item.id === 'courses');
            return (
              <button
                className={`flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium ${
                  active ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'
                }`}
                key={item.id}
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
