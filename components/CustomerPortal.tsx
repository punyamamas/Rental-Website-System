import React, { useState } from 'react';
import { AppState, Product, RentalStatus, TransactionType, BrandProfile } from '../types';
import { MapPin, Calendar, User, Search, ArrowLeft, ArrowRight, Instagram, Facebook, Phone } from 'lucide-react';

interface CustomerPortalProps {
  state: AppState;
  brand: BrandProfile; // Now receives a specific brand configuration
  onNewBooking: (transaction: any) => void;
  onBackToLanding: () => void;
  onSwitchToAdmin?: () => void;
  showBackButton?: boolean;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ state, brand, onNewBooking, onBackToLanding, onSwitchToAdmin, showBackButton = true }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [bookingItem, setBookingItem] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [duration, setDuration] = useState(3);

  // Filter products based on the specific brand's branch ID
  const products = state.products.filter(p => {
    const hasStock = p.stock[brand.id] > 0;
    const isRentable = p.priceRentPerDay[brand.id] > 0;
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return hasStock && isRentable && matchCategory;
  });

  const handleBook = () => {
    if (!bookingItem || !customerName) return;

    const pricePerDay = bookingItem.priceRentPerDay[brand.id];
    const total = pricePerDay * duration;
    
    onNewBooking({
      branch: brand.id, // Forces transaction to this brand's branch
      type: TransactionType.RENTAL,
      totalAmount: total,
      customerName: customerName,
      details: {
        items: [{ productId: bookingItem.id, quantity: 1, name: bookingItem.name }],
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
        status: RentalStatus.BOOKED
      }
    });

    setBookingItem(null);
    setCustomerName('');
    alert(`Thank you for booking with ${brand.name}! Your gear will be ready for pickup.`);
  };

  // Dynamic Theme Classes based on brand profile
  const themeText = `text-${brand.theme.primary}-400`;
  const themeBg = `bg-${brand.theme.primary}-600`;
  const themeBgHover = `hover:bg-${brand.theme.primary}-500`;
  const themeBorder = `border-${brand.theme.primary}-500`;

  return (
    <div className={`min-h-screen font-sans text-slate-200 bg-slate-950`}>
      
      {/* Top Bar / Navbar - Unique per brand */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-3">
                    {showBackButton && (
                        <button onClick={onBackToLanding} className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2 group">
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </button>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${themeBg}`}>
                        {brand.shortName.substring(0, 1)}
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-white tracking-tight leading-none">{brand.name}</h1>
                        <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">{brand.tagline}</span>
                    </div>
                </div>
                
                <div className="hidden md:flex items-center gap-6">
                    <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Gear</a>
                    <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Packages</a>
                    <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Guide</a>
                    <button className={`px-5 py-2 rounded-full text-sm font-bold text-white ${themeBg} ${themeBgHover} transition-all shadow-lg shadow-${brand.theme.primary}-900/20`}>
                        My Booking
                    </button>
                </div>
            </div>
        </div>
      </nav>

      {/* Hero Section - Unique Background per brand */}
      <div className={`relative overflow-hidden`}>
         <div className={`absolute inset-0 bg-gradient-to-br ${brand.theme.bgGradient} opacity-20`}></div>
         {/* Decorative Circle */}
         <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-${brand.theme.primary}-500 blur-[150px] opacity-20 pointer-events-none`}></div>

        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur text-xs font-medium ${themeText} mb-6`}>
                    <MapPin className="w-3 h-3" /> Location: {brand.name}
                </div>
                <h2 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
                    Start Your <br/>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400`}>Journey Here.</span>
                </h2>
                <p className="text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-light">
                    Premium outdoor equipment rentals. 
                    Best quality gear for hikers and campers in {brand.shortName}.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder={`Search ${brand.shortName} inventory...`}
                            className="w-full bg-white/10 border border-white/10 backdrop-blur rounded-2xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:outline-none transition-all placeholder-slate-400"
                            style={{ '--tw-ring-color': `var(--color-${brand.theme.primary}-500)` } as any}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-slate-900/50">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
                <h3 className="text-3xl font-bold text-white mb-2">Available Equipment</h3>
                <p className="text-slate-400">Real-time stock at {brand.name}</p>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'Tent', 'Backpack', 'Accessories', 'Cooking'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                            selectedCategory === cat 
                            ? `${themeBg} text-white border-transparent shadow-lg` 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {products.length === 0 ? (
            <div className="text-center py-32 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500 text-lg">Sorry, no items currently available in this category at {brand.shortName}.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="group bg-slate-900 rounded-3xl p-4 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50">
                        <div className="aspect-square bg-slate-800 rounded-2xl mb-4 flex items-center justify-center text-6xl relative overflow-hidden">
                             <div className={`absolute inset-0 bg-gradient-to-br ${brand.theme.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                            <span className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                                {product.category === 'Tent' ? '⛺' : product.category === 'Backpack' ? '🎒' : product.category === 'Cooking' ? '🍳' : '🔦'}
                            </span>
                            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur px-2 py-1 rounded-lg text-xs font-mono text-white border border-white/10">
                                {product.stock[brand.id]} left
                            </div>
                        </div>
                        
                        <div className="px-2">
                            <h4 className="font-bold text-white text-lg mb-1 truncate">{product.name}</h4>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-4">{product.category}</p>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate-400 block">Daily Rate</span>
                                    <span className={`text-lg font-bold ${themeText}`}>Rp {product.priceRentPerDay[brand.id].toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => setBookingItem(product)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${themeBg} ${themeBgHover} transition-transform hover:scale-105 shadow-lg`}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Brand Specific Footer */}
      <footer className="bg-black py-16 border-t border-slate-900">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${themeBg}`}>S</div>
                    <span className="font-bold text-xl text-white tracking-tight">{brand.name}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                    Part of the SummitBase network. Providing top-tier outdoor equipment for adventurers since 2015. 
                    Visit us at our local store for expert advice.
                </p>
            </div>
            <div>
                <h5 className="font-bold text-white mb-6">Contact</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                    <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> +62 812-3456-7890</li>
                    <li className="flex items-center gap-3"><Instagram className="w-4 h-4" /> @{brand.shortName.toLowerCase().replace(/\s/g, '')}</li>
                    <li className="flex items-center gap-3"><Facebook className="w-4 h-4" /> {brand.name}</li>
                </ul>
            </div>
            <div>
                <h5 className="font-bold text-white mb-6">Legal</h5>
                <ul className="space-y-4 text-sm text-slate-500">
                    <li><a href="#" className="hover:text-white transition-colors">Terms of Rental</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Damage Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-900 text-center text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} {brand.name}. Powered by SummitBase ERP.
         </div>
      </footer>

      {/* Booking Modal (Themed) */}
      {bookingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-3xl max-w-md w-full border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className={`p-8 pb-6 ${themeBg}`}>
                    <h2 className="text-2xl font-bold text-white">Complete Booking</h2>
                    <p className="text-white/80 text-sm mt-1">You are booking at {brand.shortName}</p>
                </div>
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                             {bookingItem.category === 'Tent' ? '⛺' : '🎒'}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{bookingItem.name}</h3>
                            <p className="text-xs text-slate-400">Rate: Rp {bookingItem.priceRentPerDay[brand.id].toLocaleString()}/day</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                                <input 
                                    type="text"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 outline-none transition-all"
                                    style={{ '--tw-ring-color': `var(--color-${brand.theme.primary}-500)` } as any}
                                    placeholder="Enter your name"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Days)</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                                <input 
                                    type="number"
                                    min="1"
                                    max="30"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white focus:ring-2 outline-none transition-all"
                                    style={{ '--tw-ring-color': `var(--color-${brand.theme.primary}-500)` } as any}
                                    value={duration}
                                    onChange={e => setDuration(parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center py-4 border-t border-slate-800 mt-2">
                            <span className="text-slate-400">Total Price</span>
                            <span className={`text-2xl font-bold ${themeText}`}>Rp {(bookingItem.priceRentPerDay[brand.id] * duration).toLocaleString()}</span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={() => setBookingItem(null)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleBook}
                                disabled={!customerName}
                                className={`flex-1 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all shadow-lg ${themeBg} ${themeBgHover}`}
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};