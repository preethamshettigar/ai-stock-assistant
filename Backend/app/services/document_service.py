import io
import uuid
from dataclasses import dataclass
from pypdf import PdfReader


@dataclass
class DocumentIndex:
    document_id: str
    filename: str
    chunks: list[str]
    index: object
    embeddings: object


_indexes: dict[str, DocumentIndex] = {}


def _split(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return [text[i:i + chunk_size] for i in range(0, max(len(text), 1), chunk_size - overlap)]


def process_pdf(content: bytes, filename: str) -> dict:
    reader = PdfReader(io.BytesIO(content))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    chunks = _split(text)
    if not any(chunk.strip() for chunk in chunks):
        raise ValueError("No readable text was found in the PDF")
    from sentence_transformers import SentenceTransformer
    import faiss
    model = SentenceTransformer("all-MiniLM-L6-v2")
    vectors = model.encode(chunks, normalize_embeddings=True)
    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    document_id = str(uuid.uuid4())
    _indexes[document_id] = DocumentIndex(document_id, filename, chunks, index, model)
    return {"document_id": document_id, "filename": filename, "chunks": len(chunks)}


def answer_document(document_id: str, question: str) -> str:
    from app.services.groq_service import summarize_research
    document = _indexes.get(document_id)
    if not document:
        raise KeyError("Document not found. Upload it again.")
    query_vector = document.embeddings.encode([question], normalize_embeddings=True)
    _, positions = document.index.search(query_vector, min(4, len(document.chunks)))
    context = "\n\n".join(document.chunks[i] for i in positions[0] if i >= 0)
    return summarize_research({"document_context": context}, "document_question", question)
