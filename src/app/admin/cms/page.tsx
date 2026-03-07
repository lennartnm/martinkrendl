'use client';
// src/app/admin/cms/page.tsx

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Upload, Eye,
  EyeOff, ChevronDown, ChevronRight,
  Palette, Image as ImageIcon, Video, Link as LinkIcon, Type, GripVertical, FileText, Layout,
} from 'lucide-react';

const brand = '#884A4A';
type CM = Record<string, string>;
const mk = (s: string, f: string) => `${s}::${f}`;
type FT = 'text' | 'textarea' | 'color' | 'image' | 'video' | 'link';

type Field = { section_key: string; field_key: string; label: string; type: FT; hint?: string };
type Sect  = { id: string; label: string; fields: Field[] };

const HOME_SECTIONS: Sect[] = [
  { id: 'header', label: 'Header & Navigation', fields: [
    { section_key: 'header', field_key: 'logo_text', label: 'Logo Text', type: 'text' },
    { section_key: 'header', field_key: 'cta_label', label: 'CTA Button Text', type: 'text' },
    { section_key: 'links',  field_key: 'header_cta', label: 'CTA Button Link', type: 'link', hint: '#quiz oder https://...' },
    { section_key: 'colors', field_key: 'header_bg', label: 'Hintergrundfarbe', type: 'color' },
  ]},
  { id: 'hero', label: 'Hero Bereich', fields: [
    { section_key: 'hero', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'hero', field_key: 'subtitle', label: 'Unterzeile', type: 'textarea' },
    { section_key: 'hero', field_key: 'cta_label', label: 'CTA Button Text', type: 'text' },
    { section_key: 'hero', field_key: 'social_proof', label: 'Social Proof', type: 'text' },
    { section_key: 'links', field_key: 'hero_cta', label: 'CTA Button Link', type: 'link', hint: '#quiz oder https://...' },
    { section_key: 'images', field_key: 'hero', label: 'Hero Bild', type: 'image', hint: 'Empfohlen: 1920×800px' },
  ]},
  { id: 'logos', label: 'Logo Sektion', fields: [
    { section_key: 'logos_section', field_key: 'label', label: 'Label Text', type: 'text' },
    { section_key: 'images', field_key: 'logo1', label: 'Logo 1', type: 'image' },
    { section_key: 'images', field_key: 'logo2', label: 'Logo 2', type: 'image' },
  ]},
  { id: 'feature_cards_3', label: 'Feature Cards (3er)', fields: [
    { section_key: 'feature_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
    { section_key: 'feature_card_1', field_key: 'text', label: 'Karte 1 – Text', type: 'textarea' },
    { section_key: 'feature_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
    { section_key: 'feature_card_2', field_key: 'text', label: 'Karte 2 – Text', type: 'textarea' },
    { section_key: 'feature_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
    { section_key: 'feature_card_3', field_key: 'text', label: 'Karte 3 – Text', type: 'textarea' },
    { section_key: 'colors', field_key: 'brand', label: 'Kartenfarbe', type: 'color' },
  ]},
  { id: 'image_text_1', label: 'Bild + Text – Sektion 1', fields: [
    { section_key: 'image_text_1', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'image_text_1', field_key: 'text', label: 'Fließtext', type: 'textarea' },
    { section_key: 'image_text_1', field_key: 'bullet_1', label: 'Bullet 1', type: 'text' },
    { section_key: 'image_text_1', field_key: 'bullet_2', label: 'Bullet 2', type: 'text' },
    { section_key: 'image_text_1', field_key: 'bullet_3', label: 'Bullet 3', type: 'text' },
    { section_key: 'image_text_1', field_key: 'cta_label', label: 'CTA Button Text', type: 'text' },
    { section_key: 'links', field_key: 'image_text_1_cta', label: 'CTA Button Link', type: 'link' },
    { section_key: 'images', field_key: 'section1', label: 'Bild', type: 'image', hint: 'Empfohlen: 800×800px' },
  ]},
  { id: 'quote', label: 'Zitat', fields: [
    { section_key: 'quote_section', field_key: 'label', label: 'Label', type: 'text' },
    { section_key: 'quote_section', field_key: 'quote', label: 'Zitat', type: 'textarea' },
    { section_key: 'images', field_key: 'quote_bg', label: 'Hintergrundbild', type: 'image' },
  ]},
  { id: 'video_carousel', label: 'Video Carousel', fields: [
    { section_key: 'video_section', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'video_section', field_key: 'text', label: 'Beschreibung', type: 'textarea' },
    { section_key: 'videos', field_key: 'carousel_1_src', label: 'Video 1', type: 'video' },
    { section_key: 'videos', field_key: 'carousel_1_thumb', label: 'Video 1 Vorschau', type: 'image' },
    { section_key: 'videos', field_key: 'carousel_2_src', label: 'Video 2', type: 'video' },
    { section_key: 'videos', field_key: 'carousel_2_thumb', label: 'Video 2 Vorschau', type: 'image' },
    { section_key: 'videos', field_key: 'carousel_3_src', label: 'Video 3', type: 'video' },
    { section_key: 'videos', field_key: 'carousel_3_thumb', label: 'Video 3 Vorschau', type: 'image' },
  ]},
  { id: 'image_text_2', label: 'Bild + Text – Sektion 2', fields: [
    { section_key: 'image_text_2', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'image_text_2', field_key: 'text', label: 'Fließtext', type: 'textarea' },
    { section_key: 'image_text_2', field_key: 'cta_label', label: 'CTA Button Text', type: 'text' },
    { section_key: 'links', field_key: 'image_text_2_cta', label: 'CTA Button Link', type: 'link' },
    { section_key: 'images', field_key: 'section2', label: 'Bild', type: 'image' },
  ]},
  { id: 'feature_cards_4', label: 'Feature Cards (4er)', fields: [
    { section_key: 'features_2_heading', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'features_2_heading', field_key: 'text', label: 'Unterzeile', type: 'textarea' },
    { section_key: 'feature2_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
    { section_key: 'feature2_card_1', field_key: 'text', label: 'Karte 1 – Text', type: 'textarea' },
    { section_key: 'feature2_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
    { section_key: 'feature2_card_2', field_key: 'text', label: 'Karte 2 – Text', type: 'textarea' },
    { section_key: 'feature2_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
    { section_key: 'feature2_card_3', field_key: 'text', label: 'Karte 3 – Text', type: 'textarea' },
    { section_key: 'feature2_card_4', field_key: 'title', label: 'Karte 4 – Titel', type: 'text' },
    { section_key: 'feature2_card_4', field_key: 'text', label: 'Karte 4 – Text', type: 'textarea' },
    { section_key: 'links', field_key: 'features_2_cta', label: 'CTA Button Link', type: 'link' },
  ]},
  { id: 'flowing_text', label: 'Fließtext', fields: [
    { section_key: 'flowing_text', field_key: 'text', label: 'Text', type: 'textarea' },
  ]},
  { id: 'testimonials', label: 'Video Testimonials', fields: [
    { section_key: 'testimonial_1', field_key: 'label', label: 'Testimonial 1 – Label', type: 'text' },
    { section_key: 'testimonial_1', field_key: 'quote', label: 'Testimonial 1 – Zitat', type: 'textarea' },
    { section_key: 'testimonial_1', field_key: 'author', label: 'Testimonial 1 – Autor', type: 'text' },
    { section_key: 'videos', field_key: 'testimonial_1_src', label: 'Testimonial 1 – Video', type: 'video' },
    { section_key: 'videos', field_key: 'testimonial_1_thumb', label: 'Testimonial 1 – Vorschau', type: 'image' },
    { section_key: 'testimonial_2', field_key: 'label', label: 'Testimonial 2 – Label', type: 'text' },
    { section_key: 'testimonial_2', field_key: 'quote', label: 'Testimonial 2 – Zitat', type: 'textarea' },
    { section_key: 'testimonial_2', field_key: 'author', label: 'Testimonial 2 – Autor', type: 'text' },
    { section_key: 'videos', field_key: 'testimonial_2_src', label: 'Testimonial 2 – Video', type: 'video' },
    { section_key: 'videos', field_key: 'testimonial_2_thumb', label: 'Testimonial 2 – Vorschau', type: 'image' },
  ]},
  { id: 'about', label: 'Über Martin', fields: [
    { section_key: 'about', field_key: 'label', label: 'Label', type: 'text' },
    { section_key: 'about', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'about', field_key: 'text_1', label: 'Absatz 1', type: 'textarea' },
    { section_key: 'about', field_key: 'text_2', label: 'Absatz 2', type: 'textarea' },
    { section_key: 'about', field_key: 'text_3', label: 'Absatz 3', type: 'textarea' },
    { section_key: 'images', field_key: 'about', label: 'Portrait', type: 'image' },
  ]},
  { id: 'reviews', label: 'Bewertungen', fields: [
    { section_key: 'reviews', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'review_1', field_key: 'text', label: 'Review 1 – Text', type: 'textarea' },
    { section_key: 'review_1', field_key: 'author', label: 'Review 1 – Autor', type: 'text' },
    { section_key: 'review_2', field_key: 'text', label: 'Review 2 – Text', type: 'textarea' },
    { section_key: 'review_2', field_key: 'author', label: 'Review 2 – Autor', type: 'text' },
    { section_key: 'review_3', field_key: 'text', label: 'Review 3 – Text', type: 'textarea' },
    { section_key: 'review_3', field_key: 'author', label: 'Review 3 – Autor', type: 'text' },
  ]},
  { id: 'final_cta', label: 'Abschluss CTA', fields: [
    { section_key: 'final_cta', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'final_cta', field_key: 'text', label: 'Text', type: 'textarea' },
    { section_key: 'final_cta', field_key: 'cta_label', label: 'CTA Button Text', type: 'text' },
    { section_key: 'links', field_key: 'final_cta', label: 'CTA Button Link', type: 'link' },
    { section_key: 'images', field_key: 'final_cta', label: 'Bild', type: 'image' },
  ]},
  { id: 'global_colors', label: 'Globale Farben', fields: [
    { section_key: 'colors', field_key: 'brand', label: 'Brand-Farbe (Hauptfarbe)', type: 'color', hint: 'Wird für Buttons, Icons und Akzente verwendet.' },
    { section_key: 'colors', field_key: 'graphite', label: 'Textfarbe dunkel', type: 'color' },
    { section_key: 'colors', field_key: 'dark_gray', label: 'Textfarbe mittel', type: 'color' },
    { section_key: 'colors', field_key: 'light_gray', label: 'Textfarbe hell', type: 'color' },
    { section_key: 'colors', field_key: 'quiz_bg', label: 'Quiz Hintergrund', type: 'color' },
  ]},
];

const DANKE_SECTIONS: Sect[] = [
  { id: 'danke_header', label: 'Danke-Seite Header', fields: [
    { section_key: 'danke_header', field_key: 'logo_text', label: 'Logo Text', type: 'text' },
  ]},
  { id: 'danke_hero', label: 'Danke-Seite Inhalt', fields: [
    { section_key: 'danke_hero', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'danke_hero', field_key: 'subtitle', label: 'Unterzeile', type: 'textarea' },
    { section_key: 'danke_hero', field_key: 'cta_label', label: 'Button Text', type: 'text' },
    { section_key: 'danke_hero', field_key: 'cta_link', label: 'Button Link', type: 'link' },
  ]},
];

const FOOTER_SECTIONS: Sect[] = [
  { id: 'footer_brand', label: 'Footer – Marke & Text', fields: [
    { section_key: 'footer', field_key: 'logo_text', label: 'Logo Text', type: 'text' },
    { section_key: 'footer', field_key: 'tagline', label: 'Tagline / Kurzbeschreibung', type: 'textarea' },
    { section_key: 'footer', field_key: 'copyright', label: 'Copyright-Text', type: 'text', hint: 'z.B. © 2025 Martin Krendl' },
  ]},
  { id: 'footer_contact', label: 'Footer – Kontakt & Links', fields: [
    { section_key: 'footer', field_key: 'email', label: 'E-Mail Adresse', type: 'text' },
    { section_key: 'footer', field_key: 'phone', label: 'Telefonnummer', type: 'text' },
    { section_key: 'footer', field_key: 'address', label: 'Adresse', type: 'text' },
    { section_key: 'footer', field_key: 'impressum_link', label: 'Impressum-Link', type: 'link' },
    { section_key: 'footer', field_key: 'datenschutz_link', label: 'Datenschutz-Link', type: 'link' },
  ]},
  { id: 'footer_social', label: 'Footer – Social Media', fields: [
    { section_key: 'footer', field_key: 'instagram_url', label: 'Instagram URL', type: 'link' },
    { section_key: 'footer', field_key: 'facebook_url', label: 'Facebook URL', type: 'link' },
    { section_key: 'footer', field_key: 'youtube_url', label: 'YouTube URL', type: 'link' },
    { section_key: 'footer', field_key: 'tiktok_url', label: 'TikTok URL', type: 'link' },
  ]},
  { id: 'footer_colors', label: 'Footer – Farben', fields: [
    { section_key: 'footer', field_key: 'bg_color', label: 'Hintergrundfarbe', type: 'color' },
    { section_key: 'footer', field_key: 'text_color', label: 'Textfarbe', type: 'color' },
    { section_key: 'footer', field_key: 'link_color', label: 'Link-Farbe', type: 'color' },
  ]},
];

const QUIZ_SECTIONS: Sect[] = [
  { id: 'quiz_header', label: 'Quiz – Überschrift & Intro', fields: [
    { section_key: 'quiz_section', field_key: 'title', label: 'Überschrift', type: 'text' },
    { section_key: 'quiz_section', field_key: 'subtitle', label: 'Unterzeile', type: 'text' },
    { section_key: 'colors', field_key: 'quiz_bg', label: 'Hintergrundfarbe', type: 'color' },
  ]},
  { id: 'quiz_q1', label: 'Quiz – Frage 1 (Bereitschaft)', fields: [
    { section_key: 'quiz_q1', field_key: 'question', label: 'Fragetext', type: 'text' },
    { section_key: 'quiz_q1', field_key: 'option_1', label: 'Antwort 1 – Text', type: 'text' },
    { section_key: 'quiz_q1', field_key: 'option_2', label: 'Antwort 2 – Text', type: 'text' },
    { section_key: 'quiz_q1', field_key: 'img_1', label: 'Antwort 1 – Bild', type: 'image' },
    { section_key: 'quiz_q1', field_key: 'img_2', label: 'Antwort 2 – Bild', type: 'image' },
  ]},
  { id: 'quiz_q2', label: 'Quiz – Frage 2 (Erfahrung)', fields: [
    { section_key: 'quiz_q2', field_key: 'question', label: 'Fragetext', type: 'text' },
    { section_key: 'quiz_q2', field_key: 'option_1', label: 'Antwort 1 – Text', type: 'text' },
    { section_key: 'quiz_q2', field_key: 'option_2', label: 'Antwort 2 – Text', type: 'text' },
    { section_key: 'quiz_q2', field_key: 'option_3', label: 'Antwort 3 – Text', type: 'text' },
    { section_key: 'quiz_q2', field_key: 'option_4', label: 'Antwort 4 – Text', type: 'text' },
    { section_key: 'quiz_q2', field_key: 'img_1', label: 'Antwort 1 – Bild', type: 'image' },
    { section_key: 'quiz_q2', field_key: 'img_2', label: 'Antwort 2 – Bild', type: 'image' },
    { section_key: 'quiz_q2', field_key: 'img_3', label: 'Antwort 3 – Bild', type: 'image' },
    { section_key: 'quiz_q2', field_key: 'img_4', label: 'Antwort 4 – Bild', type: 'image' },
  ]},
  { id: 'quiz_q3', label: 'Quiz – Frage 3 (Unterrichtstyp)', fields: [
    { section_key: 'quiz_q3', field_key: 'question', label: 'Fragetext', type: 'text' },
    { section_key: 'quiz_q3', field_key: 'option_1', label: 'Antwort 1 – Text (Vor-Ort)', type: 'text' },
    { section_key: 'quiz_q3', field_key: 'option_2', label: 'Antwort 2 – Text (Online)', type: 'text' },
  ]},
  { id: 'quiz_form', label: 'Quiz – Kontaktformular', fields: [
    { section_key: 'quiz_form', field_key: 'title', label: 'Formular-Überschrift', type: 'text' },
    { section_key: 'quiz_form', field_key: 'name_label', label: 'Name – Placeholder', type: 'text' },
    { section_key: 'quiz_form', field_key: 'email_label', label: 'E-Mail – Placeholder', type: 'text' },
    { section_key: 'quiz_form', field_key: 'phone_label', label: 'Telefon – Placeholder', type: 'text' },
    { section_key: 'quiz_form', field_key: 'submit_label', label: 'Absenden-Button Text', type: 'text' },
    { section_key: 'quiz_form', field_key: 'privacy_text', label: 'Datenschutz-Hinweis', type: 'textarea' },
  ]},
  { id: 'quiz_colors', label: 'Quiz – Farben & Stil', fields: [
    { section_key: 'colors', field_key: 'brand', label: 'Akzentfarbe (Buttons, Balken)', type: 'color' },
    { section_key: 'colors', field_key: 'quiz_bg', label: 'Hintergrundfarbe', type: 'color' },
  ]},
];

const COOKIEBANNER_SECTIONS: Sect[] = [
  { id: 'cookie_texts', label: 'Cookie Banner – Texte', fields: [
    { section_key: 'cookie', field_key: 'message', label: 'Haupttext', type: 'textarea' },
    { section_key: 'cookie', field_key: 'accept_label', label: 'Akzeptieren-Button', type: 'text' },
    { section_key: 'cookie', field_key: 'decline_label', label: 'Ablehnen-Button', type: 'text' },
    { section_key: 'cookie', field_key: 'essential_label', label: 'Nur essenziell-Button', type: 'text' },
    { section_key: 'cookie', field_key: 'privacy_link', label: 'Datenschutz-Link', type: 'link' },
    { section_key: 'cookie', field_key: 'privacy_label', label: 'Datenschutz-Linktext', type: 'text' },
  ]},
  { id: 'cookie_colors', label: 'Cookie Banner – Farben', fields: [
    { section_key: 'cookie', field_key: 'bg_color', label: 'Hintergrundfarbe Banner', type: 'color' },
    { section_key: 'cookie', field_key: 'text_color', label: 'Textfarbe', type: 'color' },
    { section_key: 'cookie', field_key: 'accept_bg', label: 'Akzeptieren-Button Farbe', type: 'color' },
    { section_key: 'cookie', field_key: 'border_color', label: 'Rahmenfarbe', type: 'color' },
  ]},
];

type Mode = 'page' | 'component';

const PAGE_OPTIONS   = [
  { value: 'home',  label: 'Startseite',  icon: '🏠' },
  { value: 'danke', label: 'Danke-Seite', icon: '✅' },
];
const COMPONENT_OPTIONS = [
  { value: 'footer',       label: 'Footer',       icon: '📄' },
  { value: 'quiz',         label: 'Quiz',          icon: '🎯' },
  { value: 'cookiebanner', label: 'Cookie Banner', icon: '🍪' },
];

const SECTIONS_BY_KEY: Record<string, Sect[]> = {
  home: HOME_SECTIONS, danke: DANKE_SECTIONS,
  footer: FOOTER_SECTIONS, quiz: QUIZ_SECTIONS, cookiebanner: COOKIEBANNER_SECTIONS,
};
const DEFAULT_ORDER_BY_KEY: Record<string, string[]> = Object.fromEntries(
  Object.entries(SECTIONS_BY_KEY).map(([k, v]) => [k, v.map(s => s.id)])
);
const API_PAGE_FOR_KEY: Record<string, string> = {
  home: 'home', danke: 'danke',
  footer: 'component_footer', quiz: 'component_quiz', cookiebanner: 'component_cookie',
};

// ── Field Components ──────────────────────────────────────────────────────────
function DirtyBadge() {
  return <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">geändert</span>;
}

function ColorField({ label, hint, value, isDirty, onChange }: { label: string; hint?: string; value: string; isDirty: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2"><Palette className="h-3.5 w-3.5 text-[#6B6B6B]" /><span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>{isDirty && <DirtyBadge />}</div>
      {hint && <p className="pl-5 text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="flex items-center gap-3 pl-5">
        <input type="color" value={value || '#884A4A'} onChange={(e) => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-[4px] border border-neutral-200 p-0.5" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#884A4A" maxLength={9} className="h-10 w-32 rounded-[4px] border px-3 font-mono text-sm outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
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
      <div className="flex items-center gap-2">{isVid ? <Video className="h-3.5 w-3.5 text-[#6B6B6B]" /> : <ImageIcon className="h-3.5 w-3.5 text-[#6B6B6B]" />}<span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>{isDirty && <DirtyBadge />}</div>
      {hint && <p className="pl-5 text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="flex gap-3 pl-5">
        {value && (isVid ? <div className="h-16 w-28 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200 bg-black"><video src={value} className="h-full w-full object-contain" preload="metadata" /></div> : <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200 bg-neutral-50"><img src={value} alt="" className="h-full w-full object-cover" /></div>)}
        <div className="flex flex-1 flex-col gap-1.5">
          <div onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onClick={() => !uploading && ref.current?.click()} className={`flex cursor-pointer items-center gap-2 rounded-[4px] border-2 border-dashed px-3 py-2 text-sm transition ${drag ? 'border-[#884A4A] bg-[#FDF8F8]' : 'border-neutral-200 hover:border-[#884A4A]'} ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[#884A4A]" /> : <Upload className="h-4 w-4 text-[#6B6B6B]" />}
            <span className="text-[#4A4A4A]">{uploading ? 'Hochladen...' : isVid ? 'Video hochladen' : 'Bild hochladen'}</span>
            <span className="ml-auto text-xs text-[#6B6B6B]">max 50MB</span>
          </div>
          <input ref={ref} type="file" accept={isVid ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp'} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={isVid ? '/video.mp4 oder https://...' : '/bild.jpg oder https://...'} className="h-8 w-full rounded-[4px] border px-3 text-xs outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}

function TextField({ label, hint, type, value, isDirty, onChange }: { label: string; hint?: string; type: 'text' | 'textarea' | 'link'; value: string; isDirty: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">{type === 'link' ? <LinkIcon className="h-3.5 w-3.5 text-[#6B6B6B]" /> : <Type className="h-3.5 w-3.5 text-[#6B6B6B]" />}<span className="text-sm font-semibold text-[#2F2F2F]">{label}</span>{type === 'link' && <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Link</span>}{isDirty && <DirtyBadge />}</div>
      {hint && <p className="pl-5 text-xs text-[#6B6B6B]">{hint}</p>}
      <div className="pl-5">
        {type === 'textarea' ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full resize-y rounded-[4px] border px-3 py-2 text-sm outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} /> : type === 'link' ? <div className="flex gap-2"><input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#quiz oder https://..." className="h-10 flex-1 rounded-[4px] border px-3 font-mono text-sm outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />{value && <a href={value} target={value.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] hover:bg-neutral-50"><Eye className="h-4 w-4" /></a>}</div> : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-[4px] border px-3 text-sm outline-none transition focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />}
      </div>
    </div>
  );
}

function SectionRow({ section, content, dirty, isHidden, onChange, onUpload, onToggleHide, isDragging, onDragStart, onDragOver, onDrop, onDragEnd }: { section: Sect; content: CM; dirty: Set<string>; isHidden: boolean; onChange: (sk: string, fk: string, v: string) => void; onUpload: (f: File, folder: string) => Promise<string>; onToggleHide: () => void; isDragging: boolean; onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: () => void; onDragEnd: () => void }) {
  const [open, setOpen] = useState(false);
  const dirtyCount = section.fields.filter((f) => dirty.has(mk(f.section_key, f.field_key))).length;
  const textFields = section.fields.filter((f) => f.type === 'text' || f.type === 'textarea');
  const linkFields = section.fields.filter((f) => f.type === 'link');
  const colorFields = section.fields.filter((f) => f.type === 'color');
  const mediaFields = section.fields.filter((f) => f.type === 'image' || f.type === 'video');
  const render = (f: Field) => {
    const k = mk(f.section_key, f.field_key); const v = content[k] ?? ''; const id = dirty.has(k); const ch = (val: string) => onChange(f.section_key, f.field_key, val);
    if (f.type === 'color') return <ColorField key={k} label={f.label} hint={f.hint} value={v} isDirty={id} onChange={ch} />;
    if (f.type === 'image' || f.type === 'video') return <MediaField key={k} label={f.label} hint={f.hint} type={f.type} value={v} isDirty={id} onChange={ch} onUpload={(file) => onUpload(file, f.type === 'video' ? 'videos' : 'images')} />;
    return <TextField key={k} label={f.label} hint={f.hint} type={f.type as 'text' | 'textarea' | 'link'} value={v} isDirty={id} onChange={ch} />;
  };
  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} className={`overflow-hidden rounded-[4px] border bg-white transition-all ${isDragging ? 'opacity-40 scale-[0.99]' : ''} ${isHidden ? 'border-neutral-200 opacity-60' : 'border-neutral-200'}`}>
      <div className="flex items-center gap-2 px-3 py-3">
        <div className="cursor-grab touch-none text-neutral-300 hover:text-neutral-500 active:cursor-grabbing"><GripVertical className="h-5 w-5" /></div>
        <button type="button" onClick={() => !isHidden && setOpen((v) => !v)} className="flex flex-1 items-center gap-2 text-left min-w-0">
          {open && !isHidden ? <ChevronDown className="h-4 w-4 shrink-0 text-[#6B6B6B]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[#6B6B6B]" />}
          <span className={`truncate text-sm font-bold ${isHidden ? 'text-[#6B6B6B] line-through' : 'text-[#2F2F2F]'}`}>{section.label}</span>
          {dirtyCount > 0 && !isHidden && <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">{dirtyCount}</span>}
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {colorFields.length > 0 && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><Palette className="h-2.5 w-2.5" /> {colorFields.length}</span>}
          {mediaFields.length > 0 && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><ImageIcon className="h-2.5 w-2.5" /> {mediaFields.length}</span>}
          {linkFields.length > 0 && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><LinkIcon className="h-2.5 w-2.5" /> {linkFields.length}</span>}
          {textFields.length > 0 && <span className="flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-[#6B6B6B]"><Type className="h-2.5 w-2.5" /> {textFields.length}</span>}
        </div>
        <button type="button" onClick={onToggleHide} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] transition hover:bg-neutral-50" title={isHidden ? 'Sektion anzeigen' : 'Sektion ausblenden'}>
          {isHidden ? <EyeOff className="h-4 w-4 text-amber-500" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {open && !isHidden && (
        <div className="border-t border-neutral-100 px-5 py-5 space-y-6">
          {textFields.length > 0 && <div><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Texte</p><div className="grid gap-4 md:grid-cols-2">{textFields.map((f) => <div key={mk(f.section_key, f.field_key)} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>{render(f)}</div>)}</div></div>}
          {linkFields.length > 0 && <div><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Button Links</p><div className="grid gap-4 md:grid-cols-2">{linkFields.map((f) => <div key={mk(f.section_key, f.field_key)}>{render(f)}</div>)}</div></div>}
          {colorFields.length > 0 && <div><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Farben</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{colorFields.map((f) => render(f))}</div></div>}
          {mediaFields.length > 0 && <div><p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Bilder & Videos</p><div className="grid gap-5 md:grid-cols-2">{mediaFields.map((f) => render(f))}</div></div>}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CmsPage() {
  const [mode, setMode] = useState<Mode>('page');
  const [selectedKey, setSelectedKey] = useState('home');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<CM>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<string[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const dragOver = useRef<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentSections = SECTIONS_BY_KEY[selectedKey] || [];
  const apiPage = API_PAGE_FOR_KEY[selectedKey] || selectedKey;

  useEffect(() => {
    setLoading(true); setDirty(new Set()); setOrderDirty(false);
    fetch(`/api/admin/content?page=${apiPage}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error);
        const map: CM = {};
        for (const e of json.data) map[mk(e.section_key, e.field_key)] = e.value;
        setContent(map);
        const savedOrder = map['layout::section_order'];
        const savedHidden = map['layout::hidden_sections'];
        setOrder(savedOrder ? savedOrder.split(',').map((s: string) => s.trim()).filter(Boolean) : DEFAULT_ORDER_BY_KEY[selectedKey] || currentSections.map(s => s.id));
        setHidden(savedHidden ? new Set(savedHidden.split(',').map((s: string) => s.trim()).filter(Boolean)) : new Set());
      })
      .catch((e) => setError('Laden: ' + e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const handleChange = useCallback((sk: string, fk: string, v: string) => {
    const k = mk(sk, fk); setContent((p) => ({ ...p, [k]: v })); setDirty((p) => new Set(p).add(k));
  }, []);

  const handleUpload = useCallback(async (file: File, folder: string): Promise<string> => {
    const fd = new FormData(); fd.append('file', file); fd.append('folder', folder);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await res.json();
    if (!json.ok) throw new Error(json.detail || json.error);
    return json.url;
  }, []);

  const handleSave = async () => {
    if (dirty.size === 0 && !orderDirty) return;
    setSaving(true); setError('');
    const updatesFromDirty = Array.from(dirty).map((k) => { const [sk, fk] = k.split('::'); return { section_key: sk, field_key: fk, value: content[k] ?? '' }; });
    const layoutUpdates = orderDirty ? [{ section_key: 'layout', field_key: 'section_order', value: order.join(',') }, { section_key: 'layout', field_key: 'hidden_sections', value: Array.from(hidden).join(',') }] : [];
    const updates = [...updatesFromDirty, ...layoutUpdates];
    if (updates.length === 0) { setSaving(false); return; }
    try {
      const res = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: apiPage, updates }) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setDirty(new Set()); setSavedAt(new Date()); setOrderDirty(false);
    } catch (e: any) { setError('Speichern: ' + e.message); }
    finally { setSaving(false); }
  };

  const toggleHide = (id: string) => { setHidden((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); setOrderDirty(true); };
  const onDragStart = (id: string) => setDraggingId(id);
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); dragOver.current = id; };
  const onDrop = (toId: string) => {
    const from = draggingId; if (!from || from === toId) return;
    setOrder((prev) => { const next = [...prev]; const fi = next.indexOf(from); const ti = next.indexOf(toId); next.splice(fi, 1); next.splice(ti, 0, from); return next; });
    setOrderDirty(true);
  };
  const onDragEnd = () => { setDraggingId(null); dragOver.current = null; };

  const selectOption = (newMode: Mode, key: string) => { setMode(newMode); setSelectedKey(key); setDropdownOpen(false); };

  const currentLabel = mode === 'page' ? (PAGE_OPTIONS.find(p => p.value === selectedKey)?.label ?? selectedKey) : (COMPONENT_OPTIONS.find(c => c.value === selectedKey)?.label ?? selectedKey);
  const currentIcon  = mode === 'page' ? (PAGE_OPTIONS.find(p => p.value === selectedKey)?.icon ?? '📄') : (COMPONENT_OPTIONS.find(c => c.value === selectedKey)?.icon ?? '🧩');

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} /></div>;

  const allSectionIds = currentSections.map(s => s.id);
  const fullOrder = [...order.filter(id => allSectionIds.includes(id)), ...allSectionIds.filter(id => !order.includes(id))];
  const ordered = fullOrder.map((id) => currentSections.find((s) => s.id === id)).filter(Boolean) as Sect[];
  const totalDirty = dirty.size + (orderDirty ? 1 : 0);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); * { font-family: 'Open Sans', sans-serif !important; }`}</style>
      <div className="space-y-5 pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Content bearbeiten</h1>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Seiteninhalte und Komponenten anpassen.{hidden.size > 0 && <span className="ml-2 font-semibold text-amber-600">· {hidden.size} ausgeblendet</span>}</p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && totalDirty === 0 && <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle className="h-4 w-4" />{savedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} gespeichert</span>}
            {totalDirty > 0 && <span className="flex items-center gap-1.5 text-sm text-amber-600"><AlertCircle className="h-4 w-4" />{totalDirty} ungespeichert</span>}
            <button onClick={handleSave} disabled={saving || totalDirty === 0} className="flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40" style={{ backgroundColor: brand }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Speichern...' : 'Speichern & live schalten'}
            </button>
          </div>
        </div>

        {/* Two-level dropdown */}
        <div ref={dropdownRef} className="relative w-full max-w-xs">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">Bearbeiten</p>
          <button type="button" onClick={() => setDropdownOpen(v => !v)} className="flex h-11 w-full items-center justify-between rounded-[4px] border border-neutral-200 bg-white px-4 text-sm font-semibold text-[#2F2F2F] shadow-sm transition hover:border-[#884A4A]">
            <div className="flex items-center gap-2">
              <span>{currentIcon}</span>
              <span>{currentLabel}</span>
              <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${mode === 'page' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{mode === 'page' ? 'Seite' : 'Komponente'}</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-[#6B6B6B] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-lg">
              {/* Seiten */}
              <div className="px-3 pt-2.5 pb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                <FileText className="h-3 w-3" />Seite bearbeiten
              </div>
              {PAGE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => selectOption('page', opt.value)} className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition hover:bg-[#FDF8F8] ${mode === 'page' && selectedKey === opt.value ? 'bg-[#FDF8F8] font-semibold text-[#884A4A]' : 'text-[#2F2F2F]'}`}>
                  <span>{opt.icon}</span>{opt.label}{mode === 'page' && selectedKey === opt.value && <CheckCircle className="ml-auto h-3.5 w-3.5 text-[#884A4A]" />}
                </button>
              ))}

              <div className="my-1 border-t border-neutral-100" />

              {/* Komponenten */}
              <div className="px-3 pt-1.5 pb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                <Layout className="h-3 w-3" />Komponente bearbeiten
              </div>
              {COMPONENT_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => selectOption('component', opt.value)} className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition hover:bg-[#FDF8F8] ${mode === 'component' && selectedKey === opt.value ? 'bg-[#FDF8F8] font-semibold text-[#884A4A]' : 'text-[#2F2F2F]'}`}>
                  <span>{opt.icon}</span>{opt.label}{mode === 'component' && selectedKey === opt.value && <CheckCircle className="ml-auto h-3.5 w-3.5 text-[#884A4A]" />}
                </button>
              ))}
              <div className="h-1.5" />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}<button className="ml-auto underline" onClick={() => setError('')}>OK</button>
          </div>
        )}

        {/* Sections */}
        <div className="space-y-1.5">
          {ordered.map((section) => (
            <SectionRow key={section.id} section={section} content={content} dirty={dirty} isHidden={hidden.has(section.id)} onChange={handleChange} onUpload={handleUpload} onToggleHide={() => toggleHide(section.id)} isDragging={draggingId === section.id} onDragStart={() => onDragStart(section.id)} onDragOver={(e) => onDragOver(e, section.id)} onDrop={() => onDrop(section.id)} onDragEnd={onDragEnd} />
          ))}
        </div>

        {totalDirty > 0 && (
          <div className="sticky bottom-4 flex justify-end">
            <div className="flex items-center gap-3 rounded-[4px] border border-amber-200 bg-white px-4 py-3 shadow-lg">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-[#4A4A4A]">{totalDirty} ungespeichert</span>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-[4px] px-4 py-2 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: brand }}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Jetzt speichern
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
