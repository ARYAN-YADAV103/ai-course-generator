export function normalizeCourseData(courseData = {}, context = {}) {
  const id = courseData.id || `course-${Date.now()}`;
  return {
    ...courseData,
    id,
    topic: courseData.topic || context.topic || courseData.title || 'General Knowledge',
    difficulty: courseData.difficulty || context.difficulty || 'Beginner',
    createdAt: courseData.createdAt || new Date().toISOString(),
    generationMode: courseData.generationMode || 'outline',
    modules: (courseData.modules || []).map((module, moduleIndex) => ({
      ...module,
      id: module.id || `m${moduleIndex + 1}`,
      lessons: (module.lessons || []).map((lesson, lessonIndex) => {
        const summary = lesson.summary || lesson.covers || 'Detailed content will be generated when this lesson is opened.';
        return {
          ...lesson,
          id: lesson.id || `m${moduleIndex + 1}-l${lessonIndex + 1}`,
          title: lesson.title || `Lesson ${lessonIndex + 1}`,
          summary,
          covers: lesson.covers || summary,
          duration: lesson.duration || '35 min',
          type: lesson.type || 'Lesson',
          contentStatus: lesson.content ? 'ready' : (lesson.contentStatus || 'pending'),
          content: lesson.content || null,
        };
      }),
    })),
  };
}

export function getCourseProgress(course, progress = {}) {
  if (!course?.id) return { completed: 0, total: 0, percent: 0 };
  const courseProgress = progress[course.id] || {};
  const total = (course.modules || []).reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  const completed = Object.values(courseProgress).filter(Boolean).length;
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
  };
}

export function getAnalytics(courses, progress, xp, streak) {
  const totals = courses.reduce(
    (acc, course) => {
      const courseProgress = getCourseProgress(course, progress);
      acc.completed += courseProgress.completed;
      acc.total += courseProgress.total;
      acc.chart.push({
        name: course.title?.slice(0, 18) || 'Course',
        progress: courseProgress.percent,
      });
      return acc;
    },
    { completed: 0, total: 0, chart: [] },
  );

  return {
    courses: courses.length,
    completedLessons: totals.completed,
    totalLessons: totals.total,
    completionRate: totals.total ? Math.round((totals.completed / totals.total) * 100) : 0,
    xp,
    streak: streak?.days || 0,
    chart: totals.chart,
    recentCourse: courses[0] || null,
  };
}

export function formatDate(value) {
  if (!value) return 'Not saved';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
