// src/lib/supabase.ts
// Server-side Supabase Client (Service Role – nur auf dem Server verwenden!)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ── Typen ──────────────────────────────────────────────────────────────
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ready: string | null;
  experience: string | null;
  lesson_type: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  notes: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ip: string | null;
  created_at: string;
};

export type CmsEntry = {
  id: string;
  page: string;
  section_key: string;
  field_key: string;
  value: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  created_at: string;
};
