'use client';

import React, { useState, useEffect } from 'react';
import { Download, LayoutDashboard, LogOut, RefreshCw, AlertCircle, ShoppingBag, Landmark, Globe, Activity } from 'lucide-react';
import { DemandSignal } from '@/types';

interface AdminDashboardProps {
  adminKey: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminKey, onLogout }: AdminDashboardProps) {
  const [data, setData] = useState<DemandSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const response = await fetch(`/api/demand-signals?key=${encodeURIComponent(adminKey)}`);
      if (!response.ok) {
        const resJson = await response.json();
        throw new Error(resJson.error || 'Failed to fetch demand signals');
      }
      const resJson = await response.json();
      setData(resJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminKey]);

  // Aggregation logic
  const totalSignals = data.length;

  // Top Product
  const productCounts: { [key: string]: number } = {};
  data.forEach((sig) => {
    const formattedName = sig.product.trim();
    productCounts[formattedName] = (productCounts[formattedName] || 0) + 1;
  });
  const topProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Top Industry
  const industryCounts: { [key: string]: number } = {};
  data.forEach((sig) => {
    industryCounts[sig.industry] = (industryCounts[sig.industry] || 0) + 1;
  });
  const topIndustry = Object.entries(industryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Top Country
  const countryCounts: { [key: string]: number } = {};
  data.forEach((sig) => {
    if (sig.country) {
      countryCounts[sig.country] = (countryCounts[sig.country] || 0) + 1;
    }
  });
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Product Ranking (top 5) for visual charts
  const sortedProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Industry Ranking (top 5)
  const sortedIndustries = Object.entries(industryCounts)
    .sort((a, b) => b[1] - a[1]);

  const handleExportCsv = () => {
    window.open(`/api/export-csv?key=${encodeURIComponent(adminKey)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#16a34a]" />
        <span className="text-sm">Loading market intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-[#0f172a]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e7eb] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#16a34a]" />
            Market Intelligence Portal
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time demand signals collected from international agribusinesses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-slate-50 text-slate-655 disabled:opacity-50 transition-all cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#16a34a]' : 'text-slate-500'}`} />
          </button>
          
          <button
            onClick={handleExportCsv}
            disabled={totalSignals === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold shadow-[0_4px_12px_rgba(22,163,74,0.1)] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Lock Portal
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Signals */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Signals</span>
            <Activity className="w-5 h-5 text-[#16a34a]" />
          </div>
          <div className="text-3xl font-extrabold text-[#0f172a] mt-2">
            {totalSignals.toLocaleString()}
          </div>
          <div className="text-slate-500 text-[10px] mt-1 font-medium">
            Aggregated requests count
          </div>
        </div>

        {/* Top Product */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Top Product</span>
            <ShoppingBag className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-[#0f172a] mt-2 truncate" title={topProduct}>
            {topProduct}
          </div>
          <div className="text-slate-500 text-[10px] mt-1.5 font-medium">
            Highest submission count
          </div>
        </div>

        {/* Top Industry */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Top Industry</span>
            <Landmark className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-[#0f172a] mt-2 truncate" title={topIndustry}>
            {topIndustry}
          </div>
          <div className="text-slate-500 text-[10px] mt-1.5 font-medium">
            Most active sector
          </div>
        </div>

        {/* Top Country */}
        <div className="bg-white border border-[#e5e7eb] p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Top Country</span>
            <Globe className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-lg font-bold text-[#0f172a] mt-2 truncate" title={topCountry}>
            {topCountry}
          </div>
          <div className="text-slate-500 text-[10px] mt-1.5 font-medium">
            Leading demand location
          </div>
        </div>
      </div>

      {totalSignals === 0 ? (
        <div className="text-center py-20 bg-white border border-[#e5e7eb] rounded-3xl shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-700 font-bold mb-1 text-base">No Data Available</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            Once businesses start submitting requirements on the landing page, aggregation statistics will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Aggregations Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Chart */}
            <div className="bg-white border border-[#e5e7eb] p-6 rounded-3xl space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Top Demanded Products</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Agricultural products with highest demand signals.</p>
              </div>

              <div className="space-y-4">
                {sortedProducts.map(([product, count]) => {
                  const maxCount = sortedProducts[0]?.[1] || 1;
                  const percentage = (count / maxCount) * 100;
                  return (
                    <div key={product} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{product}</span>
                        <span className="text-[#16a34a] font-bold">{count} requests</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#16a34a] rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Industry Distribution Chart */}
            <div className="bg-white border border-[#e5e7eb] p-6 rounded-3xl space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Industry Breakdown</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Distribution of requests across sectors.</p>
              </div>

              <div className="space-y-4">
                {sortedIndustries.map(([ind, count]) => {
                  const percentage = ((count / totalSignals) * 100).toFixed(0);
                  return (
                    <div key={ind} className="flex items-center gap-3">
                      <div className="text-xs text-slate-700 w-32 shrink-0 truncate font-semibold">{ind}</div>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#16a34a] rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-[#16a34a] font-bold w-10 text-right">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submission Details Table */}
          <div className="bg-white border border-[#e5e7eb] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#e5e7eb]">
              <h3 className="text-sm font-bold text-[#0f172a]">All Demand Submissions</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Detailed view of every demand signal recorded.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-4">Industry</th>
                    <th className="py-3.5 px-4 text-right">Quantity</th>
                    <th className="py-3.5 px-4">Company</th>
                    <th className="py-3.5 px-4">Country</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-6">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb]/80 text-xs text-slate-700">
                  {data.map((sig) => (
                    <tr key={sig.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {sig.product}
                        {sig.additional_requirements && (
                          <div className="text-[10px] text-slate-500 font-normal mt-1 max-w-xs truncate" title={sig.additional_requirements}>
                            {sig.additional_requirements}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{sig.industry}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#16a34a]">
                        {Number(sig.quantity).toLocaleString()} <span className="text-slate-500 text-[10px] font-normal">{sig.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[120px] truncate" title={sig.company_name || '-'}>
                        {sig.company_name || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[100px] truncate" title={sig.country || '-'}>
                        {sig.country || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[120px] truncate" title={sig.contact || '-'}>
                        {sig.contact || <span className="text-slate-300">-</span>}
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap font-medium">
                        {sig.created_at ? new Date(sig.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
