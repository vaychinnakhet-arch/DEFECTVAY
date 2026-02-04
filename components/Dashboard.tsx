import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { DefectRecord, DefectStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

interface DashboardProps {
  defects: DefectRecord[];
}

const STATUS_COLORS_CHART = {
  'Completed': '#10b981',        // Emerald 500
  'Pending': '#ef4444',          // Red 500
  'Fixed (Wait CM)': '#f59e0b',  // Amber 500
  'No Defect': '#3b82f6',        // Blue 500
  'Not Checked': '#94a3b8',      // Slate 400
};

const Dashboard: React.FC<DashboardProps> = ({ defects }) => {
  // 1. Calculate Overall Stats
  const totalDefects = defects.reduce((acc, curr) => acc + curr.totalDefects, 0);
  const fixedDefects = defects.reduce((acc, curr) => acc + curr.fixedDefects, 0);
  const remainingDefects = totalDefects - fixedDefects;
  const overallProgress = totalDefects > 0 ? Math.round((fixedDefects / totalDefects) * 100) : 0;

  // 2. Group Data by Category (หมวดใหญ่)
  const categoryGroups = React.useMemo(() => {
    const groups: Record<string, DefectRecord[]> = {};
    defects.forEach(d => {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    });
    return groups;
  }, [defects]);

  // 3. Status Distribution for Chart
  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    defects.forEach(d => {
       // Simplify status logic for chart
       let statusKey = d.status;
       if (d.totalDefects > 0 && d.totalDefects === d.fixedDefects) statusKey = 'Completed';
       
       counts[statusKey] = (counts[statusKey] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [defects]);

  // Helper to render status badge
  const StatusBadge = ({ status, total, fixed }: { status: string, total: number, fixed: number }) => {
    const isCompleted = (total > 0 && total === fixed) || status === 'Completed';
    
    if (isCompleted) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Completed</span>;
    }
    if (status === 'Fixed (Wait CM)') {
       return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Wait CM</span>;
    }
    if (status === 'Pending') {
       return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">Pending</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{status}</span>;
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO SECTION: Flat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-400 transition-colors">
          <div className="flex justify-between items-start z-10">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Total Defects</h3>
            <div className="p-1.5 bg-blue-50 rounded text-blue-600">
               <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="z-10">
            <span className="text-4xl font-bold text-slate-800 tracking-tight">{totalDefects}</span>
            <span className="text-sm text-slate-400 ml-2">issues</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Fixed Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden group hover:border-emerald-400 transition-colors">
          <div className="flex justify-between items-start z-10">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Fixed</h3>
            <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
               <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="z-10">
            <span className="text-4xl font-bold text-emerald-600 tracking-tight">{fixedDefects}</span>
            <span className="text-sm text-slate-400 ml-2">resolved</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Remaining Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden group hover:border-red-400 transition-colors">
          <div className="flex justify-between items-start z-10">
            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Remaining</h3>
            <div className="p-1.5 bg-red-50 rounded text-red-600">
               <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="z-10">
             <span className="text-4xl font-bold text-red-600 tracking-tight">{remainingDefects}</span>
             <span className="text-sm text-slate-400 ml-2">active</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
        </div>

        {/* Progress Card */}
        <div className="bg-slate-800 text-white p-5 rounded-lg flex flex-col justify-between h-32 relative overflow-hidden">
           <div className="flex justify-between items-start z-10">
             <h3 className="text-slate-300 font-medium text-sm uppercase tracking-wide">Completion</h3>
             <div className="text-xs px-2 py-1 bg-white/10 rounded-full">{overallProgress}%</div>
           </div>
           
           <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-emerald-400 h-full transition-all duration-1000 ease-out" 
                style={{ width: `${overallProgress}%` }}
              ></div>
           </div>
           <div className="mt-2 text-xs text-slate-400 flex justify-between">
              <span>Start</span>
              <span>Target: 100%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. MAIN SECTION: Categories Grid (Takes up 2/3 space) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                Area Breakdown
             </h3>
             <span className="text-xs text-slate-400 font-medium">Categorized by Location</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(categoryGroups).map(([categoryName, items]) => {
              // Calculate stats for this category
              const catTotal = items.reduce((sum, i) => sum + i.totalDefects, 0);
              const catFixed = items.reduce((sum, i) => sum + i.fixedDefects, 0);
              const catProgress = catTotal > 0 ? (catFixed / catTotal) * 100 : 0;
              const isCatComplete = catTotal > 0 && catTotal === catFixed;

              return (
                <div key={categoryName} className="bg-white border border-slate-200 rounded-lg p-0 overflow-hidden hover:border-slate-300 transition-colors">
                  {/* Category Header */}
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800">{categoryName}</h4>
                      <span className="text-xs text-slate-500 font-medium">({items.length} locations)</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-slate-700">{catFixed} / {catTotal} Fixed</span>
                          <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1">
                              <div 
                                className={`h-full rounded-full ${isCatComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                style={{ width: `${catProgress}%` }}
                              ></div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Sub-items (List) */}
                  <div className="divide-y divide-slate-50">
                    {items.map(item => {
                       const itemComplete = (item.totalDefects > 0 && item.totalDefects === item.fixedDefects) || item.status === 'Completed';
                       const itemPercentage = item.totalDefects > 0 ? Math.round((item.fixedDefects / item.totalDefects) * 100) : 0;
                       
                       return (
                        <div key={item.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                           <div className="flex items-center gap-3 flex-1">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                itemComplete ? 'bg-emerald-400' : 
                                item.status === 'Pending' ? 'bg-red-400' :
                                item.status === 'Fixed (Wait CM)' ? 'bg-amber-400' : 'bg-slate-300'
                              }`}></div>
                              <span className="text-sm font-medium text-slate-700 truncate">{item.location}</span>
                           </div>
                           
                           <div className="flex items-center gap-6">
                              {/* Simple Stats for Sub-item */}
                              <div className="hidden sm:block w-24">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                   <span>Progress</span>
                                   <span>{itemPercentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full rounded-full ${itemComplete ? 'bg-emerald-400' : 'bg-slate-400'}`} 
                                     style={{ width: `${itemPercentage}%` }}
                                   ></div>
                                </div>
                              </div>

                              <div className="text-xs font-mono text-slate-500 w-12 text-right">
                                {item.fixedDefects}/{item.totalDefects}
                              </div>

                              <div className="w-20 text-right">
                                <StatusBadge status={item.status} total={item.totalDefects} fixed={item.fixedDefects} />
                              </div>
                           </div>
                        </div>
                       );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SIDEBAR SECTION: Charts & Action Items */}
        <div className="space-y-6">
           {/* Status Distribution */}
           <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 border-b border-slate-100 pb-2">Status Overview</h4>
              <div className="h-48 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS_CHART[entry.name as keyof typeof STATUS_COLORS_CHART] || '#94a3b8'} strokeWidth={0} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                         contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                         itemStyle={{ fontSize: '12px' }}
                      />
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800">{defects.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase">Locations</span>
                 </div>
              </div>
              <div className="space-y-2 mt-2">
                 {statusData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-xs">
                       <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLORS_CHART[item.name as keyof typeof STATUS_COLORS_CHART] || '#94a3b8' }}></div>
                          <span className="text-slate-600">{item.name}</span>
                       </div>
                       <span className="font-bold text-slate-800">{item.value}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Needs Attention List */}
           <div className="bg-white border border-slate-200 rounded-lg p-0 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-red-50/30">
                 <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Priority Actions
                 </h4>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                 {defects.filter(d => d.status === 'Pending' && d.totalDefects > 0).map((d) => (
                    <div key={d.id} className="px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group cursor-pointer">
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{d.location}</span>
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{d.totalDefects - d.fixedDefects} left</span>
                       </div>
                       <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>{d.category}</span>
                          <span className="text-red-500 font-medium">{d.targetDate ? `Due: ${d.targetDate}` : 'No deadline'}</span>
                       </div>
                    </div>
                 ))}
                 {defects.filter(d => d.status === 'Pending').length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                       <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
                       No pending actions.
                    </div>
                 )}
              </div>
              <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 w-full">
                    View All Details <ArrowRight className="w-3 h-3" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;