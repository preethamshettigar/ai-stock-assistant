from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.config import FRONTEND_URL, MAX_AUDIO_BYTES, MAX_PDF_BYTES
from app.models import ChatRequest, DocumentResponse, ResearchRequest, ResearchResponse, SpeechRequest
from app.services.assemblyai_service import transcribe_audio
from app.services.document_service import answer_document, process_pdf
from app.services.elevenlabs_service import generate_speech
from app.services.groq_service import summarize_general
from app.services.research_service import answer_research

app = FastAPI(title="AI Stock Assistant API", version="1.0.0")

origins = [item.strip() for item in FRONTEND_URL.split(",") if item.strip()]
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/")
def root():
    return {"name": "AI Stock Assistant API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        return {"answer": summarize_general(request.query)}
    except Exception as exc:
        raise HTTPException(status_code=502, detail="The general AI service failed") from exc


@app.post("/research", response_model=ResearchResponse)
def research(request: ResearchRequest):
    try:
        return answer_research(request.query, request.last_company, request.last_intent)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="The research service failed") from exc


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    content = await audio.read()
    if len(content) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file is too large")
    try:
        return {"transcript": transcribe_audio(content, audio.filename or "audio.wav")}
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Speech transcription failed") from exc


@app.post("/speak")
def speak(request: SpeechRequest):
    try:
        return Response(content=generate_speech(request.text), media_type="audio/mpeg")
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Text-to-speech failed") from exc


@app.post("/documents", response_model=DocumentResponse)
async def documents(file: UploadFile = File(...)):
    content = await file.read()
    if len(content) > MAX_PDF_BYTES:
        raise HTTPException(status_code=413, detail="PDF is too large")
    if file.content_type not in ("application/pdf", None):
        raise HTTPException(status_code=415, detail="Only PDF files are supported")
    try:
        return process_pdf(content, file.filename or "document.pdf")
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Could not process this PDF") from exc


@app.post("/documents/{document_id}/ask")
def ask_document(document_id: str, request: ChatRequest):
    try:
        return {"answer": answer_document(document_id, request.query)}
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Document question answering failed") from exc
