import React, { useState, useEffect } from 'react';
import { Branch } from '../types';
import { Globe, Save, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminSettingsProps {
  detectedHost: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ detectedHost }) => {
  const [bindings, setBindings] = useState<Record<string, string>>({});
  const [selectedBranch, setSelectedBranch] = useState<Branch>(Branch.JAKARTA_CENTRAL);
  
  useEffect(() => {
    const stored = localStorage.getItem('domain_bindings');
    if (stored) {
        setBindings(JSON.parse(stored));
    }
  }, []);

  const handleBind = () => {
    const newBindings = { ...bindings, [detectedHost]: selectedBranch };
    setBindings(newBindings);
    localStorage.setItem('domain_bindings', JSON.stringify(newBindings));
  };

  const handleUnbind = (host: string) => {
    const newBindings = { ...bindings };
    delete newBindings[host];
    setBindings(newBindings);
    localStorage.setItem('domain_bindings', JSON.stringify(newBindings));
  };

  return (
    <div className="space-y-6 max-w-4xl">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="text-blue-500" /> Domain Binding Configuration
            </h2>
            <p className="text-slate-400 text-sm mb-6">
                Map your current deployment URL to a specific branch. This allows you to use generic Vercel domains 
                (e.g., <code>project-name.vercel.app</code>) as a specific branch storefront without complex DNS setups.
            </p>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Current Hostname Detected</div>
                    <div className="text-lg font-mono text-emerald-400 font-bold">{detectedHost}</div>
                </div>
                
                <div className="flex items-center gap-3">
                    <select 
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value as Branch)}
                        className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        <option value={Branch.JAKARTA_CENTRAL}>Fourteen PWT</option>
                        <option value={Branch.BANDUNG_NORTH}>Fourteen PBG</option>
                        <option value={Branch.BALI_SOUTH}>Mamas Outdoor</option>
                    </select>
                    
                    <button 
                        onClick={handleBind}
                        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Bind Host
                    </button>
                </div>
            </div>

            {bindings[detectedHost] && (
                <div className="flex items-center gap-3 p-4 mb-6 text-sm text-emerald-400 border border-emerald-800 rounded-lg bg-emerald-900/20">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        Current host <strong>{detectedHost}</strong> is actively bound to <strong>{bindings[detectedHost]}</strong>.
                        Visitors will see the shop for this branch by default.
                    </div>
                </div>
            )}

            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Active Bindings</h3>
            
            <div className="space-y-3">
                {Object.entries(bindings).length === 0 ? (
                    <div className="text-slate-500 text-sm italic">No custom domain bindings active.</div>
                ) : (
                    Object.entries(bindings).map(([host, branch]) => (
                        <div key={host} className="flex justify-between items-center bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-3">
                                <Globe className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-300 font-mono">{host}</span>
                                <span className="text-slate-500">→</span>
                                <span className="text-white font-medium">{branch}</span>
                            </div>
                            <button 
                                onClick={() => handleUnbind(host)}
                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Remove Binding"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-8 flex items-start gap-3 p-4 bg-amber-900/20 border border-amber-900/50 rounded-lg text-amber-200/80 text-xs">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                <p>
                    <strong>Note:</strong> These bindings are stored in the browser (LocalStorage). 
                    They simulate DNS routing for demo purposes. In a production environment, you would 
                    configure this routing at the DNS/Vercel level.
                </p>
            </div>
        </div>
    </div>
  );
};
