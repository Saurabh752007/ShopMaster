
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Basmati Rice (5kg)', price: 450.00, unit: 'bags', stock: 120, category: 'Groceries' },
  { id: '2', name: 'Dishwashing Liquid (1L)', price: 120.00, unit: 'bottles', stock: 35, category: 'Home Care' },
  { id: '3', name: 'Fresh Milk (500ml)', price: 30.00, unit: 'pouches', stock: 200, category: 'Dairy & Bakery' },
  { id: '4', name: 'Atta (10kg)', price: 380.00, unit: 'bags', stock: 42, category: 'Groceries' },
  { id: '5', name: 'Coconut Oil (1L)', price: 210.00, unit: 'bottles', stock: 55, category: 'Cooking Essentials' },
  { id: '6', name: 'Detergent Powder (2kg)', price: 195.00, unit: 'packs', stock: 70, category: 'Home Care' },
  { id: '7', name: 'Potato Chips (Large)', price: 50.00, unit: 'packs', stock: 150, category: 'Snacks' },
];

const INITIAL_CATEGORIES = [
  { name: 'Groceries', count: 25 },
  { name: 'Home Care', count: 18 },
  { name: 'Dairy & Bakery', count: 12 },
  { name: 'Cooking Essentials', count: 30 },
  { name: 'Snacks', count: 40 },
  { name: 'Beverages', count: 22 },
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
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      localStorage.setItem('sm_products', JSON.stringify(INITIAL_PRODUCTS));
      setProducts(INITIAL_PRODUCTS);
    }
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
    }
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
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
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("Barcode '890123456789' detected. Product: Basmati Rice found.");
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
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
           <h2 className="text-xl font-bold text-gray-800">Inventory Dashboard</h2>
           <div className="flex flex-wrap gap-2">
             <div className="relative">
               <select 
                 className="appearance-none px-4 pr-10 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer transition-all"
                 value={selectedCategory}
                 onChange={(e) => setSelectedCategory(e.target.value)}
               >
                 <option value="All">All Categories</option>
                 {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
               </select>
               <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
             </div>
             
             <button 
               onClick={() => setShowLowStockOnly(!showLowStockOnly)}
               className={`flex items-center gap-2 px-4 py-1.5 border rounded-lg text-sm font-medium transition-all ${showLowStockOnly ? 'bg-amber-500 border-amber-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
             >
               Low Stock {showLowStockOnly && '✓'}
             </button>
             
             <button 
               onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
               className="flex items-center gap-2 px-4 py-1.5 bg-sky-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-sky-100 hover:bg-sky-700 active:scale-95 transition-all"
             >
               + Add Product
             </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Price (INR)</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <tr key={p.id} className="text-sm hover:bg-gray-50 group">
                  <td className="px-6 py-4 font-semibold text-gray-800">{p.name}</td>
                  <td className="px-6 py-4 font-medium">₹{p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{p.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${p.stock < 10 ? 'text-red-600 animate-pulse' : p.stock < 50 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {p.stock === 0 ? 'Out of Stock' : p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                        className="p-1.5 text-gray-400 hover:text-sky-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No products found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Product Categories</h2>
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-sky-700 active:scale-95 transition-all"
          >
            + Add Category
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(c => (
            <div key={c.name} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-sky-200 transition-colors group">
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-sky-600 transition-colors">{c.name}</h3>
                <p className="text-xs text-gray-400 mt-1">Managed across inventory</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Barcode Scanner Footer */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-4 text-gray-600 font-medium">
            <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Scan Barcode for Quick Product Search
         </div>
         <button 
           onClick={handleScan}
           className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-800 flex items-center gap-2 bg-white hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
         >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            Scan Now
         </button>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Product Name</label>
                <input required name="name" defaultValue={editingProduct?.name} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input required name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock</label>
                  <input required name="stock" type="number" defaultValue={editingProduct?.stock} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</label>
                  <input required name="unit" placeholder="e.g. bottles" defaultValue={editingProduct?.unit} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select name="category" defaultValue={editingProduct?.category || 'Groceries'} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 transition-all">
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-4 bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-100 hover:bg-sky-700 transition-colors">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
