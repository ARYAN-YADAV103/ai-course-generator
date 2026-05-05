const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function generateCourseOutline(payload) {
  const response = await fetch(apiUrl('/api/generate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: payload.topic,
      customTitle: payload.customTitle,
      difficulty: payload.difficulty,
      modulesCount: Number(payload.modulesCount),
      lessonsCount: Number(payload.lessonsCount),
    }),
  });

  if (!response.ok) {
    const error = await readError(response, 'Failed to create course outline.');
    throw new Error(error);
  }

  return response.json();
}

export async function generateLessonContent(payload) {
  const response = await fetch(apiUrl('/api/lessons/generate'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await readError(response, 'Failed to generate lesson content.');
    throw new Error(error);
  }

  return response.json();
}

async function readError(response, fallback) {
  try {
    const data = await response.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}
