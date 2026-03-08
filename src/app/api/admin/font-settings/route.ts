// src/app/api/admin/font-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { data } = await supabase
    .from('cms_content')
    .select('value')
    .eq('page', 'global_settings')
    .eq('section_key', 'typography')
    .eq('field_key', 'font_family')
    .single();
  return NextResponse.json({ ok: true, font: data?.value || 'Open Sans' });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { font } = await req.json().catch(() => ({}));
  if (!font) return NextResponse.json({ error: 'font required' }, { status: 400 });

  await supabase.from('cms_content').upsert({
    page: 'global_settings',
    section_key: 'typography',
    field_key: 'font_family',
    value: font,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'page,section_key,field_key' });

  return NextResponse.json({ ok: true });
}
