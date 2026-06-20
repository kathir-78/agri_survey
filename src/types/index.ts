export interface DemandSignal {
  id?: string;
  product: string;
  industry: string;
  quantity: number;
  unit: string;
  company_name?: string;
  country?: string;
  contact?: string;
  additional_requirements?: string;
  created_at?: string;
}


export type IndustryType =
  | 'Cosmetics & Personal Care'
  | 'Food & Beverage'
  | 'Pharmaceuticals'
  | 'Nutraceuticals & Supplements'
  | 'Herbal & Ayurvedic Products'
  | 'Export & Trading'
  | 'Wholesale Distribution'
  | 'Other';

export const INDUSTRIES: IndustryType[] = [
  'Cosmetics & Personal Care',
  'Food & Beverage',
  'Pharmaceuticals',
  'Nutraceuticals & Supplements',
  'Herbal & Ayurvedic Products',
  'Export & Trading',
  'Wholesale Distribution',
  'Other'
];

export const UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'tonnes', label: 'Metric Tonnes' },
  { value: 'liters', label: 'Liters' },
  { value: 'units', label: 'Units / Pieces' }
];
