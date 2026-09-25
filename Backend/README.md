# AI Stock Assistant Backend

FastAPI backend for Render. It keeps Groq, RapidAPI, AssemblyAI, ElevenLabs, PDF extraction, and FAISS document search away from the browser.

## Local setup

```bash
python -m venv myenv
source myenv/bin/activate       # Windows Git Bash: source .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/health
Interactive docs: http://localhost:8000/docs

## Environment variables

```env
GROQ_API_KEY=...
RAPIDAPI_KEY=...
ASSEMBLYAI_API_KEY=...
ELEVENLABS_API_KEY=...
FRONTEND_URL=http://localhost:3000
```

After deploying the frontend, change `FRONTEND_URL` to the Vercel URL. Multiple comma-separated origins are supported.

## Render deployment

Create a new Web Service from this repository. Render can use `render.yaml`, or use these settings manually:

```text
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check Path: /health
```

Add the four provider keys and `FRONTEND_URL` in Render Environment Variables.

## API endpoints

- `POST /chat` — General QA
- `POST /research` — Company/intent extraction, RapidAPI lookup, and summary
- `POST /transcribe` — AssemblyAI speech-to-text
- `POST /speak` — ElevenLabs audio/mpeg response
- `POST /documents` — PDF upload and FAISS indexing
- `POST /documents/{document_id}/ask` — Document question answering

The in-memory document index is suitable for a prototype only. Render free instances can sleep/restart, so production persistence should use object storage and a hosted vector database.
