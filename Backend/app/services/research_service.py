from app.services.groq_service import classify_intent, extract_company, summarize_research
from app.services.rapidapi_service import fetch_research, filter_research


def answer_research(query: str, last_company: str | None, last_intent: str | None) -> dict:
    company = extract_company(query, last_company) or last_company
    intent = classify_intent(query, last_intent)
    if not company:
        return {"answer": "Please include a company name or stock symbol.", "company": None, "intent": intent}
    raw = fetch_research(company, intent)
    answer = summarize_research(filter_research(raw, intent), intent, query)
    return {"answer": answer, "company": company, "intent": intent}
