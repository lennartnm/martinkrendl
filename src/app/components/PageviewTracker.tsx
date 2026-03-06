'use client';
// src/app/components/PageviewTracker.tsx
// Tracks pageviews on every route change. Cookie-free, DSGVO-konform.

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Never track admin pages
    if (pathname.startsWith('/admin')) return;

    const utm_source = searchParams.get('utm_source') || undefined;
    const utm_medium = searchParams.get('utm_medium') || undefined;
    const utm_campaign = searchParams.get('utm_campaign') || undefined;

    fetch('/api/admin/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: pathname,
        referrer: document.referrer || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
      }),
    }).catch(() => {/* silent fail */});
  }, [pathname, searchParams]);

  return null;
}

export default function PageviewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
