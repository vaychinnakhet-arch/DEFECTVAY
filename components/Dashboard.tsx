import React, { useRef } from 'react';
import { DefectRecord } from '../types';
import { ImageDown, CheckCircle2, XCircle, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DashboardProps {
  defects: DefectRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ defects }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // --- Data Aggregation Logic ---

  // 1. Total Defects (Head of the Fishbone)
  const grandTotal = defects.reduce((sum, d) => sum + d.totalDefects, 0);

  // 2. Verified Fixed
  const verifiedFixedItems = defects.filter(d => d.status === 'แก้ไขเรียบร้อย' || (d.totalDefects > 0 && d.totalDefects === d.fixedDefects && d.status !== 'แก้ไขเรียบร้อย รอนัดตรวจ'));
  const verifiedFixedCount = verifiedFixedItems.reduce((sum, d) => sum + d.fixedDefects, 0);

  // 3. Waiting Inspection
  const waitingItems = defects.filter(d => d.status === 'แก้ไขเรียบร้อย รอนัดตรวจ');
  const waitingCount = waitingItems.reduce((sum, d) => sum + d.totalDefects, 0);

  // 4. Pending / Not Fixed
  const pendingCount = grandTotal - verifiedFixedCount - waitingCount;

  // --- Helper to Group by Category ---
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

  const fixedCategories = groupByCategory(verifiedFixedItems, 'fixed');
  const waitingCategories = groupByCategory(waitingItems, 'total');
  
  const pendingGroups: Record<string, number> = {};
  defects.forEach(d => {
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
                scale: 3, // High scale for clear text
                backgroundColor: '#ffffff',
                useCORS: true,
                onclone: (clonedDoc) => {
                    // Force text alignment on clone to ensure centering in the output image
                    const textCentered = clonedDoc.querySelectorAll('.text-center');
                    textCentered.forEach((el) => {
                        if (el instanceof HTMLElement) {
                            el.style.textAlign = 'center';
                            el.style.width = '100%'; 
                        }
                    });
                    
                    // Force flex centering
                    const flexCentered = clonedDoc.querySelectorAll('.flex-col.items-center');
                    flexCentered.forEach((el) => {
                         if (el instanceof HTMLElement) {
                            el.style.display = 'flex';
                            el.style.flexDirection = 'column';
                            el.style.alignItems = 'center';
                        }
                    });
                }
            });
            const link = document.createElement('a');
            link.download = `dashboard-diagram-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Snapshot failed', error);
            alert('Failed to generate image.');
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end print:hidden">
          <button 
             onClick={handleExportImage}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
             <ImageDown className="w-4 h-4" />
             Save Diagram
          </button>
      </div>

      {/* Diagram Container */}
      <div className="overflow-x-auto pb-4">
          <div ref={contentRef} className="bg-white p-10 rounded-xl flex flex-col items-center min-w-[1024px] w-fit mx-auto">
            
            {/* --- LEVEL 1: HEAD (TOTAL) --- */}
            <div className="relative z-10 mb-10 w-full flex flex-col items-center">
                <div className="bg-slate-900 text-white px-16 py-8 rounded-2xl shadow-xl flex flex-col items-center justify-center min-w-[360px] text-center border-4 border-slate-100">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300 w-full text-center">DEFECT ทั้งหมด</h2>
                    <div className="text-7xl font-black mt-2 leading-none w-full text-center">{grandTotal} <span className="text-2xl font-normal text-slate-400">ข้อ</span></div>
                </div>
                {/* Connector Line Down */}
                <div className="h-10 w-1.5 bg-slate-200"></div>
            </div>

            {/* --- LEVEL 2: BRANCHES --- */}
            <div className="relative w-full max-w-7xl">
                {/* Horizontal Connector Bar */}
                <div className="absolute top-0 left-[16.66%] right-[16.66%] h-1.5 bg-slate-200"></div>

                <div className="grid grid-cols-3 gap-12">
                    
                    {/* --- BRANCH 1: FIXED (Green) --- */}
                    <div className="flex flex-col items-center relative pt-8">
                        {/* Vertical Connector */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-1.5 bg-slate-200"></div>
                        
                        {/* Status Node */}
                        <div className="bg-emerald-50 border-2 border-emerald-300 w-full py-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative mb-6">
                            <div className="absolute -top-5 bg-white p-2 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-emerald-800 font-bold text-2xl mt-2 text-center w-full">แก้ไขแล้ว</h3>
                            <div className="text-5xl font-black text-emerald-600 mt-2 text-center w-full">{verifiedFixedCount} <span className="text-lg font-normal text-emerald-800/60">ข้อ</span></div>
                        </div>

                        {/* Sub-branches (List) */}
                        <div className="w-full space-y-3">
                            {fixedCategories.map((cat, idx) => (
                                <div key={idx} className="bg-white border border-emerald-100 px-5 py-3 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-slate-700 font-semibold text-base truncate">{cat.name}</span>
                                    <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm">{cat.count}</span>
                                </div>
                            ))}
                             {fixedCategories.length === 0 && <div className="text-center text-slate-400 italic">No items</div>}
                        </div>
                    </div>

                    {/* --- BRANCH 2: PENDING (Red) --- */}
                    <div className="flex flex-col items-center relative pt-8">
                        {/* Vertical Connector */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-1.5 bg-slate-200"></div>

                        {/* Status Node */}
                        <div className="bg-red-50 border-2 border-red-300 w-full py-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative mb-6">
                             <div className="absolute -top-5 bg-white p-2 rounded-full border border-red-100 shadow-sm">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-red-800 font-bold text-2xl mt-2 text-center w-full">ยังไม่แก้ไข</h3>
                            <div className="text-5xl font-black text-red-600 mt-2 text-center w-full">{pendingCount} <span className="text-lg font-normal text-red-800/60">ข้อ</span></div>
                        </div>

                        {/* Sub-branches (List) */}
                        <div className="w-full space-y-3">
                            {pendingCategories.map((cat, idx) => (
                                <div key={idx} className="bg-white border border-red-100 px-5 py-3 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-slate-700 font-semibold text-base truncate">{cat.name}</span>
                                    <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-lg text-sm">{cat.count}</span>
                                </div>
                            ))}
                            {pendingCategories.length === 0 && <div className="text-center text-slate-400 italic">No items</div>}
                        </div>
                    </div>

                    {/* --- BRANCH 3: WAITING (Yellow) --- */}
                    <div className="flex flex-col items-center relative pt-8">
                        {/* Vertical Connector */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-8 w-1.5 bg-slate-200"></div>

                        {/* Status Node */}
                        <div className="bg-amber-50 border-2 border-amber-300 w-full py-6 rounded-2xl shadow-sm flex flex-col items-center justify-center relative mb-6">
                            <div className="absolute -top-5 bg-white p-2 rounded-full border border-amber-100 shadow-sm">
                                <Clock className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-amber-800 font-bold text-2xl mt-2 text-center w-full">แก้ไขแล้วรอตรวจ</h3>
                            <div className="text-5xl font-black text-amber-600 mt-2 text-center w-full">{waitingCount} <span className="text-lg font-normal text-amber-800/60">ข้อ</span></div>
                        </div>

                        {/* Sub-branches (List) */}
                        <div className="w-full space-y-3">
                            {waitingCategories.map((cat, idx) => (
                                <div key={idx} className="bg-white border border-amber-100 px-5 py-3 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-slate-700 font-semibold text-base truncate">{cat.name}</span>
                                    <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-lg text-sm">{cat.count}</span>
                                </div>
                            ))}
                            {waitingCategories.length === 0 && <div className="text-center text-slate-400 italic">No items</div>}
                        </div>
                    </div>

                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;