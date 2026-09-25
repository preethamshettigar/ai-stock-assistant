import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", "10000000"))
MAX_PDF_BYTES = int(os.getenv("MAX_PDF_BYTES", "52428800"))  # 50 MB


def required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is not configured")
    return value
