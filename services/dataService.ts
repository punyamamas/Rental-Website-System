import { supabase } from './supabaseClient';
import { BrandProfile, Product, Transaction, DefaultBranches, TransactionType, RentalStatus, LaundryStatus } from '../types';

// --- MOCK DATA FALLBACKS (Used if Supabase is not connected) ---
const MOCK_BRANDS: BrandProfile[] = [
  {
    id: DefaultBranches.JAKARTA_CENTRAL,
    name: "Fourteen Adventure Purwokerto",
    shortName: "Fourteen PWT",
    tagline: "Your Journey Starts in Purwokerto",
    theme: { primary: "emerald", secondary: "stone", bgGradient: "from-stone-900 via-emerald-950 to-stone-900", accent: "emerald-400" },
    logoIcon: "mountain",
    domains: ["jakarta", "pwt", "central"] 
  },
  {
    id: DefaultBranches.BANDUNG_NORTH,
    name: "Fourteen Adventure Purbalingga",
    shortName: "Fourteen PBG",
    tagline: "Explore Purbalingga's Heights",
    theme: { primary: "blue", secondary: "slate", bgGradient: "from-slate-900 via-blue-950 to-slate-900", accent: "blue-400" },
    logoIcon: "tent",
    domains: ["bandung", "pbg", "north"]
  },
  {
    id: DefaultBranches.BALI_SOUTH,
    name: "Mamas Outdoor",
    shortName: "Mamas Outdoor",
    tagline: "Premium Gear for Professionals",
    theme: { primary: "orange", secondary: "amber", bgGradient: "from-orange-950 via-red-950 to-stone-900", accent: "orange-400" },
    logoIcon: "compass",
    domains: ["bali", "mamas", "south"]
  }
];

const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', name: 'North Face Tent 4P', category: 'Tent', 
    priceSale: { [DefaultBranches.JAKARTA_CENTRAL]: 4500000, [DefaultBranches.BANDUNG_NORTH]: 4400000, [DefaultBranches.BALI_SOUTH]: 4800000 }, 
    priceRentPerDay: { [DefaultBranches.JAKARTA_CENTRAL]: 150000, [DefaultBranches.BANDUNG_NORTH]: 120000, [DefaultBranches.BALI_SOUTH]: 200000 }, 
    stock: { [DefaultBranches.JAKARTA_CENTRAL]: 10, [DefaultBranches.BANDUNG_NORTH]: 5, [DefaultBranches.BALI_SOUTH]: 8 } 
  },
  { 
    id: '2', name: 'Deuter Aircontact 65+10', category: 'Backpack', 
    priceSale: { [DefaultBranches.JAKARTA_CENTRAL]: 3200000, [DefaultBranches.BANDUNG_NORTH]: 3100000, [DefaultBranches.BALI_SOUTH]: 3500000 }, 
    priceRentPerDay: { [DefaultBranches.JAKARTA_CENTRAL]: 75000, [DefaultBranches.BANDUNG_NORTH]: 65000, [DefaultBranches.BALI_SOUTH]: 95000 }, 
    stock: { [DefaultBranches.JAKARTA_CENTRAL]: 15, [DefaultBranches.BANDUNG_NORTH]: 12, [DefaultBranches.BALI_SOUTH]: 20 } 
  },
  { 
    id: '3', name: 'Gas Canister 230g', category: 'Cooking', 
    priceSale: { [DefaultBranches.JAKARTA_CENTRAL]: 55000, [DefaultBranches.BANDUNG_NORTH]: 50000, [DefaultBranches.BALI_SOUTH]: 75000 }, 
    priceRentPerDay: { [DefaultBranches.JAKARTA_CENTRAL]: 0, [DefaultBranches.BANDUNG_NORTH]: 0, [DefaultBranches.BALI_SOUTH]: 0 }, 
    stock: { [DefaultBranches.JAKARTA_CENTRAL]: 100, [DefaultBranches.BANDUNG_NORTH]: 80, [DefaultBranches.BALI_SOUTH]: 150 } 
  },
  { 
    id: '4', name: 'Sleeping Bag Mummy', category: 'Accessories', 
    priceSale: { [DefaultBranches.JAKARTA_CENTRAL]: 850000, [DefaultBranches.BANDUNG_NORTH]: 800000, [DefaultBranches.BALI_SOUTH]: 950000 }, 
    priceRentPerDay: { [DefaultBranches.JAKARTA_CENTRAL]: 35000, [DefaultBranches.BANDUNG_NORTH]: 30000, [DefaultBranches.BALI_SOUTH]: 50000 }, 
    stock: { [DefaultBranches.JAKARTA_CENTRAL]: 20, [DefaultBranches.BANDUNG_NORTH]: 25, [DefaultBranches.BALI_SOUTH]: 10 } 
  },
];

const MOCK_TRANSACTIONS: any[] = [
  { id: 'tx-001', branch: DefaultBranches.JAKARTA_CENTRAL, date: new Date().toISOString(), type: TransactionType.SALE, totalAmount: 55000, customerName: 'Walk-in', details: {} },
  { id: 'tx-002', branch: DefaultBranches.JAKARTA_CENTRAL, date: new Date().toISOString(), type: TransactionType.RENTAL, totalAmount: 450000, customerName: 'John Doe', details: { items: [{name: 'Tent'}], status: RentalStatus.ACTIVE, endDate: new Date(Date.now() + 86400000 * 2).toISOString() } },
  { id: 'tx-003', branch: DefaultBranches.BANDUNG_NORTH, date: new Date().toISOString(), type: TransactionType.LAUNDRY, totalAmount: 75000, customerName: 'Jane Smith', details: { items: [{itemName: 'Down Jacket', quantity: 1, serviceType: 'Wash & Fold'}], status: LaundryStatus.WASHING, estimatedReady: new Date(Date.now() + 86400000).toISOString() } },
];

export const dataService = {
  
  async getBrands(): Promise<BrandProfile[]> {
    if (!supabase) return MOCK_BRANDS;
    
    try {
      const { data, error } = await supabase.from('brands').select('*');
      if (error) throw error;
      // Merge with Mock if DB is empty to give initial data
      if (!data || data.length === 0) return MOCK_BRANDS;
      return data.map((d: any) => ({
        ...d,
        // Ensure arrays and objects are parsed if Supabase returns them as strings (rare with JS client but safe)
        theme: typeof d.theme === 'string' ? JSON.parse(d.theme) : d.theme,
        domains: typeof d.domains === 'string' ? JSON.parse(d.domains) : d.domains
      }));
    } catch (e) {
      console.error("Supabase Error (Brands):", e);
      return MOCK_BRANDS;
    }
  },

  async saveBrand(brand: BrandProfile): Promise<boolean> {
    if (!supabase) return true; // Simulate success
    try {
      const { error } = await supabase.from('brands').upsert({
        id: brand.id,
        name: brand.name,
        short_name: brand.shortName,
        tagline: brand.tagline,
        theme: brand.theme,
        logo_icon: brand.logoIcon,
        domains: brand.domains
      });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase Save Error (Brand):", e);
      return false;
    }
  },

  async getProducts(): Promise<Product[]> {
    if (!supabase) return MOCK_PRODUCTS;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (!data || data.length === 0) return MOCK_PRODUCTS;
      
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        image: d.image,
        // Map snake_case database columns to camelCase Typescript interface
        priceSale: d.price_sale || {},
        priceRentPerDay: d.price_rent_per_day || {},
        stock: d.stock || {}
      }));
    } catch (e) {
      console.error("Supabase Error (Products):", e);
      return MOCK_PRODUCTS;
    }
  },

  async saveProduct(product: Product): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        price_sale: product.priceSale,
        price_rent_per_day: product.priceRentPerDay,
        stock: product.stock
      });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase Save Error (Product):", e);
      return false;
    }
  },

  async getTransactions(): Promise<Transaction[]> {
    if (!supabase) return MOCK_TRANSACTIONS;
    try {
      const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (error) throw error;
      if (!data) return MOCK_TRANSACTIONS;

      return data.map((d: any) => ({
        id: d.id,
        branch: d.branch,
        date: d.date,
        type: d.type as TransactionType,
        totalAmount: d.total_amount,
        customerName: d.customer_name,
        details: d.details
      }));
    } catch (e) {
      console.error("Supabase Error (Tx):", e);
      return MOCK_TRANSACTIONS;
    }
  },

  async createTransaction(tx: Transaction): Promise<boolean> {
    if (!supabase) return true;
    try {
      const { error } = await supabase.from('transactions').insert({
        id: tx.id,
        branch: tx.branch,
        date: tx.date,
        type: tx.type,
        total_amount: tx.totalAmount,
        customer_name: tx.customerName,
        details: tx.details
      });
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase Save Error (Tx):", e);
      return false;
    }
  },
  
  // Helper to update laundry/rental status details
  async updateTransactionStatus(txId: string, newDetails: any): Promise<boolean> {
    if (!supabase) return true;
    try {
        const { error } = await supabase
            .from('transactions')
            .update({ details: newDetails })
            .eq('id', txId);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Supabase Update Error:", e);
        return false;
    }
  }
};
