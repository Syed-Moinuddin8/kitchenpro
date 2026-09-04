import {
  Product,
  Order,
  Customer,
  InventoryTransaction,
  AuditLog,
  StoreSettings,
  Coupon,
  Category,
  Brand,
} from '../types';
import {
  initialProducts,
  initialCategories,
  initialBrands,
  initialCustomers,
  initialOrders,
  initialCoupons,
  initialTransactions,
  initialAuditLogs,
  initialStoreSettings,
} from '../data/seedData';
import { calculateBilling } from './billingEngine';

const STORAGE_KEYS = {
  PRODUCTS: 'kitchen_pro_products_v2',
  CATEGORIES: 'kitchen_pro_categories_v2',
  BRANDS: 'kitchen_pro_brands_v2',
  ORDERS: 'kitchen_pro_orders_v2',
  CUSTOMERS: 'kitchen_pro_customers_v2',
  COUPONS: 'kitchen_pro_coupons_v2',
  SETTINGS: 'kitchen_pro_settings_v2',
  TRANSACTIONS: 'kitchen_pro_transactions_v2',
  AUDIT_LOGS: 'kitchen_pro_audit_logs_v2',
  HELD_BILLS: 'kitchen_pro_held_bills_v2',
  SEEDED: 'kitchen_pro_is_seeded_v2',
};

// Safe JSON parser helper
function parseLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && (!Array.isArray(parsed) || parsed.length === 0)) {
      return fallback;
    }
    return parsed || fallback;
  } catch (err) {
    console.warn(`[LocalStore] Failed to parse key ${key}`, err);
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[LocalStore] Failed to save key ${key}`, err);
  }
}

/**
 * Initialize localStorage with default seed data if missing or empty
 */
export function initLocalStore(): void {
  try {
    const isSeeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
    const existingProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);

    if (!isSeeded || !existingProds || existingProds === '[]' || existingProds === 'null') {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(initialBrands));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(initialCoupons));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialStoreSettings));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    }
  } catch (e) {
    console.error('[LocalStore] Failed initialization:', e);
  }
}

// Pre-initialize on module load
if (typeof window !== 'undefined') {
  initLocalStore();
}

/**
 * Helper to attempt network fetch and safely parse JSON.
 * Returns null if network fails, route is 404, or non-JSON is returned (e.g. Vercel SPA rewrite returning HTML).
 */
async function safeFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const apiClient = {
  // Synchronous immediate local getters for zero-delay hydration
  getLocalProducts(): Product[] {
    initLocalStore();
    return parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  },

  getLocalCategories(): Category[] {
    initLocalStore();
    return parseLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  getLocalBrands(): Brand[] {
    initLocalStore();
    return parseLocal<Brand[]>(STORAGE_KEYS.BRANDS, initialBrands);
  },

  getLocalOrders(): Order[] {
    initLocalStore();
    return parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
  },

  getLocalCustomers(): Customer[] {
    initLocalStore();
    return parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  },

  getLocalCoupons(): Coupon[] {
    initLocalStore();
    return parseLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
  },

  getLocalSettings(): StoreSettings {
    initLocalStore();
    return parseLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, initialStoreSettings);
  },

  /**
   * Reset all data to factory demo data
   */
  resetToFactoryDefaults(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(initialBrands));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(initialCoupons));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialStoreSettings));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
      localStorage.removeItem(STORAGE_KEYS.HELD_BILLS);
      localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
    } catch (e) {
      console.error('Failed to reset factory defaults:', e);
    }
  },

  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(params?: Record<string, string>): Promise<Product[]> {
    const query = new URLSearchParams(params).toString();
    const serverData = await safeFetch<any>(`/api/products${query ? `?${query}` : ''}`);
    if (serverData) {
      const prods = Array.isArray(serverData) ? serverData : (serverData.products || []);
      if (prods.length > 0) {
        saveLocal(STORAGE_KEYS.PRODUCTS, prods);
        return prods;
      }
    }

    // Fallback to local store
    let local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    if (params?.category && params.category !== 'all') {
      local = local.filter((p) => p.categoryId === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      local = local.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    return local;
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    const serverData = await safeFetch<Product>(`/api/products/${idOrSlug}`);
    if (serverData) return serverData;

    const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const found = local.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!found) throw new Error('Product not found');
    return found;
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const serverData = await safeFetch<Product>('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (serverData) {
      const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      saveLocal(STORAGE_KEYS.PRODUCTS, [serverData, ...local]);
      return serverData;
    }

    // Local Fallback
    const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: data.name || 'New Equipment Item',
      slug: (data.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: data.sku || `KP-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: data.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      brand: data.brand || 'Kitchen Pro Commercial',
      categoryId: data.categoryId || 'cat-appliances',
      categoryName: data.categoryName || 'Commercial Appliances',
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
      ],
      mrp: data.mrp || 1999,
      price: data.price || 1499,
      costPrice: data.costPrice || 999,
      discountPercentage: data.mrp && data.price ? Math.round(((data.mrp - data.price) / data.mrp) * 100) : 25,
      gstRate: data.gstRate || 18,
      hsnCode: data.hsnCode || '850940',
      stock: data.stock !== undefined ? data.stock : 10,
      minStockLevel: data.minStockLevel || 3,
      isLowStock: false,
      isOutOfStock: false,
      warranty: data.warranty || '1 Year Onsite Commercial Warranty',
      returnPolicy: data.returnPolicy || '7 Days B2B Replacement Only',
      status: 'published',
      rating: 4.8,
      reviewCount: 1,
      specifications: data.specifications || [],
      features: data.features || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newProd, ...local];
    saveLocal(STORAGE_KEYS.PRODUCTS, updatedList);
    return newProd;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const serverData = await safeFetch<Product>(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (serverData) {
      const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      saveLocal(
        STORAGE_KEYS.PRODUCTS,
        local.map((p) => (p.id === id ? serverData : p))
      );
      return serverData;
    }

    const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const index = local.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updated = {
      ...local[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    local[index] = updated;
    saveLocal(STORAGE_KEYS.PRODUCTS, local);
    return updated;
  },

  async updateStock(productId: string, newStock: number): Promise<Product> {
    const serverData = await safeFetch<{ product: Product }>('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantityChange: 0,
        newStockDirect: newStock,
        type: 'manual_correction',
        notes: 'Admin manual stock adjustment',
      }),
    });
    if (serverData?.product) {
      const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
      saveLocal(
        STORAGE_KEYS.PRODUCTS,
        local.map((p) => (p.id === productId ? serverData.product : p))
      );
      return serverData.product;
    }

    const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const p = local.find((item) => item.id === productId);
    if (!p) throw new Error('Product not found');

    const prev = p.stock;
    p.stock = Math.max(0, newStock);
    p.isLowStock = p.stock > 0 && p.stock <= p.minStockLevel;
    p.isOutOfStock = p.stock === 0;
    p.updatedAt = new Date().toISOString();

    saveLocal(STORAGE_KEYS.PRODUCTS, local);

    // Save transaction
    const transactions = parseLocal<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    transactions.unshift({
      id: `tx-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      quantity: p.stock - prev,
      previousStock: prev,
      newStock: p.stock,
      type: 'manual_correction',
      referenceNumber: `ADJ-${Date.now().toString().slice(-5)}`,
      notes: 'Admin manual stock update',
      userId: 'usr-admin',
      userName: 'Administrator',
      createdAt: new Date().toISOString(),
    });
    saveLocal(STORAGE_KEYS.TRANSACTIONS, transactions);

    return p;
  },

  async deleteProduct(id: string): Promise<void> {
    await safeFetch(`/api/products/${id}`, { method: 'DELETE' });
    const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    saveLocal(
      STORAGE_KEYS.PRODUCTS,
      local.filter((p) => p.id !== id)
    );
  },

  // ==========================================
  // INVENTORY
  // ==========================================
  async getInventory(): Promise<{ inventory: Product[]; totalItems: number; lowStockCount: number; outOfStockCount: number }> {
    const serverData = await safeFetch<any>('/api/inventory');
    if (serverData) return serverData;

    const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    return {
      inventory: local,
      totalItems: local.length,
      lowStockCount: local.filter((p) => p.stock > 0 && p.stock <= p.minStockLevel).length,
      outOfStockCount: local.filter((p) => p.stock === 0).length,
    };
  },

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    const serverData = await safeFetch<InventoryTransaction[]>('/api/inventory/transactions');
    if (serverData) return serverData;
    return parseLocal<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  },

  async adjustStock(payload: {
    productId: string;
    quantityChange: number;
    type: string;
    referenceNumber?: string;
    notes?: string;
    userName?: string;
  }): Promise<{ success: boolean; product: Product; transaction: InventoryTransaction }> {
    const serverData = await safeFetch<any>('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (serverData) return serverData;

    const local = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const p = local.find((i) => i.id === payload.productId);
    if (!p) throw new Error('Product not found');

    const prev = p.stock;
    p.stock = Math.max(0, p.stock + payload.quantityChange);
    p.isLowStock = p.stock > 0 && p.stock <= p.minStockLevel;
    p.isOutOfStock = p.stock === 0;
    p.updatedAt = new Date().toISOString();
    saveLocal(STORAGE_KEYS.PRODUCTS, local);

    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      quantity: payload.quantityChange,
      previousStock: prev,
      newStock: p.stock,
      type: (payload.type as any) || 'stock_adjustment',
      referenceNumber: payload.referenceNumber || `ADJ-${Date.now().toString().slice(-5)}`,
      notes: payload.notes || 'Inventory adjustment',
      userId: 'usr-current',
      userName: payload.userName || 'System Operator',
      createdAt: new Date().toISOString(),
    };

    const transactions = parseLocal<InventoryTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    transactions.unshift(tx);
    saveLocal(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { success: true, product: p, transaction: tx };
  },

  // ==========================================
  // POS & HELD BILLS
  // ==========================================
  async createPosSale(payload: any): Promise<Order> {
    const serverData = await safeFetch<any>('/api/pos/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (serverData?.order) {
      const localOrders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
      saveLocal(STORAGE_KEYS.ORDERS, [serverData.order, ...localOrders]);
      return serverData.order;
    }

    // Local execution
    const settings = parseLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, initialStoreSettings);
    const products = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const customers = parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);

    const calc = calculateBilling(
      payload.items.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        hsnCode: i.hsnCode || '850940',
        mrp: i.mrp || i.unitPrice,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        discountPercent: i.discountPercent || 0,
        gstRate: i.gstRate || 18,
      })),
      {
        isInterState: false,
        couponDiscount: payload.discountAmount || 0,
        shippingCharges: 0,
        pricesIncludeGst: true,
      }
    );

    const invoiceNum = `${settings.invoicePrefix}${settings.nextInvoiceNumber++}`;
    saveLocal(STORAGE_KEYS.SETTINGS, settings);

    // Stock deduction
    for (const it of calc.items) {
      const p = products.find((prod) => prod.id === it.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - it.quantity);
        p.updatedAt = new Date().toISOString();
      }
    }
    saveLocal(STORAGE_KEYS.PRODUCTS, products);

    // Customer
    let cust = customers.find((c) => c.phone === payload.customer?.phone);
    if (!cust && payload.customer?.name) {
      cust = {
        id: `cust-${Date.now()}`,
        name: payload.customer.name,
        phone: payload.customer.phone || '9800000000',
        gstin: payload.customer.gstin,
        addresses: [],
        totalOrders: 1,
        totalSpent: calc.grandTotal,
        creditBalance: 0,
        createdAt: new Date().toISOString(),
      };
      customers.push(cust);
      saveLocal(STORAGE_KEYS.CUSTOMERS, customers);
    }

    const newOrder: Order = {
      id: `ord-pos-${Date.now()}`,
      orderNumber: `POS-${Date.now().toString().slice(-6)}`,
      invoiceNumber: invoiceNum,
      type: 'pos',
      customer: {
        id: cust?.id || 'walk-in',
        name: payload.customer?.name || 'Walk-in Retail Guest',
        phone: payload.customer?.phone || 'N/A',
        gstin: payload.customer?.gstin,
      },
      deliveryMethod: 'store_pickup',
      items: calc.items.map((it) => ({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=300&q=80',
        hsnCode: it.hsnCode,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        mrp: it.mrp,
        discount: it.itemDiscount,
        gstRate: it.gstRate,
        taxableAmount: it.taxableAmount,
        cgst: it.cgstAmount,
        sgst: it.sgstAmount,
        igst: it.igstAmount,
        total: it.lineTotal,
      })),
      subtotal: calc.subtotal,
      itemDiscountTotal: calc.itemDiscountTotal,
      couponDiscount: calc.couponDiscountTotal,
      taxableAmount: calc.taxableSubtotal,
      cgstTotal: calc.cgstTotal,
      sgstTotal: calc.sgstTotal,
      igstTotal: calc.igstTotal,
      shippingCharges: 0,
      roundOff: calc.roundOff,
      grandTotal: calc.grandTotal,
      paymentMethod: payload.paymentMethod || 'cash',
      paymentStatus: 'completed',
      orderStatus: 'delivered',
      isInterState: false,
      cashierName: 'Front Desk POS',
      statusHistory: [
        {
          status: 'delivered',
          timestamp: new Date().toISOString(),
          notes: 'POS store counter sale completed',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    orders.unshift(newOrder);
    saveLocal(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  async getHeldBills(): Promise<any[]> {
    const serverData = await safeFetch<any[]>('/api/pos/held-bills');
    if (serverData) return serverData;
    return parseLocal<any[]>(STORAGE_KEYS.HELD_BILLS, []);
  },

  async saveHeldBill(bill: any): Promise<void> {
    await safeFetch('/api/pos/held-bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill),
    });
    const bills = parseLocal<any[]>(STORAGE_KEYS.HELD_BILLS, []);
    bills.unshift({ ...bill, id: bill.id || `hb-${Date.now()}`, savedAt: new Date().toISOString() });
    saveLocal(STORAGE_KEYS.HELD_BILLS, bills);
  },

  async deleteHeldBill(id: string): Promise<void> {
    await safeFetch(`/api/pos/held-bills/${id}`, { method: 'DELETE' });
    const bills = parseLocal<any[]>(STORAGE_KEYS.HELD_BILLS, []);
    saveLocal(
      STORAGE_KEYS.HELD_BILLS,
      bills.filter((b) => b.id !== id)
    );
  },

  // ==========================================
  // ONLINE ORDERS
  // ==========================================
  async createOrder(payload: any): Promise<Order> {
    const serverData = await safeFetch<any>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (serverData?.order) {
      const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
      saveLocal(STORAGE_KEYS.ORDERS, [serverData.order, ...orders]);
      return serverData.order;
    }

    const settings = parseLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, initialStoreSettings);
    const products = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const customers = parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);

    const subtotalRaw = payload.items.reduce((sum: number, it: any) => sum + it.unitPrice * it.quantity, 0);
    const shippingCharges =
      payload.deliveryMethod === 'store_pickup'
        ? 0
        : subtotalRaw >= settings.freeShippingThreshold
        ? 0
        : settings.flatShippingFee;

    const calc = calculateBilling(
      payload.items.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        hsnCode: i.hsnCode || '850940',
        mrp: i.mrp || i.unitPrice,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        discountPercent: i.discountPercent || 0,
        gstRate: i.gstRate || 18,
      })),
      {
        isInterState: !!payload.isInterState,
        couponDiscount: payload.couponDiscount || 0,
        shippingCharges,
        pricesIncludeGst: true,
      }
    );

    const invoiceNum = `${settings.invoicePrefix}${settings.nextInvoiceNumber++}`;
    const orderNum = `KP-ORD-${Date.now().toString().slice(-6)}`;
    saveLocal(STORAGE_KEYS.SETTINGS, settings);

    // Stock deduction
    for (const it of calc.items) {
      const p = products.find((prod) => prod.id === it.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - it.quantity);
        p.updatedAt = new Date().toISOString();
      }
    }
    saveLocal(STORAGE_KEYS.PRODUCTS, products);

    // Customer
    let cust = customers.find((c) => c.phone === payload.customer?.phone);
    if (!cust) {
      cust = {
        id: `cust-${Date.now()}`,
        name: payload.customer.name,
        phone: payload.customer.phone,
        email: payload.customer.email,
        gstin: payload.customer.gstin,
        addresses: payload.shippingAddress ? [payload.shippingAddress] : [],
        totalOrders: 1,
        totalSpent: calc.grandTotal,
        creditBalance: 0,
        createdAt: new Date().toISOString(),
      };
      customers.push(cust);
      saveLocal(STORAGE_KEYS.CUSTOMERS, customers);
    } else {
      cust.totalOrders += 1;
      cust.totalSpent += calc.grandTotal;
      saveLocal(STORAGE_KEYS.CUSTOMERS, customers);
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      type: 'online',
      customer: {
        id: cust.id,
        name: payload.customer.name,
        phone: payload.customer.phone,
        email: payload.customer.email,
        gstin: payload.customer.gstin,
      },
      shippingAddress: payload.shippingAddress,
      deliveryMethod: payload.deliveryMethod || 'home_delivery',
      items: calc.items.map((it) => ({
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        image: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=300&q=80',
        hsnCode: it.hsnCode,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        mrp: it.mrp,
        discount: it.itemDiscount,
        gstRate: it.gstRate,
        taxableAmount: it.taxableAmount,
        cgst: it.cgstAmount,
        sgst: it.sgstAmount,
        igst: it.igstAmount,
        total: it.lineTotal,
      })),
      subtotal: calc.subtotal,
      itemDiscountTotal: calc.itemDiscountTotal,
      couponCode: payload.couponCode || undefined,
      couponDiscount: calc.couponDiscountTotal,
      taxableAmount: calc.taxableSubtotal,
      cgstTotal: calc.cgstTotal,
      sgstTotal: calc.sgstTotal,
      igstTotal: calc.igstTotal,
      shippingCharges: calc.shippingCharges,
      roundOff: calc.roundOff,
      grandTotal: calc.grandTotal,
      paymentMethod: payload.paymentMethod || 'upi',
      paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'confirmed',
      isInterState: !!payload.isInterState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'new',
          timestamp: new Date().toISOString(),
          notes: 'Customer placed online order',
        },
        {
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          notes: 'Order confirmed and inventory locked',
        },
      ],
    };

    const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    orders.unshift(newOrder);
    saveLocal(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  async createOnlineOrder(payload: any): Promise<{ success: boolean; order: Order }> {
    const order = await this.createOrder(payload);
    return { success: true, order };
  },

  async getOrders(params?: Record<string, string>): Promise<Order[]> {
    const query = new URLSearchParams(params).toString();
    const serverData = await safeFetch<Order[]>(`/api/orders${query ? `?${query}` : ''}`);
    if (serverData && Array.isArray(serverData)) {
      saveLocal(STORAGE_KEYS.ORDERS, serverData);
      return serverData;
    }
    return parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
  },

  async getOrder(idOrNum: string): Promise<Order> {
    const serverData = await safeFetch<Order>(`/api/orders/${idOrNum}`);
    if (serverData) return serverData;

    const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const found = orders.find((o) => o.id === idOrNum || o.orderNumber === idOrNum || o.invoiceNumber === idOrNum);
    if (!found) throw new Error('Order not found');
    return found;
  },

  async updateOrderStatus(id: string, status: Order['orderStatus'], notes?: string): Promise<Order> {
    const serverData = await safeFetch<any>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (serverData?.order) {
      const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
      saveLocal(
        STORAGE_KEYS.ORDERS,
        orders.map((o) => (o.id === id ? serverData.order : o))
      );
      return serverData.order;
    }

    const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const ord = orders.find((o) => o.id === id);
    if (!ord) throw new Error('Order not found');

    ord.orderStatus = status;
    ord.updatedAt = new Date().toISOString();
    ord.statusHistory = ord.statusHistory || [];
    ord.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      notes: notes || `Order status updated to ${status}`,
    });

    saveLocal(STORAGE_KEYS.ORDERS, orders);
    return ord;
  },

  async processReturn(payload: any): Promise<{ success: boolean; refundAmount: number; returnNumber: string }> {
    const serverData = await safeFetch<any>('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (serverData) return serverData;

    const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const ord = orders.find((o) => o.id === payload.orderId);
    if (ord) {
      ord.orderStatus = 'returned';
      ord.updatedAt = new Date().toISOString();
      saveLocal(STORAGE_KEYS.ORDERS, orders);
    }

    return {
      success: true,
      refundAmount: ord ? ord.grandTotal : 0,
      returnNumber: `RET-${Date.now().toString().slice(-6)}`,
    };
  },

  // ==========================================
  // CUSTOMERS
  // ==========================================
  async getCustomers(): Promise<Customer[]> {
    const serverData = await safeFetch<Customer[]>('/api/customers');
    if (serverData && Array.isArray(serverData)) {
      saveLocal(STORAGE_KEYS.CUSTOMERS, serverData);
      return serverData;
    }
    return parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const serverData = await safeFetch<Customer>('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (serverData) {
      const customers = parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
      saveLocal(STORAGE_KEYS.CUSTOMERS, [serverData, ...customers]);
      return serverData;
    }

    const customers = parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name || 'New Client',
      phone: data.phone || '9800000000',
      email: data.email,
      gstin: data.gstin,
      companyName: data.companyName,
      addresses: data.addresses || [],
      totalOrders: 0,
      totalSpent: 0,
      creditBalance: 0,
      createdAt: new Date().toISOString(),
    };
    customers.push(newCust);
    saveLocal(STORAGE_KEYS.CUSTOMERS, customers);
    return newCust;
  },

  async recordCreditPayment(customerId: string, amount: number, paymentMode: string, notes?: string): Promise<{ success: boolean; customer: Customer }> {
    const serverData = await safeFetch<any>(`/api/customers/${customerId}/credit-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, paymentMode, notes }),
    });
    if (serverData?.customer) return serverData;

    const customers = parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) throw new Error('Customer not found');

    cust.creditBalance = Math.max(0, cust.creditBalance - amount);
    saveLocal(STORAGE_KEYS.CUSTOMERS, customers);
    return { success: true, customer: cust };
  },

  // ==========================================
  // COUPONS
  // ==========================================
  async getCoupons(): Promise<Coupon[]> {
    const serverData = await safeFetch<Coupon[]>('/api/coupons');
    if (serverData && Array.isArray(serverData)) {
      saveLocal(STORAGE_KEYS.COUPONS, serverData);
      return serverData;
    }
    return parseLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
  },

  async validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; coupon?: Coupon; discountAmount?: number; message: string }> {
    const serverData = await safeFetch<any>('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal }),
    });
    if (serverData) return serverData;

    const coupons = parseLocal<Coupon[]>(STORAGE_KEYS.COUPONS, initialCoupons);
    const c = coupons.find((cp) => cp.code.toUpperCase() === code.toUpperCase() && cp.status === 'active');
    if (!c) {
      return { valid: false, message: 'Invalid or expired promo coupon code' };
    }
    if (c.minOrderValue && cartTotal < c.minOrderValue) {
      return { valid: false, message: `Minimum order value of ₹${c.minOrderValue} required for this code` };
    }

    let discount = 0;
    if (c.discountType === 'fixed') {
      discount = c.discountValue;
    } else {
      discount = Math.round((cartTotal * c.discountValue) / 100);
      if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
    }

    return {
      valid: true,
      coupon: c,
      discountAmount: discount,
      message: `Coupon ${c.code} applied! Saved ₹${discount}`,
    };
  },

  // ==========================================
  // REPORTS, AUDIT & SETTINGS
  // ==========================================
  async getReportsSummary(): Promise<any> {
    const serverData = await safeFetch<any>('/api/reports/summary');
    if (serverData) return serverData;

    const orders = parseLocal<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
    const products = parseLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const customers = parseLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);

    const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalGst = orders.reduce((sum, o) => sum + o.cgstTotal + o.sgstTotal + o.igstTotal, 0);

    return {
      totalSales,
      totalOrders: orders.length,
      totalGst,
      totalCustomers: customers.length,
      totalProducts: products.length,
      lowStockAlerts: products.filter((p) => p.stock > 0 && p.stock <= p.minStockLevel).length,
    };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const serverData = await safeFetch<AuditLog[]>('/api/audit-logs');
    if (serverData) return serverData;
    return parseLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  },

  async getSettings(): Promise<StoreSettings> {
    const serverData = await safeFetch<StoreSettings>('/api/settings');
    if (serverData) {
      saveLocal(STORAGE_KEYS.SETTINGS, serverData);
      return serverData;
    }
    return parseLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, initialStoreSettings);
  },

  async updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const serverData = await safeFetch<StoreSettings>('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (serverData) {
      saveLocal(STORAGE_KEYS.SETTINGS, serverData);
      return serverData;
    }

    const current = parseLocal<StoreSettings>(STORAGE_KEYS.SETTINGS, initialStoreSettings);
    const updated = { ...current, ...data };
    saveLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  async getCategories(): Promise<Category[]> {
    const serverData = await safeFetch<Category[]>('/api/categories');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      saveLocal(STORAGE_KEYS.CATEGORIES, serverData);
      return serverData;
    }
    return parseLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  async getBrands(): Promise<Brand[]> {
    const serverData = await safeFetch<Brand[]>('/api/brands');
    if (serverData && Array.isArray(serverData) && serverData.length > 0) {
      saveLocal(STORAGE_KEYS.BRANDS, serverData);
      return serverData;
    }
    return parseLocal<Brand[]>(STORAGE_KEYS.BRANDS, initialBrands);
  },
};
