// src/app/api/admin/quiz-configs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data, error } = await supabase
    .from('cms_pages').select('*').like('id', 'quiz_%').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const defaultQuiz = { id: 'component_quiz', label: 'Standard Quiz', path: '(Komponente)', is_system: true };
  return NextResponse.json({ ok: true, data: [defaultQuiz, ...(data || [])] });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { label, source_id } = await req.json().catch(() => ({}));
  if (!label) return NextResponse.json({ error: 'label required' }, { status: 400 });

  const id = `quiz_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
  const { data: newPage, error: pageError } = await supabase
    .from('cms_pages')
    .insert({ id, label, path: '(Quiz-Variante)', is_system: false })
    .select().single();
  if (pageError) return NextResponse.json({ error: pageError.message }, { status: 500 });

  const sourcePageId = source_id || 'component_quiz';
  const { data: sourceContent } = await supabase
    .from('cms_content').select('*').eq('page', sourcePageId);
  if (sourceContent?.length) {
    await supabase.from('cms_content').insert(
      sourceContent.map(c => ({
        page: id, section_key: c.section_key, field_key: c.field_key,
        value: c.value, updated_at: new Date().toISOString(),
      }))
    );
  }
  return NextResponse.json({ ok: true, data: newPage });
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (id === 'component_quiz') return NextResponse.json({ error: 'cannot delete default quiz' }, { status: 400 });

  const { data: page } = await supabase.from('cms_pages').select('*').eq('id', id).single();
  if (!page) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (page.is_system) return NextResponse.json({ error: 'cannot delete system quiz' }, { status: 403 });

  await supabase.from('cms_content').delete().eq('page', id);
  await supabase.from('cms_sections').delete().eq('page_id', id);
  const { error: delError } = await supabase.from('cms_pages').delete().eq('id', id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  try { revalidatePath('/'); } catch {}
  return NextResponse.json({ ok: true });
}
