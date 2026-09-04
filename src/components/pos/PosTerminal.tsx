import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  QrCode,
  Banknote,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  UserPlus,
  Tag,
  Check,
  X,
  Store,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
  ShoppingCart,
} from 'lucide-react';
import { Product, Customer, StoreSettings, PosSalePayload, Order } from '../../types';
import { calculateBilling, formatINR } from '../../services/billingEngine';
import { KitchenProLogo } from '../common/KitchenProLogo';

interface PosTerminalProps {
  products: Product[];
  customers: Customer[];
  storeSettings: StoreSettings;
  onCompleteSale: (payload: PosSalePayload) => Promise<Order>;
  onPrintReceipt: (order: Order) => void;
  onBackToShop: () => void;
}

interface PosCartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export const PosTerminal: React.FC<PosTerminalProps> = ({
  products,
  customers,
  storeSettings,
  onCompleteSale,
  onPrintReceipt,
  onBackToShop,
}) => {
  // State
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerModal, setIsNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');

  // Cart Adjustments
  const [cartDiscountPercent, setCartDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'credit' | 'split'>('cash');
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [heldCarts, setHeldCarts] = useState<{ id: string; timestamp: Date; items: PosCartItem[]; customer: Customer | null }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filtered products for visual quick-pick grid
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q)
      );
    }
    return true;
  });

  // Handle Barcode Scan / Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const scanned = barcodeInput.trim();
    const found = products.find((p) => p.barcode === scanned || p.sku.toLowerCase() === scanned.toLowerCase());
    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
    } else {
      alert(`No product found with barcode/SKU: ${scanned}`);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Product is out of stock in warehouse inventory!');
      return;
    }
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.price, discount: 0 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((it) => {
          if (it.product.id === productId) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setPosCart((prev) => prev.filter((it) => it.product.id !== productId));
  };

  // Run official billing calculation
  const billCalc = calculateBilling(
    posCart.map((it) => ({
      productId: it.product.id,
      productName: it.product.name,
      sku: it.product.sku,
      hsnCode: it.product.hsnCode,
      mrp: it.product.mrp,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      gstRate: it.product.gstRate,
      discount: it.discount,
    })),
    {
      cartDiscountPercentage: cartDiscountPercent,
      isInterState: false,
      shippingCharges: 0,
      pricesIncludeGst: true,
    }
  );

  // Change Tendered Calculation
  const tenderedNum = parseFloat(amountTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - billCalc.grandTotal);

  // Hold Cart
  const handleHoldCart = () => {
    if (posCart.length === 0) return;
    setHeldCarts((prev) => [
      ...prev,
      {
        id: `HOLD-${Date.now()}`,
        timestamp: new Date(),
        items: posCart,
        customer: selectedCustomer,
      },
    ]);
    setPosCart([]);
    setSelectedCustomer(null);
  };

  // Resume Cart
  const handleResumeCart = (heldId: string) => {
    const found = heldCarts.find((h) => h.id === heldId);
    if (found) {
      setPosCart(found.items);
      setSelectedCustomer(found.customer);
      setHeldCarts((prev) => prev.filter((h) => h.id !== heldId));
    }
  };

  // Complete POS Sale
  const handleCheckout = async () => {
    if (posCart.length === 0) {
      alert('Cart is empty');
      return;
    }

    setIsProcessing(true);
    try {
      const payload: PosSalePayload = {
        customer: selectedCustomer
          ? {
              name: selectedCustomer.name,
              phone: selectedCustomer.phone,
              email: selectedCustomer.email,
              gstin: selectedCustomer.gstin,
            }
          : {
              name: 'Counter Walk-in Customer',
              phone: '9800000000',
            },
        items: posCart.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          sku: it.product.sku,
          image: it.product.images[0],
          hsnCode: it.product.hsnCode,
          mrp: it.product.mrp,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          gstRate: it.product.gstRate,
          discount: it.discount,
        })),
        paymentMethod,
        amountTendered: paymentMethod === 'cash' ? tenderedNum : undefined,
        changeDue: paymentMethod === 'cash' ? changeDue : undefined,
        cartDiscountPercentage: cartDiscountPercent,
        cashierName: 'Admin Counter 1',
        isInterState: false,
      };

      const completedOrder = await onCompleteSale(payload);
      // Reset state
      setPosCart([]);
      setSelectedCustomer(null);
      setCartDiscountPercent(0);
      setAmountTendered('');
      // Open print receipt
      onPrintReceipt(completedOrder);
    } catch (err: any) {
      alert(err.message || 'Error processing POS sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'cat-appliances', name: 'Appliances' },
    { id: 'cat-cookware', name: 'Cookware' },
    { id: 'cat-commercial', name: 'Commercial Pro' },
    { id: 'cat-gas-stoves', name: 'Gas Stoves' },
    { id: 'cat-chimneys', name: 'Chimneys' },
    { id: 'cat-storage', name: 'Storage' },
  ];

  return (
    <div className="bg-zinc-900 min-h-screen text-zinc-100 flex flex-col no-print">
      {/* 1. POS Top Bar */}
      <div className="bg-[#141414] px-3 sm:px-4 py-2.5 border-b-4 border-[#F27D26] flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 shadow-md">
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            onClick={onBackToShop}
            className="px-2 sm:px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-200 text-[11px] sm:text-xs font-black uppercase tracking-tighter rounded-xs transition shrink-0"
          >
            ← Admin
          </button>
          <div className="p-1 shrink-0">
            <KitchenProLogo size="sm" lightMode={true} />
          </div>
          <span className="text-xs font-mono font-black text-[#F27D26] uppercase tracking-wider hidden md:inline">
            | POS COUNTER
          </span>
        </div>

        {/* Barcode & Search Trigger */}
        <form onSubmit={handleBarcodeSubmit} className="order-3 lg:order-2 w-full lg:flex-1 lg:max-w-md lg:mx-4">
          <div className="relative">
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode or Type SKU & Enter"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-3 py-1.5 bg-zinc-800 border-2 border-[#F27D26] rounded-xs text-xs text-white placeholder:text-gray-400 font-mono focus:ring-2 focus:ring-[#F27D26] focus:outline-hidden"
            />
            <Barcode className="w-4 h-4 text-[#F27D26] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </form>

        {/* Right Status */}
        <div className="order-2 lg:order-3 flex items-center space-x-2 sm:space-x-3 text-xs shrink-0">
          {heldCarts.length > 0 && (
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-zinc-800 border border-[#F27D26] px-2 py-1 rounded-xs text-[#F27D26] font-mono text-[11px]">
              <PauseCircle className="w-3.5 h-3.5" />
              <span>{heldCarts.length} Held</span>
              <button
                onClick={() => handleResumeCart(heldCarts[0].id)}
                className="ml-1 text-[9px] sm:text-[10px] bg-[#F27D26] text-black font-black px-1.5 py-0.2 rounded-xs hover:bg-white transition"
              >
                Resume
              </button>
            </div>
          )}
          <span className="px-2 sm:px-2.5 py-1 bg-zinc-800 text-[#F27D26] border border-[#F27D26] rounded-xs font-mono font-bold text-[10px] uppercase">
            ● ONLINE
          </span>
        </div>
      </div>

      {/* Mobile Tab Switcher for POS */}
      <div className="lg:hidden grid grid-cols-2 bg-zinc-950 border-b border-zinc-800 text-xs font-black uppercase tracking-wider sticky top-0 z-20">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`py-2.5 text-center flex items-center justify-center space-x-1.5 border-b-2 transition ${
            mobileTab === 'catalog'
              ? 'border-[#F27D26] text-[#F27D26] bg-zinc-900'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Catalog & Items</span>
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`py-2.5 text-center flex items-center justify-center space-x-1.5 border-b-2 transition ${
            mobileTab === 'cart'
              ? 'border-[#F27D26] text-[#F27D26] bg-zinc-900'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Bill ({posCart.reduce((s, i) => s + i.quantity, 0)}) • {formatINR(billCalc.grandTotal)}</span>
        </button>
      </div>

      {/* 2. Main POS Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* ============================================================ */}
        {/* LEFT: PRODUCT CATALOG & QUICK PICK (7 COLS) */}
        {/* ============================================================ */}
        <div
          className={`${
            mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-7 p-3 sm:p-4 border-r border-zinc-800 flex-col justify-between overflow-y-auto space-y-3 sm:space-y-4`}
        >
          {/* Category Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-600 text-white shadow'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-white placeholder:text-zinc-500"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddToCart(p)}
                className="bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700 hover:border-orange-500 rounded p-2 sm:p-2.5 cursor-pointer transition flex flex-col justify-between group active:scale-98"
              >
                <div>
                  <img
                    src={p.images[0]}
                    alt=""
                    className="w-full aspect-4/3 object-cover rounded mb-1.5 group-hover:scale-102 transition"
                  />
                  <p className="text-[11px] font-bold text-zinc-100 line-clamp-2 leading-tight">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">SKU: {p.sku}</p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-zinc-700 flex items-center justify-between">
                  <span className="text-xs font-black text-orange-400">{formatINR(p.price)}</span>
                  <span className="text-[10px] text-zinc-400">Stock: {p.stock}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Bottom Bar when items in cart */}
          {posCart.length > 0 && (
            <div className="lg:hidden sticky bottom-0 -mx-3 -mb-3 p-3 bg-zinc-950 border-t-2 border-[#F27D26] flex items-center justify-between shadow-2xl z-20">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                  {posCart.reduce((s, i) => s + i.quantity, 0)} Items Added
                </span>
                <span className="text-base font-black text-[#F27D26] font-mono">
                  {formatINR(billCalc.grandTotal)}
                </span>
              </div>
              <button
                onClick={() => setMobileTab('cart')}
                className="px-4 py-2 bg-[#F27D26] hover:bg-white text-black font-black text-xs uppercase tracking-tighter rounded-xs flex items-center space-x-1.5 transition shadow-md"
              >
                <span>Review Bill & Pay →</span>
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT: POS CART & BILLING CALCULATOR (5 COLS) */}
        {/* ============================================================ */}
        <div
          className={`${
            mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-5 bg-zinc-950 p-3 sm:p-4 flex-col justify-between space-y-3 sm:space-y-4 overflow-y-auto`}
        >
          {/* Mobile Back Button to Catalog */}
          <div className="lg:hidden flex items-center justify-between pb-2 border-b border-zinc-800">
            <button
              onClick={() => setMobileTab('catalog')}
              className="text-xs font-bold text-[#F27D26] hover:underline flex items-center space-x-1"
            >
              <span>← Add More Products</span>
            </button>
            <span className="text-[11px] text-zinc-400 font-mono">
              {posCart.reduce((s, i) => s + i.quantity, 0)} Items in Bill
            </span>
          </div>
          {/* Customer Selection Box */}
          <div className="bg-zinc-900 p-3 rounded border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase text-zinc-400 text-[10px]">
                Customer / B2B Account:
              </span>
              <button
                onClick={() => setIsNewCustomerModal(true)}
                className="text-orange-400 font-bold hover:underline text-[11px] flex items-center space-x-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Add / Select Customer</span>
              </button>
            </div>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-2 bg-zinc-800 rounded text-xs">
                <div>
                  <p className="font-bold text-white">{selectedCustomer.name}</p>
                  <p className="text-[10px] text-zinc-400">
                    Ph: {selectedCustomer.phone} {selectedCustomer.gstin && `| GSTIN: ${selectedCustomer.gstin}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-zinc-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Walk-in Counter Customer (Retail Cash / UPI)</p>
            )}
          </div>

          {/* Cart Items Table */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded overflow-hidden flex flex-col">
            <div className="p-2 bg-zinc-850 text-[10px] font-extrabold text-zinc-400 uppercase grid grid-cols-12 border-b border-zinc-800">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-3 text-center">QTY</span>
              <span className="col-span-3 text-right">TOTAL</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-800 text-xs p-1">
              {posCart.length === 0 ? (
                <div className="py-12 text-center text-zinc-600">
                  <Barcode className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p>Scan barcode or tap items from the left</p>
                </div>
              ) : (
                posCart.map((it) => (
                  <div key={it.product.id} className="py-2 px-2 grid grid-cols-12 items-center">
                    <div className="col-span-6 pr-1">
                      <p className="font-bold text-white truncate">{it.product.name}</p>
                      <p className="text-[10px] text-zinc-400">
                        {formatINR(it.unitPrice)} • GST {it.product.gstRate}%
                      </p>
                    </div>

                    <div className="col-span-3 flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleUpdateQty(it.product.id, -1)}
                        className="w-5 h-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-white text-xs">{it.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(it.product.id, 1)}
                        className="w-5 h-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="col-span-3 text-right flex items-center justify-end space-x-2">
                      <span className="font-extrabold text-orange-400">
                        {formatINR(it.unitPrice * it.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(it.product.id)}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Adjustments & Totals */}
          <div className="bg-zinc-900 p-3 rounded border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Subtotal:</span>
              <span className="font-bold text-white">{formatINR(billCalc.subtotal)}</span>
            </div>

            {/* Discount Selector */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 flex items-center space-x-1">
                <Percent className="w-3 h-3 text-orange-500" />
                <span>Special Discount:</span>
              </span>
              <div className="flex space-x-1">
                {[0, 5, 10, 15].map((d) => (
                  <button
                    key={d}
                    onClick={() => setCartDiscountPercent(d)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      cartDiscountPercent === d
                        ? 'bg-orange-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {d}%
                  </button>
                ))}
              </div>
            </div>

            {billCalc.cartDiscountTotal > 0 && (
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>Discount Applied:</span>
                <span>-{formatINR(billCalc.cartDiscountTotal)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Taxes (CGST + SGST):</span>
              <span>{formatINR(billCalc.cgstTotal + billCalc.sgstTotal)}</span>
            </div>

            <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
              <span className="uppercase text-zinc-300">Total Payable:</span>
              <span className="text-orange-500 text-xl">{formatINR(billCalc.grandTotal)}</span>
            </div>
          </div>

          {/* Payment Method Tabs & Tender */}
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 rounded-xs flex flex-col items-center justify-center font-black uppercase tracking-tighter transition ${
                  paymentMethod === 'cash' ? 'bg-[#F27D26] text-black shadow-xs' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                <Banknote className="w-4 h-4 mb-0.5" />
                <span>CASH</span>
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 rounded-xs flex flex-col items-center justify-center font-black uppercase tracking-tighter transition ${
                  paymentMethod === 'upi' ? 'bg-[#F27D26] text-black shadow-xs' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                <QrCode className="w-4 h-4 mb-0.5" />
                <span>UPI QR</span>
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`py-2 rounded-xs flex flex-col items-center justify-center font-black uppercase tracking-tighter transition ${
                  paymentMethod === 'card' ? 'bg-[#F27D26] text-black shadow-xs' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                <CreditCard className="w-4 h-4 mb-0.5" />
                <span>CARD</span>
              </button>
              <button
                onClick={() => setPaymentMethod('credit')}
                className={`py-2 rounded-xs flex flex-col items-center justify-center font-black uppercase tracking-tighter transition ${
                  paymentMethod === 'credit' ? 'bg-[#F27D26] text-black shadow-xs' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
              >
                <Store className="w-4 h-4 mb-0.5" />
                <span>CREDIT</span>
              </button>
            </div>

            {/* Cash Tendered Input */}
            {paymentMethod === 'cash' && (
              <div className="bg-zinc-900 p-2.5 rounded-xs border-2 border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Cash Received:</span>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder={billCalc.grandTotal.toString()}
                    className="w-24 p-1 bg-zinc-800 border-2 border-zinc-700 rounded-xs text-white font-mono font-bold text-right"
                  />
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Change Due:</span>
                  <span className="text-sm font-black text-[#F27D26] font-mono">
                    {formatINR(changeDue)}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons: Hold, Clear, Print & Checkout */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={handleHoldCart}
                disabled={posCart.length === 0}
                className="py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-gray-300 rounded-xs font-black text-xs uppercase tracking-tighter"
                title="Hold current cart"
              >
                HOLD
              </button>
              <button
                onClick={() => setPosCart([])}
                disabled={posCart.length === 0}
                className="py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-red-400 rounded-xs font-black text-xs uppercase tracking-tighter"
              >
                CLEAR
              </button>
              <button
                id="pos-checkout-btn"
                disabled={posCart.length === 0 || isProcessing}
                onClick={handleCheckout}
                className="col-span-2 py-3 bg-[#F27D26] hover:bg-white disabled:bg-zinc-800 text-black font-black text-xs uppercase tracking-tighter rounded-xs shadow-xs flex items-center justify-center space-x-2 transition"
              >
                <Printer className="w-4 h-4 text-black" />
                <span>{isProcessing ? 'PROCESSING...' : 'PRINT & CHECKOUT'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select / Add Customer Modal */}
      {isNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-md w-full p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-extrabold text-sm uppercase">Select or Register Customer</h3>
              <button onClick={() => setIsNewCustomerModal(false)}>
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Existing Customers Quick Select */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                Existing Customers
              </label>
              <div className="space-y-1 max-h-36 overflow-y-auto divide-y divide-zinc-800 text-xs">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsNewCustomerModal(false);
                    }}
                    className="p-2 hover:bg-zinc-800 rounded cursor-pointer flex justify-between"
                  >
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-[10px] text-zinc-400">Ph: {c.phone}</p>
                    </div>
                    {c.gstin && <span className="text-[10px] text-orange-400 font-mono">GST B2B</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-orange-400 uppercase mb-2">Or Register New Customer</h4>
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Buyer GSTIN (Optional)"
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-white font-mono"
                />
                <button
                  onClick={() => {
                    if (!newCustName || !newCustPhone) return;
                    setSelectedCustomer({
                      id: `cust-${Date.now()}`,
                      name: newCustName,
                      phone: newCustPhone,
                      email: '',
                      gstin: newCustGstin.trim() || undefined,
                      creditBalance: 0,
                      totalOrders: 0,
                      totalSpent: 0,
                    });
                    setIsNewCustomerModal(false);
                  }}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded"
                >
                  Save & Apply to Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
