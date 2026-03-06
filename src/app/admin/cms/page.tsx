'use client';

// src/app/admin/cms/page.tsx
// Vollständiger CMS-Editor für alle Sektionen der Landingpage

import { useEffect, useState, useCallback } from 'react';

const brand = '#884A4A';

// Alle editierbaren Sektionen, gruppiert nach Bereich
const SECTIONS = [
  {
    group: 'Header & Navigation',
    items: [
      { section_key: 'header', field_key: 'logo_text', label: 'Logo Text', type: 'text' },
      { section_key: 'header', field_key: 'cta_label', label: 'Header CTA Button', type: 'text' },
    ],
  },
  {
    group: 'Hero Bereich',
    items: [
      { section_key: 'hero', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'hero', field_key: 'subtitle', label: 'Unterzeile', type: 'textarea' },
      { section_key: 'hero', field_key: 'cta_label', label: 'CTA Button', type: 'text' },
      { section_key: 'hero', field_key: 'social_proof', label: 'Social Proof Text', type: 'text' },
    ],
  },
  {
    group: 'Logo Sektion',
    items: [
      { section_key: 'logos_section', field_key: 'label', label: 'Label Text', type: 'text' },
    ],
  },
  {
    group: 'Feature Cards (3er)',
    items: [
      { section_key: 'feature_card_1', field_key: 'title', label: 'Karte 1 – Titel', type: 'text' },
      { section_key: 'feature_card_1', field_key: 'text', label: 'Karte 1 – Text', type: 'textarea' },
      { section_key: 'feature_card_2', field_key: 'title', label: 'Karte 2 – Titel', type: 'text' },
      { section_key: 'feature_card_2', field_key: 'text', label: 'Karte 2 – Text', type: 'textarea' },
      { section_key: 'feature_card_3', field_key: 'title', label: 'Karte 3 – Titel', type: 'text' },
      { section_key: 'feature_card_3', field_key: 'text', label: 'Karte 3 – Text', type: 'textarea' },
    ],
  },
  {
    group: 'Bild + Text Sektion 1',
    items: [
      { section_key: 'image_text_1', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'image_text_1', field_key: 'text', label: 'Fließtext', type: 'textarea' },
      { section_key: 'image_text_1', field_key: 'cta_label', label: 'CTA Button', type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_1', label: 'Bullet 1', type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_2', label: 'Bullet 2', type: 'text' },
      { section_key: 'image_text_1', field_key: 'bullet_3', label: 'Bullet 3', type: 'text' },
    ],
  },
  {
    group: 'Zitat Sektion',
    items: [
      { section_key: 'quote_section', field_key: 'label', label: 'Label', type: 'text' },
      { section_key: 'quote_section', field_key: 'quote', label: 'Zitat', type: 'textarea' },
    ],
  },
  {
    group: 'Video Carousel',
    items: [
      { section_key: 'video_section', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'video_section', field_key: 'text', label: 'Beschreibung', type: 'textarea' },
    ],
  },
  {
    group: 'Bild + Text Sektion 2',
    items: [
      { section_key: 'image_text_2', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'image_text_2', field_key: 'text', label: 'Fließtext', type: 'textarea' },
      { section_key: 'image_text_2', field_key: 'cta_label', label: 'CTA Button', type: 'text' },
    ],
  },
  {
    group: 'Feature Cards (4er)',
    items: [
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
    ],
  },
  {
    group: 'Fließtext',
    items: [
      { section_key: 'flowing_text', field_key: 'text', label: 'Text', type: 'textarea' },
    ],
  },
  {
    group: 'Quiz Sektion',
    items: [
      { section_key: 'quiz_section', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'quiz_section', field_key: 'subtitle', label: 'Unterzeile', type: 'text' },
    ],
  },
  {
    group: 'Video Testimonials',
    items: [
      { section_key: 'testimonial_1', field_key: 'label', label: 'Testimonial 1 – Label', type: 'text' },
      { section_key: 'testimonial_1', field_key: 'quote', label: 'Testimonial 1 – Zitat', type: 'textarea' },
      { section_key: 'testimonial_1', field_key: 'author', label: 'Testimonial 1 – Autor', type: 'text' },
      { section_key: 'testimonial_2', field_key: 'label', label: 'Testimonial 2 – Label', type: 'text' },
      { section_key: 'testimonial_2', field_key: 'quote', label: 'Testimonial 2 – Zitat', type: 'textarea' },
      { section_key: 'testimonial_2', field_key: 'author', label: 'Testimonial 2 – Autor', type: 'text' },
    ],
  },
  {
    group: 'Über Martin',
    items: [
      { section_key: 'about', field_key: 'label', label: 'Label', type: 'text' },
      { section_key: 'about', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'about', field_key: 'text_1', label: 'Absatz 1', type: 'textarea' },
      { section_key: 'about', field_key: 'text_2', label: 'Absatz 2', type: 'textarea' },
      { section_key: 'about', field_key: 'text_3', label: 'Absatz 3', type: 'textarea' },
    ],
  },
  {
    group: 'Bewertungen',
    items: [
      { section_key: 'reviews', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'review_1', field_key: 'text', label: 'Review 1 – Text', type: 'textarea' },
      { section_key: 'review_1', field_key: 'author', label: 'Review 1 – Autor', type: 'text' },
      { section_key: 'review_2', field_key: 'text', label: 'Review 2 – Text', type: 'textarea' },
      { section_key: 'review_2', field_key: 'author', label: 'Review 2 – Autor', type: 'text' },
      { section_key: 'review_3', field_key: 'text', label: 'Review 3 – Text', type: 'textarea' },
      { section_key: 'review_3', field_key: 'author', label: 'Review 3 – Autor', type: 'text' },
    ],
  },
  {
    group: 'Abschluss CTA',
    items: [
      { section_key: 'final_cta', field_key: 'title', label: 'Überschrift', type: 'text' },
      { section_key: 'final_cta', field_key: 'text', label: 'Text', type: 'textarea' },
      { section_key: 'final_cta', field_key: 'cta_label', label: 'CTA Button', type: 'text' },
    ],
  },
];

type ContentMap = Record<string, string>; // "section_key::field_key" → value

export default function CmsPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState(SECTIONS[0].group);

  const makeKey = (section_key: string, field_key: string) => `${section_key}::${field_key}`;

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
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Änderungen werden nach dem Speichern sofort live geschaltet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedAt && dirty.size === 0 && (
            <p className="text-sm text-[#059669]">
              ✓ Gespeichert {savedAt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
            </p>
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
            {saving ? 'Wird gespeichert...' : 'Speichern & live schalten'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <nav className="sticky top-4 space-y-1">
            {SECTIONS.map((s) => {
              const sectionDirty = s.items.some((item) => dirty.has(makeKey(item.section_key, item.field_key)));
              return (
                <button
                  key={s.group}
                  onClick={() => setActiveGroup(s.group)}
                  className={`flex w-full items-center justify-between rounded-[4px] px-3 py-2 text-left text-sm font-semibold transition ${
                    activeGroup === s.group
                      ? 'text-white'
                      : 'text-[#4A4A4A] hover:bg-neutral-100'
                  }`}
                  style={activeGroup === s.group ? { backgroundColor: brand } : undefined}
                >
                  <span>{s.group}</span>
                  {sectionDirty && (
                    <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-[#D97706]" />
                  )}
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
            {SECTIONS.map((s) => (
              <option key={s.group} value={s.group}>{s.group}</option>
            ))}
          </select>
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          <div className="rounded-[4px] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-[#2F2F2F]">{activeSection.group}</h2>

            <div className="space-y-5">
              {activeSection.items.map((item) => {
                const k = makeKey(item.section_key, item.field_key);
                const val = content[k] ?? '';
                const isDirty = dirty.has(k);

                return (
                  <div key={k}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <label className="block text-sm font-semibold text-[#4A4A4A]">
                        {item.label}
                      </label>
                      {isDirty && (
                        <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#D97706]">
                          Geändert
                        </span>
                      )}
                    </div>

                    {item.type === 'textarea' ? (
                      <textarea
                        value={val}
                        onChange={(e) => handleChange(item.section_key, item.field_key, e.target.value)}
                        rows={3}
                        className="w-full rounded-[4px] border px-4 py-2.5 text-sm text-[#2F2F2F] outline-none transition resize-y"
                        style={{ borderColor: isDirty ? '#D97706' : '#D1D5DB' }}
                      />
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
            <div className="mt-6 flex justify-end border-t border-neutral-100 pt-5">
              <button
                onClick={handleSave}
                disabled={saving || dirty.size === 0}
                className="rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: brand }}
              >
                {saving ? 'Wird gespeichert...' : 'Speichern & live schalten'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
