
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, UserRole } from '../types';
import BarcodeScanner from '../components/BarcodeScanner';

const INITIAL_CATEGORIES = [
  { name: 'Groceries', count: 0 },
  { name: 'Home Care', count: 0 },
  { name: 'Dairy & Bakery', count: 0 },
  { name: 'Cooking Essentials', count: 0 },
  { name: 'Snacks', count: 0 },
  { name: 'Beverages', count: 0 },
];

const ProductsManagement: React.FC<{ userRole: UserRole; onNavigateToBilling: (term: string) => void }> = ({ userRole, onNavigateToBilling }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [showScanner, setShowScanner] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const handleScan = (result: string) => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.value = result;
      // Play beep
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    }
    setShowScanner(false);
  };

  // Both ADMIN and USER roles can now manage products in the new simplified structure.
  const canManage = true; 

  const loadData = () => {
    const saved = localStorage.getItem('sm_products');
    setProducts(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('sm_data_updated', loadData);
    return () => window.removeEventListener('sm_data_updated', loadData);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
      const stockMatch = !showLowStockOnly || p.stock < 50;
      return categoryMatch && stockMatch;
    });
  }, [products, selectedCategory, showLowStockOnly]);

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      localStorage.setItem('sm_products', JSON.stringify(updated));
      window.dispatchEvent(new Event('sm_data_updated'));
    }
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Product = {
      id: editingProduct?.id || `PID-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      unit: formData.get('unit') as string,
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      barcode: formData.get('barcode') as string,
    };

    let updated;
    if (editingProduct) {
      updated = products.map(p => p.id === editingProduct.id ? productData : p);
    } else {
      updated = [productData, ...products];
    }
    setProducts(updated);
    localStorage.setItem('sm_products', JSON.stringify(updated));
    setShowProductModal(false);
    setEditingProduct(null);
    window.dispatchEvent(new Event('sm_data_updated'));
  };

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.stock < 50).length;
  }, [products]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {lowStockCount > 0 && (
        <div 
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`cursor-pointer p-6 rounded-[2rem] border transition-all active:scale-[0.98] ${showLowStockOnly ? 'bg-amber-100 border-amber-200 shadow-inner' : 'bg-amber-50 border-amber-100 shadow-sm hover:shadow-md'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${showLowStockOnly ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-600'}`}>
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Low Stock Alert</h3>
              <p className="text-sm font-medium text-amber-700">
                {lowStockCount} products have less than 50 units remaining. 
                <span className="underline ml-1 font-bold">{showLowStockOnly ? 'Show all products' : 'Tap to filter'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
           <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Catalog</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{products.length} Items Listed</p>
           </div>
           <div className="flex flex-wrap gap-2">
             <select 
               className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 outline-none focus:ring-4 focus:ring-sky-500/10 cursor-pointer shadow-sm"
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
             >
               <option value="All">Categories</option>
               {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
             </select>
             <button 
              onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
              className="px-6 py-3 bg-sky-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95"
             >
              + Add Product
             </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          {filteredProducts.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="px-8 py-6">Item Details</th>
                  <th className="px-8 py-6">Price</th>
                  <th className="px-8 py-6">Inventory</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900">{p.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{p.id}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900 text-sm">₹{p.price.toFixed(2)}</td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${p.stock < 10 ? 'bg-red-50 text-red-600' : p.stock < 50 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-white border border-gray-100 text-gray-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => onNavigateToBilling(p.name)} title="View Associated Bills" className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </button>
                        <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="p-2.5 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center flex flex-col items-center grayscale opacity-30">
               <div className="text-5xl mb-4">📦</div>
               <p className="text-[10px] font-black uppercase tracking-widest">No Products Found</p>
            </div>
          )}
        </div>
      </section>

      {showProductModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Name</label>
                <input required name="name" defaultValue={editingProduct?.name} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
                  <input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Level</label>
                  <input required name="stock" type="number" defaultValue={editingProduct?.stock} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all shadow-inner" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Barcode (Optional)</label>
                <div className="relative">
                  <input ref={barcodeInputRef} name="barcode" defaultValue={editingProduct?.barcode} placeholder="Scan or type barcode" className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all shadow-inner" />
                  <button 
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="absolute inset-y-2 right-2 px-3 bg-white rounded-xl text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-all flex items-center justify-center border border-gray-100 shadow-sm"
                    title="Scan Barcode"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                <select name="category" defaultValue={editingProduct?.category || 'Groceries'} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-black outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white transition-all shadow-inner">
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-xl hover:bg-sky-700 transition-all active:scale-95">Save Entry</button>
            </form>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

export default ProductsManagement;
