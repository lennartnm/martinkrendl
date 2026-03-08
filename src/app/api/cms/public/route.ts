// src/app/api/cms/public/route.ts
// Public endpoint – no auth needed. Used by Quiz, CookieBanner, etc.
// Returns CMS content for a specific page.
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get('page');
  if (!page) return NextResponse.json({ ok: false, error: 'page required' }, { status: 400 });

  try {
    const { data, error } = await supabase
      .from('cms_content')
      .select('section_key, field_key, value')
      .eq('page', page);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
