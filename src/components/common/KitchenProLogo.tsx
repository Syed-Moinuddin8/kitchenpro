import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showTaglines?: boolean;
  className?: string;
  lightMode?: boolean;
}

export const KitchenProLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTaglines = false,
  className = '',
  lightMode = false,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isHero = size === 'hero';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Vibrant Geometric Flame Emblem */}
      <div
        className={`${
          isSm
            ? 'w-7 h-7'
            : isLg
            ? 'w-10 h-10'
            : isHero
            ? 'w-12 h-12 sm:w-14 sm:h-14'
            : 'w-7 h-7 sm:w-8 sm:h-8'
        } bg-[#F27D26] rounded-xs flex items-center justify-center shadow-xs shrink-0`}
      >
        <div
          className={`${
            isSm
              ? 'w-3.5 h-3.5'
              : isLg
              ? 'w-5 h-5'
              : isHero
              ? 'w-6 h-6'
              : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
          } border-2 ${lightMode ? 'border-[#141414]' : 'border-black'} rotate-45 transition-transform group-hover:rotate-90`}
        />
      </div>

      {/* Brand Name */}
      <div className="flex flex-col tracking-tight leading-none text-left min-w-0">
        <div className="flex items-center">
          <span
            className={`font-black tracking-tighter ${
              lightMode ? 'text-white' : 'text-[#141414]'
            } ${
              isSm
                ? 'text-sm sm:text-base'
                : isLg
                ? 'text-2xl sm:text-3xl'
                : isHero
                ? 'text-2xl sm:text-4xl'
                : 'text-base sm:text-lg'
            } uppercase`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            KITCHEN
          </span>
          <span
            className={`font-black tracking-tighter text-[#F27D26] ${
              isSm
                ? 'text-sm sm:text-base'
                : isLg
                ? 'text-2xl sm:text-3xl'
                : isHero
                ? 'text-2xl sm:text-4xl'
                : 'text-base sm:text-lg'
            } uppercase ml-1`}
          >
            PRO
          </span>
        </div>

        {/* Subtitles & Tagline */}
        {showTaglines ? (
          <div className="mt-1.5 w-full">
            <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-bold tracking-widest text-[#141414] uppercase py-1 border-t border-b border-[#F27D26]">
              <span>EVERY INGREDIENT.</span>
              <span className="text-[#F27D26]">|</span>
              <span>EVERY KITCHEN.</span>
            </div>
          </div>
        ) : (
          <span
            className={`text-[8px] sm:text-[9px] font-mono tracking-wider uppercase truncate ${
              lightMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            EQUIPMENT &amp; POS
          </span>
        )}
      </div>
    </div>
  );
};
