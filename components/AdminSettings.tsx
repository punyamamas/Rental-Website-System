import React, { useState, useEffect } from 'react';
import { Branch } from '../types';
import { Globe, Save, Trash2, AlertTriangle, CheckCircle, Plus, ExternalLink, Server } from 'lucide-react';

interface AdminSettingsProps {
  detectedHost: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ detectedHost }) => {
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [selectedBranch, setSelectedBranch] = useState<Branch>(Branch.JAKARTA_CENTRAL);
  const [customDomain, setCustomDomain] = useState('');
  
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

  const handleBindCurrent = () => {
    saveBindings({ ...bindings, [detectedHost]: selectedBranch });
  };

  const handleBindCustom = () => {
    if (!customDomain.trim()) return;
    // Remove protocol if user pasted it
    let cleanDomain = customDomain.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
    saveBindings({ ...bindings, [cleanDomain]: selectedBranch });
    setCustomDomain('');
  };

  const handleUnbind = (host: string) => {
    const newBindings = { ...bindings };
    delete newBindings[host];
    saveBindings(newBindings);
  };

  return (
    <div className="space-y-6 max-w-5xl">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Server className="text-blue-500" /> Multi-Tenant Domain Configuration
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Actions */}
                <div className="space-y-6">
                    
                    {/* Card 1: Bind Current Host */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
                        <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Method 1: Bind Current Detected Host</label>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-600">
                                <span className="text-slate-400 text-xs">Detected:</span>
                                <span className="font-mono text-emerald-400 font-bold text-sm">{detectedHost}</span>
                            </div>
                            <div className="flex gap-2">
                                <select 
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value as Branch)}
                                    className="flex-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={Branch.JAKARTA_CENTRAL}>Fourteen PWT (Central)</option>
                                    <option value={Branch.BANDUNG_NORTH}>Fourteen PBG (North)</option>
                                    <option value={Branch.BALI_SOUTH}>Mamas Outdoor (South)</option>
                                </select>
                                <button 
                                    onClick={handleBindCurrent}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Bind Here
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Manual Entry */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
                        <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Method 2: Add Custom Domain Manually</label>
                        <div className="flex flex-col gap-3">
                            <input 
                                type="text"
                                placeholder="e.g. bali-shop.outdoor.com"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <div className="flex gap-2">
                                <select 
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value as Branch)}
                                    className="flex-1 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg p-2.5"
                                >
                                    <option value={Branch.JAKARTA_CENTRAL}>Fourteen PWT (Central)</option>
                                    <option value={Branch.BANDUNG_NORTH}>Fourteen PBG (North)</option>
                                    <option value={Branch.BALI_SOUTH}>Mamas Outdoor (South)</option>
                                </select>
                                <button 
                                    onClick={handleBindCustom}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: List */}
                <div className="bg-slate-900/30 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col h-full">
                    <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-white">Active Domain Bindings</h3>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{Object.keys(bindings).length} Active</span>
                    </div>
                    
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto min-h-[300px]">
                        {Object.entries(bindings).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 opacity-60">
                                <Globe className="w-12 h-12" />
                                <p className="text-sm">No custom domains configured yet.</p>
                            </div>
                        ) : (
                            Object.entries(bindings).map(([host, branch]) => (
                                <div key={host} className="group bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-blue-400" />
                                            <span className="text-white font-mono font-medium">{host}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleUnbind(host)}
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                            title="Delete Binding"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3 ml-6">
                                        <span>Mapped to:</span>
                                        <span className="text-emerald-400 font-medium">{
                                            branch === Branch.JAKARTA_CENTRAL ? 'Fourteen PWT' : 
                                            branch === Branch.BANDUNG_NORTH ? 'Fourteen PBG' : 'Mamas Outdoor'
                                        }</span>
                                    </div>

                                    <div className="ml-6 pt-2 border-t border-slate-700/50 flex gap-3">
                                        <a 
                                            href={`/?domain=${host}`} 
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Test / Simulate Link
                                        </a>
                                        {host === detectedHost && (
                                            <span className="text-xs flex items-center gap-1 text-emerald-500">
                                                <CheckCircle className="w-3 h-3" /> Current Host
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-start gap-3 p-4 bg-amber-900/10 border border-amber-900/30 rounded-lg text-slate-400 text-xs leading-relaxed">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
                <div>
                    <strong className="text-amber-500 block mb-1">How this works in Production:</strong>
                    <p className="mb-2">
                        In a real scenario, you would point your custom domain's <strong>CNAME record</strong> (e.g., in GoDaddy or Cloudflare) to this Vercel deployment URL.
                    </p>
                    <p>
                        Once the DNS propagates, when a user visits <code>store.mamas-bali.com</code>, the app detects the hostname and loads the configuration for "Mamas Outdoor" automatically based on the bindings above.
                        For this demo, the "Test Link" uses a query parameter to simulate this DNS behavior.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};