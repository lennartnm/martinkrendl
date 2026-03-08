// src/app/components/ui/Header.tsx
// Server Component – reads header content from CMS (component_header)
// Exact same visual as the inline header from page.tsx

import { supabase } from '@/lib/supabase';

async function getHeaderContent(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('cms_content')
      .select('section_key, field_key, value')
      .eq('page', 'component_header');
    if (error || !data) return {};
    const map: Record<string, string> = {};
    for (const entry of data) {
      map[`${entry.section_key}::${entry.field_key}`] = entry.value;
    }
    return map;
  } catch {
    return {};
  }
}

const HEADER_FALLBACK: Record<string, string> = {
  'header::logo_text': 'MARTIN KRENDL',
  'header::cta_label': 'Kostenloses Kennenlernen',
  'links::header_cta': '#quiz',
  'colors::header_bg': '#884A4A',
};

export default async function Header() {
  const cms = await getHeaderContent();
  const c = (key: string) => cms[key] ?? HEADER_FALLBACK[key] ?? '';

  const logoText = c('header::logo_text');
  const ctaLabel = c('header::cta_label');
  const ctaLink  = c('links::header_cta') || '#quiz';
  const bgColor  = c('colors::header_bg') || '#884A4A';

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: bgColor }}
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-3 md:px-6">
        <span className="text-sm font-extrabold tracking-[0.18em] text-white md:text-base">
          {logoText}
        </span>
        <a
          href={ctaLink}
          className="rounded-[4px] px-4 py-2 text-xs font-semibold text-white ring-2 ring-white/30 transition hover:bg-white/10 md:text-sm"
        >
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
