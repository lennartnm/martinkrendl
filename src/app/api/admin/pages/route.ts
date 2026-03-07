// src/app/api/admin/pages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabase.from('cms_pages').select('*').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { label, path, source_page } = body;
  if (!label || !path) return NextResponse.json({ error: 'label and path required' }, { status: 400 });

  const id = path.replace(/^\//, '').replace(/[^a-z0-9_]/gi, '_').replace(/_+/g, '_').toLowerCase() || 'page_' + Date.now();

  const { data: newPage, error: pageError } = await supabase
    .from('cms_pages').insert({ id, label, path, is_system: false }).select().single();
  if (pageError) return NextResponse.json({ error: pageError.message }, { status: 500 });

  if (source_page) {
    const { data: sourceSections } = await supabase
      .from('cms_sections').select('*').eq('page_id', source_page).order('sort_order');
    if (sourceSections?.length) {
      await supabase.from('cms_sections').insert(
        sourceSections.map(s => ({ page_id: id, section_instance: s.section_instance, section_type: s.section_type, label: s.label, sort_order: s.sort_order, hidden: s.hidden }))
      );
      const { data: sourceContent } = await supabase.from('cms_content').select('*').eq('page', source_page);
      if (sourceContent?.length) {
        await supabase.from('cms_content').insert(
          sourceContent.map(c => ({ page: id, section_key: c.section_key, field_key: c.field_key, value: c.value, updated_at: new Date().toISOString() }))
        );
      }
    }
  }

  revalidatePath('/');
  return NextResponse.json({ ok: true, data: newPage });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { data: page } = await supabase.from('cms_pages').select('is_system').eq('id', id).single();
  if (page?.is_system) return NextResponse.json({ error: 'cannot delete system page' }, { status: 403 });
  await supabase.from('cms_content').delete().eq('page', id);
  await supabase.from('cms_sections').delete().eq('page_id', id);
  await supabase.from('cms_pages').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
