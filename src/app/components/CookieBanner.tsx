'use client';
// src/app/components/CookieBanner.tsx
// Liest Texte und Farben aus dem CMS (component_cookie)

import { useEffect, useState } from 'react';
import { useConsent } from '@/app/providers/ConsentProvider';

type CmsCookie = {
  message: string;
  accept_label: string;
  decline_label: string;
  essential_label: string;
  privacy_link: string;
  privacy_label: string;
  bg_color: string;
  text_color: string;
  accept_bg: string;
  border_color: string;
};

const DEFAULTS: CmsCookie = {
  message:        'Wir verwenden Cookies zu Statistik- und Marketingzwecken. Sie können zustimmen oder ablehnen.',
  accept_label:   'Akzeptieren',
  decline_label:  'Ablehnen',
  essential_label:'Nur essenziell',
  privacy_link:   '',
  privacy_label:  '',
  bg_color:       '#ffffff',
  text_color:     '#374151',
  accept_bg:      '#1f2937',
  border_color:   '#e5e7eb',
};

export default function CookieBanner() {
  const { consent, setMarketing } = useConsent();
  const [open, setOpen]   = useState(false);
  const [cfg, setCfg]     = useState<CmsCookie>(DEFAULTS);

  useEffect(() => {
    setOpen(consent.marketing === null);
  }, [consent.marketing]);

  // Load CMS config client-side (public fetch, no auth)
  useEffect(() => {
    fetch('/api/cms/public?page=component_cookie')
      .then(r => r.json())
      .then(json => {
        if (!json.ok || !json.data) return;
        const map: Record<string, string> = {};
        for (const e of json.data) map[`${e.section_key}::${e.field_key}`] = e.value;
        setCfg({
          message:        map['cookie::message']        || DEFAULTS.message,
          accept_label:   map['cookie::accept_label']   || DEFAULTS.accept_label,
          decline_label:  map['cookie::decline_label']  || DEFAULTS.decline_label,
          essential_label:map['cookie::essential_label']|| DEFAULTS.essential_label,
          privacy_link:   map['cookie::privacy_link']   || DEFAULTS.privacy_link,
          privacy_label:  map['cookie::privacy_label']  || DEFAULTS.privacy_label,
          bg_color:       map['cookie::bg_color']       || DEFAULTS.bg_color,
          text_color:     map['cookie::text_color']     || DEFAULTS.text_color,
          accept_bg:      map['cookie::accept_bg']      || DEFAULTS.accept_bg,
          border_color:   map['cookie::border_color']   || DEFAULTS.border_color,
        });
      })
      .catch(() => {});
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div
        className="mx-auto mb-4 max-w-3xl rounded-[4px] border p-4 shadow-xl"
        style={{ backgroundColor: cfg.bg_color, borderColor: cfg.border_color }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-5" style={{ color: cfg.text_color }}>
            {cfg.message}
            {cfg.privacy_link && cfg.privacy_label && (
              <>
                {' '}
                <a href={cfg.privacy_link} target="_blank" rel="noopener noreferrer"
                  className="underline hover:opacity-75" style={{ color: cfg.accept_bg }}>
                  {cfg.privacy_label}
                </a>
              </>
            )}
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { setMarketing(false); setOpen(false); }}
              className="rounded-[4px] border px-4 py-2 text-sm transition hover:opacity-80"
              style={{ borderColor: cfg.border_color, color: cfg.text_color }}>
              {cfg.decline_label}
            </button>
            <button
              onClick={() => { setMarketing(true); setOpen(false); }}
              className="rounded-[4px] px-4 py-2 text-sm text-white transition hover:opacity-80"
              style={{ backgroundColor: cfg.accept_bg }}>
              {cfg.accept_label}
            </button>
            <button
              onClick={() => { setMarketing(false); setOpen(false); }}
              className="rounded-[4px] px-4 py-2 text-sm underline transition hover:opacity-75"
              style={{ color: cfg.text_color }}>
              {cfg.essential_label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
