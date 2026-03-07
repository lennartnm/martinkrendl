// src/app/danke/page.tsx
// Server Component – liest Inhalte der Danke-Seite aus dem CMS

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

async function getDankeContent(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('cms_content')
      .select('section_key, field_key, value')
      .eq('page', 'danke');
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

// Fallbacks – werden angezeigt, wenn noch kein CMS-Eintrag existiert
const FALLBACK: Record<string, string> = {
  'danke_header::logo_text': 'MARTIN KRENDL',
  'danke_hero::title':       'Deine Nachricht ist erfolgreich angekommen',
  'danke_hero::subtitle':    'Danke für dein Interesse am Gesangsunterricht. Ich melde mich so bald wie möglich persönlich bei dir, damit wir gemeinsam schauen können, welcher nächste Schritt für dich und deine Stimme sinnvoll ist.',
  'danke_hero::cta_label':   'Zur Startseite',
  'danke_hero::cta_link':    '/',
  // Farben aus der Startseite als Fallback
  'colors::brand':           '#884A4A',
  'colors::graphite':        '#2F2F2F',
  'colors::light_gray':      '#6B6B6B',
  'colors::header_bg':       '#884A4A',
};

export default async function DankePage() {
  const cms = await getDankeContent();
  const c = (key: string) => cms[key] ?? FALLBACK[key] ?? '';

  const brand     = c('colors::brand')      || '#884A4A';
  const graphite  = c('colors::graphite')   || '#2F2F2F';
  const lightGray = c('colors::light_gray') || '#6B6B6B';
  const headerBg  = c('colors::header_bg')  || brand;

  const logoText  = c('danke_header::logo_text');
  const title     = c('danke_hero::title');
  const subtitle  = c('danke_hero::subtitle');
  const ctaLabel  = c('danke_hero::cta_label');
  const ctaLink   = c('danke_hero::cta_link') || '/';

  return (
    <main
      className="min-h-screen bg-white"
      style={{ '--brand': brand, '--graphite': graphite, '--lightGray': lightGray } as CSSProperties}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Open Sans', sans-serif; color: ${graphite}; background: #ffffff; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: headerBg }}>
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 flex h-20 items-center justify-between">
          <div className="text-left text-lg font-extrabold tracking-[0.18em] text-white md:text-xl">
            {logoText}
          </div>
          <Link href="/">
            <Button variant="secondary" className="rounded-[4px] px-6 py-3 font-semibold text-white">
              Zurück zur Startseite
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="flex min-h-[calc(100vh-80px)] items-center py-16 md:py-24">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <div className="mx-auto max-w-2xl rounded-[4px] border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm md:px-10 md:py-14">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${brand}15` }}
            >
              <CheckCircle2 className="h-8 w-8" style={{ color: brand }} />
            </div>

            <p
              className="mt-6 text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: brand }}
            >
              Danke für deine Anfrage
            </p>

            <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl" style={{ color: graphite }}>
              {title}
            </h1>

            <p className="mt-5 text-base leading-8" style={{ color: lightGray }}>
              {subtitle}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={ctaLink}>
                <Button
                  className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95"
                  style={{ backgroundColor: brand }}
                >
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
