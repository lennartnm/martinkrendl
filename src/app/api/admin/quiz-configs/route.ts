// src/app/api/admin/quiz-configs/route.ts
// Manages multiple quiz configurations stored in cms_content under page='quiz_<id>'
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET: list all quiz configs
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Quiz configs are stored as cms_pages with id starting with 'quiz_'
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .like('id', 'quiz_%')
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also include the default quiz (component_quiz)
  const defaultQuiz = { id: 'component_quiz', label: 'Standard Quiz', path: '(Komponente)', is_system: true };

  return NextResponse.json({ ok: true, data: [defaultQuiz, ...(data || [])] });
}

// POST: create a new quiz config (duplicate from source)
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { label, source_id } = await req.json().catch(() => ({}));
  if (!label) return NextResponse.json({ error: 'label required' }, { status: 400 });

  const id = 'quiz_' + Date.now().toString(36);

  const { data: newPage, error: pageError } = await supabase
    .from('cms_pages')
    .insert({ id, label, path: '(Quiz-Variante)', is_system: false })
    .select()
    .single();

  if (pageError) return NextResponse.json({ error: pageError.message }, { status: 500 });

  // Copy content from source quiz
  const sourcePageId = source_id || 'component_quiz';
  const { data: sourceContent } = await supabase
    .from('cms_content')
    .select('*')
    .eq('page', sourcePageId);

  if (sourceContent?.length) {
    await supabase.from('cms_content').insert(
      sourceContent.map(c => ({
        page: id,
        section_key: c.section_key,
        field_key: c.field_key,
        value: c.value,
        updated_at: new Date().toISOString(),
      }))
    );
  }

  return NextResponse.json({ ok: true, data: newPage });
}

// DELETE: remove a quiz config
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await req.json().catch(() => ({}));
  if (!id || id === 'component_quiz') return NextResponse.json({ error: 'cannot delete default quiz' }, { status: 400 });

  await supabase.from('cms_content').delete().eq('page', id);
  await supabase.from('cms_pages').delete().eq('id', id);

  return NextResponse.json({ ok: true });
}
