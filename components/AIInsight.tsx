import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DefectRecord } from '../types';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIInsightProps {
  defects: DefectRecord[];
}

const AIInsight: React.FC<AIInsightProps> = ({ defects }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found in environment variables");
      }

      const ai = new GoogleGenAI({ apiKey });
      const dataSummary = defects.map(d => 
        `${d.location} (${d.category}): ${d.fixedDefects}/${d.totalDefects} fixed. Status: ${d.status}. Note: ${d.note || 'none'}`
      ).join('\n');

      const prompt = `
        As a construction manager assistant, analyze the following defect list and provide a concise summary report in English (or Thai if preferred by context, but use English for professional tone here).
        
        Focus on:
        1. Overall progress percentage.
        2. Which area is the "Bottleneck" (most pending defects).
        3. Actionable recommendations for the project manager.
        4. List areas waiting for CM approval.

        Data:
        ${dataSummary}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || "No insight generated.");
    } catch (err) {
      console.error(err);
      setError("Failed to generate AI insight. Please ensure API Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-indigo-900">AI Project Insight</h3>
        </div>
        <button 
          onClick={generateInsight}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {insight ? 'Regenerate Analysis' : 'Analyze Defects'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-100">
          {error}
        </div>
      )}

      {insight && (
        <div className="bg-white/80 p-4 rounded-lg border border-indigo-100 text-slate-800 text-sm leading-relaxed whitespace-pre-line shadow-sm">
          {insight}
        </div>
      )}

      {!insight && !loading && !error && (
        <p className="text-indigo-400 text-sm">
          Click the analyze button to generate a progress report and identify bottlenecks using Gemini AI.
        </p>
      )}
    </div>
  );
};

export default AIInsight;