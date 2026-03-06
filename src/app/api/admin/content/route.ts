// src/app/api/admin/content/route.ts
// GET: alle CMS-Einträge laden
// POST: einen oder mehrere Einträge speichern + Seite revalidieren

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const page = req.nextUrl.searchParams.get('page') || 'home';

  const { data, error } = await supabase
    .from('cms_content')
    .select('*')
    .eq('page', page)
    .order('section_key')
    .order('field_key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { page: string; updates: { section_key: string; field_key: string; value: string }[] } = {
    page: 'home',
    updates: [],
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.updates || !Array.isArray(body.updates) || body.updates.length === 0) {
    return NextResponse.json({ error: 'no_updates' }, { status: 400 });
  }

  const userId = (session as any).admin_users?.id;

  // Upsert alle Änderungen
  const upsertData = body.updates.map((u) => ({
    page: body.page,
    section_key: u.section_key,
    field_key: u.field_key,
    value: String(u.value).trim(),
    updated_at: new Date().toISOString(),
    updated_by: userId || null,
  }));

  const { error } = await supabase
    .from('cms_content')
    .upsert(upsertData, { onConflict: 'page,section_key,field_key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Seite sofort revalidieren → live ohne Rebuild
  const pagePath = body.page === 'home' ? '/' : `/${body.page}`;
  revalidatePath(pagePath);

  return NextResponse.json({ ok: true, revalidated: pagePath });
}
