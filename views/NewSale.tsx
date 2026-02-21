
import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Product, Customer, Bill } from '../types';
import BarcodeScanner from '../components/BarcodeScanner';

interface CartItem extends Product {
  quantity: number;
}

const NewSale: React.FC = () => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [lastBillId, setLastBillId] = useState('');
  const [billStatus, setBillStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'QR' | 'Card'>('Cash');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Customer Selection States
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [showScanner, setShowScanner] = useState(false);
  const [lastScannedMessage, setLastScannedMessage] = useState<string | null>(null);
  const isScanningPaused = React.useRef(false);

  // Load latest data from localStorage
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);

  const loadData = () => {
    const saved = localStorage.getItem('sm_products');
    setCurrentProducts(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sm_data_updated', loadData);
    return () => window.removeEventListener('sm_data_updated', loadData);
  }, []);

  const handleScan = (result: string) => {
    if (isScanningPaused.current) return;

    // Find product by barcode or ID
    const product = currentProducts.find(p => p.barcode === result || p.id === result);
    
    if (product) {
      // Check if we have enough stock
      const inCart = cart.find(c => c.id === product.id)?.quantity || 0;
      if (inCart >= product.stock) {
        setLastScannedMessage(`Max Stock: ${product.name}`);
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); // Error beep
        audio.play().catch(() => {});
        
        isScanningPaused.current = true;
        setTimeout(() => {
          isScanningPaused.current = false;
          setLastScannedMessage(null);
        }, 1500);
        return;
      }

      addToCart(product);
      
      // Feedback
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Simple beep
      audio.play().catch(() => {}); // Ignore play errors
      
      setLastScannedMessage(`Added: ${product.name}`);
      isScanningPaused.current = true;
      
      // Cooldown
      setTimeout(() => {
        isScanningPaused.current = false;
        setLastScannedMessage(null);
      }, 1500);
    } else {
      // Only alert if it's a new wrong code, to avoid spamming alerts
      // For now, just show a message in the scanner overlay
      setLastScannedMessage(`Not Found: ${result}`);
      isScanningPaused.current = true;
      setTimeout(() => {
        isScanningPaused.current = false;
        setLastScannedMessage(null);
      }, 1500);
    }
  };

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, currentProducts]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    const savedCustomers = JSON.parse(localStorage.getItem('sm_customers') || '[]');
    return savedCustomers.filter((c: Customer) => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customerSearch]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Prevent adding more than available stock
        if (existing.quantity >= product.stock) return prev;
        
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Prevent adding if out of stock
      if (product.stock <= 0) return prev;
      
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = currentProducts.find(p => p.id === id);
        const maxStock = product ? product.stock : item.quantity;
        const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const gst = subtotal * 0.18; // 18% GST simulated
  const total = subtotal + gst;

  const handleCheckout = () => {
    if (cart.length === 0) {
      setValidationError("Cart is empty. Please add products.");
      return;
    }
    if (!selectedCustomer) {
      setValidationError("Missing customer details. Please select a customer.");
      return;
    }

    setCheckoutStatus('processing');
    
    setTimeout(() => {
      const billId = `BN${Math.floor(100000 + Math.random() * 900000)}`;
      
      // 1. UPDATE BILLING HISTORY
      const newBill: Bill = {
        id: billId,
        date: new Date().toISOString().split('T')[0],
        customer: selectedCustomer.name,
        amount: total,
        status: billStatus,
        paymentMode: paymentMode,
        items: cart.reduce((acc, item) => acc + item.quantity, 0),
        itemsList: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        gstDetails: '18% GST Applied'
      };
      const bills = JSON.parse(localStorage.getItem('sm_bills') || '[]');
      localStorage.setItem('sm_bills', JSON.stringify([newBill, ...bills]));

      // 2. UPDATE INVENTORY
      const products = JSON.parse(localStorage.getItem('sm_products') || '[]');
      const updatedProducts = products.map((p: Product) => {
        const cartItem = cart.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
      localStorage.setItem('sm_products', JSON.stringify(updatedProducts));

      // 3. UPDATE CUSTOMER LTV
      const customers = JSON.parse(localStorage.getItem('sm_customers') || '[]');
      const updatedCustomers = [...customers];
      const customerIndex = updatedCustomers.findIndex((c: Customer) => c.id === selectedCustomer.id);
      
      if (customerIndex > -1) {
        updatedCustomers[customerIndex] = { ...updatedCustomers[customerIndex], totalSpent: updatedCustomers[customerIndex].totalSpent + total };
      } else {
        // Handle walk-in creation
        updatedCustomers.push({ ...selectedCustomer, totalSpent: total });
      }
      localStorage.setItem('sm_customers', JSON.stringify(updatedCustomers));

      setLastBillId(billId);
      setCheckoutStatus('success');
      setCart([]);
      setBillStatus('Paid');
      setPaymentMode('Cash');
      
      // Dispatch event to notify other components to refresh
      window.dispatchEvent(new Event('sm_data_updated'));
    }, 1500);
  };

  const handleQuickAddCustomer = () => {
    const newCust: Customer = {
      id: `CUST-${Math.floor(Math.random() * 1000)}`,
      name: customerSearch || "Walk-in Customer",
      phone: "Not provided",
      totalSpent: 0
    };
    setSelectedCustomer(newCust);
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => setValidationError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  const handlePrintInvoice = () => {
    const bills = JSON.parse(localStorage.getItem('sm_bills') || '[]');
    const bill = bills.find((b: Bill) => b.id === lastBillId);

    if (!bill) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Bill ID: ${bill.id}`, 14, 30);
    doc.text(`Date: ${new Date(bill.date).toLocaleDateString()}`, 14, 36);
    doc.text(`Customer: ${bill.customer}`, 14, 42);
    
    // Items Table
    const tableColumn = ["Item", "Quantity", "Price", "Total"];
    const tableRows: any[] = [];

    bill.itemsList?.forEach((item: any) => {
      const itemData = [
        item.name,
        item.quantity,
        item.price.toFixed(2),
        (item.price * item.quantity).toFixed(2)
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.text(`Total Amount: ${bill.amount.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Payment Mode: ${bill.paymentMode}`, 14, finalY + 16);
    doc.text(`Status: ${bill.status}`, 14, finalY + 22);

    doc.save(`invoice_${bill.id}.pdf`);
  };

  if (checkoutStatus === 'success') {
    return (
      <div className="max-w-md mx-auto py-12 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🎉</div>
        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Sale Completed!</h2>
        <p className="text-gray-500 font-medium mb-6 leading-relaxed">
          Bill <span className="text-sky-600 font-black">#{lastBillId}</span> for <span className="text-gray-900 font-bold">{selectedCustomer?.name}</span> was generated.
        </p>
        <div className="p-4 bg-gray-50 rounded-2xl mb-10 text-xs font-bold text-gray-400 uppercase tracking-widest flex flex-col gap-2">
           <div className="flex items-center justify-center gap-2 text-emerald-600">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             Inventory Updated
           </div>
           <div className="flex items-center justify-center gap-2 text-emerald-600">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             Customer LTV Synchronized
           </div>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={handlePrintInvoice} className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Invoice
          </button>
          <button onClick={() => { setCheckoutStatus('idle'); setSelectedCustomer(null); }} className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95">Start New Transaction</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 pb-4 md:pb-0 relative">
      {validationError && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest animate-in slide-in-from-bottom-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {validationError}
        </div>
      )}

      {/* Top Bar: Search & Customer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Search */}
        <div className="lg:col-span-8 relative z-30">
          <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm flex items-center">
            <div className="pl-6 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search product by name or scan barcode..."
              className="flex-1 min-w-0 px-4 py-4 bg-transparent font-bold outline-none text-gray-900 placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <button 
              onClick={() => setShowScanner(true)}
              className="shrink-0 p-3 bg-gray-50 rounded-[1.5rem] text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-all border border-gray-100 mr-2"
              title="Scan Barcode"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          {search && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[2rem] shadow-2xl border border-gray-100 max-h-[60vh] overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => { addToCart(p); setSearch(''); }}
                    disabled={p.stock === 0}
                    className={`w-full p-4 hover:bg-gray-50 rounded-[1.5rem] flex items-center justify-between group transition-all ${p.stock === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                        📦
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 group-hover:text-sky-600 transition-colors">{p.name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category} • {p.stock} in stock</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">₹{p.price.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">per {p.unit}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <p className="font-bold">No products found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Selection */}
        <div className="lg:col-span-4 relative z-20">
          <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm">
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-2 pl-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-black shadow-sm">{selectedCustomer.name.charAt(0)}</div>
                    <div>
                       <p className="text-sm font-black text-gray-900 leading-tight">{selectedCustomer.name}</p>
                       <p className="text-[10px] text-sky-500 font-bold">{selectedCustomer.phone}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedCustomer(null)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input 
                  type="text"
                  placeholder="Search customer..."
                  className="w-full pl-12 pr-4 py-4 bg-transparent font-bold outline-none text-gray-900 placeholder-gray-400"
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                />
                {showCustomerDropdown && (customerSearch.length > 0 || filteredCustomers.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-20 max-h-60 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-4 custom-scrollbar">
                     {filteredCustomers.map((c: Customer) => (
                       <button 
                         key={c.id} 
                         onClick={() => {
                           setSelectedCustomer(c);
                           setShowCustomerDropdown(false);
                         }}
                         className="w-full p-4 text-left hover:bg-gray-50 rounded-2xl flex items-center gap-3 transition-colors"
                       >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500">{c.name.charAt(0)}</div>
                          <div>
                             <p className="text-sm font-black text-gray-900">{c.name}</p>
                             <p className="text-[10px] text-gray-400 font-bold">{c.phone}</p>
                          </div>
                       </button>
                     ))}
                     <button 
                       onClick={handleQuickAddCustomer}
                       className="w-full p-4 text-left text-sky-600 font-black text-[10px] uppercase tracking-widest hover:bg-sky-50 rounded-2xl transition-colors bg-sky-50/30 mt-1"
                     >
                       + Quick Add "{customerSearch || 'Walk-in'}"
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items Table */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[200px]">
        <div className="grid grid-cols-12 gap-4 p-6 bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
           <div className="col-span-5 md:col-span-6">Product Details</div>
           <div className="col-span-2 text-center hidden md:block">Unit Price</div>
           <div className="col-span-4 md:col-span-2 text-center">Quantity</div>
           <div className="col-span-3 md:col-span-2 text-right">Total</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
               <div className="text-6xl mb-4">🛒</div>
               <p className="font-black uppercase tracking-widest text-gray-400">Cart is Empty</p>
             </div>
           ) : (
             cart.map(item => (
               <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
                  <div className="col-span-5 md:col-span-6">
                     <p className="text-sm font-black text-gray-900">{item.name}</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                     <p className="text-xs text-sky-600 font-bold md:hidden mt-1">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2 text-center hidden md:block font-bold text-gray-600">
                     ₹{item.price.toFixed(2)}
                  </div>
                  <div className="col-span-4 md:col-span-2 flex justify-center">
                     <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)} 
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-sky-600 transition-colors disabled:opacity-30"
                        >
                          +
                        </button>
                     </div>
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right flex items-center justify-end gap-4">
                     <span className="font-black text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                     <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Footer / Checkout Controls */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 mb-4 md:mb-0">
         <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            {/* Payment Settings */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</label>
                  <div className="flex bg-gray-50 rounded-2xl p-1 border border-gray-100">
                    <button 
                      onClick={() => setBillStatus('Paid')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billStatus === 'Paid' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Paid
                    </button>
                    <button 
                      onClick={() => setBillStatus('Pending')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${billStatus === 'Pending' ? 'bg-white text-amber-600 shadow-sm ring-1 ring-amber-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Pending
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Cash', 'QR', 'Card'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode as any)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${paymentMode === mode ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  
                  {/* Dynamic Payment Content */}
                  {paymentMode === 'QR' && (
                     <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in zoom-in-95 text-center">
                        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm shrink-0">
                           <img 
                             src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=9226057588@ybl&pn=ShopMaster&am=${total.toFixed(2)}&cu=INR`} 
                             alt="QR" 
                             className="w-48 h-48 object-contain mix-blend-multiply"
                           />
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-900">Scan to Pay ₹{total.toFixed(2)}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">UPI / GPay / Paytm</p>
                        </div>
                     </div>
                  )}
                  
                  {paymentMode === 'Card' && (
                     <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        Activate Terminal
                     </button>
                  )}
               </div>
            </div>

            {/* Totals & Action */}
            <div className="w-full lg:w-96 space-y-6 pt-8 lg:pt-0 lg:border-l border-gray-100 lg:pl-8">
               <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-400">
                    <span>GST (18%)</span>
                    <span>₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
                    <p className="text-4xl font-black text-gray-900">₹{total.toFixed(2)}</p>
                  </div>
               </div>

               <button 
                 onClick={handleCheckout}
                 disabled={checkoutStatus === 'processing'}
                 className="w-full py-6 bg-sky-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
               >
                 {checkoutStatus === 'processing' ? (
                   <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                   <>
                     <span>Complete Sale</span>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                   </>
                 )}
               </button>
            </div>
         </div>
      </div>

      {showScanner && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
          lastScannedMessage={lastScannedMessage}
        />
      )}
    </div>
  );
};

export default NewSale;
