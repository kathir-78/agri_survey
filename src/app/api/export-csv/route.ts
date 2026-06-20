import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_ACCESS_KEY;
  if (!adminKey) return false;

  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get('key');
  if (queryKey === adminKey) return true;

  const headerKey = request.headers.get('x-admin-key');
  if (headerKey === adminKey) return true;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === adminKey) return true;
  }

  return false;
}

function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If value contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse('Unauthorized: Invalid admin key', { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('demand_signals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return new NextResponse(`Database error: ${error.message}`, { status: 500 });
    }

    const headers = [
      'ID',
      'Product Needed',
      'Industry',
      'Quantity',
      'Unit',
      'Company Name',
      'Country',
      'Contact Info',
      'Additional Requirements',
      'Submitted At'
    ];

    const rows = (data || []).map((row) => [
      row.id,
      row.product,
      row.industry,
      row.quantity,
      row.unit,
      row.company_name || '',
      row.country || '',
      row.contact || '',
      row.additional_requirements || '',
      row.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(','))
    ].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="agricultural_demand_signals.csv"',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    return new NextResponse(`Server error: ${err?.message || 'Unknown error'}`, {
      status: 500
    });
  }
}
