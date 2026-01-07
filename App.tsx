import React, { useState, useEffect } from 'react';
import { Branch, AppState, TransactionType, RentalStatus, LaundryStatus, Product, BrandProfile } from './types';
import { Dashboard } from './components/Dashboard';
import { RentalSystem } from './components/RentalSystem';
import { SalesPOS } from './components/SalesPOS';
import { LaundryTracker } from './components/LaundryTracker';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { CustomerPortal } from './components/CustomerPortal';
import { BrandLanding } from './components/BrandLanding';
import { Layout, Menu, Map, Settings, LogOut, Sun, Globe, X, ArrowLeftRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// ---- BRAND CONFIGURATIONS (The Multi-Tenant Setup) ----
const BRAND_CONFIGS: BrandProfile[] = [
  {
    id: Branch.JAKARTA_CENTRAL,
    name: "Fourteen Adventure Purwokerto",
    shortName: "Fourteen PWT",
    tagline: "Your Journey Starts in Purwokerto",
    theme: {
      primary: "emerald",
      secondary: "stone",
      bgGradient: "from-stone-900 via-emerald-950 to-stone-900",
      accent: "emerald-400"
    },
    logoIcon: "mountain",
    domains: ["fourteen-pwt.vercel.app", "fourteen-pwt-app.vercel.app"] 
  },
  {
    id: Branch.BANDUNG_NORTH,
    name: "Fourteen Adventure Purbalingga",
    shortName: "Fourteen PBG",
    tagline: "Explore Purbalingga's Heights",
    theme: {
      primary: "blue",
      secondary: "slate",
      bgGradient: "from-slate-900 via-blue-950 to-slate-900",
      accent: "blue-400"
    },
    logoIcon: "tent",
    domains: ["fourteen-pbg.vercel.app", "fourteen-pbg-app.vercel.app"]
  },
  {
    id: Branch.BALI_SOUTH,
    name: "Mamas Outdoor",
    shortName: "Mamas Outdoor",
    tagline: "Premium Gear for Professionals",
    theme: {
      primary: "orange",
      secondary: "amber",
      bgGradient: "from-orange-950 via-red-950 to-stone-900",
      accent: "orange-400"
    },
    logoIcon: "compass",
    domains: ["mamas-bali.vercel.app", "mamasoutdoor.id"]
  }
];

// ---- MOCK DATA INITIALIZATION ----
// Prices varied: Jakarta (PWT), Bandung (PBG), Bali (Mamas)
const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'North Face Tent 4P', 
    category: 'Tent', 
    priceSale: { [Branch.JAKARTA_CENTRAL]: 4500000, [Branch.BANDUNG_NORTH]: 4400000, [Branch.BALI_SOUTH]: 4800000 }, 
    priceRentPerDay: { [Branch.JAKARTA_CENTRAL]: 150000, [Branch.BANDUNG_NORTH]: 120000, [Branch.BALI_SOUTH]: 200000 }, 
    stock: { [Branch.JAKARTA_CENTRAL]: 10, [Branch.BANDUNG_NORTH]: 5, [Branch.BALI_SOUTH]: 8 } 
  },
  { 
    id: '2', 
    name: 'Deuter Aircontact 65+10', 
    category: 'Backpack', 
    priceSale: { [Branch.JAKARTA_CENTRAL]: 3200000, [Branch.BANDUNG_NORTH]: 3100000, [Branch.BALI_SOUTH]: 3500000 }, 
    priceRentPerDay: { [Branch.JAKARTA_CENTRAL]: 75000, [Branch.BANDUNG_NORTH]: 65000, [Branch.BALI_SOUTH]: 95000 }, 
    stock: { [Branch.JAKARTA_CENTRAL]: 15, [Branch.BANDUNG_NORTH]: 12, [Branch.BALI_SOUTH]: 20 } 
  },
  { 
    id: '3', 
    name: 'Gas Canister 230g', 
    category: 'Cooking', 
    priceSale: { [Branch.JAKARTA_CENTRAL]: 55000, [Branch.BANDUNG_NORTH]: 50000, [Branch.BALI_SOUTH]: 75000 }, 
    priceRentPerDay: { [Branch.JAKARTA_CENTRAL]: 0, [Branch.BANDUNG_NORTH]: 0, [Branch.BALI_SOUTH]: 0 }, 
    stock: { [Branch.JAKARTA_CENTRAL]: 100, [Branch.BANDUNG_NORTH]: 80, [Branch.BALI_SOUTH]: 150 } 
  },
  { 
    id: '4', 
    name: 'Sleeping Bag Mummy', 
    category: 'Accessories', 
    priceSale: { [Branch.JAKARTA_CENTRAL]: 850000, [Branch.BANDUNG_NORTH]: 800000, [Branch.BALI_SOUTH]: 950000 }, 
    priceRentPerDay: { [Branch.JAKARTA_CENTRAL]: 35000, [Branch.BANDUNG_NORTH]: 30000, [Branch.BALI_SOUTH]: 50000 }, 
    stock: { [Branch.JAKARTA_CENTRAL]: 20, [Branch.BANDUNG_NORTH]: 25, [Branch.BALI_SOUTH]: 10 } 
  },
  { 
    id: '5', 
    name: 'Hiking Pole (Pair)', 
    category: 'Accessories', 
    priceSale: { [Branch.JAKARTA_CENTRAL]: 450000, [Branch.BANDUNG_NORTH]: 420000, [Branch.BALI_SOUTH]: 500000 }, 
    priceRentPerDay: { [Branch.JAKARTA_CENTRAL]: 25000, [Branch.BANDUNG_NORTH]: 20000, [Branch.BALI_SOUTH]: 35000 }, 
    stock: { [Branch.JAKARTA_CENTRAL]: 30, [Branch.BANDUNG_NORTH]: 30, [Branch.BALI_SOUTH]: 15 } 
  },
  { 
    id: '6', 
    name: 'Rain Cover Universal', 
    category: 'Accessories', 
    priceSale: { [Branch.JAKARTA_CENTRAL]: 120000, [Branch.BANDUNG_NORTH]: 110000, [Branch.BALI_SOUTH]: 150000 }, 
    priceRentPerDay: { [Branch.JAKARTA_CENTRAL]: 10000, [Branch.BANDUNG_NORTH]: 8000, [Branch.BALI_SOUTH]: 15000 }, 
    stock: { [Branch.JAKARTA_CENTRAL]: 50, [Branch.BANDUNG_NORTH]: 45, [Branch.BALI_SOUTH]: 60 } 
  },
];

const MOCK_TRANSACTIONS: any[] = [
  // Generate some dummy initial data
  { id: 'tx-001', branch: Branch.JAKARTA_CENTRAL, date: new Date().toISOString(), type: TransactionType.SALE, totalAmount: 55000, customerName: 'Walk-in', details: {} },
  { id: 'tx-002', branch: Branch.JAKARTA_CENTRAL, date: new Date().toISOString(), type: TransactionType.RENTAL, totalAmount: 450000, customerName: 'John Doe', details: { items: [{name: 'Tent'}], status: RentalStatus.ACTIVE, endDate: new Date(Date.now() + 86400000 * 2).toISOString() } },
  { id: 'tx-003', branch: Branch.BANDUNG_NORTH, date: new Date().toISOString(), type: TransactionType.LAUNDRY, totalAmount: 75000, customerName: 'Jane Smith', details: { items: [{itemName: 'Down Jacket', quantity: 1, serviceType: 'Wash & Fold'}], status: LaundryStatus.WASHING, estimatedReady: new Date(Date.now() + 86400000).toISOString() } },
];

// ---- MAIN APP ----

export default function App() {
  const [viewMode, setViewMode] = useState<'admin' | 'landing' | 'shop'>('landing');
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile>(BRAND_CONFIGS[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rentals' | 'sales' | 'laundry'>('dashboard');
  const [showAI, setShowAI] = useState(false);
  const [simulatedDomain, setSimulatedDomain] = useState<string | null>(null);
  const [detectedHost, setDetectedHost] = useState<string>('');

  // Global Store
  const [state, setState] = useState<AppState>({
    currentBranch: Branch.JAKARTA_CENTRAL,
    products: MOCK_PRODUCTS,
    transactions: MOCK_TRANSACTIONS,
  });

  // Domain Detection Logic & Persistence
  useEffect(() => {
    // 1. Get current hostname and normalize it (remove www.)
    let hostname = window.location.hostname;
    if (hostname.startsWith('www.')) {
        hostname = hostname.replace('www.', '');
    }
    setDetectedHost(hostname);
    
    // 2. Check for simulation query param (For this demo environment)
    const searchParams = new URLSearchParams(window.location.search);
    const domainParam = searchParams.get('domain');

    // Priority: Simulation Param > Real Hostname
    const targetDomain = domainParam || hostname;
    if (domainParam) setSimulatedDomain(domainParam);

    // 3. Find if this domain belongs to a specific brand
    const matchedBrand = BRAND_CONFIGS.find(b => b.domains.includes(targetDomain));

    if (matchedBrand) {
        // If matched via Domain, force it
        setSelectedBrand(matchedBrand);
        setViewMode('shop');
        // Save to storage to persist preference if they later visit a generic domain
        localStorage.setItem('selected_branch_id', matchedBrand.id);
    } else {
        // 4. If No Domain Match, check LocalStorage (Persistence)
        const savedBranchId = localStorage.getItem('selected_branch_id');
        const savedBrand = BRAND_CONFIGS.find(b => b.id === savedBranchId);

        if (savedBrand) {
             setSelectedBrand(savedBrand);
             setViewMode('shop');
        } else {
             // If no match and no saved pref, show landing
             setViewMode('landing');
        }
    }

  }, []);

  // Action Handlers
  const handleNewTransaction = (transaction: any) => {
    // Determine branch: use the one in transaction (from customer portal) or fallback to current admin branch
    const branchForTx = transaction.branch || state.currentBranch;

    const newTx = {
      ...transaction,
      id: `tx-${Date.now()}`,
      branch: branchForTx,
      date: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));
  };

  const handleUpdateLaundryStatus = (id: string, status: LaundryStatus) => {
    setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => {
            if (t.id === id && t.type === TransactionType.LAUNDRY) {
                return { ...t, details: { ...t.details, status } };
            }
            return t;
        })
    }));
  };

  const handleEnterShop = (brand: BrandProfile) => {
    setSelectedBrand(brand);
    setViewMode('shop');
    // Save preference
    localStorage.setItem('selected_branch_id', brand.id);
  };

  const handleSwitchBrand = () => {
    // Clear persistence and go back to landing
    localStorage.removeItem('selected_branch_id');
    if (simulatedDomain) clearSimulation();
    else setViewMode('landing');
  };

  const clearSimulation = () => {
    window.location.search = ''; // Reloads page clearing params
  };

  // ---- ROUTER VIEW SWITCHING ----

  if (viewMode === 'landing') {
    return (
        <>
            <BrandLanding 
                brands={BRAND_CONFIGS}
                onSelectBrand={handleEnterShop}
                onAdminLogin={() => setViewMode('admin')}
            />
            {/* Developer Helper: Show current domain so user knows what to put in config */}
            <div className="fixed bottom-2 right-2 text-[10px] text-slate-600 bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none">
                Detected: {detectedHost}
            </div>
        </>
    );
  }

  if (viewMode === 'shop') {
    return (
      <>
        {/* Simulation Banner - only shows if we are simulating */}
        {simulatedDomain && (
            <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black text-xs font-bold text-center py-1 z-[100] flex justify-center items-center gap-2">
                <span>⚠️ Simulating Visit from: {simulatedDomain}</span>
                <button onClick={clearSimulation} className="bg-black/20 hover:bg-black/30 p-0.5 rounded"><X className="w-3 h-3"/></button>
            </div>
        )}
        
        {/* Brand Switcher Overlay Button (For Demo/Testing convenience) */}
        {!simulatedDomain && (
            <button 
                onClick={handleSwitchBrand}
                className="fixed bottom-4 left-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition-all border border-white/10 shadow-lg group"
                title="Switch Branch"
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
            <NavItem active={activeTab === 'rentals'} onClick={() => setActiveTab('rentals')} icon={Map} label="Rentals & Bookings" />
            <NavItem active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} icon={Menu} label="Retail POS" />
            <NavItem active={activeTab === 'laundry'} onClick={() => setActiveTab('laundry')} icon={Sun} label="Laundry Service" />
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="mb-2">
                <label className="text-xs text-slate-500 uppercase font-semibold mb-2 block">Admin Console For</label>
                <select 
                    value={state.currentBranch}
                    onChange={(e) => setState(prev => ({ ...prev, currentBranch: e.target.value as Branch }))}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg p-2.5 focus:ring-emerald-500 focus:border-emerald-500 block"
                >
                    <option value={Branch.JAKARTA_CENTRAL}>Fourteen Adventure PWT</option>
                    <option value={Branch.BANDUNG_NORTH}>Fourteen Adventure PBG</option>
                    <option value={Branch.BALI_SOUTH}>Mamas Outdoor</option>
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
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
            <h1 className="text-xl font-semibold text-white">
                {activeTab === 'dashboard' && 'Executive Dashboard'}
                {activeTab === 'rentals' && 'Rental Operations'}
                {activeTab === 'sales' && 'Point of Sale'}
                {activeTab === 'laundry' && 'Service Center'}
            </h1>
            
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

        {/* Dynamic Content */}
        <div className="flex-1 p-8 overflow-hidden relative">
            <div className="h-full overflow-y-auto pr-2 pb-20">
                {activeTab === 'dashboard' && <Dashboard state={state} />}
                {activeTab === 'rentals' && <RentalSystem state={state} onNewRental={handleNewTransaction} />}
                {activeTab === 'sales' && <SalesPOS state={state} onNewSale={handleNewTransaction} />}
                {activeTab === 'laundry' && <LaundryTracker state={state} onUpdateStatus={handleUpdateLaundryStatus} />}
            </div>

            {/* AI Overlay Panel */}
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

// Nav Item Component
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