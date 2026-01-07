import React, { useState } from 'react';
import { AppState } from '../types';
import { getBusinessInsights } from '../services/geminiService';
import { Sparkles, Send, Bot } from 'lucide-react';

interface GeminiAdvisorProps {
  state: AppState;
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ state }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    
    const result = await getBusinessInsights(state, query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-indigo-500 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
            <h3 className="font-bold text-white">Summit AI Advisor</h3>
            <p className="text-xs text-indigo-300">Powered by Gemini 3.0</p>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900/50">
        {response ? (
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800 p-4 rounded-r-xl rounded-bl-xl text-slate-200 text-sm leading-relaxed whitespace-pre-line border border-slate-700 shadow-md">
                    {response}
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Bot className="w-12 h-12 opacity-20" />
                <p className="text-sm">Ask me about revenue trends, stock levels, or cross-branch performance.</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    <button onClick={() => setQuery("Which branch has the highest revenue?")} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700 transition-colors">Best performing branch?</button>
                    <button onClick={() => setQuery("Any low stock items I should worry about?")} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700 transition-colors">Low stock alerts?</button>
                    <button onClick={() => setQuery("Analyze the laundry service efficiency.")} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-700 transition-colors">Laundry efficiency?</button>
                </div>
            </div>
        )}
        {loading && (
            <div className="flex gap-4 mt-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-indigo-600/50"></div>
                <div className="h-20 bg-slate-800/50 rounded-xl flex-1"></div>
            </div>
        )}
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="relative">
            <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-4 pr-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Ask about your business..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            />
            <button 
                onClick={handleAsk}
                disabled={loading}
                className="absolute right-2 top-2 bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-md transition-colors disabled:opacity-50"
            >
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};