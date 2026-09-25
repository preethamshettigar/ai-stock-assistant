import { classifyIntent, extractCompany, summarizeResearch } from "./groq";
import { fetchResearch, filterResearch } from "./rapidapi";

export async function answerResearch(query: string, lastCompany: string | null, lastIntent: string | null) {
  const company = (await extractCompany(query, lastCompany)).replace(/["'`]/g, "").trim() || lastCompany;
  const intent = (await classifyIntent(query, lastIntent)).replace(/["'`]/g, "").trim();
  if (!company) return { answer: "Please include a company name or stock symbol.", company: null, intent };
  const raw = await fetchResearch(company, intent);
  const answer = await summarizeResearch(filterResearch(raw, intent), intent, query);
  return { answer, company, intent };
}
