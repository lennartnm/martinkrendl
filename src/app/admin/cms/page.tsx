'use client';
// src/app/admin/cms/page.tsx — Dynamisches CMS mit Seiten & Sektions-Management

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Save, CheckCircle, AlertCircle, Loader2, Upload, Eye, EyeOff,
  ChevronDown, ChevronRight, Palette, Image as ImageIcon, Video,
  Link as LinkIcon, Type, GripVertical, FileText, Plus, Trash2,
  Globe, X, ArrowRight, Copy,
} from 'lucide-react';

const brand = '#884A4A';
type CM = Record<string, string>;
type FT = 'text' | 'textarea' | 'color' | 'image' | 'video' | 'link';
type Field = { section_key: string; field_key: string; label: string; type: FT; hint?: string };
type SectInstance = { id: string; page_id: string; section_instance: string; section_type: string; label: string; sort_order: number; hidden: boolean };
type CmsPage = { id: string; label: string; path: string; is_system: boolean };

// ─────────────────────────────────────────────────────────────────────────────
// Sektionstyp-Bibliothek
// section_key "__INST__" wird zur Laufzeit durch section_instance ersetzt,
// "__INST__1" durch section_instance + "_1" etc.
// Typen ohne _legacy können neu angelegt werden.
// ─────────────────────────────────────────────────────────────────────────────
const SECT_TYPES: { type: string; label: string; addable: boolean; fields: Field[] }[] = [
  { type: 'hero', label: 'Hero', addable: true, fields: [
    { section_key: '__INST__', field_key: 'title',        label: 'Überschrift',     type: 'text' },
    { section_key: '__INST__', field_key: 'subtitle',     label: 'Unterzeile',      type: 'textarea' },
    { section_key: '__INST__', field_key: 'cta_label',    label: 'Button Text',     type: 'text' },
    { section_key: '__INST__', field_key: 'cta_link',     label: 'Button Link',     type: 'link' },
    { section_key: '__INST__', field_key: 'social_proof', label: 'Social Proof',    type: 'text' },
    { section_key: '__INST__', field_key: 'image',        label: 'Hintergrundbild', type: 'image', hint: 'Empfohlen: 1920×800px' },
  ]},
  { type: 'image_text', label: 'Bild + Text', addable: true, fields: [
    { section_key: '__INST__', field_key: 'title',     label: 'Überschrift', type: 'text' },
    { section_key: '__INST__', field_key: 'text',      label: 'Text',        type: 'textarea' },
    { section_key: '__INST__', field_key: 'bullet_1',  label: 'Punkt 1',     type: 'text' },
    { section_key: '__INST__', field_key: 'bullet_2',  label: 'Punkt 2',     type: 'text' },
    { section_key: '__INST__', field_key: 'bullet_3',  label: 'Punkt 3',     type: 'text' },
    { section_key: '__INST__', field_key: 'cta_label', label: 'Button Text', type: 'text' },
    { section_key: '__INST__', field_key: 'cta_link',  label: 'Button Link', type: 'link' },
    { section_key: '__INST__', field_key: 'image',     label: 'Bild',        type: 'image', hint: '800×800px' },
  ]},
  { type: 'quote', label: 'Zitat', addable: true, fields: [
    { section_key: '__INST__', field_key: 'label', label: 'Label',           type: 'text' },
    { section_key: '__INST__', field_key: 'quote', label: 'Zitat',           type: 'textarea' },
    { section_key: '__INST__', field_key: 'bg',    label: 'Hintergrundbild', type: 'image' },
  ]},
  { type: 'flowing_text', label: 'Fließtext', addable: true, fields: [
    { section_key: '__INST__', field_key: 'text', label: 'Text', type: 'textarea' },
  ]},
  { type: 'final_cta', label: 'Abschluss CTA', addable: true, fields: [
    { section_key: '__INST__', field_key: 'title',     label: 'Überschrift', type: 'text' },
    { section_key: '__INST__', field_key: 'text',      label: 'Text',        type: 'textarea' },
    { section_key: '__INST__', field_key: 'cta_label', label: 'Button Text', type: 'text' },
    { section_key: '__INST__', field_key: 'cta_link',  label: 'Button Link', type: 'link' },
    { section_key: '__INST__', field_key: 'image',     label: 'Bild',        type: 'image' },
  ]},
  { type: 'logos', label: 'Logo-Leiste', addable: true, fields: [
    { section_key: '__INST__', field_key: 'label',  label: 'Label',  type: 'text' },
    { section_key: '__INST__', field_key: 'logo_1', label: 'Logo 1', type: 'image' },
    { section_key: '__INST__', field_key: 'logo_2', label: 'Logo 2', type: 'image' },
    { section_key: '__INST__', field_key: 'logo_3', label: 'Logo 3', type: 'image' },
  ]},
  { type: 'feature_cards_3', label: 'Karten (3er)', addable: true, fields: [
    { section_key: '__INST__1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
    { section_key: '__INST__1', field_key: 'text',  label: 'Karte 1 – Text',  type: 'textarea' },
    { section_key: '__INST__2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
    { section_key: '__INST__2', field_key: 'text',  label: 'Karte 2 – Text',  type: 'textarea' },
    { section_key: '__INST__3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
    { section_key: '__INST__3', field_key: 'text',  label: 'Karte 3 – Text',  type: 'textarea' },
    { section_key: 'colors',    field_key: 'brand', label: 'Kartenfarbe',     type: 'color' },
  ]},
  { type: 'feature_cards_4', label: 'Karten (4er)', addable: true, fields: [
    { section_key: '__INST__h', field_key: 'title', label: 'Überschrift',      type: 'text' },
    { section_key: '__INST__h', field_key: 'text',  label: 'Unterzeile',       type: 'textarea' },
    { section_key: '__INST__1', field_key: 'title', label: 'Karte 1 – Titel',  type: 'text' },
    { section_key: '__INST__1', field_key: 'text',  label: 'Karte 1 – Text',   type: 'textarea' },
    { section_key: '__INST__2', field_key: 'title', label: 'Karte 2 – Titel',  type: 'text' },
    { section_key: '__INST__2', field_key: 'text',  label: 'Karte 2 – Text',   type: 'textarea' },
    { section_key: '__INST__3', field_key: 'title', label: 'Karte 3 – Titel',  type: 'text' },
    { section_key: '__INST__3', field_key: 'text',  label: 'Karte 3 – Text',   type: 'textarea' },
    { section_key: '__INST__4', field_key: 'title', label: 'Karte 4 – Titel',  type: 'text' },
    { section_key: '__INST__4', field_key: 'text',  label: 'Karte 4 – Text',   type: 'textarea' },
    { section_key: 'links',     field_key: 'features_cta', label: 'Button Link', type: 'link' },
  ]},
  { type: 'video_carousel', label: 'Video-Karussell', addable: true, fields: [
    { section_key: '__INST__', field_key: 'title',  label: 'Überschrift', type: 'text' },
    { section_key: '__INST__', field_key: 'text',   label: 'Text',        type: 'textarea' },
    { section_key: '__INST__', field_key: 'vid1',   label: 'Video 1',     type: 'video' },
    { section_key: '__INST__', field_key: 'thumb1', label: 'Vorschau 1',  type: 'image' },
    { section_key: '__INST__', field_key: 'vid2',   label: 'Video 2',     type: 'video' },
    { section_key: '__INST__', field_key: 'thumb2', label: 'Vorschau 2',  type: 'image' },
    { section_key: '__INST__', field_key: 'vid3',   label: 'Video 3',     type: 'video' },
    { section_key: '__INST__', field_key: 'thumb3', label: 'Vorschau 3',  type: 'image' },
  ]},
  { type: 'testimonials', label: 'Video-Testimonials', addable: true, fields: [
    { section_key: '__INST__1', field_key: 'label',  label: 'T1 – Label',    type: 'text' },
    { section_key: '__INST__1', field_key: 'quote',  label: 'T1 – Zitat',    type: 'textarea' },
    { section_key: '__INST__1', field_key: 'author', label: 'T1 – Autor',    type: 'text' },
    { section_key: '__INST__1', field_key: 'vid',    label: 'T1 – Video',    type: 'video' },
    { section_key: '__INST__1', field_key: 'thumb',  label: 'T1 – Vorschau', type: 'image' },
    { section_key: '__INST__2', field_key: 'label',  label: 'T2 – Label',    type: 'text' },
    { section_key: '__INST__2', field_key: 'quote',  label: 'T2 – Zitat',    type: 'textarea' },
    { section_key: '__INST__2', field_key: 'author', label: 'T2 – Autor',    type: 'text' },
    { section_key: '__INST__2', field_key: 'vid',    label: 'T2 – Video',    type: 'video' },
    { section_key: '__INST__2', field_key: 'thumb',  label: 'T2 – Vorschau', type: 'image' },
  ]},
  { type: 'about', label: 'Über mich', addable: true, fields: [
    { section_key: '__INST__', field_key: 'label',  label: 'Label',       type: 'text' },
    { section_key: '__INST__', field_key: 'title',  label: 'Überschrift', type: 'text' },
    { section_key: '__INST__', field_key: 'text_1', label: 'Absatz 1',    type: 'textarea' },
    { section_key: '__INST__', field_key: 'text_2', label: 'Absatz 2',    type: 'textarea' },
    { section_key: '__INST__', field_key: 'text_3', label: 'Absatz 3',    type: 'textarea' },
    { section_key: '__INST__', field_key: 'image',  label: 'Portrait',    type: 'image' },
  ]},
  { type: 'reviews', label: 'Bewertungen', addable: true, fields: [
    { section_key: '__INST__',  field_key: 'title',  label: 'Überschrift',         type: 'text' },
    { section_key: '__INST__1', field_key: 'text',   label: 'Bewertung 1',         type: 'textarea' },
    { section_key: '__INST__1', field_key: 'author', label: 'Bewertung 1 – Autor', type: 'text' },
    { section_key: '__INST__2', field_key: 'text',   label: 'Bewertung 2',         type: 'textarea' },
    { section_key: '__INST__2', field_key: 'author', label: 'Bewertung 2 – Autor', type: 'text' },
    { section_key: '__INST__3', field_key: 'text',   label: 'Bewertung 3',         type: 'textarea' },
    { section_key: '__INST__3', field_key: 'author', label: 'Bewertung 3 – Autor', type: 'text' },
  ]},
  { type: 'quiz',          label: 'Quiz',               addable: true, fields: [] },
  { type: 'global_colors', label: 'Globale Farben',     addable: true, fields: [
    { section_key: 'colors', field_key: 'brand',      label: 'Brand-Farbe',      type: 'color' },
    { section_key: 'colors', field_key: 'graphite',   label: 'Textfarbe dunkel', type: 'color' },
    { section_key: 'colors', field_key: 'dark_gray',  label: 'Textfarbe mittel', type: 'color' },
    { section_key: 'colors', field_key: 'light_gray', label: 'Textfarbe hell',   type: 'color' },
    { section_key: 'colors', field_key: 'quiz_bg',    label: 'Quiz-Hintergrund', type: 'color' },
  ]},
  { type: 'header', label: 'Header & Navigation', addable: false, fields: [
    { section_key: 'header', field_key: 'logo_text',  label: 'Logo Text',        type: 'text' },
    { section_key: 'header', field_key: 'cta_label',  label: 'Button Text',      type: 'text' },
    { section_key: 'links',  field_key: 'header_cta', label: 'Button Link',      type: 'link' },
    { section_key: 'colors', field_key: 'header_bg',  label: 'Hintergrundfarbe', type: 'color' },
  ]},
  // Legacy: bestehende home-Sektionen mit festen section_keys
  { type: 'logos_legacy', label: 'Logo-Leiste', addable: false, fields: [
    { section_key: 'logos_section', field_key: 'label', label: 'Label',  type: 'text' },
    { section_key: 'images',        field_key: 'logo1', label: 'Logo 1', type: 'image' },
    { section_key: 'images',        field_key: 'logo2', label: 'Logo 2', type: 'image' },
  ]},
  { type: 'image_text_1', label: 'Bild + Text', addable: false, fields: [
    { section_key: 'image_text_1', field_key: 'title',     label: 'Überschrift', type: 'text' },
    { section_key: 'image_text_1', field_key: 'text',      label: 'Text',        type: 'textarea' },
    { section_key: 'image_text_1', field_key: 'bullet_1',  label: 'Punkt 1',     type: 'text' },
    { section_key: 'image_text_1', field_key: 'bullet_2',  label: 'Punkt 2',     type: 'text' },
    { section_key: 'image_text_1', field_key: 'bullet_3',  label: 'Punkt 3',     type: 'text' },
    { section_key: 'image_text_1', field_key: 'cta_label', label: 'Button Text', type: 'text' },
    { section_key: 'links',        field_key: 'image_text_1_cta', label: 'Button Link', type: 'link' },
    { section_key: 'images',       field_key: 'section1',  label: 'Bild',        type: 'image' },
  ]},
  { type: 'image_text_2', label: 'Bild + Text', addable: false, fields: [
    { section_key: 'image_text_2', field_key: 'title',     label: 'Überschrift', type: 'text' },
    { section_key: 'image_text_2', field_key: 'text',      label: 'Text',        type: 'textarea' },
    { section_key: 'image_text_2', field_key: 'cta_label', label: 'Button Text', type: 'text' },
    { section_key: 'links',        field_key: 'image_text_2_cta', label: 'Button Link', type: 'link' },
    { section_key: 'images',       field_key: 'section2',  label: 'Bild',        type: 'image' },
  ]},
  { type: 'quote_legacy', label: 'Zitat', addable: false, fields: [
    { section_key: 'quote_section', field_key: 'label',    label: 'Label',           type: 'text' },
    { section_key: 'quote_section', field_key: 'quote',    label: 'Zitat',           type: 'textarea' },
    { section_key: 'images',        field_key: 'quote_bg', label: 'Hintergrundbild', type: 'image' },
  ]},
  { type: 'video_carousel_legacy', label: 'Video-Karussell', addable: false, fields: [
    { section_key: 'video_section', field_key: 'title',            label: 'Überschrift', type: 'text' },
    { section_key: 'video_section', field_key: 'text',             label: 'Text',        type: 'textarea' },
    { section_key: 'videos',        field_key: 'carousel_1_src',   label: 'Video 1',     type: 'video' },
    { section_key: 'videos',        field_key: 'carousel_1_thumb', label: 'Vorschau 1',  type: 'image' },
    { section_key: 'videos',        field_key: 'carousel_2_src',   label: 'Video 2',     type: 'video' },
    { section_key: 'videos',        field_key: 'carousel_2_thumb', label: 'Vorschau 2',  type: 'image' },
    { section_key: 'videos',        field_key: 'carousel_3_src',   label: 'Video 3',     type: 'video' },
    { section_key: 'videos',        field_key: 'carousel_3_thumb', label: 'Vorschau 3',  type: 'image' },
  ]},
  { type: 'feature_cards_3_legacy', label: 'Karten (3er)', addable: false, fields: [
    { section_key: 'feature_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
    { section_key: 'feature_card_1', field_key: 'text',  label: 'Karte 1 – Text',  type: 'textarea' },
    { section_key: 'feature_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
    { section_key: 'feature_card_2', field_key: 'text',  label: 'Karte 2 – Text',  type: 'textarea' },
    { section_key: 'feature_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
    { section_key: 'feature_card_3', field_key: 'text',  label: 'Karte 3 – Text',  type: 'textarea' },
    { section_key: 'colors',         field_key: 'brand', label: 'Kartenfarbe',     type: 'color' },
  ]},
  { type: 'feature_cards_4_legacy', label: 'Karten (4er)', addable: false, fields: [
    { section_key: 'features_2_heading', field_key: 'title',  label: 'Überschrift',     type: 'text' },
    { section_key: 'features_2_heading', field_key: 'text',   label: 'Unterzeile',      type: 'textarea' },
    { section_key: 'feature2_card_1',    field_key: 'title',  label: 'Karte 1 – Titel', type: 'text' },
    { section_key: 'feature2_card_1',    field_key: 'text',   label: 'Karte 1 – Text',  type: 'textarea' },
    { section_key: 'feature2_card_2',    field_key: 'title',  label: 'Karte 2 – Titel', type: 'text' },
    { section_key: 'feature2_card_2',    field_key: 'text',   label: 'Karte 2 – Text',  type: 'textarea' },
    { section_key: 'feature2_card_3',    field_key: 'title',  label: 'Karte 3 – Titel', type: 'text' },
    { section_key: 'feature2_card_3',    field_key: 'text',   label: 'Karte 3 – Text',  type: 'textarea' },
    { section_key: 'feature2_card_4',    field_key: 'title',  label: 'Karte 4 – Titel', type: 'text' },
    { section_key: 'feature2_card_4',    field_key: 'text',   label: 'Karte 4 – Text',  type: 'textarea' },
    { section_key: 'links',              field_key: 'features_2_cta', label: 'Button Link', type: 'link' },
  ]},
  { type: 'flowing_text_legacy', label: 'Fließtext', addable: false, fields: [
    { section_key: 'flowing_text', field_key: 'text', label: 'Text', type: 'textarea' },
  ]},
  { type: 'testimonials_legacy', label: 'Video-Testimonials', addable: false, fields: [
    { section_key: 'testimonial_1', field_key: 'label',              label: 'T1 – Label',    type: 'text' },
    { section_key: 'testimonial_1', field_key: 'quote',              label: 'T1 – Zitat',    type: 'textarea' },
    { section_key: 'testimonial_1', field_key: 'author',             label: 'T1 – Autor',    type: 'text' },
    { section_key: 'videos',        field_key: 'testimonial_1_src',  label: 'T1 – Video',    type: 'video' },
    { section_key: 'videos',        field_key: 'testimonial_1_thumb',label: 'T1 – Vorschau', type: 'image' },
    { section_key: 'testimonial_2', field_key: 'label',              label: 'T2 – Label',    type: 'text' },
    { section_key: 'testimonial_2', field_key: 'quote',              label: 'T2 – Zitat',    type: 'textarea' },
    { section_key: 'testimonial_2', field_key: 'author',             label: 'T2 – Autor',    type: 'text' },
    { section_key: 'videos',        field_key: 'testimonial_2_src',  label: 'T2 – Video',    type: 'video' },
    { section_key: 'videos',        field_key: 'testimonial_2_thumb',label: 'T2 – Vorschau', type: 'image' },
  ]},
  { type: 'about_legacy', label: 'Über mich', addable: false, fields: [
    { section_key: 'about',  field_key: 'label',  label: 'Label',       type: 'text' },
    { section_key: 'about',  field_key: 'title',  label: 'Überschrift', type: 'text' },
    { section_key: 'about',  field_key: 'text_1', label: 'Absatz 1',    type: 'textarea' },
    { section_key: 'about',  field_key: 'text_2', label: 'Absatz 2',    type: 'textarea' },
    { section_key: 'about',  field_key: 'text_3', label: 'Absatz 3',    type: 'textarea' },
    { section_key: 'images', field_key: 'about',  label: 'Portrait',    type: 'image' },
  ]},
  { type: 'reviews_legacy', label: 'Bewertungen', addable: false, fields: [
    { section_key: 'reviews',  field_key: 'title',  label: 'Überschrift',         type: 'text' },
    { section_key: 'review_1', field_key: 'text',   label: 'Bewertung 1',         type: 'textarea' },
    { section_key: 'review_1', field_key: 'author', label: 'Bewertung 1 – Autor', type: 'text' },
    { section_key: 'review_2', field_key: 'text',   label: 'Bewertung 2',         type: 'textarea' },
    { section_key: 'review_2', field_key: 'author', label: 'Bewertung 2 – Autor', type: 'text' },
    { section_key: 'review_3', field_key: 'text',   label: 'Bewertung 3',         type: 'textarea' },
    { section_key: 'review_3', field_key: 'author', label: 'Bewertung 3 – Autor', type: 'text' },
  ]},
  { type: 'final_cta_legacy', label: 'Abschluss CTA', addable: false, fields: [
    { section_key: 'final_cta', field_key: 'title',     label: 'Überschrift', type: 'text' },
    { section_key: 'final_cta', field_key: 'text',      label: 'Text',        type: 'textarea' },
    { section_key: 'final_cta', field_key: 'cta_label', label: 'Button Text', type: 'text' },
    { section_key: 'links',     field_key: 'final_cta', label: 'Button Link', type: 'link' },
    { section_key: 'images',    field_key: 'final_cta', label: 'Bild',        type: 'image' },
  ]},
  // Danke-Seite
  { type: 'danke_header', label: 'Header', addable: false, fields: [
    { section_key: 'danke_header', field_key: 'logo_text', label: 'Logo Text', type: 'text' },
  ]},
  { type: 'danke_hero', label: 'Inhalt', addable: false, fields: [
    { section_key: 'danke_hero', field_key: 'title',     label: 'Überschrift', type: 'text' },
    { section_key: 'danke_hero', field_key: 'subtitle',  label: 'Text',        type: 'textarea' },
    { section_key: 'danke_hero', field_key: 'cta_label', label: 'Button Text', type: 'text' },
    { section_key: 'danke_hero', field_key: 'cta_link',  label: 'Button Link', type: 'link' },
  ]},
];

const SECT_MAP = Object.fromEntries(SECT_TYPES.map(s => [s.type, s]));

// Löst __INST__ in einem section_key auf
function resolveKey(field: Field, instance: string): string {
  const sk = field.section_key.replace(/__INST__/g, instance);
  return `${sk}::${field.field_key}`;
}

// ── Shared UI Components ──────────────────────────────────────────────────────
function DirtyBadge() {
  return <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">geändert</span>;
}

function ColorField({ label, hint, value, isDirty, onChange }: { label: string; hint?: string; value: string; isDirty: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2"><Palette className="h-3.5 w-3.5 text-neutral-400" /><span className="text-sm font-semibold text-neutral-800">{label}</span>{isDirty && <DirtyBadge />}</div>
      {hint && <p className="pl-5 text-xs text-neutral-400">{hint}</p>}
      <div className="flex items-center gap-3 pl-5">
        <input type="color" value={value || '#884A4A'} onChange={e => onChange(e.target.value)} className="h-10 w-14 cursor-pointer rounded-[4px] border border-neutral-200 p-0.5" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="#884A4A" maxLength={9} className="h-10 w-32 rounded-[4px] border px-3 font-mono text-sm outline-none focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
        <div className="h-10 w-10 shrink-0 rounded-[4px] border border-neutral-200" style={{ backgroundColor: value || '#884A4A' }} />
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
      <div className="flex items-center gap-2">{isVid ? <Video className="h-3.5 w-3.5 text-neutral-400" /> : <ImageIcon className="h-3.5 w-3.5 text-neutral-400" />}<span className="text-sm font-semibold text-neutral-800">{label}</span>{isDirty && <DirtyBadge />}</div>
      {hint && <p className="pl-5 text-xs text-neutral-400">{hint}</p>}
      <div className="flex gap-3 pl-5">
        {value && (isVid
          ? <div className="h-16 w-28 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200 bg-black"><video src={value} className="h-full w-full object-contain" preload="metadata" /></div>
          : <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[4px] border border-neutral-200"><img src={value} alt="" className="h-full w-full object-cover" /></div>
        )}
        <div className="flex flex-1 flex-col gap-1.5">
          <div onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onClick={() => !uploading && ref.current?.click()}
            className={`flex cursor-pointer items-center gap-2 rounded-[4px] border-2 border-dashed px-3 py-2 text-sm transition ${drag ? 'border-[#884A4A] bg-[#FDF8F8]' : 'border-neutral-200 hover:border-[#884A4A]'} ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin text-[#884A4A]" /> : <Upload className="h-4 w-4 text-neutral-400" />}
            <span className="text-neutral-600">{uploading ? 'Hochladen...' : isVid ? 'Video hochladen' : 'Bild hochladen'}</span>
            <span className="ml-auto text-xs text-neutral-400">max 50MB</span>
          </div>
          <input ref={ref} type="file" accept={isVid ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={isVid ? '/video.mp4 oder https://...' : '/bild.jpg oder https://...'} className="h-8 w-full rounded-[4px] border px-3 text-xs outline-none focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
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
        {type === 'link' ? <LinkIcon className="h-3.5 w-3.5 text-neutral-400" /> : <Type className="h-3.5 w-3.5 text-neutral-400" />}
        <span className="text-sm font-semibold text-neutral-800">{label}</span>
        {type === 'link' && <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">Link</span>}
        {isDirty && <DirtyBadge />}
      </div>
      {hint && <p className="pl-5 text-xs text-neutral-400">{hint}</p>}
      <div className="pl-5">
        {type === 'textarea'
          ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="w-full resize-y rounded-[4px] border px-3 py-2 text-sm outline-none focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
          : type === 'link'
            ? <div className="flex gap-2">
                <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="#quiz oder https://..." className="h-10 flex-1 rounded-[4px] border px-3 font-mono text-sm outline-none focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
                {value && <a href={value} target={value.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] border border-neutral-200 text-neutral-400 hover:bg-neutral-50"><Eye className="h-4 w-4" /></a>}
              </div>
            : <input type="text" value={value} onChange={e => onChange(e.target.value)} className="h-10 w-full rounded-[4px] border px-3 text-sm outline-none focus:border-[#884A4A]" style={{ borderColor: isDirty ? '#F59E0B' : '#E5E7EB' }} />
        }
      </div>
    </div>
  );
}

// ── SectionRow ────────────────────────────────────────────────────────────────
function SectionRow({ section, content, dirty, onChange, onUpload, onToggleHide, isDragging, onDragStart, onDragOver, onDrop, onDragEnd, onDuplicate, onDelete }: {
  section: SectInstance; content: CM; dirty: Set<string>;
  onChange: (key: string, val: string) => void;
  onUpload: (file: File) => Promise<string>;
  onToggleHide: () => void;
  isDragging: boolean;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: () => void; onDragEnd: () => void;
  onDuplicate: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const def = SECT_MAP[section.section_type];
  const fields = def?.fields ?? [];
  const hasDirty = fields.some(f => dirty.has(resolveKey(f, section.section_instance)));

  return (
    <div draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd}
      className={`rounded-[4px] border transition ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${section.hidden ? 'border-dashed border-neutral-200 bg-neutral-50/50' : 'border-neutral-200 bg-white'}`}>
      {/* Row Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-neutral-300 hover:text-neutral-400" />
        <button type="button" onClick={() => setOpen(v => !v)} className="flex flex-1 items-center gap-2 text-left min-w-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />}
          <span className={`truncate text-sm font-semibold ${section.hidden ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>{section.label}</span>
          {hasDirty && <DirtyBadge />}
          {fields.length === 0 && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400">keine Felder</span>}
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={onDuplicate} title="Duplizieren"
            className="flex h-7 w-7 items-center justify-center rounded text-neutral-300 transition hover:bg-neutral-100 hover:text-[#884A4A]">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={onToggleHide} title={section.hidden ? 'Einblenden' : 'Ausblenden'}
            className="flex h-7 w-7 items-center justify-center rounded text-neutral-300 transition hover:bg-neutral-100 hover:text-[#884A4A]">
            {section.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={onDelete} title="Löschen"
            className="flex h-7 w-7 items-center justify-center rounded text-neutral-300 transition hover:bg-red-50 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Fields */}
      {open && fields.length > 0 && (
        <div className="border-t border-neutral-100 px-6 py-5 space-y-5">
          {fields.map(rawField => {
            const key = resolveKey(rawField, section.section_instance);
            const val = content[key] ?? '';
            const isDirty = dirty.has(key);
            if (rawField.type === 'color') return <ColorField key={key} label={rawField.label} hint={rawField.hint} value={val} isDirty={isDirty} onChange={v => onChange(key, v)} />;
            if (rawField.type === 'image' || rawField.type === 'video') return <MediaField key={key} label={rawField.label} hint={rawField.hint} type={rawField.type} value={val} isDirty={isDirty} onChange={v => onChange(key, v)} onUpload={onUpload} />;
            return <TextField key={key} label={rawField.label} hint={rawField.hint} type={rawField.type} value={val} isDirty={isDirty} onChange={v => onChange(key, v)} />;
          })}
        </div>
      )}
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div ref={ref} className="w-full max-w-md rounded-[4px] border border-neutral-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-neutral-800">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddSectionDialog({ onAdd, onClose }: { onAdd: (type: string, label: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState('');
  const addable = SECT_TYPES.filter(s => s.addable);
  return (
    <Modal title="Sektion hinzufügen" onClose={onClose}>
      <div className="max-h-72 overflow-y-auto space-y-1 mb-4">
        {addable.map(t => (
          <button key={t.type} type="button" onClick={() => setSelected(t.type)}
            className={`flex w-full items-center justify-between rounded-[4px] px-3 py-2.5 text-sm text-left transition hover:bg-[#FDF8F8] ${selected === t.type ? 'bg-[#FDF8F8] font-semibold text-[#884A4A]' : 'text-neutral-800'}`}>
            <span>{t.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400">{t.fields.length} Felder</span>
              {selected === t.type && <CheckCircle className="h-4 w-4 text-[#884A4A]" />}
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => { if (selected) { onAdd(selected, SECT_MAP[selected]?.label || selected); onClose(); } }}
        disabled={!selected} className="w-full h-10 rounded-[4px] text-sm font-semibold text-white disabled:opacity-40" style={{ backgroundColor: brand }}>
        Sektion hinzufügen
      </button>
    </Modal>
  );
}

function NewPageDialog({ pages, onAdd, onClose }: { pages: CmsPage[]; onAdd: (label: string, path: string, sourceId?: string) => void; onClose: () => void }) {
  const [label, setLabel] = useState('');
  const [path, setPath]   = useState('/');
  const [src, setSrc]     = useState('');
  return (
    <Modal title="Neue Seite anlegen" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-500">NAME DER SEITE</label>
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="z.B. Landingpage Herbst"
            className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 text-sm outline-none focus:border-[#884A4A]" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-500">URL-PFAD</label>
          <input value={path} onChange={e => setPath(e.target.value)} placeholder="/landingpage-herbst"
            className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 font-mono text-sm outline-none focus:border-[#884A4A]" />
          <p className="mt-1 text-xs text-neutral-400">Damit die Seite live geht muss in Next.js eine Route dafür angelegt werden.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-500">SEKTIONEN KOPIEREN VON (optional)</label>
          <select value={src} onChange={e => setSrc(e.target.value)}
            className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 text-sm outline-none focus:border-[#884A4A]">
            <option value="">— Leere Seite starten —</option>
            {pages.map(p => <option key={p.id} value={p.id}>{p.label}  ({p.path})</option>)}
          </select>
          {src && <p className="mt-1 text-xs text-neutral-500">Alle Sektionen und Inhalte werden kopiert.</p>}
        </div>
      </div>
      <button onClick={() => { if (label && path) { onAdd(label, path, src || undefined); onClose(); } }}
        disabled={!label || !path} className="mt-4 w-full h-10 rounded-[4px] text-sm font-semibold text-white disabled:opacity-40" style={{ backgroundColor: brand }}>
        {src ? 'Seite duplizieren & anlegen' : 'Neue Seite anlegen'}
      </button>
    </Modal>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CmsPage() {
  const [pages, setPages]               = useState<CmsPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [sections, setSections]         = useState<SectInstance[]>([]);
  const [content, setContent]           = useState<CM>({});
  const [dirty, setDirty]               = useState<Set<string>>(new Set());
  const [saving, setSaving]             = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [savedAt, setSavedAt]           = useState<Date | null>(null);
  const [pageDropOpen, setPageDropOpen] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showNewPage, setShowNewPage]       = useState(false);
  const draggingId  = useRef<string | null>(null);
  const pageDropRef = useRef<HTMLDivElement>(null);

  // Close page dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (pageDropRef.current && !pageDropRef.current.contains(e.target as Node)) setPageDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Load pages on mount
  useEffect(() => {
    fetch('/api/admin/pages').then(r => r.json()).then(j => {
      if (j.ok && j.data?.length) { setPages(j.data); setSelectedPage(j.data[0]); }
    }).catch(() => {});
  }, []);

  // Load sections + content when page changes
  const loadPage = useCallback(async (page: CmsPage) => {
    setLoading(true); setError(''); setDirty(new Set());
    try {
      const [sR, cR] = await Promise.all([
        fetch(`/api/admin/sections?page_id=${page.id}`).then(r => r.json()),
        fetch(`/api/admin/content?page=${page.id}`).then(r => r.json()),
      ]);
      setSections(sR.ok ? sR.data || [] : []);
      if (cR.ok) {
        const map: CM = {};
        for (const e of (cR.data || [])) map[`${e.section_key}::${e.field_key}`] = e.value;
        setContent(map);
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (selectedPage) loadPage(selectedPage); }, [selectedPage, loadPage]);

  const handleChange = (key: string, val: string) => {
    setContent(prev => ({ ...prev, [key]: val }));
    setDirty(prev => new Set([...prev, key]));
  };

  const handleUpload = async (file: File): Promise<string> => {
    const form = new FormData(); form.append('file', file);
    const res  = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error);
    return json.url;
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true); setError('');
    try {
      // 1. Inhalte speichern
      const contentKeys = Array.from(dirty).filter(k => !k.startsWith('__'));
      if (contentKeys.length) {
        const updates = contentKeys.map(key => {
          const [section_key, field_key] = key.split('::');
          return { section_key, field_key, value: content[key] ?? '' };
        });
        const res = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: selectedPage.id, updates }) });
        if (!(await res.json()).ok) throw new Error('Content-Fehler');
      }
      // 2. Reihenfolge + Sichtbarkeit
      await fetch('/api/admin/sections', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page_id: selectedPage.id, updates: sections.map((s, i) => ({ id: s.id, sort_order: i, hidden: s.hidden })) }) });
      setDirty(new Set()); setSavedAt(new Date());
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const toggleHide = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, hidden: !s.hidden } : s));
    setDirty(prev => new Set([...prev, '__order__']));
  };

  // Drag & Drop
  const onDragStart = (id: string) => { draggingId.current = id; };
  const onDragOver  = (e: React.DragEvent) => e.preventDefault();
  const onDrop      = (toId: string) => {
    const from = draggingId.current; if (!from || from === toId) return;
    setSections(prev => {
      const next = [...prev];
      const fi = next.findIndex(s => s.id === from), ti = next.findIndex(s => s.id === toId);
      const [item] = next.splice(fi, 1); next.splice(ti, 0, item);
      return next;
    });
    setDirty(prev => new Set([...prev, '__order__']));
  };
  const onDragEnd = () => { draggingId.current = null; };

  const duplicateSection = async (s: SectInstance) => {
    if (!selectedPage) return;
    const res  = await fetch('/api/admin/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page_id: selectedPage.id, section_type: s.section_type, label: s.label, source_instance: s.section_instance }) });
    const json = await res.json();
    if (json.ok) setSections(prev => [...prev, json.data]);
  };

  const deleteSection = async (s: SectInstance) => {
    if (!confirm(`Sektion "${s.label}" wirklich löschen?`)) return;
    await fetch('/api/admin/sections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, page_id: selectedPage?.id, section_instance: s.section_instance }) });
    setSections(prev => prev.filter(x => x.id !== s.id));
  };

  const addSection = async (type: string, label: string) => {
    if (!selectedPage) return;
    const res  = await fetch('/api/admin/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page_id: selectedPage.id, section_type: type, label }) });
    const json = await res.json();
    if (json.ok) setSections(prev => [...prev, json.data]);
  };

  const createPage = async (label: string, path: string, sourceId?: string) => {
    const res  = await fetch('/api/admin/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, path, source_page: sourceId }) });
    const json = await res.json();
    if (json.ok) { setPages(prev => [...prev, json.data]); setSelectedPage(json.data); }
  };

  const deletePage = async (page: CmsPage) => {
    if (page.is_system) return;
    if (!confirm(`Seite "${page.label}" löschen? Alle Inhalte gehen verloren.`)) return;
    await fetch('/api/admin/pages', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: page.id }) });
    setPages(prev => { const next = prev.filter(p => p.id !== page.id); setSelectedPage(next[0] || null); return next; });
  };

  const totalDirty = dirty.size;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); *{font-family:'Open Sans',sans-serif!important}`}</style>
      {showAddSection && <AddSectionDialog onAdd={addSection} onClose={() => setShowAddSection(false)} />}
      {showNewPage    && <NewPageDialog pages={pages} onAdd={createPage} onClose={() => setShowNewPage(false)} />}

      <div className="space-y-5 pb-10">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-800">Content bearbeiten</h1>
            <p className="mt-0.5 text-sm text-neutral-400">Seiten und Sektionen verwalten, Inhalte live schalten.</p>
          </div>
          <div className="flex items-center gap-3">
            {savedAt && totalDirty === 0 && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                <CheckCircle className="h-4 w-4" />{savedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })} gespeichert
              </span>
            )}
            {totalDirty > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />{totalDirty} ungespeichert
              </span>
            )}
            <button onClick={handleSave} disabled={saving || totalDirty === 0}
              className="flex items-center gap-2 rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: brand }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Speichern...' : 'Speichern & live'}
            </button>
          </div>
        </div>

        {/* ── Page Picker ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div ref={pageDropRef} className="relative">
            <button type="button" onClick={() => setPageDropOpen(v => !v)}
              className="flex h-10 items-center gap-2 rounded-[4px] border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-[#884A4A]">
              <Globe className="h-4 w-4 text-neutral-400" />
              <span>{selectedPage?.label ?? 'Seite wählen'}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-400 font-normal">{selectedPage?.path}</span>
              <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${pageDropOpen ? 'rotate-180' : ''}`} />
            </button>

            {pageDropOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[260px] overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-lg">
                {pages.map(p => (
                  <div key={p.id} onClick={() => { setSelectedPage(p); setPageDropOpen(false); }}
                    className={`group flex cursor-pointer items-center gap-2 px-4 py-2.5 transition hover:bg-[#FDF8F8] ${selectedPage?.id === p.id ? 'bg-[#FDF8F8]' : ''}`}>
                    <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                    <span className={`flex-1 text-sm ${selectedPage?.id === p.id ? 'font-semibold text-[#884A4A]' : 'font-medium text-neutral-700'}`}>{p.label}</span>
                    <span className="font-mono text-xs text-neutral-400">{p.path}</span>
                    {!p.is_system && (
                      <button type="button" onClick={e => { e.stopPropagation(); deletePage(p); }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                    {selectedPage?.id === p.id && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[#884A4A]" />}
                  </div>
                ))}
                <div className="border-t border-neutral-100" />
                <button type="button" onClick={() => { setPageDropOpen(false); setShowNewPage(true); }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#884A4A] transition hover:bg-[#FDF8F8]">
                  <Plus className="h-4 w-4" /> Neue Seite anlegen
                </button>
              </div>
            )}
          </div>

          {selectedPage && (
            <a href={selectedPage.path} target="_blank" rel="noopener noreferrer"
              className="flex h-10 items-center gap-1.5 rounded-[4px] border border-neutral-200 px-3 text-sm text-neutral-500 transition hover:bg-neutral-50">
              <Eye className="h-4 w-4" /> Live ansehen <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            <button className="ml-auto underline" onClick={() => setError('')}>OK</button>
          </div>
        )}

        {/* ── Sections ── */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map(section => (
              <SectionRow key={section.id} section={section} content={content} dirty={dirty}
                onChange={handleChange} onUpload={handleUpload} onToggleHide={() => toggleHide(section.id)}
                isDragging={draggingId.current === section.id}
                onDragStart={() => onDragStart(section.id)} onDragOver={onDragOver}
                onDrop={() => onDrop(section.id)} onDragEnd={onDragEnd}
                onDuplicate={() => duplicateSection(section)} onDelete={() => deleteSection(section)} />
            ))}
            <button type="button" onClick={() => setShowAddSection(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[4px] border-2 border-dashed border-neutral-200 py-4 text-sm font-medium text-neutral-400 transition hover:border-[#884A4A] hover:text-[#884A4A]">
              <Plus className="h-4 w-4" /> Sektion hinzufügen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
