import React, { useState, useRef } from 'react';
import { DefectRecord, DefectStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { Edit2, Trash2, Plus, Save, X, Search, Download, Upload } from 'lucide-react';

interface DefectListProps {
  defects: DefectRecord[];
  onUpdate: (updated: DefectRecord) => void;
  onDelete: (id: string) => void;
  onAdd: (newItem: DefectRecord) => void;
  onImport: (data: DefectRecord[]) => void;
}

const DefectList: React.FC<DefectListProps> = ({ defects, onUpdate, onDelete, onAdd, onImport }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DefectRecord>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (record: DefectRecord) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(defects, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vay-chinnakhet-defects-${new Date().toISOString().split('T')[0]}.json`;
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
           if (window.confirm(`Found ${data.length} records. Replace current data?`)) {
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

  const handleSave = () => {
    if (editingId && editForm.location) {
      // Validation could go here
      const updatedRecord = {
        ...defects.find(d => d.id === editingId)!,
        ...editForm,
      } as DefectRecord;
      onUpdate(updatedRecord);
      setEditingId(null);
      setEditForm({});
    } else if (isAdding && editForm.location) {
       const newRecord: DefectRecord = {
         id: Math.random().toString(36).substr(2, 9),
         category: editForm.category || 'ทั่วไป',
         location: editForm.location || 'New Location',
         totalDefects: Number(editForm.totalDefects) || 0,
         fixedDefects: Number(editForm.fixedDefects) || 0,
         status: (editForm.status as DefectStatus) || 'รอดำเนินการ',
         targetDate: editForm.targetDate || '',
         note: editForm.note || ''
       };
       onAdd(newRecord);
       setIsAdding(false);
       setEditForm({});
    }
  };

  const filteredDefects = defects.filter(d => 
    d.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusOptions: DefectStatus[] = ['แก้ไขเรียบร้อย', 'รอดำเนินการ', 'แก้ไขเรียบร้อย รอนัดตรวจ', 'ไม่มี Defect', 'ยังไม่ตรวจ'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-800">Defect Data Entry Table</h3>
        
        <div className="flex gap-3 w-full sm:w-auto items-center">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
          />

          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
            title="Import JSON"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
            title="Export as JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button 
            onClick={() => { setIsAdding(true); setEditForm({ totalDefects: 0, fixedDefects: 0, status: 'รอดำเนินการ' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3 text-center">Total</th>
              <th className="px-6 py-3 text-center">Fixed</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Target Date</th>
              <th className="px-6 py-3">Note</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isAdding && (
               <tr className="bg-blue-50/50">
               <td className="px-6 py-4">
                 <input 
                   className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                   value={editForm.category || ''}
                   onChange={e => setEditForm({...editForm, category: e.target.value})}
                   placeholder="Category"
                 />
               </td>
               <td className="px-6 py-4">
                 <input 
                   className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                   value={editForm.location || ''}
                   onChange={e => setEditForm({...editForm, location: e.target.value})}
                   placeholder="Location"
                 />
               </td>
               <td className="px-6 py-4">
                 <input 
                   type="number"
                   className="w-20 mx-auto block bg-white border border-slate-300 rounded px-2 py-1 text-center"
                   value={editForm.totalDefects || 0}
                   onChange={e => setEditForm({...editForm, totalDefects: parseInt(e.target.value) || 0})}
                 />
               </td>
               <td className="px-6 py-4">
                 <input 
                   type="number"
                   className="w-20 mx-auto block bg-white border border-slate-300 rounded px-2 py-1 text-center"
                   value={editForm.fixedDefects || 0}
                   onChange={e => setEditForm({...editForm, fixedDefects: parseInt(e.target.value) || 0})}
                 />
               </td>
               <td className="px-6 py-4">
                 <select 
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                    value={editForm.status || 'รอดำเนินการ'}
                    onChange={e => setEditForm({...editForm, status: e.target.value as DefectStatus})}
                 >
                   {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
               </td>
               <td className="px-6 py-4">
                  <input 
                   className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                   value={editForm.targetDate || ''}
                   onChange={e => setEditForm({...editForm, targetDate: e.target.value})}
                   placeholder="e.g. 10 ก.พ."
                 />
               </td>
               <td className="px-6 py-4">
                  <input 
                   className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                   value={editForm.note || ''}
                   onChange={e => setEditForm({...editForm, note: e.target.value})}
                 />
               </td>
               <td className="px-6 py-4 text-right">
                 <div className="flex justify-end gap-2">
                   <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="w-4 h-4" /></button>
                   <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                 </div>
               </td>
             </tr>
            )}

            {filteredDefects.map((defect) => (
              <tr key={defect.id} className="hover:bg-slate-50 transition-colors">
                {editingId === defect.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                        value={editForm.category}
                        onChange={e => setEditForm({...editForm, category: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                        value={editForm.location}
                        onChange={e => setEditForm({...editForm, location: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        className="w-20 mx-auto block bg-white border border-slate-300 rounded px-2 py-1 text-center"
                        value={editForm.totalDefects}
                        onChange={e => setEditForm({...editForm, totalDefects: parseInt(e.target.value) || 0})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        className="w-20 mx-auto block bg-white border border-slate-300 rounded px-2 py-1 text-center"
                        value={editForm.fixedDefects}
                        onChange={e => setEditForm({...editForm, fixedDefects: parseInt(e.target.value) || 0})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select 
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                          value={editForm.status}
                          onChange={e => setEditForm({...editForm, status: e.target.value as DefectStatus})}
                      >
                        {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                        value={editForm.targetDate || ''}
                        onChange={e => setEditForm({...editForm, targetDate: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1"
                        value={editForm.note || ''}
                        onChange={e => setEditForm({...editForm, note: e.target.value})}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="w-4 h-4" /></button>
                        <button onClick={handleCancelEdit} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-slate-700 font-medium">{defect.category}</td>
                    <td className="px-6 py-4 text-slate-600">{defect.location}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {defect.totalDefects}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${defect.fixedDefects > 0 ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                        {defect.fixedDefects}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[defect.status]}`}>
                        {defect.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                        {defect.targetDate ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {defect.targetDate}
                            </span>
                        ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[150px]">{defect.note}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(defect)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(defect.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {filteredDefects.length === 0 && !isAdding && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DefectList;