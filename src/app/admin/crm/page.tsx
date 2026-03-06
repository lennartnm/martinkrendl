'use client';

// src/app/admin/crm/page.tsx
// Vollständiges CRM für Quiz-Leads

import { useEffect, useState, useCallback } from 'react';

const brand = '#884A4A';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  ready: string | null;
  experience: string | null;
  lesson_type: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  notes: string;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'Alle' },
  { value: 'new', label: 'Neu' },
  { value: 'contacted', label: 'Kontaktiert' },
  { value: 'qualified', label: 'Qualifiziert' },
  { value: 'closed', label: 'Abgeschlossen' },
];

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  new: { label: 'Neu', bg: '#EFF6FF', text: '#2563EB' },
  contacted: { label: 'Kontaktiert', bg: '#FFFBEB', text: '#D97706' },
  qualified: { label: 'Qualifiziert', bg: '#ECFDF5', text: '#059669' },
  closed: { label: 'Abgeschlossen', bg: '#F3F4F6', text: '#6B7280' },
};

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/leads?${params}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setLeads(json.data || []);
      setTotal(json.total || 0);
    } catch (e: any) {
      setError('Fehler beim Laden: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Wenn Filter geändert → zurück zu Seite 1
  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);

      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: status as Lead['status'] } : l)));
      if (selectedLead?.id === id) {
        setSelectedLead((prev) => prev ? { ...prev, status: status as Lead['status'] } : prev);
      }
    } catch (e: any) {
      setError('Status konnte nicht geändert werden.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLead.id, notes: editNotes }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: editNotes } : l)));
      setSelectedLead((prev) => prev ? { ...prev, notes: editNotes } : prev);
    } catch (e: any) {
      setError('Notizen konnten nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#2F2F2F]">CRM / Leads</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {total} Lead{total !== 1 ? 's' : ''} aus dem Quiz
        </p>
      </div>

      {error && (
        <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-3 underline" onClick={() => setError('')}>OK</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <div className="flex rounded-[4px] border border-neutral-200 bg-white overflow-hidden">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                statusFilter === opt.value ? 'text-white' : 'text-[#4A4A4A] hover:bg-neutral-50'
              }`}
              style={statusFilter === opt.value ? { backgroundColor: brand } : undefined}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, E-Mail oder Telefon suchen..."
            className="h-10 w-full rounded-[4px] border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-[#884A4A]"
          />
        </div>
      </div>

      <div className="flex gap-5">
        {/* Lead List */}
        <div className={`flex-1 min-w-0 ${selectedLead ? 'lg:max-w-[60%]' : ''}`}>
          <div className="rounded-[4px] border border-neutral-200 bg-white shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200" style={{ borderTopColor: brand }} />
              </div>
            ) : leads.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-[#6B6B6B]">
                Keine Leads gefunden.
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="hidden grid-cols-[1fr_1fr_120px_140px_36px] gap-4 border-b border-neutral-200 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] md:grid">
                  <div>Name</div>
                  <div>Kontakt</div>
                  <div>Quiz-Typ</div>
                  <div>Status</div>
                  <div></div>
                </div>

                {leads.map((lead) => {
                  const s = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
                  const isSelected = selectedLead?.id === lead.id;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className={`cursor-pointer border-b border-neutral-100 px-5 py-4 transition last:border-0 hover:bg-neutral-50 md:grid md:grid-cols-[1fr_1fr_120px_140px_36px] md:items-center md:gap-4 ${
                        isSelected ? 'bg-[#FDF8F8]' : ''
                      }`}
                      style={isSelected ? { borderLeft: `3px solid ${brand}` } : { borderLeft: '3px solid transparent' }}
                    >
                      <div>
                        <p className="font-semibold text-[#2F2F2F]">{lead.name}</p>
                        <p className="text-xs text-[#6B6B6B]">
                          {new Date(lead.created_at).toLocaleDateString('de-AT', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="mt-1 md:mt-0">
                        <p className="text-sm text-[#4A4A4A]">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-[#6B6B6B]">{lead.phone}</p>}
                      </div>
                      <div className="mt-1 md:mt-0">
                        {lead.lesson_type && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-[#4A4A4A]">
                            {lead.lesson_type}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 md:mt-0">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className="rounded-full px-2.5 py-1 text-xs font-semibold border-0 outline-none cursor-pointer"
                          style={{ backgroundColor: s.bg, color: s.text }}
                        >
                          <option value="new">Neu</option>
                          <option value="contacted">Kontaktiert</option>
                          <option value="qualified">Qualifiziert</option>
                          <option value="closed">Abgeschlossen</option>
                        </select>
                      </div>
                      <div className="hidden md:flex justify-end">
                        <svg className="h-4 w-4 text-[#6B6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-[4px] border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-[#4A4A4A] disabled:opacity-40"
              >
                ← Zurück
              </button>
              <span className="text-sm text-[#6B6B6B]">Seite {page} von {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-[4px] border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-[#4A4A4A] disabled:opacity-40"
              >
                Weiter →
              </button>
            </div>
          )}
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-4 rounded-[4px] border border-neutral-200 bg-white shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-200 p-5">
                <div>
                  <p className="font-bold text-[#2F2F2F]">{selectedLead.name}</p>
                  <p className="mt-0.5 text-xs text-[#6B6B6B]">
                    {new Date(selectedLead.created_at).toLocaleDateString('de-AT', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="rounded p-1 text-[#6B6B6B] hover:bg-neutral-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Kontakt */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">Kontakt</p>
                  <a href={`mailto:${selectedLead.email}`} className="block text-sm font-semibold hover:underline" style={{ color: brand }}>
                    {selectedLead.email}
                  </a>
                  {selectedLead.phone && (
                    <a href={`tel:${selectedLead.phone}`} className="block text-sm text-[#4A4A4A] hover:underline">
                      {selectedLead.phone}
                    </a>
                  )}
                </div>

                {/* Quiz Antworten */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">Quiz Antworten</p>
                  <div className="space-y-1.5">
                    {selectedLead.ready && (
                      <div className="rounded-[4px] bg-neutral-50 px-3 py-2 text-xs">
                        <span className="text-[#6B6B6B]">Bereit: </span>
                        <span className="font-semibold text-[#2F2F2F]">{selectedLead.ready}</span>
                      </div>
                    )}
                    {selectedLead.experience && (
                      <div className="rounded-[4px] bg-neutral-50 px-3 py-2 text-xs">
                        <span className="text-[#6B6B6B]">Erfahrung: </span>
                        <span className="font-semibold text-[#2F2F2F]">{selectedLead.experience}</span>
                      </div>
                    )}
                    {selectedLead.lesson_type && (
                      <div className="rounded-[4px] bg-neutral-50 px-3 py-2 text-xs">
                        <span className="text-[#6B6B6B]">Unterricht: </span>
                        <span className="font-semibold text-[#2F2F2F]">{selectedLead.lesson_type}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">Status</p>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                    className="w-full rounded-[4px] border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold outline-none"
                    style={{ color: STATUS_STYLES[selectedLead.status]?.text || '#2F2F2F' }}
                  >
                    <option value="new">Neu</option>
                    <option value="contacted">Kontaktiert</option>
                    <option value="qualified">Qualifiziert</option>
                    <option value="closed">Abgeschlossen</option>
                  </select>
                </div>

                {/* UTM */}
                {(selectedLead.utm_source || selectedLead.utm_campaign) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">Quelle</p>
                    <div className="space-y-1">
                      {selectedLead.utm_source && (
                        <p className="text-xs text-[#4A4A4A]">Source: <span className="font-semibold">{selectedLead.utm_source}</span></p>
                      )}
                      {selectedLead.utm_campaign && (
                        <p className="text-xs text-[#4A4A4A]">Campaign: <span className="font-semibold">{selectedLead.utm_campaign}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notizen */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-2">Notizen</p>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    placeholder="Interne Notizen..."
                    className="w-full rounded-[4px] border border-neutral-200 px-3 py-2 text-sm text-[#2F2F2F] outline-none transition resize-none focus:border-[#884A4A]"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={saving}
                    className="mt-2 w-full rounded-[4px] py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: brand }}
                  >
                    {saving ? 'Speichern...' : 'Notizen speichern'}
                  </button>
                </div>

                {/* Schnell-Aktionen */}
                <div className="border-t border-neutral-100 pt-4 space-y-2">
                  <a
                    href={`mailto:${selectedLead.email}?subject=Probestunde bei Martin Krendl`}
                    className="flex items-center justify-center gap-2 w-full rounded-[4px] border py-2 text-sm font-semibold transition hover:bg-neutral-50"
                    style={{ borderColor: brand, color: brand }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    E-Mail senden
                  </a>
                  {selectedLead.phone && (
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex items-center justify-center gap-2 w-full rounded-[4px] border border-neutral-200 py-2 text-sm font-semibold text-[#4A4A4A] transition hover:bg-neutral-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Anrufen
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
