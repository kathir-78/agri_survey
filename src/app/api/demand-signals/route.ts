import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { INDUSTRIES } from '@/types';

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

// GET /api/demand-signals (Private, admin only)
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

// POST /api/demand-signals (Public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    // Validation
    if (!product || typeof product !== 'string' || product.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Product Needed is required' },
        { status: 400 }
      );
    }

    const isStandard = INDUSTRIES.includes(industry as any);
    const isValidCustom = typeof industry === 'string' &&
      industry.trim().length >= 2 &&
      industry.trim().length <= 50 &&
      /^[a-zA-Z\s&-]+$/.test(industry.trim());

    if (!industry || (!isStandard && !isValidCustom)) {
      return NextResponse.json(
        { success: false, error: 'Valid Industry is required' },
        { status: 400 }
      );
    }

    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    if (!unit || typeof unit !== 'string' || unit.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Unit is required' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('demand_signals')
      .insert([
        {
          product: product.trim(),
          industry,
          quantity: numQuantity,
          unit: unit.trim(),
          company_name: company_name ? company_name.trim() : null,
          country: country ? country.trim() : null,
          contact: contact ? contact.trim() : null,
          additional_requirements: additional_requirements ? additional_requirements.trim() : null
        }
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
