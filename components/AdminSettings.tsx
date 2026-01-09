import React, { useState, useEffect } from 'react';
import { Branch, BrandProfile } from '../types';
import { Globe, Trash2, Plus, Copy, ExternalLink, Link as LinkIcon, Info, Building, Store, Palette, Check } from 'lucide-react';

interface AdminSettingsProps {
  detectedHost: string;
  brands?: BrandProfile[];
  onCreateBrand?: (brand: BrandProfile) => void;
}

const TAILWIND_COLORS = [
    'slate', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 
    'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 
    'fuchsia', 'pink', 'rose'
];

export const AdminSettings: React.FC<AdminSettingsProps> = ({ detectedHost, brands = [], onCreateBrand }) => {
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [selectedBranchForLink, setSelectedBranchForLink] = useState<string>(brands[0]?.id || "");
  const [aliasInput, setAliasInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Branch State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandShort, setNewBrandShort] = useState('');
  const [newBrandColor, setNewBrandColor] = useState('emerald');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('domain_bindings');
    if (stored) {
        setBindings(JSON.parse(stored));
    }
    if (brands.length > 0 && !selectedBranchForLink) {
        setSelectedBranchForLink(brands[0].id);
    }
  }, [brands]);

  const saveBindings = (newBindings: Record<string, string>) => {
    setBindings(newBindings);
    localStorage.setItem('domain_bindings', JSON.stringify(newBindings));
  };

  const handleAddAlias = () => {
    if (!aliasInput.trim()) return;
    
    // Clean input: remove http, spaces, slashes
    let cleanAlias = aliasInput
        .toLowerCase()
        .replace(/(^\w+:|^)\/\//, '')
        .replace(/\//g, '')
        .replace(/\s+/g, '-');

    saveBindings({ ...bindings, [cleanAlias]: selectedBranchForLink });
    setAliasInput('');
  };

  const handleUnbind = (host: string) => {
    const newBindings = { ...bindings };
    delete newBindings[host];
    saveBindings(newBindings);
  };

  const getSimulationLink = (alias: string) => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/?domain=${alias}`;
  };

  const copyToClipboard = (alias: string) => {
    const link = getSimulationLink(alias);
    navigator.clipboard.writeText(link);
    setCopiedKey(alias);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateBrandSubmit = () => {
    if (!newBrandName || !newBrandShort) return;
    
    const id = newBrandShort.toLowerCase().replace(/\s/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    const newBrand: BrandProfile = {
        id: id,
        name: newBrandName,
        shortName: newBrandShort,
        tagline: "Your Adventure Starts Here",
        theme: {
            primary: newBrandColor,
            secondary: "slate",
            bgGradient: `from-slate-900 via-${newBrandColor}-950 to-slate-900`,
            accent: `${newBrandColor}-400`
        },
        logoIcon: "mountain",
        domains: []
    };
    
    if (onCreateBrand) {
        onCreateBrand(newBrand);
        setNewBrandName('');
        setNewBrandShort('');
        setNewBrandColor('emerald');
        alert('New branch created successfully! You can now generate links for it.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-10">
        
        {/* --- SECTION 1: BRANCH MANAGER --- */}
        <div className="space-y-6">
             <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-8 rounded-xl border border-emerald-500/30 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Store className="text-emerald-400 w-8 h-8" /> 
                    Branch Manager
                </h2>
                <p className="text-emerald-200 text-sm max-w-2xl leading-relaxed">
                    Scale your business without coding. Add new physical locations or brands here. 
                    They will immediately appear in the system and be available for link generation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Add New Branch</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Branch Full Name</label>
                            <input 
                                type="text"
                                placeholder="e.g. Fourteen Adventure Jogja"
                                value={newBrandName}
                                onChange={(e) => setNewBrandName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">Short Name (for Dashboard)</label>
                            <input 
                                type="text"
                                placeholder="e.g. Fourteen JOG"
                                value={newBrandShort}
                                onChange={(e) => setNewBrandShort(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                         
                         {/* ENHANCED COLOR PICKER */}
                         <div className="relative">
                            <label className="text-xs text-slate-500 mb-1 block">Brand Theme Color</label>
                            <button
                                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                                className="w-full flex items-center justify-between gap-3 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none hover:border-slate-500 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full bg-${newBrandColor}-500 shadow-sm ring-1 ring-white/10`} />
                                    <span className="capitalize text-white group-hover:text-emerald-400 transition-colors">{newBrandColor}</span>
                                </div>
                                <Palette className="w-4 h-4 text-slate-500" />
                            </button>

                            {isColorPickerOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsColorPickerOpen(false)}></div>
                                    <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-20 grid grid-cols-5 gap-2 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                                        {TAILWIND_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => {
                                                    setNewBrandColor(c);
                                                    setIsColorPickerOpen(false);
                                                }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${newBrandColor === c ? 'ring-2 ring-white scale-110' : 'ring-1 ring-white/10'} bg-${c}-500`}
                                                title={c}
                                            >
                                                {newBrandColor === c && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <button 
                            onClick={handleCreateBrandSubmit}
                            disabled={!newBrandName || !newBrandShort}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded-lg text-sm font-bold transition-all mt-2 shadow-lg shadow-emerald-900/20"
                        >
                            Create Branch
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4">Active Branches</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2">
                        {brands.map(brand => (
                            <div key={brand.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center gap-3 group hover:border-slate-600 transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white bg-${brand.theme.primary}-600 shadow-inner`}>
                                    {brand.shortName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{brand.shortName}</div>
                                    <div className="text-xs text-slate-500 truncate">{brand.name}</div>
                                </div>
                                <div className="ml-auto text-[10px] text-slate-600 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                    {brand.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <hr className="border-slate-800" />

        {/* --- SECTION 2: VIRTUAL LINKS --- */}

        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-xl border border-indigo-500/30 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Globe className="text-indigo-400 w-8 h-8" /> 
                    Virtual Store Addresses
                </h2>
                <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
                    Assign a unique <strong>Alias</strong> for each branch below. 
                    The system will generate a unique link that functions exactly like a separate website for that branch.
                </p>
            </div>
                
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Creator */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg sticky top-6">
                        <label className="text-xs text-slate-400 uppercase font-bold mb-4 block tracking-wider">Create Link Alias</label>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">1. Choose Branch</label>
                                <select 
                                    value={selectedBranchForLink}
                                    onChange={(e) => setSelectedBranchForLink(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.shortName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">2. Create Alias Name</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text"
                                        placeholder="e.g. bali-store"
                                        value={aliasInput}
                                        onChange={(e) => setAliasInput(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleAddAlias}
                                disabled={!aliasInput.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-900/20"
                            >
                                <Plus className="w-4 h-4" /> Generate Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-5 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                Active Store Links
                            </h3>
                            <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-medium border border-indigo-500/20">
                                {Object.keys(bindings).length} Active
                            </span>
                        </div>
                        
                        <div className="p-5 space-y-4 flex-1">
                            {Object.entries(bindings).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 opacity-50 min-h-[300px]">
                                    <Globe className="w-16 h-16" />
                                    <div className="text-center">
                                        <p className="text-lg font-medium">No links created yet</p>
                                        <p className="text-sm">Create an alias on the left to get started.</p>
                                    </div>
                                </div>
                            ) : (
                                Object.entries(bindings).map(([alias, branchId]) => {
                                    const linkedBrand = brands.find(b => b.id === branchId);
                                    return (
                                    <div key={alias} className="bg-slate-900 rounded-xl p-0 border border-slate-700 hover:border-indigo-500/50 transition-all shadow-sm group overflow-hidden">
                                        {/* Top part: Info */}
                                        <div className="p-4 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-bold text-lg tracking-tight">{alias}</span>
                                                    {alias === detectedHost && (
                                                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">CURRENT</span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-400 flex items-center gap-2">
                                                    <span>Map to:</span>
                                                    <span className={`font-medium text-${linkedBrand?.theme.primary || 'slate'}-400`}>
                                                        {linkedBrand?.shortName || branchId}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleUnbind(alias)}
                                                className="text-slate-600 hover:text-red-400 p-2 hover:bg-slate-800 rounded transition-colors"
                                                title="Delete Link"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Bottom part: Action Bar */}
                                        <div className="bg-black/20 p-3 flex items-center gap-3 border-t border-slate-800">
                                            <div className="flex-1 bg-slate-950 rounded border border-slate-800 px-3 py-2 text-xs font-mono text-slate-400 truncate select-all">
                                                {getSimulationLink(alias)}
                                            </div>
                                            
                                            <button 
                                                onClick={() => copyToClipboard(alias)}
                                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded border border-slate-700 transition-colors"
                                            >
                                                {copiedKey === alias ? <span className="text-emerald-400 font-bold">Copied!</span> : <><Copy className="w-3 h-3" /> Copy</>}
                                            </button>

                                            <a 
                                                href={getSimulationLink(alias)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded font-bold transition-colors shadow-lg shadow-indigo-900/20"
                                            >
                                                <ExternalLink className="w-3 h-3" /> Visit Store
                                            </a>
                                        </div>
                                    </div>
                                )})
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};