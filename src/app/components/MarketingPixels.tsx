'use client';

import MetaPixel from '@/components/MetaPixel';
import { useConsent } from '@/app/providers/ConsentProvider';

export default function MarketingPixels() {
  const { consent } = useConsent();

  if (consent.marketing !== true) return null;

  return <MetaPixel pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID} />;
}
