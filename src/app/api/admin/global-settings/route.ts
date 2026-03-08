// src/app/api/admin/global-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('global_settings').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const map: Record<string, string> = {};
  for (const row of data || []) map[row.key] = row.value;
  return NextResponse.json({ ok: true, data: map });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { updates } = await req.json().catch(() => ({}));
  if (!updates || typeof updates !== 'object') return NextResponse.json({ error: 'updates required' }, { status: 400 });
  for (const [key, value] of Object.entries(updates)) {
    await supabase.from('global_settings').upsert({ key, value: String(value), updated_at: new Date().toISOString() });
  }
  return NextResponse.json({ ok: true });
}

// Public GET for frontend (no auth needed)
export async function OPTIONS() {
  const { data } = await supabase.from('global_settings').select('*');
  const map: Record<string, string> = {};
  for (const row of data || []) map[row.key] = row.value;
  return NextResponse.json({ ok: true, data: map });
}
