import React, { useRef, useState } from 'react';
import { DefectRecord } from '../types';
import { ImageDown, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DashboardProps {
  defects: DefectRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ defects }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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
            // Temporarily expand all for screenshot or keep as is? 
            // Keeping as is (user sees what they see).
            
            const canvas = await html2canvas(contentRef.current, {
                scale: 3, // High scale for clear text
                backgroundColor: '#ffffff',
                useCORS: true,
                onclone: (clonedDoc) => {
                    // 1. Force main text alignment
                    const centerAligned = clonedDoc.querySelectorAll('.text-center');
                    centerAligned.forEach((el) => {
                        if (el instanceof HTMLElement) {
                            el.style.textAlign = 'center';
                            el.style.width = '100%';
                            el.style.display = 'block'; 
                        }
                    });

                    // 2. Specific fix for Flex Column Containers that need centering (The Header & Status Boxes)
                    const flexCenterBoxes = clonedDoc.querySelectorAll('.flex-col.items-center.justify-center');
                    flexCenterBoxes.forEach((el) => {
                        if (el instanceof HTMLElement) {
                             el.style.display = 'flex';
                             el.style.flexDirection = 'column';
                             el.style.alignItems = 'center';
                             el.style.justifyContent = 'center';
                             el.style.textAlign = 'center';
                        }
                    });

                    // 3. Fix the specific status card containers by class if generic selector fails
                    const statusCards = clonedDoc.querySelectorAll('.bg-emerald-50, .bg-red-50, .bg-amber-50, .bg-slate-900');
                    statusCards.forEach((card) => {
                         if (card instanceof HTMLElement) {
                             card.style.display = 'flex';
                             card.style.flexDirection = 'column';
                             card.style.alignItems = 'center';
                             card.style.justifyContent = 'center';
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

  const toggleExpand = (key: string) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  // Helper to render expanded detail list
  const renderDetails = (categoryName: string, type: 'fixed' | 'pending' | 'waiting') => {
    let items: DefectRecord[] = [];
    let countKey: 'fixedDefects' | 'totalDefects' | 'remaining' = 'totalDefects';

    if (type === 'fixed') {
        items = verifiedFixedItems.filter(d => d.category === categoryName);
        countKey = 'fixedDefects';
    } else if (type === 'waiting') {
        items = waitingItems.filter(d => d.category === categoryName);
        countKey = 'totalDefects';
    } else { // pending
        items = defects.filter(d => 
            d.category === categoryName && 
            d.status !== 'แก้ไขเรียบร้อย รอนัดตรวจ' && 
            d.status !== 'แก้ไขเรียบร้อย' &&
            (d.totalDefects - d.fixedDefects > 0)
        );
        countKey = 'remaining';
    }

    return (
        <div className="mt-2 pl-2 pr-2 border-t border-slate-100 pt-2 space-y-1 animate-fade-in">
            {items.map(item => {
                const count = countKey === 'remaining' 
                    ? (item.totalDefects - item.fixedDefects) 
                    : item[countKey];
                
                return (
                    <div key={item.id} className="flex justify-between items-start text-xs text-slate-500 py-1 border-b border-slate-50 last:border-0">
                        <span className="truncate pr-2">{item.location}</span>
                        <span className="font-mono font-semibold bg-slate-100 px-1.5 rounded">{count}</span>
                    </div>
                );
            })}
        </div>
    );
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
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300 w-full text-center block">DEFECT ทั้งหมด</h2>
                    <div className="text-7xl font-black mt-2 leading-none w-full text-center block">{grandTotal} <span className="text-2xl font-normal text-slate-400">ข้อ</span></div>
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
                            <h3 className="text-emerald-800 font-bold text-2xl mt-2 text-center w-full block">แก้ไขแล้ว</h3>
                            <div className="text-5xl font-black text-emerald-600 mt-2 text-center w-full block">{verifiedFixedCount} <span className="text-lg font-normal text-emerald-800/60">ข้อ</span></div>
                        </div>

                        {/* Sub-branches (List) */}
                        <div className="w-full space-y-3">
                            {fixedCategories.map((cat, idx) => {
                                const key = `fixed-${cat.name}`;
                                const isExpanded = expandedKey === key;
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => toggleExpand(key)}
                                        className={`bg-white border px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                            isExpanded ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-emerald-100'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                                <span className="text-slate-700 font-semibold text-base truncate">{cat.name}</span>
                                            </div>
                                            <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg text-sm">{cat.count}</span>
                                        </div>
                                        {isExpanded && renderDetails(cat.name, 'fixed')}
                                    </div>
                                );
                            })}
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
                            <h3 className="text-red-800 font-bold text-2xl mt-2 text-center w-full block">ยังไม่แก้ไข</h3>
                            <div className="text-5xl font-black text-red-600 mt-2 text-center w-full block">{pendingCount} <span className="text-lg font-normal text-red-800/60">ข้อ</span></div>
                        </div>

                        {/* Sub-branches (List) */}
                        <div className="w-full space-y-3">
                            {pendingCategories.map((cat, idx) => {
                                const key = `pending-${cat.name}`;
                                const isExpanded = expandedKey === key;
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => toggleExpand(key)}
                                        className={`bg-white border px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                            isExpanded ? 'border-red-300 ring-1 ring-red-100' : 'border-red-100'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                             <div className="flex items-center gap-2 overflow-hidden">
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-red-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                                <span className="text-slate-700 font-semibold text-base truncate">{cat.name}</span>
                                            </div>
                                            <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-lg text-sm">{cat.count}</span>
                                        </div>
                                        {isExpanded && renderDetails(cat.name, 'pending')}
                                    </div>
                                );
                            })}
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
                            <h3 className="text-amber-800 font-bold text-2xl mt-2 text-center w-full block">แก้ไขแล้วรอตรวจ</h3>
                            <div className="text-5xl font-black text-amber-600 mt-2 text-center w-full block">{waitingCount} <span className="text-lg font-normal text-amber-800/60">ข้อ</span></div>
                        </div>

                        {/* Sub-branches (List) */}
                        <div className="w-full space-y-3">
                            {waitingCategories.map((cat, idx) => {
                                const key = `waiting-${cat.name}`;
                                const isExpanded = expandedKey === key;
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => toggleExpand(key)}
                                        className={`bg-white border px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                            isExpanded ? 'border-amber-300 ring-1 ring-amber-100' : 'border-amber-100'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-amber-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                                <span className="text-slate-700 font-semibold text-base truncate">{cat.name}</span>
                                            </div>
                                            <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-lg text-sm">{cat.count}</span>
                                        </div>
                                        {isExpanded && renderDetails(cat.name, 'waiting')}
                                    </div>
                                );
                            })}
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