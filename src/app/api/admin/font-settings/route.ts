// src/app/api/admin/font-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FONT_URLS: Record<string, string> = {
  'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap',
  'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
  'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap',
  'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap',
  'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  'Raleway': 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800&display=swap',
  'Nunito': 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap',
  'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap',
  'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap',
  'Source Sans 3': 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;900&display=swap',
  'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'DM Sans': 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
  'Outfit': 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
  'Plus Jakarta Sans': 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'Figtree': 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap',
};

export async function GET() {
  const { data } = await supabase.from('global_settings').select('key,value');
  const map: Record<string,string> = {};
  for (const row of data || []) map[row.key] = row.value;
  return NextResponse.json({ ok: true, font: map['font_family'] || 'Open Sans', url: map['font_url'] || FONT_URLS['Open Sans'] });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { font, url } = await req.json().catch(() => ({}));
  if (!font) return NextResponse.json({ error: 'font required' }, { status: 400 });

  const fontUrl = url || FONT_URLS[font] || `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800&display=swap`;

  await supabase.from('global_settings').upsert({ key: 'font_family', value: font }, { onConflict: 'key' });
  await supabase.from('global_settings').upsert({ key: 'font_url', value: fontUrl }, { onConflict: 'key' });

  revalidatePath('/');
  revalidatePath('/p/[slug]');
  return NextResponse.json({ ok: true });
}
