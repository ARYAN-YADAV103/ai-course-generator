import React from 'react';
import { ArrowRight, BookOpen, Loader2, Server, Sparkles } from 'lucide-react';
import { Button } from '../components/Button.jsx';
import { Card, CardHeader } from '../components/Card.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { suggestedTopics, generationSteps } from '../lib/constants.js';
import { formatDate } from '../lib/courseUtils.js';

export function CreateCoursePage({ backendStatus, courses, form, generationStep, isGenerating, onChange, onGenerate, onOpenCourse, stats }) {
  const recentCourses = courses.slice(0, 3);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section>
        <div className="mb-6">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Course creation</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create a course outline</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Generate a structured course outline first. Lesson content is created only when a lesson is opened.
          </p>
        </div>

        <Card>
          <CardHeader
            title="Course details"
            description="Choose the topic, level, and size of the outline."
            action={<StatusBadge status={backendStatus} />}
          />
          <div className="space-y-5 p-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Topic</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
                list="topic-suggestions"
                onChange={(event) => onChange('topic', event.target.value)}
                placeholder="Example: Next.js, Python, SQL"
                value={form.topic}
              />
              <datalist id="topic-suggestions">
                {suggestedTopics.map((topic) => <option key={topic} value={topic} />)}
              </datalist>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Course title optional</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
                onChange={(event) => onChange('customTitle', event.target.value)}
                placeholder="Leave blank to generate a title"
                value={form.customTitle}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Level</span>
                <select
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  onChange={(event) => onChange('difficulty', event.target.value)}
                  value={form.difficulty}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Modules</span>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  max="6"
                  min="1"
                  onChange={(event) => onChange('modulesCount', event.target.value)}
                  type="number"
                  value={form.modulesCount}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Lessons per module</span>
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  max="6"
                  min="1"
                  onChange={(event) => onChange('lessonsCount', event.target.value)}
                  type="number"
                  value={form.lessonsCount}
                />
              </label>
            </div>

            {isGenerating && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                  <Loader2 className="animate-spin" size={16} />
                  {generationSteps[Math.max(0, generationStep - 1)] || 'Creating outline'}
                </div>
                <ProgressBar value={(generationStep / generationSteps.length) * 100} />
              </div>
            )}

            <Button className="w-full sm:w-auto" disabled={isGenerating} onClick={onGenerate}>
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Create course outline
            </Button>
          </div>
        </Card>
      </section>

      <aside className="space-y-6">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Server size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Backend status</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{backendStatus.detail}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Courses" value={stats.courses} />
            <Stat label="Completed" value={stats.completedLessons} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent courses" description="Continue where you left off." />
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentCourses.length ? recentCourses.map((course) => (
              <button
                className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                key={course.id}
                onClick={() => onOpenCourse(course)}
                type="button"
              >
                <span className="mt-0.5 rounded-md bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <BookOpen size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-950 dark:text-white">{course.title}</span>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{formatDate(course.createdAt)}</span>
                </span>
                <ArrowRight className="mt-1 text-slate-400" size={16} />
              </button>
            )) : (
              <p className="p-4 text-sm text-slate-500 dark:text-slate-400">No saved courses yet.</p>
            )}
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
