import httpx
from app.config import required

VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"


def generate_speech(text: str) -> bytes:
    response = httpx.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
        headers={"xi-api-key": required("ELEVENLABS_API_KEY"), "accept": "audio/mpeg", "content-type": "application/json"},
        json={"text": text[:5000], "model_id": "eleven_v3", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.5, "use_speaker_boost": True}},
        timeout=90,
    )
    response.raise_for_status()
    return response.content
