import { GoogleGenAI } from "@google/genai";
import { AppState, Branch, TransactionType } from "../types";

// Remove top-level initialization to prevent runtime crash in browser
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (
  state: AppState, 
  query: string
): Promise<string> => {
  try {
    // Initialize lazily only when requested
    // Safe check for process.env to avoid browser reference errors
    const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
    
    if (!apiKey) {
        return "AI Configuration missing: API Key not found. Please check your environment variables.";
    }

    const ai = new GoogleGenAI({ apiKey });

    // We summarize the state to avoid token limits with raw data dumps
    const summary = {
      currentBranch: state.currentBranch,
      totalTransactions: state.transactions.length,
      revenueByBranch: Object.values(Branch).reduce((acc, branch) => {
        acc[branch] = state.transactions
          .filter(t => t.branch === branch)
          .reduce((sum, t) => sum + t.totalAmount, 0);
        return acc;
      }, {} as Record<string, number>),
      recentTransactions: state.transactions.slice(0, 10), // only last 10
      lowStockAlerts: state.products.filter(p => p.stock[state.currentBranch] < 5).map(p => p.name)
    };

    const prompt = `
      You are an elite Business Intelligence AI for 'SummitBase', an outdoor equipment rental and retail company.
      
      Current Business Context (JSON Summary):
      ${JSON.stringify(summary, null, 2)}

      User Query: "${query}"

      Instructions:
      1. Analyze the provided context to answer the user's query.
      2. If the user asks about revenue, compare branches.
      3. If the user asks about stock, highlight low stock items.
      4. Keep the tone professional, executive, and concise.
      5. Format the response with clear headings or bullet points if necessary.
      6. If you propose an action (e.g., "Transfer stock"), explain why.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "I apologize, but I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System Error: Unable to reach the AI analysis engine. Please try again later.";
  }
};