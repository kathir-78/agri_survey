# Agricultural Demand Signal Platform

A lightweight data collection and market insights validation platform for the agricultural industry. Collects demand signals from cosmetics, nutraceuticals, pharma, food processing, exporters, wholesalers, and retailers.

## Features
- **Public Demand Collection Form**: High-converting 30-second form with input validation, collapsible optional fields, and searchable country selector.
- **Private Admin Portal (`/admin-portal`)**: Passcode-protected view with aggregated statistics, submission details, and a CSV export feature for offline analysis.
- **Zero Friction**: No login required for submitting companies, maximizing submission rates.

---

## Database Setup

This project uses **Supabase PostgreSQL** as its database.

### 1. Create the `demand_signals` Table

Run the following SQL query in your Supabase SQL Editor:

```sql
CREATE TABLE demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product TEXT NOT NULL,
  industry TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  company_name TEXT,
  country TEXT,
  contact TEXT,
  additional_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (optional, or configure public insert/select)
-- For public submission and key-secured admin access, you can allow insert from anon role:
ALTER TABLE demand_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" 
ON demand_signals 
FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow public select" 
ON demand_signals 
FOR SELECT 
TO anon 
USING (true);
```

---

## Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and configure your Supabase URL, Publishable Key, and desired admin access key:
```bash
cp .env.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to submit demand signals, or [http://localhost:3000/admin-portal](http://localhost:3000/admin-portal) to view insights and export CSV data.
