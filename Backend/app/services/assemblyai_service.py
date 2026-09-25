import time
import httpx
from app.config import required


def transcribe_audio(audio_bytes: bytes, filename: str) -> str:
    key = required("ASSEMBLYAI_API_KEY")
    headers = {"authorization": key}
    upload = httpx.post("https://api.assemblyai.com/v2/upload", headers=headers, content=audio_bytes, timeout=90)
    upload.raise_for_status()
    upload_url = upload.json()["upload_url"]
    started = httpx.post("https://api.assemblyai.com/v2/transcript", headers={**headers, "content-type": "application/json"}, json={"audio_url": upload_url}, timeout=45)
    started.raise_for_status()
    transcript_id = started.json()["id"]
    for _ in range(60):
        result = httpx.get(f"https://api.assemblyai.com/v2/transcript/{transcript_id}", headers=headers, timeout=30).json()
        if result.get("status") == "completed":
            return result.get("text", "")
        if result.get("status") == "error":
            raise RuntimeError(result.get("error", "Transcription failed"))
        time.sleep(1)
    raise TimeoutError("Transcription timed out")
