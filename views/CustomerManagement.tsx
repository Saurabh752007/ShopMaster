
import React, { useState, useMemo, useEffect } from 'react';
import { Customer, Bill } from '../types';

const CustomerManagement: React.FC<{ onNavigateToBilling: (term: string) => void }> = ({ onNavigateToBilling }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = () => {
    const saved = localStorage.getItem('sm_customers');
    setCustomers(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sm_data_updated', loadData);
    return () => window.removeEventListener('sm_data_updated', loadData);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.phone.includes(query) || 
      c.id.toLowerCase().includes(query)
    );
  }, [customers, search]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer record? Lifetime data will be archived.')) {
      const updated = customers.filter(c => c.id !== id);
      setCustomers(updated);
      localStorage.setItem('sm_customers', JSON.stringify(updated));
      showToast('Customer record deleted successfully');
      window.dispatchEvent(new Event('sm_data_updated'));
    }
  };

  const handlePrintSummary = (customer: Customer) => {
    const allBills: Bill[] = JSON.parse(localStorage.getItem('sm_bills') || '[]');
    const customerBills = allBills.filter(b => b.customer === customer.name);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to print summary', 'error');
      return;
    }

    const rows = customerBills.map(bill => `
      <tr>
        <td>${bill.date}</td>
        <td>${bill.id}</td>
        <td>${bill.items}</td>
        <td>${bill.status}</td>
        <td style="text-align: right;">₹${bill.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Customer Summary - ${customer.name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 24px; font-weight: 900; margin-bottom: 5px; }
            .subtitle { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
            .field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: bold; }
            .field-value { font-size: 16px; font-weight: bold; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { text-align: left; border-bottom: 2px solid #eee; padding: 12px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
            td { border-bottom: 1px solid #eee; padding: 12px 8px; }
            .total-section { margin-top: 30px; text-align: right; border-top: 2px solid #111; padding-top: 20px; }
            .print-btn { display: none; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Customer Statement</h1>
          <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          
          <div class="grid">
            <div>
              <p class="field-label">Customer Name</p>
              <p class="field-value">${customer.name}</p>
            </div>
            <div>
              <p class="field-label">Customer ID</p>
              <p class="field-value">${customer.id}</p>
            </div>
            <div>
              <p class="field-label">Phone Number</p>
              <p class="field-value">${customer.phone}</p>
            </div>
            <div>
              <p class="field-label">Total Spent</p>
              <p class="field-value">₹${customer.totalSpent.toLocaleString()}</p>
            </div>
          </div>
          
          <h3>Transaction History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill ID</th>
                <th>Items</th>
                <th>Status</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #888;">No transaction history found.</td></tr>'}
            </tbody>
          </table>
          
          <div class="total-section">
            <p class="field-label">Lifetime Value</p>
            <p style="font-size: 24px; font-weight: 900;">₹${customer.totalSpent.toLocaleString()}</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedName = formData.get('name') as string;
    const updatedPhone = formData.get('phone') as string;
    const updatedLTV = parseFloat(formData.get('ltv') as string);

    if (!updatedName || !updatedPhone || isNaN(updatedLTV)) {
      showToast('Please fill all fields correctly', 'error');
      return;
    }

    const updated = customers.map(c => 
      c.id === editingCustomer?.id 
        ? { ...c, name: updatedName, phone: updatedPhone, totalSpent: updatedLTV } 
        : c
    );
    
    setCustomers(updated);
    localStorage.setItem('sm_customers', JSON.stringify(updated));
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    showToast('Customer information synchronized');
    window.dispatchEvent(new Event('sm_data_updated'));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-8 z-[150] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-sky-500' : 'bg-white/20'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm font-black">{toast.message}</p>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Customer Directory</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Relationship Management & CRM</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <div className="px-4 text-center border-r border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</p>
              <p className="text-xl font-black text-gray-900">{customers.length}</p>
           </div>
           <div className="px-4 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. LTV</p>
              <p className="text-xl font-black text-sky-600">₹{customers.length > 0 ? (customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length).toFixed(0) : 0}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-gray-100/30">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-center gap-6">
           <div className="relative flex-1 max-w-xl">
             <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </span>
             <input 
               type="text" 
               placeholder="Search by name, phone or ID..."
               className="w-full pl-12 pr-4 py-4 bg-white border border-transparent rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          {filteredCustomers.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Customer Profile</th>
                  <th className="px-8 py-6">Contact Number</th>
                  <th className="px-8 py-6">Total Spent (LTV)</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map(c => (
                    <tr key={c.id} className="group hover:bg-sky-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-base">{c.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-600 tabular-nums">
                        {c.phone}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900 text-lg">₹{c.totalSpent.toLocaleString()}</span>
                          {c.totalSpent > 10000 && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded tracking-widest">Premium</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handlePrintSummary(c)}
                            title="Print Summary"
                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          </button>
                          <button 
                            onClick={() => onNavigateToBilling(c.name)}
                            title="View Transaction History"
                            className="p-3 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                          </button>
                          <button 
                            onClick={() => setSelectedCustomer(c)}
                            title="View Profile"
                            className="p-3 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button 
                            onClick={() => { setEditingCustomer(c); setIsEditModalOpen(true); }}
                            title="Edit Information"
                            className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            title="Delete Record"
                            className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="py-24 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 grayscale opacity-40">👥</div>
              <h3 className="text-xl font-black text-gray-900">Directory Empty</h3>
              <p className="text-sm text-gray-400 mt-2 font-medium max-w-xs">Customers will appear here automatically when they are added to a sale.</p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT CUSTOMER MODAL */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <div>
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight">Edit Profile</h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {editingCustomer.id}</p>
               </div>
               <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-10 space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Full Name</label>
                  <input 
                    name="name"
                    required
                    defaultValue={editingCustomer.name}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Phone Number</label>
                  <input 
                    name="phone"
                    required
                    defaultValue={editingCustomer.phone}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Lifetime Value (₹)</label>
                  <input 
                    name="ltv"
                    type="number"
                    required
                    defaultValue={editingCustomer.totalSpent}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner"
                  />
               </div>
               <div className="pt-4 flex flex-col gap-3">
                  <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
                    Sync Changes
                  </button>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                    Discard
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CUSTOMER MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-sky-50 -z-10"></div>
               <button 
                 onClick={() => setSelectedCustomer(null)}
                 className="absolute top-6 right-6 w-8 h-8 rounded-xl bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:text-gray-900 transition-colors shadow-sm"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>

               <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-xl mx-auto mb-6 flex items-center justify-center text-4xl font-black text-sky-600">
                 {selectedCustomer.name.charAt(0)}
               </div>
               <h2 className="text-2xl font-black text-gray-900">{selectedCustomer.name}</h2>
               <p className="text-sm font-bold text-sky-600 mt-1">{selectedCustomer.id}</p>
               
               <div className="mt-10 grid grid-cols-2 gap-4 text-left">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-black text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                    <p className="text-sm font-black text-emerald-600">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
               </div>
               
               <button 
                 onClick={() => setSelectedCustomer(null)}
                 className="mt-10 w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
               >
                 Close Profile
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
