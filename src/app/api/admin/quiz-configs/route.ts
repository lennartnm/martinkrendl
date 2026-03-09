// src/app/api/admin/quiz-configs/route.ts
// POST (quiz creation/duplication) has been removed intentionally.
// GET now auto-discovers all quiz_ids from quiz_funnel_events,
// so newly hardcoded quizzes appear in analytics automatically.
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Only include the real standard quiz — no "default" placeholder
  const staticQuizzes = [
    { id: 'component_quiz', label: 'Standard Quiz', path: '(Komponente)', is_system: true },
  ];

  // Auto-discover any quiz_ids that have tracking events but aren't in the static list
  const { data: eventRows } = await supabase
    .from('quiz_funnel_events')
    .select('quiz_id')
    .not('quiz_id', 'is', null);

  const knownIds = new Set(staticQuizzes.map(q => q.id));
  const discovered: { id: string; label: string; path: string; is_system: boolean }[] = [];

  if (eventRows) {
    const uniqueIds = [...new Set(eventRows.map((r: any) => r.quiz_id as string))];
    for (const qid of uniqueIds) {
      if (!knownIds.has(qid)) {
        discovered.push({ id: qid, label: qid, path: '(Hardcoded)', is_system: true });
        knownIds.add(qid);
      }
    }
  }

  return NextResponse.json({ ok: true, data: [...staticQuizzes, ...discovered] });
}

// POST is disabled — quiz creation/duplication has been removed
export async function POST() {
  return NextResponse.json(
    { error: 'Quiz creation is disabled. Add quizzes directly in code.' },
    { status: 405 }
  );
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (id === 'component_quiz' || id === 'default')
    return NextResponse.json({ error: 'cannot delete system quiz' }, { status: 400 });

  const { data: page } = await supabase.from('cms_pages').select('*').eq('id', id).single();
  if (!page) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (page.is_system) return NextResponse.json({ error: 'cannot delete system quiz' }, { status: 403 });

  await supabase.from('cms_content').delete().eq('page', id);
  await supabase.from('cms_sections').delete().eq('page_id', id);
  const { error: delError } = await supabase.from('cms_pages').delete().eq('id', id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
