import React from 'react';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  CreditCard,
  Building2,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';
import { KitchenProLogo } from './KitchenProLogo';
import { StoreSettings } from '../../types';

interface FooterProps {
  storeSettings: StoreSettings;
  onNavigate: (view: string, data?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ storeSettings, onNavigate }) => {
  return (
    <footer className="bg-[#141414] text-gray-300 border-t-4 border-[#F27D26] no-print">
      {/* 1. Value Pillars Banner */}
      <div className="border-b border-zinc-800 bg-[#141414] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="flex flex-col items-center space-y-2 p-4 rounded-xs bg-[#1f1f1f] border border-zinc-800 hover:border-[#F27D26] transition">
            <div className="p-3 bg-[#141414] border border-zinc-700 rounded-xs text-[#F27D26]">
              <Award className="w-6 h-6" />
            </div>
            <span className="font-black text-xs text-white uppercase tracking-tighter">WIDE RANGE</span>
            <span className="text-[11px] text-gray-400">Over 500+ commercial appliances & heavy-duty cookware</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-xs bg-[#1f1f1f] border border-zinc-800 hover:border-[#F27D26] transition">
            <div className="p-3 bg-[#141414] border border-zinc-700 rounded-xs text-[#F27D26]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-black text-xs text-white uppercase tracking-tighter">PREMIUM QUALITY</span>
            <span className="text-[11px] text-gray-400">100% SS 304 food-grade & heavy copper motors</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-xs bg-[#1f1f1f] border border-zinc-800 hover:border-[#F27D26] transition">
            <div className="p-3 bg-[#141414] border border-zinc-700 rounded-xs text-[#F27D26]">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-black text-xs text-white uppercase tracking-tighter">TRUSTED BY PROS</span>
            <span className="text-[11px] text-gray-400">Supplying 1200+ restaurants, caterers & cloud kitchens</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 rounded-xs bg-[#1f1f1f] border border-zinc-800 hover:border-[#F27D26] transition">
            <div className="p-3 bg-[#141414] border border-zinc-700 rounded-xs text-[#F27D26]">
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-black text-xs text-white uppercase tracking-tighter">ON TIME, EVERY TIME</span>
            <span className="text-[11px] text-gray-400">Fast insured dispatch across India with live tracking</span>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-2 inline-block">
            <KitchenProLogo size="md" lightMode={true} />
          </div>
          <p className="text-gray-400 leading-relaxed max-w-sm text-xs">
            <b className="text-white font-black">{storeSettings.businessName}</b> is a premier Indian manufacturer and retailer of commercial-grade kitchen equipment, heavy electrical appliances, tri-ply stainless cookware, and culinary essentials.
          </p>
          <div className="space-y-2 text-gray-300 font-mono text-[11px]">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
              <span>{storeSettings.address}, {storeSettings.city}, {storeSettings.state} - {storeSettings.pincode}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#F27D26] shrink-0" />
              <span>{storeSettings.phone} (Sales) | {storeSettings.supportPhone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#F27D26] shrink-0" />
              <span>{storeSettings.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-[#F27D26] shrink-0" />
              <span>GSTIN: <b className="text-[#F27D26] font-mono">{storeSettings.gstin}</b></span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-black text-white text-xs uppercase tracking-widest border-b border-zinc-800 pb-2">
            Categories
          </h4>
          <ul className="space-y-2 text-gray-400 font-medium">
            <li>
              <button onClick={() => onNavigate('shop', { category: 'cat-appliances' })} className="hover:text-[#F27D26] transition">
                Commercial Mixer Grinders
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'cat-cookware' })} className="hover:text-[#F27D26] transition">
                Tri-Ply Stainless Cookware
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'cat-commercial' })} className="hover:text-[#F27D26] transition">
                Electric Deep Fryers & Griddles
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'cat-gas-stoves' })} className="hover:text-[#F27D26] transition">
                Brass Burner Gas Stoves
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'cat-chimneys' })} className="hover:text-[#F27D26] transition">
                Filterless Auto-Clean Chimneys
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop', { category: 'cat-storage' })} className="hover:text-[#F27D26] transition">
                SS Airtight Containers
              </button>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-black text-white text-xs uppercase tracking-widest border-b border-zinc-800 pb-2">
            Quick Links
          </h4>
          <ul className="space-y-2 text-gray-400 font-medium">
            <li>
              <button onClick={() => onNavigate('account')} className="hover:text-[#F27D26] transition">
                My Orders & Invoices
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('admin')} className="hover:text-[#F27D26] transition">
                Admin ERP Dashboard
              </button>
            </li>
            <li>
              <span className="text-gray-500">B2B Institutional Bulk Quotes</span>
            </li>
            <li>
              <span className="text-gray-500">Store Pickup Locator</span>
            </li>
            <li>
              <span className="text-gray-500">GST Compliance & E-Way Bills</span>
            </li>
          </ul>
        </div>

        {/* Counter Hours */}
        <div className="space-y-3">
          <h4 className="font-black text-white text-xs uppercase tracking-widest border-b border-zinc-800 pb-2">
            Counter Timing
          </h4>
          <div className="p-3.5 bg-[#1f1f1f] border border-zinc-800 rounded-xs space-y-2 text-gray-300">
            <div className="flex items-center space-x-1.5 text-[#F27D26] font-black uppercase text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>Counter Hours</span>
            </div>
            <p className="text-[11px] font-mono">Mon – Sat: 09:30 AM – 08:30 PM</p>
            <p className="text-[11px] font-mono">Sunday: 10:00 AM – 04:00 PM</p>
            <div className="pt-2 border-t border-zinc-800 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-[#F27D26] animate-pulse"></div>
              <span className="text-[#F27D26] font-mono text-[10px] font-black uppercase">
                STORE COUNTER ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-zinc-800 bg-[#0d0d0d] py-4 px-4 sm:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            © 2026 <b className="text-white">KITCHEN PRO</b>. All Rights Reserved. Supplying Quality. Serving Trust.
          </div>
          <div className="flex flex-wrap items-center justify-center space-x-2 sm:space-x-4 font-mono text-[10px]">
            <span>100% SECURE PAYMENTS</span>
            <span>•</span>
            <span>UPI / NEFT / CARDS / CASH</span>
            <span>•</span>
            <span>GST RULE 46 COMPLIANT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
