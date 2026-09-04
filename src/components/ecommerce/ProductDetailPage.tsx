import React, { useState } from 'react';
import {
  ShoppingCart,
  Zap,
  Heart,
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Share2,
  Tag,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { formatINR } from '../../services/billingEngine';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  onBuyNow: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onSelectProduct: (product: Product) => void;
  onBackToShop: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onSelectProduct,
  onBackToShop,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0] || '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [pincode, setPincode] = useState<string>('400001');
  const [pincodeChecked, setPincodeChecked] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'warranty' | 'reviews'>('specs');

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp = selectedVariant ? selectedVariant.mrp : product.mrp;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock <= 0;

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-zinc-500 mb-6">
          <button onClick={onBackToShop} className="hover:text-zinc-900 transition">
            Home
          </button>
          <span>/</span>
          <button onClick={onBackToShop} className="hover:text-zinc-900 transition">
            {product.categoryName}
          </button>
          <span>/</span>
          <span className="text-zinc-900 font-bold truncate max-w-md">{product.name}</span>
        </div>

        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-zinc-200">
          {/* ============================================================ */}
          {/* LEFT: IMAGE GALLERY */}
          {/* ============================================================ */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Image Box */}
            <div className="relative aspect-4/3 bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={selectedImage || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-3 left-3 bg-orange-600 text-white font-black text-xs px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                  {product.discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded border-2 overflow-hidden shrink-0 transition ${
                      selectedImage === img ? 'border-orange-600 shadow' : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Brand Assurance Box */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-200 text-center text-xs">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-orange-600 mb-1" />
                <span className="font-bold text-zinc-900">Direct Warranty</span>
                <span className="text-[10px] text-zinc-500">100% Genuine ISI</span>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col items-center">
                <Truck className="w-5 h-5 text-orange-600 mb-1" />
                <span className="font-bold text-zinc-900">Safe Delivery</span>
                <span className="text-[10px] text-zinc-500">Insured Transit</span>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col items-center">
                <RotateCcw className="w-5 h-5 text-orange-600 mb-1" />
                <span className="font-bold text-zinc-900">7 Days Return</span>
                <span className="text-[10px] text-zinc-500">Easy Replacement</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: BUY BOX & PRODUCT DETAILS */}
          {/* ============================================================ */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              {/* Brand, SKU, HSN */}
              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 font-semibold mb-2 gap-2">
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded uppercase font-bold">
                  {product.brand}
                </span>
                <div className="flex items-center space-x-3">
                  <span>SKU: <b className="text-zinc-800">{selectedVariant ? selectedVariant.sku : product.sku}</b></span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center space-x-3 mt-3">
                <div className="flex items-center bg-zinc-950 text-white text-xs font-extrabold px-2 py-1 rounded">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 ml-1 fill-current text-amber-400" />
                </div>
                <span className="text-xs text-zinc-500">{product.reviewCount} Ratings & Reviews</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ Verified Commercial Quality
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-md">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-zinc-950">{formatINR(currentPrice)}</span>
                {currentMrp > currentPrice && (
                  <span className="text-sm text-zinc-400 line-through">{formatINR(currentMrp)}</span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-bold text-orange-600">
                    Save {formatINR(currentMrp - currentPrice)} ({product.discountPercentage}%)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1 text-xs text-zinc-600">
                <span>Inclusive of all taxes ({product.gstRate}% GST applicable)</span>
                <span>•</span>
                <span className="font-semibold text-zinc-800">GST Invoice Provided</span>
              </div>
            </div>

            {/* Variant Selector (e.g. 500W, 750W, 1000W) */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-xs font-extrabold text-zinc-900 uppercase mb-2">
                  Select Model / Specification:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2.5 rounded border text-left transition ${
                        selectedVariant?.id === v.id
                          ? 'border-orange-600 bg-orange-50/50 shadow-xs'
                          : 'border-zinc-300 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <p className="text-xs font-bold text-zinc-900">{v.name}</p>
                      <p className="text-xs font-black text-orange-600 mt-0.5">{formatINR(v.price)}</p>
                      <p className="text-[10px] text-zinc-500">Stock: {v.stock}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Level Alert */}
            <div>
              {currentStock <= 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Currently Out of Stock at Main Warehouse</span>
                </div>
              ) : currentStock <= product.minStockLevel ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Only {currentStock} units remaining in inventory! Order now to prevent delay.</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-emerald-700 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>In Stock (Dispatched within 24 hours)</span>
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-4">
                <label className="text-xs font-bold text-zinc-900 uppercase">Quantity:</label>
                <div className="flex items-center border border-zinc-300 rounded bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-1.5 text-sm font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-zinc-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="px-3 py-1.5 text-sm font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-zinc-400">Max {currentStock} units per order</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  id="btn-detail-add-cart"
                  disabled={isOutOfStock}
                  onClick={() => onAddToCart(product, quantity, selectedVariant)}
                  className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-extrabold rounded-md shadow uppercase tracking-wider transition"
                >
                  <ShoppingCart className="w-4 h-4 text-orange-500" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  id="btn-detail-buy-now"
                  disabled={isOutOfStock}
                  onClick={() => onBuyNow(product, quantity, selectedVariant)}
                  className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 text-white text-xs font-extrabold rounded-md shadow uppercase tracking-wider transition"
                >
                  <Zap className="w-4 h-4" />
                  <span>BUY NOW (INSTANT)</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-700 hover:text-orange-600 transition"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-orange-600 text-orange-600' : ''}`} />
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <div className="flex items-center space-x-1 text-xs text-zinc-500">
                  <Tag className="w-3.5 h-3.5 text-orange-600" />
                  <span>Use coupon <b>KITCHENPRO10</b> at checkout</span>
                </div>
              </div>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-md">
              <label className="block text-xs font-bold text-zinc-900 uppercase mb-1">
                Check Delivery & Store Pickup:
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-zinc-300 rounded text-xs focus:ring-1 focus:ring-orange-500"
                  />
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  onClick={() => setPincodeChecked(true)}
                  className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded"
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <div className="mt-2 text-[11px] text-zinc-600 space-y-0.5">
                  <p className="text-emerald-700 font-bold">✓ Standard delivery available in 2-3 business days</p>
                  <p>✓ Free Store Pickup ready in 2 hours at Mumbai Warehouse</p>
                  <p>✓ Cash on Delivery & UPI available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed Specifications, Features, Warranty, Reviews */}
        <div className="my-12">
          {/* Tab Headers */}
          <div className="flex border-b border-zinc-200 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition whitespace-nowrap shrink-0 ${
                activeTab === 'specs'
                  ? 'border-orange-600 text-orange-600 bg-orange-50/20'
                  : 'border-transparent text-zinc-600 hover:text-black'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition whitespace-nowrap shrink-0 ${
                activeTab === 'features'
                  ? 'border-orange-600 text-orange-600 bg-orange-50/20'
                  : 'border-transparent text-zinc-600 hover:text-black'
              }`}
            >
              Key Features
            </button>
            <button
              onClick={() => setActiveTab('warranty')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition whitespace-nowrap shrink-0 ${
                activeTab === 'warranty'
                  ? 'border-orange-600 text-orange-600 bg-orange-50/20'
                  : 'border-transparent text-zinc-600 hover:text-black'
              }`}
            >
              Warranty & Policy
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition whitespace-nowrap shrink-0 ${
                activeTab === 'reviews'
                  ? 'border-orange-600 text-orange-600 bg-orange-50/20'
                  : 'border-transparent text-zinc-600 hover:text-black'
              }`}
            >
              Reviews ({product.reviewCount})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6 bg-zinc-50 border-x border-b border-zinc-200 rounded-b-md">
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">Specifications Table</h4>
                <div className="border border-zinc-200 rounded overflow-hidden bg-white">
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-zinc-200">
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-zinc-50/60' : 'bg-white'}>
                          <td className="p-3 w-1/3 font-bold text-zinc-700">{spec.key}</td>
                          <td className="p-3 text-zinc-900 font-medium">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-600 leading-relaxed">{product.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {product.features.map((feat, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2.5 bg-white border border-zinc-200 rounded">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-800">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="space-y-4 text-xs text-zinc-700">
                <div className="p-4 bg-white border border-zinc-200 rounded space-y-2">
                  <h5 className="font-bold text-zinc-900 text-sm">Manufacturer Warranty</h5>
                  <p>{product.warranty}</p>
                  <p className="text-zinc-500">Service Coverage: On-site commercial warranty & authorized service centers across 120+ Indian cities.</p>
                </div>
                <div className="p-4 bg-white border border-zinc-200 rounded space-y-2">
                  <h5 className="font-bold text-zinc-900 text-sm">Return & Exchange Policy</h5>
                  <p>{product.returnPolicy}</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-white border border-zinc-200 rounded">
                  <div className="text-center pr-6 border-r border-zinc-200">
                    <span className="text-3xl font-black text-zinc-950">{product.rating}</span>
                    <div className="flex justify-center text-amber-400 mt-1">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-[10px] text-zinc-400">{product.reviewCount} customer reviews</span>
                  </div>
                  <div className="text-xs text-zinc-600 space-y-1">
                    <p><b>100% Verified Purchases:</b> Rated highly for motor torque, steel gauge thickness, and heat retention.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-zinc-200">
            <h3 className="text-lg font-black text-zinc-950 uppercase tracking-tight mb-6">
              YOU MAY ALSO NEED IN YOUR COMMERCIAL KITCHEN
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => onSelectProduct(rp)}
                  className="bg-white border border-zinc-200 hover:border-orange-500 rounded p-3 cursor-pointer transition shadow-2xs"
                >
                  <img src={rp.images[0]} alt={rp.name} className="w-full aspect-4/3 object-cover rounded mb-2" />
                  <p className="text-xs font-bold text-zinc-900 line-clamp-1">{rp.name}</p>
                  <p className="text-xs font-black text-orange-600 mt-1">{formatINR(rp.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
