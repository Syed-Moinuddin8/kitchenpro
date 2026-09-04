import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ShoppingBag,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { CartItem, Coupon, StoreSettings } from '../../types';
import { formatINR, calculateBilling } from '../../services/billingEngine';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, variantId?: string) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  onProceedCheckout: () => void;
  appliedCoupon?: Coupon;
  couponDiscount: number;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onRemoveCoupon: () => void;
  storeSettings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  appliedCoupon,
  couponDiscount,
  onApplyCoupon,
  onRemoveCoupon,
  storeSettings,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  // Run billing calculation
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
      couponDiscount,
      shippingCharges:
        items.reduce((s, i) => s + i.totalPrice, 0) >= storeSettings.freeShippingThreshold ? 0 : storeSettings.flatShippingFee,
      pricesIncludeGst: true,
    }
  );

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    setIsApplying(true);
    const success = await onApplyCoupon(couponInput.trim());
    setIsApplying(false);
    if (success) {
      setCouponInput('');
    } else {
      setCouponError('Invalid or ineligible coupon code');
    }
  };

  const amountForFreeShipping = Math.max(0, storeSettings.freeShippingThreshold - billCalc.subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* 1. Drawer Header */}
          <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                YOUR CART ({items.reduce((sum, i) => sum + i.quantity, 0)} ITEMS)
              </h2>
            </div>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-orange-50 p-3 border-b border-orange-200 text-xs">
            {amountForFreeShipping > 0 ? (
              <div className="flex items-center space-x-2 text-zinc-800">
                <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  Add <b>{formatINR(amountForFreeShipping)}</b> more to qualify for <b>FREE SHIPPING</b>!
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🎉 Congratulations! You have unlocked FREE Express Delivery!</span>
              </div>
            )}
          </div>

          {/* 2. Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">Your cart is currently empty</p>
                  <p className="text-xs text-zinc-500 mt-1">Explore our commercial appliances and cookware catalog.</p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-orange-600 text-white text-xs font-bold rounded-md uppercase tracking-wider hover:bg-orange-700"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="divide-y divide-zinc-200">
                {items.map((item, idx) => {
                  const variantId = item.variant?.id;
                  const currentStock = item.variant ? item.variant.stock : item.product.stock;

                  return (
                    <div key={`${item.product.id}-${variantId || 'base'}`} className="py-3.5 flex items-start space-x-3">
                      {/* Thumbnail */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded border border-zinc-200 shrink-0"
                      />

                      {/* Info & Adjusters */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-zinc-900 line-clamp-1">{item.product.name}</h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id, variantId)}
                            className="text-zinc-400 hover:text-red-600 ml-2"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.variant && (
                          <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            Model: {item.variant.name}
                          </span>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-zinc-300 rounded bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1, variantId)}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-zinc-100 text-zinc-700"
                            >
                              -
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-zinc-900">{item.quantity}</span>
                            <button
                              disabled={item.quantity >= currentStock}
                              onClick={() => onUpdateQuantity(item.product.id, 1, variantId)}
                              className="px-2 py-0.5 text-xs font-bold hover:bg-zinc-100 text-zinc-700 disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-zinc-950">
                              {formatINR(item.totalPrice)}
                            </span>
                            <span className="block text-[10px] text-zinc-400">
                              {formatINR(item.unitPrice)} each
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 space-y-3">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                    <div className="flex items-center space-x-1.5 text-emerald-800">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        Applied: <b>{appliedCoupon.code}</b> (-{formatINR(billCalc.couponDiscountTotal)})
                      </span>
                    </div>
                    <button onClick={onRemoveCoupon} className="text-red-600 font-bold hover:underline text-[11px]">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Coupon (e.g. KITCHENPRO10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-7 pr-2 py-1.5 bg-white border border-zinc-300 rounded text-xs uppercase font-bold focus:ring-1 focus:ring-orange-500"
                      />
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[10px] text-red-600 mt-1">{couponError}</p>}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-1 text-xs text-zinc-600 pt-2 border-t border-zinc-200">
                <div className="flex justify-between">
                  <span>Subtotal (Incl. GST):</span>
                  <span>{formatINR(billCalc.subtotal)}</span>
                </div>
                {billCalc.couponDiscountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount:</span>
                    <span>-{formatINR(billCalc.couponDiscountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>
                    {billCalc.shippingCharges === 0 ? (
                      <b className="text-emerald-700 uppercase">FREE</b>
                    ) : (
                      formatINR(billCalc.shippingCharges)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>Estimated GST (18% / 12%):</span>
                  <span>{formatINR(billCalc.gstTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-2 border-t border-zinc-300">
                  <span>GRAND TOTAL:</span>
                  <span className="text-orange-600">{formatINR(billCalc.grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="btn-drawer-checkout"
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-md shadow transition"
              >
                <span>PROCEED TO SECURE CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[10px] text-zinc-400">
                🔒 100% Secure Checkout with Instant Tax Invoice Generation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
