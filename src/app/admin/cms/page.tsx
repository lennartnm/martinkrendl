'use client';
// src/app/admin/cms/page.tsx
// Erweitertes CMS: Texte, Farben, Bilder, Videos, Button-Links

import { useEffect, useState, useCallback, useRef } from 'react';

const brand = '#884A4A';

// ── Typen ────────────────────────────────────────────────────────────────────
type FieldType = 'text' | 'textarea' | 'color' | 'image' | 'video' | 'link';

type FieldDef = {
  section_key: string;
  field_key: string;
  label: string;
  type: FieldType;
  hint?: string;
};

type SectionGroup = {
  group: string;
  icon: string;
  items: FieldDef[];
};

// ── Alle editierbaren Felder ──────────────────────────────────────────────────
const SECTIONS: SectionGroup[] = [
  {
    group: 'Farben',
    icon: '🎨',
    items: [
      { section_key: 'colors', field_key: 'brand',      label: 'Brand-Farbe (Hauptfarbe)',     type: 'color', hint: 'Wird für Header, Buttons, Icons und Akzente verwendet' },
      { section_key: 'colors', field_key: 'header_bg',  label: 'Header Hintergrund',           type: 'color' },
      { section_key: 'colors', field_key: 'graphite',   label: 'Textfarbe (dunkel)',            type: 'color' },
      { section_key: 'colors', field_key: 'dark_gray',  label: 'Textfarbe (mittel)',            type: 'color' },
      { section_key: 'colors', field_key: 'light_gray', label: 'Textfarbe (hell / Grau)',       type: 'color' },
      { section_key: 'colors', field_key: 'quiz_bg',    label: 'Quiz Hintergrund',              type: 'color' },
    ],
  },
  {
    group: 'Bilder',
    icon: '🖼️',
    items: [
      { section_key: 'images', field_key: 'hero',      label: 'Hero Bild',                    type: 'image', hint: 'Großes Hauptbild ganz oben (empfohlen: 1920×800px)' },
      { section_key: 'images', field_key: 'section1',  label: 'Bild + Text – Sektion 1',      type: 'image', hint: 'Quadratisches Bild links (empfohlen: 800×800px)' },
      { section_key: 'images', field_key: 'quote_bg',  label: 'Zitat Hintergrundbild',        type: 'image', hint: 'Breites Bild mit Zitat-Overlay' },
      { section_key: 'images', field_key: 'section2',  label: 'Bild + Text – Sektion 2',      type: 'image', hint: 'Quadratisches Bild rechts' },
      { section_key: 'images', field_key: 'about',     label: 'Über Martin – Portrait',       type: 'image' },
      { section_key: 'images', field_key: 'final_cta', label: 'Abschluss CTA – Bild',         type: 'image' },
      { section_key: 'images', field_key: 'logo1',     label: 'Logo 1',                       type: 'image', hint: 'Logo in der Logo-Sektion' },
      { section_key: 'images', field_key: 'logo2',     label: 'Logo 2',                       type: 'image' },
    ],
  },
  {
    group: 'Videos',
    icon: '🎬',
    items: [
      { section_key: 'videos', field_key: 'carousel_1_src',      label: 'Carousel Video 1',              type: 'video', hint: 'MP4 empfohlen, max 50MB' },
      { section_key: 'videos', field_key: 'carousel_1_thumb',    label: 'Carousel Video 1 – Vorschau',   type: 'image', hint: 'Thumbnail das vor dem Abspielen angezeigt wird' },
      { section_key: 'videos', field_key: 'carousel_2_src',      label: 'Carousel Video 2',              type: 'video' },
      { section_key: 'videos', field_key: 'carousel_2_thumb',    label: 'Carousel Video 2 – Vorschau',   type: 'image' },
      { section_key: 'videos', field_key: 'carousel_3_src',      label: 'Carousel Video 3',              type: 'video' },
      { section_key: 'videos', field_key: 'carousel_3_thumb',    label: 'Carousel Video 3 – Vorschau',   type: 'image' },
      { section_key: 'videos', field_key: 'testimonial_1_src',   label: 'Testimonial Video 1',           type: 'video' },
      { section_key: 'videos', field_key: 'testimonial_1_thumb', label: 'Testimonial Video 1 – Vorschau',type: 'image' },
      { section_key: 'videos', field_key: 'testimonial_2_src',   label: 'Testimonial Video 2',           type: 'video' },
      { section_key: 'videos', field_key: 'testimonial_2_thumb', label: 'Testimonial Video 2 – Vorschau',type: 'image' },
    ],
  },
  {
    group: 'Button Links',
    icon: '🔗',
    items: [
      { section_key: 'links', field_key: 'header_cta',       label: 'Header – CTA Button Link',         type: 'link', hint: 'z.B. #quiz oder https://...' },
      { section_key: 'links', field_key: 'hero_cta',         label: 'Hero – CTA Button Link',           type: 'link' },
      { section_key: 'links', field_key: 'image_text_1_cta', label: 'Sektion 1 – CTA Button Link',      type: 'link' },
      { section_key: 'links', field_key: 'image_text_2_cta', label: 'Sektion 2 – CTA Button Link',      type: 'link' },
      { section_key: 'links', field_key: 'features_2_cta',   label: 'Feature Cards – CTA Button Link',  type: 'link' },
      { section_key: 'links', field_key: 'final_cta',        label: 'Abschluss – CTA Button Link',      type: 'link' },
    ],
  },
  {
    group: 'Header & Navigation',
    icon: '📌',
    items: [
      { section_key: 'header', field_key: 'logo_text', label: 'Logo Text',        type: 'text' },
      { section_key: 'header', field_key: 'cta_label', label: 'Header CTA Button',type: 'text' },
    ],
  },
  {
    group: 'Hero Bereich',
    icon: '🦸',
    items: [
      { section_key: 'hero', field_key: 'title',        label: 'Überschrift',    type: 'text' },
      { section_key: 'hero', field_key: 'subtitle',     label: 'Unterzeile',     type: 'textarea' },
      { section_key: 'hero', field_key: 'cta_label',    label: 'CTA Button',     type: 'text' },
      { section_key: 'hero', field_key: 'social_proof', label: 'Social Proof',   type: 'text' },
    ],
  },
  {
    group: 'Logo Sektion',
    icon: '🏷️',
    items: [
      { section_key: 'logos_section', field_key: 'label', label: 'Label Text', type: 'text' },
    ],
  },
  {
    group: 'Feature Cards (3er)',
    icon: '🃏',
    items: [
      { section_key: 'feature_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
      { section_key: 'feature_card_1', field_key: 'text',  label: 'Karte 1 – Text',  type: 'textarea' },
      { section_key: 'feature_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
      { section_key: 'feature_card_2', field_key: 'text',  label: 'Karte 2 – Text',  type: 'textarea' },
      { section_key: 'feature_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
      { section_key: 'feature_card_3', field_key: 'text',  label: 'Karte 3 – Text',  type: 'textarea' },
    ],
  },
  {
    group: 'Bild + Text Sektion 1',
    icon: '📝',
    items: [
      { section_key: 'image_text_1', field_key: 'title',    label: 'Überschrift', type: 'text' },
      { section_key: 'image_text_1', field_key: 'text',     label: 'Fließtext',   type: 'textarea' },
      { section_key: 'image_text_1', field_key: 'cta_label',label: 'CTA Button',  type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_1', label: 'Bullet 1',    type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_2', label: 'Bullet 2',    type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_3', label: 'Bullet 3',    type: 'text' },
    ],
  },
  {
    group: 'Zitat Sektion',
    icon: '💬',
    items: [
      { section_key: 'quote_section', field_key: 'label', label: 'Label',  type: 'text' },
      { section_key: 'quote_section', field_key: 'quote', label: 'Zitat',  type: 'textarea' },
    ],
  },
  {
    group: 'Video Carousel',
    icon: '🎥',
    items: [
      { section_key: 'video_section', field_key: 'title', label: 'Überschrift',  type: 'text' },
      { section_key: 'video_section', field_key: 'text',  label: 'Beschreibung', type: 'textarea' },
    ],
  },
  {
    group: 'Bild + Text Sektion 2',
    icon: '📝',
    items: [
      { section_key: 'image_text_2', field_key: 'title',    label: 'Überschrift', type: 'text' },
      { section_key: 'image_text_2', field_key: 'text',     label: 'Fließtext',   type: 'textarea' },
      { section_key: 'image_text_2', field_key: 'cta_label',label: 'CTA Button',  type: 'text' },
    ],
  },
  {
    group: 'Feature Cards (4er)',
    icon: '🃏',
    items: [
      { section_key: 'features_2_heading', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'features_2_heading', field_key: 'text',  label: 'Unterzeile',  type: 'textarea' },
      { section_key: 'feature2_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
      { section_key: 'feature2_card_1', field_key: 'text',  label: 'Karte 1 – Text',  type: 'textarea' },
      { section_key: 'feature2_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
      { section_key: 'feature2_card_2', field_key: 'text',  label: 'Karte 2 – Text',  type: 'textarea' },
      { section_key: 'feature2_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
      { section_key: 'feature2_card_3', field_key: 'text',  label: 'Karte 3 – Text',  type: 'textarea' },
      { section_key: 'feature2_card_4', field_key: 'title', label: 'Karte 4 – Titel', type: 'text' },
      { section_key: 'feature2_card_4', field_key: 'text',  label: 'Karte 4 – Text',  type: 'textarea' },
    ],
  },
  {
    group: 'Fließtext',
    icon: '📄',
    items: [
      { section_key: 'flowing_text', field_key: 'text', label: 'Text', type: 'textarea' },
    ],
  },
  {
    group: 'Video Testimonials',
    icon: '⭐',
    items: [
      { section_key: 'testimonial_1', field_key: 'label',  label: 'Testimonial 1 – Label', type: 'text' },
      { section_key: 'testimonial_1', field_key: 'quote',  label: 'Testimonial 1 – Zitat', type: 'textarea' },
      { section_key: 'testimonial_1', field_key: 'author', label: 'Testimonial 1 – Autor', type: 'text' },
      { section_key: 'testimonial_2', field_key: 'label',  label: 'Testimonial 2 – Label', type: 'text' },
      { section_key: 'testimonial_2', field_key: 'quote',  label: 'Testimonial 2 – Zitat', type: 'textarea' },
      { section_key: 'testimonial_2', field_key: 'author', label: 'Testimonial 2 – Autor', type: 'text' },
    ],
  },
  {
    group: 'Über Martin',
    icon: '👤',
    items: [
      { section_key: 'about', field_key: 'label',  label: 'Label',      type: 'text' },
      { section_key: 'about', field_key: 'title',  label: 'Überschrift',type: 'text' },
      { section_key: 'about', field_key: 'text_1', label: 'Absatz 1',   type: 'textarea' },
      { section_key: 'about', field_key: 'text_2', label: 'Absatz 2',   type: 'textarea' },
      { section_key: 'about', field_key: 'text_3', label: 'Absatz 3',   type: 'textarea' },
    ],
  },
  {
    group: 'Bewertungen',
    icon: '⭐',
    items: [
      { section_key: 'reviews',   field_key: 'title',  label: 'Überschrift',      type: 'text' },
      { section_key: 'review_1',  field_key: 'text',   label: 'Review 1 – Text',  type: 'textarea' },
      { section_key: 'review_1',  field_key: 'author', label: 'Review 1 – Autor', type: 'text' },
      { section_key: 'review_2',  field_key: 'text',   label: 'Review 2 – Text',  type: 'textarea' },
      { section_key: 'review_2',  field_key: 'author', label: 'Review 2 – Autor', type: 'text' },
      { section_key: 'review_3',  field_key: 'text',   label: 'Review 3 – Text',  type: 'textarea' },
      { section_key: 'review_3',  field_key: 'author', label: 'Review 3 – Autor', type: 'text' },
    ],
  },
  {
    group: 'Abschluss CTA',
    icon: '🚀',
    items: [
      { section_key: 'final_cta', field_key: 'title',    label: 'Überschrift', type: 'text' },
      { section_key: 'final_cta', field_key: 'text',     label: 'Text',        type: 'textarea' },
      { section_key: 'final_cta', field_key: 'cta_label',label: 'CTA Button',  type: 'text' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
type ContentMap = Record<string, string>;
const makeKey = (s: string, f: string) => `${s}::${f}`;

// ── Upload Field Component ────────────────────────────────────────────────────
function MediaUploadField({
  label, hint, type, value, isDirty,
  onChange, onUpload,
}: {
  label: string;
  hint?: string;
  type: 'image' | 'video';
  value: string;
  isDirty: boolean;
  onChange: (val: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVideo = type === 'video';
  const accept = isVideo ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif';
  const isSupabaseUrl = value.includes('supabase.co');
  const isLocalPath = value.startsWith('/');

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (e: any) {
      setUploadError(e.message || 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="block text-sm font-semibold text-[#4A4A4A]">{label}</label>
        {isDirty && <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#D97706]">Geändert</span>}
      </div>
      {hint && <p className="mb-2 text-xs text-[#6B6B6B]">{hint}</p>}

      {/* Current preview */}
      {value && (
        <div className="mb-3">
          {isVideo ? (
            <div className="rounded-[4px] border border-neutral-200 bg-black overflow-hidden" style={{ maxHeight: 120 }}>
              <video src={value} className="h-28 w-full object-contain" preload="metadata" />
            </div>
          ) : (
            <div className="relative h-24 w-40 overflow-hidden rounded-[4px] border border-neutral-200 bg-neutral-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt={label} className="h-full w-full object-cover" />
            </div>
          )}
          <p className="mt-1 truncate text-[10px] text-[#6B6B6B]">
            {isSupabaseUrl ? '✓ Supabase Storage' : isLocalPath ? '📁 Lokale Datei' : value}
          </p>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[4px] border-2 border-dashed px-4 py-5 text-center transition ${
          dragOver ? 'border-[#884A4A] bg-[#FDF8F8]' : 'border-neutral-300 hover:border-[#884A4A] hover:bg-neutral-50'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        {uploading ? (
          <>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200" style={{ borderTopColor: brand }} />
            <p className="mt-2 text-xs text-[#6B6B6B]">Wird hochgeladen...</p>
          </>
        ) : (
          <>
            <span className="text-2xl">{isVideo ? '🎬' : '🖼️'}</span>
            <p className="mt-1 text-xs font-semibold text-[#4A4A4A]">
              {isVideo ? 'Video hierher ziehen' : 'Bild hierher ziehen'}
            </p>
            <p className="text-[10px] text-[#6B6B6B]">oder klicken zum Auswählen · max. 50MB</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* Manual URL input */}
      <div className="mt-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isVideo ? '/video.mp4 oder https://...' : '/bild.jpg oder https://...'}
          className="h-9 w-full rounded-[4px] border border-neutral-200 px-3 text-xs text-[#4A4A4A] outline-none transition focus:border-[#884A4A]"
          style={{ borderColor: isDirty ? '#D97706' : undefined }}
        />
        <p className="mt-0.5 text-[10px] text-[#6B6B6B]">Oder Pfad/URL manuell eingeben</p>
      </div>

      {uploadError && (
        <p className="mt-1 text-xs text-red-600">{uploadError}</p>
      )}
    </div>
  );
}

// ── Color Field Component ─────────────────────────────────────────────────────
function ColorField({
  label, hint, value, isDirty, onChange,
}: {
  label: string; hint?: string; value: string; isDirty: boolean; onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="block text-sm font-semibold text-[#4A4A4A]">{label}</label>
        {isDirty && <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#D97706]">Geändert</span>}
      </div>
      {hint && <p className="mb-2 text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value || '#884A4A'}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-16 cursor-pointer rounded-[4px] border border-neutral-300 p-1"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#884A4A"
          className="h-11 w-36 rounded-[4px] border px-3 font-mono text-sm outline-none transition"
          style={{ borderColor: isDirty ? '#D97706' : '#D1D5DB' }}
          maxLength={9}
        />
        {value && (
          <div
            className="h-11 w-11 rounded-[4px] border border-neutral-200 shadow-sm"
            style={{ backgroundColor: value }}
          />
        )}
      </div>
    </div>
  );
}

// ── Main CMS Page ─────────────────────────────────────────────────────────────
export default function CmsPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState(SECTIONS[0].group);

  // Daten laden
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/content?page=home');
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        const map: ContentMap = {};
        for (const entry of json.data) {
          map[makeKey(entry.section_key, entry.field_key)] = entry.value;
        }
        setContent(map);
      } catch (e: any) {
        setError('Fehler beim Laden: ' + e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = useCallback((section_key: string, field_key: string, value: string) => {
    const k = makeKey(section_key, field_key);
    setContent((prev) => ({ ...prev, [k]: value }));
    setDirty((prev) => new Set(prev).add(k));
  }, []);

  const handleUpload = useCallback(async (file: File, folder: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!json.ok) throw new Error(json.detail || json.error || 'Upload fehlgeschlagen');
    return json.url;
  }, []);

  const handleSave = async () => {
    if (dirty.size === 0) return;
    setSaving(true);
    setError('');

    const updates = Array.from(dirty).map((k) => {
      const [section_key, field_key] = k.split('::');
      return { section_key, field_key, value: content[k] ?? '' };
    });

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 'home', updates }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setDirty(new Set());
      setSavedAt(new Date());
    } catch (e: any) {
      setError('Fehler beim Speichern: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200" style={{ borderTopColor: brand }} />
      </div>
    );
  }

  const activeSection = SECTIONS.find((s) => s.group === activeGroup)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Content bearbeiten</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Texte, Farben, Bilder, Videos und Links – alles sofort live.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && dirty.size === 0 && (
            <p className="text-sm text-[#059669]">✓ Gespeichert {savedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}</p>
          )}
          {dirty.size > 0 && (
            <p className="text-sm text-[#D97706]">{dirty.size} ungespeicherte Änderung{dirty.size !== 1 ? 'en' : ''}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving || dirty.size === 0}
            className="rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: brand }}
          >
            {saving ? 'Wird gespeichert...' : '💾 Speichern & live schalten'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} <button className="ml-2 underline" onClick={() => setError('')}>OK</button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-4 space-y-0.5">
            {SECTIONS.map((s) => {
              const sectionDirty = s.items.some((item) => dirty.has(makeKey(item.section_key, item.field_key)));
              const isActive = activeGroup === s.group;
              return (
                <button
                  key={s.group}
                  onClick={() => setActiveGroup(s.group)}
                  className={`flex w-full items-center justify-between rounded-[4px] px-3 py-2 text-left text-sm font-semibold transition ${
                    isActive ? 'text-white' : 'text-[#4A4A4A] hover:bg-neutral-100'
                  }`}
                  style={isActive ? { backgroundColor: brand } : undefined}
                >
                  <span className="flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span className="truncate">{s.group}</span>
                  </span>
                  {sectionDirty && <span className="ml-1 h-2 w-2 shrink-0 rounded-full bg-[#D97706]" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Group Selector */}
        <div className="lg:hidden w-full">
          <select
            value={activeGroup}
            onChange={(e) => setActiveGroup(e.target.value)}
            className="w-full rounded-[4px] border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            {SECTIONS.map((s) => <option key={s.group} value={s.group}>{s.icon} {s.group}</option>)}
          </select>
        </div>

        {/* Editor Panel */}
        <div className="flex-1 min-w-0">
          <div className="rounded-[4px] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#2F2F2F]">
              <span>{activeSection.icon}</span>
              <span>{activeSection.group}</span>
            </h2>

            <div className="space-y-6">
              {activeSection.items.map((item) => {
                const k = makeKey(item.section_key, item.field_key);
                const val = content[k] ?? '';
                const isDirty = dirty.has(k);
                const isMediaField = item.type === 'image' || item.type === 'video';
                const folder = item.type === 'video' ? 'videos' : 'images';

                if (item.type === 'color') {
                  return (
                    <ColorField
                      key={k}
                      label={item.label}
                      hint={item.hint}
                      value={val}
                      isDirty={isDirty}
                      onChange={(v) => handleChange(item.section_key, item.field_key, v)}
                    />
                  );
                }

                if (isMediaField) {
                  return (
                    <MediaUploadField
                      key={k}
                      label={item.label}
                      hint={item.hint}
                      type={item.type as 'image' | 'video'}
                      value={val}
                      isDirty={isDirty}
                      onChange={(v) => handleChange(item.section_key, item.field_key, v)}
                      onUpload={(file) => handleUpload(file, folder)}
                    />
                  );
                }

                // Text / Textarea / Link
                return (
                  <div key={k}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <label className="block text-sm font-semibold text-[#4A4A4A]">{item.label}</label>
                      {item.type === 'link' && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Link</span>
                      )}
                      {isDirty && <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#D97706]">Geändert</span>}
                    </div>
                    {item.hint && <p className="mb-1.5 text-xs text-[#6B6B6B]">{item.hint}</p>}

                    {item.type === 'textarea' ? (
                      <textarea
                        value={val}
                        onChange={(e) => handleChange(item.section_key, item.field_key, e.target.value)}
                        rows={3}
                        className="w-full rounded-[4px] border px-4 py-2.5 text-sm text-[#2F2F2F] outline-none transition resize-y"
                        style={{ borderColor: isDirty ? '#D97706' : '#D1D5DB' }}
                      />
                    ) : item.type === 'link' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#6B6B6B]">🔗</span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleChange(item.section_key, item.field_key, e.target.value)}
                          placeholder="#quiz oder https://..."
                          className="h-11 flex-1 rounded-[4px] border px-4 text-sm text-[#2F2F2F] outline-none transition font-mono"
                          style={{ borderColor: isDirty ? '#D97706' : '#D1D5DB' }}
                        />
                        {val && (
                          <a
                            href={val}
                            target={val.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] transition hover:bg-neutral-50"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleChange(item.section_key, item.field_key, e.target.value)}
                        className="h-11 w-full rounded-[4px] border px-4 text-sm text-[#2F2F2F] outline-none transition"
                        style={{ borderColor: isDirty ? '#D97706' : '#D1D5DB' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Save */}
            <div className="mt-8 flex justify-end border-t border-neutral-100 pt-5">
              <button
                onClick={handleSave}
                disabled={saving || dirty.size === 0}
                className="rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: brand }}
              >
                {saving ? 'Wird gespeichert...' : '💾 Speichern & live schalten'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
