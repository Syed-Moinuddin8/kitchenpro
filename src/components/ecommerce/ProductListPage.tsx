import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Search, RotateCcw } from 'lucide-react';
import { Product, Category, Brand } from '../../types';
import { ProductCard } from './ProductCard';
import { formatINR } from '../../services/billingEngine';

interface ProductListPageProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  initialCategory?: string;
  initialSearch?: string;
  onAddToCart: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onSelectProduct: (product: Product) => void;
}

export const ProductListPage: React.FC<ProductListPageProps> = ({
  products,
  categories,
  brands,
  initialCategory,
  initialSearch,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [selectedGst, setSelectedGst] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
        if (inStockOnly && p.stock <= 0) return false;
        if (p.price > maxPrice) return false;
        if (selectedGst !== 'all' && p.gstRate !== Number(selectedGst)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.barcode.includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, selectedBrand, searchQuery, inStockOnly, maxPrice, selectedGst, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setInStockOnly(false);
    setMaxPrice(30000);
    setSelectedGst('all');
    setSortBy('featured');
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 30000 ? 1 : 0) +
    (selectedGst !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-zinc-900 font-bold">Catalog</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-orange-600 font-bold">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-tight">
                {selectedCategory !== 'all'
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : 'COMMERCIAL APPLIANCES & COOKWARE'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Showing <b>{filteredProducts.length}</b> products matching your criteria
              </p>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center justify-center space-x-2 px-4 py-2.5 bg-zinc-900 text-white rounded-md text-xs font-bold"
            >
              <Filter className="w-4 h-4 text-orange-500" />
              <span>Filters ({activeFilterCount})</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ============================================================ */}
          {/* SIDEBAR FILTERS (DESKTOP) */}
          {/* ============================================================ */}
          <div className="hidden lg:block bg-zinc-50 border border-zinc-200 rounded-md p-5 space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                <span className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">
                  Filters
                </span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            {/* Search Input Filter */}
            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase mb-2">
                Search in results
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 1000W, SS Kadhai, Gas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500 focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase mb-2">
                Categories
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <div
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition ${
                    selectedCategory === 'all'
                      ? 'bg-zinc-900 text-white font-bold'
                      : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{products.length}</span>
                </div>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition ${
                      selectedCategory === cat.id
                        ? 'bg-zinc-900 text-white font-bold'
                        : 'text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-zinc-400 text-[10px] ml-2">
                      {products.filter((p) => p.categoryId === cat.id).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-bold text-zinc-900 uppercase mb-2">
                Brand
              </label>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                <div
                  onClick={() => setSelectedBrand('all')}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer ${
                    selectedBrand === 'all'
                      ? 'bg-orange-600 text-white font-bold'
                      : 'text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <span>All Brands</span>
                </div>
                {brands.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBrand(b.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer ${
                      selectedBrand === b.name
                        ? 'bg-orange-600 text-white font-bold'
                        : 'text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-900 uppercase mb-2">
                <span>Max Price</span>
                <span className="text-orange-600 font-extrabold">{formatINR(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>₹500</span>
                <span>₹30,000+</span>
              </div>
            </div>

            {/* In-Stock & GST Filter */}
            <div className="space-y-3 pt-3 border-t border-zinc-200">
              <label className="flex items-center space-x-2 text-xs font-bold text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span>In Stock Only (Ready Dispatch)</span>
              </label>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                  GST Slab
                </label>
                <select
                  value={selectedGst}
                  onChange={(e) => setSelectedGst(e.target.value)}
                  className="w-full p-1.5 bg-white border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500"
                >
                  <option value="all">All GST Rates (12% / 18%)</option>
                  <option value="12">12% GST (Cookware & Non-Electric)</option>
                  <option value="18">18% GST (Electric Appliances)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MAIN PRODUCTS AREA */}
          {/* ============================================================ */}
          <div className="lg:col-span-3">
            {/* Top Sort & Filter Bar */}
            <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-md mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[11px] font-semibold">
                        Cat: {categories.find((c) => c.id === selectedCategory)?.name}
                        <button onClick={() => setSelectedCategory('all')} className="ml-1 text-zinc-500 hover:text-black">
                          ×
                        </button>
                      </span>
                    )}
                    {selectedBrand !== 'all' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[11px] font-semibold">
                        Brand: {selectedBrand}
                        <button onClick={() => setSelectedBrand('all')} className="ml-1 text-zinc-500 hover:text-black">
                          ×
                        </button>
                      </span>
                    )}
                    {inStockOnly && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                        In Stock Only
                        <button onClick={() => setInStockOnly(false)} className="ml-1 text-emerald-600 hover:text-black">
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sorting */}
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-xs font-bold text-zinc-500 uppercase">Sort by:</span>
                <select
                  id="product-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-zinc-300 text-zinc-900 text-xs font-bold rounded px-3 py-1.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-zinc-50 border border-zinc-200 rounded-md p-12 text-center">
                <div className="w-16 h-16 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 uppercase">No products match your criteria</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your filters, searching for a different keyword, or resetting your filter choices.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-md hover:bg-orange-700 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-xs">
            <div className="relative w-full max-w-sm bg-white h-full ml-auto flex flex-col shadow-2xl overflow-hidden">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 bg-zinc-950 text-white border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  <span className="font-extrabold text-sm uppercase tracking-wider">
                    Filter Products
                  </span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase mb-2">
                    Search in results
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase mb-2">
                    Categories
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => setSelectedCategory('all')}
                      className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-zinc-900 text-white font-bold'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span>All Categories</span>
                      <span>{products.length}</span>
                    </div>
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-zinc-900 text-white font-bold'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-zinc-400 text-[10px]">
                          {products.filter((p) => p.categoryId === cat.id).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <label className="block text-xs font-bold text-zinc-900 uppercase mb-2">
                    Brand
                  </label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    <div
                      onClick={() => setSelectedBrand('all')}
                      className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer ${
                        selectedBrand === 'all'
                          ? 'bg-orange-600 text-white font-bold'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span>All Brands</span>
                    </div>
                    {brands.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBrand(b.name)}
                        className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer ${
                          selectedBrand === b.name
                            ? 'bg-orange-600 text-white font-bold'
                            : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-900 uppercase mb-2">
                    <span>Max Price</span>
                    <span className="text-orange-600 font-extrabold">{formatINR(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="30000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>₹500</span>
                    <span>₹30,000+</span>
                  </div>
                </div>

                {/* In Stock & GST */}
                <div className="space-y-3 pt-3 border-t border-zinc-200">
                  <label className="flex items-center space-x-2 text-xs font-bold text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                    />
                    <span>In Stock Only (Ready Dispatch)</span>
                  </label>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                      GST Slab
                    </label>
                    <select
                      value={selectedGst}
                      onChange={(e) => setSelectedGst(e.target.value)}
                      className="w-full p-2 bg-white border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="all">All GST Rates (12% / 18%)</option>
                      <option value="12">12% GST (Cookware & Non-Electric)</option>
                      <option value="18">18% GST (Electric Appliances)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 text-xs font-bold text-zinc-600 hover:text-black border border-zinc-300 rounded uppercase"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded uppercase tracking-wider"
                >
                  Apply ({filteredProducts.length} Results)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
