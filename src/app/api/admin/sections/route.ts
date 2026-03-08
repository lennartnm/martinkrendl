// src/app/api/admin/sections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const page_id = req.nextUrl.searchParams.get('page_id');
  if (!page_id) return NextResponse.json({ error: 'page_id required' }, { status: 400 });
  const { data, error } = await supabase.from('cms_sections').select('*').eq('page_id', page_id).order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { page_id, section_type, label, source_instance } = await req.json().catch(() => ({}));
  if (!page_id || !section_type || !label) return NextResponse.json({ error: 'page_id, section_type, label required' }, { status: 400 });

  const section_instance = `${section_type}_${Date.now().toString(36)}`;
  const { data: existing } = await supabase.from('cms_sections').select('sort_order').eq('page_id', page_id).order('sort_order', { ascending: false }).limit(1);
  const sort_order = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data: newSection, error } = await supabase.from('cms_sections')
    .insert({ page_id, section_instance, section_type, label, sort_order, hidden: false }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (source_instance) {
    const { data: src } = await supabase.from('cms_content').select('*').eq('page', page_id).eq('section_key', source_instance);
    if (src?.length) {
      await supabase.from('cms_content').insert(src.map(c => ({ page: page_id, section_key: section_instance, field_key: c.field_key, value: c.value, updated_at: new Date().toISOString() })));
    }
  }

  const { data: pageData } = await supabase.from('cms_pages').select('path').eq('id', page_id).single();
  if (pageData?.path) revalidatePath(pageData.path);
  return NextResponse.json({ ok: true, data: newSection });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { page_id, updates, settings } = await req.json().catch(() => ({}));
  if (!page_id || !updates?.length) return NextResponse.json({ error: 'page_id and updates required' }, { status: 400 });
  for (const u of updates) {
    const patch: Record<string, unknown> = {};
    if (u.sort_order !== undefined) patch.sort_order = u.sort_order;
    if (u.hidden !== undefined) patch.hidden = u.hidden;
    if (Object.keys(patch).length) await supabase.from('cms_sections').update(patch).eq('id', u.id);
  }
  // Save header/footer settings into cms_content
  if (settings && typeof settings === 'object') {
    const settingsEntries = [
      { field_key: 'show_header', value: String(settings.header_enabled !== false) },
      { field_key: 'show_footer', value: String(settings.footer_enabled !== false) },
    ];
    for (const entry of settingsEntries) {
      await supabase.from('cms_content').upsert({
        page: page_id,
        section_key: 'layout',
        field_key: entry.field_key,
        value: entry.value,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'page,section_key,field_key' });
    }
  }
  const { data: pageData } = await supabase.from('cms_pages').select('path').eq('id', page_id).single();
  if (pageData?.path) revalidatePath(pageData.path);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id, page_id, section_instance } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (page_id && section_instance) await supabase.from('cms_content').delete().eq('page', page_id).eq('section_key', section_instance);
  await supabase.from('cms_sections').delete().eq('id', id);
  const { data: pageData } = await supabase.from('cms_pages').select('path').eq('id', page_id).single();
  if (pageData?.path) revalidatePath(pageData.path);
  return NextResponse.json({ ok: true });
}
