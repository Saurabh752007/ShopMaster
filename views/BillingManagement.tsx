
import React, { useState, useMemo } from 'react';
import { Bill } from '../types';

const INITIAL_BILLS: Bill[] = [
  { id: 'BN001234', date: '2024-07-28', customer: 'A.K. Sharma', amount: 1500.00, status: 'Paid', items: 5, gstDetails: '18% IGST' },
  { id: 'BN001233', date: '2024-07-27', customer: 'Priya Singh', amount: 850.50, status: 'Pending', items: 2, gstDetails: '12% CGST/SGST' },
  { id: 'BN001232', date: '2024-07-27', customer: 'Rahul Gupta', amount: 2100.00, status: 'Paid', items: 7, gstDetails: '18% CGST/SGST' },
  { id: 'BN001231', date: '2024-07-26', customer: 'Sneha Rao', amount: 320.00, status: 'Cancelled', items: 1, gstDetails: '5% CGST/SGST' },
  { id: 'BN001230', date: '2024-07-25', customer: 'Vikram Reddy', amount: 990.25, status: 'Paid', items: 3, gstDetails: '12% IGST' },
  { id: 'BN001229', date: '2024-07-24', customer: 'Divya Patel', amount: 175.00, status: 'Pending', items: 1, gstDetails: '0% GST' },
];

const BillingManagement: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Pending' | 'Cancelled'>('All');
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const filteredBills = useMemo(() => {
    return INITIAL_BILLS.filter(bill => {
      const matchesFilter = filter === 'All' || bill.status === filter;
      const matchesSearch = bill.id.toLowerCase().includes(search.toLowerCase()) || 
                            bill.customer.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ['Bill ID', 'Date', 'Customer', 'Amount', 'Status', 'Items', 'GST Details'];
      const rows = filteredBills.map(b => [b.id, b.date, b.customer, b.amount, b.status, b.items, b.gstDetails]);
      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ShopMaster_Bills_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 800);
  };

  const handlePrint = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPrinting(true);
    // Give UI a moment to switch focus
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleShare = async (bill: Bill) => {
    const shareData = {
      title: `Invoice ${bill.id} - ShopMaster Pro`,
      text: `Hello ${bill.customer}, your invoice for ₹${bill.amount.toFixed(2)} is ready. Date: ${bill.date}. Status: ${bill.status}.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} Check here: ${shareData.url}`);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 3000);
      } catch (err) {
        alert('Could not copy link to clipboard.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Toast Notification for Share */}
      {showShareSuccess && (
        <div className="fixed top-24 right-8 z-[110] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8">
          <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-sm font-black">Invoice link copied to clipboard!</p>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden no-print">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
             <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </span>
             <input 
               type="text" 
               placeholder="Search transactions..."
               className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>

          <div className="flex gap-1 p-1 bg-gray-100/80 rounded-2xl">
             {['All', 'Paid', 'Pending', 'Cancelled'].map((f) => (
               <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {f}
               </button>
             ))}
          </div>

          <button 
            disabled={isExporting}
            onClick={handleExportCSV}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95 disabled:opacity-50"
          >
             {isExporting ? (
               <div className="w-4 h-4 border-2 border-gray-300 border-t-sky-600 rounded-full animate-spin"></div>
             ) : (
               <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0L8 8m4-4v12" /></svg>
             )}
             {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5">Reference</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-sky-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-black text-gray-900">{bill.id}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">{bill.date}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-800">{bill.customer}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{bill.items} items • {bill.gstDetails}</div>
                  </td>
                  <td className="px-8 py-6 font-black text-gray-900 text-base">₹{bill.amount.toFixed(2)}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      bill.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setSelectedBill(bill)}
                        title="View Details"
                        className="p-3 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm active:scale-90"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button 
                        onClick={() => handlePrint(bill)}
                        title="Print Invoice"
                        className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm active:scale-90"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW BILL MODAL */}
      {selectedBill && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300 no-print">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-black text-gray-900">Transaction Details</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: {selectedBill.id}</p>
              </div>
              <button 
                onClick={() => setSelectedBill(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div id="modal-content" className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-sky-600 font-black text-2xl mb-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                      ShopMaster Pro
                    </div>
                    <p className="text-sm text-gray-500 font-medium">123 Business Hub, Sector 44<br/>Gurgaon, Haryana 122003</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
                      selectedBill.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {selectedBill.status}
                    </span>
                    <p className="text-sm font-black text-gray-900">Date: {selectedBill.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-100">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Bill To</p>
                    <p className="text-lg font-black text-gray-900">{selectedBill.customer}</p>
                    <p className="text-sm text-gray-500 font-medium">+91 98765 XXXXX</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Info</p>
                    <p className="text-sm font-bold text-gray-900">Mode: UPI/Cash</p>
                    <p className="text-sm text-gray-500 font-medium">GSTIN: 07AAAAA0000A1Z5</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Summary</p>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-bold">Standard SKU Items (x{selectedBill.items})</span>
                      <span className="font-black text-gray-900">₹{(selectedBill.amount * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Taxes ({selectedBill.gstDetails})</span>
                      <span className="font-bold text-gray-500">₹{(selectedBill.amount * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-lg font-black text-gray-900">Total Amount</span>
                      <span className="text-2xl font-black text-sky-600">₹{selectedBill.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex gap-4">
              <button 
                disabled={isPrinting}
                onClick={() => handlePrint(selectedBill)}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-sky-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-70"
              >
                {isPrinting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                )}
                {isPrinting ? 'Preparing...' : 'Print Invoice'}
              </button>
              <button 
                onClick={() => handleShare(selectedBill)}
                className="group px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-black text-sm hover:bg-gray-900 hover:text-white transition-all active:scale-95 flex items-center gap-3 shadow-sm hover:shadow-xl"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY TEMPLATE (Hidden from normal screen via CSS) */}
      {selectedBill && (
        <div className="print-only p-12 bg-white text-black min-h-screen">
          <div className="max-w-4xl mx-auto border-4 border-black p-12">
            <div className="flex justify-between items-start border-b-4 border-black pb-10 mb-10">
              <div>
                <h1 className="text-5xl font-black tracking-tighter mb-2">INVOICE</h1>
                <p className="text-xl font-bold uppercase tracking-widest text-gray-500">Retail Bill of Supply</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-sky-600 mb-2">ShopMaster Pro</div>
                <p className="font-bold">GSTIN: 07AAAAA0000A1Z5</p>
                <p className="font-medium text-gray-500">Reg: DL-44-SM-2024</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="space-y-2">
                <h2 className="text-xs font-black uppercase text-gray-400">Bill To:</h2>
                <p className="text-3xl font-black">{selectedBill.customer}</p>
                <p className="text-lg font-bold text-gray-600">Consumer ID: SM-{selectedBill.customer.replace(' ', '').slice(0, 4).toUpperCase()}</p>
              </div>
              <div className="text-right space-y-2">
                <h2 className="text-xs font-black uppercase text-gray-400">Invoice Metadata:</h2>
                <p className="text-lg font-black">Ref: <span className="text-sky-600">{selectedBill.id}</span></p>
                <p className="text-lg font-bold">Date: {selectedBill.date}</p>
                <p className="text-lg font-bold">Mode: POS Terminal #02</p>
              </div>
            </div>

            <table className="w-full mb-12">
              <thead className="border-b-4 border-black">
                <tr className="text-left">
                  <th className="py-6 font-black text-sm uppercase tracking-widest">Description</th>
                  <th className="py-6 font-black text-sm uppercase tracking-widest text-center">Qty</th>
                  <th className="py-6 font-black text-sm uppercase tracking-widest text-right">Taxable Val</th>
                  <th className="py-6 font-black text-sm uppercase tracking-widest text-right">Net Amt</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                <tr>
                  <td className="py-8">
                    <p className="text-lg font-black">Miscellaneous Store Goods</p>
                    <p className="text-sm text-gray-500 font-bold">HSN: 998311 • Mixed Inventory Bundle</p>
                  </td>
                  <td className="py-8 text-center text-lg font-bold">{selectedBill.items} units</td>
                  <td className="py-8 text-right text-lg font-bold">₹{(selectedBill.amount * 0.85).toFixed(2)}</td>
                  <td className="py-8 text-right text-xl font-black">₹{selectedBill.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end pt-10">
              <div className="w-80 space-y-4">
                <div className="flex justify-between text-lg font-bold text-gray-500">
                  <span>Gross Subtotal</span>
                  <span>₹{(selectedBill.amount * 0.85).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-500">
                  <span>GST ({selectedBill.gstDetails})</span>
                  <span>₹{(selectedBill.amount * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-3xl font-black pt-6 border-t-4 border-black">
                  <span>PAYABLE</span>
                  <span className="text-sky-600">₹{selectedBill.amount.toFixed(2)}</span>
                </div>
                <div className="pt-8 text-right italic font-bold text-gray-400">
                  Computer generated invoice. No signature required.
                </div>
              </div>
            </div>
            
            <div className="mt-24 text-center">
              <div className="inline-block border-2 border-black px-8 py-3 font-black text-sm tracking-[0.2em] uppercase">
                Powered by ShopMaster Pro India
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;
