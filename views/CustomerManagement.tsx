
import React, { useState, useMemo } from 'react';
import { Customer } from '../types';

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-101', name: 'Rahul Sharma', phone: '9876543210', totalSpent: 12500 },
  { id: 'CUST-102', name: 'Priya Singh', phone: '9988776655', totalSpent: 8750 },
  { id: 'CUST-103', name: 'Amit Kumar', phone: '9765432109', totalSpent: 21000 },
  { id: 'CUST-104', name: 'Neha Gupta', phone: '9123456789', totalSpent: 5500 },
  { id: 'CUST-105', name: 'Vishal Reddy', phone: '9012345678', totalSpent: 1500 },
  { id: 'CUST-106', name: 'Deepak Verma', phone: '9345671234', totalSpent: 4200 },
];

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      setCustomers(prev => prev.filter(c => c.id !== id));
      showToast('Customer record deleted successfully');
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedName = formData.get('name') as string;
    const updatedPhone = formData.get('phone') as string;

    setCustomers(prev => prev.map(c => 
      c.id === editingCustomer?.id 
        ? { ...c, name: updatedName, phone: updatedPhone } 
        : c
    ));
    
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    showToast('Customer information updated');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-[110] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
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
              <p className="text-[10px] font-black text-gray-400 uppercase">Total Users</p>
              <p className="text-xl font-black text-gray-900">{customers.length}</p>
           </div>
           <div className="px-4 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">Avg. LTV</p>
              <p className="text-xl font-black text-sky-600">₹{(customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length).toFixed(0)}</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
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
             {search && (
               <button 
                 onClick={() => setSearch('')}
                 className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-gray-600 transition-colors"
               >
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
               </button>
             )}
           </div>
        </div>

        <div className="overflow-x-auto">
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
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(c => (
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
                          onClick={() => setSelectedCustomer(c)}
                          title="View Profile"
                          className="p-3 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button 
                          onClick={() => { setEditingCustomer(c); setIsEditModalOpen(true); }}
                          title="Edit Information"
                          className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          title="Remove Customer"
                          className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-40">👥</div>
                      <h3 className="text-xl font-black text-gray-900">No customers found</h3>
                      <p className="text-sm text-gray-400 font-bold mt-1">Try searching for a different name or phone number</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
               
               <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-black text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                    <p className="text-sm font-black text-emerald-600">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
               </div>

               <div className="mt-8 pt-8 border-t border-gray-100 space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Recent Insights</p>
                  <div className="flex items-center gap-4 text-left p-4 bg-sky-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl">🛍️</div>
                    <div>
                      <p className="text-xs font-black text-gray-900">Loyal Shopper</p>
                      <p className="text-[10px] text-gray-500 font-medium">Customer has visited 12 times in the last 6 months.</p>
                    </div>
                  </div>
               </div>
               
               <button 
                 onClick={() => setSelectedCustomer(null)}
                 className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
               >
                 Close Profile
               </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {isEditModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900">Edit Customer Info</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-10 h-10 rounded-2xl bg-white border border-gray-100 text-gray-400 flex items-center justify-center hover:text-gray-900 transition-all active:scale-90 shadow-sm"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <form onSubmit={handleEditSubmit} className="p-10 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Name</label>
                  <input 
                    name="name"
                    required
                    defaultValue={editingCustomer.name}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input 
                    name="phone"
                    required
                    type="tel"
                    defaultValue={editingCustomer.phone}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                   <button 
                     type="button"
                     onClick={() => setIsEditModalOpen(false)}
                     className="flex-1 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-sm hover:text-gray-900 hover:border-gray-900 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit"
                     className="flex-[2] py-4 bg-sky-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     Update Profile
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
