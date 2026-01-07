export enum Branch {
  JAKARTA_CENTRAL = "JKT-Central",
  BANDUNG_NORTH = "BDG-North",
  BALI_SOUTH = "BALI-South"
}

export enum TransactionType {
  RENTAL = "RENTAL",
  SALE = "SALE",
  LAUNDRY = "LAUNDRY"
}

export enum RentalStatus {
  BOOKED = "Booked",
  ACTIVE = "Active (Out)",
  RETURNED = "Returned",
  OVERDUE = "Overdue"
}

export enum LaundryStatus {
  RECEIVED = "Received",
  WASHING = "Washing",
  DRYING = "Drying",
  READY = "Ready",
  DELIVERED = "Delivered"
}

// New Interface for distinct branding per branch
export interface BrandProfile {
  id: Branch;
  name: string;      // e.g., "Fourteen Adventure Purwokerto"
  shortName: string; // e.g., "Fourteen PWT"
  tagline: string;
  theme: {
    primary: string; // Tailwind color class e.g., "emerald"
    secondary: string;
    bgGradient: string;
    accent: string;
  };
  logoIcon: "mountain" | "tent" | "compass";
  domains: string[]; // List of domains that map to this brand
}

export interface Product {
  id: string;
  name: string;
  category: "Tent" | "Backpack" | "Clothing" | "Accessories" | "Cooking";
  // Prices are now branch-specific
  priceSale: Record<Branch, number>;
  priceRentPerDay: Record<Branch, number>; 
  stock: Record<Branch, number>;
  image?: string;
}

export interface Transaction {
  id: string;
  branch: Branch;
  date: string;
  type: TransactionType;
  totalAmount: number;
  customerName: string;
  details: any; // Flexible based on type
}

export interface RentalTransaction extends Transaction {
  type: TransactionType.RENTAL;
  details: {
    items: { productId: string; quantity: number; name: string }[];
    startDate: string;
    endDate: string;
    status: RentalStatus;
  };
}

export interface LaundryOrder extends Transaction {
  type: TransactionType.LAUNDRY;
  details: {
    items: { itemName: string; quantity: number; serviceType: "Wash & Fold" | "Dry Clean" | "Waterproof Treatment" }[];
    status: LaundryStatus;
    estimatedReady: string;
  };
}

export interface SaleTransaction extends Transaction {
  type: TransactionType.SALE;
  details: {
    items: { productId: string; quantity: number; priceAtSale: number; name: string }[];
  };
}

// Global Store State Interface
export interface AppState {
  currentBranch: Branch;
  products: Product[];
  transactions: Transaction[];
}