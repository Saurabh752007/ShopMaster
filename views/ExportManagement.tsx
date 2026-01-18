
import React, { useState, useMemo } from 'react';

// Define the activity log type
interface ActivityLog {
  id: string;
  type: 'Export' | 'Backup';
  data: string;
  date: string;
  status: 'Success' | 'Failed' | 'Processing';
  format?: 'PDF' | 'CSV';
}

const INITIAL_HISTORY: ActivityLog[] = [
  { id: 'ACT-001', type: 'Export', data: 'Reports (Jan-Dec 2023)', date: '2024-01-22, 10:45 AM', status: 'Success', format: 'PDF' },
  { id: 'ACT-002', type: 'Backup', data: 'Full Database Backup', date: '2024-01-22, 10:30 AM', status: 'Success' },
  { id: 'ACT-003', type: 'Export', data: 'Customer Data (Q4 2023)', date: '2024-01-20, 03:15 PM', status: 'Success', format: 'CSV' },
  { id: 'ACT-004', type: 'Backup', data: 'Partial Database Backup', date: '2024-01-19, 11:00 PM', status: 'Failed' },
];

const ExportManagement: React.FC = () => {
  // State for Configuration
  const [exportTypes, setExportTypes] = useState({
    reports: true,
    product: false,
    customer: false,
    employee: false
  });
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [dateRange, setDateRange] = useState('Jan 01, 2023 - Aug 03, 2025');
  
  // State for Backup
  const [backupFreq, setBackupFreq] = useState('Monthly');
  const [destination, setDestination] = useState<'Cloud' | 'Local'>('Cloud');
  
  // Operational States
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupStatusText, setBackupStatusText] = useState('Idle');
  const [history, setHistory] = useState<ActivityLog[]>(INITIAL_HISTORY);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = () => {
    const selectedCount = Object.values(exportTypes).filter(Boolean).length;
    if (selectedCount === 0) {
      showToast('Please select at least one data type', 'error');
      return;
    }

    setIsExporting(true);
    // Simulate complex data aggregation
    setTimeout(() => {
      const activeDataNames = Object.entries(exportTypes)
        .filter(([_, v]) => v)
        .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
        .join(', ');

      const newLog: ActivityLog = {
        id: `ACT-${Math.floor(Math.random() * 900) + 100}`,
        type: 'Export',
        data: `${activeDataNames} (${format})`,
        date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'Success',
        format: format
      };

      setHistory(prev => [newLog, ...prev]);
      setIsExporting(false);
      showToast(`${format} Export Generated Successfully`);
      
      // Real file trigger
      if (format === 'CSV') {
        const dummyContent = "data:text/csv;charset=utf-8,Type,Date,Data\n" + newLog.type + "," + newLog.date + "," + newLog.data;
        const encodedUri = encodeURI(dummyContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ShopMaster_${newLog.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.print();
      }
    }, 2000);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    setBackupStatusText('Initializing Handshake...');

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBackupStatusText('Finalizing Secure Storage...');
          setTimeout(() => {
            const newLog: ActivityLog = {
              id: `ACT-${Math.floor(Math.random() * 900) + 100}`,
              type: 'Backup',
              data: `${destination} Database Snapshot`,
              date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
              status: 'Success'
            };
            setHistory(prevHistory => [newLog, ...prevHistory]);
            setIsBackingUp(false);
            showToast(`System Backup Secured to ${destination}`);
          }, 800);
          return 100;
        }
        
        if (prev < 30) setBackupStatusText(`Compressing Tables... (${prev}%)`);
        else if (prev < 70) setBackupStatusText(`Encrypting (AES-256)... (${prev}%)`);
        else setBackupStatusText(`Uploading to ${destination}... (${prev}%)`);
        
        return prev + 5;
      });
    }, 150);
  };

  const handleDownloadLog = (log: ActivityLog) => {
    showToast(`Preparing download for ${log.id}...`);
    // Simulate download
    setTimeout(() => {
      showToast(`File ${log.id} downloaded`, 'success');
    }, 1000);
  };

  const handleRestore = (log: ActivityLog) => {
    if (confirm(`CAUTION: Restoring will rollback system data to ${log.date}. Current unsaved changes will be lost. Proceed?`)) {
      showToast('Initiating Database Rollback...', 'success');
      // Simulate restoration sequence
      setTimeout(() => {
        alert("System Restored Successfully. The application will now refresh to apply changes.");
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-8 z-[110] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 ${
          toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-sky-500' : 'bg-white/20'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm font-black">{toast.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 no-print">
        {/* Export Configuration Card */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-100/40">
          <h2 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Data Export Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Data Types</label>
              <div className="space-y-4">
                 <Checkbox 
                   label="Reports Data" 
                   checked={exportTypes.reports} 
                   onChange={() => setExportTypes({...exportTypes, reports: !exportTypes.reports})} 
                 />
                 <Checkbox 
                   label="Product Data" 
                   checked={exportTypes.product} 
                   onChange={() => setExportTypes({...exportTypes, product: !exportTypes.product})} 
                 />
                 <Checkbox 
                   label="Customer Data" 
                   checked={exportTypes.customer} 
                   onChange={() => setExportTypes({...exportTypes, customer: !exportTypes.customer})} 
                 />
                 <Checkbox 
                   label="Employee Data" 
                   checked={exportTypes.employee} 
                   onChange={() => setExportTypes({...exportTypes, employee: !exportTypes.employee})} 
                 />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">Export Format</label>
              <div className="flex gap-10">
                 <Radio label="PDF" checked={format === 'PDF'} onChange={() => setFormat('PDF')} />
                 <Radio label="CSV" checked={format === 'CSV'} onChange={() => setFormat('CSV')} />
              </div>
              <div className="mt-8 p-5 bg-sky-50 rounded-[1.5rem] border border-sky-100">
                <p className="text-xs font-bold text-sky-600 flex items-center gap-2">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Selected: {Object.values(exportTypes).filter(Boolean).length} datasets
                </p>
                <p className="text-[10px] text-sky-400 font-bold mt-1 ml-6 uppercase">Ready for {format} Generation</p>
              </div>
            </div>
          </div>

          <div className="mb-12">
             <label className="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Date Range</label>
             <div className="relative group">
               <span className="absolute inset-y-0 left-6 flex items-center text-gray-400 group-focus-within:text-sky-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               </span>
               <input 
                 type="text" 
                 value={dateRange}
                 onChange={(e) => setDateRange(e.target.value)}
                 className="w-full pl-16 pr-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] font-black text-gray-900 outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner"
               />
             </div>
          </div>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-5 bg-sky-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="animate-pulse">Synthesizing Datasets...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" /></svg>
                Export Data
              </>
            )}
          </button>
        </div>

        {/* Backup Management Card */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-100/40">
            <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Backup Management</h2>
            
            <div className="mb-6">
              <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Backup Frequency</label>
              <select 
                value={backupFreq}
                onChange={(e) => setBackupFreq(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none font-black text-gray-900 focus:ring-4 focus:ring-sky-500/10 cursor-pointer transition-all"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div className="mb-8">
              <label className="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">Backup Destination</label>
              <div className="flex flex-col gap-4">
                 <Radio 
                   label="Cloud Storage" 
                   checked={destination === 'Cloud'} 
                   onChange={() => setDestination('Cloud')} 
                 />
                 <Radio 
                   label="Local Device" 
                   checked={destination === 'Local'} 
                   onChange={() => setDestination('Local')} 
                 />
              </div>
            </div>

            <div className="p-5 bg-sky-50 rounded-3xl mb-8 border border-sky-100 relative overflow-hidden group">
              <div className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-2">Health Status</div>
              <div className="flex justify-between items-center">
                <div className="text-xs font-black text-gray-900">Last Synced: Jan 22, 10:30 AM</div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-full uppercase tracking-widest">Success</span>
              </div>
              
              {/* Backup Progress Overlay */}
              {isBackingUp && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom-full duration-500">
                   <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-sky-500 transition-all duration-300 shadow-[0_0_10px_rgba(14,165,233,0.5)]" 
                        style={{ width: `${backupProgress}%` }}
                      ></div>
                   </div>
                   <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest text-center">{backupStatusText}</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full py-4 bg-sky-500 text-white font-black rounded-2xl hover:bg-sky-600 transition-all active:scale-95 shadow-xl shadow-sky-50 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className={`w-5 h-5 ${isBackingUp ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {isBackingUp ? 'Syncing...' : 'Initiate Backup'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden no-print transition-all hover:shadow-xl hover:shadow-gray-100/40">
        <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
           <div>
             <h2 className="text-xl font-black text-gray-900 tracking-tight">Recent Activities</h2>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Full Audit Trail & Snapshots</p>
           </div>
           <button 
             onClick={() => setHistory(INITIAL_HISTORY)}
             className="px-5 py-2 bg-white border border-gray-200 text-[10px] font-black text-gray-400 rounded-xl hover:text-sky-600 hover:border-sky-100 transition-all active:scale-95 shadow-sm"
           >
             REFRESH LOGS
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Operation</th>
                <th className="px-10 py-6">Payload Detail</th>
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">Result</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((log) => (
                <tr key={log.id} className="group hover:bg-sky-50/30 transition-all">
                   <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border ${
                          log.type === 'Export' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {log.type === 'Export' ? '📤' : '☁️'}
                        </div>
                        <span className="font-black text-gray-900 tracking-tight">{log.type}</span>
                      </div>
                   </td>
                   <td className="px-10 py-6">
                      <p className="text-sm font-black text-gray-800">{log.data}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">UID: {log.id}</p>
                   </td>
                   <td className="px-10 py-6 text-xs font-bold text-gray-500 tabular-nums">
                      {log.date}
                   </td>
                   <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        log.status === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        log.status === 'Failed' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                      }`}>
                        {log.status}
                      </span>
                   </td>
                   <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {log.type === 'Backup' && log.status === 'Success' && (
                          <button 
                            onClick={() => handleRestore(log)}
                            className="px-5 py-2.5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-600 transition-all active:scale-95 shadow-md shadow-gray-200"
                          >
                            RESTORE
                          </button>
                        )}
                        {log.status === 'Success' && (
                          <button 
                            onClick={() => handleDownloadLog(log)}
                            className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-sky-600 hover:border-sky-200 rounded-xl transition-all shadow-sm active:scale-90"
                            title="Download Record"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          </button>
                        )}
                      </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {history.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 font-black uppercase tracking-widest">No activity history recorded</p>
          </div>
        )}
      </section>
    </div>
  );
};

// UI Sub-components
const Checkbox: React.FC<{label: string, checked?: boolean, onChange?: () => void}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-4 cursor-pointer group select-none">
    <div 
      onClick={onChange}
      className={`w-7 h-7 border-2 rounded-xl flex items-center justify-center transition-all duration-300 ${
        checked ? 'bg-sky-600 border-sky-600 shadow-xl shadow-sky-100 scale-110' : 'border-gray-200 group-hover:border-sky-400 bg-white'
      }`}
    >
      {checked && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
    </div>
    <span className={`text-sm font-black transition-colors ${checked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
  </label>
);

const Radio: React.FC<{label: string, checked?: boolean, onChange?: () => void}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-4 cursor-pointer group select-none" onClick={onChange}>
    <div className={`w-7 h-7 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
      checked ? 'border-sky-600 scale-110' : 'border-gray-200 group-hover:border-sky-400 bg-white'
    }`}>
      {checked && <div className="w-3.5 h-3.5 bg-sky-600 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>}
    </div>
    <span className={`text-sm font-black transition-colors ${checked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
  </label>
);

export default ExportManagement;
