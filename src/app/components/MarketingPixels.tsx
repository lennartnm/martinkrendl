'use client';

import MetaPixel from '@/components/MetaPixel';
import { useConsent } from '@/app/providers/ConsentProvider';

interface Props {
  pixelId?: string;
}

export default function MarketingPixels({ pixelId }: Props) {
  const { consent } = useConsent();
  if (consent.marketing !== true) return null;

  // Priority: prop (from CMS/SEO settings) → env var
  const id = pixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  return <MetaPixel pixelId={id} />;
}
