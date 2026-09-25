const HOST = "indian-stock-exchange-api2.p.rapidapi.com";
const BASE = `https://${HOST}`;

const FILTERABLE = new Set(["tickerId", "industry", "companyProfile", "currentPrice", "stockTechnicalData", "percentChange", "yearHigh", "yearLow", "financials", "keyMetrics", "futureExpiryDates", "futureOverviewData", "initialStockFinancialData", "analystView", "recosBar", "riskMeter", "shareholding", "stockCorporateActionData", "stockDetailsReusableData", "stockFinancialData", "recentNews"]);
const CORPORATE = new Set(["board_meetings", "dividends", "splits", "bonus", "rights"]);
const HISTORICAL = new Set(["quarter_results", "yoy_results", "balancesheet", "cashflow", "ratios", "shareholding_pattern_quarterly", "shareholding_pattern_yearly"]);

async function rapid(path: string, params: Record<string, string>) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY is not configured");
  const response = await fetch(`${BASE}${path}?${new URLSearchParams(params)}`, {
    headers: { "x-rapidapi-key": key, "x-rapidapi-host": HOST },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`RapidAPI error: ${response.status}`);
  return response.json();
}

export async function fetchResearch(stock: string, intent: string) {
  if (FILTERABLE.has(intent)) return rapid("/stock", { name: stock });
  if (CORPORATE.has(intent)) return rapid("/corporate_actions", { stock_name: stock });
  if (HISTORICAL.has(intent)) return rapid("/historical_stats", { stock_name: stock, stats: intent });
  throw new Error("Unsupported research intent");
}

export function filterResearch(raw: Record<string, unknown>, intent: string) {
  if (FILTERABLE.has(intent)) return raw[intent] ?? { error: `No data found for ${intent}` };
  return raw;
}
