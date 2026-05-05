import React from 'react';
import { Award, BookOpen, CheckCircle2, Flame, Star } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader } from '../components/Card.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';

export function ProgressPage({ courses, getCourseProgress, stats }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Progress</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Track completed lessons, saved courses, and learning activity.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BookOpen} label="Courses" value={stats.courses} />
        <Metric icon={CheckCircle2} label="Lessons complete" value={stats.completedLessons} />
        <Metric icon={Star} label="XP" value={stats.xp} />
        <Metric icon={Flame} label="Study streak" value={`${stats.streak} days`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader title="Course progress" description="Completion percentage across saved courses." />
          <div className="h-80 p-5">
            {stats.chart.length ? (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={stats.chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Create a course to see progress.</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Saved courses" description={`${stats.completionRate}% overall completion`} />
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {courses.map((course) => {
              const courseProgress = getCourseProgress(course);
              return (
                <div className="p-4" key={course.id}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{course.title}</p>
                    <span className="text-xs text-slate-500">{courseProgress.percent}%</span>
                  </div>
                  <ProgressBar value={courseProgress.percent} />
                </div>
              );
            })}
            {!courses.length && <p className="p-4 text-sm text-slate-500 dark:text-slate-400">No courses yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Icon size={20} />
        </span>
      </div>
    </Card>
  );
}
