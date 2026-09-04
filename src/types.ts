/**
 * KITCHEN PRO - Complete Enterprise Types Definition
 */

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'inventory_staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "750W", "1000W", "5 Litres", "3 Jars"
  sku: string;
  barcode: string;
  price: number;
  mrp: number;
  costPrice: number;
  stock: number;
}

export interface ProductSpecification {
  group: string; // e.g. "General", "Technical Details", "Dimensions"
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  images: string[];
  mrp: number;
  price: number; // Selling price (Tax inclusive or calculated)
  costPrice: number;
  discountPercentage: number;
  gstRate: number; // e.g. 18 for 18%
  hsnCode: string; // e.g. "850940"
  stock: number;
  minStockLevel: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  weightKg?: number;
  dimensions?: string;
  warranty: string;
  returnPolicy: string;
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  specifications: ProductSpecification[];
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export type InventoryTransactionType =
  | 'purchase'
  | 'sale'
  | 'pos_sale'
  | 'return'
  | 'cancellation'
  | 'stock_adjustment'
  | 'damage'
  | 'manual_correction';

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number; // positive for addition, negative for deduction
  previousStock: number;
  newStock: number;
  type: InventoryTransactionType;
  referenceNumber: string; // Order ID, Bill ID, PO Number, or Adjustment ref
  notes: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  addressType?: 'home' | 'commercial' | 'store';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  companyName?: string;
  addresses: Address[];
  totalOrders: number;
  totalSpent: number;
  creditBalance: number; // Outstanding balance
  creditLimit?: number;
  createdAt: string;
  lastPurchaseDate?: string;
}

export interface CreditLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'debit' | 'credit'; // debit = increased debt (credit sale), credit = payment made
  amount: number;
  balanceAfter: number;
  referenceNumber: string;
  paymentMode?: string;
  notes: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partial';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  image: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  discount: number;
  gstRate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  type: 'online' | 'pos';
  customer: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    gstin?: string;
  };
  shippingAddress?: Address;
  deliveryMethod: 'home_delivery' | 'store_pickup';
  items: OrderItem[];
  subtotal: number;
  itemDiscountTotal: number;
  couponCode?: string;
  couponDiscount: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  shippingCharges: number;
  roundOff: number;
  grandTotal: number;
  paymentMethod: 'cod' | 'upi' | 'card' | 'net_banking' | 'credit' | 'split' | 'cash';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  isInterState: boolean;
  notes?: string;
  cashierName?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    notes?: string;
  }[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive';
}

export interface POSLineItem {
  productId: string;
  productName: string;
  sku: string;
  barcode: string;
  hsnCode: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  discountPercent: number;
  discountAmount: number;
  gstRate: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  lineTotal: number;
}

export interface HeldBill {
  id: string;
  referenceName: string;
  customer?: Customer;
  items: POSLineItem[];
  couponCode?: string;
  discountAmount?: number;
  timestamp: string;
}

export interface ReturnRecord {
  id: string;
  returnNumber: string;
  orderId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
    condition: 'resalable' | 'damaged' | 'defective';
    reason: string;
  }[];
  totalRefundAmount: number;
  refundMethod: 'cash' | 'upi' | 'credit_note' | 'original_payment';
  status: 'approved' | 'completed' | 'rejected';
  processedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  module: 'products' | 'inventory' | 'orders' | 'pos' | 'customers' | 'settings' | 'auth' | 'returns';
  recordId?: string;
  details: string;
  timestamp: string;
}

export interface StoreSettings {
  businessName: string;
  brandTagline: string;
  subTagline: string;
  gstin: string;
  phone: string;
  supportPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  stateCode: string; // e.g. "27" for Maharashtra, "29" for Karnataka, "36" for Telangana
  pincode: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  currency: string;
  currencySymbol: string;
  defaultGstRate: number;
  freeShippingThreshold: number;
  flatShippingFee: number;
  thermalPrinterType: '58mm' | '80mm' | 'A4';
  autoPrintReceipt: boolean;
  upiId: string;
  upiMerchantName: string;
}

export interface PosSalePayload {
  customer?: {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    gstin?: string;
  };
  items: {
    productId: string;
    productName: string;
    sku: string;
    image?: string;
    hsnCode: string;
    mrp: number;
    unitPrice: number;
    quantity: number;
    gstRate: number;
    discount?: number;
  }[];
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit' | 'split';
  amountTendered?: number;
  changeDue?: number;
  cartDiscountPercentage?: number;
  couponCode?: string;
  cashierName?: string;
  isInterState?: boolean;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalGstCollected: number;
  totalOrders: number;
  lowStockCount: number;
  posCount: number;
  onlineCount: number;
}

