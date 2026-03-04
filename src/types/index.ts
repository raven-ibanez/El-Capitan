export interface Variation {
  id: string;
  name: string;
  price: number;
  trackInventory?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  popular?: boolean;
  available?: boolean;
  variations?: Variation[];
  addOns?: AddOn[];
  // Discount pricing fields
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  discountActive?: boolean;
  // Computed effective price (calculated in the app)
  effectivePrice?: number;
  isOnDiscount?: boolean;
  // Inventory fields
  trackInventory?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariation?: Variation;
  selectedAddOns?: AddOn[];
  totalPrice: number;
}

export interface OrderData {
  items: CartItem[];
  customerName: string;
  contactNumber: string;
  serviceType: 'pickup' | 'delivery';
  address?: string;
  pickupTime?: string;
  paymentMethod: 'gcash' | 'maya' | 'bank-transfer' | 'cash';
  referenceNumber?: string;
  total: number;
  notes?: string;
}

export type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer' | 'cash';
export type ServiceType = 'pickup' | 'delivery';

// Site Settings Types
export interface SiteSetting {
  id: string;
  value: string;
  type: 'text' | 'image' | 'boolean' | 'number';
  description?: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_description: string;
  currency: string;
  currency_code: string;
}

export interface InventoryLog {
  id: string;
  menu_item_id: string;
  variation_id?: string;
  change_amount: number;
  reason: string;
  created_at: string;
  menu_item_name?: string;
  variation_name?: string;
}