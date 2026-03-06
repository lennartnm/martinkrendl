'use client';
// src/app/admin/cms/page.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Palette, Image as ImageIcon, Video, Link as LinkIcon,
  Type, AlignLeft, ChevronDown, ChevronRight, Save,
  CheckCircle, AlertCircle, Upload, Eye, Loader2,
} from 'lucide-react';

const brand = '#884A4A';

// ── Typen ────────────────────────────────────────────────────────────────────
type FieldType = 'text' | 'textarea' | 'color' | 'image' | 'video' | 'link';
type ContentMap = Record<string, string>;
const makeKey = (s: string, f: string) => `${s}::${f}`;

type FieldDef = {
  section_key: string;
  field_key: string;
  label: string;
  type: FieldType;
  hint?: string;
};

type SectionGroup = {
  id: string;
  label: string;
  icon: React.ReactNode;
  fields: FieldDef[];
};

const ic = 'h-4 w-4';

// ── Sektions-Definitionen ────────────────────────────────────────────────────
const SECTIONS: SectionGroup[] = [
  {
    id: 'colors',
    label: 'Farben',
    icon: <Palette className={ic} />,
    fields: [
      { section_key: 'colors', field_key: 'brand',      label: 'Brand-Farbe',        type: 'color', hint: 'Buttons, Icons, Akzente' },
      { section_key: 'colors', field_key: 'header_bg',  label: 'Header Hintergrund', type: 'color' },
      { section_key: 'colors', field_key: 'graphite',   label: 'Textfarbe dunkel',   type: 'color' },
      { section_key: 'colors', field_key: 'dark_gray',  label: 'Textfarbe mittel',   type: 'color' },
      { section_key: 'colors', field_key: 'light_gray', label: 'Textfarbe hell',     type: 'color' },
      { section_key: 'colors', field_key: 'quiz_bg',    label: 'Quiz Hintergrund',   type: 'color' },
    ],
  },
  {
    id: 'images',
    label: 'Bilder',
    icon: <ImageIcon className={ic} />,
    fields: [
      { section_key: 'images', field_key: 'hero',      label: 'Hero Bild',              type: 'image', hint: 'Empfohlen: 1920×800px' },
      { section_key: 'images', field_key: 'section1',  label: 'Sektion 1 Bild',         type: 'image', hint: 'Empfohlen: 800×800px' },
      { section_key: 'images', field_key: 'quote_bg',  label: 'Zitat Hintergrund',      type: 'image' },
      { section_key: 'images', field_key: 'section2',  label: 'Sektion 2 Bild',         type: 'image' },
      { section_key: 'images', field_key: 'about',     label: 'Portrait (Über Martin)', type: 'image' },
      { section_key: 'images', field_key: 'final_cta', label: 'Abschluss CTA Bild',     type: 'image' },
      { section_key: 'images', field_key: 'logo1',     label: 'Logo 1',                 type: 'image' },
      { section_key: 'images', field_key: 'logo2',     label: 'Logo 2',                 type: 'image' },
    ],
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: <Video className={ic} />,
    fields: [
      { section_key: 'videos', field_key: 'carousel_1_src',      label: 'Carousel Video 1',             type: 'video' },
      { section_key: 'videos', field_key: 'carousel_1_thumb',    label: 'Carousel Video 1 Vorschau',    type: 'image' },
      { section_key: 'videos', field_key: 'carousel_2_src',      label: 'Carousel Video 2',             type: 'video' },
      { section_key: 'videos', field_key: 'carousel_2_thumb',    label: 'Carousel Video 2 Vorschau',    type: 'image' },
      { section_key: 'videos', field_key: 'carousel_3_src',      label: 'Carousel Video 3',             type: 'video' },
      { section_key: 'videos', field_key: 'carousel_3_thumb',    label: 'Carousel Video 3 Vorschau',    type: 'image' },
      { section_key: 'videos', field_key: 'testimonial_1_src',   label: 'Testimonial Video 1',          type: 'video' },
      { section_key: 'videos', field_key: 'testimonial_1_thumb', label: 'Testimonial Video 1 Vorschau', type: 'image' },
      { section_key: 'videos', field_key: 'testimonial_2_src',   label: 'Testimonial Video 2',          type: 'video' },
      { section_key: 'videos', field_key: 'testimonial_2_thumb', label: 'Testimonial Video 2 Vorschau', type: 'image' },
    ],
  },
  {
    id: 'links',
    label: 'Button Links',
    icon: <LinkIcon className={ic} />,
    fields: [
      { section_key: 'links', field_key: 'header_cta',       label: 'Header CTA',        type: 'link', hint: '#quiz oder https://...' },
      { section_key: 'links', field_key: 'hero_cta',         label: 'Hero CTA',          type: 'link' },
      { section_key: 'links', field_key: 'image_text_1_cta', label: 'Sektion 1 CTA',     type: 'link' },
      { section_key: 'links', field_key: 'image_text_2_cta', label: 'Sektion 2 CTA',     type: 'link' },
      { section_key: 'links', field_key: 'features_2_cta',   label: 'Feature Cards CTA', type: 'link' },
      { section_key: 'links', field_key: 'final_cta',        label: 'Abschluss CTA',     type: 'link' },
    ],
  },
  {
    id: 'header',
    label: 'Header & Navigation',
    icon: <Type className={ic} />,
    fields: [
      { section_key: 'header', field_key: 'logo_text', label: 'Logo Text',         type: 'text' },
      { section_key: 'header', field_key: 'cta_label', label: 'Header CTA Button', type: 'text' },
    ],
  },
  {
    id: 'hero',
    label: 'Hero Bereich',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'hero', field_key: 'title',        label: 'Überschrift',  type: 'text' },
      { section_key: 'hero', field_key: 'subtitle',     label: 'Unterzeile',   type: 'textarea' },
      { section_key: 'hero', field_key: 'cta_label',    label: 'CTA Button',   type: 'text' },
      { section_key: 'hero', field_key: 'social_proof', label: 'Social Proof', type: 'text' },
    ],
  },
  {
    id: 'logos_section',
    label: 'Logo Sektion',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'logos_section', field_key: 'label', label: 'Label Text', type: 'text' },
    ],
  },
  {
    id: 'feature_cards_3',
    label: 'Feature Cards (3er)',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'feature_card_1', field_key: 'title', label: 'Karte 1 Titel', type: 'text' },
      { section_key: 'feature_card_1', field_key: 'text',  label: 'Karte 1 Text',  type: 'textarea' },
      { section_key: 'feature_card_2', field_key: 'title', label: 'Karte 2 Titel', type: 'text' },
      { section_key: 'feature_card_2', field_key: 'text',  label: 'Karte 2 Text',  type: 'textarea' },
      { section_key: 'feature_card_3', field_key: 'title', label: 'Karte 3 Titel', type: 'text' },
      { section_key: 'feature_card_3', field_key: 'text',  label: 'Karte 3 Text',  type: 'textarea' },
    ],
  },
  {
    id: 'image_text_1',
    label: 'Bild + Text Sektion 1',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'image_text_1', field_key: 'title',    label: 'Überschrift', type: 'text' },
      { section_key: 'image_text_1', field_key: 'text',     label: 'Fließtext',   type: 'textarea' },
      { section_key: 'image_text_1', field_key: 'cta_label',label: 'CTA Button',  type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_1', label: 'Bullet 1',    type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_2', label: 'Bullet 2',    type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_3', label: 'Bullet 3',    type: 'text' },
    ],
  },
  {
    id: 'quote_section',
    label: 'Zitat',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'quote_section', field_key: 'label', label: 'Label', type: 'text' },
      { section_key: 'quote_section', field_key: 'quote', label: 'Zitat', type: 'textarea' },
    ],
  },
  {
    id: 'video_section',
    label: 'Video Carousel Texte',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'video_section', field_key: 'title', label: 'Überschrift',  type: 'text' },
      { section_key: 'video_section', field_key: 'text',  label: 'Beschreibung', type: 'textarea' },
    ],
  },
  {
    id: 'image_text_2',
    label: 'Bild + Text Sektion 2',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'image_text_2', field_key: 'title',    label: 'Überschrift', type: 'text' },
      { section_key: 'image_text_2', field_key: 'text',     label: 'Fließtext',   type: 'textarea' },
      { section_key: 'image_text_2', field_key: 'cta_label',label: 'CTA Button',  type: 'text' },
    ],
  },
  {
    id: 'feature_cards_4',
    label: 'Feature Cards (4er)',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'features_2_heading', field_key: 'title', label: 'Überschrift',   type: 'text' },
      { section_key: 'features_2_heading', field_key: 'text',  label: 'Unterzeile',    type: 'textarea' },
      { section_key: 'feature2_card_1',    field_key: 'title', label: 'Karte 1 Titel', type: 'text' },
      { section_key: 'feature2_card_1',    field_key: 'text',  label: 'Karte 1 Text',  type: 'textarea' },
      { section_key: 'feature2_card_2',    field_key: 'title', label: 'Karte 2 Titel', type: 'text' },
      { section_key: 'feature2_card_2',    field_key: 'text',  label: 'Karte 2 Text',  type: 'textarea' },
      { section_key: 'feature2_card_3',    field_key: 'title', label: 'Karte 3 Titel', type: 'text' },
      { section_key: 'feature2_card_3',    field_key: 'text',  label: 'Karte 3 Text',  type: 'textarea' },
      { section_key: 'feature2_card_4',    field_key: 'title', label: 'Karte 4 Titel', type: 'text' },
      { section_key: 'feature2_card_4',    field_key: 'text',  label: 'Karte 4 Text',  type: 'textarea' },
    ],
  },
  {
    id: 'flowing_text',
    label: 'Fließtext',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'flowing_text', field_key: 'text', label: 'Text', type: 'textarea' },
    ],
  },
  {
    id: 'testimonials',
    label: 'Video Testimonials',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'testimonial_1', field_key: 'label',  label: 'Testimonial 1 Label', type: 'text' },
      { section_key: 'testimonial_1', field_key: 'quote',  label: 'Testimonial 1 Zitat', type: 'textarea' },
      { section_key: 'testimonial_1', field_key: 'author', label: 'Testimonial 1 Autor', type: 'text' },
      { section_key: 'testimonial_2', field_key: 'label',  label: 'Testimonial 2 Label', type: 'text' },
      { section_key: 'testimonial_2', field_key: 'quote',  label: 'Testimonial 2 Zitat', type: 'textarea' },
      { section_key: 'testimonial_2', field_key: 'author', label: 'Testimonial 2 Autor', type: 'text' },
    ],
  },
  {
    id: 'about',
    label: 'Über Martin',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'about', field_key: 'label',  label: 'Label',      type: 'text' },
      { section_key: 'about', field_key: 'title',  label: 'Überschrift',type: 'text' },
      { section_key: 'about', field_key: 'text_1', label: 'Absatz 1',   type: 'textarea' },
      { section_key: 'about', field_key: 'text_2', label: 'Absatz 2',   type: 'textarea' },
      { section_key: 'about', field_key: 'text_3', label: 'Absatz 3',   type: 'textarea' },
    ],
  },
  {
    id: 'reviews',
    label: 'Bewertungen',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'reviews',  field_key: 'title',  label: 'Überschrift',    type: 'text' },
      { section_key: 'review_1', field_key: 'text',   label: 'Review 1 Text',  type: 'textarea' },
      { section_key: 'review_1', field_key: 'author', label: 'Review 1 Autor', type: 'text' },
      { section_key: 'review_2', field_key: 'text',   label: 'Review 2 Text',  type: 'textarea' },
      { section_key: 'review_2', field_key: 'author', label: 'Review 2 Autor', type: 'text' },
      { section_key: 'review_3', field_key: 'text',   label: 'Review 3 Text',  type: 'textarea' },
      { section_key: 'review_3', field_key: 'author', label: 'Review 3 Autor', type: 'text' },
    ],
  },
  {
    id: 'final_cta',
    label: 'Abschluss CTA',
    icon: <AlignLeft className={ic} />,
    fields: [
      { section_key: 'final_cta', field_key: 'title',    label: 'Überschrift', type: 'text' },
      { section_key: 'final_cta', field_key: 'text',     label: 'Text',        type: 'textarea' },
      { section_key: 'final_cta', field_key: 'cta_label',label: 'CTA Button',  type: 'text' },
    ],
  },
];

// ── Sub-Components ────────────────────────────────────────────────────────────

function DirtyBadge() {
  return (
    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
      geändert
    </span>
  );
}

function ColorField({ label, hint, value, isDirty, onChange }: {
  label: string; hint?: string; value: string; isDirty: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>
        {isDirty && <DirtyBadge />}
      </div>
      {hint && <p className="text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="flex items-center gap-3">
        <input
          type="color" value={value || '#884A4A'}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-[4px] border border-neutral-200 p-0.5"
        />
        <input
          type="text" value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#884A4A" maxLength={9}
          className="h-10 w-32 rounded-[4px] border px-3 font-mono text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
          style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }}
        />
        <div className="h-10 w-10 shrink-0 rounded-[4px] border border-neutral-200 shadow-sm" style={{ backgroundColor: value || '#884A4A' }} />
      </div>
    </div>
  );
}

function MediaField({ label, hint, type, value, isDirty, onChange, onUpload }: {
  label: string; hint?: string; type: 'image' | 'video';
  value: string; isDirty: boolean;
  onChange: (v: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isVideo = type === 'video';
  const accept = isVideo ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif';

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError('');
    try { onChange(await onUpload(file)); }
    catch (e: any) { setUploadError(e.message || 'Upload fehlgeschlagen'); }
    finally { setUploading(false); }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>
        {isDirty && <DirtyBadge />}
      </div>
      {hint && <p className="text-xs text-[#6B6B6B]">{hint}</p>}

      <div className="flex gap-4">
        {value && (
          <div className="shrink-0">
            {isVideo
              ? <div className="h-20 w-36 overflow-hidden rounded-[4px] border border-neutral-200 bg-black"><video src={value} className="h-full w-full object-contain" preload="metadata" /></div>
              : <div className="h-20 w-20 overflow-hidden rounded-[4px] border border-neutral-200 bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={value} alt={label} className="h-full w-full object-cover" />
                </div>
            }
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <div
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`flex cursor-pointer items-center gap-3 rounded-[4px] border-2 border-dashed px-4 py-3 text-sm transition ${
              dragOver ? 'border-[#884A4A] bg-[#FDF8F8]' : 'border-neutral-200 hover:border-[#884A4A] hover:bg-neutral-50'
            } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[#884A4A]" /> : <Upload className="h-4 w-4 text-[#6B6B6B]" />}
            <span className="text-[#4A4A4A]">{uploading ? 'Wird hochgeladen...' : isVideo ? 'Video hochladen' : 'Bild hochladen'}</span>
            <span className="ml-auto text-xs text-[#6B6B6B]">max. 50 MB</span>
          </div>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          <input
            type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={isVideo ? '/video.mp4 oder https://...' : '/bild.jpg oder https://...'}
            className="h-9 w-full rounded-[4px] border px-3 text-xs text-[#4A4A4A] outline-none transition focus:border-[#884A4A]"
            style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }}
          />
          {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}

function TextField({ label, hint, type, value, isDirty, onChange }: {
  label: string; hint?: string; type: 'text' | 'textarea' | 'link';
  value: string; isDirty: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>
        {type === 'link' && <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Link</span>}
        {isDirty && <DirtyBadge />}
      </div>
      {hint && <p className="text-xs text-[#6B6B6B]">{hint}</p>}

      {type === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full resize-y rounded-[4px] border px-3 py-2.5 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
          style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }}
        />
      ) : type === 'link' ? (
        <div className="flex items-center gap-2">
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#quiz oder https://..."
            className="h-10 flex-1 rounded-[4px] border px-3 font-mono text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
            style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }}
          />
          {value && (
            <a href={value} target={value.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] transition hover:bg-neutral-50" title="Link testen">
              <Eye className="h-4 w-4" />
            </a>
          )}
        </div>
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-[4px] border px-3 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
          style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }}
        />
      )}
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
function AccordionSection({ section, content, dirty, onChange, onUpload, defaultOpen }: {
  section: SectionGroup; content: ContentMap; dirty: Set<string>;
  onChange: (sk: string, fk: string, v: string) => void;
  onUpload: (file: File, folder: string) => Promise<string>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const dirtyCount = section.fields.filter((f) => dirty.has(makeKey(f.section_key, f.field_key))).length;

  const renderFields = () => {
    const firstType = section.fields[0]?.type;

    if (firstType === 'color') {
      return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.fields.map((f) => {
            const k = makeKey(f.section_key, f.field_key);
            return <ColorField key={k} label={f.label} hint={f.hint} value={content[k] ?? ''} isDirty={dirty.has(k)} onChange={(v) => onChange(f.section_key, f.field_key, v)} />;
          })}
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2">
        {section.fields.map((f) => {
          const k = makeKey(f.section_key, f.field_key);
          const isMedia = f.type === 'image' || f.type === 'video';
          const isWide = f.type === 'textarea';

          if (isMedia) {
            return (
              <div key={k} className="md:col-span-2">
                <MediaField
                  label={f.label} hint={f.hint} type={f.type as 'image' | 'video'}
                  value={content[k] ?? ''} isDirty={dirty.has(k)}
                  onChange={(v) => onChange(f.section_key, f.field_key, v)}
                  onUpload={(file) => onUpload(file, f.type === 'video' ? 'videos' : 'images')}
                />
              </div>
            );
          }

          return (
            <div key={k} className={isWide ? 'md:col-span-2' : ''}>
              <TextField
                label={f.label} hint={f.hint} type={f.type as 'text' | 'textarea' | 'link'}
                value={content[k] ?? ''} isDirty={dirty.has(k)}
                onChange={(v) => onChange(f.section_key, f.field_key, v)}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-[4px] border border-neutral-200 bg-white">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-neutral-50">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-white" style={{ backgroundColor: brand }}>
          {section.icon}
        </span>
        <span className="flex-1 text-sm font-bold text-[#2F2F2F]">{section.label}</span>
        {dirtyCount > 0 && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
            {dirtyCount} geändert
          </span>
        )}
        {open ? <ChevronDown className="h-4 w-4 text-[#6B6B6B]" /> : <ChevronRight className="h-4 w-4 text-[#6B6B6B]" />}
      </button>

      {open && (
        <div className="border-t border-neutral-100 px-5 py-5">
          {renderFields()}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CmsPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content?page=home')
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error);
        const map: ContentMap = {};
        for (const entry of json.data) map[makeKey(entry.section_key, entry.field_key)] = entry.value;
        setContent(map);
      })
      .catch((e) => setError('Fehler beim Laden: ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((sk: string, fk: string, v: string) => {
    const k = makeKey(sk, fk);
    setContent((prev) => ({ ...prev, [k]: v }));
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
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
      </div>
    );
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); * { font-family: 'Open Sans', sans-serif !important; }`}</style>

      <div className="space-y-5 pb-10">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Content bearbeiten</h1>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Änderungen werden sofort live geschaltet.</p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && dirty.size === 0 && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                Gespeichert {savedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            {dirty.size > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                {dirty.size} ungespeichert
              </div>
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
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <button className="ml-auto underline" onClick={() => setError('')}>OK</button>
          </div>
        )}

        {/* Accordion Sections */}
        <div className="space-y-2">
          {SECTIONS.map((section, i) => (
            <AccordionSection
              key={section.id} section={section} content={content} dirty={dirty}
              onChange={handleChange} onUpload={handleUpload} defaultOpen={i < 2}
            />
          ))}
        </div>

        {/* Sticky save bar */}
        {dirty.size > 0 && (
          <div className="sticky bottom-4 flex justify-end">
            <div className="flex items-center gap-3 rounded-[4px] border border-amber-200 bg-white px-4 py-3 shadow-lg">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-[#4A4A4A]">
                {dirty.size} ungespeicherte Änderung{dirty.size !== 1 ? 'en' : ''}
              </span>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-[4px] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: brand }}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Jetzt speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
