import React, { useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell.jsx';
import { Toast } from './components/Toast.jsx';
import { CreateCoursePage } from './pages/CreateCoursePage.jsx';
import { CoursesPage } from './pages/CoursesPage.jsx';
import { ProgressPage } from './pages/ProgressPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { CourseDetailPage } from './pages/CourseDetailPage.jsx';
import { generateCourseOutline, generateLessonContent } from './lib/api.js';
import { buildFallbackLessonContent, generateFallbackCourse } from './lib/fallback.js';
import { getAnalytics, getCourseProgress, normalizeCourseData } from './lib/courseUtils.js';
import { useBackendHealth } from './hooks/useBackendHealth.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

const initialForm = {
  topic: 'React Hooks',
  customTitle: '',
  difficulty: 'Beginner',
  modulesCount: 3,
  lessonsCount: 3,
};

export default function App() {
  const [activeView, setActiveView] = useState('create');
  const [courses, setCourses] = useLocalStorage('savedCourses', []);
  const [progress, setProgress] = useLocalStorage('courseProgress', {});
  const [notes, setNotes] = useLocalStorage('courseNotes', {});
  const [xp, setXp] = useLocalStorage('userXp', 0);
  const [streak, setStreak] = useLocalStorage('userStreak', { days: 0, lastLogin: null });
  const [courseHistory, setCourseHistory] = useLocalStorage('synthesisHistory', []);
  const [theme, setTheme] = useLocalStorage('userTheme', 'light');
  const [apiKey, setApiKey] = useLocalStorage('anthropicApiKey', '');
  const [form, setForm] = useState(initialForm);
  const [activeCourseId, setActiveCourseId] = useState(() => courses?.[0]?.id || null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [lessonTab, setLessonTab] = useState('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [lessonLoading, setLessonLoading] = useState({});
  const [lessonErrors, setLessonErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const backendStatus = useBackendHealth();

  const activeCourse = useMemo(
    () => courses.find((course) => course.id === activeCourseId) || courses[0] || null,
    [courses, activeCourseId],
  );

  const activeModule = useMemo(() => {
    if (!activeCourse?.modules?.length) return null;
    return activeCourse.modules.find((module) => module.id === activeModuleId) || activeCourse.modules[0];
  }, [activeCourse, activeModuleId]);

  const activeLesson = useMemo(() => {
    if (!activeModule?.lessons?.length) return null;
    return activeModule.lessons.find((lesson) => lesson.id === activeLessonId) || activeModule.lessons[0];
  }, [activeModule, activeLessonId]);

  const stats = useMemo(() => getAnalytics(courses, progress, xp, streak), [courses, progress, xp, streak]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (streak.lastLogin === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setStreak({
      days: streak.lastLogin === yesterday.toDateString() ? (streak.days || 0) + 1 : 1,
      lastLogin: today,
    });
  }, [setStreak, streak.days, streak.lastLogin]);

  useEffect(() => {
    if (!activeCourse?.modules?.length) return;
    const nextModule = activeCourse.modules.find((module) => module.id === activeModuleId) || activeCourse.modules[0];
    const nextLesson = nextModule.lessons?.find((lesson) => lesson.id === activeLessonId) || nextModule.lessons?.[0] || null;
    if (nextModule?.id !== activeModuleId) setActiveModuleId(nextModule.id);
    if (nextLesson?.id !== activeLessonId) setActiveLessonId(nextLesson?.id || null);
  }, [activeCourse, activeModuleId, activeLessonId]);

  useEffect(() => {
    if (!activeCourse || !activeModule || !activeLesson) return;
    if (activeLesson.content || activeLesson.contentStatus === 'loading') return;
    void loadLessonContent(activeCourse, activeModule, activeLesson);
  }, [activeCourse?.id, activeModule?.id, activeLesson?.id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3500);
  };

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateCourseLesson = (courseId, moduleId, lessonId, updater) => {
    setCourses((currentCourses) =>
      currentCourses.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          modules: (course.modules || []).map((module) => {
            if (module.id !== moduleId) return module;
            return {
              ...module,
              lessons: (module.lessons || []).map((lesson) =>
                lesson.id === lessonId ? updater(lesson, module, course) : lesson,
              ),
            };
          }),
        };
      }),
    );
  };

  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      showToast('Please enter a topic.', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    try {
      setGenerationStep(2);
      const response = await generateCourseOutline(form);
      setGenerationStep(3);
      const nextCourse = normalizeCourseData(response, form);
      if (!nextCourse.modules?.length) throw new Error('The API returned an empty course outline.');

      setGenerationStep(4);
      setCourses((current) => [nextCourse, ...current]);
      setCourseHistory((current) => [
        { topic: form.topic, status: 'Success', time: new Date().toISOString() },
        ...current,
      ].slice(0, 10));
      setActiveCourseId(nextCourse.id);
      setActiveModuleId(nextCourse.modules[0]?.id || null);
      setActiveLessonId(nextCourse.modules[0]?.lessons?.[0]?.id || null);
      setLessonTab('content');
      setActiveView('course');
      showToast('Course outline created.');
    } catch (error) {
      const fallback = normalizeCourseData(generateFallbackCourse(form), form);
      setCourses((current) => [fallback, ...current]);
      setActiveCourseId(fallback.id);
      setActiveModuleId(fallback.modules[0]?.id || null);
      setActiveLessonId(fallback.modules[0]?.lessons?.[0]?.id || null);
      setLessonTab('content');
      setActiveView('course');
      showToast(`Using fallback outline. ${error.message}`, 'warning');
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const loadLessonContent = async (course, module, lesson) => {
    const key = `${course.id}:${lesson.id}`;
    if (lessonLoading[key]) return;

    setLessonLoading((current) => ({ ...current, [key]: true }));
    setLessonErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    updateCourseLesson(course.id, module.id, lesson.id, (currentLesson) => ({
      ...currentLesson,
      contentStatus: 'loading',
    }));

    try {
      const content = await generateLessonContent({
        topic: course.topic,
        difficulty: course.difficulty,
        courseTitle: course.title,
        moduleTitle: module.title,
        moduleSummary: module.description,
        lessonTitle: lesson.title,
        lessonSummary: lesson.summary || lesson.covers,
      });
      updateCourseLesson(course.id, module.id, lesson.id, (currentLesson) => ({
        ...currentLesson,
        content,
        contentStatus: 'ready',
        covers: content.overview || currentLesson.summary || currentLesson.covers,
      }));
    } catch (error) {
      const fallbackContent = buildFallbackLessonContent(
        course.topic,
        course.difficulty,
        module.title,
        lesson.title,
        lesson.summary || lesson.covers,
      );
      updateCourseLesson(course.id, module.id, lesson.id, (currentLesson) => ({
        ...currentLesson,
        content: fallbackContent,
        contentStatus: 'ready',
        covers: fallbackContent.overview || currentLesson.summary || currentLesson.covers,
      }));
      setLessonErrors((current) => ({ ...current, [key]: error.message }));
      showToast('Lesson content fallback was used.', 'warning');
    } finally {
      setLessonLoading((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const openCourse = (course) => {
    setActiveCourseId(course.id);
    setActiveModuleId(course.modules?.[0]?.id || null);
    setActiveLessonId(course.modules?.[0]?.lessons?.[0]?.id || null);
    setLessonTab('content');
    setActiveView('course');
  };

  const deleteCourse = (courseId) => {
    setCourses((current) => current.filter((course) => course.id !== courseId));
    if (activeCourseId === courseId) {
      const nextCourse = courses.find((course) => course.id !== courseId);
      setActiveCourseId(nextCourse?.id || null);
      if (!nextCourse) setActiveView('create');
    }
    showToast('Course deleted.');
  };

  const toggleLessonComplete = (courseId, lessonId) => {
    setProgress((current) => {
      const courseProgress = current[courseId] || {};
      const isCompleted = !courseProgress[lessonId];
      if (isCompleted) {
        setXp((currentXp) => currentXp + 100);
        showToast('Lesson completed. +100 XP');
      }
      return {
        ...current,
        [courseId]: { ...courseProgress, [lessonId]: isCompleted },
      };
    });
  };

  const getLessonTextForAudio = (lesson) => {
    const content = lesson?.content;
    if (!content) return lesson?.summary || lesson?.covers || '';
    const sections = (content.sections || []).map((section) => `${section.title}. ${section.body}`).join(' ');
    return [content.overview, sections, ...(content.keyTakeaways || [])].filter(Boolean).join(' ');
  };

  const toggleAudio = (lesson) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(getLessonTextForAudio(lesson));
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ courses, progress, notes, xp, streak }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `learniq-progress-${new Date().toISOString().split('T')[0]}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Saved data exported.');
  };

  const clearData = () => {
    if (!window.confirm('Clear all saved courses, notes, and progress?')) return;
    localStorage.clear();
    window.location.reload();
  };

  const renderView = () => {
    if (activeView === 'courses') {
      return (
        <CoursesPage
          courses={courses}
          getCourseProgress={(course) => getCourseProgress(course, progress)}
          onCreate={() => setActiveView('create')}
          onDelete={deleteCourse}
          onOpen={openCourse}
        />
      );
    }

    if (activeView === 'progress') {
      return <ProgressPage courses={courses} stats={stats} getCourseProgress={(course) => getCourseProgress(course, progress)} />;
    }

    if (activeView === 'settings') {
      return (
        <SettingsPage
          apiKey={apiKey}
          backendStatus={backendStatus}
          onApiKeyChange={setApiKey}
          onClearData={clearData}
          onExportData={exportData}
          onThemeChange={setTheme}
          theme={theme}
        />
      );
    }

    if (activeView === 'course' && activeCourse) {
      return (
        <CourseDetailPage
          activeLesson={activeLesson}
          activeLessonId={activeLessonId}
          activeModule={activeModule}
          activeModuleId={activeModuleId}
          course={activeCourse}
          error={lessonErrors[`${activeCourse.id}:${activeLesson?.id}`]}
          isSpeaking={isSpeaking}
          lessonTab={lessonTab}
          notes={notes}
          onBack={() => setActiveView('courses')}
          onLessonSelect={(moduleId, lessonId) => {
            setActiveModuleId(moduleId);
            setActiveLessonId(lessonId);
            setLessonTab('content');
          }}
          onNotesChange={(lessonId, value) => setNotes((current) => ({ ...current, [lessonId]: value }))}
          onTabChange={setLessonTab}
          onToggleAudio={toggleAudio}
          onToggleComplete={toggleLessonComplete}
          progress={progress[activeCourse.id] || {}}
        />
      );
    }

    return (
      <CreateCoursePage
        backendStatus={backendStatus}
        courses={courses}
        form={form}
        generationStep={generationStep}
        isGenerating={isGenerating}
        onChange={updateForm}
        onGenerate={handleGenerate}
        onOpenCourse={openCourse}
        stats={stats}
      />
    );
  };

  return (
    <>
      <AppShell
        activeView={activeView}
        backendStatus={backendStatus}
        coursesCount={courses.length}
        onNavigate={setActiveView}
        stats={stats}
        theme={theme}
      >
        {renderView()}
      </AppShell>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
