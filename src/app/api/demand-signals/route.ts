import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INDUSTRIES } from '@/types';

export const runtime = 'nodejs';
export const preferredRegion = 'bom1';

// ─── Helpers ────────────────────────────────────────────

// Helper to check admin authorization
function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey) return false;

  // Check query parameter
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get('key');
  if (queryKey === adminKey) return true;

  // Check header
  const headerKey = request.headers.get('x-admin-key');
  if (headerKey === adminKey) return true;

  // Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === adminKey) return true;
  }

  return false;
}

// Gibberish check: returns true if any whitespace-separated word exceeds the threshold length
function isGibberish(value: string, threshold: number): boolean {
  const words = value.split(/\s+/);
  return words.some((word) => word.length > threshold);
}

// Layer 3 — Content flagging keyword list
const FLAGGED_KEYWORDS = [
  'kill', 'murder', 'assault', 'attack', 'bomb', 'terror',
  'weapon', 'explode', 'shoot', 'stab', 'threat', 'violence',
  'porn', 'xxx', 'nude', 'explicit', 'sexual', 'obscene',
  'hack', 'phishing', 'malware', 'ransomware',
];

function shouldFlag(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return FLAGGED_KEYWORDS.some((kw) => lower.includes(kw));
}

// Valid unit values (must match frontend UNITS array)
const VALID_UNITS = ['kg', 'tonnes', 'liters', 'units'];

// ─── GET /api/demand-signals (Private, admin only) ──────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid admin key' },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('demand_signals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}

// ─── POST /api/demand-signals (Public) ──────────────────

export async function POST(request: NextRequest) {
  try {
    // ═══ STEP 1 — Extract the real client IP ═══
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || 'unknown';
    console.log('[demand-signals] Client IP:', ip);

    const body = await request.json();

    // ═══ STEP 2 — Honeypot check ═══
    // If the invisible "website" field has any value, a bot filled it.
    // Silently return 201 without touching the database.
    if (body.website) {
      return NextResponse.json(
        { success: true, data: body },
        { status: 201 }
      );
    }

    // ═══ STEP 3 — Rate limit check (Supabase-backed) ═══
    const { data: rateLimitAllowed, error: rateLimitError } = 
      await supabase.rpc('check_and_log_rate_limit', {
        p_ip_address: ip,
        p_window_minutes: 10,
        p_max_requests: 5
      });

    console.log('[demand-signals] Rate limit check:', { ip, allowed: rateLimitAllowed });

    if (rateLimitError) {
      console.error('[demand-signals] Rate limit RPC error:', rateLimitError.message);
      // Fail open on DB errors, same as before
    }

    if (!rateLimitError && rateLimitAllowed === false) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // ═══ STEP 4 — Server-side field validation ═══
    const {
      product,
      industry,
      quantity,
      unit,
      company_name,
      country,
      contact,
      additional_requirements
    } = body;

    // 4a. Product: required, 2-100 chars, no word > 30 chars
    if (!product || typeof product !== 'string' || product.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid product name (at least 2 characters).' },
        { status: 400 }
      );
    }
    if (product.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Product name must be under 100 characters.' },
        { status: 400 }
      );
    }
    if (isGibberish(product.trim(), 30)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid product name, not random text.' },
        { status: 400 }
      );
    }

    // 4b. Industry: required, 2-50 chars, standard list OR letters/spaces/&- only
    if (!industry || typeof industry !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid Industry is required.' },
        { status: 400 }
      );
    }
    const isStandard = INDUSTRIES.includes(industry as any);
    const trimmedIndustry = industry.trim();
    if (!isStandard) {
      if (trimmedIndustry.length < 2 || trimmedIndustry.length > 50) {
        return NextResponse.json(
          { success: false, error: 'Industry must be between 2 and 50 characters.' },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z\s&-]+$/.test(trimmedIndustry)) {
        return NextResponse.json(
          { success: false, error: 'Industry must contain only letters, spaces, & or -.' },
          { status: 400 }
        );
      }
    }

    // 4c. Quantity: required, 0.01 to 1,000,000
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity < 0.01) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be at least 0.01.' },
        { status: 400 }
      );
    }
    if (numQuantity > 1000000) {
      return NextResponse.json(
        { success: false, error: 'Quantity seems unusually high. Please enter a realistic typical purchase volume.' },
        { status: 400 }
      );
    }

    // 4d. Unit: required, must be one of the valid values
    if (!unit || typeof unit !== 'string' || !VALID_UNITS.includes(unit.trim())) {
      return NextResponse.json(
        { success: false, error: 'Unit must be one of: kg, tonnes, liters, units.' },
        { status: 400 }
      );
    }

    // 4e. Company name: optional, max 80 chars, no word > 25 chars
    if (company_name && typeof company_name === 'string') {
      const trimmedCompany = company_name.trim();
      if (trimmedCompany.length > 80) {
        return NextResponse.json(
          { success: false, error: 'Company name must be under 80 characters.' },
          { status: 400 }
        );
      }
      if (isGibberish(trimmedCompany, 25)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid company name.' },
          { status: 400 }
        );
      }
    }

    // 4f. Contact: optional, max 100 chars, valid email or phone (7-15 digits)
    if (contact && typeof contact === 'string') {
      const trimmedContact = contact.trim();
      if (trimmedContact.length > 100) {
        return NextResponse.json(
          { success: false, error: 'Contact info must be under 100 characters.' },
          { status: 400 }
        );
      }
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact);
      const digitsOnly = trimmedContact.replace(/[^0-9]/g, '');
      const isPhone = /^[+\-\s0-9]+$/.test(trimmedContact) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
      if (!isEmail && !isPhone) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address or phone number.' },
          { status: 400 }
        );
      }
    }

    // 4g. Additional requirements: optional, max 500 chars, no word > 40 chars
    if (additional_requirements && typeof additional_requirements === 'string') {
      const trimmedReqs = additional_requirements.trim();
      if (trimmedReqs.length > 500) {
        return NextResponse.json(
          { success: false, error: 'Additional market context must be under 500 characters.' },
          { status: 400 }
        );
      }
      if (isGibberish(trimmedReqs, 40)) {
        return NextResponse.json(
          { success: false, error: 'Please avoid random text — share real details about your sourcing needs.' },
          { status: 400 }
        );
      }
    }

    // ═══ STEP 5 — Content flagging ═══
    const trimmedAdditional = additional_requirements ? additional_requirements.trim() : null;
    const flagged = shouldFlag(trimmedAdditional || '');

    // ═══ STEP 6 — Geolocation extraction (Vercel built-in headers) ═══
    const submissionCountry = request.headers.get('x-vercel-ip-country') || null;
    const submissionRegion = request.headers.get('x-vercel-ip-country-region') || null;
    const submissionCity = request.headers.get('x-vercel-ip-city') || null;

    // ═══ STEP 7 — Insert demand signal ═══
    const { data: insertedData, error: insertError } = await supabase
      .from('demand_signals')
      .insert([
        {
          product: product.trim(),
          industry: trimmedIndustry,
          quantity: numQuantity,
          unit: unit.trim(),
          company_name: company_name ? company_name.trim() : null,
          country: country ? country.trim() : null,
          contact: contact ? contact.trim() : null,
          additional_requirements: trimmedAdditional,
          flagged,
          submission_country: submissionCountry,
          submission_region: submissionRegion,
          submission_city: submissionCity,
        }
      ])
      .select();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    // ═══ STEP 9 — Return filtered success response ═══
    const record = insertedData?.[0];
    return NextResponse.json(
      {
        success: true,
        data: {
          id: record?.id,
          product: record?.product,
          industry: record?.industry,
          quantity: record?.quantity,
          unit: record?.unit,
          company_name: record?.company_name,
          country: record?.country,
          contact: record?.contact,
          additional_requirements: record?.additional_requirements,
          created_at: record?.created_at,
        }
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
