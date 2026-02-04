import React, { useState } from 'react';
import { INITIAL_DEFECTS } from './constants';
import { DefectRecord } from './types';
import Dashboard from './components/Dashboard';
import SummaryReport from './components/SummaryReport';
import PowerPointView from './components/PowerPointView';
import PowerPointDetailView from './components/PowerPointDetailView';
import { LayoutDashboard, Building2, FileSpreadsheet, Presentation, ListChecks } from 'lucide-react';

enum ViewMode {
  DASHBOARD = 'dashboard',
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

  const NavButton = ({ mode, icon, label, activeColorClass = 'text-blue-700' }: { mode: ViewMode, icon: React.ReactNode, label: string, activeColorClass?: string }) => {
    const isActive = viewMode === mode;
    return (
      <button
        onClick={() => setViewMode(mode)}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
          isActive 
            ? `bg-white text-slate-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5 scale-[1.02]` 
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
        }`}
      >
        <span className={`transition-colors duration-300 ${isActive ? activeColorClass : 'text-current'}`}>
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between h-auto md:h-20 items-center py-4 md:py-0 gap-4 md:gap-8">
            {/* Logo Section */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-900/10 shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none font-sarabun">VAY CHINNAKHET</h1>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Construction Defect Management</span>
              </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto max-w-full w-full md:w-auto no-scrollbar border border-slate-200/50">
              <NavButton 
                mode={ViewMode.DASHBOARD} 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="Dashboard" 
              />
              <NavButton 
                mode={ViewMode.SUMMARY} 
                icon={<FileSpreadsheet className="w-4 h-4" />} 
                label="Summary / Input" 
                activeColorClass="text-emerald-600"
              />
              <NavButton 
                mode={ViewMode.PPT} 
                icon={<Presentation className="w-4 h-4" />} 
                label="PPT Overview" 
                activeColorClass="text-indigo-600"
              />
              <NavButton 
                mode={ViewMode.PPT_DETAIL} 
                icon={<ListChecks className="w-4 h-4" />} 
                label="PPT Detail" 
                activeColorClass="text-violet-600"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:w-full print:max-w-none">
        
        {viewMode === ViewMode.DASHBOARD && (
          <div className="animate-fade-in print:hidden">
             <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Project Overview</h2>
                  <p className="text-slate-500 mt-1">Real-time statistics and status updates.</p>
                </div>
                <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
             </div>
             <Dashboard defects={defects} />
             
             {/* Quick view of recent items or critical items */}
             <div className="mt-10">
                <div className="flex items-center gap-2 mb-5">
                   <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                   <h3 className="text-xl font-bold text-slate-800">Pending CM Approval</h3>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Defects</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {defects.filter(d => d.status === 'Fixed (Wait CM)').map(d => (
                          <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">{d.location}</td>
                            <td className="px-6 py-4 text-slate-600">{d.totalDefects}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                {d.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                         {defects.filter(d => d.status === 'Fixed (Wait CM)').length === 0 && (
                           <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No items waiting for approval.</td></tr>
                         )}
                      </tbody>
                    </table>
                </div>
             </div>
          </div>
        )}

        {viewMode === ViewMode.SUMMARY && (
           <div className="animate-fade-in">
              <div className="mb-8 print:hidden">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Summary & Data Entry</h2>
                <p className="text-slate-500 mt-1">Edit defects, target dates, and statuses directly in the table below. Changes update PPT views automatically.</p>
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