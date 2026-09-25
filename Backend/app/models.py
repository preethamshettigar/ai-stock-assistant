from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)


class ResearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    last_company: str | None = None
    last_intent: str | None = None


class SpeechRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)


class ResearchResponse(BaseModel):
    answer: str
    company: str | None = None
    intent: str | None = None


class DocumentResponse(BaseModel):
    document_id: str
    filename: str
    chunks: int
