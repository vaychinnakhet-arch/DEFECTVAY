import React, { useRef } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { DefectRecord, DefectStatus } from '../types';
import { CheckCircle2, AlertCircle, Clock, XCircle, ArrowRight, ImageDown } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DashboardProps {
  defects: DefectRecord[];
}

const STATUS_COLORS_CHART = {
  'แก้ไขเรียบร้อย': '#10b981',        // Emerald 500
  'รอดำเนินการ': '#ef4444',          // Red 500
  'แก้ไขเรียบร้อย รอนัดตรวจ': '#f59e0b',  // Amber 500
  'ไม่มี Defect': '#3b82f6',        // Blue 500
  'ยังไม่ตรวจ': '#94a3b8',      // Slate 400
};

const Dashboard: React.FC<DashboardProps> = ({ defects }) => {
  const contentRef = useRef<HTMLDivElement>(null);

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
       if (d.totalDefects > 0 && d.totalDefects === d.fixedDefects) statusKey = 'แก้ไขเรียบร้อย';
       
       counts[statusKey] = (counts[statusKey] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [defects]);

  // Helper to render status badge
  const StatusBadge = ({ status, total, fixed }: { status: string, total: number, fixed: number }) => {
    const isCompleted = (total > 0 && total === fixed) || status === 'แก้ไขเรียบร้อย';
    
    if (isCompleted) {
      return <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-bold bg-emerald-100 text-emerald-700">แก้ไขเรียบร้อย</span>;
    }
    if (status === 'แก้ไขเรียบร้อย รอนัดตรวจ') {
       return <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-bold bg-amber-100 text-amber-700">รอนัดตรวจ</span>;
    }
    if (status === 'รอดำเนินการ') {
       return <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-bold bg-red-100 text-red-700">รอดำเนินการ</span>;
    }
    return <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-bold bg-slate-100 text-slate-600">{status}</span>;
  };

  const handleExportImage = async () => {
    if (contentRef.current) {
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2, // 2x scale for better mobile resolution
                backgroundColor: '#f8fafc', // match bg-slate-50
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `dashboard-snapshot-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Snapshot failed', error);
            alert('Failed to generate image.');
        }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end print:hidden">
          <button 
             onClick={handleExportImage}
             className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
             <ImageDown className="w-4 h-4" />
             Save Image
          </button>
      </div>

      <div ref={contentRef} className="space-y-8 bg-slate-50 p-2 rounded-xl">
        {/* 1. HERO SECTION: Flat Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between h-40 relative overflow-hidden group hover:border-blue-400 transition-colors">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-slate-500 font-bold text-lg uppercase tracking-wide">Total Defects</h3>
                <div className="p-2 bg-blue-50 rounded text-blue-600">
                <AlertCircle className="w-6 h-6" />
                </div>
            </div>
            <div className="z-10">
                <span className="text-6xl font-bold text-slate-800 tracking-tight">{totalDefects}</span>
                <span className="text-lg text-slate-400 ml-2">issues</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-50 rounded-full group-hover:scale-110 transition-transform"></div>
            </div>

            {/* Fixed Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between h-40 relative overflow-hidden group hover:border-emerald-400 transition-colors">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-slate-500 font-bold text-lg uppercase tracking-wide">Fixed</h3>
                <div className="p-2 bg-emerald-50 rounded text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
            <div className="z-10">
                <span className="text-6xl font-bold text-emerald-600 tracking-tight">{fixedDefects}</span>
                <span className="text-lg text-slate-400 ml-2">resolved</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform"></div>
            </div>

            {/* Remaining Card */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between h-40 relative overflow-hidden group hover:border-red-400 transition-colors">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-slate-500 font-bold text-lg uppercase tracking-wide">Remaining</h3>
                <div className="p-2 bg-red-50 rounded text-red-600">
                <XCircle className="w-6 h-6" />
                </div>
            </div>
            <div className="z-10">
                <span className="text-6xl font-bold text-red-600 tracking-tight">{remainingDefects}</span>
                <span className="text-lg text-slate-400 ml-2">active</span>
            </div>
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-red-50 rounded-full group-hover:scale-110 transition-transform"></div>
            </div>

            {/* Progress Card */}
            <div className="bg-slate-800 text-white p-6 rounded-xl flex flex-col justify-between h-40 relative overflow-hidden">
            <div className="flex justify-between items-start z-10">
                <h3 className="text-slate-300 font-bold text-lg uppercase tracking-wide">Completion</h3>
                <div className="text-sm px-3 py-1 bg-white/10 rounded-full">{overallProgress}%</div>
            </div>
            
            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden mt-4">
                <div 
                    className="bg-emerald-400 h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${overallProgress}%` }}
                ></div>
            </div>
            <div className="mt-2 text-sm text-slate-400 flex justify-between">
                <span>Start</span>
                <span>Target: 100%</span>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. MAIN SECTION: Categories Grid (Takes up 2/3 space) */}
            <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Area Breakdown
                </h3>
                <span className="text-sm text-slate-400 font-medium">Categorized by Location</span>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {Object.entries(categoryGroups).map(([categoryName, items]) => {
                // Calculate stats for this category
                const catTotal = items.reduce((sum, i) => sum + i.totalDefects, 0);
                const catFixed = items.reduce((sum, i) => sum + i.fixedDefects, 0);
                const catProgress = catTotal > 0 ? (catFixed / catTotal) * 100 : 0;
                const isCatComplete = catTotal > 0 && catTotal === catFixed;

                return (
                    <div key={categoryName} className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden hover:border-slate-300 transition-colors">
                    {/* Category Header */}
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                        <h4 className="font-bold text-xl text-slate-800">{categoryName}</h4>
                        <span className="text-sm text-slate-500 font-medium">({items.length} locations)</span>
                        </div>
                        <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-slate-700">{catFixed} / {catTotal} Fixed</span>
                            <div className="w-32 h-2 bg-slate-200 rounded-full mt-1.5">
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
                        const itemComplete = (item.totalDefects > 0 && item.totalDefects === item.fixedDefects) || item.status === 'แก้ไขเรียบร้อย';
                        const itemPercentage = item.totalDefects > 0 ? Math.round((item.fixedDefects / item.totalDefects) * 100) : 0;
                        
                        return (
                            <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                    itemComplete ? 'bg-emerald-400' : 
                                    item.status === 'รอดำเนินการ' ? 'bg-red-400' :
                                    item.status === 'แก้ไขเรียบร้อย รอนัดตรวจ' ? 'bg-amber-400' : 'bg-slate-300'
                                }`}></div>
                                <span className="text-lg font-medium text-slate-700 truncate">{item.location}</span>
                            </div>
                            
                            <div className="flex items-center gap-8">
                                {/* Simple Stats for Sub-item */}
                                <div className="hidden sm:block w-32">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Progress</span>
                                    <span>{itemPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${itemComplete ? 'bg-emerald-400' : 'bg-slate-400'}`} 
                                        style={{ width: `${itemPercentage}%` }}
                                    ></div>
                                    </div>
                                </div>

                                <div className="text-sm font-mono text-slate-500 w-16 text-right">
                                    {item.fixedDefects}/{item.totalDefects}
                                </div>

                                <div className="w-28 text-right">
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
            <div className="space-y-8">
            {/* Status Distribution */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h4 className="text-base font-bold text-slate-700 uppercase tracking-wide mb-6 border-b border-slate-100 pb-3">Status Overview</h4>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={STATUS_COLORS_CHART[entry.name as keyof typeof STATUS_COLORS_CHART] || '#94a3b8'} strokeWidth={0} />
                            ))}
                        </Pie>
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                            itemStyle={{ fontSize: '16px', fontWeight: 600 }}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-bold text-slate-800">{defects.length}</span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Locations</span>
                    </div>
                </div>
                <div className="space-y-3 mt-4">
                    {statusData.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: STATUS_COLORS_CHART[item.name as keyof typeof STATUS_COLORS_CHART] || '#94a3b8' }}></div>
                            <span className="text-slate-600 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800 text-base">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Needs Attention List */}
            <div className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-red-50/50">
                    <h4 className="text-base font-bold text-red-800 uppercase tracking-wide flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Priority Actions
                    </h4>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    {defects.filter(d => d.status === 'รอดำเนินการ' && d.totalDefects > 0).map((d) => (
                        <div key={d.id} className="px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group cursor-pointer">
                        <div className="flex justify-between items-start mb-1.5">
                            <span className="text-lg font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{d.location}</span>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">{d.totalDefects - d.fixedDefects} left</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-500">
                            <span>{d.category}</span>
                            <span className="text-red-500 font-medium">{d.targetDate ? `Due: ${d.targetDate}` : 'No deadline'}</span>
                        </div>
                        </div>
                    ))}
                    {defects.filter(d => d.status === 'รอดำเนินการ').length === 0 && (
                        <div className="p-10 text-center text-slate-400 text-base">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-200" />
                        No pending actions.
                        </div>
                    )}
                </div>
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 w-full py-1">
                        View All Details <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;