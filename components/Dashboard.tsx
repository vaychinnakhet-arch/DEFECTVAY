import React, { useRef } from 'react';
import { DefectRecord } from '../types';
import { ImageDown, GitCommitVertical, CheckCircle2, XCircle, Clock, Box } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DashboardProps {
  defects: DefectRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ defects }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // --- Data Aggregation Logic ---

  // 1. Total Defects (Head of the Fishbone)
  const grandTotal = defects.reduce((sum, d) => sum + d.totalDefects, 0);

  // 2. Verified Fixed (Rows where status is explicitly 'แก้ไขเรียบร้อย')
  // Note: We count the actual fixed numbers, or the total if the status implies completion.
  const verifiedFixedItems = defects.filter(d => d.status === 'แก้ไขเรียบร้อย' || (d.totalDefects > 0 && d.totalDefects === d.fixedDefects && d.status !== 'แก้ไขเรียบร้อย รอนัดตรวจ'));
  const verifiedFixedCount = verifiedFixedItems.reduce((sum, d) => sum + d.fixedDefects, 0);

  // 3. Waiting Inspection (Rows explicitly 'รอนัดตรวจ')
  const waitingItems = defects.filter(d => d.status === 'แก้ไขเรียบร้อย รอนัดตรวจ');
  const waitingCount = waitingItems.reduce((sum, d) => sum + d.totalDefects, 0); // Assuming waiting means physically done

  // 4. Pending / Not Fixed (The remaining defects in 'รอดำเนินการ' or partials)
  // We look at individual defects remaining
  const pendingCount = grandTotal - verifiedFixedCount - waitingCount; // Math check: Total - (Fixed + Waiting)

  // --- Helper to Group by Category for Sub-branches ---
  const groupByCategory = (items: DefectRecord[], countField: 'total' | 'fixed' | 'remaining') => {
    const groups: Record<string, number> = {};
    items.forEach(d => {
        let val = 0;
        if (countField === 'total') val = d.totalDefects;
        if (countField === 'fixed') val = d.fixedDefects;
        if (countField === 'remaining') val = d.totalDefects - d.fixedDefects;
        
        if (val > 0) {
            groups[d.category] = (groups[d.category] || 0) + val;
        }
    });
    return Object.entries(groups)
        .sort((a, b) => b[1] - a[1]) // Sort by count desc
        .map(([name, count]) => ({ name, count }));
  };

  // Generate Sub-lists
  const fixedCategories = groupByCategory(verifiedFixedItems, 'fixed');
  const waitingCategories = groupByCategory(waitingItems, 'total');
  
  // For pending, we need to iterate all rows and find remaining > 0
  const pendingGroups: Record<string, number> = {};
  defects.forEach(d => {
      // Exclude waiting items from pending count to avoid double counting if logic overlaps
      if (d.status !== 'แก้ไขเรียบร้อย รอนัดตรวจ' && d.status !== 'แก้ไขเรียบร้อย') {
          const rem = d.totalDefects - d.fixedDefects;
          if (rem > 0) {
              pendingGroups[d.category] = (pendingGroups[d.category] || 0) + rem;
          }
      }
  });
  const pendingCategories = Object.entries(pendingGroups)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));


  const handleExportImage = async () => {
    if (contentRef.current) {
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2,
                backgroundColor: '#f8fafc',
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `fishbone-diagram-${new Date().toISOString().split('T')[0]}.png`;
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
             Save Diagram
          </button>
      </div>

      <div ref={contentRef} className="bg-slate-50 p-8 rounded-xl min-h-[600px] flex justify-center items-start overflow-x-auto">
        <div className="flex flex-col items-center w-full max-w-6xl">
            
            {/* --- LEVEL 1: HEAD (TOTAL) --- */}
            <div className="relative z-10 mb-8">
                <div className="bg-slate-900 text-white px-8 py-6 rounded-3xl shadow-xl flex flex-col items-center border-4 border-slate-200 min-w-[280px]">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300">Defect ทั้งหมด</h2>
                    <div className="text-5xl font-black mt-2 text-white">{grandTotal} <span className="text-lg font-normal text-slate-400">ข้อ</span></div>
                </div>
                {/* Connector Line Down */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full h-8 w-1 bg-slate-300"></div>
            </div>

            {/* --- LEVEL 2: BRANCHES --- */}
            <div className="relative w-full flex justify-center gap-8 lg:gap-16">
                
                {/* Horizontal Connector Bar */}
                {/* Connects the centers of the three columns */}
                <div className="absolute top-0 left-[16%] right-[16%] h-1 bg-slate-300 -translate-y-[1px]"></div>
                
                {/* --- BRANCH 1: FIXED --- */}
                <div className="flex flex-col items-center w-1/3 relative">
                    {/* Vertical Connector from Bar */}
                    <div className="h-8 w-1 bg-slate-300 mb-0"></div>
                    
                    {/* Status Node */}
                    <div className="bg-emerald-50 border-2 border-emerald-200 px-6 py-4 rounded-xl shadow-sm w-full max-w-[280px] text-center mb-4 relative group">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white p-1 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="text-emerald-800 font-bold text-lg mt-2">แก้ไขแล้ว</h3>
                        <div className="text-3xl font-black text-emerald-600">{verifiedFixedCount} <span className="text-sm font-normal text-emerald-800/60">ข้อ</span></div>
                    </div>

                    {/* Sub-branches (List) */}
                    <div className="w-full max-w-[240px] flex flex-col gap-2 relative">
                        {/* Center Line for sub-branches */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-4 w-0.5 bg-emerald-200/50 -z-10"></div>
                        
                        {fixedCategories.map((cat, idx) => (
                            <div key={idx} className="bg-white border border-emerald-100 p-2 rounded-lg shadow-sm flex justify-between items-center text-sm relative z-0">
                                <span className="font-medium text-slate-700 truncate w-2/3 text-left pl-2">{cat.name}</span>
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-xs">{cat.count}</span>
                            </div>
                        ))}
                         {fixedCategories.length === 0 && <div className="text-center text-slate-400 text-sm py-2">ไม่มีรายการ</div>}
                    </div>
                </div>

                {/* --- BRANCH 2: PENDING (NOT FIXED) --- */}
                <div className="flex flex-col items-center w-1/3 relative">
                    {/* Vertical Connector from Bar */}
                    <div className="h-8 w-1 bg-slate-300 mb-0"></div>

                     {/* Status Node */}
                     <div className="bg-red-50 border-2 border-red-200 px-6 py-4 rounded-xl shadow-sm w-full max-w-[280px] text-center mb-4 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white p-1 rounded-full border border-red-100">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-red-800 font-bold text-lg mt-2">ยังไม่แก้ไข</h3>
                        <div className="text-3xl font-black text-red-600">{pendingCount} <span className="text-sm font-normal text-red-800/60">ข้อ</span></div>
                    </div>

                    {/* Sub-branches (List) */}
                    <div className="w-full max-w-[240px] flex flex-col gap-2 relative">
                         {/* Center Line for sub-branches */}
                         <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-4 w-0.5 bg-red-200/50 -z-10"></div>

                         {pendingCategories.map((cat, idx) => (
                            <div key={idx} className="bg-white border border-red-100 p-2 rounded-lg shadow-sm flex justify-between items-center text-sm relative z-0">
                                <span className="font-medium text-slate-700 truncate w-2/3 text-left pl-2">{cat.name}</span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold text-xs">{cat.count}</span>
                            </div>
                        ))}
                        {pendingCategories.length === 0 && <div className="text-center text-slate-400 text-sm py-2">ไม่มีรายการ</div>}
                    </div>
                </div>

                 {/* --- BRANCH 3: WAITING INSPECTION --- */}
                 <div className="flex flex-col items-center w-1/3 relative">
                    {/* Vertical Connector from Bar */}
                    <div className="h-8 w-1 bg-slate-300 mb-0"></div>

                     {/* Status Node */}
                     <div className="bg-amber-50 border-2 border-amber-200 px-6 py-4 rounded-xl shadow-sm w-full max-w-[280px] text-center mb-4 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white p-1 rounded-full border border-amber-100">
                            <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        <h3 className="text-amber-800 font-bold text-lg mt-2">แก้ไขแล้วรอตรวจ</h3>
                        <div className="text-3xl font-black text-amber-600">{waitingCount} <span className="text-sm font-normal text-amber-800/60">ข้อ</span></div>
                    </div>

                    {/* Sub-branches (List) */}
                    <div className="w-full max-w-[240px] flex flex-col gap-2 relative">
                        {/* Center Line for sub-branches */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-4 w-0.5 bg-amber-200/50 -z-10"></div>

                        {waitingCategories.map((cat, idx) => (
                            <div key={idx} className="bg-white border border-amber-100 p-2 rounded-lg shadow-sm flex justify-between items-center text-sm relative z-0">
                                <span className="font-medium text-slate-700 truncate w-2/3 text-left pl-2">{cat.name}</span>
                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold text-xs">{cat.count}</span>
                            </div>
                        ))}
                        {waitingCategories.length === 0 && <div className="text-center text-slate-400 text-sm py-2">ไม่มีรายการ</div>}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;