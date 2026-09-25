# AI Stock Assistant

A monorepo containing a Vercel-hosted Next.js frontend and a Render-hosted FastAPI backend.

```text
ai-stock-assistant/
├── frontend/    # Next.js + TypeScript → Vercel
└── backend/     # FastAPI + Python → Render
```

## Architecture

```text
Browser
  ↓
Next.js frontend on Vercel
  ↓ HTTPS requests using NEXT_PUBLIC_API_URL
FastAPI backend on Render
  ├── Groq: General QA and summaries
  ├── RapidAPI: Indian stock market data
  ├── AssemblyAI: speech-to-text
  ├── ElevenLabs: text-to-speech
  └── pypdf + FAISS + sentence-transformers: Document QA
```

## Modes

| Mode | Text input | Voice input | Backend behavior |
|---|---:|---:|---|
| General QA | Yes | Yes | Groq answer |
| Research QA | Yes | Yes | Groq intent extraction, RapidAPI lookup, Groq summary |
| Document QA | Yes | No | PDF chunks, FAISS retrieval, Groq answer |
| Portfolio Management | No | No | Placeholder; not implemented yet |

## Repository setup

Create one empty GitHub repository, for example:

```text
ai-stock-assistant
```

Do not add a GitHub README, `.gitignore`, or license during repository creation. This project already contains them.

From this repository root:

```bash
git init
git add .
git commit -m "Add Vercel frontend and Render FastAPI backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-stock-assistant.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Local development

Use two terminals.

### Terminal 1: backend

Windows Git Bash:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and add:

```env
GROQ_API_KEY=your_key
RAPIDAPI_KEY=your_key
ASSEMBLYAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
FRONTEND_URL=http://localhost:3000
MAX_PDF_BYTES=52428800
```

Start FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend URLs:

- http://localhost:8000/health
- http://localhost:8000/docs

### Terminal 2: frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start Next.js:

```bash
npm run dev
```

Open http://localhost:3000.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Leave the Framework Preset as **Next.js**.
4. Vercel should use these defaults:

```text
Install Command: npm install
Build Command: npm run build
Output Directory: default
```

5. Add this Vercel environment variable:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

6. Deploy the frontend.

Do not add these secrets to Vercel:

```env
GROQ_API_KEY
RAPIDAPI_KEY
ASSEMBLYAI_API_KEY
ELEVENLABS_API_KEY
```

## Render deployment

1. Create a new **Web Service** in Render.
2. Connect the same GitHub repository.
3. Set **Root Directory** to `backend`.
4. Select Python.
5. Use these settings:

```text
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

6. Add these Render environment variables:

```env
GROQ_API_KEY=your_key
RAPIDAPI_KEY=your_key
ASSEMBLYAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
FRONTEND_URL=https://YOUR-VERCEL-PROJECT.vercel.app
MAX_AUDIO_BYTES=10000000
MAX_PDF_BYTES=52428800
```

7. Deploy the backend.
8. Copy the Render service URL into Vercel as `NEXT_PUBLIC_API_URL`.
9. Redeploy Vercel.

## Important deployment order

If both services are new, use this order:

1. Push the monorepo to GitHub.
2. Deploy `backend` on Render.
3. Copy the Render URL.
4. Deploy `frontend` on Vercel with `NEXT_PUBLIC_API_URL` set to the Render URL.
5. Update Render's `FRONTEND_URL` to the final Vercel URL.
6. Redeploy Render if necessary.

## Main files

### Frontend

- `frontend/app/page.tsx` — mode selection, text input, voice visibility, document upload, and chat state.
- `frontend/components/message-list.tsx` — Markdown and LaTeX rendering for assistant answers.
- `frontend/components/voice-recorder.tsx` — browser microphone recording and AssemblyAI request.
- `frontend/components/pdf-uploader.tsx` — PDF upload UI.
- `frontend/lib/api-client.ts` — calls the Render backend.
- `frontend/app/globals.css` — frontend design styles.
- `frontend/app/layout.tsx` — page metadata and KaTeX stylesheet import.
- `frontend/package.json` — Node dependencies and scripts.

### Backend

- `backend/app/main.py` — FastAPI app, CORS, and HTTP endpoints.
- `backend/app/config.py` — environment variables and upload limits.
- `backend/app/services/groq_service.py` — Groq calls.
- `backend/app/services/rapidapi_service.py` — stock API calls.
- `backend/app/services/assemblyai_service.py` — speech-to-text.
- `backend/app/services/elevenlabs_service.py` — text-to-speech.
- `backend/app/services/document_service.py` — PDF extraction, embeddings, FAISS retrieval.
- `backend/requirements.txt` — Python dependencies.
- `backend/render.yaml` — optional Render Blueprint configuration.

## PDF limit

The default PDF limit is 50 MB:

```env
MAX_PDF_BYTES=52428800
```

Documents up to 30 MB are accepted. Render's free service may restart or sleep, and the current FAISS index is in memory. Uploaded documents may need to be processed again after a restart.

## Security rules

- Never commit `.env`, `.env.local`, API keys, PDFs, audio, `node_modules`, `.next`, `.venv`, or model caches.
- Keep provider keys only in Render.
- Only expose the backend URL through `NEXT_PUBLIC_API_URL`.
- Keep `FRONTEND_URL` restricted to the actual Vercel domain.
- Do not use `allow_origins=["*"]` in production.
