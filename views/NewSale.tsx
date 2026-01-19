
import React, { useState, useMemo } from 'react';
import { Product, Customer, Bill } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Basmati Rice (5kg)', price: 450.00, unit: 'bags', stock: 120, category: 'Groceries' },
  { id: '2', name: 'Dishwashing Liquid (1L)', price: 120.00, unit: 'bottles', stock: 35, category: 'Home Care' },
  { id: '3', name: 'Fresh Milk (500ml)', price: 30.00, unit: 'pouches', stock: 200, category: 'Dairy & Bakery' },
  { id: '4', name: 'Atta (10kg)', price: 380.00, unit: 'bags', stock: 42, category: 'Groceries' },
  { id: '5', name: 'Coconut Oil (1L)', price: 210.00, unit: 'bottles', stock: 55, category: 'Cooking Essentials' },
  { id: '6', name: 'Detergent Powder (2kg)', price: 195.00, unit: 'packs', stock: 70, category: 'Home Care' },
  { id: '7', name: 'Potato Chips (Large)', price: 50.00, unit: 'packs', stock: 150, category: 'Snacks' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'CUST-101', name: 'Rahul Sharma', phone: '9876543210', totalSpent: 12500 },
  { id: 'CUST-102', name: 'Priya Singh', phone: '9988776655', totalSpent: 8750 },
  { id: 'CUST-103', name: 'Amit Kumar', phone: '9765432109', totalSpent: 21000 },
];

interface CartItem extends Product {
  quantity: number;
}

const NewSale: React.FC = () => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [lastBillId, setLastBillId] = useState('');
  
  // Customer Selection States
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Load latest data from localStorage or use defaults
  const [currentProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sm_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const filteredProducts = useMemo(() => {
    return currentProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, currentProducts]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    const savedCustomers = JSON.parse(localStorage.getItem('sm_customers') || JSON.stringify(INITIAL_CUSTOMERS));
    return savedCustomers.filter((c: Customer) => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customerSearch]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
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
    if (cart.length === 0 || !selectedCustomer) return;
    setCheckoutStatus('processing');
    
    setTimeout(() => {
      const billId = `BN${Math.floor(100000 + Math.random() * 900000)}`;
      
      // 1. UPDATE BILLING HISTORY
      const newBill: Bill = {
        id: billId,
        date: new Date().toISOString().split('T')[0],
        customer: selectedCustomer.name,
        amount: total,
        status: 'Paid',
        items: cart.reduce((acc, item) => acc + item.quantity, 0),
        gstDetails: '18% GST Applied'
      };
      const bills = JSON.parse(localStorage.getItem('sm_bills') || '[]');
      localStorage.setItem('sm_bills', JSON.stringify([newBill, ...bills]));

      // 2. UPDATE INVENTORY
      const products = JSON.parse(localStorage.getItem('sm_products') || JSON.stringify(INITIAL_PRODUCTS));
      const updatedProducts = products.map((p: Product) => {
        const cartItem = cart.find(item => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });
      localStorage.setItem('sm_products', JSON.stringify(updatedProducts));

      // 3. UPDATE CUSTOMER LTV
      const customers = JSON.parse(localStorage.getItem('sm_customers') || JSON.stringify(INITIAL_CUSTOMERS));
      const updatedCustomers = customers.map((c: Customer) => {
        if (c.id === selectedCustomer.id) {
          return { ...c, totalSpent: c.totalSpent + total };
        }
        return c;
      });
      // If it was a walk-in not in original list, we'd add it here if needed
      if (!customers.find((c: Customer) => c.id === selectedCustomer.id)) {
        updatedCustomers.push({ ...selectedCustomer, totalSpent: total });
      }
      localStorage.setItem('sm_customers', JSON.stringify(updatedCustomers));

      setLastBillId(billId);
      setCheckoutStatus('success');
      setCart([]);
      
      // Dispatch event to notify other components to refresh if they are mounted
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
          <button className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all active:scale-95 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print Invoice
          </button>
          <button onClick={() => { setCheckoutStatus('idle'); setSelectedCustomer(null); }} className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95">Start New Transaction</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Panel: Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="relative">
            <span className="absolute inset-y-0 left-6 flex items-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Scan barcode or type product name..."
              className="w-full pl-16 pr-6 py-5 bg-gray-50 border border-transparent rounded-3xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-20 md:pb-0">
          {filteredProducts.map(p => (
            <button 
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock === 0}
              className={`bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-sky-500 hover:shadow-xl hover:shadow-sky-100/30 transition-all group text-left flex flex-col justify-between h-48 ${p.stock === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{p.category}</p>
                <h4 className="font-black text-gray-900 group-hover:text-sky-600 transition-colors leading-tight">{p.name}</h4>
              </div>
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-lg font-black text-gray-900">₹{p.price.toFixed(2)}</p>
                   <p className={`text-[10px] font-bold ${p.stock < 10 ? 'text-red-500' : 'text-emerald-600'}`}>{p.stock === 0 ? 'Out of Stock' : `${p.stock} in stock`}</p>
                </div>
                {p.stock > 0 && (
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-sky-600 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Cart Summary */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col sticky top-8 h-[calc(100vh-10rem)]">
        <div className="p-8 border-b border-gray-100">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Checkout</h3>
              <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{cart.length} items</span>
           </div>

           <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Identify Customer</label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-sky-50 border border-sky-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sky-600 font-black shadow-sm">{selectedCustomer.name.charAt(0)}</div>
                      <div>
                         <p className="text-sm font-black text-gray-900">{selectedCustomer.name}</p>
                         <p className="text-[10px] text-sky-500 font-bold">{selectedCustomer.phone}</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
              ) : (
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search name or phone..."
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  {showCustomerDropdown && (customerSearch.length > 0 || filteredCustomers.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-4 custom-scrollbar">
                       {filteredCustomers.map((c: Customer) => (
                         <button 
                           key={c.id} 
                           onClick={() => {
                             setSelectedCustomer(c);
                             setShowCustomerDropdown(false);
                           }}
                           className="w-full p-4 text-left hover:bg-sky-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
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
                         className="w-full p-4 text-left text-sky-600 font-black text-[10px] uppercase tracking-widest hover:bg-sky-50 transition-colors bg-sky-50/30"
                       >
                         + Quick Add "{customerSearch || 'Walk-in'}"
                       </button>
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="text-4xl mb-4 grayscale opacity-30">🛒</div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-2">Select items from the product list to start billing</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group animate-in slide-in-from-right-4">
                <div className="flex-1">
                  <p className="text-sm font-black text-gray-900 leading-tight">{item.name}</p>
                  <p className="text-xs text-sky-600 font-bold mt-1">₹{item.price.toFixed(2)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
                      </button>
                      <span className="w-8 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)} 
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-gray-50 text-gray-400 hover:text-sky-600 transition-colors disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                      </button>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 space-y-4">
           <div className="flex justify-between text-sm font-bold text-gray-400">
             <span>Subtotal</span>
             <span>₹{subtotal.toFixed(2)}</span>
           </div>
           <div className="flex justify-between text-sm font-bold text-gray-400">
             <span>GST (18%)</span>
             <span>₹{gst.toFixed(2)}</span>
           </div>
           <div className="flex justify-between items-end pt-4 border-t border-gray-200">
             <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
                <p className="text-3xl font-black text-gray-900">₹{total.toFixed(2)}</p>
             </div>
             <button 
               onClick={handleCheckout}
               disabled={cart.length === 0 || !selectedCustomer || checkoutStatus === 'processing'}
               className="px-10 py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
             >
               {checkoutStatus === 'processing' ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                 'Finalize Sale'
               )}
             </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default NewSale;
