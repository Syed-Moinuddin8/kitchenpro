import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Menu,
  X,
  Store,
  LayoutDashboard,
  Truck,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { KitchenProLogo } from './KitchenProLogo';
import { Product, StoreSettings } from '../../types';
import { formatINR } from '../../services/billingEngine';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  storeSettings: StoreSettings;
  products: Product[];
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTrackOrder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  cartCount,
  cartTotal,
  wishlistCount,
  storeSettings,
  products,
  onOpenCart,
  onOpenWishlist,
  onOpenTrackOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick search autocomplete suggestions
  const searchResults = searchQuery.trim().length > 1
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', { search: searchQuery.trim() });
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-4 border-[#F27D26] shadow-md no-print">
      {/* 1. Top Utility Bar */}
      <div className="bg-[#141414] text-white text-xs py-1.5 sm:py-2 px-3 sm:px-8 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left info */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-zinc-300 min-w-0">
            <div className="flex items-center space-x-1.5 shrink-0">
              <div className="h-2 w-2 rounded-full bg-[#F27D26] animate-pulse"></div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-tight text-gray-300 font-semibold truncate">
                COMMERCIAL B2B &amp; RETAIL
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-xs text-zinc-400">
              <Phone className="w-3 h-3 text-[#F27D26]" />
              <span className="font-mono text-[11px] text-zinc-300">{storeSettings.phone}</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1 text-[#F27D26] font-mono text-[10px] uppercase font-bold tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>GSTIN: {storeSettings.gstin}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-zinc-300 shrink-0">
            <button
              id="header-track-order-btn"
              onClick={onOpenTrackOrder}
              className="flex items-center space-x-1 text-[11px] sm:text-xs text-gray-300 hover:text-[#F27D26] transition font-bold uppercase tracking-wider"
            >
              <Truck className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="hidden sm:inline">Track Order</span>
              <span className="sm:hidden">Track</span>
            </button>

            <span className="text-zinc-700">|</span>

            {/* Quick Switch to Admin */}
            <button
              id="header-admin-btn"
              onClick={() => onNavigate('admin')}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-zinc-800 hover:bg-[#141414] text-zinc-100 hover:text-[#F27D26] border border-zinc-700 hover:border-[#F27D26] font-bold rounded-xs transition text-[10px] sm:text-[11px] uppercase tracking-tighter"
            >
              <LayoutDashboard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F27D26]" />
              <span>Admin ERP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile menu trigger + Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#141414] hover:text-[#F27D26] hover:bg-gray-100 rounded-xs transition shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer shrink-0 hover:opacity-95 transition"
          >
            <KitchenProLogo size="md" />
          </div>
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="relative flex-1 max-w-2xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              id="global-search-input"
              type="text"
              placeholder="Search appliances, commercial cookware, gas stoves, SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-24 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-none text-sm text-[#141414] font-medium placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:border-[#F27D26] transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-5 bg-[#141414] hover:bg-[#F27D26] text-white hover:text-black text-xs font-black uppercase tracking-tighter transition"
            >
              SEARCH
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-[#141414] shadow-2xl z-50 overflow-hidden">
              <div className="p-2.5 bg-[#141414] text-[10px] font-mono font-bold text-[#F27D26] uppercase tracking-widest border-b border-zinc-800">
                Matching Catalog Results
              </div>
              <div className="divide-y divide-gray-100">
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onNavigate('product-detail', { productId: prod.id });
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-3 flex items-center justify-between hover:bg-orange-50/70 border-l-4 border-transparent hover:border-[#F27D26] cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-10 object-cover rounded-xs border border-gray-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#141414] line-clamp-1">{prod.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{prod.brand} • SKU: {prod.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-[#F27D26]">{formatINR(prod.price)}</span>
                      <span className="block text-[10px] text-gray-400 line-through">{formatINR(prod.mrp)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div
                onClick={handleSearchSubmit}
                className="p-2.5 bg-gray-50 text-center text-xs font-black text-[#141414] hover:text-[#F27D26] hover:bg-gray-100 cursor-pointer uppercase tracking-tighter"
              >
                View all results for "{searchQuery}" →
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Mobile Search toggle, Account, Wishlist, Cart */}
        <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 text-[#141414] hover:text-[#F27D26] hover:bg-gray-100 rounded-xs transition"
            aria-label="Toggle search input"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Account */}
          <button
            id="nav-account-btn"
            onClick={() => onNavigate('account')}
            className="flex items-center space-x-1.5 text-[#141414] hover:text-[#F27D26] transition group p-1 sm:p-0"
            title="Profile & Account"
          >
            <div className="p-1.5 sm:p-2 rounded-xs border border-gray-200 group-hover:border-[#F27D26] bg-gray-50">
              <UserIcon className="w-4 h-4 text-[#141414] group-hover:text-[#F27D26]" />
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <span className="text-gray-400 block text-[10px] font-mono uppercase">Profile</span>
              <span className="font-bold text-[#141414] group-hover:text-[#F27D26]">Account</span>
            </div>
          </button>

          {/* Wishlist */}
          <button
            id="nav-wishlist-btn"
            onClick={onOpenWishlist}
            className="relative p-1.5 sm:p-2 text-[#141414] hover:text-[#F27D26] hover:bg-gray-100 rounded-xs border border-gray-200 transition"
            title="Saved Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#F27D26] text-black font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button with Total */}
          <button
            id="nav-cart-btn"
            onClick={onOpenCart}
            className="flex items-center space-x-1.5 sm:space-x-2.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-[#F27D26] hover:bg-[#141414] text-black hover:text-[#F27D26] font-black uppercase tracking-tight rounded-xs shadow-xs transition duration-150 border-2 border-transparent hover:border-[#F27D26]"
            title="Open Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#141414] text-[#F27D26] font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <span className="text-[10px] font-mono uppercase tracking-widest block opacity-80">CART</span>
              <span className="text-xs font-black">{formatINR(cartTotal)}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown Row */}
      {isSearchOpen && (
        <div className="md:hidden px-3 pb-3 pt-1 bg-white border-b border-gray-200">
          <form onSubmit={handleSearchSubmit} className="relative flex gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search cookware, mixers, stoves, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-300 rounded text-xs text-zinc-900 focus:outline-hidden focus:border-[#F27D26]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#141414] text-[#F27D26] text-xs font-bold uppercase rounded-xs"
            >
              GO
            </button>
          </form>
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
              {searchResults.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onNavigate('product-detail', { productId: prod.id });
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="p-2 flex items-center justify-between hover:bg-orange-50/50 cursor-pointer"
                >
                  <span className="text-xs font-semibold text-zinc-900 line-clamp-1">{prod.name}</span>
                  <span className="text-xs font-bold text-[#F27D26] shrink-0 ml-2">{formatINR(prod.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Navigation Bar (Desktop) */}
      <nav className="hidden lg:block bg-[#141414] text-white border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center space-x-1">
            <button
              id="nav-home"
              onClick={() => onNavigate('home')}
              className={`px-4 py-3 hover:text-[#F27D26] transition ${
                currentView === 'home' ? 'text-[#F27D26] border-b-2 border-[#F27D26]' : 'text-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              id="nav-shop"
              onClick={() => onNavigate('shop')}
              className={`px-4 py-3 hover:text-[#F27D26] transition ${
                currentView === 'shop' ? 'text-[#F27D26] border-b-2 border-[#F27D26]' : 'text-gray-300'
              }`}
            >
              All Products
            </button>
            <button
              id="nav-appliances"
              onClick={() => onNavigate('shop', { category: 'cat-appliances' })}
              className="px-4 py-3 text-gray-300 hover:text-[#F27D26] transition"
            >
              Appliances
            </button>
            <button
              id="nav-cookware"
              onClick={() => onNavigate('shop', { category: 'cat-cookware' })}
              className="px-4 py-3 text-gray-300 hover:text-[#F27D26] transition"
            >
              Cookware
            </button>
            <button
              id="nav-commercial"
              onClick={() => onNavigate('shop', { category: 'cat-commercial' })}
              className="px-4 py-3 text-[#F27D26] hover:text-white transition flex items-center space-x-1.5"
            >
              <span>Commercial Pro</span>
              <span className="px-1.5 py-0.2 bg-[#F27D26] text-[9px] text-black font-black rounded-xs">PRO</span>
            </button>
            <button
              id="nav-gas-stoves"
              onClick={() => onNavigate('shop', { category: 'cat-gas-stoves' })}
              className="px-4 py-3 text-gray-300 hover:text-[#F27D26] transition"
            >
              Gas Stoves
            </button>
            <button
              id="nav-chimneys"
              onClick={() => onNavigate('shop', { category: 'cat-chimneys' })}
              className="px-4 py-3 text-gray-300 hover:text-[#F27D26] transition"
            >
              Chimneys
            </button>
            <button
              id="nav-storage"
              onClick={() => onNavigate('shop', { category: 'cat-storage' })}
              className="px-4 py-3 text-gray-300 hover:text-[#F27D26] transition"
            >
              Storage
            </button>
          </div>

          <div className="flex items-center space-x-4 text-[#F27D26] text-[10px] font-mono uppercase tracking-wider">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Commercial Standard ISO 9001</span>
            </span>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-900 text-white border-t border-zinc-800 p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white placeholder:text-zinc-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-zinc-800 text-left rounded hover:bg-zinc-700"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('shop');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-zinc-800 text-left rounded hover:bg-zinc-700"
            >
              All Products
            </button>
            <button
              onClick={() => {
                onNavigate('shop', { category: 'cat-appliances' });
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-zinc-800 text-left rounded hover:bg-zinc-700"
            >
              Kitchen Appliances
            </button>
            <button
              onClick={() => {
                onNavigate('shop', { category: 'cat-cookware' });
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-zinc-800 text-left rounded hover:bg-zinc-700"
            >
              Cookware & Pots
            </button>
            <button
              onClick={() => {
                onNavigate('shop', { category: 'cat-commercial' });
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-orange-600 text-left rounded hover:bg-orange-700 col-span-2 text-white"
            >
              Commercial Equipment (Pro Range)
            </button>
            <button
              onClick={() => {
                onNavigate('pos');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-zinc-800 border border-zinc-700 text-gray-200 text-left rounded-xs col-span-2 font-bold uppercase"
            >
              POS Billing Counter →
            </button>
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 bg-zinc-800 border border-[#F27D26] text-[#F27D26] text-left rounded-xs col-span-2 font-black uppercase tracking-tighter"
            >
              Admin ERP Dashboard →
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
