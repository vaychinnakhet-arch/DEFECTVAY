import React, { useRef } from 'react';
import { DefectRecord } from '../types';
import { Presentation, Copy, CheckCircle2, ImageDown } from 'lucide-react';
import html2canvas from 'html2canvas';

interface PowerPointDetailViewProps {
  defects: DefectRecord[];
}

type DisplayItem = 
  | { type: 'header'; title: string }
  | { type: 'row'; data: DefectRecord; index: number };

const PowerPointDetailView: React.FC<PowerPointDetailViewProps> = ({ defects }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Group items by category to create a flat display list with headers
  const displayList = React.useMemo(() => {
    const categories: string[] = Array.from(new Set(defects.map(d => d.category)));
    const list: DisplayItem[] = [];
    let globalIndex = 1;

    categories.forEach(cat => {
      const items = defects.filter(d => d.category === cat);
      if (items.length > 0) {
        list.push({ type: 'header', title: cat });
        items.forEach(item => {
          list.push({ type: 'row', data: item, index: globalIndex++ });
        });
      }
    });
    return list;
  }, [defects]);

  // 2. Intelligent Split Logic
  // Try to split at a category header closest to the middle to avoid breaking groups
  let splitIndex = Math.ceil(displayList.length / 2); // Default to exact half

  // Find indices of all headers (excluding the first one at index 0)
  const headerIndices = displayList
    .map((item, index) => ({ isHeader: item.type === 'header', index }))
    .filter(x => x.isHeader && x.index > 0)
    .map(x => x.index);

  if (headerIndices.length > 0) {
    // Find the header index mathematically closest to the midpoint
    const idealMid = displayList.length / 2;
    const bestHeaderSplit = headerIndices.reduce((prev, curr) => {
      return Math.abs(curr - idealMid) < Math.abs(prev - idealMid) ? curr : prev;
    });

    // Only use this split if it keeps the columns reasonably balanced (e.g., between 30% and 70%)
    // This prevents stranding a small category alone in a huge second column or vice versa.
    const ratio = bestHeaderSplit / displayList.length;
    if (ratio >= 0.3 && ratio <= 0.7) {
       splitIndex = bestHeaderSplit;
    }
  }

  const leftColumn = displayList.slice(0, splitIndex);
  const rightColumn = displayList.slice(splitIndex);

  const handleExportImage = async () => {
    if (contentRef.current) {
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2, // High resolution
                backgroundColor: '#ffffff',
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `ppt-detail-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Snapshot failed', error);
            alert('Failed to generate image.');
        }
    }
  };

  const renderTable = (items: DisplayItem[]) => (
    <table className="w-full text-left border-collapse align-top">
      <thead>
        <tr className="border-b-2 border-slate-300">
          <th className="py-1 px-1 text-xs font-bold text-slate-800 w-8 text-center">#</th>
          <th className="py-1 px-1 text-xs font-bold text-slate-800">LOCATION</th>
          <th className="py-1 px-1 text-xs font-bold text-slate-700 text-center w-10">TOT</th>
          <th className="py-1 px-1 text-xs font-bold text-emerald-700 text-center w-10">FIX</th>
          <th className="py-1 px-1 text-xs font-bold text-indigo-700 text-center w-16">TARGET</th>
          <th className="py-1 px-1 text-xs font-bold text-slate-700 text-center w-28">STATUS</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => {
          if (item.type === 'header') {
             return (
               <tr key={`header-${item.title}-${idx}`} className="bg-indigo-50 border-b border-indigo-100">
                 <td colSpan={6} className="py-1 px-2 text-xs font-bold text-indigo-800 uppercase tracking-wider">
                   {item.title}
                 </td>
               </tr>
             );
          }

          const defect = item.data;
          // Check for full completion based on numbers
          const isComplete = defect.totalDefects > 0 && defect.totalDefects === defect.fixedDefects;
          
          return (
            <tr key={defect.id} className="border-b border-slate-100 last:border-0">
              <td className="py-1 px-1 text-xs font-semibold text-slate-400 text-center align-top">
                {item.index}
              </td>
              <td className="py-1 px-1 text-xs sm:text-sm font-bold text-slate-800 break-words align-top leading-tight">
                {defect.location}
              </td>
              <td className="py-1 px-1 text-sm text-center font-bold text-slate-600 align-top">
                {defect.totalDefects}
              </td>
              <td className="py-1 px-1 text-sm text-center font-bold text-emerald-600 align-top">
                {defect.fixedDefects}
              </td>
              <td className="py-1 px-1 text-xs text-center font-medium text-indigo-600 align-top whitespace-nowrap">
                {defect.targetDate || '-'}
              </td>
              <td className="py-1 px-1 text-center align-top">
                {defect.status === 'Fixed (Wait CM)' ? (
                  <span className="inline-block text-amber-700 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap w-full">
                    {defect.status}
                  </span>
                ) : (isComplete || defect.status === 'Completed') ? (
                  <div className="flex justify-center items-center text-emerald-700 font-bold text-xs gap-1">
                    <CheckCircle2 className="w-3 h-3 fill-emerald-100" /> Done
                  </div>
                ) : (
                  <span className={`inline-block font-bold text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${
                    defect.status === 'No Defect' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {defect.status === 'Pending' ? 'Pending' : defect.status}
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 print:hidden">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
             <div className="bg-violet-600 p-2 rounded-lg shadow-sm">
               <Presentation className="w-6 h-6 text-white" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-900">Presentation Slides (Compact)</h2>
               <p className="text-slate-500">Smart-split columns to keep categories intact where possible.</p>
             </div>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={handleExportImage}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
                <ImageDown className="w-4 h-4" />
                Save Image
            </button>
            <div className="p-3 bg-violet-50 text-violet-800 rounded-lg text-sm border border-violet-100 flex items-center gap-2 max-w-xl">
                <Copy className="w-5 h-5 flex-shrink-0" />
                <span><b>Tip:</b> Or use Win+Shift+S</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        {/* Slide Container */}
        {/* Removed fixed height/aspect-video constraint to prevent text clipping, added min-h for consistent look */}
        <div ref={contentRef} className="bg-white shadow-2xl w-full max-w-[1280px] min-h-[720px] relative flex flex-col border border-slate-200">
            {/* Header */}
            <div className="bg-slate-800 text-white p-4 border-b-4 border-violet-500 flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-wide uppercase">Defect Status Overview</h1>
                    <p className="text-slate-300 text-sm mt-0">Full Project Status Report</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-violet-400">{defects.length}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Items</div>
                </div>
            </div>

            {/* Content - Two Columns */}
            <div className="flex-1 bg-white p-3 flex flex-col md:flex-row gap-4 md:gap-8">
                {/* Left Column */}
                <div className="flex-1">
                    {renderTable(leftColumn)}
                </div>
                
                {/* Right Column */}
                <div className="flex-1 md:border-l md:border-slate-100 md:pl-8">
                    {renderTable(rightColumn)}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-100 p-2 border-t border-slate-200 flex justify-between items-center text-slate-500 text-[10px] shrink-0">
                <span className="font-semibold text-slate-400">VAY CHINNAKHET</span>
                <span className="flex items-center gap-2">
                    <span>Generated: {new Date().toLocaleDateString()}</span>
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PowerPointDetailView;