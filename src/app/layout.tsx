// src/app/layout.tsx
import type { Metadata } from 'next';
import '@/app/globals.css';
import { dosis } from '@/app/fonts';
import { ConsentProvider } from '@/app/providers/ConsentProvider';
import CookieBanner from '@/components/CookieBanner';
import MarketingPixels from '@/components/MarketingPixels';
import PageviewTracker from '@/app/components/PageviewTracker';
import { supabase } from '@/lib/supabase';

async function getSeoSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('key, value');
    if (error || !data) return {};
    return Object.fromEntries(data.map((r: {key: string; value: string}) => [r.key, r.value]));
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const s = (k: string, fallback = '') => seo[k] || fallback;

  return {
    title: s('title', 'Voiceation Steyr by Martin Krendl'),
    description: s('description', 'Gesangsunterricht in Steyr und online. Jetzt kostenlose Probestunde anfragen.'),
    keywords: s('keywords') || undefined,
    authors: s('author') ? [{ name: s('author') }] : undefined,
    robots: s('robots', 'index, follow'),
    alternates: { canonical: s('canonical_url') || undefined },
    verification: s('google_verification') ? { google: s('google_verification') } : undefined,
    openGraph: {
      title: s('og_title', s('title', 'Voiceation Steyr by Martin Krendl')),
      description: s('og_description', s('description', '')),
      images: s('og_image') ? [s('og_image')] : undefined,
      url: s('og_url') || undefined,
      siteName: s('schema_name') || undefined,
      type: 'website',
    },
    twitter: {
      card: (s('twitter_card', 'summary_large_image') as 'summary_large_image' | 'summary' | 'app' | 'player'),
      title: s('twitter_title', s('title', '')),
      description: s('twitter_description', s('description', '')),
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={dosis.variable}>
      <body>
        <ConsentProvider>
          <CookieBanner />
          <MarketingPixelsWrapper />
          <PageviewTracker />
          {children}
        </ConsentProvider>
      </body>
    </html>
  );
}

// Async server component wrapper to pass pixel ID from SEO settings
async function MarketingPixelsWrapper() {
  const seo = await getSeoSettings();
  return <MarketingPixels pixelId={seo['meta_pixel_id'] || undefined} />;
}
