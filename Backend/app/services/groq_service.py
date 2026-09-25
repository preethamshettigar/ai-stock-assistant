import json
import httpx
from app.config import required

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "qwen/qwen3.8-27b"


def _chat(messages: list[dict[str, str]], max_tokens: int = 2000) -> str:
    response = httpx.post(
        GROQ_URL,
        headers={"Authorization": f"Bearer {required('GROQ_API_KEY')}", "Content-Type": "application/json"},
        json={"model": MODEL, "messages": messages, "max_tokens": max_tokens, "temperature": 0},
        timeout=90,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()


def summarize_general(query: str) -> str:
    return _chat([
        {"role": "system", "content": "You are a clear, careful finance education assistant. Give concise answers and do not present personalized investment advice."},
        {"role": "user", "content": query},
    ])


def extract_company(query: str, last_company: str | None) -> str:
    return _chat([{"role": "user", "content": f"Extract only the company name or stock symbol from this query. If none is present, return the previous company. Previous company: {last_company or 'none'}. Query: {query}"}], 30).strip(" \"'`\n")


def classify_intent(query: str, last_intent: str | None) -> str:
    intents = ["tickerId", "industry", "companyProfile", "currentPrice", "stockTechnicalData", "percentChange", "yearHigh", "yearLow", "financials", "keyMetrics", "futureExpiryDates", "futureOverviewData", "initialStockFinancialData", "analystView", "recosBar", "riskMeter", "shareholding", "stockCorporateActionData", "stockDetailsReusableData", "stockFinancialData", "recentNews", "quarter_results", "yoy_results", "balancesheet", "cashflow", "ratios", "shareholding_pattern_quarterly", "shareholding_pattern_yearly", "board_meetings", "dividends", "splits", "bonus", "rights"]
    answer = _chat([{"role": "user", "content": f"Return only one intent from this list: {', '.join(intents)}. If unclear, use the previous intent. Previous intent: {last_intent or 'none'}. Query: {query}"}], 30)
    return answer.strip(" \"'`\n")


def summarize_research(data: object, intent: str, query: str) -> str:
    serialized = json.dumps(data, ensure_ascii=False)[:50000]
    return _chat([{"role": "user", "content": f"You are a finance assistant. Answer the user's question simply and accurately. Query: {query}. Intent: {intent}. Data: {serialized}. Do not mention JSON or invent missing facts."}], 3000)
