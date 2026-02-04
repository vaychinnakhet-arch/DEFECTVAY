import React from 'react';
import { DefectRecord, DefectStatus } from '../types';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

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

  const handleUpdate = (id: string, field: keyof DefectRecord, value: string | number) => {
    const defect = defects.find(d => d.id === id);
    if (defect) {
        let updatedDefect = { ...defect, [field]: value };
        
        // Auto-logic for status if numbers change
        if (field === 'totalDefects' || field === 'fixedDefects') {
             const t = Number(updatedDefect.totalDefects);
             const f = Number(updatedDefect.fixedDefects);
             if (t > 0 && t === f) {
                 updatedDefect.status = 'Completed';
             } else if (f === 0 && t > 0) {
                 // Only reset to Pending if it was completed, otherwise keep current status (e.g. Wait CM) unless manual override needed?
                 // Let's keep it simple: if not complete, and was complete, go to Pending.
                 if (defect.status === 'Completed') updatedDefect.status = 'Pending';
             }
        }

        onUpdate(updatedDefect);
    }
  };

  const statusOptions: DefectStatus[] = ['Completed', 'Pending', 'Fixed (Wait CM)', 'No Defect', 'Not Checked'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
        <div className="flex items-center gap-3">
           <div className="bg-emerald-600 p-2 rounded-lg shadow-sm">
             <FileSpreadsheet className="w-5 h-5 text-white" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800">Summary Report & Input</h3>
             <p className="text-sm text-slate-500">Edit values below to update the system.</p>
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
              <th className="border border-slate-300 px-4 py-3 font-semibold min-w-[200px]">Category / Location</th>
              <th className="border border-slate-300 px-2 py-3 text-center bg-slate-200/50 font-semibold w-20">Total</th>
              <th className="border border-slate-300 px-2 py-3 text-center text-emerald-700 bg-emerald-50/50 font-semibold w-20">Fixed</th>
              <th className="border border-slate-300 px-4 py-3 text-center text-red-700 bg-red-50/50 font-semibold w-16">Left</th>
              <th className="border border-slate-300 px-4 py-3 text-center font-semibold w-32">Target Date</th>
              <th className="border border-slate-300 px-4 py-3 text-center font-semibold w-40">Status</th>
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
                              className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 text-slate-900 font-medium appearance-none"
                              value={defect.totalDefects}
                              onChange={(e) => handleUpdate(defect.id, 'totalDefects', parseInt(e.target.value) || 0)}
                           />
                        </td>
                        <td className="border border-slate-300 px-0 py-0 text-center bg-emerald-50/10 relative">
                           <input 
                              type="number"
                              min="0"
                              className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:z-10 text-emerald-700 font-medium appearance-none"
                              value={defect.fixedDefects}
                              onChange={(e) => handleUpdate(defect.id, 'fixedDefects', parseInt(e.target.value) || 0)}
                           />
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center text-red-600 font-bold bg-red-50/10">
                          {remaining}
                        </td>
                        <td className="border border-slate-300 px-0 py-0 text-center relative">
                           <input 
                              type="text"
                              className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 text-indigo-700 font-medium text-xs"
                              placeholder="-"
                              value={defect.targetDate || ''}
                              onChange={(e) => handleUpdate(defect.id, 'targetDate', e.target.value)}
                           />
                        </td>
                        <td className="border border-slate-300 px-1 py-1 text-center">
                           <select 
                              className={`w-full text-xs font-bold border-0 bg-transparent py-1 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none ${
                                defect.status === 'Completed' ? 'text-green-700' :
                                defect.status === 'Pending' ? 'text-red-700' :
                                defect.status === 'Fixed (Wait CM)' ? 'text-amber-700' :
                                'text-slate-700'
                              }`}
                              value={defect.status}
                              onChange={(e) => handleUpdate(defect.id, 'status', e.target.value)}
                           >
                              {statusOptions.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                           </select>
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
              <td colSpan={2} className="border border-slate-600 px-4 py-4 text-center text-sm font-normal text-slate-300">
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