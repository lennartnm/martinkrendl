'use client';

import { useEffect, useState } from 'react';
import { useConsent } from '@/app/providers/ConsentProvider';

export default function CookieBanner() {
  const { consent, setMarketing } = useConsent();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Banner nur zeigen, wenn noch keine Entscheidung
    setOpen(consent.marketing === null);
  }, [consent.marketing]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto mb-4 max-w-3xl rounded-none border bg-white p-4 shadow-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-5 text-gray-700">
            Wir verwenden Cookies zu Statistik- und Marketingzwecken.
            Sie können zustimmen oder ablehnen.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setMarketing(false);
                setOpen(false);
              }}
              className="rounded-none border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Ablehnen
            </button>
            <button
              onClick={() => {
                setMarketing(true);
                setOpen(false);
              }}
              className="rounded-none bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
            >
              Akzeptieren
            </button>
            <button
              onClick={() => {
                setMarketing(false);
                setOpen(false);
              }}
              className="rounded-none px-4 py-2 text-sm underline"
            >
              Nur essenziell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
