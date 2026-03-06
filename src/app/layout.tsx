import type { Metadata } from 'next';
import '@/app/globals.css';
import { dosis } from '@/app/fonts';

import Footer from '@/components/ui/Footer';
import TopHeader from '@/components/TopHeader';
import { ConsentProvider } from '@/app/providers/ConsentProvider';
import CookieBanner from '@/components/CookieBanner';
import MarketingPixels from '@/components/MarketingPixels';

export const metadata: Metadata = {
  title: 'Voiceation Steyr by Martin Krendl',
  description: 'Jetzt Probestunde anfordern',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={dosis.variable}>
      <body>
        <ConsentProvider>
          <TopHeader />
          <CookieBanner />
          <MarketingPixels />
          {children}
          <Footer />
        </ConsentProvider>
      </body>
    </html>
  );
}
