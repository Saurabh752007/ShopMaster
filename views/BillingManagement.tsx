
import React, { useState, useMemo, useEffect } from 'react';
import { Bill } from '../types';

const BillingManagement: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Cancelled'>('All');
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  const loadBills = () => {
    const saved = localStorage.getItem('sm_bills');
    setBills(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    loadBills();
    window.addEventListener('sm_data_updated', loadBills);
    return () => window.removeEventListener('sm_data_updated', loadBills);
  }, []);

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesFilter = filter === 'All' || bill.status === filter;
      const matchesSearch = bill.id.toLowerCase().includes(search.toLowerCase()) || 
                            bill.customer.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, bills]);

  const handleExportCSV = () => {
    if (bills.length === 0) return;
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 3000);
    }, 1000);
  };

  const statusColors = {
    Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Cancelled: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      {showShareSuccess && (
        <div className="fixed top-24 md:top-8 right-1/2 translate-x-1/2 md:translate-x-0 md:right-8 z-[110] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 md:slide-in-from-right-8">
          <p className="text-xs font-black uppercase tracking-widest">Logs Exported</p>
        </div>
      )}

      <div className="no-print space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
             <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </span>
             <input 
               type="text" 
               placeholder="Search by ID or Name..."
               className="w-full pl-12 pr-4 py-4 bg-white border border-transparent rounded-[1.5rem] text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10 transition-all"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={bills.length === 0}
            className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-50"
          >
            Export History
          </button>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar md:hidden">
          {['All', 'Paid', 'Pending', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-shrink-0 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all ${filter === f ? 'bg-sky-600 text-white border-sky-600 shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {filteredBills.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-6">ID</th>
                  <th className="px-8 py-6">Customer</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-8 py-6 font-black text-gray-900">{bill.id}</td>
                    <td className="px-8 py-6 font-bold text-gray-800">{bill.customer}</td>
                    <td className="px-8 py-6 font-black text-gray-900">₹{bill.amount.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[bill.status]}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button onClick={() => setSelectedBill(bill)} className="p-3 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="py-24 flex flex-col items-center justify-center text-center px-10">
               <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 grayscale opacity-30">📑</div>
               <h3 className="text-xl font-black text-gray-900">No Sales Recorded</h3>
               <p className="text-sm text-gray-400 mt-2 font-medium max-w-xs">Start a transaction in the New Sale tab to see billing history here.</p>
             </div>
          )}
        </div>

        <div className="md:hidden space-y-4">
          {filteredBills.map((bill) => (
            <div 
              key={bill.id} 
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
              onClick={() => setSelectedBill(bill)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{bill.id}</p>
                   <p className="text-lg font-black text-gray-900 mt-1">{bill.customer}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusColors[bill.status]}`}>
                  {bill.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                 <p className="text-xl font-black text-sky-600">₹{bill.amount.toFixed(2)}</p>
                 <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                   Details
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                 </div>
              </div>
            </div>
          ))}
          {filteredBills.length === 0 && (
             <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center flex flex-col items-center">
                <div className="text-4xl mb-4 grayscale opacity-30">📑</div>
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Empty Records</p>
             </div>
          )}
        </div>
      </div>

      {selectedBill && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 md:p-12">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invoice Details</h2>
                  <button onClick={() => setSelectedBill(null)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-5 bg-gray-50 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-sm font-black text-gray-900">{selectedBill.customer}</p>
                     </div>
                     <div className="p-5 bg-gray-50 rounded-3xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Items Summary</p>
                        <p className="text-sm font-black text-gray-900">{selectedBill.items} units purchased</p>
                     </div>
                  </div>
                  <div className="p-8 bg-sky-50 rounded-[2rem] border border-sky-100 flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Net Payable</p>
                       <p className="text-3xl font-black text-gray-900">₹{selectedBill.amount.toFixed(2)}</p>
                    </div>
                    <button onClick={() => window.print()} className="w-14 h-14 bg-sky-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-sky-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;
