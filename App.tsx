import React, { useState, useEffect } from 'react';
import { DefectRecord } from './types';
import Dashboard from './components/Dashboard';
import SummaryReport from './components/SummaryReport';
import PowerPointView from './components/PowerPointView';
import PowerPointDetailView from './components/PowerPointDetailView';
import { LayoutDashboard, Building2, FileSpreadsheet, Presentation, ListChecks, WifiOff } from 'lucide-react';
import { supabase } from './supabaseClient';

enum ViewMode {
  DASHBOARD = 'dashboard',
  SUMMARY = 'summary',
  PPT = 'ppt',
  PPT_DETAIL = 'ppt_detail'
}

const App: React.FC = () => {
  const [defects, setDefects] = useState<DefectRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to map DB snake_case to App camelCase
  const mapFromDB = (data: any): DefectRecord => ({
    id: data.id,
    category: data.category,
    location: data.location,
    totalDefects: data.total_defects,
    fixedDefects: data.fixed_defects,
    status: data.status,
    targetDate: data.target_date || '',
    note: data.note || ''
  });

  // Helper to map App camelCase to DB snake_case
  const mapToDB = (data: DefectRecord) => ({
    id: data.id,
    category: data.category,
    location: data.location,
    total_defects: data.totalDefects,
    fixed_defects: data.fixedDefects,
    status: data.status,
    target_date: data.targetDate,
    note: data.note
  });

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('defects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching defects:', error);
        setError('Could not connect to database. Please check your internet or .env configuration.');
      } else if (data) {
        setDefects(data.map(mapFromDB));
        setError(null);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-defects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'defects' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDefects((prev) => [...prev, mapFromDB(payload.new)]);
          } else if (payload.eventType === 'UPDATE') {
            setDefects((prev) => 
              prev.map((d) => d.id === payload.new.id ? mapFromDB(payload.new) : d)
            );
          } else if (payload.eventType === 'DELETE') {
            setDefects((prev) => prev.filter((d) => d.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdate = async (updated: DefectRecord) => {
    // Optimistic UI update
    setDefects(prev => prev.map(d => d.id === updated.id ? updated : d));

    const { error } = await supabase
      .from('defects')
      .update(mapToDB(updated))
      .eq('id', updated.id);

    if (error) {
      console.error('Error updating defect:', error);
      alert('Failed to update record in database.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      const { error } = await supabase
        .from('defects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting defect:', error);
        alert('Failed to delete record.');
      }
    }
  };

  const handleAdd = async (newDefect: DefectRecord) => {
    const { error } = await supabase
      .from('defects')
      .insert([mapToDB(newDefect)]);

    if (error) {
      console.error('Error adding defect:', error);
      alert('Failed to add record.');
    }
  };

  const handleImport = async (importedData: DefectRecord[]) => {
    try {
      setLoading(true);
      const dbData = importedData.map(mapToDB);
      
      // Upsert: Updates existing IDs and Inserts new ones
      const { error } = await supabase
        .from('defects')
        .upsert(dbData, { onConflict: 'id' });

      if (error) throw error;

      alert('Import successful! Data has been updated.');
      
      // Refresh local data
      const { data: refreshedData } = await supabase
          .from('defects')
          .select('*')
          .order('created_at', { ascending: true });
          
      if (refreshedData) {
        setDefects(refreshedData.map(mapFromDB));
      }
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Connecting to Database...</p>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">VAY CHINNAKHET</h1>
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
        
        {error && (
           <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
             <WifiOff className="w-5 h-5" />
             <span>{error}</span>
           </div>
        )}

        {viewMode === ViewMode.DASHBOARD && (
          <div className="animate-fade-in print:hidden">
             <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Project Overview</h2>
                  <p className="text-slate-500 mt-1">Real-time statistics and status updates.</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Realtime Sync Active
                  </span>
                </div>
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
             <SummaryReport 
                defects={defects} 
                onUpdate={handleUpdate} 
                onAdd={handleAdd}
                onDelete={handleDelete}
                onImport={handleImport}
             />
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