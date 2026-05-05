import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { formatDate } from '../lib/courseUtils.js';

export function CoursesPage({ courses, getCourseProgress, onCreate, onDelete, onOpen }) {
  const [query, setQuery] = useState('');
  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return courses;
    return courses.filter((course) =>
      [course.title, course.topic, course.difficulty].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery),
    );
  }, [courses, query]);

  if (!courses.length) {
    return (
      <EmptyState
        actionLabel="Create course"
        description="Generated courses will appear here with their saved progress and lesson details."
        onAction={onCreate}
        title="No saved courses"
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Courses</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Open, search, and manage your saved course outlines.</p>
        </div>
        <Button onClick={onCreate}>Create course</Button>
      </div>

      <label className="mb-5 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <Search size={16} className="text-slate-400" />
        <input
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search courses"
          value={query}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map((course) => {
          const courseProgress = getCourseProgress(course);
          return (
            <Card className="flex flex-col p-5" key={course.id}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <BookOpen size={18} />
                </span>
                <Badge tone="indigo">{course.difficulty || 'Course'}</Badge>
              </div>
              <h2 className="line-clamp-2 text-lg font-semibold text-slate-950 dark:text-white">{course.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{course.description || course.subtitle}</p>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{courseProgress.completed}/{courseProgress.total} lessons</span>
                  <span>{courseProgress.percent}%</span>
                </div>
                <ProgressBar value={courseProgress.percent} />
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{formatDate(course.createdAt)}</span>
                <span>{course.modules?.length || 0} modules</span>
              </div>
              <div className="mt-5 flex gap-2">
                <Button className="flex-1" onClick={() => onOpen(course)}>Open</Button>
                <Button aria-label={`Delete ${course.title}`} onClick={() => onDelete(course.id)} variant="danger">
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
