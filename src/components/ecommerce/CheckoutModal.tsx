import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { CartItem, Coupon, Order, StoreSettings, Address } from '../../types';
import { calculateBilling, formatINR } from '../../services/billingEngine';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  coupon?: Coupon;
  couponDiscount: number;
  storeSettings: StoreSettings;
  onSubmitOrder: (orderPayload: any) => Promise<Order>;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  coupon,
  couponDiscount,
  storeSettings,
  onSubmitOrder,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [deliveryMethod, setDeliveryMethod] = useState<'home_delivery' | 'store_pickup'>('home_delivery');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card' | 'net_banking'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('Rajesh Sharma');
  const [phone, setPhone] = useState('9820198201');
  const [email, setEmail] = useState('rajesh@sharmacaterers.com');
  const [gstin, setGstin] = useState('');
  const [street, setStreet] = useState('Plot 42, Commercial Kitchen Row, Industrial Area');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400053');

  if (!isOpen) return null;

  const isInterState = state.toLowerCase() !== storeSettings.state.toLowerCase();
  const subtotalRaw = items.reduce((s, i) => s + i.totalPrice, 0);
  const shippingCharges =
    deliveryMethod === 'store_pickup'
      ? 0
      : subtotalRaw >= storeSettings.freeShippingThreshold
      ? 0
      : storeSettings.flatShippingFee;

  const billCalc = calculateBilling(
    items.map((it) => ({
      productId: it.product.id,
      productName: it.product.name,
      sku: it.variant?.sku || it.product.sku,
      hsnCode: it.product.hsnCode,
      mrp: it.variant?.mrp || it.product.mrp,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      gstRate: it.product.gstRate,
    })),
    {
      isInterState,
      couponDiscount,
      shippingCharges,
      pricesIncludeGst: true,
    }
  );

  const handlePlaceOrder = async () => {
    if (!customerName || !phone) {
      alert('Please fill customer name and phone');
      return;
    }
    if (deliveryMethod === 'home_delivery' && (!street || !city || !pincode)) {
      alert('Please complete the shipping address');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customer: {
          name: customerName,
          phone,
          email,
          gstin: gstin.trim() || undefined,
        },
        shippingAddress:
          deliveryMethod === 'home_delivery'
            ? {
                id: `addr-${Date.now()}`,
                fullName: customerName,
                phone,
                street,
                city,
                state,
                pincode,
              }
            : undefined,
        deliveryMethod,
        items: items.map((it) => ({
          productId: it.product.id,
          productName: it.product.name,
          sku: it.variant?.sku || it.product.sku,
          image: it.product.images[0],
          hsnCode: it.product.hsnCode,
          mrp: it.variant?.mrp || it.product.mrp,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          gstRate: it.product.gstRate,
        })),
        couponCode: coupon?.code,
        paymentMethod,
        isInterState,
      };

      const createdOrder = await onSubmitOrder(payload);
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      alert(err.message || 'Error placing order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-zinc-950 text-white border-b border-zinc-800 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
            <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider">
              KITCHEN PRO EXPRESS CHECKOUT
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress header */}
        <div className="bg-zinc-100 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-zinc-200 flex items-center justify-between text-[11px] sm:text-xs font-bold shrink-0 overflow-x-auto no-scrollbar">
          <div className={`flex items-center space-x-1.5 sm:space-x-2 shrink-0 ${step >= 1 ? 'text-orange-600' : 'text-zinc-400'}`}>
            <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] shrink-0">
              1
            </span>
            <span>Customer <span className="hidden sm:inline">& Address</span></span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0 mx-1" />
          <div className={`flex items-center space-x-1.5 sm:space-x-2 shrink-0 ${step >= 2 ? 'text-orange-600' : 'text-zinc-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-zinc-300 text-zinc-700'}`}>
              2
            </span>
            <span>Delivery <span className="hidden sm:inline">Method</span></span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0 mx-1" />
          <div className={`flex items-center space-x-1.5 sm:space-x-2 shrink-0 ${step >= 3 ? 'text-orange-600' : 'text-zinc-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 3 ? 'bg-orange-600 text-white' : 'bg-zinc-300 text-zinc-700'}`}>
              3
            </span>
            <span>Payment <span className="hidden sm:inline">& Invoicing</span></span>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* LEFT: STEP FORMS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: CUSTOMER & ADDRESS */}
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                  1. Customer & GST Invoicing Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                      placeholder="e.g. Rajesh Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      Email (for GST Invoice PDF)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                      placeholder="e.g. contact@business.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      Buyer GSTIN (Optional B2B)
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-bold uppercase"
                      placeholder="27AAACK1234F1Z8"
                    />
                  </div>
                </div>

                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider pt-2 border-t border-zinc-200">
                  Shipping Address
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                    Street Address / Commercial Unit
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                    placeholder="Shop/Flat No., Building, Area"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider rounded transition"
                  >
                    CONTINUE TO DELIVERY SELECTION →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DELIVERY METHOD */}
            {step === 2 && (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                  2. Choose Fulfillment Method
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Home Delivery */}
                  <div
                    onClick={() => setDeliveryMethod('home_delivery')}
                    className={`p-4 border rounded-md cursor-pointer transition ${
                      deliveryMethod === 'home_delivery'
                        ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                        : 'border-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Truck className="w-5 h-5 text-orange-600" />
                      <span className="font-extrabold text-xs text-zinc-900 uppercase">
                        EXPRESS HOME DELIVERY
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      Dispatched with insured courier directly to your door in 2-4 business days.
                    </p>
                    <span className="inline-block mt-2 font-bold text-xs text-zinc-900">
                      {shippingCharges === 0 ? 'FREE Shipping' : formatINR(shippingCharges)}
                    </span>
                  </div>

                  {/* Store Pickup */}
                  <div
                    onClick={() => setDeliveryMethod('store_pickup')}
                    className={`p-4 border rounded-md cursor-pointer transition ${
                      deliveryMethod === 'store_pickup'
                        ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                        : 'border-zinc-300 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Store className="w-5 h-5 text-orange-600" />
                      <span className="font-extrabold text-xs text-zinc-900 uppercase">
                        STORE COUNTER PICKUP
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      Pickup instantly from Mumbai Central Warehouse & Counter. Zero freight charge.
                    </p>
                    <span className="inline-block mt-2 font-bold text-xs text-emerald-700">
                      FREE (Ready in 2 Hours)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-extrabold uppercase tracking-wider rounded"
                  >
                    PROCEED TO PAYMENT →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {step === 3 && (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                  3. Select Payment Gateway
                </h4>

                <div className="space-y-3">
                  {/* UPI */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-md cursor-pointer transition ${
                      paymentMethod === 'upi'
                        ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                        : 'border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <QrCode className="w-5 h-5 text-orange-600 shrink-0" />
                      <div>
                        <span className="font-bold text-xs text-zinc-900 block">UPI / QR Code</span>
                        <span className="text-[11px] text-zinc-500">GPay, PhonePe, Paytm & BHIM UPI</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shrink-0">
                      FASTEST
                    </span>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-md cursor-pointer transition ${
                      paymentMethod === 'cod'
                        ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                        : 'border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <Banknote className="w-5 h-5 text-zinc-700 shrink-0" />
                      <div>
                        <span className="font-bold text-xs text-zinc-900 block">Cash on Delivery</span>
                        <span className="text-[11px] text-zinc-500">Pay cash or UPI at the time of delivery</span>
                      </div>
                    </div>
                  </label>

                  {/* Cards */}
                  <label
                    className={`flex items-center justify-between p-3.5 border rounded-md cursor-pointer transition ${
                      paymentMethod === 'card'
                        ? 'border-orange-600 bg-orange-50/40 shadow-xs'
                        : 'border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <CreditCard className="w-5 h-5 text-zinc-700 shrink-0" />
                      <div>
                        <span className="font-bold text-xs text-zinc-900 block">Credit / Debit Card</span>
                        <span className="text-[11px] text-zinc-500">Visa, MasterCard, RuPay & Amex</span>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold rounded"
                  >
                    ← Back
                  </button>
                  <button
                    id="btn-confirm-place-order"
                    disabled={isSubmitting}
                    onClick={handlePlaceOrder}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold uppercase tracking-wider rounded shadow transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'GENERATING TAX INVOICE & PLACING ORDER...' : `PAY & CONFIRM ORDER (${formatINR(billCalc.grandTotal)})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY CARD (5 COLS) */}
          <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-md p-5 space-y-4">
            <h4 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider border-b border-zinc-200 pb-2">
              Order Summary ({items.length} Products)
            </h4>

            {/* Compact items list */}
            <div className="divide-y divide-zinc-200 max-h-56 overflow-y-auto pr-1 text-xs">
              {items.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <img src={it.product.images[0]} alt="" className="w-9 h-9 object-cover rounded border" />
                    <div className="truncate">
                      <p className="font-bold text-zinc-900 truncate">{it.product.name}</p>
                      <p className="text-[10px] text-zinc-500">Qty: {it.quantity} × {formatINR(it.unitPrice)}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-zinc-950 shrink-0">{formatINR(it.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-zinc-600 pt-3 border-t border-zinc-200">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>{formatINR(billCalc.subtotal)}</span>
              </div>
              {billCalc.couponDiscountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount:</span>
                  <span>-{formatINR(billCalc.couponDiscountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{shippingCharges === 0 ? 'FREE' : formatINR(shippingCharges)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Taxable Base Value:</span>
                <span>{formatINR(billCalc.taxableSubtotal)}</span>
              </div>
              {isInterState ? (
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>IGST Total:</span>
                  <span>{formatINR(billCalc.igstTotal)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>CGST + SGST (Combined):</span>
                  <span>{formatINR(billCalc.cgstTotal + billCalc.sgstTotal)}</span>
                </div>
              )}
              {billCalc.roundOff !== 0 && (
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Round off:</span>
                  <span>{billCalc.roundOff > 0 ? `+${billCalc.roundOff}` : billCalc.roundOff}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-zinc-950 pt-2 border-t border-zinc-300">
                <span>NET PAYABLE:</span>
                <span className="text-orange-600">{formatINR(billCalc.grandTotal)}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-zinc-200 rounded text-[11px] text-zinc-600 space-y-1">
              <p className="font-bold text-zinc-900">Tax Invoicing Guarantee:</p>
              <p>An official GST compliant Tax Invoice will be generated instantly upon order placement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
