# AI Course Generator

A React and Flask app that creates course outlines and lesson content with AI.

## Overview

The app creates a fast course outline first, then generates rich lesson content on demand when a learner opens a lesson. This keeps the UI responsive and avoids long single-request backend calls.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Lucide React, Recharts
- Backend: Python, Flask, Flask-CORS, g4f

## Project Structure

```text
Major-Project/
  frontend/
    index.html
    package.json
    package-lock.json
    vite.config.js
    src/
      main.jsx
      App.jsx
      CourseGenerator.jsx
      index.css
    public/
      assets/
        bg/
          bg1.png
          bg2.png
          bg3.png
          bg4.png
          bg5.png
          bg6.png
  backend/
    server.py
    requirements.txt
  scripts/
    start_all.bat
  README.md
```

## Local Development

Backend:

```bash
cd backend
pip install -r requirements.txt
python server.py
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Windows shortcut:

```bash
scripts/start_all.bat
```

## Deployment

Vercel frontend:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Render backend:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command:

```bash
gunicorn server:app --bind 0.0.0.0:$PORT --timeout 120
```

## API Checks

Health:

```bash
curl http://127.0.0.1:5000/api/health
```

Course outline:

```bash
curl -X POST http://127.0.0.1:5000/api/generate -H "Content-Type: application/json" -d "{\"topic\":\"Next.js\",\"difficulty\":\"Beginner\",\"modulesCount\":3,\"lessonsCount\":3}"
```

Lesson content:

```bash
curl -X POST http://127.0.0.1:5000/api/lessons/generate -H "Content-Type: application/json" -d "{\"topic\":\"Next.js\",\"courseTitle\":\"Next.js Fundamentals\",\"moduleTitle\":\"Routing\",\"lessonTitle\":\"App Router Basics\",\"difficulty\":\"Beginner\"}"
```
