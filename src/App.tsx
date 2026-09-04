import React, { useState, useEffect } from 'react';
import { Product, Category, Brand, CartItem, Order, Customer, StoreSettings, Coupon, ProductVariant } from './types';
import { apiClient } from './services/api';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HeroBanner } from './components/ecommerce/HeroBanner';
import { CategoryBrowser } from './components/ecommerce/CategoryBrowser';
import { ProductCard } from './components/ecommerce/ProductCard';
import { ProductListPage } from './components/ecommerce/ProductListPage';
import { ProductDetailPage } from './components/ecommerce/ProductDetailPage';
import { CartDrawer } from './components/ecommerce/CartDrawer';
import { CheckoutModal } from './components/ecommerce/CheckoutModal';
import { TrackOrderModal } from './components/ecommerce/TrackOrderModal';
import { CustomerPortal } from './components/ecommerce/CustomerPortal';
import { PosTerminal } from './components/pos/PosTerminal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ThermalReceiptModal } from './components/common/ThermalReceiptModal';
import { initialStoreSettings } from './data/seedData';
import { ArrowRight, Sparkles, CheckCircle2, Flame, Award, ShieldCheck } from 'lucide-react';

export function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-detail' | 'pos' | 'admin' | 'account'>('home');
  const [navParams, setNavParams] = useState<{ category?: string; search?: string; productId?: string }>({});

  // Core Data - Pre-hydrated with self-healing demo store for immediate zero-delay display
  const [products, setProducts] = useState<Product[]>(() => apiClient.getLocalProducts());
  const [categories, setCategories] = useState<Category[]>(() => apiClient.getLocalCategories());
  const [brands, setBrands] = useState<Brand[]>(() => apiClient.getLocalBrands());
  const [orders, setOrders] = useState<Order[]>(() => apiClient.getLocalOrders());
  const [customers, setCustomers] = useState<Customer[]>(() => apiClient.getLocalCustomers());
  const [coupons, setCoupons] = useState<Coupon[]>(() => apiClient.getLocalCoupons());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => apiClient.getLocalSettings());
  const [isLoading, setIsLoading] = useState(false);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | undefined>(undefined);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Background sync from API if server is present (e.g. Docker / Cloud Run)
  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, brs, ords, custs, setts, cpnList] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getCategories(),
          apiClient.getBrands(),
          apiClient.getOrders(),
          apiClient.getCustomers(),
          apiClient.getSettings(),
          apiClient.getCoupons(),
        ]);

        if (prods && prods.length > 0) setProducts(prods);
        if (cats && cats.length > 0) setCategories(cats);
        if (brs && brs.length > 0) setBrands(brs);
        if (ords && ords.length > 0) setOrders(ords);
        if (custs && custs.length > 0) setCustomers(custs);
        if (setts) setStoreSettings(setts);
        if (cpnList && cpnList.length > 0) setCoupons(cpnList);
      } catch (err) {
        console.warn('API sync skipped, running smoothly with local storage data:', err);
      }
    }
    loadData();
  }, []);

  const handleResetDemoData = () => {
    apiClient.resetToFactoryDefaults();
    setProducts(apiClient.getLocalProducts());
    setCategories(apiClient.getLocalCategories());
    setBrands(apiClient.getLocalBrands());
    setOrders(apiClient.getLocalOrders());
    setCustomers(apiClient.getLocalCustomers());
    setCoupons(apiClient.getLocalCoupons());
    setStoreSettings(apiClient.getLocalSettings());
    showToast('Demo data restored to original default catalog!');
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    const updated = await apiClient.updateSettings(newSettings);
    setStoreSettings(updated);
    showToast('Store settings updated successfully');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Navigation Handler
  const handleNavigate = (view: string, data?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'product-detail' && data?.productId) {
      const prod = products.find((p) => p.id === data.productId);
      if (prod) {
        setSelectedProduct(prod);
        setCurrentView('product-detail');
        return;
      }
    }
    if (data?.category || data?.search) {
      setNavParams(data);
    } else {
      setNavParams({});
    }
    setCurrentView(view as any);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    setCartItems((prev) => {
      const variantKey = variant ? variant.id : 'base';
      const existing = prev.find(
        (item) => item.product.id === product.id && (item.variant?.id || 'base') === variantKey
      );

      const price = variant ? variant.price : product.price;

      if (existing) {
        return prev.map((item) => {
          if (item.product.id === product.id && (item.variant?.id || 'base') === variantKey) {
            const nextQty = item.quantity + quantity;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: nextQty * item.unitPrice,
            };
          }
          return item;
        });
      }

      return [
        ...prev,
        {
          product,
          variant,
          quantity,
          unitPrice: price,
          totalPrice: price * quantity,
        },
      ];
    });

    showToast(`✓ Added ${product.name} to cart`);
  };

  const handleUpdateQuantity = (productId: string, delta: number, variantId?: string) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && (item.variant?.id || undefined) === variantId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0
              ? {
                  ...item,
                  quantity: nextQty,
                  totalPrice: nextQty * item.unitPrice,
                }
              : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string, variantId?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && (item.variant?.id || undefined) === variantId)
      )
    );
  };

  const handleApplyCoupon = async (code: string): Promise<boolean> => {
    try {
      const cpn = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active);
      if (!cpn) return false;

      const subtotal = cartItems.reduce((s, i) => s + i.totalPrice, 0);
      if (subtotal < cpn.minOrderValue) {
        showToast(`Coupon requires minimum order of ₹${cpn.minOrderValue}`);
        return false;
      }

      let discount = 0;
      if (cpn.discountType === 'percentage') {
        discount = (subtotal * cpn.discountValue) / 100;
        if (cpn.maxDiscount) discount = Math.min(discount, cpn.maxDiscount);
      } else {
        discount = cpn.discountValue;
      }

      setAppliedCoupon(cpn);
      setCouponDiscount(discount);
      showToast(`🎉 Coupon ${cpn.code} applied: ₹${discount} savings!`);
      return true;
    } catch {
      return false;
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(undefined);
    setCouponDiscount(0);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(`Removed from Wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`❤️ Added to Wishlist`);
        return [...prev, product.id];
      }
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyNow = (product: Product, quantity: number = 1, variant?: ProductVariant) => {
    handleAddToCart(product, quantity, variant);
    setIsCheckoutOpen(true);
  };

  // Submit E-Commerce Order
  const handleSubmitOrder = async (orderPayload: any) => {
    const created = await apiClient.createOrder(orderPayload);
    setOrders((prev) => [created, ...prev]);
    // Refresh products stock
    const refreshedProds = await apiClient.getProducts();
    setProducts(refreshedProds);
    return created;
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    setAppliedCoupon(undefined);
    setCouponDiscount(0);
    setIsCheckoutOpen(false);
    setReceiptOrder(order);
    showToast(`🎉 Order ${order.orderNumber} placed successfully!`);
  };

  // POS Sale Complete
  const handleCompletePosSale = async (payload: any) => {
    const created = await apiClient.createPosSale(payload);
    setOrders((prev) => [created, ...prev]);
    const refreshedProds = await apiClient.getProducts();
    setProducts(refreshedProds);
    return created;
  };

  // Stock update from Admin
  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    const updated = await apiClient.updateStock(productId, newStock);
    setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
    showToast(`Stock updated for ${updated.name}`);
  };

  const handleCreateProduct = async (productData: Partial<Product>) => {
    const created = await apiClient.createProduct(productData);
    setProducts((prev) => [created, ...prev]);
    showToast(`Product ${created.name} added to catalog`);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus'], notes?: string) => {
    const updated = await apiClient.updateOrderStatus(orderId, status, notes);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    showToast(`Order status updated to ${status}`);
  };

  const cartTotal = cartItems.reduce((s, i) => s + i.totalPrice, 0);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent mb-4" />
        <p className="font-extrabold text-sm uppercase text-zinc-900 tracking-wider">
          Loading KITCHEN PRO Catalog & System...
        </p>
      </div>
    );
  }

  // POS Terminal Full-Screen View
  if (currentView === 'pos') {
    return (
      <>
        <PosTerminal
          products={products}
          customers={customers}
          storeSettings={storeSettings}
          onCompleteSale={handleCompletePosSale}
          onPrintReceipt={(order) => setReceiptOrder(order)}
          onBackToShop={() => setCurrentView('admin')}
        />
        <ThermalReceiptModal
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
          storeSettings={storeSettings}
        />
      </>
    );
  }

  // Admin ERP Full-Screen View
  if (currentView === 'admin') {
    return (
      <>
        <AdminDashboard
          products={products}
          orders={orders}
          customers={customers}
          storeSettings={storeSettings}
          onUpdateProductStock={handleUpdateProductStock}
          onCreateProduct={handleCreateProduct}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateSettings={handleUpdateSettings}
          onResetDemoData={handleResetDemoData}
          onPrintInvoice={(order) => setReceiptOrder(order)}
          onBackToShop={() => setCurrentView('home')}
          onOpenPos={() => setCurrentView('pos')}
        />
        <ThermalReceiptModal
          isOpen={!!receiptOrder}
          onClose={() => setReceiptOrder(null)}
          order={receiptOrder}
          storeSettings={storeSettings}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-4 py-3 rounded-lg shadow-2xl border border-orange-500/50 flex items-center space-x-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartItems.reduce((sum, i) => sum + i.quantity, 0)}
        cartTotal={cartTotal}
        wishlistCount={wishlistIds.length}
        storeSettings={storeSettings}
        products={products}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setCurrentView('account')}
        onOpenTrackOrder={() => setIsTrackOrderOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* ============================================================ */}
        {/* VIEW 1: HOME PAGE */}
        {/* ============================================================ */}
        {currentView === 'home' && (
          <div>
            {/* Hero Banner with image branding */}
            <HeroBanner
              onShopClick={() => handleNavigate('shop')}
              onCategoryClick={(catId) => handleNavigate('shop', { category: catId })}
            />

            {/* Category Browser Section */}
            <CategoryBrowser
              categories={categories}
              onSelectCategory={(catId) => {
                if (catId === 'all') handleNavigate('shop');
                else handleNavigate('shop', { category: catId });
              }}
            />

            {/* Best Sellers & Featured Products Section */}
            <section className="py-12 bg-white border-b border-zinc-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-2">
                  <div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-orange-600">
                      HIGH-DEMAND COMMERCIAL EQUIPMENT
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight">
                      BEST SELLERS &amp; PRO APPLIANCES
                    </h2>
                  </div>
                  <button
                    onClick={() => handleNavigate('shop')}
                    className="self-start sm:self-auto text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1 uppercase"
                  >
                    <span>View All ({products.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {products.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.includes(product.id)}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* B2B Institutional Quote / Commercial Trust Callout */}
            <section className="py-12 bg-zinc-900 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-2.5 py-1 bg-orange-600 text-white text-[11px] font-extrabold uppercase rounded">
                    B2B & INSTITUTIONAL SUPPLY
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                    Equipping Cloud Kitchens, Hotels, Restaurants & Catering Units
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Get wholesale bulk GST invoices, input tax credit (ITC), on-site warranty coverage, and dedicated account manager support for order sizes exceeding ₹50,000.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => handleNavigate('shop', { category: 'cat-commercial' })}
                      className="px-5 py-3 bg-[#F27D26] hover:bg-white text-black text-xs font-black rounded-xs uppercase tracking-tighter transition"
                    >
                      EXPLORE COMMERCIAL RANGE →
                    </button>
                    <button
                      onClick={() => handleNavigate('shop')}
                      className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-gray-200 text-xs font-black rounded-xs uppercase tracking-tighter transition"
                    >
                      VIEW FULL CATALOG
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 space-y-3 text-xs">
                  <div className="flex items-center space-x-3 text-orange-500 font-extrabold">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="uppercase text-sm">Official Commercial Compliance</span>
                  </div>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-center space-x-2">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>GST Rule 46 Compliant Invoices with itemized tax breakdown</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>100% Food-Grade SS 304 Tri-Ply Cookware Certification</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>Heavy-Duty Copper Wound Motors with Thermal Overload Protection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-orange-500 font-bold">✓</span>
                      <span>Thermal 80mm/58mm POS Receipts and A4 GST Invoices</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: PRODUCT LISTING / CATALOG */}
        {/* ============================================================ */}
        {currentView === 'shop' && (
          <ProductListPage
            products={products}
            categories={categories}
            brands={brands}
            initialCategory={navParams.category}
            initialSearch={navParams.search}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* ============================================================ */}
        {/* VIEW 3: PRODUCT DETAIL PAGE */}
        {/* ============================================================ */}
        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            onSelectProduct={handleSelectProduct}
            onBackToShop={() => handleNavigate('shop')}
          />
        )}

        {/* ============================================================ */}
        {/* VIEW 4: CUSTOMER ACCOUNT & INVOICES PORTAL */}
        {/* ============================================================ */}
        {currentView === 'account' && (
          <CustomerPortal
            orders={orders}
            customers={customers}
            allProducts={products}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onViewInvoice={(ord) => setReceiptOrder(ord)}
            onTrackOrder={(ord) => {
              setIsTrackOrderOpen(true);
            }}
            storeSettings={storeSettings}
            onBackToShop={() => handleNavigate('shop')}
          />
        )}
      </main>

      {/* Global Modals */}
      {/* 1. Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        storeSettings={storeSettings}
      />

      {/* 2. Express Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        coupon={appliedCoupon}
        couponDiscount={couponDiscount}
        storeSettings={storeSettings}
        onSubmitOrder={handleSubmitOrder}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 3. Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        orders={orders}
        onViewInvoice={(ord) => setReceiptOrder(ord)}
      />

      {/* 4. Thermal & A4 Receipt Modal */}
      <ThermalReceiptModal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        order={receiptOrder}
        storeSettings={storeSettings}
      />

      {/* Global Footer */}
      <Footer storeSettings={storeSettings} onNavigate={handleNavigate} />
    </div>
  );
}
export default App;
