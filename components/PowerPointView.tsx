import React, { useRef } from 'react';
import { DefectRecord } from '../types';
import { Presentation, Copy, CheckCircle2, ImageDown } from 'lucide-react';
import html2canvas from 'html2canvas';

interface PowerPointViewProps {
  defects: DefectRecord[];
}

const PowerPointView: React.FC<PowerPointViewProps> = ({ defects }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  // Aggregate data by category
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { total: number; fixed: number; remaining: number }> = {};
    
    defects.forEach(d => {
      if (!stats[d.category]) {
        stats[d.category] = { total: 0, fixed: 0, remaining: 0 };
      }
      stats[d.category].total += d.totalDefects;
      stats[d.category].fixed += d.fixedDefects;
      stats[d.category].remaining += (d.totalDefects - d.fixedDefects);
    });

    return Object.entries(stats).map(([name, stat]) => ({
      name,
      ...stat,
      progress: stat.total > 0 ? (stat.fixed / stat.total) * 100 : 0
    }));
  }, [defects]);

  const grandTotal = categoryStats.reduce((acc, curr) => acc + curr.total, 0);
  const grandFixed = categoryStats.reduce((acc, curr) => acc + curr.fixed, 0);
  const grandRemaining = grandTotal - grandFixed;
  const grandProgress = grandTotal > 0 ? (grandFixed / grandTotal) * 100 : 0;

  const handleExportImage = async () => {
    if (tableRef.current) {
        try {
            const canvas = await html2canvas(tableRef.current, {
                scale: 2, // High resolution
                backgroundColor: '#ffffff',
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `ppt-overview-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Snapshot failed', error);
            alert('Failed to generate image.');
        }
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
               <Presentation className="w-6 h-6 text-white" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-900">Presentation Mode</h2>
               <p className="text-slate-500">High-visibility table for PowerPoint slides</p>
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
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex items-center gap-2 max-w-md">
                <Copy className="w-5 h-5 flex-shrink-0" />
                <span><b>Tip:</b> Screenshot shortcut: Win+Shift+S</span>
            </div>
          </div>
        </div>

        {/* The PowerPoint Table - Designed for Screenshot */}
        <div ref={tableRef} className="shadow-2xl mx-auto max-w-5xl bg-white"> 
          {/* Header Strip */}
          <div className="bg-slate-800 text-white p-6 flex justify-between items-end border-b-4 border-indigo-500">
            <div>
              <h1 className="text-3xl font-extrabold tracking-wide uppercase">Defect Summary Report</h1>
              <p className="text-slate-300 mt-1 text-lg">Project Status Update</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-400">{Math.round(grandProgress)}%</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Overall Completion</div>
            </div>
          </div>
          
          {/* Main Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="p-5 text-lg font-bold text-slate-800 w-1/3 border-r border-slate-200">CATEGORY</th>
                <th className="p-5 text-lg font-bold text-slate-700 text-center w-1/6 border-r border-slate-200">TOTAL</th>
                <th className="p-5 text-lg font-bold text-emerald-700 text-center w-1/6 border-r border-slate-200">FIXED</th>
                <th className="p-5 text-lg font-bold text-red-700 text-center w-1/6 border-r border-slate-200">REMAINING</th>
                <th className="p-5 text-lg font-bold text-slate-700 text-center w-1/6">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((stat, index) => (
                <tr key={stat.name} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-b border-slate-200`}>
                  <td className="p-5 text-lg font-semibold text-slate-800 border-r border-slate-200">
                    {stat.name}
                  </td>
                  <td className="p-5 text-xl text-center font-bold text-slate-600 border-r border-slate-200">
                    {stat.total}
                  </td>
                  <td className="p-5 text-xl text-center font-bold text-emerald-600 border-r border-slate-200">
                    {stat.fixed}
                  </td>
                  <td className="p-5 text-xl text-center font-bold text-red-600 border-r border-slate-200">
                    {stat.remaining}
                  </td>
                  <td className="p-5 text-center align-middle">
                     {stat.progress === 100 ? (
                       <div className="flex justify-center items-center text-emerald-600 gap-2 font-bold text-lg">
                          <CheckCircle2 className="w-6 h-6" /> แก้ไขเรียบร้อย
                       </div>
                     ) : (
                       <div className="w-full bg-slate-200 rounded-full h-4 mt-1 overflow-hidden">
                         <div 
                           className={`h-full ${stat.progress > 80 ? 'bg-emerald-500' : stat.progress > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                           style={{ width: `${stat.progress}%` }}
                         />
                       </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-800 text-white border-t-4 border-indigo-500">
              <tr>
                <td className="p-6 text-xl font-bold uppercase tracking-wider border-r border-slate-600">Grand Total</td>
                <td className="p-6 text-2xl text-center font-bold border-r border-slate-600">{grandTotal}</td>
                <td className="p-6 text-2xl text-center font-bold text-emerald-400 border-r border-slate-600">{grandFixed}</td>
                <td className="p-6 text-2xl text-center font-bold text-red-400 border-r border-slate-600">{grandRemaining}</td>
                <td className="p-6 text-center">
                   <span className="text-xl font-medium text-slate-300">Target: 100%</span>
                </td>
              </tr>
            </tfoot>
          </table>
          
          {/* Footer Strip */}
          <div className="bg-white p-4 border-t border-slate-200 flex justify-between text-slate-400 text-sm">
             <span>VAY CHINNAKHET</span>
             <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerPointView;