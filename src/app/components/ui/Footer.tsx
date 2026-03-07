// src/app/components/ui/Footer.tsx
// Server Component – liest Footer-Inhalte aus dem CMS (component_footer)

import { supabase } from '@/lib/supabase';

async function getFooterContent(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('cms_content')
      .select('section_key, field_key, value')
      .eq('page', 'component_footer');
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

const FOOTER_FALLBACK: Record<string, string> = {
  'footer::logo_text':        'MARTIN KRENDL',
  'footer::tagline':          'Gesangsunterricht in Steyr und online.',
  'footer::copyright':        `© ${new Date().getFullYear()} Martin Krendl. Alle Rechte vorbehalten.`,
  'footer::impressum_link':   'https://www.martinkrendl.com/impressum/',
  'footer::datenschutz_link': 'https://www.martinkrendl.com/datenschutz/',
  'footer::bg_color':         '#F1F5F9',
  'footer::text_color':       '#111827',
  'footer::link_color':       '#884A4A',
};

export default async function Footer() {
  const cms = await getFooterContent();
  const c = (key: string) => cms[key] ?? FOOTER_FALLBACK[key] ?? '';

  const bgColor   = c('footer::bg_color')   || '#F1F5F9';
  const textColor = c('footer::text_color') || '#111827';
  const linkColor = c('footer::link_color') || '#884A4A';

  const instagram = c('footer::instagram_url');
  const facebook  = c('footer::facebook_url');
  const youtube   = c('footer::youtube_url');
  const tiktok    = c('footer::tiktok_url');
  const hasSocial = instagram || facebook || youtube || tiktok;

  const logoText  = c('footer::logo_text');
  const tagline   = c('footer::tagline');
  const email     = c('footer::email');
  const phone     = c('footer::phone');
  const address   = c('footer::address');
  const impressum = c('footer::impressum_link');
  const datenschutz = c('footer::datenschutz_link');
  const copyright = c('footer::copyright');

  return (
    <footer style={{ backgroundColor: bgColor, color: textColor, borderTop: `1px solid ${bgColor === '#F1F5F9' ? '#E2E8F0' : 'rgba(0,0,0,0.1)'}` }}>
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-10">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          {/* Brand */}
          <div className="max-w-xs">
            {logoText && (
              <p className="text-sm font-extrabold tracking-[0.18em]" style={{ color: textColor }}>
                {logoText}
              </p>
            )}
            {tagline && (
              <p className="mt-1.5 text-sm leading-relaxed opacity-70">{tagline}</p>
            )}
            {(email || phone || address) && (
              <div className="mt-3 space-y-0.5 text-xs opacity-60">
                {email   && <p>{email}</p>}
                {phone   && <p>{phone}</p>}
                {address && <p>{address}</p>}
              </div>
            )}
          </div>

          {/* Links & Social */}
          <div className="flex flex-col items-center gap-4 sm:items-end">
            {/* Legal links */}
            <div className="flex gap-5 text-sm">
              {impressum && (
                <a href={impressum} target="_blank" rel="noopener noreferrer"
                  className="hover:underline transition-opacity hover:opacity-80"
                  style={{ color: linkColor }}>
                  Impressum
                </a>
              )}
              {datenschutz && (
                <a href={datenschutz} target="_blank" rel="noopener noreferrer"
                  className="hover:underline transition-opacity hover:opacity-80"
                  style={{ color: linkColor }}>
                  Datenschutz
                </a>
              )}
            </div>

            {/* Social icons */}
            {hasSocial && (
              <div className="flex gap-3">
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: linkColor + '18', color: linkColor }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: linkColor + '18', color: linkColor }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {youtube && (
                  <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: linkColor + '18', color: linkColor }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                )}
                {tiktok && (
                  <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{ backgroundColor: linkColor + '18', color: linkColor }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-6 text-center text-xs opacity-50" style={{ borderColor: textColor + '20' }}>
          {copyright}
        </div>
      </div>
    </footer>
  );
}
