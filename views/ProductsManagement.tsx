
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';

const INITIAL_CATEGORIES = [
  { name: 'Groceries', count: 0 },
  { name: 'Home Care', count: 0 },
  { name: 'Dairy & Bakery', count: 0 },
  { name: 'Cooking Essentials', count: 0 },
  { name: 'Snacks', count: 0 },
  { name: 'Beverages', count: 0 },
];

const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("Barcode Scanner ready. No products currently registered for scan-to-find. Add products first.");
    }, 2000);
  };

  return (
    <div className="space-y-12 relative">
      {/* Scanner Overlay Simulation */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white">
           <div className="w-64 h-64 border-2 border-sky-500 rounded-lg relative overflow-hidden mb-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-sky-500 animate-bounce shadow-[0_0_15px_rgba(14,165,233,0.8)]"></div>
           </div>
           <p className="text-xl font-bold animate-pulse">Scanning Barcode...</p>
           <button onClick={() => setIsScanning(false)} className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm">Cancel</button>
        </div>
      )}

      {/* Product Listing */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/30">
           <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Inventory Dashboard</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{products.length} Items Total</p>
           </div>
           <div className="flex flex-wrap gap-2">
             <div className="relative">
               <select 
                 className="appearance-none px-6 pr-12 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 cursor-pointer transition-all shadow-sm"
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
               >
                 <option value="All">All Categories</option>
                 {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
               </select>
               <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
             </div>
             
             <button 
               onClick={() => setShowLowStockOnly(!showLowStockOnly)}
               className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${showLowStockOnly ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
             >
               Low Stock {showLowStockOnly && '✓'}
             </button>
             
             <button 
               onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
               className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 active:scale-95 transition-all"
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
                  <th className="px-8 py-6">Product Name</th>
                  <th className="px-8 py-6">Price</th>
                  <th className="px-8 py-6">Unit</th>
                  <th className="px-8 py-6">Stock</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-sky-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.id}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-gray-900">₹{p.price.toFixed(2)}</td>
                    <td className="px-8 py-6 font-bold text-gray-400 text-xs">{p.unit}</td>
                    <td className="px-8 py-6">
                      <span className={`font-black text-sm px-3 py-1 rounded-lg ${p.stock < 10 ? 'bg-red-50 text-red-600' : p.stock < 50 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {p.stock === 0 ? 'Out of Stock' : p.stock}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-white border border-gray-100 text-gray-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.category}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-sky-600 hover:bg-sky-600 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-24 text-center flex flex-col items-center">
               <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 grayscale opacity-30">📦</div>
               <h3 className="text-xl font-black text-gray-900">Inventory Empty</h3>
               <p className="text-sm text-gray-400 mt-2 font-medium max-w-xs">Start building your catalog by adding your first product.</p>
               <button 
                onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                className="mt-8 px-8 py-4 bg-sky-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-100 hover:scale-105 active:scale-95 transition-all"
               >
                 + Register First Product
               </button>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Product Categories</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Classification Hierarchy</p>
          </div>
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-sky-200 hover:text-sky-600 active:scale-95 transition-all"
          >
            + New Category
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(c => (
            <div key={c.name} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:border-sky-200 transition-all group cursor-pointer active:scale-95">
              <div>
                <h3 className="text-lg font-black text-gray-900 group-hover:text-sky-600 transition-colors leading-tight">{c.name}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">{products.filter(p => p.category === c.name).length} Products Linked</p>
              </div>
            </div>
          ))}
          <div className="p-8 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-sky-200 hover:text-sky-400 transition-all cursor-pointer">
             <span className="text-xs font-black uppercase tracking-widest">+ Create Custom</span>
          </div>
        </div>
      </section>

      {/* Barcode Scanner Footer */}
      <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-3xl">🖨️</div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Barcode Quick Search</h3>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-widest mt-1">Scan to edit or restock</p>
            </div>
         </div>
         <button 
           onClick={handleScan}
           className="w-full md:w-auto px-10 py-5 bg-sky-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-sky-500 transition-all active:scale-95 shadow-xl shadow-sky-600/20"
         >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            Active Scanner
         </button>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-black text-gray-900">{editingProduct ? 'Update Product' : 'Register Product'}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Catalog Entry</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Product Name</label>
                <input required name="name" defaultValue={editingProduct?.name} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner" placeholder="e.g. Basmati Rice 5kg" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Sale Price (₹)</label>
                  <input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Initial Stock</label>
                  <input required name="stock" type="number" defaultValue={editingProduct?.stock} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner" placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Unit Type</label>
                  <input required name="unit" placeholder="e.g. bottles, kg" defaultValue={editingProduct?.unit} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">Category</label>
                  <select name="category" defaultValue={editingProduct?.category || 'Groceries'} className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl font-black outline-none focus:ring-4 focus:ring-sky-500/10 focus:bg-white focus:border-sky-500 transition-all cursor-pointer shadow-inner">
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-sky-600 text-white font-black rounded-2xl shadow-2xl shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95 mt-4">
                {editingProduct ? 'Commit Changes' : 'Add to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
