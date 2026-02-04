import React from 'react';
import { DefectRecord } from '../types';
import { FileSpreadsheet, Printer } from 'lucide-react';

interface SummaryReportProps {
  defects: DefectRecord[];
  onUpdate: (updated: DefectRecord) => void;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ defects, onUpdate }) => {
  // Group defects by category
  const groupedDefects = React.useMemo(() => {
    return defects.reduce((acc, defect) => {
      if (!acc[defect.category]) {
        acc[defect.category] = [];
      }
      acc[defect.category].push(defect);
      return acc;
    }, {} as Record<string, DefectRecord[]>);
  }, [defects]);

  const totalDefects = defects.reduce((sum, d) => sum + d.totalDefects, 0);
  const totalFixed = defects.reduce((sum, d) => sum + d.fixedDefects, 0);
  const totalRemaining = totalDefects - totalFixed;
  const progressPercentage = totalDefects > 0 ? (totalFixed / totalDefects) * 100 : 0;

  const handleNumberChange = (id: string, field: 'totalDefects' | 'fixedDefects', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return; // Prevent invalid input

    const defect = defects.find(d => d.id === id);
    if (defect) {
      const updatedDefect = { ...defect, [field]: numValue };
      // Optional: Auto-update status based on numbers
      if (updatedDefect.totalDefects > 0 && updatedDefect.totalDefects === updatedDefect.fixedDefects) {
        updatedDefect.status = 'Completed';
      } else if (updatedDefect.fixedDefects === 0 && updatedDefect.totalDefects > 0) {
        updatedDefect.status = 'Pending';
      }
      onUpdate(updatedDefect);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
        <div className="flex items-center gap-3">
           <div className="bg-emerald-600 p-2 rounded-lg shadow-sm">
             <FileSpreadsheet className="w-5 h-5 text-white" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800">Summary Report (ตารางสรุป)</h3>
             <p className="text-sm text-slate-500">Categorized view • Click numbers to edit</p>
           </div>
        </div>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-300 px-4 py-3 font-semibold min-w-[200px]">Category / Location (บริเวณ)</th>
              <th className="border border-slate-300 px-2 py-3 text-center bg-slate-200/50 font-semibold w-24">Total (รายการ)</th>
              <th className="border border-slate-300 px-2 py-3 text-center text-emerald-700 bg-emerald-50/50 font-semibold w-24">Fixed (เสร็จ)</th>
              <th className="border border-slate-300 px-4 py-3 text-center text-red-700 bg-red-50/50 font-semibold w-24">Left (เหลือ)</th>
              <th className="border border-slate-300 px-4 py-3 text-center font-semibold w-32">Status (สถานะ)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedDefects).map(([category, items]: [string, DefectRecord[]]) => {
              // Calculate Subtotals for the category
              const catTotal = items.reduce((sum, d) => sum + d.totalDefects, 0);
              const catFixed = items.reduce((sum, d) => sum + d.fixedDefects, 0);
              const catRemaining = catTotal - catFixed;

              return (
                <React.Fragment key={category}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300">
                    <td className="border border-slate-300 px-4 py-3 bg-slate-200/40">
                      {category} (รวม)
                    </td>
                    <td className="border border-slate-300 px-2 py-3 text-center bg-slate-200/40">{catTotal}</td>
                    <td className="border border-slate-300 px-2 py-3 text-center text-emerald-700 bg-slate-200/40">{catFixed}</td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-red-700 bg-slate-200/40">{catRemaining}</td>
                    <td className="border border-slate-300 px-4 py-3 bg-slate-200/40"></td>
                  </tr>

                  {/* Defect Items */}
                  {items.map((defect) => {
                    const remaining = defect.totalDefects - defect.fixedDefects;
                    return (
                      <tr key={defect.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="border border-slate-300 px-4 py-2 font-medium text-slate-700 pl-8">
                          {defect.location}
                        </td>
                        <td className="border border-slate-300 px-0 py-0 text-center bg-slate-50/30 relative">
                           <input 
                              type="number"
                              min="0"
                              className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 text-slate-900 font-medium"
                              value={defect.totalDefects}
                              onChange={(e) => handleNumberChange(defect.id, 'totalDefects', e.target.value)}
                           />
                        </td>
                        <td className="border border-slate-300 px-0 py-0 text-center bg-emerald-50/10 relative">
                           <input 
                              type="number"
                              min="0"
                              className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:z-10 text-emerald-700 font-medium"
                              value={defect.fixedDefects}
                              onChange={(e) => handleNumberChange(defect.id, 'fixedDefects', e.target.value)}
                           />
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center text-red-600 font-bold bg-red-50/10">
                          {remaining}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                            defect.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200' :
                            defect.status === 'Pending' ? 'bg-red-100 text-red-800 border-red-200' :
                            defect.status === 'Fixed (Wait CM)' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {defect.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-800 text-white font-bold shadow-inner border-t-2 border-slate-400">
            <tr>
              <td className="border border-slate-600 px-4 py-4 text-right text-base">Grand Total (รวมทั้งหมด):</td>
              <td className="border border-slate-600 px-2 py-4 text-center text-lg">{totalDefects}</td>
              <td className="border border-slate-600 px-2 py-4 text-center text-lg text-emerald-300">{totalFixed}</td>
              <td className="border border-slate-600 px-4 py-4 text-center text-lg text-red-300">{totalRemaining}</td>
              <td className="border border-slate-600 px-4 py-4 text-center text-sm font-normal text-slate-300">
                {progressPercentage.toFixed(1)}% Complete
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SummaryReport;