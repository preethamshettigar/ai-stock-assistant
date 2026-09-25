# AI Stock Assistant Frontend

Next.js/TypeScript frontend deployed on Vercel. The AI provider keys stay in the FastAPI backend deployed on Render.

## Local setup

Run the backend first on port 8000. Then:

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Open http://localhost:3000.

## Vercel setup

Create a Vercel project from this repository and add this environment variable:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Do not put Groq, RapidAPI, AssemblyAI, or ElevenLabs keys in this repository. Those keys belong only in Render.

## Features

- General QA through FastAPI and Groq
- Research QA through FastAPI, RapidAPI, and Groq
- AssemblyAI speech-to-text voice input
- ElevenLabs read-aloud for assistant responses
- PDF upload and Document QA through FastAPI/FAISS
- Portfolio Management is shown as coming soon because it was not implemented in the original Streamlit app
