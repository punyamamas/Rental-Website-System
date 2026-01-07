import React, { useState, useMemo } from 'react';
import { AppState, Product, TransactionType } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

interface SalesPOSProps {
  state: AppState;
  onNewSale: (data: any) => void;
}

export const SalesPOS: React.FC<SalesPOSProps> = ({ state, onNewSale }) => {
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [search, setSearch] = useState('');

  // Use branch specific pricing
  const products = useMemo(() => 
    state.products
        .filter(p => p.priceSale[state.currentBranch] > 0 && p.stock[state.currentBranch] > 0)
        .filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
  [state.products, state.currentBranch, search]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? {...i, qty: i.qty + 1} : i);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id === id) return { ...i, qty: Math.max(1, i.qty + delta) };
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.priceSale[state.currentBranch] * item.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onNewSale({
        type: TransactionType.SALE,
        totalAmount: total,
        customerName: "Walk-in Customer",
        details: {
            items: cart.map(c => ({
                productId: c.product.id,
                quantity: c.qty,
                priceAtSale: c.product.priceSale[state.currentBranch],
                name: c.product.name
            }))
        }
    });
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Product Grid */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2">Retail Products</h2>
            <input 
                type="text" 
                placeholder="Search products..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => (
                <button 
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg flex flex-col items-start transition-colors text-left group border border-transparent hover:border-emerald-500/50"
                >
                    <div className="w-full aspect-square bg-slate-800 rounded-md mb-3 flex items-center justify-center">
                        <span className="text-2xl">🛍️</span>
                    </div>
                    <div className="font-bold text-slate-200 group-hover:text-emerald-400">{p.name}</div>
                    <div className="text-xs text-slate-400 mb-2">{p.category}</div>
                    <div className="text-emerald-400 font-mono font-medium">Rp {p.priceSale[state.currentBranch].toLocaleString()}</div>
                    <div className="text-xs text-slate-500 mt-1">{p.stock[state.currentBranch]} in stock</div>
                </button>
            ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-slate-900 rounded-xl border border-slate-700 flex flex-col shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Current Order
            </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
                <div className="text-center text-slate-500 py-10">Cart is empty</div>
            ) : (
                cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <div className="flex-1">
                            <div className="text-white font-medium text-sm">{item.product.name}</div>
                            <div className="text-emerald-500 text-xs font-mono">Rp {item.product.priceSale[state.currentBranch].toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-900 rounded-lg p-1">
                                <button onClick={() => updateQty(item.product.id, -1)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                                <span className="w-6 text-center text-sm font-bold text-white">{item.qty}</span>
                                <button onClick={() => updateQty(item.product.id, 1)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.product.id)} className="text-slate-500 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-6 bg-slate-800 border-t border-slate-700 rounded-b-xl space-y-4">
            <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white text-xl font-bold">
                <span>Total</span>
                <span>Rp {total.toLocaleString()}</span>
            </div>
            <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all"
            >
                <CreditCard className="w-5 h-5" /> Process Payment
            </button>
        </div>
      </div>
    </div>
  );
};