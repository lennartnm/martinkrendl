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

// POST (page creation/duplication) has been disabled.
export async function POST() {
  return NextResponse.json(
    { error: 'Page creation is disabled. Pages are managed directly in the codebase.' },
    { status: 405 }
  );
}

export async function _POST_DISABLED(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { label, path, source_page } = body;
  if (!label || !path) return NextResponse.json({ error: 'label and path required' }, { status: 400 });

  // CRITICAL: Always store path as /p/<slug> so the Next.js [slug] route can find it.
  // The id is derived from the slug only (no /p/ prefix), using hyphens.
  const normalizedPath = path.startsWith('/p/')
    ? path
    : `/p/${path.replace(/^\/+/, '')}`;
  const slug = normalizedPath.replace(/^\/p\//, '');
  const id = slug
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `page-${Date.now().toString(36)}`;

  const { data: newPage, error: pageError } = await supabase
    .from('cms_pages')
    .insert({ id, label, path: normalizedPath, is_system: false })
    .select()
    .single();
  if (pageError) return NextResponse.json({ error: pageError.message }, { status: 500 });

  if (source_page) {
    const { data: sourceSections } = await supabase
      .from('cms_sections')
      .select('*')
      .eq('page_id', source_page)
      .order('sort_order');

    // instanceMap: old section_instance → new section_instance
    const instanceMap: Record<string, string> = {};

    if (sourceSections?.length) {
      const newSections = sourceSections.map((s, idx) => {
        // Use idx offset so sections in the same request never share a timestamp
        const uniqueTs = (Date.now() + idx).toString(36);
        const rand = Math.random().toString(36).slice(2, 6);
        const newInstance = `${s.section_type}_${uniqueTs}_${rand}`;
        instanceMap[s.section_instance] = newInstance;
        return {
          page_id: id,
          section_instance: newInstance,
          section_type: s.section_type,
          label: s.label,
          sort_order: s.sort_order,
          hidden: s.hidden,
        };
      });
      await supabase.from('cms_sections').insert(newSections);
    }

    // Copy content. Keys that match a known old section_instance get remapped;
    // shared keys (colors, links, images, layout) are copied as-is.
    const { data: sourceContent } = await supabase
      .from('cms_content')
      .select('*')
      .eq('page', source_page);
    if (sourceContent?.length) {
      await supabase.from('cms_content').insert(
        sourceContent.map(c => ({
          page: id,
          section_key: instanceMap[c.section_key] ?? c.section_key,
          field_key: c.field_key,
          value: c.value,
          updated_at: new Date().toISOString(),
        }))
      );
    }
  }

  try { revalidatePath(normalizedPath); } catch {}
  try { revalidatePath('/'); } catch {}
  return NextResponse.json({ ok: true, data: newPage });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data: page } = await supabase.from('cms_pages').select('*').eq('id', id).single();
  if (!page) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (page.is_system) return NextResponse.json({ error: 'cannot delete system page' }, { status: 403 });

  // Remove all associated data first, then the page record
  await Promise.all([
    supabase.from('cms_content').delete().eq('page', id),
    supabase.from('cms_sections').delete().eq('page_id', id),
  ]);
  const { error: delError } = await supabase.from('cms_pages').delete().eq('id', id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  // Bust the cache so the page immediately returns 404
  if (page.path) { try { revalidatePath(page.path); } catch {} }
  try { revalidatePath('/'); } catch {}

  return NextResponse.json({ ok: true });
}
