import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 w-full transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 group">
          <img src="/agridemand-logo.svg" alt="AgriDemand logo" width="30" height="30" />
          <span className="text-base font-bold text-slate-900 tracking-tight">
            Agri<span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Demand</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#166534] font-semibold bg-[#edfdf2] border border-[#bbf7d0] px-3 py-1 rounded-full flex items-center gap-1">
            <span>✓</span> No Registration Required
          </span>
        </div>
      </div>
    </header>
  );
}
