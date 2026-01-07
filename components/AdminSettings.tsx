import React, { useState, useEffect } from 'react';
import { Branch } from '../types';
import { Globe, Trash2, Plus, Copy, ExternalLink, Link as LinkIcon, Info } from 'lucide-react';

interface AdminSettingsProps {
  detectedHost: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ detectedHost }) => {
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [selectedBranch, setSelectedBranch] = useState<Branch>(Branch.JAKARTA_CENTRAL);
  const [aliasInput, setAliasInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem('domain_bindings');
    if (stored) {
        setBindings(JSON.parse(stored));
    }
  }, []);

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

    saveBindings({ ...bindings, [cleanAlias]: selectedBranch });
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

  return (
    <div className="space-y-6 max-w-5xl">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-xl border border-indigo-500/30 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <Globe className="text-indigo-400 w-8 h-8" /> 
                Virtual Store Addresses
            </h2>
            <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
                You don't need to buy a domain to run multiple branches! Assign a unique <strong>Alias</strong> for each branch below. 
                The system will generate a unique link that functions exactly like a separate website for that branch.
            </p>
        </div>
            
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Creator */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg sticky top-6">
                    <label className="text-xs text-slate-400 uppercase font-bold mb-4 block tracking-wider">Create New Store Address</label>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-500 mb-1 block">1. Choose Branch</label>
                            <select 
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value as Branch)}
                                className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            >
                                <option value={Branch.JAKARTA_CENTRAL}>Fourteen PWT (Central)</option>
                                <option value={Branch.BANDUNG_NORTH}>Fourteen PBG (North)</option>
                                <option value={Branch.BALI_SOUTH}>Mamas Outdoor (South)</option>
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
                            <p className="text-[10px] text-slate-500 mt-1">
                                Only use letters, numbers, and dashes.
                            </p>
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
                <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col min-h-[500px]">
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
                            Object.entries(bindings).map(([alias, branch]) => (
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
                                                <span className={`font-medium ${
                                                    branch === Branch.JAKARTA_CENTRAL ? 'text-emerald-400' : 
                                                    branch === Branch.BANDUNG_NORTH ? 'text-blue-400' : 'text-orange-400'
                                                }`}>
                                                    {branch === Branch.JAKARTA_CENTRAL ? 'Fourteen PWT' : 
                                                     branch === Branch.BANDUNG_NORTH ? 'Fourteen PBG' : 'Mamas Outdoor'}
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
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 text-xs">
            <Info className="w-5 h-5 flex-shrink-0 text-slate-500" />
            <div>
                <strong className="text-slate-300 block mb-1">How "Virtual Aliases" work:</strong>
                <p>
                    Since you are using the free method, these links use a special "query parameter" (<code>?domain=...</code>) to tell the system which branch to load. 
                    You can share these links directly on Instagram, WhatsApp, or Google Maps. Customers will see the correct branding and inventory immediately.
                </p>
            </div>
        </div>
    </div>
  );
};