import React, { useState, useRef } from 'react';
import { DefectRecord, DefectStatus } from '../types';
import { FileSpreadsheet, Printer, Plus, Trash2, FolderPlus, X, Save, Download, Upload, ImageDown } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SummaryReportProps {
  defects: DefectRecord[];
  onUpdate: (updated: DefectRecord) => void;
  onAdd: (newRecord: DefectRecord) => void;
  onDelete: (id: string) => void;
  onImport: (data: DefectRecord[]) => void;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ defects, onUpdate, onAdd, onDelete, onImport }) => {
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CATEGORY' | 'LOCATION'>('CATEGORY');
  const [targetCategory, setTargetCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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
                 updatedDefect.status = 'แก้ไขเรียบร้อย';
             } else if (f === 0 && t > 0) {
                 if (defect.status === 'แก้ไขเรียบร้อย') updatedDefect.status = 'รอดำเนินการ';
             }
        }

        onUpdate(updatedDefect);
    }
  };

  const handleCategoryRename = (oldCategory: string, newCategory: string) => {
      const trimmedNew = newCategory.trim();
      if (!trimmedNew || oldCategory === trimmedNew) return;
      
      const items = groupedDefects[oldCategory];
      if (items) {
          // Bulk update all items in this category
          items.forEach(item => {
              onUpdate({ ...item, category: trimmedNew });
          });
      }
  };

  const createNewRecord = (category: string, location: string): DefectRecord => ({
    id: Math.random().toString(36).substr(2, 9),
    category,
    location,
    totalDefects: 0,
    fixedDefects: 0,
    status: 'รอดำเนินการ',
    targetDate: '',
    note: ''
  });

  const openAddCategoryModal = () => {
      setModalMode('CATEGORY');
      setNewCategoryName('');
      setNewLocationName('');
      setModalOpen(true);
  };

  const openAddLocationModal = (category: string) => {
      setModalMode('LOCATION');
      setTargetCategory(category);
      setNewCategoryName(category); 
      setNewLocationName('');
      setModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (modalMode === 'CATEGORY') {
          if (!newCategoryName.trim() || !newLocationName.trim()) return;
          onAdd(createNewRecord(newCategoryName, newLocationName));
      } else {
          if (!newLocationName.trim()) return;
          onAdd(createNewRecord(targetCategory, newLocationName));
      }
      setModalOpen(false);
  };

  // --- Import / Export Logic ---
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(defects, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vay-chinnakhet-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        if (Array.isArray(data)) {
           // Basic check for data integrity
           if (data.length > 0 && (!data[0].id || !data[0].location)) {
               alert("Invalid data format: Missing required fields in JSON.");
               return;
           }
           if (window.confirm(`Found ${data.length} records. Import and update database?`)) {
               onImport(data);
           }
        } else {
            alert("Invalid JSON format. Expected an array.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON file.");
      }
      // Reset input so the same file can be selected again if needed
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportImage = async () => {
    if (tableRef.current) {
        try {
            const canvas = await html2canvas(tableRef.current, {
                scale: 2, 
                backgroundColor: '#ffffff',
                useCORS: true,
                onclone: (clonedDoc) => {
                    // Hide elements marked as print:hidden (Delete column, Add Row buttons)
                    const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden');
                    hiddenElements.forEach((el) => {
                        if (el instanceof HTMLElement) {
                            el.style.display = 'none';
                        }
                    });

                    // Fix Input Alignment: Replace inputs with flexbox centered divs
                    const inputs = clonedDoc.querySelectorAll('input');
                    inputs.forEach(input => {
                        const div = clonedDoc.createElement('div');
                        div.textContent = input.value;
                        div.style.height = '100%';
                        div.style.display = 'flex';
                        div.style.alignItems = 'center'; // Vertical Center
                        
                        // Smart Width Handling: 
                        // If input has siblings (like the "(รวม)" span), use flex-grow logic instead of 100% width
                        if (input.nextElementSibling || input.previousElementSibling) {
                             div.style.width = 'auto';
                             div.style.flex = '1';
                             div.style.minWidth = '0'; 
                        } else {
                             div.style.width = '100%';
                        }
                        
                        // Check explicit alignment class or default to left
                        if (input.className.includes('text-center')) {
                            div.style.justifyContent = 'center'; 
                        } else if (input.className.includes('text-right')) {
                            div.style.justifyContent = 'flex-end';
                        } else {
                            div.style.justifyContent = 'flex-start';
                        }

                        // Copy font styles
                        div.className = input.className;
                        div.style.border = 'none';
                        div.style.backgroundColor = 'transparent';
                        div.style.padding = '0'; // Remove input padding for perfect centering

                        input.style.display = 'none';
                        // Use insertBefore to preserve DOM order (Div then Span)
                        // This ensures "(รวม)" appears AFTER the text, not before.
                        input.parentElement?.insertBefore(div, input);
                    });

                    // Fix Select Alignment
                    const selects = clonedDoc.querySelectorAll('select');
                    selects.forEach(select => {
                        const div = clonedDoc.createElement('div');
                        div.textContent = select.options[select.selectedIndex]?.text || '';
                        div.style.width = '100%';
                        div.style.height = '100%';
                        div.style.display = 'flex';
                        div.style.alignItems = 'center';
                        div.style.justifyContent = 'center'; // Force center for status
                        
                        div.className = select.className;
                        div.style.border = 'none';
                        div.style.backgroundColor = 'transparent';

                        select.style.display = 'none';
                        select.parentElement?.appendChild(div);
                    });
                }
            });
            const link = document.createElement('a');
            link.download = `summary-report-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Image export failed', error);
            alert('Failed to generate image.');
        }
    }
  };

  const statusOptions: DefectStatus[] = ['แก้ไขเรียบร้อย', 'รอดำเนินการ', 'แก้ไขเรียบร้อย รอนัดตรวจ', 'ไม่มี Defect', 'ยังไม่ตรวจ'];

  return (
    <>
    {/* Hidden File Input for Import */}
    <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange} 
    />

    {/* Custom Modal */}
    {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg">
                        {modalMode === 'CATEGORY' ? 'Add New Category' : 'Add Location'}
                    </h3>
                    <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleModalSubmit} className="p-6 space-y-5">
                    {modalMode === 'CATEGORY' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category Name (ชื่อหมวด)</label>
                            <input 
                                autoFocus
                                type="text" 
                                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="e.g. ชั้นดาดฟ้า, สระว่ายน้ำ"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                            />
                        </div>
                    )}
                    {modalMode === 'LOCATION' && (
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                            <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-600 font-medium">
                                {targetCategory}
                            </div>
                         </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            {modalMode === 'CATEGORY' ? 'First Location (สถานที่แรก)' : 'Location Name (ชื่อสถานที่)'}
                        </label>
                        <input 
                            ref={input => { if(input && modalMode === 'LOCATION') input.focus() }}
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. Room 101, Zone A"
                            value={newLocationName}
                            onChange={e => setNewLocationName(e.target.value)}
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!newLocationName.trim() || (modalMode === 'CATEGORY' && !newCategoryName.trim())}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-center gap-4 bg-slate-50 print:hidden">
        <div className="flex items-center gap-3 w-full xl:w-auto">
           <div className="bg-emerald-600 p-2 rounded-lg shadow-sm">
             <FileSpreadsheet className="w-5 h-5 text-white" />
           </div>
           <div>
             <h3 className="text-lg font-bold text-slate-800">Summary Report & Input</h3>
             <p className="text-sm text-slate-500">Manage your data directly in the table below.</p>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
            <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                title="Import JSON Backup"
            >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
            </button>

            <button 
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                title="Backup data as JSON"
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Backup</span>
            </button>

            <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>

            <button 
                onClick={handleExportImage} 
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                title="Save entire table as image"
            >
                <ImageDown className="w-4 h-4" />
                Save Image
            </button>

            <button 
                onClick={openAddCategoryModal} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
                <FolderPlus className="w-4 h-4" />
                Category
            </button>

            <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
                <Printer className="w-4 h-4" />
                Print
            </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full text-sm text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-base">
              <th className="border border-slate-300 px-4 py-3 font-bold min-w-[200px] align-middle">Category / Location</th>
              <th className="border border-slate-300 px-2 py-3 text-center bg-slate-200/50 font-bold w-20 align-middle">Total</th>
              <th className="border border-slate-300 px-2 py-3 text-center text-emerald-700 bg-emerald-50/50 font-bold w-20 align-middle">Fixed</th>
              <th className="border border-slate-300 px-4 py-3 text-center text-red-700 bg-red-50/50 font-bold w-16 align-middle">Left</th>
              <th className="border border-slate-300 px-4 py-3 text-center font-bold w-32 align-middle">Target Date</th>
              <th className="border border-slate-300 px-4 py-3 text-center font-bold w-36 align-middle">Status</th>
              <th className="border border-slate-300 px-2 py-3 text-center font-bold w-10 print:hidden align-middle"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedDefects).map(([category, items]: [string, DefectRecord[]]) => {
              const catTotal = items.reduce((sum, d) => sum + d.totalDefects, 0);
              const catFixed = items.reduce((sum, d) => sum + d.fixedDefects, 0);
              const catRemaining = catTotal - catFixed;

              return (
                <React.Fragment key={category}>
                  {/* Category Header Row */}
                  <tr className="bg-slate-100 text-slate-900 font-bold border-t-2 border-slate-300 text-base">
                    <td className="border border-slate-300 px-4 py-3 bg-slate-200/40 flex justify-between items-center group relative align-middle">
                      <div className="flex-1 flex items-center mr-2">
                          <input 
                             type="text"
                             defaultValue={category}
                             className="font-bold bg-transparent hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full transition-colors text-slate-800"
                             onBlur={(e) => handleCategoryRename(category, e.target.value)}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') e.currentTarget.blur();
                             }}
                             title="Click to edit category name"
                          />
                          <span className="ml-2 text-slate-500 font-normal shrink-0 text-sm">(รวม)</span>
                      </div>
                      <button 
                        onClick={() => openAddLocationModal(category)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-100 text-blue-700 p-1 rounded hover:bg-blue-200 print:hidden flex items-center gap-1 text-xs px-2 shrink-0"
                        title="Add row to this category"
                      >
                         <Plus className="w-3 h-3" /> Add Row
                      </button>
                    </td>
                    <td className="border border-slate-300 px-2 py-3 text-center bg-slate-200/40 align-middle">{catTotal}</td>
                    <td className="border border-slate-300 px-2 py-3 text-center text-emerald-700 bg-slate-200/40 align-middle">{catFixed}</td>
                    <td className="border border-slate-300 px-4 py-3 text-center text-red-700 bg-slate-200/40 align-middle">{catRemaining}</td>
                    <td className="border border-slate-300 px-4 py-3 bg-slate-200/40 align-middle"></td>
                    <td className="border border-slate-300 px-4 py-3 bg-slate-200/40 align-middle"></td>
                    <td className="border border-slate-300 px-2 py-3 bg-slate-200/40 print:hidden align-middle"></td>
                  </tr>

                  {/* Defect Items */}
                  {items.map((defect) => {
                    const remaining = defect.totalDefects - defect.fixedDefects;

                    // Row Highlight Logic
                    let rowClassName = "hover:bg-blue-50/30 transition-colors group";
                    if (defect.status === 'แก้ไขเรียบร้อย') {
                        rowClassName = "bg-green-100/60 hover:bg-green-200/60 transition-colors group";
                    } else if (defect.status === 'แก้ไขเรียบร้อย รอนัดตรวจ') {
                        rowClassName = "bg-yellow-100/60 hover:bg-yellow-200/60 transition-colors group";
                    }

                    return (
                      <tr key={defect.id} className={rowClassName}>
                        <td className="border border-slate-300 px-4 py-2 font-medium text-slate-700 pl-8 relative align-middle">
                          <input 
                              type="text"
                              className="w-full bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1"
                              value={defect.location}
                              onChange={(e) => handleUpdate(defect.id, 'location', e.target.value)}
                           />
                        </td>
                        <td className="border border-slate-300 px-0 py-0 text-center bg-slate-50/30 relative align-middle">
                           <input 
                              type="number"
                              min="0"
                              placeholder="0"
                              className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 text-slate-900 font-medium appearance-none placeholder-slate-300"
                              value={defect.totalDefects === 0 ? '' : defect.totalDefects}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdate(defect.id, 'totalDefects', e.target.value === '' ? 0 : parseInt(e.target.value))}
                           />
                        </td>
                        <td className="border border-slate-300 px-0 py-0 text-center bg-emerald-50/10 relative align-middle">
                           <input 
                              type="number"
                              min="0"
                              placeholder="0"
                              className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:z-10 text-emerald-700 font-medium appearance-none placeholder-emerald-700/30"
                              value={defect.fixedDefects === 0 ? '' : defect.fixedDefects}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdate(defect.id, 'fixedDefects', e.target.value === '' ? 0 : parseInt(e.target.value))}
                           />
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center text-red-600 font-bold bg-red-50/10 align-middle">
                          {remaining}
                        </td>
                        <td className="border border-slate-300 px-0 py-0 text-center relative align-middle group/date">
                           <div className="relative w-full h-full flex items-center justify-center">
                               <input 
                                  type="date"
                                  className="w-full h-full py-2 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 text-indigo-700 font-bold text-base font-sans"
                                  value={defect.targetDate || ''}
                                  onChange={(e) => handleUpdate(defect.id, 'targetDate', e.target.value)}
                               />
                               {defect.targetDate && (
                                  <button
                                    onClick={() => handleUpdate(defect.id, 'targetDate', '')}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover/date:opacity-100 group-focus-within/date:opacity-100 transition-all z-20 print:hidden"
                                    title="Clear Date"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                               )}
                           </div>
                        </td>
                        <td className="border border-slate-300 px-1 py-1 text-center align-middle">
                           <select 
                              className={`w-full text-base font-bold border-0 bg-transparent py-1 rounded cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none ${
                                defect.status === 'แก้ไขเรียบร้อย' ? 'text-green-700' :
                                defect.status === 'รอดำเนินการ' ? 'text-red-700' :
                                defect.status === 'แก้ไขเรียบร้อย รอนัดตรวจ' ? 'text-amber-700' :
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
                        <td className="border border-slate-300 px-1 py-1 text-center print:hidden align-middle">
                           <button 
                             onClick={() => onDelete(defect.id)}
                             className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                             title="Delete row"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-800 text-white font-bold shadow-inner border-t-2 border-slate-400 text-lg">
            <tr>
              <td className="border border-slate-600 px-4 py-4 text-right font-bold align-middle">Grand Total (รวมทั้งหมด):</td>
              <td className="border border-slate-600 px-2 py-4 text-center font-bold align-middle">{totalDefects}</td>
              <td className="border border-slate-600 px-2 py-4 text-center text-emerald-300 font-bold align-middle">{totalFixed}</td>
              <td className="border border-slate-600 px-4 py-4 text-center text-red-300 font-bold align-middle">{totalRemaining}</td>
              <td colSpan={3} className="border border-slate-600 px-4 py-4 text-center font-normal text-slate-300 align-middle">
                {progressPercentage.toFixed(1)}% Complete
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    </>
  );
};

export default SummaryReport;