import React from 'react';
import { DefectRecord } from '../types';

interface AIInsightProps {
  defects: DefectRecord[];
}

const AIInsight: React.FC<AIInsightProps> = () => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-500 text-sm text-center">
      AI Insights are currently disabled.
    </div>
  );
};

export default AIInsight;