import React from 'react';
import {
  ShoppingBag,
  ArrowRight,
  Flame,
  Utensils,
  Layers,
  ChefHat,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Receipt,
} from 'lucide-react';

interface HeroBannerProps {
  onShopClick: () => void;
  onCategoryClick: (categoryId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopClick,
  onCategoryClick,
}) => {
  return (
    <section className="bg-gradient-to-b from-orange-50/40 via-white to-white border-b-2 border-gray-200 overflow-hidden">
      {/* 1. Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Pro Category Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 bg-orange-100/80 border border-orange-200/80 rounded-full text-orange-900 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#F27D26] animate-pulse shrink-0"></span>
            <span>COMMERCIAL KITCHEN &amp; INDUSTRIAL APPLIANCE SUPPLY</span>
          </div>

          {/* Primary Inspiring Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#141414] leading-[1.15] max-w-3xl">
            Commercial Kitchen Equipment <br className="hidden sm:inline" />
            <span className="text-[#F27D26]">&amp; Culinary Precision</span>
          </h1>

          {/* Sub-headline text */}
          <p className="mt-3.5 sm:mt-4 text-xs sm:text-sm md:text-base text-zinc-600 max-w-2xl font-normal leading-relaxed px-1">
            Engineered for high-volume Indian restaurants, cloud kitchens, and culinary professionals. 100% SS-304 food-grade cookware, heavy-duty appliances, and direct GST B2B invoicing.
          </p>

          {/* Key Value Propositions - Horizontal Chip Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold text-zinc-800">
            <div className="flex items-center space-x-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>100% SS-304 Food Grade</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Heavy Copper Motors</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Direct GST Tax Invoices</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F27D26]" />
              <span>Pan-India Fast Dispatch</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md sm:max-w-none">
            <button
              id="hero-shop-all-btn"
              onClick={onShopClick}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#F27D26] hover:bg-orange-600 text-black text-xs font-black uppercase tracking-wider rounded-xs shadow-sm hover:shadow-md transition-all duration-150 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SHOP FULL CATALOG</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              id="hero-commercial-btn"
              onClick={() => onCategoryClick('cat-commercial')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#141414] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-sm hover:shadow-md transition-all duration-150 border border-zinc-800"
            >
              <ChefHat className="w-4 h-4 text-[#F27D26]" />
              <span>COMMERCIAL PRO RANGE</span>
            </button>
          </div>

          {/* 4 Iconic Product Lines */}
          <div className="mt-10 sm:mt-12 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-8 border-t border-gray-200">
            {/* 1. Heavy Appliances */}
            <div
              onClick={() => onCategoryClick('cat-appliances')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-xs border border-gray-200 bg-white hover:bg-orange-50/40 hover:border-[#F27D26] cursor-pointer transition group shadow-2xs"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xs bg-[#141414] flex items-center justify-center mb-2.5 group-hover:bg-[#F27D26] transition">
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-[#F27D26] group-hover:text-black transition" />
              </div>
              <span className="font-black text-xs text-[#141414] uppercase tracking-tight">
                HEAVY APPLIANCES
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5 font-mono">Mixers &amp; Induction</span>
            </div>

            {/* 2. Tri-Ply Cookware */}
            <div
              onClick={() => onCategoryClick('cat-cookware')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-xs border border-gray-200 bg-white hover:bg-orange-50/40 hover:border-[#F27D26] cursor-pointer transition group shadow-2xs"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xs bg-[#141414] flex items-center justify-center mb-2.5 group-hover:bg-[#F27D26] transition">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-[#F27D26] group-hover:text-black transition" />
              </div>
              <span className="font-black text-xs text-[#141414] uppercase tracking-tight">
                TRI-PLY COOKWARE
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5 font-mono">Kadhais &amp; Handis</span>
            </div>

            {/* 3. Commercial Gear */}
            <div
              onClick={() => onCategoryClick('cat-commercial')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-xs border border-gray-200 bg-white hover:bg-orange-50/40 hover:border-[#F27D26] cursor-pointer transition group shadow-2xs"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xs bg-[#141414] flex items-center justify-center mb-2.5 group-hover:bg-[#F27D26] transition">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#F27D26] group-hover:text-black transition" />
              </div>
              <span className="font-black text-xs text-[#141414] uppercase tracking-tight">
                COMMERCIAL GEAR
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5 font-mono">Fryers &amp; Griddles</span>
            </div>

            {/* 4. Modular Storage */}
            <div
              onClick={() => onCategoryClick('cat-storage')}
              className="flex flex-col items-center p-3 sm:p-4 rounded-xs border border-gray-200 bg-white hover:bg-orange-50/40 hover:border-[#F27D26] cursor-pointer transition group shadow-2xs"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xs bg-[#141414] flex items-center justify-center mb-2.5 group-hover:bg-[#F27D26] transition">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#F27D26] group-hover:text-black transition" />
              </div>
              <span className="font-black text-xs text-[#141414] uppercase tracking-tight">
                SS CONTAINERS
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5 font-mono">GN Pans &amp; Racks</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bottom Trust Badge Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
        <div className="bg-[#141414] text-white rounded-xs px-4 sm:px-8 py-3 shadow-md border-t-2 border-[#F27D26]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center justify-center space-x-1.5">
              <span className="text-[#F27D26]">★</span>
              <span className="text-[11px] sm:text-xs">Extensive Catalog</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="text-[11px] sm:text-xs">ISO 9001 Tested</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="text-[11px] sm:text-xs">GST B2B Invoices</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <Truck className="w-3.5 h-3.5 text-[#F27D26]" />
              <span className="text-[11px] sm:text-xs">Pan-India Freight</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
