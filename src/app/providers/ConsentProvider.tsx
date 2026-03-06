'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ConsentState = {
  marketing: boolean | null; // null = noch keine Entscheidung
};

type ConsentContextValue = {
  consent: ConsentState;
  setMarketing: (value: boolean) => void;
  decided: boolean;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

const CONSENT_COOKIE = 'consent_marketing';
const COOKIE_MAX_AGE_DAYS = 180;

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [marketing, setMarketingState] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = getCookie(CONSENT_COOKIE);
    if (stored === 'true') setMarketingState(true);
    else if (stored === 'false') setMarketingState(false);
    else setMarketingState(null);
  }, []);

  const setMarketing = (value: boolean) => {
    setMarketingState(value);
    setCookie(CONSENT_COOKIE, String(value), COOKIE_MAX_AGE_DAYS);
  };

  const value = useMemo(
    () => ({ consent: { marketing }, setMarketing, decided: marketing !== null }),
    [marketing]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
