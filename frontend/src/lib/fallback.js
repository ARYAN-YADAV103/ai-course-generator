export function generateFallbackCourse(form) {
  const topic = form.topic || 'General Knowledge';
  const difficulty = form.difficulty || 'Beginner';
  const modulesCount = clampCount(form.modulesCount, 3);
  const lessonsCount = clampCount(form.lessonsCount, 3);

  const moduleTemplates = [
    'Introduction',
    'Fundamentals',
    'Applied Practice',
    'Project Work',
    'Review and Next Steps',
    'Advanced Practice',
  ];
  const lessonTemplates = ['Key Concepts', 'Guided Example', 'Practice Exercise', 'Common Mistakes', 'Review Checklist', 'Project Task'];

  return {
    id: `course-${Date.now()}`,
    title: form.customTitle || `${topic} Course`,
    subtitle: `A practical ${difficulty.toLowerCase()} learning path for ${topic}.`,
    description: 'This outline is available immediately. Detailed lesson content is generated when each lesson is opened.',
    duration: `${modulesCount * lessonsCount * 35} min`,
    skills: [topic, 'Practice', 'Problem Solving', 'Project Planning', 'Review'],
    difficulty,
    topic,
    createdAt: new Date().toISOString(),
    generationMode: 'outline',
    source: 'fallback',
    recommendedQueries: [`${topic} examples`, `${topic} best practices`],
    projectIdeas: [`Build a small ${topic} project`, `Create a ${topic} reference guide`],
    certificateCriteria: 'Complete each lesson and review the practice tasks.',
    modules: Array.from({ length: modulesCount }).map((_, moduleIndex) => ({
      id: `m${moduleIndex + 1}`,
      title: `${topic} ${moduleTemplates[moduleIndex % moduleTemplates.length]}`,
      description: `A focused module for building practical ${topic} understanding.`,
      duration: `${lessonsCount} lessons`,
      outcomes: [
        `Explain important ${topic} ideas clearly.`,
        `Apply ${topic} concepts in small exercises.`,
        'Review progress and identify next steps.',
      ],
      youtubeQueries: [`${topic} tutorial`, `${topic} ${difficulty} guide`],
      lessons: Array.from({ length: lessonsCount }).map((_, lessonIndex) => {
        const title = lessonTemplates[(moduleIndex + lessonIndex) % lessonTemplates.length];
        return {
          id: `m${moduleIndex + 1}-l${lessonIndex + 1}`,
          title,
          summary: `A focused ${difficulty.toLowerCase()} lesson on ${title} for ${topic}.`,
          covers: `A focused ${difficulty.toLowerCase()} lesson on ${title} for ${topic}.`,
          duration: '35 min',
          type: lessonIndex % 3 === 2 ? 'Practice' : 'Concept',
          contentStatus: 'pending',
          content: null,
        };
      }),
    })),
  };
}

export function buildFallbackLessonContent(topic, difficulty, moduleTitle, lessonTitle, summary) {
  return {
    contentStatus: 'ready',
    overview: `${lessonTitle} connects ${topic} concepts to a practical ${difficulty.toLowerCase()} workflow. ${summary || ''}`.trim(),
    objectives: [
      `Explain the purpose of ${lessonTitle}.`,
      `Apply the concept in a small ${topic} exercise.`,
      'Identify common mistakes and correct them.',
    ],
    sections: [
      {
        title: 'Core Idea',
        body: `This section places ${lessonTitle} inside ${moduleTitle}. Focus on the problem it solves and the terms learners should understand.`,
      },
      {
        title: 'How to Practice',
        body: `Start with a small ${topic} example, change one variable at a time, and explain what changed before moving to larger work.`,
      },
      {
        title: 'Common Pitfalls',
        body: 'Avoid memorizing labels without examples. Each idea should connect to a reason, a small demonstration, and a way to check your result.',
      },
    ],
    examples: [
      {
        title: 'Starter Example',
        code: `// ${topic}: ${lessonTitle}\nconst lesson = "${lessonTitle}";\nconsole.log(lesson);`,
        explanation: 'Use this as a small anchor example while practicing the lesson.',
      },
    ],
    practiceTask: {
      title: `Practice ${lessonTitle}`,
      instructions: `Create a short example that demonstrates ${lessonTitle} in a ${topic} scenario.`,
      successCriteria: ['The example runs without errors.', 'Each step can be explained clearly.', 'The output proves the main idea.'],
    },
    keyTakeaways: [
      `${lessonTitle} is easier to learn through small examples.`,
      `The practical goal is knowing when this idea matters in ${topic}.`,
      'Reviewing mistakes makes the next attempt faster.',
    ],
    miniQuiz: [
      {
        question: `What is the main goal of ${lessonTitle}?`,
        answer: 'To build understanding that can be applied in a real task.',
      },
    ],
    source: 'fallback',
  };
}

function clampCount(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(6, Math.max(1, parsed));
}
