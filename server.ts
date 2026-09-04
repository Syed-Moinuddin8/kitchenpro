import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
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
} from './src/data/seedData';
import { Product, Order, Customer, InventoryTransaction, AuditLog, StoreSettings, Coupon } from './src/types';
import { calculateBilling } from './src/services/billingEngine';

// In-Memory Database Store (Simulating normalized PostgreSQL state with ACID transaction integrity)
let products: Product[] = [...initialProducts];
let categories = [...initialCategories];
let brands = [...initialBrands];
let customers: Customer[] = [...initialCustomers];
let orders: Order[] = [...initialOrders];
let coupons: Coupon[] = [...initialCoupons];
let transactions: InventoryTransaction[] = [...initialTransactions];
let auditLogs: AuditLog[] = [...initialAuditLogs];
let storeSettings: StoreSettings = { ...initialStoreSettings };
let heldBills: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health Check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // AUTH API
  // ==========================================
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, role } = req.body;
    // Enterprise role-based login simulation
    const user = {
      id: 'usr-current',
      name: role === 'cashier' ? 'Vikram Singh (Cashier)' : role === 'inventory_staff' ? 'Anil Gupta (Inventory)' : 'Vikram Malhotra (Super Admin)',
      email: email || 'admin@kitchenpro.in',
      role: role || 'super_admin',
    };
    
    // Log audit
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: 'User Logged In',
      module: 'auth',
      details: `User signed in with role: ${user.role}`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, user, token: 'jwt-token-kp-enterprise-session' });
  });

  // ==========================================
  // PRODUCTS API
  // ==========================================
  app.get('/api/products', (req: Request, res: Response) => {
    const { category, search, brand, inStock, status, sort } = req.query;
    let filtered = [...products];

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.categoryId === category || p.categoryName.toLowerCase().includes(String(category).toLowerCase()));
    }
    if (brand && brand !== 'all') {
      filtered = filtered.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
    }
    if (inStock === 'true') {
      filtered = filtered.filter((p) => p.stock > 0);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (search) {
      const q = String(search).toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.hsnCode.includes(q)
      );
    }

    if (sort === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({ products: filtered, total: filtered.length });
  });

  app.get('/api/products/:idOrSlug', (req: Request, res: Response) => {
    const { idOrSlug } = req.params;
    const product = products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.name || !data.sku || !data.price) {
      return res.status(400).json({ error: 'Name, SKU and Price are required fields' });
    }

    // Check duplicate SKU
    if (products.some((p) => p.sku.toUpperCase() === data.sku.toUpperCase())) {
      return res.status(400).json({ error: `Product with SKU "${data.sku}" already exists.` });
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      sku: data.sku.toUpperCase(),
      barcode: data.barcode || `890123${Math.floor(100000 + Math.random() * 900000)}`,
      brand: data.brand || 'Kitchen Pro Master',
      categoryId: data.categoryId || 'cat-appliances',
      categoryName: data.categoryName || 'Kitchen Appliances',
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80'],
      mrp: Number(data.mrp) || Number(data.price),
      price: Number(data.price),
      costPrice: Number(data.costPrice) || Math.round(Number(data.price) * 0.7),
      discountPercentage: data.mrp > data.price ? Math.round(((data.mrp - data.price) / data.mrp) * 100) : 0,
      gstRate: Number(data.gstRate) || 18,
      hsnCode: data.hsnCode || '8509',
      stock: Number(data.stock) || 0,
      minStockLevel: Number(data.minStockLevel) || 5,
      warranty: data.warranty || '1 Year Standard Warranty',
      returnPolicy: data.returnPolicy || '7 Days Replacement Policy',
      status: data.status || 'published',
      featured: !!data.featured,
      bestSeller: !!data.bestSeller,
      newArrival: !!data.newArrival,
      rating: 5.0,
      reviewCount: 0,
      variants: data.variants || [],
      specifications: data.specifications || [],
      features: data.features || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    products.unshift(newProduct);

    // Initial stock transaction
    if (newProduct.stock > 0) {
      transactions.unshift({
        id: `tx-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        quantity: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        type: 'purchase',
        referenceNumber: 'INITIAL-STOCK',
        notes: 'Initial stock recorded on product creation',
        userId: 'usr-admin',
        userName: 'Admin',
        createdAt: new Date().toISOString(),
      });
    }

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-admin',
      userName: 'Admin',
      role: 'admin',
      action: 'Product Created',
      module: 'products',
      recordId: newProduct.id,
      details: `Created product: ${newProduct.name} (SKU: ${newProduct.sku}) with ${newProduct.stock} units.`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = {
      ...products[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updated;

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-admin',
      userName: 'Admin',
      role: 'admin',
      action: 'Product Updated',
      module: 'products',
      recordId: id,
      details: `Updated details for: ${updated.name}`,
      timestamp: new Date().toISOString(),
    });

    res.json(updated);
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const prod = products.find((p) => p.id === id);
    if (!prod) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products = products.filter((p) => p.id !== id);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-admin',
      userName: 'Admin',
      role: 'admin',
      action: 'Product Deleted',
      module: 'products',
      recordId: id,
      details: `Removed product: ${prod.name} (${prod.sku})`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Product removed' });
  });

  // ==========================================
  // INVENTORY & STOCK MANAGEMENT API
  // ==========================================
  app.get('/api/inventory', (req: Request, res: Response) => {
    const list = products.map((p) => ({
      ...p,
      isLowStock: p.stock > 0 && p.stock <= p.minStockLevel,
      isOutOfStock: p.stock <= 0,
    }));
    res.json({
      inventory: list,
      totalItems: list.length,
      lowStockCount: list.filter((p) => p.isLowStock).length,
      outOfStockCount: list.filter((p) => p.isOutOfStock).length,
    });
  });

  app.get('/api/inventory/transactions', (req: Request, res: Response) => {
    res.json(transactions);
  });

  app.post('/api/inventory/adjust', (req: Request, res: Response) => {
    const { productId, quantityChange, type, referenceNumber, notes, userName } = req.body;
    const product = products.find((p) => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const qty = Number(quantityChange);
    if (isNaN(qty) || qty === 0) {
      return res.status(400).json({ error: 'Invalid quantity adjustment' });
    }

    const previousStock = product.stock;
    const newStock = previousStock + qty;

    if (newStock < 0) {
      return res.status(400).json({ error: `Cannot deduct ${Math.abs(qty)} units. Current stock is only ${previousStock}.` });
    }

    product.stock = newStock;
    product.updatedAt = new Date().toISOString();

    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      previousStock,
      newStock,
      type: type || 'stock_adjustment',
      referenceNumber: referenceNumber || `ADJ-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Manual inventory adjustment',
      userId: 'usr-inventory',
      userName: userName || 'Inventory Manager',
      createdAt: new Date().toISOString(),
    };

    transactions.unshift(tx);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-inventory',
      userName: userName || 'Inventory Staff',
      role: 'inventory_staff',
      action: 'Stock Adjustment',
      module: 'inventory',
      recordId: product.id,
      details: `${type.toUpperCase()}: Adjusted stock of "${product.name}" from ${previousStock} to ${newStock} (${qty > 0 ? '+' : ''}${qty}). Ref: ${tx.referenceNumber}`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, product, transaction: tx });
  });

  // ==========================================
  // POS COUNTER BILLING (TRANSACTIONAL)
  // ==========================================
  app.post('/api/pos/sale', (req: Request, res: Response) => {
    const {
      customer,
      items,
      couponCode,
      isInterState,
      paymentMethod,
      cashierName,
      receivedAmount,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Bill must contain at least one item' });
    }

    // Step 1: Stock Validation (ACID Pre-condition)
    for (const item of items) {
      const p = products.find((prod) => prod.id === item.productId);
      if (!p) {
        return res.status(400).json({ error: `Product "${item.productName}" not found.` });
      }
      if (p.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${p.name}". Requested: ${item.quantity}, Available: ${p.stock}`,
        });
      }
    }

    // Step 2: Validate coupon if provided
    let couponDiscount = 0;
    if (couponCode) {
      const coup = coupons.find((c) => c.code.toUpperCase() === String(couponCode).toUpperCase() && c.status === 'active');
      if (coup) {
        if (coup.discountType === 'fixed') {
          couponDiscount = coup.discountValue;
        } else {
          // % discount
          const sub = items.reduce((acc: number, it: any) => acc + it.unitPrice * it.quantity, 0);
          couponDiscount = Math.min(coup.maxDiscount || 99999, Math.round((sub * coup.discountValue) / 100));
        }
        coup.usedCount += 1;
      }
    }

    // Step 3: Run Centralized Billing Engine
    const billCalc = calculateBilling(
      items.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        hsnCode: i.hsnCode,
        mrp: i.mrp,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        discountPercent: i.discountPercent || 0,
        gstRate: i.gstRate || 18,
      })),
      {
        isInterState: !!isInterState,
        couponDiscount,
        shippingCharges: 0,
        pricesIncludeGst: true,
      }
    );

    // Step 4: Generate sequential invoice & order numbers
    const invoiceNum = `${storeSettings.invoicePrefix}${storeSettings.nextInvoiceNumber++}`;
    const orderNum = `KP-POS-${Date.now().toString().slice(-6)}`;

    // Step 5: Execute atomic stock deduction & inventory logs
    for (const item of billCalc.items) {
      const p = products.find((prod) => prod.id === item.productId)!;
      const prev = p.stock;
      p.stock = prev - item.quantity;
      p.updatedAt = new Date().toISOString();

      transactions.unshift({
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        quantity: -item.quantity,
        previousStock: prev,
        newStock: p.stock,
        type: 'pos_sale',
        referenceNumber: invoiceNum,
        notes: `POS Counter Bill #${invoiceNum} (Cashier: ${cashierName || 'Counter Staff'})`,
        userId: 'usr-cashier',
        userName: cashierName || 'Cashier Staff',
        createdAt: new Date().toISOString(),
      });
    }

    // Step 6: Customer record & Credit Handling
    let custRecord = customer;
    if (customer && customer.phone) {
      let existing = customers.find((c) => c.phone === customer.phone);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += billCalc.grandTotal;
        existing.lastPurchaseDate = new Date().toISOString();
        if (customer.gstin && !existing.gstin) existing.gstin = customer.gstin;
        if (customer.name && existing.name.startsWith('Walk-in')) existing.name = customer.name;
        
        if (paymentMethod === 'credit') {
          existing.creditBalance = (existing.creditBalance || 0) + billCalc.grandTotal;
        }
        custRecord = existing;
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: customer.name || 'Walk-in Customer',
          phone: customer.phone,
          email: customer.email,
          gstin: customer.gstin,
          addresses: [],
          totalOrders: 1,
          totalSpent: billCalc.grandTotal,
          creditBalance: paymentMethod === 'credit' ? billCalc.grandTotal : 0,
          creditLimit: 25000,
          createdAt: new Date().toISOString(),
          lastPurchaseDate: new Date().toISOString(),
        };
        customers.push(newCust);
        custRecord = newCust;
      }
    }

    // Step 7: Create Order Record
    const orderItems = billCalc.items.map((it) => {
      const original = items.find((raw: any) => raw.productId === it.productId);
      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        image: original?.image || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=300&q=80',
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
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      type: 'pos',
      customer: {
        id: custRecord?.id,
        name: custRecord?.name || 'Walk-in Customer',
        phone: custRecord?.phone || '9999999999',
        email: custRecord?.email,
        gstin: custRecord?.gstin,
      },
      deliveryMethod: 'store_pickup',
      items: orderItems,
      subtotal: billCalc.subtotal,
      itemDiscountTotal: billCalc.itemDiscountTotal,
      couponCode: couponCode || undefined,
      couponDiscount: billCalc.couponDiscountTotal,
      taxableAmount: billCalc.taxableSubtotal,
      cgstTotal: billCalc.cgstTotal,
      sgstTotal: billCalc.sgstTotal,
      igstTotal: billCalc.igstTotal,
      shippingCharges: 0,
      roundOff: billCalc.roundOff,
      grandTotal: billCalc.grandTotal,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'completed',
      orderStatus: 'delivered',
      isInterState: !!isInterState,
      notes,
      cashierName: cashierName || 'Counter 1 Staff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'delivered',
          timestamp: new Date().toISOString(),
          notes: `POS Counter Bill completed via ${String(paymentMethod).toUpperCase()}`,
        },
      ],
    };

    orders.unshift(newOrder);

    // Audit Log
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-cashier',
      userName: cashierName || 'Cashier',
      role: 'cashier',
      action: 'POS Bill Created',
      module: 'pos',
      recordId: invoiceNum,
      details: `Generated Tax Invoice #${invoiceNum} for ₹${billCalc.grandTotal.toLocaleString('en-IN')} (${paymentMethod}). Stock updated.`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      order: newOrder,
      invoice: {
        invoiceNumber: invoiceNum,
        date: newOrder.createdAt,
        store: storeSettings,
        customer: newOrder.customer,
        items: billCalc.items,
        calculation: billCalc,
        payment: {
          method: paymentMethod,
          receivedAmount: receivedAmount || billCalc.grandTotal,
          changeDue: receivedAmount ? Math.max(0, receivedAmount - billCalc.grandTotal) : 0,
        },
        cashier: cashierName || 'Cashier 1',
      },
    });
  });

  // POS Held Bills Management (Hold & Recall)
  app.get('/api/pos/held-bills', (req: Request, res: Response) => {
    res.json(heldBills);
  });

  app.post('/api/pos/held-bills', (req: Request, res: Response) => {
    const { referenceName, customer, items, couponCode, discountAmount } = req.body;
    const held = {
      id: `held-${Date.now()}`,
      referenceName: referenceName || `Bill #${heldBills.length + 1}`,
      customer,
      items,
      couponCode,
      discountAmount,
      timestamp: new Date().toISOString(),
    };
    heldBills.push(held);
    res.json({ success: true, held });
  });

  app.delete('/api/pos/held-bills/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    heldBills = heldBills.filter((b) => b.id !== id);
    res.json({ success: true });
  });

  // ==========================================
  // E-COMMERCE ONLINE CHECKOUT
  // ==========================================
  app.post('/api/orders', (req: Request, res: Response) => {
    const { customer, shippingAddress, deliveryMethod, items, couponCode, paymentMethod, isInterState } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one product' });
    }

    // Check stock
    for (const item of items) {
      const p = products.find((prod) => prod.id === item.productId);
      if (!p || p.stock < item.quantity) {
        return res.status(400).json({
          error: `Item "${item.productName || p?.name}" is out of stock or requested quantity unavailable.`,
        });
      }
    }

    let couponDiscount = 0;
    if (couponCode) {
      const coup = coupons.find((c) => c.code.toUpperCase() === String(couponCode).toUpperCase() && c.status === 'active');
      if (coup) {
        if (coup.discountType === 'fixed') {
          couponDiscount = coup.discountValue;
        } else {
          const sub = items.reduce((acc: number, it: any) => acc + it.unitPrice * it.quantity, 0);
          couponDiscount = Math.min(coup.maxDiscount || 99999, Math.round((sub * coup.discountValue) / 100));
        }
        coup.usedCount += 1;
      }
    }

    const subtotalRaw = items.reduce((sum: number, it: any) => sum + it.unitPrice * it.quantity, 0);
    const shippingCharges =
      deliveryMethod === 'store_pickup'
        ? 0
        : subtotalRaw >= storeSettings.freeShippingThreshold
        ? 0
        : storeSettings.flatShippingFee;

    const calc = calculateBilling(
      items.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        hsnCode: i.hsnCode,
        mrp: i.mrp,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        discountPercent: i.discountPercent || 0,
        gstRate: i.gstRate || 18,
      })),
      {
        isInterState: !!isInterState,
        couponDiscount,
        shippingCharges,
        pricesIncludeGst: true,
      }
    );

    const invoiceNum = `${storeSettings.invoicePrefix}${storeSettings.nextInvoiceNumber++}`;
    const orderNum = `KP-ORD-${Date.now().toString().slice(-6)}`;

    // Deduct stock
    for (const item of calc.items) {
      const p = products.find((prod) => prod.id === item.productId)!;
      const prev = p.stock;
      p.stock = prev - item.quantity;
      p.updatedAt = new Date().toISOString();

      transactions.unshift({
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        quantity: -item.quantity,
        previousStock: prev,
        newStock: p.stock,
        type: 'sale',
        referenceNumber: orderNum,
        notes: `Online Order #${orderNum} (${deliveryMethod})`,
        userId: 'usr-online',
        userName: 'Online System',
        createdAt: new Date().toISOString(),
      });
    }

    // Save/Update Customer
    let cust = customers.find((c) => c.phone === customer.phone);
    if (!cust) {
      cust = {
        id: `cust-${Date.now()}`,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        gstin: customer.gstin,
        addresses: shippingAddress ? [shippingAddress] : [],
        totalOrders: 1,
        totalSpent: calc.grandTotal,
        creditBalance: 0,
        createdAt: new Date().toISOString(),
        lastPurchaseDate: new Date().toISOString(),
      };
      customers.push(cust);
    } else {
      cust.totalOrders += 1;
      cust.totalSpent += calc.grandTotal;
      cust.lastPurchaseDate = new Date().toISOString();
      if (shippingAddress && !cust.addresses.some((a) => a.street === shippingAddress.street)) {
        cust.addresses.push(shippingAddress);
      }
    }

    const orderItems = calc.items.map((it) => {
      const original = items.find((raw: any) => raw.productId === it.productId);
      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        image: original?.image || 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=300&q=80',
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
      };
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      invoiceNumber: invoiceNum,
      type: 'online',
      customer: {
        id: cust.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        gstin: customer.gstin,
      },
      shippingAddress,
      deliveryMethod: deliveryMethod || 'home_delivery',
      items: orderItems,
      subtotal: calc.subtotal,
      itemDiscountTotal: calc.itemDiscountTotal,
      couponCode: couponCode || undefined,
      couponDiscount: calc.couponDiscountTotal,
      taxableAmount: calc.taxableSubtotal,
      cgstTotal: calc.cgstTotal,
      sgstTotal: calc.sgstTotal,
      igstTotal: calc.igstTotal,
      shippingCharges: calc.shippingCharges,
      roundOff: calc.roundOff,
      grandTotal: calc.grandTotal,
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'confirmed',
      isInterState: !!isInterState,
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

    orders.unshift(newOrder);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: cust.id,
      userName: cust.name,
      role: 'customer',
      action: 'Online Order Placed',
      module: 'orders',
      recordId: orderNum,
      details: `New order #${orderNum} for ₹${calc.grandTotal.toLocaleString('en-IN')}`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, order: newOrder });
  });

  // ==========================================
  // ORDERS MANAGEMENT API
  // ==========================================
  app.get('/api/orders', (req: Request, res: Response) => {
    const { status, search, type } = req.query;
    let list = [...orders];

    if (status && status !== 'all') {
      list = list.filter((o) => o.orderStatus === status);
    }
    if (type && type !== 'all') {
      list = list.filter((o) => o.type === type);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      );
    }

    res.json(list);
  });

  app.get('/api/orders/:idOrNumber', (req: Request, res: Response) => {
    const { idOrNumber } = req.params;
    const order = orders.find((o) => o.id === idOrNumber || o.orderNumber === idOrNumber || o.invoiceNumber === idOrNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const order = orders.find((o) => o.id === id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const prevStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();

    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      notes: notes || `Status updated to ${status.toUpperCase()}`,
    });

    // If order is cancelled, restore stock automatically!
    if (status === 'cancelled' && prevStatus !== 'cancelled') {
      for (const item of order.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          const prevStock = prod.stock;
          prod.stock = prevStock + item.quantity;
          prod.updatedAt = new Date().toISOString();

          transactions.unshift({
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            quantity: item.quantity,
            previousStock: prevStock,
            newStock: prod.stock,
            type: 'cancellation',
            referenceNumber: order.orderNumber,
            notes: `Auto-restored stock due to Order #${order.orderNumber} cancellation`,
            userId: 'usr-admin',
            userName: 'System Restock',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-admin',
      userName: 'Admin',
      role: 'admin',
      action: 'Order Status Changed',
      module: 'orders',
      recordId: order.orderNumber,
      details: `Updated Order #${order.orderNumber} from "${prevStatus}" to "${status}"`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, order });
  });

  // ==========================================
  // RETURNS & REFUNDS API
  // ==========================================
  app.post('/api/returns', (req: Request, res: Response) => {
    const { invoiceNumber, items, refundMethod, customerName, customerPhone } = req.body;
    const order = orders.find((o) => o.invoiceNumber === invoiceNumber || o.orderNumber === invoiceNumber);

    if (!order) {
      return res.status(404).json({ error: 'Order/Invoice not found' });
    }

    let totalRefund = 0;
    for (const retItem of items) {
      totalRefund += retItem.refundAmount || retItem.unitPrice * retItem.quantity;

      // If condition is resalable, restore inventory!
      if (retItem.condition === 'resalable') {
        const p = products.find((prod) => prod.id === retItem.productId);
        if (p) {
          const prev = p.stock;
          p.stock = prev + retItem.quantity;
          transactions.unshift({
            id: `tx-${Date.now()}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            quantity: retItem.quantity,
            previousStock: prev,
            newStock: p.stock,
            type: 'return',
            referenceNumber: `RET-${invoiceNumber}`,
            notes: `Customer return restocked. Reason: ${retItem.reason || 'Not specified'}`,
            userId: 'usr-admin',
            userName: 'Returns Officer',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        // Damaged return
        transactions.unshift({
          id: `tx-${Date.now()}`,
          productId: retItem.productId,
          productName: retItem.productName,
          sku: retItem.sku,
          quantity: 0,
          previousStock: 0,
          newStock: 0,
          type: 'damage',
          referenceNumber: `RET-DMG-${invoiceNumber}`,
          notes: `Defective return logged to damage scrap ledger: ${retItem.reason}`,
          userId: 'usr-admin',
          userName: 'Returns Officer',
          createdAt: new Date().toISOString(),
        });
      }
    }

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-admin',
      userName: 'Admin',
      role: 'admin',
      action: 'Return Processed',
      module: 'returns',
      recordId: invoiceNumber,
      details: `Processed return for Invoice #${invoiceNumber}. Refund amount: ₹${totalRefund.toLocaleString('en-IN')} via ${refundMethod}`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, refundAmount: totalRefund, returnNumber: `KP-RET-${Date.now().toString().slice(-6)}` });
  });

  // ==========================================
  // CUSTOMERS API
  // ==========================================
  app.get('/api/customers', (req: Request, res: Response) => {
    res.json(customers);
  });

  app.post('/api/customers', (req: Request, res: Response) => {
    const data = req.body;
    if (!data.name || !data.phone) {
      return res.status(400).json({ error: 'Name and Phone are required' });
    }

    const existing = customers.find((c) => c.phone === data.phone);
    if (existing) {
      return res.status(400).json({ error: 'Customer with this phone already exists' });
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email,
      companyName: data.companyName,
      gstin: data.gstin,
      creditBalance: 0,
      creditLimit: Number(data.creditLimit) || 25000,
      addresses: data.address ? [data.address] : [],
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    customers.unshift(newCust);
    res.status(201).json(newCust);
  });

  app.post('/api/customers/:id/credit-payment', (req: Request, res: Response) => {
    const { id } = req.params;
    const { amount, paymentMode, notes } = req.body;
    const cust = customers.find((c) => c.id === id);

    if (!cust) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const payAmt = Number(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const prevBal = cust.creditBalance || 0;
    cust.creditBalance = Math.max(0, prevBal - payAmt);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-cashier',
      userName: 'Cashier',
      role: 'cashier',
      action: 'Customer Credit Cleared',
      module: 'customers',
      recordId: cust.id,
      details: `Received ₹${payAmt.toLocaleString('en-IN')} payment from "${cust.name}" via ${paymentMode || 'Cash'}. Outstanding balance updated from ₹${prevBal} to ₹${cust.creditBalance}.`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, customer: cust });
  });

  // ==========================================
  // COUPONS API
  // ==========================================
  app.get('/api/coupons', (req: Request, res: Response) => {
    res.json(coupons);
  });

  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, cartTotal } = req.body;
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === String(code).toUpperCase().trim() && c.status === 'active'
    );

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired coupon code' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value for coupon "${coupon.code}" is ₹${coupon.minOrderValue.toLocaleString('en-IN')}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    } else {
      discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    }

    res.json({
      valid: true,
      coupon,
      discountAmount,
      message: `Coupon "${coupon.code}" applied! You save ₹${discountAmount.toLocaleString('en-IN')}`,
    });
  });

  // ==========================================
  // REPORTS & ANALYTICS API
  // ==========================================
  app.get('/api/reports/summary', (req: Request, res: Response) => {
    const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalOrders = orders.length;
    const posSales = orders.filter((o) => o.type === 'pos').reduce((sum, o) => sum + o.grandTotal, 0);
    const onlineSales = orders.filter((o) => o.type === 'online').reduce((sum, o) => sum + o.grandTotal, 0);
    const totalGstCollected = orders.reduce((sum, o) => sum + (o.cgstTotal + o.sgstTotal + o.igstTotal), 0);
    const lowStockItems = products.filter((p) => p.stock <= p.minStockLevel);

    // Payment methods breakdown
    const paymentBreakdown: Record<string, number> = {
      cash: 0,
      upi: 0,
      card: 0,
      credit: 0,
      net_banking: 0,
      cod: 0,
    };
    orders.forEach((o) => {
      const mode = o.paymentMethod || 'cash';
      paymentBreakdown[mode] = (paymentBreakdown[mode] || 0) + o.grandTotal;
    });

    res.json({
      totalSales,
      totalOrders,
      posSales,
      onlineSales,
      totalGstCollected,
      lowStockCount: lowStockItems.length,
      paymentBreakdown,
      productCount: products.length,
      customerCount: customers.length,
    });
  });

  // ==========================================
  // AUDIT LOGS & SETTINGS API
  // ==========================================
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json(auditLogs);
  });

  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(storeSettings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    storeSettings = { ...storeSettings, ...req.body };
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      userId: 'usr-admin',
      userName: 'Admin',
      role: 'admin',
      action: 'Store Settings Updated',
      module: 'settings',
      details: 'Updated business contact details and thermal printer settings.',
      timestamp: new Date().toISOString(),
    });
    res.json(storeSettings);
  });

  // Categories & Brands
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json(categories);
  });

  app.get('/api/brands', (req: Request, res: Response) => {
    res.json(brands);
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC FALLBACK (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KITCHEN PRO Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
