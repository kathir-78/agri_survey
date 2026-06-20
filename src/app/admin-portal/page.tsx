'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPortalPage() {
  const [accessKey, setAccessKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  // Check sessionStorage on mount
  useEffect(() => {
    const key = sessionStorage.getItem('admin_access_key');
    if (key) {
      setSavedKey(key);
      testKey(key);
    }
  }, []);

  const testKey = async (keyToTest: string) => {
    setIsVerifying(true);
    setErrorMsg('');
    try {
      const response = await fetch(`/api/demand-signals?key=${encodeURIComponent(keyToTest)}`);
      if (response.ok) {
        sessionStorage.setItem('admin_access_key', keyToTest);
        setSavedKey(keyToTest);
        setIsAuthorized(true);
      } else {
        sessionStorage.removeItem('admin_access_key');
        setErrorMsg('Invalid portal access key.');
      }
    } catch (err) {
      setErrorMsg('Network error. Unable to contact server.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      setErrorMsg('Please enter your access key.');
      return;
    }
    testKey(accessKey.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_access_key');
    setSavedKey(null);
    setAccessKey('');
    setIsAuthorized(false);
    setErrorMsg('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f8fcf8] to-[#f5f8f6] text-[#0f172a]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col justify-center">
        {isAuthorized && savedKey ? (
          <AdminDashboard adminKey={savedKey} onLogout={handleLogout} />
        ) : (
          <div className="w-full max-w-md mx-auto bg-white border border-[#e5e7eb] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-350">
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex p-3.5 bg-[#edfdf2] rounded-2xl border border-[#bbf7d0] text-[#16a34a]">
                <KeyRound className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">Restricted Access</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                This area contains confidential agricultural demand metrics. Enter your security key to proceed.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 mb-5 bg-rose-550/10 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-650 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="portalKey" className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">
                  Portal Key
                </label>
                <input
                  type="password"
                  id="portalKey"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Enter security key"
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] bg-white text-[#0f172a] placeholder-[#94a3b8] text-sm outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] hover:border-slate-350 transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(22,163,74,0.1)] disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Verifying authorization...
                  </>
                ) : (
                  'Authorize Access'
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#16a34a] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to landing page
              </Link>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
