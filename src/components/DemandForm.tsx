'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import CountrySelect from './CountrySelect';
import { INDUSTRIES, UNITS, DemandSignal } from '@/types';

const isGibberish = (value: string, threshold: number): boolean => {
  const words = value.split(/\s+/);
  return words.some((word) => word.length > threshold);
};

export default function DemandForm() {
  // Form values
  const [product, setProduct] = useState('');
  const [industry, setIndustry] = useState('');
  const [otherIndustry, setOtherIndustry] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [contact, setContact] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  // UI States
  const [showOptional, setShowOptional] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<DemandSignal | null>(null);

  // Field validation states (touched & errors)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    if (name === 'product') {
      const trimmed = value.trim();
      if (!trimmed) {
        newErrors.product = 'Please specify the product your business sources.';
      } else if (trimmed.length < 2) {
        newErrors.product = 'Please enter a valid product name.';
      } else if (trimmed.length > 100) {
        newErrors.product = 'Product name must be under 100 characters.';
      } else if (isGibberish(trimmed, 30)) {
        newErrors.product = 'Please enter a valid product name, not random text.';
      } else {
        delete newErrors.product;
      }
    }

    if (name === 'industry') {
      if (!value) {
        newErrors.industry = 'Please select your industry.';
      } else {
        delete newErrors.industry;
      }
    }

    if (name === 'otherIndustry') {
      const trimmed = value.trim();
      if (!trimmed) {
        newErrors.otherIndustry = 'Please specify your industry.';
      } else if (trimmed.length < 2) {
        newErrors.otherIndustry = 'Industry name must be at least 2 characters.';
      } else if (trimmed.length > 50) {
        newErrors.otherIndustry = 'Industry name must be under 50 characters.';
      } else if (!/^[a-zA-Z\s&-]+$/.test(trimmed)) {
        newErrors.otherIndustry = 'Please use letters only (e.g. Floriculture, Dairy, Textile).';
      } else {
        delete newErrors.otherIndustry;
      }
    }

    if (name === 'quantity') {
      const num = Number(value);
      if (!value) {
        newErrors.quantity = 'Please enter a quantity.';
      } else if (isNaN(num) || num <= 0) {
        newErrors.quantity = 'Quantity must be a positive number.';
      } else if (num > 1000000) {
        newErrors.quantity = 'Quantity seems unusually high. Please enter a realistic typical purchase volume.';
      } else {
        delete newErrors.quantity;
      }
    }

    if (name === 'companyName') {
      const trimmed = value.trim();
      if (trimmed) {
        if (trimmed.length > 80) {
          newErrors.companyName = 'Company name must be under 80 characters.';
        } else if (isGibberish(trimmed, 25)) {
          newErrors.companyName = 'Please enter a valid company name.';
        } else {
          delete newErrors.companyName;
        }
      } else {
        delete newErrors.companyName;
      }
    }

    if (name === 'contact') {
      const trimmed = value.trim();
      if (trimmed) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        const digitsOnly = trimmed.replace(/[^0-9]/g, '');
        const isPhone = /^[+\-\s0-9]+$/.test(trimmed) && digitsOnly.length >= 7 && digitsOnly.length <= 15;

        if (trimmed.length > 100) {
          newErrors.contact = 'Contact info must be under 100 characters.';
        } else if (!isEmail && !isPhone) {
          newErrors.contact = 'Please enter a valid email, phone number';
        } else {
          delete newErrors.contact;
        }
      } else {
        delete newErrors.contact;
      }
    }

    if (name === 'additionalRequirements') {
      const trimmed = value.trim();
      if (trimmed) {
        if (trimmed.length > 500) {
          newErrors.additionalRequirements = 'Market context must be under 500 characters.';
        } else if (isGibberish(trimmed, 40)) {
          newErrors.additionalRequirements = 'Please avoid random text — share real details about your sourcing needs.';
        } else {
          delete newErrors.additionalRequirements;
        }
      } else {
        delete newErrors.additionalRequirements;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Final validation
    const tempErrors: { [key: string]: string } = {};
    
    // 1. Product Needed
    const trimmedProduct = product.trim();
    if (!trimmedProduct) {
      tempErrors.product = 'Please specify the product your business sources.';
    } else if (trimmedProduct.length < 2) {
      tempErrors.product = 'Please enter a valid product name.';
    } else if (trimmedProduct.length > 100) {
      tempErrors.product = 'Product name must be under 100 characters.';
    } else if (isGibberish(trimmedProduct, 30)) {
      tempErrors.product = 'Please enter a valid product name, not random text.';
    }
    
    // 2. Industry
    if (!industry) {
      tempErrors.industry = 'Please select your industry.';
    } else if (industry === 'Other') {
      const trimmedOther = otherIndustry.trim();
      if (!trimmedOther) {
        tempErrors.otherIndustry = 'Please specify your industry.';
      } else if (trimmedOther.length < 2) {
        tempErrors.otherIndustry = 'Industry name must be at least 2 characters.';
      } else if (trimmedOther.length > 50) {
        tempErrors.otherIndustry = 'Industry name must be under 50 characters.';
      } else if (!/^[a-zA-Z\s&-]+$/.test(trimmedOther)) {
        tempErrors.otherIndustry = 'Please use letters only (e.g. Floriculture, Dairy, Textile).';
      }
    }

    // 3. Typical Purchase Volume
    const numQty = Number(quantity);
    if (!quantity) {
      tempErrors.quantity = 'Please enter a quantity.';
    } else if (isNaN(numQty) || numQty <= 0) {
      tempErrors.quantity = 'Quantity must be a positive number.';
    } else if (numQty > 1000000) {
      tempErrors.quantity = 'Quantity seems unusually high. Please enter a realistic typical purchase volume.';
    }

    // 4. Company Name (optional)
    const trimmedCompany = companyName.trim();
    if (trimmedCompany) {
      if (trimmedCompany.length > 80) {
        tempErrors.companyName = 'Company name must be under 80 characters.';
      } else if (isGibberish(trimmedCompany, 25)) {
        tempErrors.companyName = 'Please enter a valid company name.';
      }
    }

    // 5. Contact (optional)
    const trimmedContact = contact.trim();
    if (trimmedContact) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact);
      const digitsOnly = trimmedContact.replace(/[^0-9]/g, '');
      const isPhone = /^[+\-\s0-9]+$/.test(trimmedContact) && digitsOnly.length >= 7 && digitsOnly.length <= 15;

      if (trimmedContact.length > 100) {
        tempErrors.contact = 'Contact info must be under 100 characters.';
      } else if (!isEmail && !isPhone) {
        tempErrors.contact = 'Please enter a valid email, phone number';
      }
    }

    // 6. Additional Market Context (optional)
    const trimmedAddReq = additionalRequirements.trim();
    if (trimmedAddReq) {
      if (trimmedAddReq.length > 500) {
        tempErrors.additionalRequirements = 'Market context must be under 500 characters.';
      } else if (isGibberish(trimmedAddReq, 40)) {
        tempErrors.additionalRequirements = 'Please avoid random text — share real details about your sourcing needs.';
      }
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/demand-signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: product.trim(),
          industry: industry === 'Other' ? otherIndustry.trim() : industry,
          quantity: numQty,
          unit,
          company_name: companyName ? companyName.trim() : null,
          country: country ? country.trim() : null,
          contact: contact ? contact.trim() : null,
          additional_requirements: additionalRequirements ? additionalRequirements.trim() : null,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to submit demand signal');
      }

      setSuccessData(resData.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProduct('');
    setIndustry('');
    setOtherIndustry('');
    setQuantity('');
    setUnit('kg');
    setCompanyName('');
    setCountry('');
    setContact('');
    setAdditionalRequirements('');
    setShowOptional(false);
    setSuccessData(null);
    setErrors({});
    setErrorMsg('');
  };

  if (successData) {
    return (
      <div className="w-full max-w-xl mx-auto text-center py-12 px-6 bg-white border border-[#e5e7eb] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-95 duration-500">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-[#edfdf2] animate-ping duration-1000"></div>
          <div className="absolute inset-2 rounded-full bg-[#dcfce7] animate-pulse"></div>
          <CheckCircle2 className="w-16 h-16 text-[#16a34a] relative z-10" />
        </div>

        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight mb-2">
          Response Submitted
        </h2>
        <p className="text-[#475569] text-sm max-w-md mx-auto mb-8 whitespace-pre-line">
          This response has been added to our research dataset.
        </p>

        <div className="text-left bg-[#edfdf2] border border-[#bbf7d0] rounded-2xl p-6 mb-8 max-w-md mx-auto">
          <h3 className="text-xs font-bold text-[#166534] uppercase tracking-widest mb-3">
            Submission Summary
          </h3>
          <div className="space-y-2.5 text-sm text-[#0f172a]">
            <div className="flex justify-between border-b border-[#bbf7d0]/40 pb-1.5">
              <span className="text-[#166534]/70 font-semibold">Product of Interest:</span>
              <span className="font-semibold">{successData.product}</span>
            </div>
            <div className="flex justify-between border-b border-[#bbf7d0]/40 pb-1.5">
              <span className="text-[#166534]/70 font-semibold">Industry:</span>
              <span className="font-semibold">{successData.industry}</span>
            </div>
            <div className="flex justify-between border-b border-[#bbf7d0]/40 pb-1.5">
              <span className="text-[#166534]/70 font-semibold">Typical Quantity:</span>
              <span className="font-semibold">
                {Number(successData.quantity).toLocaleString()} {successData.unit}
              </span>
            </div>
            {successData.company_name && (
              <div className="flex justify-between border-b border-[#bbf7d0]/40 pb-1.5">
                <span className="text-[#166534]/70 font-semibold">Company:</span>
                <span className="font-semibold">{successData.company_name}</span>
              </div>
            )}
            {successData.country && (
              <div className="flex justify-between border-b border-[#bbf7d0]/40 pb-1.5">
                <span className="text-[#166534]/70 font-semibold">Country:</span>
                <span className="font-semibold">{successData.country}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(22,163,74,0.15)] hover:shadow-[0_4px_16px_rgba(22,163,74,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-[#e5e7eb] rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Top Accent Line */}
      <div className="h-1.5 bg-[#16a34a] w-full" />

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#16a34a]" />
            Share Your Market Insight
          </h2>
          <p className="text-[#475569] text-xs mt-1 font-medium">
            Tell us what agricultural products your business typically sources or uses.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Required Fields Section */}
        <div className="space-y-5">

          {/* Product of Interest */}
          <div>
            <label
              htmlFor="product"
              className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2"
            >
              Product of Interest <span className="text-[#16a34a]">*</span>
            </label>
            <input
              type="text"
              id="product"
              value={product}
              onChange={(e) => {
                setProduct(e.target.value);
                validateField('product', e.target.value);
              }}
              onBlur={(e) => validateField('product', e.target.value)}
              placeholder="Moringa Powder, Turmeric, Aloe Vera, Rose Petals"
              className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0f172a] placeholder-[#94a3b8] text-sm outline-none transition-all duration-200 ${
                errors.product
                  ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                  : 'border-[#e5e7eb] hover:border-slate-300 focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]'
              }`}
            />
            {errors.product && (
              <p className="text-xs text-rose-600 mt-1.5 ml-1">{errors.product}</p>
            )}
          </div>

          {/* Industry */}
          <div>
            <label
              htmlFor="industry"
              className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2"
            >
              Industry <span className="text-[#16a34a]">*</span>
            </label>
            <div className="relative">
              <select
                id="industry"
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value);
                  // Clear otherIndustry when switching away from Other
                  if (e.target.value !== 'Other') {
                    setOtherIndustry('');
                    const newErrors = { ...errors };
                    delete newErrors.otherIndustry;
                    setErrors(newErrors);
                  }
                  validateField('industry', e.target.value);
                }}
                onBlur={(e) => validateField('industry', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0f172a] outline-none transition-all duration-200 appearance-none text-sm cursor-pointer ${
                  errors.industry
                    ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                    : 'border-[#e5e7eb] hover:border-slate-300 focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]'
                } ${!industry ? 'text-[#94a3b8]' : 'text-[#0f172a]'}`}
              >
                <option value="" disabled>Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-white text-slate-800">
                    {ind}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
            {errors.industry && (
              <p className="text-xs text-rose-600 mt-1.5 ml-1">{errors.industry}</p>
            )}
          </div>

          {/* Other Industry — only shows when "Other" is selected */}
          {industry === 'Other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label
                htmlFor="otherIndustry"
                className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2"
              >
                Please Specify Your Industry <span className="text-[#16a34a]">*</span>
              </label>
              <input
                type="text"
                id="otherIndustry"
                value={otherIndustry}
                onChange={(e) => {
                  setOtherIndustry(e.target.value);
                  validateField('otherIndustry', e.target.value);
                }}
                onBlur={(e) => validateField('otherIndustry', e.target.value)}
                placeholder="Type your industry here (e.g. Floriculture, Textile, Dairy, Aquaculture...)"
                className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0f172a] placeholder-[#94a3b8] text-sm outline-none transition-all duration-200 ${
                  errors.otherIndustry
                    ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                    : 'border-[#e5e7eb] hover:border-slate-300 focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]'
                }`}
              />
              {errors.otherIndustry && (
                <p className="text-xs text-rose-600 mt-1.5 ml-1">{errors.otherIndustry}</p>
              )}
            </div>
          )}

          {/* Quantity and Unit in 2-column grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="quantity"
                className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 min-h-[32px] md:min-h-0"
              >
                Typical Purchase Volume <span className="text-[#16a34a]">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  validateField('quantity', e.target.value);
                }}
                onBlur={(e) => validateField('quantity', e.target.value)}
                placeholder="e.g. 500"
                className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0f172a] placeholder-[#94a3b8] text-sm outline-none transition-all duration-200 ${
                  errors.quantity
                    ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                    : 'border-[#e5e7eb] hover:border-slate-300 focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]'
                }`}
              />
              {errors.quantity && (
                <p className="text-xs text-rose-600 mt-1.5 ml-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="unit"
                className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 min-h-[32px] md:min-h-0"
              >
                Unit <span className="text-[#16a34a]">*</span>
              </label>
              <div className="relative">
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e7eb] bg-white text-[#0f172a] outline-none transition-all duration-200 appearance-none text-sm cursor-pointer hover:border-slate-300 focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value} className="bg-white text-slate-800">
                      {u.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Optional Fields Accordion */}
        <div className="border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center justify-between w-full py-2 text-slate-650 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <span>Business Details (Optional)</span>
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-300 ${
                showOptional ? 'rotate-90 text-[#16a34a]' : ''
              }`}
            />
          </button>

          {showOptional && (
            <p className="text-[11px] text-slate-500 mt-1.5 leading-normal">
              Optional information helps us better understand the market context behind your response.
            </p>
          )}

          <div
            className={`transition-all duration-300 overflow-hidden ${
              showOptional ? 'max-h-[500px] opacity-100 mt-4 space-y-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    validateField('companyName', e.target.value);
                  }}
                  onBlur={(e) => validateField('companyName', e.target.value)}
                  placeholder="Your company name"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[#0f172a] placeholder-[#94a3b8] text-sm outline-none focus:border-[#16a34a]/50 hover:border-slate-300 focus:ring-1 focus:ring-[#16a34a] transition-all ${
                    errors.companyName
                      ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                      : 'border-[#e5e7eb]'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-xs text-rose-600 mt-1.5 ml-1">{errors.companyName}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Country
                </label>
                <CountrySelect
                  value={country}
                  onChange={setCountry}
                  placeholder="Select sourcing country"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <label
                htmlFor="contact"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                Contact (Optional — only if you want updates on findings)
              </label>
              <input
                type="text"
                id="contact"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  validateField('contact', e.target.value);
                }}
                onBlur={(e) => validateField('contact', e.target.value)}
                placeholder="Email address (optional)"
                className={`w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white text-[#0f172a] placeholder-[#94a3b8] text-sm outline-none focus:border-[#16a34a]/50 hover:border-slate-300 focus:ring-1 focus:ring-[#16a34a] transition-all ${
                  errors.contact
                    ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                    : 'border-[#e5e7eb]'
                }`}
              />
              {errors.contact && (
                <p className="text-xs text-rose-600 mt-1.5 ml-1">{errors.contact}</p>
              )}
            </div>

            {/* Additional Market Context */}
            <div>
              <label
                htmlFor="additionalRequirements"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                Additional Market Context
              </label>
              <textarea
                id="additionalRequirements"
                rows={3}
                value={additionalRequirements}
                onChange={(e) => {
                  setAdditionalRequirements(e.target.value);
                  validateField('additionalRequirements', e.target.value);
                }}
                onBlur={(e) => validateField('additionalRequirements', e.target.value)}
                placeholder="Share any additional details about the products your business typically sources — preferred standards, certifications, grade, or form (e.g. Organic, Kosher, GMP, Powder, Raw)"
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-[#0f172a] placeholder-[#94a3b8] text-sm outline-none focus:border-[#16a34a]/50 hover:border-slate-300 focus:ring-1 focus:ring-[#16a34a] transition-all resize-none ${
                  errors.additionalRequirements
                    ? 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.08)]'
                    : 'border-[#e5e7eb]'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.additionalRequirements ? (
                  <p className="text-xs text-rose-600 ml-1">{errors.additionalRequirements}</p>
                ) : (
                  <span />
                )}
                <span className="text-[10px] text-slate-400 font-medium mr-1 select-none">
                  {additionalRequirements.length}/500
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm shadow-[0_4px_12px_rgba(22,163,74,0.12)] hover:shadow-[0_4px_16px_rgba(22,163,74,0.22)] disabled:opacity-60 disabled:pointer-events-none hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Submitting...
            </>
          ) : (
            'Submit My Response'
          )}
        </button>

        {/* Trust Statement */}
      </form>
    </div>
  );
}