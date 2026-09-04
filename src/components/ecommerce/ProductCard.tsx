import React from 'react';
import { ShoppingCart, Heart, Star, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatINR } from '../../services/billingEngine';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onSelect,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStockLevel;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative bg-white border-2 border-gray-200 hover:border-[#F27D26] rounded-xs overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
    >
      {/* Top Image Section */}
      <div className="relative aspect-4/3 bg-gray-50 overflow-hidden cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {product.discountPercentage > 0 && (
            <span className="px-2 py-0.5 bg-[#F27D26] text-black text-[10px] font-black uppercase tracking-tighter rounded-xs shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.bestSeller && (
            <span className="px-2 py-0.5 bg-[#141414] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs">
              BESTSELLER
            </span>
          )}
          {product.newArrival && (
            <span className="px-2 py-0.5 bg-[#F27D26] text-white text-[10px] font-black uppercase tracking-wider rounded-xs">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-xs transition ${
            isWishlisted
              ? 'bg-[#F27D26] text-black'
              : 'bg-white/90 text-gray-700 hover:bg-[#141414] hover:text-[#F27D26]'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>

        {/* Low Stock Warning Overlay */}
        {isLowStock && (
          <div className="absolute bottom-2 left-2 right-2 bg-[#F27D26] text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs text-center shadow-xs">
            ⚠️ ONLY {product.stock} UNITS LEFT IN STOCK
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#141414]/80 flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xs">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 font-medium mb-1">
            <span className="uppercase text-[#F27D26] font-black">{product.brand}</span>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-xs sm:text-sm font-bold text-[#141414] line-clamp-2 hover:text-[#F27D26] cursor-pointer transition leading-snug mb-1.5"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mb-2">
            <div className="flex items-center bg-[#141414] text-[#F27D26] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 ml-0.5 fill-current text-[#F27D26]" />
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-500">({product.reviewCount})</span>
            <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono">• GST {product.gstRate}%</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 sm:pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline space-x-1 sm:space-x-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-black text-[#141414]">{formatINR(product.price)}</span>
              {product.mrp > product.price && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">{formatINR(product.mrp)}</span>
              )}
            </div>
            <span className="text-[8px] sm:text-[9px] text-gray-400 font-mono block leading-none">INCL. GST TAX</span>
          </div>

          <button
            id={`btn-add-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, 1);
            }}
            className={`flex items-center space-x-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-tight rounded-xs transition shrink-0 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#F27D26] hover:bg-[#141414] text-black hover:text-[#F27D26] shadow-2xs'
            }`}
          >
            <ShoppingCart className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>ADD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
