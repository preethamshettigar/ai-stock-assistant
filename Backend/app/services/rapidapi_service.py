import httpx
from app.config import required

HOST = "indian-stock-exchange-api2.p.rapidapi.com"
BASE = f"https://{HOST}"
FILTERABLE = {"tickerId", "industry", "companyProfile", "currentPrice", "stockTechnicalData", "percentChange", "yearHigh", "yearLow", "financials", "keyMetrics", "futureExpiryDates", "futureOverviewData", "initialStockFinancialData", "analystView", "recosBar", "riskMeter", "shareholding", "stockCorporateActionData", "stockDetailsReusableData", "stockFinancialData", "recentNews"}
CORPORATE = {"board_meetings", "dividends", "splits", "bonus", "rights"}
HISTORICAL = {"quarter_results", "yoy_results", "balancesheet", "cashflow", "ratios", "shareholding_pattern_quarterly", "shareholding_pattern_yearly"}


def _get(path: str, params: dict[str, str]) -> dict:
    response = httpx.get(f"{BASE}{path}", headers={"x-rapidapi-key": required("RAPIDAPI_KEY"), "x-rapidapi-host": HOST}, params=params, timeout=45)
    response.raise_for_status()
    return response.json()


def fetch_research(stock: str, intent: str) -> dict:
    if intent in FILTERABLE:
        return _get("/stock", {"name": stock})
    if intent in CORPORATE:
        return _get("/corporate_actions", {"stock_name": stock})
    if intent in HISTORICAL:
        return _get("/historical_stats", {"stock_name": stock, "stats": intent})
    raise ValueError("Unsupported research intent")


def filter_research(raw: dict, intent: str) -> object:
    if intent in FILTERABLE:
        return raw.get(intent, {"error": f"No data found for {intent}"})
    return raw
