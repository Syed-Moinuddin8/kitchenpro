import { Product, Order, Customer, InventoryTransaction, AuditLog, StoreSettings, Coupon, Category, Brand } from '../types';

export const apiClient = {
  // Products
  async getProducts(params?: Record<string, string>): Promise<Product[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/products${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.products || []);
  },

  async getProduct(idOrSlug: string): Promise<Product> {
    const res = await fetch(`/api/products/${idOrSlug}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async updateStock(productId: string, newStock: number): Promise<Product> {
    const res = await fetch('/api/inventory/adjust', {
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
    if (!res.ok) {
      // Fallback update product directly
      return apiClient.updateProduct(productId, { stock: newStock });
    }
    const data = await res.json();
    return data.product;
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Inventory
  async getInventory(): Promise<{ inventory: Product[]; totalItems: number; lowStockCount: number; outOfStockCount: number }> {
    const res = await fetch('/api/inventory');
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    const res = await fetch('/api/inventory/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async adjustStock(payload: {
    productId: string;
    quantityChange: number;
    type: string;
    referenceNumber?: string;
    notes?: string;
    userName?: string;
  }): Promise<{ success: boolean; product: Product; transaction: InventoryTransaction }> {
    const res = await fetch('/api/inventory/adjust', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to adjust stock');
    }
    return res.json();
  },

  // POS Sale & Held Bills
  async createPosSale(payload: any): Promise<Order> {
    const res = await fetch('/api/pos/sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to process POS sale');
    }
    const data = await res.json();
    return data.order || data;
  },

  async getHeldBills(): Promise<any[]> {
    const res = await fetch('/api/pos/held-bills');
    if (!res.ok) return [];
    return res.json();
  },

  async saveHeldBill(bill: any): Promise<void> {
    await fetch('/api/pos/held-bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill),
    });
  },

  async deleteHeldBill(id: string): Promise<void> {
    await fetch(`/api/pos/held-bills/${id}`, { method: 'DELETE' });
  },

  // Online Orders
  async createOrder(payload: any): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    const data = await res.json();
    return data.order || data;
  },

  async createOnlineOrder(payload: any): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async getOrders(params?: Record<string, string>): Promise<Order[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`/api/orders${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(idOrNum: string): Promise<Order> {
    const res = await fetch(`/api/orders/${idOrNum}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    const data = await res.json();
    return data.order || data;
  },

  // Returns
  async processReturn(payload: any): Promise<{ success: boolean; refundAmount: number; returnNumber: string }> {
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to process return');
    }
    return res.json();
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create customer');
    }
    return res.json();
  },

  async recordCreditPayment(customerId: string, amount: number, paymentMode: string, notes?: string): Promise<{ success: boolean; customer: Customer }> {
    const res = await fetch(`/api/customers/${customerId}/credit-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, paymentMode, notes }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record credit payment');
    }
    return res.json();
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch('/api/coupons');
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  async validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; coupon?: Coupon; discountAmount?: number; message: string }> {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartTotal }),
    });
    return res.json();
  },

  // Reports, Audit & Settings
  async getReportsSummary(): Promise<any> {
    const res = await fetch('/api/reports/summary');
    if (!res.ok) throw new Error('Failed to fetch report summary');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getSettings(): Promise<StoreSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) return [];
    return res.json();
  },

  async getBrands(): Promise<Brand[]> {
    const res = await fetch('/api/brands');
    if (!res.ok) return [];
    return res.json();
  },
};
