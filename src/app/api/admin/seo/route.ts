// src/app/api/admin/seo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('seo_settings')
    .select('key, value')
    .order('key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { updates: { key: string; value: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.updates || !Array.isArray(body.updates) || body.updates.length === 0) {
    return NextResponse.json({ error: 'no_updates' }, { status: 400 });
  }

  for (const u of body.updates) {
    const { error } = await supabase
      .from('seo_settings')
      .upsert({ key: u.key, value: String(u.value).trim(), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
