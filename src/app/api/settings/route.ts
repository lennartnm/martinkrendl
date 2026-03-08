// src/app/api/settings/route.ts
// Public endpoint - returns global settings (font etc.) for frontend
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { data } = await supabase.from('global_settings').select('*');
  const map: Record<string, string> = {};
  for (const row of data || []) map[row.key] = row.value;
  return NextResponse.json({ ok: true, data: map });
}
