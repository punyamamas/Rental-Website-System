import React, { useState } from 'react';
import { AppState, Product, Branch } from '../types';
import { Package, Plus, Edit, Save, X, Search, Archive } from 'lucide-react';

interface InventoryMasterProps {
  state: AppState;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const InventoryMaster: React.FC<InventoryMasterProps> = ({ state, onSaveProduct, onDeleteProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const currentBranchId = state.currentBranch;

  // Filter products: Show all products, but we will highlight those active in this branch
  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (product: Product) => {
    setEditingProduct({
      ...product,
      // Ensure we have entries for the current branch, defaulting to 0 if not present
      stock: { ...product.stock, [currentBranchId]: product.stock[currentBranchId] || 0 },
      priceRentPerDay: { ...product.priceRentPerDay, [currentBranchId]: product.priceRentPerDay[currentBranchId] || 0 },
      priceSale: { ...product.priceSale, [currentBranchId]: product.priceSale[currentBranchId] || 0 }
    });
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct({
      id: '',
      name: '',
      category: 'Tent',
      stock: { [currentBranchId]: 0 },
      priceRentPerDay: { [currentBranchId]: 0 },
      priceSale: { [currentBranchId]: 0 },
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingProduct || !editingProduct.name) return;

    // Construct the final product object
    // We preserve existing data for other branches if it's an edit
    const finalProduct: any = {
      ...editingProduct,
      id: editingProduct.id || `prod-${Date.now()}`,
    };

    onSaveProduct(finalProduct as Product);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Archive className="text-emerald-500" />
            Master Data Barang Sewa
            </h2>
            <p className="text-sm text-slate-400">Managing Inventory for: <span className="text-emerald-400 font-bold">{currentBranchId}</span></p>
        </div>
        <button 
          onClick={handleAddNewClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-emerald-900/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search equipment name..." 
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="p-4 font-bold tracking-wider">Item Name</th>
                <th className="p-4 font-bold tracking-wider">Category</th>
                <th className="p-4 font-bold tracking-wider text-right">Stock (This Branch)</th>
                <th className="p-4 font-bold tracking-wider text-right">Rental Price (This Branch)</th>
                <th className="p-4 font-bold tracking-wider text-center">Status</th>
                <th className="p-4 font-bold tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredProducts.map(product => {
                const stock = product.stock[currentBranchId] || 0;
                const price = product.priceRentPerDay[currentBranchId] || 0;
                const isActive = stock > 0 || price > 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-700/50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-white">{product.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{product.id}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 border border-slate-600">
                        {product.category}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-mono font-bold ${stock < 5 ? 'text-red-400' : 'text-slate-300'}`}>
                      {stock}
                    </td>
                    <td className="p-4 text-right font-mono text-emerald-400">
                      Rp {price.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                         {isActive ? (
                             <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Active</span>
                         ) : (
                             <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-500/10 px-2 py-1 rounded border border-slate-500/20">Inactive</span>
                         )}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                  <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                          No items found. Click "Add New Item" to create one.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-xl font-bold text-white">
                {editingProduct.id ? 'Edit Inventory' : 'Add New Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Global Fields */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name (Global)</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. North Face Tent"
                />
                 <p className="text-[10px] text-slate-500 mt-1">Changing the name updates it for all branches.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                <select 
                   value={editingProduct.category}
                   onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})}
                   className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                    <option value="Tent">Tent</option>
                    <option value="Backpack">Backpack</option>
                    <option value="Cooking">Cooking</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Clothing">Clothing</option>
                </select>
              </div>

              <div className="py-2 border-t border-slate-700 my-2">
                 <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Configuration for: {currentBranchId}
                 </h4>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stock Qty</label>
                        <input 
                        type="number" 
                        value={editingProduct.stock?.[currentBranchId]}
                        onChange={e => setEditingProduct({
                            ...editingProduct, 
                            stock: { ...editingProduct.stock, [currentBranchId]: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rent Price / Day</label>
                        <input 
                        type="number" 
                        value={editingProduct.priceRentPerDay?.[currentBranchId]}
                        onChange={e => setEditingProduct({
                            ...editingProduct, 
                            priceRentPerDay: { ...editingProduct.priceRentPerDay, [currentBranchId]: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-emerald-400"
                        />
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};