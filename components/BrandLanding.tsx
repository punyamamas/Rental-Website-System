import React from 'react';
import { BrandProfile } from '../types';
import { Mountain, Tent, Compass, ArrowRight, LogIn, ExternalLink } from 'lucide-react';

interface BrandLandingProps {
  brands: BrandProfile[];
  onSelectBrand: (brand: BrandProfile) => void;
  onAdminLogin: () => void;
}

export const BrandLanding: React.FC<BrandLandingProps> = ({ brands, onSelectBrand, onAdminLogin }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'mountain': return <Mountain className="w-12 h-12" />;
      case 'tent': return <Tent className="w-12 h-12" />;
      case 'compass': return <Compass className="w-12 h-12" />;
      default: return <Mountain className="w-12 h-12" />;
    }
  };

  const simulateDomain = (domain: string) => {
    // Reloads page with a query param to trick App.tsx into thinking we are on that domain
    window.location.href = `?domain=${domain}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl w-full">
        <div className="flex justify-between items-center mb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Outdoor Network</h1>
                <p className="text-slate-400">Select an online store to visit</p>
            </div>
            <button 
                onClick={onAdminLogin}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-full transition-all bg-black/40 backdrop-blur"
            >
                <LogIn className="w-4 h-4" /> HQ Admin Login
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <div key={brand.id} className="flex flex-col gap-2">
                <button
                  onClick={() => onSelectBrand(brand)}
                  className={`group relative h-96 rounded-3xl overflow-hidden border border-slate-800 transition-all duration-500 hover:scale-105 hover:shadow-2xl text-left w-full`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${brand.theme.bgGradient} opacity-10 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="absolute inset-0 bg-slate-900/80 group-hover:bg-slate-900/40 transition-colors duration-500"></div>
                  
                  <div className="relative h-full p-8 flex flex-col justify-between z-10">
                    <div>
                        <div className={`w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white mb-6 shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                            {getIcon(brand.logoIcon)}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{brand.name}</h2>
                        <p className="text-sm text-slate-300 opacity-80">{brand.tagline}</p>
                    </div>

                    <div className="flex items-center gap-2 text-white font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        Enter Shop <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
                
                {/* Simulation Links */}
                <div className="px-2">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Simulate Domain Deployment:</p>
                    {brand.domains.map(domain => (
                        <button 
                            key={domain}
                            onClick={() => simulateDomain(domain)}
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline mb-1 w-full text-left"
                        >
                            <ExternalLink className="w-3 h-3" /> {domain}
                        </button>
                    ))}
                </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Central Outdoor Network System. One Platform, Multiple Brands.
        </div>
      </div>
    </div>
  );
};