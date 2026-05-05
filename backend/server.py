from flask import Flask, request, jsonify
from flask_cors import CORS
import g4f
import json
import re

app = Flask(__name__)
CORS(app)


def clamp_int(value, default, minimum, maximum):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = default
    return max(minimum, min(maximum, parsed))


def clean_topic(topic):
    safe_topic = (topic or "General Knowledge").strip()
    if "Other" in safe_topic:
        return safe_topic.split("(")[0].strip() if "(" in safe_topic else "Specialized Topic"
    return safe_topic


def ensure_list(value, fallback):
    return value if isinstance(value, list) and value else fallback


def extract_json(content):
    content = str(content or "").strip()
    json_match = re.search(r"(\{.*\}|\[.*\])", content, re.DOTALL)
    if json_match:
        content = json_match.group(1)
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return json.loads(content.replace("'", '"'))


def call_ai_json(prompt):
    response = g4f.ChatCompletion.create(
        model=g4f.models.gpt_4,
        messages=[{"role": "user", "content": prompt}],
    )
    return extract_json(response)


def fallback_course_outline(topic, custom_title, difficulty, modules_count, lessons_count):
    lesson_types = ["Concept", "Example", "Practice"]
    modules = []
    for m_idx in range(modules_count):
        module_title = f"{topic} Module {m_idx + 1}: Core Foundations"
        lessons = []
        for l_idx in range(lessons_count):
            lesson_title = f"{topic} Lesson {m_idx + 1}.{l_idx + 1}"
            summary = (
                f"Introduces a focused {difficulty.lower()}-level part of {topic}, "
                "with practical checkpoints and applied examples generated on demand."
            )
            lessons.append({
                "id": f"m{m_idx + 1}-l{l_idx + 1}",
                "title": lesson_title,
                "summary": summary,
                "covers": summary,
                "duration": "35 min",
                "type": lesson_types[l_idx % len(lesson_types)],
                "contentStatus": "pending",
                "content": None,
            })
        modules.append({
            "id": f"m{m_idx + 1}",
            "title": module_title,
            "description": f"A guided sequence for building usable knowledge of {topic}.",
            "duration": f"{max(1, lessons_count)} lessons",
            "outcomes": [
                f"Explain important {topic} concepts clearly.",
                f"Apply {topic} patterns in realistic exercises.",
                f"Evaluate common implementation tradeoffs in {topic}.",
            ],
            "youtubeQueries": [f"{topic} tutorial", f"{topic} {difficulty} guide"],
            "lessons": lessons,
        })
    return {
        "title": custom_title or f"{topic} Learning Path",
        "subtitle": f"A practical {difficulty} course outline for {topic}.",
        "description": (
            f"This course starts with a fast outline and generates detailed lesson material "
            f"only when needed. Learners build {topic} skills through examples, practice, "
            "and module-level outcomes."
        ),
        "duration": f"{modules_count * lessons_count * 35} min",
        "skills": [topic, "Applied Practice", "Problem Solving", "Project Planning", "Review"],
        "difficulty": difficulty,
        "modules": modules,
        "recommendedQueries": [f"{topic} best practices", f"{topic} examples"],
        "projectIdeas": [f"Build a small {topic} project", f"Create a {topic} reference guide"],
        "certificateCriteria": "Complete all lessons and pass module assessments with 80% or higher.",
        "generationMode": "outline",
        "source": "fallback",
    }


def normalize_course_outline(raw, topic, custom_title, difficulty, modules_count, lessons_count):
    fallback = fallback_course_outline(topic, custom_title, difficulty, modules_count, lessons_count)
    raw = raw if isinstance(raw, dict) else {}
    course = {**fallback, **raw}
    course["title"] = course.get("title") or fallback["title"]
    course["subtitle"] = course.get("subtitle") or fallback["subtitle"]
    course["description"] = course.get("description") or fallback["description"]
    course["skills"] = ensure_list(course.get("skills"), fallback["skills"])[:8]
    course["recommendedQueries"] = ensure_list(course.get("recommendedQueries"), fallback["recommendedQueries"])[:6]
    course["projectIdeas"] = ensure_list(course.get("projectIdeas"), fallback["projectIdeas"])[:6]
    course["difficulty"] = difficulty
    course["generationMode"] = "outline"
    course["source"] = raw.get("source", "ai")

    normalized_modules = []
    raw_modules = ensure_list(course.get("modules"), [])
    for m_idx in range(modules_count):
        fallback_module = fallback["modules"][m_idx]
        raw_module = raw_modules[m_idx] if m_idx < len(raw_modules) and isinstance(raw_modules[m_idx], dict) else {}
        module = {**fallback_module, **raw_module}
        module["id"] = f"m{m_idx + 1}"
        module["outcomes"] = ensure_list(module.get("outcomes"), fallback_module["outcomes"])[:5]
        module["youtubeQueries"] = ensure_list(module.get("youtubeQueries"), fallback_module["youtubeQueries"])[:4]

        normalized_lessons = []
        raw_lessons = ensure_list(module.get("lessons"), [])
        for l_idx in range(lessons_count):
            fallback_lesson = fallback_module["lessons"][l_idx]
            raw_lesson = raw_lessons[l_idx] if l_idx < len(raw_lessons) and isinstance(raw_lessons[l_idx], dict) else {}
            lesson = {**fallback_lesson, **raw_lesson}
            lesson["id"] = f"m{m_idx + 1}-l{l_idx + 1}"
            lesson["summary"] = lesson.get("summary") or lesson.get("covers") or fallback_lesson["summary"]
            lesson["covers"] = lesson["summary"]
            lesson["contentStatus"] = "ready" if lesson.get("content") else "pending"
            lesson.setdefault("content", None)
            normalized_lessons.append(lesson)
        module["lessons"] = normalized_lessons
        normalized_modules.append(module)

    course["modules"] = normalized_modules
    return course


def fallback_lesson_content(topic, difficulty, course_title, module_title, lesson_title, lesson_summary):
    summary = lesson_summary or f"This lesson develops practical understanding of {lesson_title}."
    return {
        "contentStatus": "ready",
        "overview": f"{lesson_title} connects {topic} fundamentals to a practical {difficulty.lower()} workflow. {summary}",
        "objectives": [
            f"Explain the purpose of {lesson_title}.",
            f"Apply the lesson concept in a small {topic} exercise.",
            "Identify common mistakes and choose a reasonable fix.",
        ],
        "sections": [
            {
                "title": "Core Concept",
                "body": f"Start by mapping the role of this lesson inside {module_title}. Focus on the problem it solves, the vocabulary it introduces, and the decision points a learner should recognize.",
            },
            {
                "title": "Practical Workflow",
                "body": f"Use a small {topic} example, change one variable at a time, and observe the output. This keeps the lesson concrete while still preparing learners for larger projects.",
            },
            {
                "title": "Common Pitfalls",
                "body": "Avoid memorizing isolated facts. Tie each rule to a reason, an example, and a quick check that proves the idea works.",
            },
        ],
        "examples": [
            {
                "title": "Starter Pattern",
                "code": f"// {topic}: {lesson_title}\n// Replace this with a concrete project-specific example.\nconst concept = \"{lesson_title}\";\nconsole.log(concept);",
                "explanation": "Use this starter pattern as a small, editable anchor while practicing the lesson.",
            }
        ],
        "practiceTask": {
            "title": f"Apply {lesson_title}",
            "instructions": f"Create a short example that demonstrates {lesson_title} in the context of {course_title}.",
            "successCriteria": [
                "The example runs without errors.",
                "The learner can explain each step.",
                "The output proves the core idea.",
            ],
        },
        "keyTakeaways": [
            f"{lesson_title} should be learned through use, not memorization.",
            f"The most important skill is knowing when this idea matters in {topic}.",
            "Small examples are the fastest way to make the concept stick.",
        ],
        "miniQuiz": [
            {
                "question": f"What is the main purpose of {lesson_title}?",
                "answer": "To build a practical understanding that can be applied in a real project.",
            }
        ],
        "source": "fallback",
    }


def normalize_lesson_content(raw, topic, difficulty, course_title, module_title, lesson_title, lesson_summary):
    fallback = fallback_lesson_content(topic, difficulty, course_title, module_title, lesson_title, lesson_summary)
    raw = raw if isinstance(raw, dict) else {}
    content = {**fallback, **raw}
    content["contentStatus"] = "ready"
    content["objectives"] = ensure_list(content.get("objectives"), fallback["objectives"])[:6]
    content["sections"] = ensure_list(content.get("sections"), fallback["sections"])[:6]
    content["examples"] = ensure_list(content.get("examples"), fallback["examples"])[:3]
    content["keyTakeaways"] = ensure_list(content.get("keyTakeaways"), fallback["keyTakeaways"])[:6]
    content["miniQuiz"] = ensure_list(content.get("miniQuiz"), fallback["miniQuiz"])[:5]
    practice = content.get("practiceTask")
    content["practiceTask"] = practice if isinstance(practice, dict) else fallback["practiceTask"]
    content["source"] = raw.get("source", "ai")
    return content


@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "AI Course Generator Backend is running!", "version": "1.1.0"}), 200


@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "connected", "engine": "g4f-gpt4", "mode": "progressive"}), 200


@app.route("/generate", methods=["POST"])
@app.route("/api/generate", methods=["POST"])
def generate_course():
    data = request.get_json(silent=True) or {}
    topic = clean_topic(data.get("topic", "General Knowledge"))
    custom_title = (data.get("customTitle") or "").strip()
    difficulty = data.get("difficulty") or "Beginner"
    modules_count = clamp_int(data.get("modulesCount"), 3, 1, 6)
    lessons_count = clamp_int(data.get("lessonsCount"), 3, 1, 6)

    prompt = f"""
    You are an expert curriculum architect. Generate a fast course OUTLINE only for "{topic}".
    Use clear English for every field.
    Do not write full lesson bodies. Detailed lesson content will be generated later per lesson.
    {f'The exact course title must be "{custom_title}".' if custom_title else 'Create a professional course title.'}
    Difficulty: {difficulty}.
    Required structure: exactly {modules_count} modules, each with exactly {lessons_count} lessons.

    Return only valid JSON with this shape:
    {{
      "title": "String",
      "subtitle": "String",
      "description": "Three concise sentences about the learning path.",
      "duration": "String",
      "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
      "modules": [
        {{
          "title": "String",
          "description": "String",
          "duration": "String",
          "outcomes": ["Outcome1", "Outcome2", "Outcome3"],
          "youtubeQueries": ["query1", "query2"],
          "lessons": [
            {{
              "title": "String",
              "summary": "Two sentences describing what the future lesson will cover.",
              "duration": "String",
              "type": "Concept/Example/Practice/Project"
            }}
          ]
        }}
      ],
      "recommendedQueries": ["SearchA", "SearchB"],
      "projectIdeas": ["ProjA", "ProjB"],
      "certificateCriteria": "String"
    }}
    """

    try:
        raw_course = call_ai_json(prompt)
        course = normalize_course_outline(raw_course, topic, custom_title, difficulty, modules_count, lessons_count)
    except Exception as exc:
        print(f"Outline generation fallback: {exc}")
        course = fallback_course_outline(topic, custom_title, difficulty, modules_count, lessons_count)

    return jsonify(course)


@app.route("/lessons/generate", methods=["POST"])
@app.route("/api/lessons/generate", methods=["POST"])
def generate_lesson():
    data = request.get_json(silent=True) or {}
    topic = clean_topic(data.get("topic", "General Knowledge"))
    difficulty = data.get("difficulty") or "Beginner"
    course_title = data.get("courseTitle") or f"{topic} Course"
    module_title = data.get("moduleTitle") or "Current Module"
    lesson_title = data.get("lessonTitle") or "Current Lesson"
    lesson_summary = data.get("lessonSummary") or data.get("moduleSummary") or ""

    prompt = f"""
    You are a senior instructor writing one rich lesson for a course.
    Use clear English for every field.
    Topic: {topic}
    Difficulty: {difficulty}
    Course: {course_title}
    Module: {module_title}
    Lesson: {lesson_title}
    Lesson summary: {lesson_summary}

    Return only valid JSON with this shape:
    {{
      "overview": "A detailed 2-3 paragraph explanation for the learner.",
      "objectives": ["Objective1", "Objective2", "Objective3"],
      "sections": [
        {{ "title": "String", "body": "Detailed teaching content with concrete explanation." }}
      ],
      "examples": [
        {{ "title": "String", "code": "Optional code or structured example text", "explanation": "String" }}
      ],
      "practiceTask": {{
        "title": "String",
        "instructions": "String",
        "successCriteria": ["Criterion1", "Criterion2"]
      }},
      "keyTakeaways": ["Takeaway1", "Takeaway2", "Takeaway3"],
      "miniQuiz": [
        {{ "question": "String", "answer": "String" }}
      ]
    }}
    """

    try:
        raw_content = call_ai_json(prompt)
        content = normalize_lesson_content(raw_content, topic, difficulty, course_title, module_title, lesson_title, lesson_summary)
    except Exception as exc:
        print(f"Lesson generation fallback: {exc}")
        content = fallback_lesson_content(topic, difficulty, course_title, module_title, lesson_title, lesson_summary)

    return jsonify(content)


if __name__ == "__main__":
    app.run(port=5000, debug=False)
