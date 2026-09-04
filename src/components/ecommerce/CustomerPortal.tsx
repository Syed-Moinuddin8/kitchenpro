import React, { useState } from 'react';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  Printer,
  Truck,
  User as UserIcon,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Clock,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import { Customer, Order, Product, StoreSettings } from '../../types';
import { formatINR } from '../../services/billingEngine';

interface CustomerPortalProps {
  orders: Order[];
  customers: Customer[];
  allProducts: Product[];
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewInvoice: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
  storeSettings: StoreSettings;
  onBackToShop: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  customers,
  allProducts,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onViewInvoice,
  onTrackOrder,
  storeSettings,
  onBackToShop,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'credit' | 'profile'>('orders');

  // Active customer context simulation (e.g. Rajesh Sharma)
  const currentCustomer = customers[0] || {
    id: 'cust-201',
    name: 'Rajesh Sharma',
    phone: '9820198201',
    email: 'rajesh@sharmacaterers.com',
    companyName: 'Sharma Commercial Catering LLP',
    gstin: '27AABCS1429B1Z2',
    creditBalance: 12500,
    creditLimit: 50000,
    totalOrders: 14,
    totalSpent: 184500,
    addresses: [],
  };

  const customerOrders = orders.filter(
    (o) => o.customer.phone === currentCustomer.phone || o.customer.name.includes(currentCustomer.name.split(' ')[0])
  );

  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="bg-zinc-100 min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-8">
        {/* Profile Banner */}
        <div className="bg-zinc-950 text-white rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow shrink-0">
              {currentCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:space-x-2">
                <h1 className="text-lg sm:text-xl font-black">{currentCustomer.name}</h1>
                {currentCustomer.companyName && (
                  <span className="px-2 py-0.5 bg-zinc-800 text-orange-400 text-[10px] font-bold rounded">
                    B2B VERIFIED
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Phone: {currentCustomer.phone} • Email: {currentCustomer.email}
              </p>
              {currentCustomer.gstin && (
                <p className="text-xs text-orange-400 font-mono font-semibold">
                  Buyer GSTIN: {currentCustomer.gstin}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 text-xs">
            <div className="flex-1 sm:flex-initial bg-zinc-900 p-2.5 sm:p-3 rounded border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Total Purchases</span>
              <span className="text-sm font-black text-white">{formatINR(currentCustomer.totalSpent)}</span>
            </div>
            <div className="flex-1 sm:flex-initial bg-zinc-900 p-2.5 sm:p-3 rounded border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 uppercase block font-bold">Credit Balance</span>
              <span className={`text-sm font-black ${currentCustomer.creditBalance > 0 ? 'text-orange-500' : 'text-emerald-400'}`}>
                {formatINR(currentCustomer.creditBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-zinc-200 mb-6 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-xs uppercase tracking-wider rounded-t-md transition shrink-0 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-white text-orange-600 border-t-2 border-orange-600 shadow-xs'
                : 'text-zinc-600 hover:text-black bg-zinc-200/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-xs uppercase tracking-wider rounded-t-md transition shrink-0 whitespace-nowrap ${
              activeTab === 'wishlist'
                ? 'bg-white text-orange-600 border-t-2 border-orange-600 shadow-xs'
                : 'text-zinc-600 hover:text-black bg-zinc-200/60'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('credit')}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 font-bold text-xs uppercase tracking-wider rounded-t-md transition shrink-0 whitespace-nowrap ${
              activeTab === 'credit'
                ? 'bg-white text-orange-600 border-t-2 border-orange-600 shadow-xs'
                : 'text-zinc-600 hover:text-black bg-zinc-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Credit Ledger & Invoices</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ORDERS */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {customerOrders.length === 0 ? (
              <div className="bg-white p-12 text-center rounded border border-zinc-200">
                <Package className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                <p className="font-bold text-zinc-800 text-sm">No orders found</p>
                <button
                  onClick={onBackToShop}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              customerOrders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-lg border border-zinc-200 shadow-2xs overflow-hidden">
                  {/* Order Top Bar */}
                  <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Order Placed</span>
                        <span className="font-semibold text-zinc-800">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Amount</span>
                        <span className="font-extrabold text-zinc-950">{formatINR(ord.grandTotal)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold block">Invoice No</span>
                        <span className="font-mono font-bold text-zinc-900">{ord.invoiceNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 rounded text-[11px] font-extrabold uppercase ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        ● {ord.orderStatus.replace(/_/g, ' ')}
                      </span>

                      <button
                        onClick={() => onViewInvoice(ord)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded font-bold transition text-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Tax Invoice</span>
                      </button>

                      <button
                        onClick={() => onTrackOrder(ord)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold transition text-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 divide-y divide-zinc-100">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <img src={it.image} alt="" className="w-12 h-12 object-cover rounded border" />
                          <div>
                            <p className="font-bold text-zinc-900">{it.productName}</p>
                            <p className="text-[11px] text-zinc-500">
                              Qty: {it.quantity} • Unit Price: {formatINR(it.unitPrice)} • GST: {it.gstRate}%
                            </p>
                          </div>
                        </div>
                        <span className="font-extrabold text-zinc-950">{formatINR(it.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: WISHLIST */}
        {/* ============================================================ */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded border border-zinc-200">
                <Heart className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                <p className="font-bold text-zinc-800 text-sm">Your wishlist is empty</p>
                <button
                  onClick={onBackToShop}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded border border-zinc-200 p-3 shadow-2xs flex flex-col justify-between">
                    <div>
                      <img src={p.images[0]} alt="" className="w-full aspect-4/3 object-cover rounded mb-2" />
                      <p className="font-bold text-xs text-zinc-900 line-clamp-2">{p.name}</p>
                      <p className="text-sm font-black text-orange-600 mt-1">{formatINR(p.price)}</p>
                    </div>

                    <div className="mt-3 flex space-x-2 pt-2 border-t border-zinc-100">
                      <button
                        onClick={() => onAddToCart(p, 1)}
                        className="flex-1 py-2 bg-zinc-950 hover:bg-orange-600 text-white text-xs font-bold rounded transition"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => onToggleWishlist(p)}
                        className="p-2 text-zinc-400 hover:text-red-600 border rounded"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CREDIT LEDGER & B2B INVOICES */}
        {/* ============================================================ */}
        {activeTab === 'credit' && (
          <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-zinc-200">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-900">
                  B2B Credit Line & Payment Statement
                </h3>
                <p className="text-xs text-zinc-500">Commercial credit account ledger</p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="p-3 bg-zinc-50 border rounded">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold">Approved Credit Limit</span>
                  <span className="font-bold text-zinc-800">{formatINR(currentCustomer.creditLimit || 50000)}</span>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-[10px] text-orange-800 uppercase block font-bold">Current Outstanding</span>
                  <span className="font-extrabold text-orange-600">{formatINR(currentCustomer.creditBalance)}</span>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div>
              <h4 className="font-bold text-xs text-zinc-900 uppercase mb-3">All Invoices & Billed Transactions</h4>
              <div className="border rounded overflow-x-auto">
                <table className="w-full min-w-[560px] text-xs text-left">
                  <thead className="bg-zinc-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Invoice #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Payment Mode</th>
                      <th className="p-2.5 text-right">Invoice Amount</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {customerOrders.map((ord, i) => (
                      <tr key={i} className="hover:bg-zinc-50">
                        <td className="p-2.5 font-mono font-bold text-zinc-900">{ord.invoiceNumber}</td>
                        <td className="p-2.5 text-zinc-600">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-2.5 capitalize">{ord.type} Sale</td>
                        <td className="p-2.5 uppercase font-semibold">{ord.paymentMethod}</td>
                        <td className="p-2.5 text-right font-extrabold">{formatINR(ord.grandTotal)}</td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => onViewInvoice(ord)}
                            className="px-2.5 py-1 bg-zinc-900 text-white font-bold text-[11px] rounded hover:bg-orange-600 transition"
                          >
                            Print A4 Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
