import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Store,
  PanelLeftClose,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Product, Order, Customer, StoreSettings, DashboardSummary } from '../../types';
import { formatINR } from '../../services/billingEngine';
import { KitchenProLogo } from '../common/KitchenProLogo';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  storeSettings: StoreSettings;
  onUpdateProductStock: (productId: string, newStock: number) => Promise<void>;
  onCreateProduct: (productData: Partial<Product>) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus'], notes?: string) => Promise<void>;
  onUpdateSettings: (newSettings: StoreSettings) => Promise<void>;
  onResetDemoData?: () => void;
  onPrintInvoice: (order: Order) => void;
  onBackToShop: () => void;
  onOpenPos: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  customers,
  storeSettings,
  onUpdateProductStock,
  onCreateProduct,
  onUpdateOrderStatus,
  onUpdateSettings,
  onResetDemoData,
  onPrintInvoice,
  onBackToShop,
  onOpenPos,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'customers' | 'settings'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Store Settings Form State
  const [formSettings, setFormSettings] = useState<StoreSettings>(storeSettings);

  // Stock Adjustment State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockInputVal, setStockInputVal] = useState<number>(0);

  // New Product Modal State
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [npName, setNpName] = useState('');
  const [npSku, setNpSku] = useState('');
  const [npCategory, setNpCategory] = useState('cat-appliances');
  const [npPrice, setNpPrice] = useState(4999);
  const [npMrp, setNpMrp] = useState(6999);
  const [npStock, setNpStock] = useState(20);
  const [npGst, setNpGst] = useState(18);
  const [npHsn, setNpHsn] = useState('85094010');
  const [npBrand, setNpBrand] = useState('Kitchen Pro');

  // Dashboard Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.grandTotal : 0), 0);
  const totalGstCollected = orders.reduce(
    (sum, o) =>
      sum +
      (o.orderStatus !== 'cancelled'
        ? ((o as any).gstTotal ?? ((o.cgstTotal || 0) + (o.sgstTotal || 0) + (o.igstTotal || 0)))
        : 0),
    0
  );
  const posSales = orders.filter((o) => o.type === 'pos');
  const webSales = orders.filter((o) => o.type === 'online');
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockLevel);

  // Filtered Inventory
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q);
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return o.orderNumber.toLowerCase().includes(q) || o.invoiceNumber.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStockSave = async (productId: string) => {
    await onUpdateProductStock(productId, Number(stockInputVal));
    setEditingStockId(null);
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npName || !npSku) return;

    await onCreateProduct({
      name: npName,
      sku: npSku,
      barcode: `890${Date.now().toString().slice(-10)}`,
      categoryId: npCategory,
      categoryName: npCategory.includes('appliance') ? 'Kitchen Appliances' : 'Commercial Cookware',
      brand: npBrand,
      mrp: Number(npMrp),
      price: Number(npPrice),
      costPrice: Number(npPrice) * 0.7,
      gstRate: Number(npGst) as 12 | 18,
      hsnCode: npHsn,
      stock: Number(npStock),
      minStockLevel: 5,
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'],
      description: 'Commercial grade kitchen appliance manufactured with highest quality standards.',
      features: ['Heavy-duty build', '100% Copper Motor', 'ISI Approved'],
      specifications: [{ key: 'Warranty', value: '2 Years' }],
      rating: 4.8,
      reviewCount: 12,
      discountPercentage: Math.round(((npMrp - npPrice) / npMrp) * 100),
      featured: true,
      newArrival: true,
      warranty: '2 Years Warranty',
      returnPolicy: '7 Days Return',
    });

    setIsNewProductOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen no-print flex flex-col font-sans">
      {/* 1. Admin Top Nav */}
      <header className="bg-[#141414] text-white px-3 sm:px-6 py-2.5 sm:py-3 border-b-4 border-[#F27D26] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 shadow-md">
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <button
            id="btn-toggle-admin-sidebar"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-1.5 sm:p-2 bg-zinc-900 hover:bg-[#F27D26] text-gray-200 hover:text-black rounded-xs border border-zinc-700 transition flex items-center space-x-1.5 cursor-pointer group shadow-xs"
            title={isSidebarOpen ? 'Close Navigation Bar' : 'Open Navigation Bar'}
            aria-label={isSidebarOpen ? 'Close Navigation Bar' : 'Open Navigation Bar'}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-[#F27D26] group-hover:text-black transition-transform" />
            ) : (
              <PanelLeft className="w-4 h-4 text-[#F27D26] group-hover:text-black transition-transform" />
            )}
            <span className="text-xs font-black uppercase tracking-tighter hidden sm:inline">
              {isSidebarOpen ? 'Hide Nav' : 'Show Nav'}
            </span>
          </button>

          <div className="p-1 shrink-0">
            <KitchenProLogo size="sm" lightMode={true} />
          </div>
          <div>
            <span className="font-mono font-black text-xs tracking-wider text-[#F27D26] uppercase">
              ERP ADMIN
            </span>
            <span className="hidden md:block text-[10px] font-mono text-gray-400">
              GSTIN: {storeSettings.gstin} | Hub: {storeSettings.city}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 text-xs shrink-0">
          <button
            onClick={onOpenPos}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#F27D26] hover:bg-white text-black font-black rounded-xs flex items-center space-x-1 uppercase tracking-tighter transition shadow-xs text-[11px] sm:text-xs"
          >
            <Store className="w-3.5 h-3.5" />
            <span>POS Counter</span>
          </button>
          <button
            onClick={onBackToShop}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-200 font-bold rounded-xs uppercase tracking-tighter transition text-[11px] sm:text-xs"
          >
            Storefront →
          </button>
        </div>
      </header>

      {/* Floating Toggle Button when Sidebar is Collapsed */}
      {!isSidebarOpen && (
        <button
          id="btn-reopen-sidebar-floating"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-0 top-24 z-40 bg-[#141414] hover:bg-[#F27D26] text-[#F27D26] hover:text-black py-3 px-2 rounded-r-xs border border-l-0 border-zinc-700 shadow-xl transition flex flex-col items-center group cursor-pointer"
          title="Open Navigation Menu"
        >
          <PanelLeft className="w-4 h-4 text-[#F27D26] group-hover:text-black mb-1 transition-transform group-hover:scale-110" />
          <span className="text-[9px] font-black uppercase tracking-widest [writing-mode:vertical-rl] text-gray-300 group-hover:text-black">
            Open Menu
          </span>
        </button>
      )}

      {/* 2. Main Admin Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Sidebar Nav */}
        <aside
          id="admin-sidebar"
          className={`bg-[#141414] text-gray-300 border-r border-zinc-800 transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col justify-between ${
            isSidebarOpen
              ? 'w-full md:w-64 p-4 opacity-100'
              : 'w-0 p-0 border-r-0 opacity-0 overflow-hidden pointer-events-none hidden md:flex'
          }`}
          aria-hidden={!isSidebarOpen}
        >
          <div className="w-56 min-w-[224px] space-y-1.5">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></span>
                <span>ERP Navigation</span>
              </span>
              <button
                id="btn-sidebar-collapse"
                onClick={() => setIsSidebarOpen(false)}
                className="px-2 py-1 rounded-xs text-gray-400 hover:text-black hover:bg-[#F27D26] transition flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                title="Close Navigation Bar"
                aria-label="Close Navigation Bar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>

            <button
              onClick={() => {
                setActiveTab('overview');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xs text-xs font-black uppercase tracking-tighter transition ${
                activeTab === 'overview' ? 'bg-[#F27D26] text-black shadow-xs' : 'hover:bg-zinc-800 hover:text-[#F27D26]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('inventory');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-xs font-black uppercase tracking-tighter transition ${
                activeTab === 'inventory' ? 'bg-[#F27D26] text-black shadow-xs' : 'hover:bg-zinc-800 hover:text-[#F27D26]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Package className="w-4 h-4" />
                <span>Inventory & Stock</span>
              </div>
              {lowStockProducts.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#F27D26] text-black text-[10px] font-mono font-black rounded-xs">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-xs font-black uppercase tracking-tighter transition ${
                activeTab === 'orders' ? 'bg-[#F27D26] text-black shadow-xs' : 'hover:bg-zinc-800 hover:text-[#F27D26]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShoppingCart className="w-4 h-4" />
                <span>Orders & POS Bills</span>
              </div>
              <span className="text-gray-400 font-mono text-[10px]">{orders.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('customers');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xs text-xs font-black uppercase tracking-tighter transition ${
                activeTab === 'customers' ? 'bg-[#F27D26] text-black shadow-xs' : 'hover:bg-zinc-800 hover:text-[#F27D26]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>B2B & Retail Customers</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('settings');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xs text-xs font-black uppercase tracking-tighter transition ${
                activeTab === 'settings' ? 'bg-[#F27D26] text-black shadow-xs' : 'hover:bg-zinc-800 hover:text-[#F27D26]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store Configuration</span>
            </button>

            <div className="pt-4 mt-4 border-t border-zinc-800">
              <span className="px-3.5 text-[10px] font-mono uppercase text-gray-500 font-bold block mb-2">
                Counter Operations
              </span>
              <button
                onClick={onOpenPos}
                className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xs text-xs font-black uppercase tracking-tighter bg-[#F27D26] text-black hover:bg-white transition shadow-xs"
              >
                <Store className="w-4 h-4 text-black" />
                <span>POS Billing Counter →</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto">
          {/* ============================================================ */}
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {/* ============================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-zinc-900 uppercase">
                Operations & Financial Overview
              </h2>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Total Gross Revenue
                  </span>
                  <p className="text-2xl font-black text-zinc-950 mt-1">{formatINR(totalRevenue)}</p>
                  <span className="text-[10px] text-emerald-700 font-bold mt-1 inline-block">
                    ↑ Combined POS + E-Commerce
                  </span>
                </div>

                <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Total GST Liability
                  </span>
                  <p className="text-2xl font-black text-orange-600 mt-1">{formatINR(totalGstCollected)}</p>
                  <span className="text-[10px] text-zinc-500 mt-1 inline-block">
                    Rule 46 Tax Collected
                  </span>
                </div>

                <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Total Invoices & Orders
                  </span>
                  <p className="text-2xl font-black text-zinc-950 mt-1">{orders.length}</p>
                  <span className="text-[10px] text-zinc-500 mt-1 inline-block">
                    {posSales.length} POS Counter • {webSales.length} Online
                  </span>
                </div>

                <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Inventory Stock Alerts
                  </span>
                  <p className="text-2xl font-black text-amber-600 mt-1">{lowStockProducts.length}</p>
                  <span className="text-[10px] text-amber-700 font-bold mt-1 inline-block">
                    Products need re-order
                  </span>
                </div>
              </div>

              {/* Low Stock Warning Banner */}
              {lowStockProducts.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-amber-900">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold">Attention Required:</span> {lowStockProducts.length} items are running below minimum safety stock levels!
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded"
                  >
                    Manage Inventory
                  </button>
                </div>
              )}

              {/* Recent Orders List */}
              <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-zinc-900 uppercase">Recent Transactions</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 text-zinc-600 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2.5">Invoice / Order</th>
                        <th className="p-2.5">Customer</th>
                        <th className="p-2.5">Channel</th>
                        <th className="p-2.5">Payment</th>
                        <th className="p-2.5 text-right">Grand Total</th>
                        <th className="p-2.5 text-center">Status</th>
                        <th className="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-50">
                          <td className="p-2.5 font-mono font-bold text-zinc-900">{ord.invoiceNumber}</td>
                          <td className="p-2.5 font-medium">{ord.customer.name}</td>
                          <td className="p-2.5 uppercase font-semibold text-[10px]">
                            {ord.type === 'pos' ? 'POS Counter' : 'Online Store'}
                          </td>
                          <td className="p-2.5 uppercase text-zinc-600">{ord.paymentMethod}</td>
                          <td className="p-2.5 text-right font-extrabold text-zinc-950">{formatINR(ord.grandTotal)}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 uppercase">
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => onPrintInvoice(ord)}
                              className="p-1 text-zinc-600 hover:text-orange-600"
                              title="Print Tax Invoice"
                            >
                              <Printer className="w-4 h-4" />
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

          {/* ============================================================ */}
          {/* TAB 2: INVENTORY & STOCK */}
          {/* ============================================================ */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 uppercase">Inventory Management</h2>
                  <p className="text-xs text-zinc-500">Warehouse stock quantities, SKUs, and GST tax slabs</p>
                </div>
                <button
                  onClick={() => setIsNewProductOpen(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Search filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search product name, SKU or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded text-xs font-semibold focus:ring-1 focus:ring-orange-500"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Product / SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">GST Slab</th>
                      <th className="p-3 text-right">Selling Price</th>
                      <th className="p-3 text-center">Stock Level</th>
                      <th className="p-3 text-center">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredProducts.map((p) => {
                      const isLow = p.stock <= p.minStockLevel;
                      return (
                        <tr key={p.id} className={`hover:bg-zinc-50 ${isLow ? 'bg-amber-50/40' : ''}`}>
                          <td className="p-3">
                            <div className="flex items-center space-x-3">
                              <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded border" />
                              <div>
                                <p className="font-bold text-zinc-900 line-clamp-1">{p.name}</p>
                                <p className="text-[10px] text-zinc-500 font-mono">SKU: {p.sku} | Barcode: {p.barcode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-medium text-zinc-700">{p.categoryName}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-zinc-200 text-zinc-800 rounded font-bold text-[10px]">
                              {p.gstRate}%
                            </span>
                          </td>
                          <td className="p-3 text-right font-black text-zinc-900">{formatINR(p.price)}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                p.stock <= 0
                                  ? 'bg-red-100 text-red-800'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {editingStockId === p.id ? (
                              <div className="flex items-center justify-center space-x-1">
                                <input
                                  type="number"
                                  value={stockInputVal}
                                  onChange={(e) => setStockInputVal(Number(e.target.value))}
                                  className="w-16 p-1 border rounded text-center text-xs font-bold"
                                />
                                <button
                                  onClick={() => handleStockSave(p.id)}
                                  className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingStockId(null)}
                                  className="px-2 py-1 bg-zinc-300 text-zinc-700 rounded text-[10px]"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingStockId(p.id);
                                  setStockInputVal(p.stock);
                                }}
                                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-bold text-[11px]"
                              >
                                Edit Stock
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: ORDERS & POS BILLS */}
          {/* ============================================================ */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-zinc-900 uppercase">Order Fulfillment & POS Invoices</h2>
                  <p className="text-xs text-zinc-500">Live order status dispatching and thermal/A4 printing</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search Order Number, Invoice # or Customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded text-xs font-semibold focus:ring-1 focus:ring-orange-500"
                  />
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white border border-zinc-300 text-xs font-bold rounded px-3 py-2"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="new">New</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Order / Date</th>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Customer & Channel</th>
                      <th className="p-3">Items Count</th>
                      <th className="p-3 text-right">Grand Total</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Update Progress</th>
                      <th className="p-3 text-center">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-50">
                        <td className="p-3">
                          <p className="font-bold text-zinc-900">{ord.orderNumber}</p>
                          <p className="text-[10px] text-zinc-400">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </td>
                        <td className="p-3 font-mono font-bold text-orange-700">{ord.invoiceNumber}</td>
                        <td className="p-3">
                          <p className="font-bold text-zinc-900">{ord.customer.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {ord.customer.phone} • <span className="uppercase font-semibold">{ord.type}</span>
                          </p>
                        </td>
                        <td className="p-3 font-semibold">{ord.items.length} Products</td>
                        <td className="p-3 text-right font-black text-zinc-950">{formatINR(ord.grandTotal)}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                            className="p-1 bg-zinc-100 border border-zinc-300 rounded text-[11px] font-bold"
                          >
                            <option value="new">New</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onPrintInvoice(ord)}
                            className="px-2.5 py-1 bg-zinc-900 hover:bg-black text-white rounded font-bold text-[11px] flex items-center space-x-1 mx-auto"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: CUSTOMERS */}
          {/* ============================================================ */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-zinc-900 uppercase">Registered Customers & B2B Accounts</h2>
              <div className="bg-white rounded-lg border border-zinc-200 shadow-2xs overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-900 text-white text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Customer Name</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Company / GSTIN</th>
                      <th className="p-3 text-right">Total Purchases</th>
                      <th className="p-3 text-right">Credit Balance</th>
                      <th className="p-3 text-center">Orders Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50">
                        <td className="p-3 font-bold text-zinc-900">{c.name}</td>
                        <td className="p-3 text-zinc-600">{c.phone}</td>
                        <td className="p-3">
                          {c.companyName ? (
                            <div>
                              <p className="font-semibold text-zinc-800">{c.companyName}</p>
                              <p className="text-[10px] font-mono text-orange-600">{c.gstin}</p>
                            </div>
                          ) : (
                            <span className="text-zinc-400">Retail Consumer</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-black">{formatINR(c.totalSpent)}</td>
                        <td className="p-3 text-right font-bold text-orange-600">{formatINR(c.creditBalance)}</td>
                        <td className="p-3 text-center font-bold">{c.totalOrders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: SETTINGS */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-xl font-black text-zinc-900 uppercase">Store & Tax Invoicing Settings</h2>
              <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-2xs space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formSettings.businessName}
                    onChange={(e) => setFormSettings({ ...formSettings, businessName: e.target.value })}
                    className="w-full p-2 border rounded font-semibold"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 uppercase mb-1">Seller GSTIN</label>
                    <input
                      type="text"
                      value={formSettings.gstin}
                      onChange={(e) => setFormSettings({ ...formSettings, gstin: e.target.value })}
                      className="w-full p-2 border rounded font-mono font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 uppercase mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formSettings.phone}
                      onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                      className="w-full p-2 border rounded font-semibold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 uppercase mb-1">Support Email</label>
                    <input
                      type="email"
                      value={formSettings.email}
                      onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                      className="w-full p-2 border rounded font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 uppercase mb-1">UPI ID (Payments)</label>
                    <input
                      type="text"
                      value={formSettings.upiId}
                      onChange={(e) => setFormSettings({ ...formSettings, upiId: e.target.value })}
                      className="w-full p-2 border rounded font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Store Address</label>
                  <input
                    type="text"
                    value={formSettings.address}
                    onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                    className="w-full p-2 border rounded font-semibold"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={async () => {
                      await onUpdateSettings(formSettings);
                      alert('Store settings successfully updated!');
                    }}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded uppercase tracking-wider transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Data Persistence & Demo Recovery Panel */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-orange-600" />
                      <h3 className="font-black text-sm uppercase text-zinc-900">
                        Demo Data & Storage Resiliency
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      This application includes a self-healing persistence store with automatic fallback. All demo products, categories, orders, POS bills, and customer accounts are preserved permanently, even on static deployment platforms like Vercel or when the browser cache is refreshed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <div className="text-lg font-black text-zinc-900">{products.length}</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Products Active</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <div className="text-lg font-black text-zinc-900">{orders.length}</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Total Invoices</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <div className="text-lg font-black text-zinc-900">{customers.length}</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Customers</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <div className="text-lg font-black text-green-600">Active</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-500">Storage State</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="font-bold text-xs text-zinc-900">Need to reset demo records?</span>
                    <p className="text-[11px] text-zinc-500">Restores all original catalog equipment, sample orders, and initial seed data.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to restore demo data? This will reset all products, orders, and settings to original factory defaults.')) {
                        onResetDemoData?.();
                      }
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded uppercase tracking-wider transition"
                  >
                    Restore Full Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Product Modal */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-black text-sm uppercase text-zinc-900">Add New Commercial Product</h3>
              <button onClick={() => setIsNewProductOpen(false)} className="text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 uppercase mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={npName}
                  onChange={(e) => setNpName(e.target.value)}
                  placeholder="e.g. Commercial 1200W Heavy Duty Mixer Grinder"
                  className="w-full p-2 border rounded font-semibold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={npSku}
                    onChange={(e) => setNpSku(e.target.value)}
                    placeholder="KP-AP-1200"
                    className="w-full p-2 border rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Brand</label>
                  <input
                    type="text"
                    value={npBrand}
                    onChange={(e) => setNpBrand(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={npPrice}
                    onChange={(e) => setNpPrice(Number(e.target.value))}
                    className="w-full p-2 border rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={npMrp}
                    onChange={(e) => setNpMrp(Number(e.target.value))}
                    className="w-full p-2 border rounded font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 uppercase mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={npStock}
                    onChange={(e) => setNpStock(Number(e.target.value))}
                    className="w-full p-2 border rounded font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-zinc-700 uppercase mb-1">GST Rate</label>
                  <select
                    value={npGst}
                    onChange={(e) => setNpGst(Number(e.target.value))}
                    className="w-full p-2 border rounded font-bold"
                  >
                    <option value={18}>18% GST (Appliances)</option>
                    <option value={12}>12% GST (Cookware & Tools)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded uppercase tracking-wider"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
