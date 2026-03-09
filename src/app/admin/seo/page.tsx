'use client';
// src/app/admin/seo/page.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import { Save, CheckCircle, AlertCircle, Loader2, ExternalLink, ChevronDown } from 'lucide-react';

const brand = '#884A4A';
type SeoMap = Record<string, string>;

type SeoField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'url';
  hint?: string;
  maxLen?: number;
  options?: string[];
  recommended?: string;
};

type SeoGroup = {
  title: string;
  description: string;
  fields: SeoField[];
};

const SEO_GROUPS: SeoGroup[] = [
  {
    title: 'Allgemein',
    description: 'Diese Felder bestimmen, wie deine Seite in Google-Suchergebnissen erscheint.',
    fields: [
      { key: 'title',       label: 'Seiten-Titel',     type: 'text',     maxLen: 60,  hint: 'Erscheint im Browser-Tab und in Google-Suchergebnissen.', recommended: '50–60 Zeichen' },
      { key: 'description', label: 'Meta-Description', type: 'textarea', maxLen: 160, hint: 'Kurze Beschreibung deiner Seite – Google zeigt sie oft unter dem Titel an.', recommended: '120–160 Zeichen' },
      { key: 'keywords',    label: 'Keywords',         type: 'text',     hint: 'Kommagetrennte Suchbegriffe (z.B. „Gesangsunterricht, Steyr, Online").' },
      { key: 'author',      label: 'Autor',            type: 'text' },
      { key: 'robots',      label: 'Suchmaschinen-Indexierung', type: 'select', options: ['index, follow', 'noindex, nofollow', 'index, nofollow', 'noindex, follow'], hint: 'Wähle „index, follow" damit Google die Seite findet und verfolgt.' },
      { key: 'canonical_url', label: 'Haupt-URL der Seite', type: 'url', hint: 'Verhindert doppelte Inhalte, wenn die Seite unter mehreren URLs erreichbar ist.' },
    ],
  },
  {
    title: 'Open Graph (Social Media)',
    description: 'So sieht deine Seite aus, wenn sie auf Facebook, WhatsApp oder LinkedIn geteilt wird.',
    fields: [
      { key: 'og_title',       label: 'Titel',       type: 'text',    maxLen: 60  },
      { key: 'og_description', label: 'Beschreibung',type: 'textarea',maxLen: 160 },
      { key: 'og_image',       label: 'Vorschaubild (URL)', type: 'url', hint: 'Wird beim Teilen als Bild angezeigt – empfohlen: 1200×630px.' },
      { key: 'og_url',         label: 'URL',         type: 'url' },
    ],
  },
  {
    title: 'Twitter / X Card',
    description: 'Einstellungen für die Vorschau wenn deine Seite auf Twitter oder X geteilt wird.',
    fields: [
      { key: 'twitter_card',        label: 'Card-Typ',     type: 'select', options: ['summary_large_image', 'summary', 'app', 'player'], hint: '„summary_large_image" zeigt ein großes Bild – empfehlenswert.' },
      { key: 'twitter_title',       label: 'Titel',        type: 'text',   maxLen: 70 },
      { key: 'twitter_description', label: 'Beschreibung', type: 'textarea', maxLen: 200 },
    ],
  },
  {
    title: 'Meta Pixel (Facebook / Instagram Werbung)',
    description: 'Trage hier deine Facebook Pixel-ID ein, damit Conversions für Facebook- und Instagram-Anzeigen getrackt werden.',
    fields: [
      { key: 'meta_pixel_id', label: 'Facebook Pixel-ID', type: 'text', hint: 'Die ID findest du im Facebook Events Manager – nur die Zahlenkombination eintragen (z.B. „123456789012345").' },
    ],
  },
  {
    title: 'Verifikation & Schema',
    description: 'Google-Verifikation und strukturierte Daten helfen Suchmaschinen, dein Unternehmen besser zu verstehen.',
    fields: [
      { key: 'google_verification', label: 'Google Verification Code', type: 'text', hint: 'Nur den Code aus dem Meta-Tag eintragen (z.B. „abc123xyz").' },
      { key: 'schema_name',         label: 'Unternehmensname',         type: 'text' },
      { key: 'schema_type',         label: 'Unternehmenstyp',          type: 'select', options: ['MusicSchool', 'LocalBusiness', 'Person', 'Organization', 'EducationalOrganization'] },
      { key: 'schema_telephone',    label: 'Telefonnummer',            type: 'text', hint: 'Format: +43 ...' },
      { key: 'schema_address',      label: 'Adresse',                  type: 'text', hint: 'z.B. „Steyr, Österreich"' },
    ],
  },
];

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const over = len > max;
  const warn = len > max * 0.9;
  return (
    <span className={`text-[10px] font-mono ${over ? 'text-red-500' : warn ? 'text-amber-500' : 'text-[#6B6B6B]'}`}>
      {len}/{max}
    </span>
  );
}

// Modern custom select dropdown
function SelectField({ value, options, onChange, isDirty }: { value: string; options: string[]; onChange: (v: string) => void; isDirty: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex h-10 w-full items-center justify-between rounded-[4px] border px-3 text-sm text-[#2F2F2F] transition hover:border-[#884A4A] outline-none"
        style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }}
      >
        <span>{value || options[0]}</span>
        <ChevronDown className={`h-4 w-4 text-[#6B6B6B] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-lg">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition hover:bg-[#FDF8F8] ${value === opt ? 'font-semibold text-[#884A4A] bg-[#FDF8F8]' : 'text-[#2F2F2F]'}`}
            >
              {opt}
              {value === opt && <CheckCircle className="h-3.5 w-3.5 text-[#884A4A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export default function SeoPage() {
  const [seo, setSeo]       = useState<SeoMap>({});
  const [dirty, setDirty]   = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch('/api/admin/seo')
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error);
        const map: SeoMap = {};
        for (const e of json.data) map[e.key] = e.value;
        setSeo(map);
      })
      .catch((e) => setError('Laden fehlgeschlagen: ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setSeo((p) => ({ ...p, [key]: value }));
    setDirty((p) => new Set(p).add(key));
  }, []);

  const handleSave = async () => {
    if (dirty.size === 0) return;
    setSaving(true); setError('');
    const updates = Array.from(dirty).map((key) => ({ key, value: seo[key] ?? '' }));
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setDirty(new Set()); setSavedAt(new Date());
    } catch (e: any) {
      setError('Fehler: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const previewTitle = seo['title'] || 'Seiten-Titel';
  const previewDesc  = seo['description'] || 'Meta-Beschreibung erscheint hier...';
  const previewUrl   = seo['canonical_url'] || 'https://martinkrendl.vercel.app';

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); * { font-family: 'Open Sans', sans-serif !important; }`}</style>

      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2F2F2F]">SEO Einstellungen</h1>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Hier steuerst du, wie deine Website in Suchmaschinen und beim Teilen in sozialen Netzwerken aussieht.</p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && dirty.size === 0 && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                {savedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} gespeichert
              </span>
            )}
            {dirty.size > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />{dirty.size} ungespeichert
              </span>
            )}
            <button onClick={handleSave} disabled={saving || dirty.size === 0}
              className="flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: brand }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Speichern...' : 'Speichern & live schalten'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
            <button className="ml-auto underline" onClick={() => setError('')}>OK</button>
          </div>
        )}

        {/* Google Vorschau */}
        <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6B6B6B]">Vorschau in Google</p>
          <div className="rounded-[4px] border border-neutral-100 bg-neutral-50 p-4">
            <p className="mb-0.5 truncate text-xs text-[#006621]">{previewUrl}</p>
            <p className="text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer truncate">{previewTitle}</p>
            <p className="mt-1 text-sm text-[#545454] line-clamp-2">{previewDesc}</p>
          </div>
          <p className="mt-2 text-xs text-[#6B6B6B]">Die Vorschau zeigt eine Annäherung – Google kann Titel und Beschreibung dynamisch anpassen.</p>
        </div>

        {/* SEO Groups */}
        {SEO_GROUPS.map((group) => (
          <div key={group.title} className="rounded-[4px] border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-5 py-4">
              <h2 className="font-bold text-[#2F2F2F]">{group.title}</h2>
              <p className="mt-0.5 text-xs text-[#6B6B6B]">{group.description}</p>
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-2 md:items-start">
              {group.fields.map((field) => {
                const val     = seo[field.key] ?? '';
                const isDirty = dirty.has(field.key);
                // Textareas and URL fields with hints are always full width to prevent misalignment
                const isWide  = field.type === 'textarea' || field.type === 'url';

                return (
                  <div key={field.key} className={`flex flex-col gap-1.5 ${isWide ? 'md:col-span-2' : ''}`}>
                    {/* Label row — fixed min-height so columns stay aligned */}
                    <div className="flex min-h-[24px] flex-wrap items-center gap-2">
                      <label className="text-sm font-semibold text-[#2F2F2F]">{field.label}</label>
                      {field.recommended && (
                        <span className="text-[10px] text-[#6B6B6B]">({field.recommended})</span>
                      )}
                      {field.maxLen && <CharCount value={val} max={field.maxLen} />}
                      {isDirty && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                          geändert
                        </span>
                      )}
                    </div>
                    {/* Hint — always reserve space with min-height */}
                    <p className="min-h-[16px] text-xs text-[#6B6B6B] leading-tight">{field.hint ?? ''}</p>

                    {field.type === 'select' ? (
                      <SelectField value={val} options={field.options!} onChange={(v) => handleChange(field.key, v)} isDirty={isDirty} />
                    ) : field.type === 'textarea' ? (
                      <textarea value={val} onChange={(e) => handleChange(field.key, e.target.value)}
                        rows={3} maxLength={field.maxLen ? field.maxLen + 50 : undefined}
                        className="w-full resize-y rounded-[4px] border px-3 py-2.5 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
                        style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
                    ) : field.type === 'url' ? (
                      <div className="flex items-center gap-2">
                        <input type="url" value={val} onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder="https://"
                          className="h-10 flex-1 rounded-[4px] border px-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
                          style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
                        {val && (
                          <a href={val} target="_blank" rel="noopener noreferrer"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] hover:bg-neutral-50">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <input type="text" value={val} onChange={(e) => handleChange(field.key, e.target.value)}
                        maxLength={field.maxLen ? field.maxLen + 20 : undefined}
                        className="h-10 w-full rounded-[4px] border px-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
                        style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
