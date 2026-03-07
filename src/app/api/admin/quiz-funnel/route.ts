// src/app/api/admin/quiz-funnel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST: track a quiz funnel step (public, no auth required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const step = body.step; // 'view' | 'q1' | 'q2' | 'q3' | 'form' | 'submit'
    if (!step) return NextResponse.json({ ok: false, error: 'step required' }, { status: 400 });

    await supabase.from('quiz_funnel_events').insert({
      step,
      session_id: body.session_id || null,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// GET: funnel analytics (admin only)
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  try {
    // Funnel step counts
    const STEPS = ['view', 'q1', 'q2', 'q3', 'form', 'submit'] as const;
    const stepCounts: Record<string, number> = {};

    for (const step of STEPS) {
      const { count } = await supabase
        .from('quiz_funnel_events')
        .select('*', { count: 'exact', head: true })
        .eq('step', step)
        .gte('created_at', since);
      stepCounts[step] = count || 0;
    }

    // Daily breakdown for 'view' and 'submit' to show trend
    const { data: rawDaily } = await supabase
      .from('quiz_funnel_events')
      .select('step, created_at')
      .in('step', ['view', 'submit'])
      .gte('created_at', since)
      .order('created_at');

    // Build daily time series
    const dailyMap: Record<string, { views: number; submits: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
      dailyMap[key] = { views: 0, submits: 0 };
    }
    for (const row of rawDaily || []) {
      const key = new Date(row.created_at).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
      if (key in dailyMap) {
        if (row.step === 'view') dailyMap[key].views++;
        if (row.step === 'submit') dailyMap[key].submits++;
      }
    }
    const daily = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

    return NextResponse.json({ ok: true, stepCounts, daily });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
