import React from 'react';
import { ArrowLeft, CheckCircle2, Circle, FileText, Loader2, Play, Volume2 } from 'lucide-react';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';

export function CourseDetailPage({
  activeLesson,
  activeLessonId,
  activeModule,
  activeModuleId,
  course,
  error,
  isSpeaking,
  lessonTab,
  notes,
  onBack,
  onLessonSelect,
  onNotesChange,
  onTabChange,
  onToggleAudio,
  onToggleComplete,
  progress,
}) {
  const lessons = course.modules?.flatMap((module) => module.lessons || []) || [];
  const completed = Object.values(progress).filter(Boolean).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="min-w-0">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft size={16} />
            Courses
          </Button>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">{course.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{course.description || course.subtitle}</p>
        </div>
        <div className="w-full rounded-lg border border-slate-200 bg-white p-4 sm:w-56 sm:shrink-0 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{completed}/{lessons.length} lessons</span>
            <span>{percent}%</span>
          </div>
          <ProgressBar value={percent} />
        </div>
      </div>

      <div className="sticky top-[117px] z-20 mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm xl:hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Module</span>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              onChange={(event) => {
                const nextModule = course.modules.find((module) => module.id === event.target.value);
                onLessonSelect(nextModule?.id, nextModule?.lessons?.[0]?.id);
              }}
              value={activeModuleId || ''}
            >
              {course.modules?.map((module) => (
                <option key={module.id} value={module.id}>{module.title}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Lesson</span>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              onChange={(event) => onLessonSelect(activeModule?.id, event.target.value)}
              value={activeLessonId || ''}
            >
              {activeModule?.lessons?.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="min-w-0 xl:grid xl:h-[calc(100vh-220px)] xl:min-h-[520px] xl:grid-cols-[360px_minmax(0,1fr)] xl:gap-6 xl:overflow-hidden">
        <Card className="hidden overflow-hidden xl:flex xl:h-full xl:min-h-0 xl:flex-col">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Course outline</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{course.modules?.length || 0} modules</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {course.modules?.map((module) => (
              <div className="mb-3" key={module.id}>
                <button
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    module.id === activeModuleId
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => onLessonSelect(module.id, module.lessons?.[0]?.id)}
                  type="button"
                >
                  {module.title}
                </button>
                {module.id === activeModuleId && (
                  <div className="mt-2 space-y-1 pl-2">
                    {module.lessons?.map((lesson) => {
                      const active = lesson.id === activeLessonId;
                      const done = progress[lesson.id];
                      return (
                        <button
                          className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                            active
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                          key={lesson.id}
                          onClick={() => onLessonSelect(module.id, lesson.id)}
                          type="button"
                        >
                          {lesson.contentStatus === 'loading' ? (
                            <Loader2 className="mt-0.5 shrink-0 animate-spin" size={15} />
                          ) : done ? (
                            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={15} />
                          ) : (
                            <Circle className="mt-0.5 shrink-0" size={15} />
                          )}
                          <span>{lesson.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-h-[620px] min-w-0 p-4 sm:p-5 xl:h-full xl:min-h-0 xl:overflow-y-auto">
          {activeLesson ? (
            <>
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge tone="indigo">{activeLesson.type || 'Lesson'}</Badge>
                    <Badge tone={activeLesson.contentStatus === 'ready' ? 'success' : 'warning'}>
                      {activeLesson.contentStatus === 'ready' ? 'Content ready' : 'Generating on open'}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">{activeLesson.title}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{activeModule?.title}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => onToggleAudio(activeLesson)} variant="secondary">
                    {isSpeaking ? <Volume2 size={16} /> : <Play size={16} />}
                    {isSpeaking ? 'Speaking' : 'Listen'}
                  </Button>
                  <Button onClick={() => onToggleComplete(course.id, activeLesson.id)} variant={progress[activeLesson.id] ? 'secondary' : 'primary'}>
                    <CheckCircle2 size={16} />
                    {progress[activeLesson.id] ? 'Completed' : 'Mark complete'}
                  </Button>
                </div>
              </div>

              <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
                {[
                  { id: 'content', label: 'Content', icon: BookIcon },
                  { id: 'notes', label: 'Notes', icon: FileText },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold ${
                        lessonTab === tab.id
                          ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      type="button"
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {lessonTab === 'notes' ? (
                <textarea
                  className="min-h-72 w-full rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  onChange={(event) => onNotesChange(activeLesson.id, event.target.value)}
                  placeholder="Write lesson notes..."
                  value={notes[activeLesson.id] || ''}
                />
              ) : (
                <LessonContent error={error} lesson={activeLesson} />
              )}
            </>
          ) : (
            <div className="flex min-h-96 items-center justify-center text-sm text-slate-500">Select a lesson to begin.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function LessonContent({ error, lesson }) {
  const content = lesson.content;
  const isLoading = lesson.contentStatus === 'loading';

  if (isLoading && !content) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{lesson.summary || lesson.covers}</p>
        <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm font-medium text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
          <Loader2 className="animate-spin" size={16} />
          Generating detailed lesson content...
        </div>
      </div>
    );
  }

  if (!content) {
    return <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{lesson.summary || lesson.covers}</p>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          AI lesson generation failed, so fallback content is shown. {error}
        </div>
      )}

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Overview</p>
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{content.overview}</p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Learning objectives</h3>
        <ul className="space-y-2">
          {(content.objectives || []).map((objective, index) => (
            <li className="flex gap-2 text-sm text-slate-700 dark:text-slate-300" key={index}>
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={16} />
              {objective}
            </li>
          ))}
        </ul>
      </section>

      {(content.sections || []).map((section, index) => (
        <section className="border-t border-slate-200 pt-6 dark:border-slate-800" key={index}>
          <h3 className="mb-2 text-base font-semibold text-slate-950 dark:text-white">{section.title}</h3>
          <p className="whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">{section.body}</p>
        </section>
      ))}

      {(content.examples || []).map((example, index) => (
        <section className="border-t border-slate-200 pt-6 dark:border-slate-800" key={index}>
          <h3 className="mb-2 text-base font-semibold text-slate-950 dark:text-white">{example.title || 'Example'}</h3>
          {example.code && (
            <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
              <code>{example.code}</code>
            </pre>
          )}
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{example.explanation}</p>
        </section>
      ))}

      {content.practiceTask && (
        <section className="rounded-lg border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950">
          <h3 className="mb-2 text-base font-semibold text-indigo-950 dark:text-indigo-100">{content.practiceTask.title || 'Practice task'}</h3>
          <p className="text-sm leading-7 text-indigo-900 dark:text-indigo-200">{content.practiceTask.instructions}</p>
          <ul className="mt-3 space-y-2">
            {(content.practiceTask.successCriteria || []).map((criterion, index) => (
              <li className="flex gap-2 text-sm text-indigo-900 dark:text-indigo-200" key={index}>
                <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
                {criterion}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(content.keyTakeaways || []).length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Key takeaways</h3>
          <div className="grid gap-2">
            {content.keyTakeaways.map((takeaway, index) => (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" key={index}>
                {takeaway}
              </div>
            ))}
          </div>
        </section>
      )}

      {(content.miniQuiz || []).length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Mini quiz</h3>
          <div className="space-y-3">
            {content.miniQuiz.map((item, index) => (
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800" key={index}>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.question}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BookIcon(props) {
  return <BookOpenIcon {...props} />;
}

function BookOpenIcon({ size = 16 }) {
  return (
    <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3z" />
      <path d="M21 18a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3z" />
    </svg>
  );
}
