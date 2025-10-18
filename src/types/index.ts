export interface Variation {
  id: string;
  name: string;
  price: number;
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
  serviceType: 'dine-in' | 'pickup' | 'delivery';
  address?: string;
  pickupTime?: string;
  // Dine-in specific fields
  partySize?: number;
  dineInTime?: string;
  paymentMethod: 'gcash' | 'maya' | 'bank-transfer';
  referenceNumber?: string;
  total: number;
  notes?: string;
}

export type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer';
export type ServiceType = 'dine-in' | 'pickup' | 'delivery';

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

// Tracking System Types
export interface TrackingRecord {
  id: string;
  tracking_number: string;
  customer_name: string;
  customer_phone: string;
  status: 'pending' | 'processing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  notes?: string;
  image_url?: string;
  extracted_data?: ExtractedData;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ExtractedData {
  tracking_number?: string;
  customer_name?: string;
  customer_phone?: string;
  address?: string;
  date?: string;
  raw_text?: string;
  [key: string]: any;
}

export interface TrackingQuery {
  customer_name: string;
  customer_phone: string;
}