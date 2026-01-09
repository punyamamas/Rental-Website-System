import React, { useState, useEffect } from 'react';
import { Branch, AppState, TransactionType, RentalStatus, LaundryStatus, Product, BrandProfile, DefaultBranches } from './types';
import { Dashboard } from './components/Dashboard';
import { RentalSystem } from './components/RentalSystem';
import { SalesPOS } from './components/SalesPOS';
import { LaundryTracker } from './components/LaundryTracker';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { CustomerPortal } from './components/CustomerPortal';
import { BrandLanding } from './components/BrandLanding';
import { AdminSettings } from './components/AdminSettings';
import { InventoryMaster } from './components/InventoryMaster';
import { Layout, Menu, Map, Settings, LogOut, Sun, Globe, X, ArrowLeftRight, Archive, RefreshCw, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { dataService } from './services/dataService';
import { supabase } from './services/supabaseClient';

// Helper for Tailwind
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [viewMode, setViewMode] = useState<'admin' | 'landing' | 'shop'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'rentals' | 'sales' | 'laundry' | 'settings'>('dashboard');
  const [showAI, setShowAI] = useState(false);
  const [simulatedDomain, setSimulatedDomain] = useState<string | null>(null);
  const [detectedHost, setDetectedHost] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic Data Store
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile | null>(null);

  // Global Store
  const [state, setState] = useState<AppState>({
    currentBranch: DefaultBranches.JAKARTA_CENTRAL,
    products: [],
    transactions: [],
  });

  // ---- INITIAL DATA FETCHING ----
  const fetchData = async () => {
    setIsSyncing(true);
    try {
        const [fetchedBrands, fetchedProducts, fetchedTx] = await Promise.all([
            dataService.getBrands(),
            dataService.getProducts(),
            dataService.getTransactions()
        ]);

        setBrands(fetchedBrands);
        setState(prev => ({
            ...prev,
            products: fetchedProducts,
            transactions: fetchedTx
        }));
        
        // Default selected brand if not set
        if (!selectedBrand && fetchedBrands.length > 0) {
            setSelectedBrand(fetchedBrands[0]);
        }
    } catch (error) {
        console.error("Failed to fetch data", error);
    } finally {
        setIsLoading(false);
        setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---- DOMAIN & ROUTING LOGIC ----
  useEffect(() => {
    if (brands.length === 0) return;

    // 1. Get current hostname
    let hostname = window.location.hostname.replace('www.', '');
    setDetectedHost(hostname);
    
    // 2. Check for simulation query param
    const searchParams = new URLSearchParams(window.location.search);
    const domainParam = searchParams.get('domain');

    // Priority 1: Simulation Param
    if (domainParam) {
        setSimulatedDomain(domainParam);
        const matchedBrand = brands.find(b => b.domains.includes(domainParam));
        if (matchedBrand) {
            setSelectedBrand(matchedBrand);
            setViewMode('shop');
            return;
        }
        
        // Check local bindings
        const bindingsStr = localStorage.getItem('domain_bindings');
        if (bindingsStr) {
             const bindings = JSON.parse(bindingsStr);
             const boundBranchId = bindings[domainParam];
             if (boundBranchId) {
                const boundBrand = brands.find(b => b.id === boundBranchId);
                if (boundBrand) {
                    setSelectedBrand(boundBrand);
                    setViewMode('shop');
                    return;
                }
             }
        }
    }

    // Priority 2: LocalStorage Bindings
    const bindingsStr = localStorage.getItem('domain_bindings');
    if (bindingsStr) {
        const bindings = JSON.parse(bindingsStr);
        const boundBranchId = bindings[hostname];
        if (boundBranchId) {
             const boundBrand = brands.find(b => b.id === boundBranchId);
             if (boundBrand) {
                 setSelectedBrand(boundBrand);
                 setViewMode('shop');
                 localStorage.setItem('selected_branch_id', boundBranchId);
                 return;
             }
        }
    }

    // Priority 3: Hardcoded Domain Matches
    const matchedBrand = brands.find(b => b.domains.includes(hostname));
    if (matchedBrand) {
        setSelectedBrand(matchedBrand);
        setViewMode('shop');
        localStorage.setItem('selected_branch_id', matchedBrand.id);
        return;
    }

    // Priority 4: Persistence
    const savedBranchId = localStorage.getItem('selected_branch_id');
    const savedBrand = brands.find(b => b.id === savedBranchId);
    
    if (savedBrand) {
         setSelectedBrand(savedBrand);
         // Don't auto-switch viewMode here to allow Landing page to be default entrance
    }

  }, [brands]);

  // Action Handlers
  const handleNewTransaction = async (transaction: any) => {
    const branchForTx = transaction.branch || state.currentBranch;

    const newTx = {
      ...transaction,
      id: `tx-${Date.now()}`,
      branch: branchForTx,
      date: new Date().toISOString(),
    };
    
    // Optimistic UI Update
    setState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));

    // Async Save
    await dataService.createTransaction(newTx);
  };

  const handleUpdateLaundryStatus = async (id: string, status: LaundryStatus) => {
    // Optimistic UI Update
    let targetTx: any = null;
    setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => {
            if (t.id === id && t.type === TransactionType.LAUNDRY) {
                const updated = { ...t, details: { ...t.details, status } };
                targetTx = updated;
                return updated;
            }
            return t;
        })
    }));

    if (targetTx) {
        await dataService.updateTransactionStatus(id, targetTx.details);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    // Optimistic Update
    setState(prev => {
        const existingIndex = prev.products.findIndex(p => p.id === product.id);
        if (existingIndex >= 0) {
            const updatedProducts = [...prev.products];
            updatedProducts[existingIndex] = product;
            return { ...prev, products: updatedProducts };
        } else {
            return { ...prev, products: [...prev.products, product] };
        }
    });

    // Async Save
    await dataService.saveProduct(product);
  };

  const handleDeleteProduct = (productId: string) => {
    // Soft delete / Hide from branch logic
    // Implementation skipped for brevity, similar pattern
  };

  const handleEnterShop = (brand: BrandProfile) => {
    setSelectedBrand(brand);
    setViewMode('shop');
    localStorage.setItem('selected_branch_id', brand.id);
  };

  const handleSwitchBrand = () => {
    localStorage.removeItem('selected_branch_id');
    if (simulatedDomain) clearSimulation();
    else setViewMode('landing');
  };

  const clearSimulation = () => {
    window.location.href = window.location.pathname;
  };

  const handleCreateBrand = async (newBrand: BrandProfile) => {
    // Optimistic Update
    const updatedBrands = [...brands, newBrand];
    setBrands(updatedBrands);
    
    // Async Save to DB
    await dataService.saveBrand(newBrand);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white flex-col gap-4">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="text-slate-400">Syncing with SummitBase Cloud...</p>
          </div>
      );
  }

  // ---- ROUTER VIEW SWITCHING ----

  if (viewMode === 'landing') {
    return (
        <>
            <BrandLanding 
                brands={brands}
                onSelectBrand={handleEnterShop}
                onAdminLogin={() => setViewMode('admin')}
            />
            <div className="fixed bottom-2 right-2 flex items-center gap-2">
                 <div className="text-[10px] text-slate-600 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
                    Detected: {detectedHost}
                </div>
                {supabase ? (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">
                        <Database className="w-3 h-3" /> Online
                    </div>
                ) : (
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-950/30 px-2 py-1 rounded border border-amber-500/20">
                        <Database className="w-3 h-3" /> Local Mode
                    </div>
                )}
            </div>
        </>
    );
  }

  if (viewMode === 'shop' && selectedBrand) {
    return (
      <>
        {!simulatedDomain && (
            <button 
                onClick={handleSwitchBrand}
                className="fixed bottom-4 left-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-all border border-white/10 shadow-lg group"
                title="Switch Branch / Exit Store"
            >
                <ArrowLeftRight className="w-5 h-5 opacity-50 group-hover:opacity-100" />
            </button>
        )}

        <CustomerPortal 
            state={state} 
            brand={selectedBrand}
            onNewBooking={handleNewTransaction} 
            onBackToLanding={handleSwitchBrand}
            onSwitchToAdmin={() => setViewMode('admin')} 
            showBackButton={!simulatedDomain}
        />
      </>
    );
  }

  // ---- ADMIN DASHBOARD VIEW ----

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">S</div>
            <div>
                <span className="font-bold text-lg tracking-tight text-white block leading-none">SummitBase</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Enterprise</span>
            </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
            <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={Layout} label="Overview" />
            <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Archive} label="Master Data (Sewa)" />
            <NavItem active={activeTab === 'rentals'} onClick={() => setActiveTab('rentals')} icon={Map} label="Rentals & Bookings" />
            <NavItem active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={Menu} label="Retail POS" />
            <NavItem active={activeTab === 'laundry'} onClick={() => setActiveTab('laundry')} icon={Sun} label="Laundry Service" />
            <div className="pt-4 mt-4 border-t border-slate-800">
                <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="System Settings" />
            </div>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="mb-2">
                <label className="text-xs text-slate-500 uppercase font-semibold mb-2 block">Admin Console For</label>
                <select 
                    value={state.currentBranch}
                    onChange={(e) => setState(prev => ({ ...prev, currentBranch: e.target.value as Branch }))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 block"
                >
                    {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.shortName}</option>
                    ))}
                </select>
            </div>
            
            <button 
                onClick={handleSwitchBrand}
                className="flex items-center gap-3 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 w-full px-3 py-2 rounded-lg transition-colors text-sm border border-transparent hover:border-indigo-500/20"
            >
                <Globe className="w-4 h-4" /> View Online Stores
            </button>
            
            <button className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full px-3 py-2 rounded-lg transition-colors text-sm">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-white">
                    {activeTab === 'dashboard' && 'Executive Dashboard'}
                    {activeTab === 'inventory' && 'Inventory Master Data'}
                    {activeTab === 'rentals' && 'Rental Operations'}
                    {activeTab === 'sales' && 'Point of Sale'}
                    {activeTab === 'laundry' && 'Service Center'}
                    {activeTab === 'settings' && 'System Configuration'}
                </h1>
                {isSyncing && <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />}
            </div>
            
            <button 
                onClick={() => setShowAI(!showAI)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showAI ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50'}`}
            >
                <span className="text-sm font-medium">AI Insights</span>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
            </button>
        </header>

        <div className="flex-1 p-8 overflow-hidden relative">
            <div className="h-full overflow-y-auto pr-2 pb-20">
                {activeTab === 'dashboard' && <Dashboard state={state} />}
                {activeTab === 'inventory' && <InventoryMaster state={state} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} />}
                {activeTab === 'rentals' && <RentalSystem state={state} onNewRental={handleNewTransaction} />}
                {activeTab === 'sales' && <SalesPOS state={state} onNewSale={handleNewTransaction} />}
                {activeTab === 'laundry' && <LaundryTracker state={state} onUpdateStatus={handleUpdateLaundryStatus} />}
                {activeTab === 'settings' && <AdminSettings detectedHost={detectedHost} brands={brands} onCreateBrand={handleCreateBrand} />}
            </div>

            {showAI && (
                <div className="absolute top-4 right-4 w-96 z-50 animate-in slide-in-from-right fade-in duration-300">
                    <GeminiAdvisor state={state} />
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button 
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1",
            active 
                ? "bg-slate-800 text-emerald-400 font-medium shadow-lg shadow-black/20" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        )}
    >
        <Icon className={cn("w-5 h-5", active ? "text-emerald-500" : "text-slate-500")} />
        {label}
    </button>
);