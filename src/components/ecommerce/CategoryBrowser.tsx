import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Category } from '../../types';

interface CategoryBrowserProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <section className="py-8 sm:py-12 bg-gray-50 border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 gap-2">
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#F27D26] block">
              CATALOG DIVISIONS
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[#141414] uppercase tracking-tight">
              SHOP BY CATEGORY
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-black text-[#141414] hover:text-[#F27D26] flex items-center space-x-1 uppercase tracking-tight transition"
          >
            <span>VIEW ALL SECTORS</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F27D26]" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative bg-white border-2 border-gray-200 hover:border-[#F27D26] rounded-xs overflow-hidden shadow-2xs hover:shadow-lg cursor-pointer transition-all duration-200 flex flex-col justify-between"
            >
              <div className="aspect-4/3 overflow-hidden bg-gray-100 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-[#141414] text-[#F27D26] font-mono text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-xs">
                  {cat.itemCount} SKUs
                </div>
              </div>

              <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="font-black text-xs sm:text-base text-[#141414] uppercase tracking-tight group-hover:text-[#F27D26] transition line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mt-1">{cat.description}</p>
                </div>

                <div className="mt-3 sm:mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-400 font-mono text-[9px] sm:text-[10px]">COMMERCIAL</span>
                  <span className="text-[#141414] font-black uppercase text-[10px] sm:text-xs tracking-tight flex items-center group-hover:text-[#F27D26] group-hover:translate-x-1 transition">
                    EXPLORE <ArrowRight className="w-3 h-3 ml-1 text-[#F27D26]" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
