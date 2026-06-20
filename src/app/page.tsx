import React from 'react';
import { Leaf, TrendingUp, Building2, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DemandForm from '@/components/DemandForm';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f8fcf8] to-[#f5f8f6] text-[#0f172a] selection:bg-green-150 selection:text-green-800">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start relative z-10">
          
          {/* Left Column: Copywriting & Business Value */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left lg:pr-6">
            
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#edfdf2] border border-[#bbf7d0] text-xs text-[#166534] font-semibold">
              <Leaf className="w-3.5 h-3.5 text-[#16a34a] animate-pulse" />
              <span>Market Research Survey</span>
            </div>

            {/* Headline & Description */}
            <div className="space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] tracking-tight leading-[1.1]">
                Help Us Understand What Agricultural Products{' '}
                <span className="text-[#16a34a] block sm:inline">
                  Businesses Are Looking For
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[#475569] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Take 30 seconds to share what your business typically sources or uses. Your input helps build a clearer picture of agricultural market demand — nothing more.
              </p>

              {/* Mobile-only scroll-to-form button */}
              <a
                href="#survey-form"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm shadow-[0_4px_12px_rgba(22,163,74,0.15)] hover:shadow-[0_4px_16px_rgba(22,163,74,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 md:hidden"
              >
                Fill the Form →
              </a>
            </div>

            {/* Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 max-w-xl mx-auto lg:mx-0">
              {/* Card 1: Product Demand */}
              <div className="p-4 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#edfdf2] text-[#16a34a] border border-[#bbf7d0] shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#0f172a] mt-2">Demand Insights</span>
                <p className="text-[11px] text-[#475569] mt-1 leading-relaxed font-medium">
                  Understand which agricultural products businesses report sourcing or using most.
                </p>
              </div>

              {/* Card 2: Industry Trends */}
              <div className="p-4 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#edfdf2] text-[#16a34a] border border-[#bbf7d0] shrink-0">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#0f172a] mt-2">Cross-Industry View</span>
                <p className="text-[11px] text-[#475569] mt-1 leading-relaxed font-medium">
                  See how the same raw agricultural products are sourced differently across multiple industries.
                </p>
              </div>

              {/* Card 3: Better Decisions */}
              <div className="p-4 bg-white border border-[#e5e7eb] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center lg:items-start text-center lg:text-left gap-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#edfdf2] text-[#16a34a] border border-[#bbf7d0] shrink-0">
                  <Target className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-[#0f172a] mt-2">Your Data, Protected</span>
                <p className="text-[11px] text-[#475569] mt-1 leading-relaxed font-medium">
                  No buyer-supplier matching. No sales calls. No marketing messages. Your response stays in our research database only.
                </p>
              </div>
            </div>

            {/* Target Sectors Badge List */}
            <div className="space-y-3 pt-6 border-t border-[#e5e7eb]">
              <h3 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest text-center lg:text-left">
                Industries We Learn From
              </h3>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 max-w-lg mx-auto lg:mx-0">
                {[
                  'Cosmetics & Personal Care',
                  'Food & Beverage',
                  'Pharmaceuticals',
                  'Nutraceuticals & Supplements',
                  'Herbal & Ayurvedic Products',
                  'Export & Trading',
                  'Wholesale Distribution'
                ].map((item) => (
                  <span
                    key={item}
                    className="text-[11px] font-semibold bg-[#edfdf2] text-[#166534] px-3 py-1.5 rounded-lg border border-[#bbf7d0] hover:bg-[#dcfce7] transition-colors cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Collection Form */}
          <div id="survey-form" className="lg:col-span-6 w-full flex justify-center lg:justify-end lg:sticky lg:top-24">
            <DemandForm />
          </div>
        </div>
      </main>

    </div>
  );
}
