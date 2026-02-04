import React, { useState } from 'react';
import { INITIAL_DEFECTS } from './constants';
import { DefectRecord } from './types';
import Dashboard from './components/Dashboard';
import DefectList from './components/DefectList';
import SummaryReport from './components/SummaryReport';
import PowerPointView from './components/PowerPointView';
import PowerPointDetailView from './components/PowerPointDetailView';
import AIInsight from './components/AIInsight';
import { LayoutDashboard, Table as TableIcon, Building2, FileSpreadsheet, Presentation, ListChecks } from 'lucide-react';

enum ViewMode {
  DASHBOARD = 'dashboard',
  TABLE = 'table',
  SUMMARY = 'summary',
  PPT = 'ppt',
  PPT_DETAIL = 'ppt_detail'
}

const App: React.FC = () => {
  const [defects, setDefects] = useState<DefectRecord[]>(INITIAL_DEFECTS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);

  const handleUpdate = (updated: DefectRecord) => {
    setDefects(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setDefects(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleAdd = (newDefect: DefectRecord) => {
    setDefects(prev => [...prev, newDefect]);
  };

  const handleImport = (importedData: DefectRecord[]) => {
    setDefects(importedData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">VAY CHINNAKHET</h1>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:hidden">VC</h1>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1 overflow-x-auto gap-1">
              <button
                onClick={() => setViewMode(ViewMode.DASHBOARD)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === ViewMode.DASHBOARD 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setViewMode(ViewMode.TABLE)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === ViewMode.TABLE 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Data Entry</span>
                <span className="sm:hidden">Data</span>
              </button>
              <button
                onClick={() => setViewMode(ViewMode.SUMMARY)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === ViewMode.SUMMARY 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Summary Excel</span>
                <span className="sm:hidden">Excel</span>
              </button>
              <button
                onClick={() => setViewMode(ViewMode.PPT)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === ViewMode.PPT 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span className="hidden sm:inline">PPT Summary</span>
                <span className="sm:hidden">PPT Sum</span>
              </button>
              <button
                onClick={() => setViewMode(ViewMode.PPT_DETAIL)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === ViewMode.PPT_DETAIL 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                <span className="hidden sm:inline">PPT Detail</span>
                <span className="sm:hidden">PPT All</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:w-full print:max-w-none">
        
        {/* Gemini AI Insight Section - Always Visible except print */}
        <div className="mb-8 print:hidden">
           <AIInsight defects={defects} />
        </div>

        {viewMode === ViewMode.DASHBOARD && (
          <div className="animate-fade-in print:hidden">
             <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Project Overview</h2>
                <span className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</span>
             </div>
             <Dashboard defects={defects} />
             
             {/* Quick view of recent items or critical items could go here */}
             <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Pending CM Approval</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-6 py-3">Location</th>
                          <th className="px-6 py-3">Defects</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {defects.filter(d => d.status === 'Fixed (Wait CM)').map(d => (
                          <tr key={d.id}>
                            <td className="px-6 py-3 font-medium text-slate-700">{d.location}</td>
                            <td className="px-6 py-3 text-slate-600">{d.totalDefects}</td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full border border-amber-200">{d.status}</span>
                            </td>
                          </tr>
                        ))}
                         {defects.filter(d => d.status === 'Fixed (Wait CM)').length === 0 && (
                           <tr><td colSpan={3} className="px-6 py-4 text-center text-slate-400">No items waiting for approval.</td></tr>
                         )}
                      </tbody>
                    </table>
                </div>
             </div>
          </div>
        )}

        {viewMode === ViewMode.TABLE && (
          <div className="animate-fade-in print:hidden">
             <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Defect Registry</h2>
                <p className="text-slate-500">Manage and update defect records per location.</p>
             </div>
             <DefectList 
               defects={defects} 
               onUpdate={handleUpdate} 
               onDelete={handleDelete}
               onAdd={handleAdd}
               onImport={handleImport}
             />
          </div>
        )}

        {viewMode === ViewMode.SUMMARY && (
           <div className="animate-fade-in">
              <div className="mb-6 print:hidden">
                <h2 className="text-2xl font-bold text-slate-800">Project Summary Report</h2>
                <p className="text-slate-500">Detailed breakdown of total, fixed, and remaining defects. Click numbers to edit.</p>
             </div>
             <SummaryReport defects={defects} onUpdate={handleUpdate} />
           </div>
        )}

        {viewMode === ViewMode.PPT && (
           <div className="animate-fade-in">
             <PowerPointView defects={defects} />
           </div>
        )}

        {viewMode === ViewMode.PPT_DETAIL && (
           <div className="animate-fade-in">
             <PowerPointDetailView defects={defects} />
           </div>
        )}
      </main>
    </div>
  );
};

export default App;