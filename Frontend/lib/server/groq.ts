const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "qwen/qwen3.8-27b";

async function groq(messages: Array<{ role: "system" | "user"; content: string }>, maxTokens = 2000) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature: 0 }),
  });
  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "No answer was returned.";
}

export function summarizeGeneralQuestion(query: string) {
  return groq([
    { role: "system", content: "You are a clear, careful finance education assistant. Give concise answers and do not present personalized investment advice." },
    { role: "user", content: query },
  ], 2000);
}

export function extractCompany(query: string, lastCompany: string | null) {
  return groq([{ role: "user", content: `Extract only the company name or stock symbol from this query. If none is present, return the previous company. Previous company: ${lastCompany ?? "none"}. Query: ${query}` }], 30);
}

export function classifyIntent(query: string, lastIntent: string | null) {
  const intents = ["tickerId", "industry", "companyProfile", "currentPrice", "stockTechnicalData", "percentChange", "yearHigh", "yearLow", "financials", "keyMetrics", "futureExpiryDates", "futureOverviewData", "initialStockFinancialData", "analystView", "recosBar", "riskMeter", "shareholding", "stockCorporateActionData", "stockDetailsReusableData", "stockFinancialData", "recentNews", "quarter_results", "yoy_results", "balancesheet", "cashflow", "ratios", "shareholding_pattern_quarterly", "shareholding_pattern_yearly", "board_meetings", "dividends", "splits", "bonus", "rights"];
  return groq([{ role: "user", content: `Return only one intent from this list: ${intents.join(", ")}. If unclear, use the previous intent. Previous intent: ${lastIntent ?? "none"}. Query: ${query}` }], 30);
}

export function summarizeResearch(data: unknown, intent: string, query: string) {
  return groq([{ role: "user", content: `You are a finance assistant. Answer the user's question simply and accurately. Query: ${query}. Intent: ${intent}. Data: ${JSON.stringify(data)}. Do not mention JSON or invent missing facts.` }], 3000);
}
