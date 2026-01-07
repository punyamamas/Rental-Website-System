import React, { useState } from 'react';
import { AppState, TransactionType, RentalStatus, Branch, Product } from '../types';
import { Search, Plus, Calendar as CalendarIcon, Package, CheckCircle, AlertCircle } from 'lucide-react';

interface RentalSystemProps {
  state: AppState;
  onNewRental: (data: any) => void;
}

export const RentalSystem: React.FC<RentalSystemProps> = ({ state, onNewRental }) => {
  const [view, setView] = useState<'inventory' | 'active'>('active');
  const [searchTerm, setSearchTerm] = useState('');

  // Active Rentals Logic
  const activeRentals = state.transactions
    .filter(t => t.branch === state.currentBranch && t.type === TransactionType.RENTAL)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Inventory Logic - check rent price for current branch > 0
  const inventory = state.products.filter(p => p.priceRentPerDay[state.currentBranch] > 0);

  const handleBook = (product: Product) => {
    // Simplified booking action
    const days = 3;
    const pricePerDay = product.priceRentPerDay[state.currentBranch];
    const total = pricePerDay * days;
    onNewRental({
        type: TransactionType.RENTAL,
        totalAmount: total,
        customerName: `Guest Customer ${Math.floor(Math.random() * 1000)}`,
        details: {
            items: [{ productId: product.id, quantity: 1, name: product.name }],
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
            status: RentalStatus.BOOKED
        }
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="text-blue-500" />
          Rental Management
        </h2>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setView('active')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'active' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Active Rentals
          </button>
          <button 
            onClick={() => setView('inventory')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Rental Inventory
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search by customer, item, or ID..." 
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {view === 'inventory' && (
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                    <Plus className="w-4 h-4" /> New Equipment
                </button>
            )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
            {view === 'active' ? (
                <div className="space-y-3">
                    {activeRentals.map((rental: any) => (
                        <div key={rental.id} className="bg-slate-700/50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-700 transition-colors border border-slate-600/50">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-white">{rental.customerName}</span>
                                    <span className="text-xs text-slate-400">ID: {rental.id.slice(0,8)}</span>
                                </div>
                                <div className="text-sm text-slate-300">
                                    {rental.details.items.map((i: any) => i.name).join(', ')}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Due: {new Date(rental.details.endDate).toLocaleDateString()} • {Math.ceil((new Date(rental.details.endDate).getTime() - Date.now()) / (1000 * 3600 * 24))} days left
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                    rental.details.status === RentalStatus.OVERDUE ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                                    rental.details.status === RentalStatus.ACTIVE ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                }`}>
                                    {rental.details.status}
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-400 font-mono font-medium">Rp {rental.totalAmount.toLocaleString()}</div>
                                    <button className="text-xs text-blue-400 hover:text-blue-300 underline mt-1">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activeRentals.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No active rentals found for this branch.
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {inventory.map(item => (
                        <div key={item.id} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex gap-4 hover:border-blue-500/50 transition-all group">
                             <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-10 h-10 text-slate-600 group-hover:text-blue-500 transition-colors" />
                             </div>
                             <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-white line-clamp-1">{item.name}</h4>
                                    <p className="text-sm text-slate-400">{item.category}</p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-slate-500">Rate / Day</p>
                                            <p className="text-emerald-400 font-mono">Rp {item.priceRentPerDay[state.currentBranch].toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Stock</p>
                                            <p className={`font-bold ${item.stock[state.currentBranch] < 5 ? 'text-red-400' : 'text-white'}`}>
                                                {item.stock[state.currentBranch]} units
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleBook(item)}
                                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                    >
                                        RENT NOW
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};