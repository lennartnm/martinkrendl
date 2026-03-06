'use client';
// src/app/admin/cms/page.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Upload, Eye,
  EyeOff, ChevronDown, ChevronRight,
  Palette, Image as ImageIcon, Video, Link as LinkIcon, Type, GripVertical, FileText,
} from 'lucide-react';

const brand = '#884A4A';
type CM = Record<string, string>;
const mk = (s: string, f: string) => `${s}::${f}`;
type FT = 'text' | 'textarea' | 'color' | 'image' | 'video' | 'link';

type Field = { section_key: string; field_key: string; label: string; type: FT; hint?: string };
type Sect  = { id: string; label: string; fields: Field[] };

const HOME_SECTIONS: Sect[] = [
  {
    id: 'header', label: 'Header & Navigation',
    fields: [
      { section_key: 'header', field_key: 'logo_text', label: 'Logo Text',          type: 'text' },
      { section_key: 'header', field_key: 'cta_label', label: 'CTA Button Text',    type: 'text' },
      { section_key: 'links',  field_key: 'header_cta',label: 'CTA Button Link',    type: 'link', hint: '#quiz oder https://...' },
      { section_key: 'colors', field_key: 'header_bg', label: 'Hintergrundfarbe',   type: 'color' },
    ],
  },
  {
    id: 'hero', label: 'Hero Bereich',
    fields: [
      { section_key: 'hero',   field_key: 'title',        label: 'Überschrift',    type: 'text' },
      { section_key: 'hero',   field_key: 'subtitle',     label: 'Unterzeile',     type: 'textarea' },
      { section_key: 'hero',   field_key: 'cta_label',    label: 'CTA Button Text',type: 'text' },
      { section_key: 'hero',   field_key: 'social_proof', label: 'Social Proof',   type: 'text' },
      { section_key: 'links',  field_key: 'hero_cta',     label: 'CTA Button Link',type: 'link', hint: '#quiz oder https://...' },
      { section_key: 'images', field_key: 'hero',         label: 'Hero Bild',      type: 'image', hint: 'Empfohlen: 1920×800px' },
    ],
  },
  {
    id: 'logos', label: 'Logo Sektion',
    fields: [
      { section_key: 'logos_section', field_key: 'label', label: 'Label Text', type: 'text' },
      { section_key: 'images', field_key: 'logo1', label: 'Logo 1', type: 'image' },
      { section_key: 'images', field_key: 'logo2', label: 'Logo 2', type: 'image' },
    ],
  },
  {
    id: 'feature_cards_3', label: 'Feature Cards (3er)',
    fields: [
      { section_key: 'feature_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
      { section_key: 'feature_card_1', field_key: 'text',  label: 'Karte 1 – Text',  type: 'textarea' },
      { section_key: 'feature_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
      { section_key: 'feature_card_2', field_key: 'text',  label: 'Karte 2 – Text',  type: 'textarea' },
      { section_key: 'feature_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
      { section_key: 'feature_card_3', field_key: 'text',  label: 'Karte 3 – Text',  type: 'textarea' },
      { section_key: 'colors', field_key: 'brand', label: 'Kartenfarbe', type: 'color' },
    ],
  },
  {
    id: 'image_text_1', label: 'Bild + Text – Sektion 1',
    fields: [
      { section_key: 'image_text_1', field_key: 'title',    label: 'Überschrift',    type: 'text' },
      { section_key: 'image_text_1', field_key: 'text',     label: 'Fließtext',      type: 'textarea' },
      { section_key: 'image_text_1', field_key: 'bullet_1', label: 'Bullet 1',       type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_2', label: 'Bullet 2',       type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_3', label: 'Bullet 3',       type: 'text' },
      { section_key: 'image_text_1', field_key: 'cta_label',label: 'CTA Button Text',type: 'text' },
      { section_key: 'links',  field_key: 'image_text_1_cta', label: 'CTA Button Link', type: 'link' },
      { section_key: 'images', field_key: 'section1', label: 'Bild', type: 'image', hint: 'Empfohlen: 800×800px' },
    ],
  },
  {
    id: 'quote', label: 'Zitat',
    fields: [
      { section_key: 'quote_section', field_key: 'label', label: 'Label',           type: 'text' },
      { section_key: 'quote_section', field_key: 'quote', label: 'Zitat',           type: 'textarea' },
      { section_key: 'images', field_key: 'quote_bg',     label: 'Hintergrundbild', type: 'image' },
    ],
  },
  {
    id: 'video_carousel', label: 'Video Carousel',
    fields: [
      { section_key: 'video_section', field_key: 'title', label: 'Überschrift',   type: 'text' },
      { section_key: 'video_section', field_key: 'text',  label: 'Beschreibung',  type: 'textarea' },
      { section_key: 'videos', field_key: 'carousel_1_src',   label: 'Video 1',              type: 'video' },
      { section_key: 'videos', field_key: 'carousel_1_thumb', label: 'Video 1 Vorschau',     type: 'image' },
      { section_key: 'videos', field_key: 'carousel_2_src',   label: 'Video 2',              type: 'video' },
      { section_key: 'videos', field_key: 'carousel_2_thumb', label: 'Video 2 Vorschau',     type: 'image' },
      { section_key: 'videos', field_key: 'carousel_3_src',   label: 'Video 3',              type: 'video' },
      { section_key: 'videos', field_key: 'carousel_3_thumb', label: 'Video 3 Vorschau',     type: 'image' },
    ],
  },
  {
    id: 'image_text_2', label: 'Bild + Text – Sektion 2',
    fields: [
      { section_key: 'image_text_2', field_key: 'title',    label: 'Überschrift',    type: 'text' },
      { section_key: 'image_text_2', field_key: 'text',     label: 'Fließtext',      type: 'textarea' },
      { section_key: 'image_text_2', field_key: 'cta_label',label: 'CTA Button Text',type: 'text' },
      { section_key: 'links',  field_key: 'image_text_2_cta', label: 'CTA Button Link', type: 'link' },
      { section_key: 'images', field_key: 'section2', label: 'Bild', type: 'image' },
    ],
  },
  {
    id: 'feature_cards_4', label: 'Feature Cards (4er)',
    fields: [
      { section_key: 'features_2_heading', field_key: 'title', label: 'Überschrift',   type: 'text' },
      { section_key: 'features_2_heading', field_key: 'text',  label: 'Unterzeile',    type: 'textarea' },
      { section_key: 'feature2_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
      { section_key: 'feature2_card_1', field_key: 'text',  label: 'Karte 1 – Text',  type: 'textarea' },
      { section_key: 'feature2_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
      { section_key: 'feature2_card_2', field_key: 'text',  label: 'Karte 2 – Text',  type: 'textarea' },
      { section_key: 'feature2_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
      { section_key: 'feature2_card_3', field_key: 'text',  label: 'Karte 3 – Text',  type: 'textarea' },
      { section_key: 'feature2_card_4', field_key: 'title', label: 'Karte 4 – Titel', type: 'text' },
      { section_key: 'feature2_card_4', field_key: 'text',  label: 'Karte 4 – Text',  type: 'textarea' },
      { section_key: 'links', field_key: 'features_2_cta', label: 'CTA Button Link', type: 'link' },
    ],
  },
  {
    id: 'flowing_text', label: 'Fließtext',
    fields: [
      { section_key: 'flowing_text', field_key: 'text', label: 'Text', type: 'textarea' },
    ],
  },
  {
    id: 'quiz', label: 'Quiz / Anfrage-Formular',
    fields: [
      { section_key: 'quiz_section', field_key: 'title',    label: 'Überschrift', type: 'text' },
      { section_key: 'quiz_section', field_key: 'subtitle', label: 'Unterzeile',  type: 'text' },
    ],
  },
  {
    id: 'testimonials', label: 'Video Testimonials',
    fields: [
      { section_key: 'testimonial_1', field_key: 'label',  label: 'Testimonial 1 – Label', type: 'text' },
      { section_key: 'testimonial_1', field_key: 'quote',  label: 'Testimonial 1 – Zitat', type: 'textarea' },
      { section_key: 'testimonial_1', field_key: 'author', label: 'Testimonial 1 – Autor', type: 'text' },
      { section_key: 'videos', field_key: 'testimonial_1_src',   label: 'Testimonial 1 – Video',   type: 'video' },
      { section_key: 'videos', field_key: 'testimonial_1_thumb', label: 'Testimonial 1 – Vorschau', type: 'image' },
      { section_key: 'testimonial_2', field_key: 'label',  label: 'Testimonial 2 – Label', type: 'text' },
      { section_key: 'testimonial_2', field_key: 'quote',  label: 'Testimonial 2 – Zitat', type: 'textarea' },
      { section_key: 'testimonial_2', field_key: 'author', label: 'Testimonial 2 – Autor', type: 'text' },
      { section_key: 'videos', field_key: 'testimonial_2_src',   label: 'Testimonial 2 – Video',   type: 'video' },
      { section_key: 'videos', field_key: 'testimonial_2_thumb', label: 'Testimonial 2 – Vorschau', type: 'image' },
    ],
  },
  {
    id: 'about', label: 'Über Martin',
    fields: [
      { section_key: 'about', field_key: 'label',  label: 'Label',      type: 'text' },
      { section_key: 'about', field_key: 'title',  label: 'Überschrift',type: 'text' },
      { section_key: 'about', field_key: 'text_1', label: 'Absatz 1',   type: 'textarea' },
      { section_key: 'about', field_key: 'text_2', label: 'Absatz 2',   type: 'textarea' },
      { section_key: 'about', field_key: 'text_3', label: 'Absatz 3',   type: 'textarea' },
      { section_key: 'images', field_key: 'about', label: 'Portrait',   type: 'image' },
    ],
  },
  {
    id: 'reviews', label: 'Bewertungen',
    fields: [
      { section_key: 'reviews',  field_key: 'title',  label: 'Überschrift',    type: 'text' },
      { section_key: 'review_1', field_key: 'text',   label: 'Review 1 – Text',  type: 'textarea' },
      { section_key: 'review_1', field_key: 'author', label: 'Review 1 – Autor', type: 'text' },
      { section_key: 'review_2', field_key: 'text',   label: 'Review 2 – Text',  type: 'textarea' },
      { section_key: 'review_2', field_key: 'author', label: 'Review 2 – Autor', type: 'text' },
      { section_key: 'review_3', field_key: 'text',   label: 'Review 3 – Text',  type: 'textarea' },
      { section_key: 'review_3', field_key: 'author', label: 'Review 3 – Autor', type: 'text' },
    ],
  },
  {
    id: 'final_cta', label: 'Abschluss CTA',
    fields: [
      { section_key: 'final_cta', field_key: 'title',    label: 'Überschrift',    type: 'text' },
      { section_key: 'final_cta', field_key: 'text',     label: 'Text',           type: 'textarea' },
      { section_key: 'final_cta', field_key: 'cta_label',label: 'CTA Button Text',type: 'text' },
      { section_key: 'links',  field_key: 'final_cta',   label: 'CTA Button Link',type: 'link' },
      { section_key: 'images', field_key: 'final_cta',   label: 'Bild',           type: 'image' },
    ],
  },
  {
    id: 'global_colors', label: 'Globale Farben',
    fields: [
      { section_key: 'colors', field_key: 'brand',      label: 'Brand-Farbe (Hauptfarbe)', type: 'color', hint: 'Wird für Buttons, Icons und Akzente auf der ganzen Seite verwendet.' },
      { section_key: 'colors', field_key: 'graphite',   label: 'Textfarbe dunkel',          type: 'color' },
      { section_key: 'colors', field_key: 'dark_gray',  label: 'Textfarbe mittel',          type: 'color' },
      { section_key: 'colors', field_key: 'light_gray', label: 'Textfarbe hell',            type: 'color' },
      { section_key: 'colors', field_key: 'quiz_bg',    label: 'Quiz Hintergrund',          type: 'color' },
    ],
  },
];

const DANKE_SECTIONS: Sect[] = [
  {
    id: 'danke_header', label: 'Danke-Seite Header',
    fields: [
      { section_key: 'danke_header', field_key: 'logo_text', label: 'Logo Text', type: 'text' },
    ],
  },
  {
    id: 'danke_hero', label: 'Danke-Seite Inhalt',
    fields: [
      { section_key: 'danke_hero', field_key: 'title',    label: 'Überschrift',       type: 'text' },
      { section_key: 'danke_hero', field_key: 'subtitle', label: 'Unterzeile',        type: 'textarea' },
      { section_key: 'danke_hero', field_key: 'cta_label',label: 'Button Text',       type: 'text' },
      { section_key: 'danke_hero', field_key: 'cta_link', label: 'Button Link',       type: 'link' },
    ],
  },
];

const PAGE_OPTIONS = [
  { value: 'home',  label: 'Startseite (home)' },
  { value: 'danke', label: 'Danke-Seite (danke)' },
];

const SECTIONS_BY_PAGE: Record<string, Sect[]> = {
  home: HOME_SECTIONS,
  danke: DANKE_SECTIONS,
};

const DEFAULT_ORDER_BY_PAGE: Record<string, string[]> = {
  home: HOME_SECTIONS.map(s => s.id),
  danke: DANKE_SECTIONS.map(s => s.id),
};

// ── Small field components ────────────────────────────────────────────────────

function DirtyBadge() {
  return <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">geändert</span>;
}

function ColorField({ label, hint, value, isDirty, onChange }: { label: string; hint?: string; value: string; isDirty: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Palette className="h-3.5 w-3.5 text-[#6B6B6B]" />
        <span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>
        {isDirty && <DirtyBadge />}
      </div>
      {hint && <p className="pl-5 text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="flex items-center gap-3 pl-5">
        <input type="color" value={value || '#884A4A'} onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-[4px] border border-neutral-200 p-0.5" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#884A4A" maxLength={9}
          className="h-10 w-32 rounded-[4px] border px-3 font-mono text-sm outline-none transition focus:border-[#884A4A]"
          style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
        <div className="h-10 w-10 shrink-0 rounded-[4px] border border-neutral-200 shadow-sm" style={{ backgroundColor: value || '#884A4A' }} />
      </div>
    </div>
  );
}

function MediaField({ label, hint, type, value, isDirty, onChange, onUpload }: { label: string; hint?: string; type: 'image' | 'video'; value: string; isDirty: boolean; onChange: (v: string) => void; onUpload: (f: File) => Promise<string> }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const isVid = type === 'video';
  const upload = async (f: File) => { setUploading(true); setErr(''); try { onChange(await onUpload(f)); } catch (e: any) { setErr(e.message); } finally { setUploading(false); } };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {isVid ? <Video className="h-3.5 w-3.5 text-[#6B6B6B]" /> : <ImageIcon className="h-3.5 w-3.5 text-[#6B6B6B]" />}
        <span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>
        {isDirty && <DirtyBadge />}
      </div>
      {hint && <p className="pl-5 text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="flex gap-3 pl-5">
        {value && (
          isVid
            ? <div className="h-16 w-28 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200 bg-black"><video src={value} className="h-full w-full object-contain" preload="metadata" /></div>
            : <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200 bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="" className="h-full w-full object-cover" />
              </div>
        )}
        <div className="flex flex-1 flex-col gap-1.5">
          <div
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onClick={() => !uploading && ref.current?.click()}
            className={`flex cursor-pointer items-center gap-2 rounded-[4px] border-2 border-dashed px-3 py-2 text-sm transition ${drag ? 'border-[#884A4A] bg-[#FDF8F8]' : 'border-neutral-200 hover:border-[#884A4A]'} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[#884A4A]" /> : <Upload className="h-4 w-4 text-[#6B6B6B]" />}
            <span className="text-[#4A4A4A]">{uploading ? 'Hochladen...' : isVid ? 'Video hochladen' : 'Bild hochladen'}</span>
            <span className="ml-auto text-xs text-[#6B6B6B]">max 50MB</span>
          </div>
          <input ref={ref} type="file" accept={isVid ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp'} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={isVid ? '/video.mp4 oder https://...' : '/bild.jpg oder https://...'}
            className="h-8 w-full rounded-[4px] border px-3 text-xs outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}

function TextField({ label, hint, type, value, isDirty, onChange }: { label: string; hint?: string; type: 'text' | 'textarea' | 'link'; value: string; isDirty: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {type === 'link' ? <LinkIcon className="h-3.5 w-3.5 text-[#6B6B6B]" /> : <Type className="h-3.5 w-3.5 text-[#6B6B6B]" />}
        <span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>
        {type === 'link' && <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Link</span>}
        {isDirty && <DirtyBadge />}
      </div>
      {hint && <p className="pl-5 text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="pl-5">
        {type === 'textarea' ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3}
            className="w-full resize-y rounded-[4px] border px-3 py-2 text-sm outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
        ) : type === 'link' ? (
          <div className="flex gap-2">
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#quiz oder https://..."
              className="h-10 flex-1 rounded-[4px] border px-3 font-mono text-sm outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
            {value && (
              <a href={value} target={value.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] hover:bg-neutral-50" title="Link testen">
                <Eye className="h-4 w-4" />
              </a>
            )}
          </div>
        ) : (
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full rounded-[4px] border px-3 text-sm outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
        )}
      </div>
    </div>
  );
}

// ── Section Accordion ──────────────────────────────────────────────────────────
function SectionRow({
  section, content, dirty, isHidden,
  onChange, onUpload, onToggleHide,
  isDragging, onDragStart, onDragOver, onDrop, onDragEnd,
}: {
  section: Sect; content: CM; dirty: Set<string>; isHidden: boolean;
  onChange: (sk: string, fk: string, v: string) => void;
  onUpload: (f: File, folder: string) => Promise<string>;
  onToggleHide: () => void;
  isDragging: boolean;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void; onDragEnd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dirtyCount = section.fields.filter((f) => dirty.has(mk(f.section_key, f.field_key))).length;
  const textFields  = section.fields.filter((f) => f.type === 'text' || f.type === 'textarea');
  const linkFields  = section.fields.filter((f) => f.type === 'link');
  const colorFields = section.fields.filter((f) => f.type === 'color');
  const mediaFields = section.fields.filter((f) => f.type === 'image' || f.type === 'video');

  const render = (f: Field) => {
    const k = mk(f.section_key, f.field_key);
    const v = content[k] ?? '';
    const id = dirty.has(k);
    const ch = (val: string) => onChange(f.section_key, f.field_key, val);
    if (f.type === 'color') return <ColorField key={k} label={f.label} hint={f.hint} value={v} isDirty={id} onChange={ch} />;
    if (f.type === 'image' || f.type === 'video') return <MediaField key={k} label={f.label} hint={f.hint} type={f.type} value={v} isDirty={id} onChange={ch} onUpload={(file) => onUpload(file, f.type === 'video' ? 'videos' : 'images')} />;
    return <TextField key={k} label={f.label} hint={f.hint} type={f.type as 'text' | 'textarea' | 'link'} value={v} isDirty={id} onChange={ch} />;
  };

  return (
    <div
      draggable
      onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
      className={`overflow-hidden rounded-[4px] border bg-white transition-all ${isDragging ? 'opacity-40 scale-[0.99]' : ''} ${isHidden ? 'border-neutral-200 opacity-60' : 'border-neutral-200'}`}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing">
          <GripVertical className="h-5 w-5" />
        </div>
        <button type="button" onClick={() => !isHidden && setOpen((v) => !v)} className="flex flex-1 items-center gap-2 text-left min-w-0">
          {open && !isHidden ? <ChevronDown className="h-4 w-4 shrink-0 text-[#6B6B6B]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[#6B6B6B]" />}
          <span className={`truncate text-sm font-bold ${isHidden ? 'text-[#6B6B6B] line-through' : 'text-[#2F2F2F]'}`}>
            {section.label}
          </span>
          {dirtyCount > 0 && !isHidden && (
            <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">{dirtyCount}</span>
          )}
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {colorFields.length > 0 && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><Palette className="h-2.5 w-2.5" /> {colorFields.length}</span>}
          {mediaFields.length > 0 && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><ImageIcon className="h-2.5 w-2.5" /> {mediaFields.length}</span>}
          {linkFields.length > 0  && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><LinkIcon className="h-2.5 w-2.5" /> {linkFields.length}</span>}
          {textFields.length > 0  && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><Type className="h-2.5 w-2.5" /> {textFields.length}</span>}
        </div>

        <button type="button" onClick={onToggleHide}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] transition hover:bg-neutral-50"
          title={isHidden ? 'Sektion auf der Website anzeigen' : 'Sektion auf der Website ausblenden'}>
          {isHidden ? <EyeOff className="h-4 w-4 text-amber-500" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {open && !isHidden && (
        <div className="border-t border-neutral-100 px-5 py-5 space-y-6">
          {textFields.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Texte</p>
              <div className="grid gap-4 md:grid-cols-2">
                {textFields.map((f) => (
                  <div key={mk(f.section_key, f.field_key)} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>{render(f)}</div>
                ))}
              </div>
            </div>
          )}
          {linkFields.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Button Links</p>
              <div className="grid gap-4 md:grid-cols-2">
                {linkFields.map((f) => <div key={mk(f.section_key, f.field_key)}>{render(f)}</div>)}
              </div>
            </div>
          )}
          {colorFields.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Farben</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {colorFields.map((f) => render(f))}
              </div>
            </div>
          )}
          {mediaFields.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Bilder & Videos</p>
              <div className="grid gap-5 md:grid-cols-2">
                {mediaFields.map((f) => render(f))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CmsPage() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const pageDropdownRef = useRef<HTMLDivElement>(null);
  const [content, setContent]   = useState<CM>({});
  const [dirty, setDirty]       = useState<Set<string>>(new Set());
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [savedAt, setSavedAt]   = useState<Date | null>(null);
  const [error, setError]       = useState('');
  const [order, setOrder]       = useState<string[]>([]);
  const [hidden, setHidden]     = useState<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const dragOver = useRef<string | null>(null);

  // Close page dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(e.target as Node)) {
        setPageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentSections = SECTIONS_BY_PAGE[selectedPage] || [];

  // Load content when page changes
  useEffect(() => {
    setLoading(true);
    setDirty(new Set());
    setOrderDirty(false);
    fetch(`/api/admin/content?page=${selectedPage}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error);
        const map: CM = {};
        for (const e of json.data) map[mk(e.section_key, e.field_key)] = e.value;
        setContent(map);

        // Restore order & hidden from saved CMS values
        const savedOrder = map['layout::section_order'];
        const savedHidden = map['layout::hidden_sections'];
        setOrder(savedOrder ? savedOrder.split(',').map((s: string) => s.trim()).filter(Boolean) : DEFAULT_ORDER_BY_PAGE[selectedPage] || currentSections.map(s => s.id));
        setHidden(savedHidden ? new Set(savedHidden.split(',').map((s: string) => s.trim()).filter(Boolean)) : new Set());
      })
      .catch((e) => setError('Laden: ' + e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPage]);

  const handleChange = useCallback((sk: string, fk: string, v: string) => {
    const k = mk(sk, fk);
    setContent((p) => ({ ...p, [k]: v }));
    setDirty((p) => new Set(p).add(k));
  }, []);

  const handleUpload = useCallback(async (file: File, folder: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file); fd.append('folder', folder);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!json.ok) throw new Error(json.detail || json.error);
    return json.url;
  }, []);

  const handleSave = async () => {
    if (dirty.size === 0 && !orderDirty) return;
    setSaving(true); setError('');

    // Include layout meta fields
    const allDirty = new Set(dirty);
    const updatesFromDirty = Array.from(allDirty).map((k) => { const [sk, fk] = k.split('::'); return { section_key: sk, field_key: fk, value: content[k] ?? '' }; });

    // Always save layout order + hidden when orderDirty
    const layoutUpdates = orderDirty ? [
      { section_key: 'layout', field_key: 'section_order', value: order.join(',') },
      { section_key: 'layout', field_key: 'hidden_sections', value: Array.from(hidden).join(',') },
    ] : [];

    const updates = [...updatesFromDirty, ...layoutUpdates];
    if (updates.length === 0) { setSaving(false); return; }

    try {
      const res = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: selectedPage, updates }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setDirty(new Set()); setSavedAt(new Date()); setOrderDirty(false);
    } catch (e: any) { setError('Speichern: ' + e.message); }
    finally { setSaving(false); }
  };

  const toggleHide = (id: string) => {
    setHidden((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
    setOrderDirty(true);
  };

  const onDragStart = (id: string) => setDraggingId(id);
  const onDragOver  = (e: React.DragEvent, id: string) => { e.preventDefault(); dragOver.current = id; };
  const onDrop      = (toId: string) => {
    const from = draggingId;
    if (!from || from === toId) return;
    setOrder((prev) => {
      const next = [...prev];
      const fi = next.indexOf(from); const ti = next.indexOf(toId);
      next.splice(fi, 1); next.splice(ti, 0, from);
      return next;
    });
    setOrderDirty(true);
  };
  const onDragEnd = () => { setDraggingId(null); dragOver.current = null; };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} /></div>;

  const allSectionIds = currentSections.map(s => s.id);
  const fullOrder = [...order.filter(id => allSectionIds.includes(id)), ...allSectionIds.filter(id => !order.includes(id))];
  const ordered = fullOrder.map((id) => currentSections.find((s) => s.id === id)).filter(Boolean) as Sect[];

  const totalDirty = dirty.size + (orderDirty ? 1 : 0);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); * { font-family: 'Open Sans', sans-serif !important; }`}</style>
      <div className="space-y-5 pb-10">

        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Content bearbeiten</h1>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">
              Hier kannst du die Seiteninhalte anpassen und steuern.
              {hidden.size > 0 && <span className="ml-2 font-semibold text-amber-600">· {hidden.size} ausgeblendet</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && totalDirty === 0 && <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle className="h-4 w-4" />{savedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} gespeichert</span>}
            {totalDirty > 0 && <span className="flex items-center gap-1.5 text-sm text-amber-600"><AlertCircle className="h-4 w-4" />{totalDirty} ungespeichert</span>}
            <button onClick={handleSave} disabled={saving || totalDirty === 0}
              className="flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: brand }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Speichern...' : 'Speichern & live schalten'}
            </button>
          </div>
        </div>

        {/* Page selector dropdown */}
        <div ref={pageDropdownRef} className="relative w-full max-w-xs">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">Seite auswählen</p>
          <button
            type="button"
            onClick={() => setPageDropdownOpen(v => !v)}
            className="flex h-11 w-full items-center justify-between rounded-[4px] border border-neutral-200 bg-white px-4 text-sm font-semibold text-[#2F2F2F] shadow-sm transition hover:border-[#884A4A]"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#6B6B6B]" />
              {PAGE_OPTIONS.find(p => p.value === selectedPage)?.label}
            </div>
            <ChevronDown className={`h-4 w-4 text-[#6B6B6B] transition-transform ${pageDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {pageDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-lg">
              {PAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSelectedPage(opt.value); setPageDropdownOpen(false); }}
                  className={`flex w-full items-center gap-2 px-4 py-3 text-sm font-medium transition hover:bg-[#FDF8F8] ${selectedPage === opt.value ? 'bg-[#FDF8F8] font-semibold text-[#884A4A]' : 'text-[#2F2F2F]'}`}
                >
                  <FileText className={`h-4 w-4 ${selectedPage === opt.value ? 'text-[#884A4A]' : 'text-[#6B6B6B]'}`} />
                  {opt.label}
                  {selectedPage === opt.value && <CheckCircle className="ml-auto h-3.5 w-3.5 text-[#884A4A]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
            <button className="ml-auto underline" onClick={() => setError('')}>OK</button>
          </div>
        )}

        {/* Section list */}
        <div className="space-y-1.5">
          {ordered.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              content={content}
              dirty={dirty}
              isHidden={hidden.has(section.id)}
              onChange={handleChange}
              onUpload={handleUpload}
              onToggleHide={() => toggleHide(section.id)}
              isDragging={draggingId === section.id}
              onDragStart={() => onDragStart(section.id)}
              onDragOver={(e) => onDragOver(e, section.id)}
              onDrop={() => onDrop(section.id)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>

        {/* Sticky save */}
        {totalDirty > 0 && (
          <div className="sticky bottom-4 flex justify-end">
            <div className="flex items-center gap-3 rounded-[4px] border border-amber-200 bg-white px-4 py-3 shadow-lg">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-[#4A4A4A]">{totalDirty} ungespeichert</span>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-[4px] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
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
