'use client';

// src/app/admin/page.tsx – Dashboard

import { useEffect, useState } from 'react';
import Link from 'next/link';

const brand = '#884A4A';

type Stats = {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  closed: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/leads?page=1');
        const json = await res.json();
        const leads = json.data || [];
        setRecentLeads(leads.slice(0, 5));

        const all = leads;
        setStats({
          total: json.total || 0,
          new: all.filter((l: any) => l.status === 'new').length,
          contacted: all.filter((l: any) => l.status === 'contacted').length,
          qualified: all.filter((l: any) => l.status === 'qualified').length,
          closed: all.filter((l: any) => l.status === 'closed').length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    { label: 'Gesamt Leads', value: stats?.total ?? '–', color: brand },
    { label: 'Neu', value: stats?.new ?? '–', color: '#2563EB' },
    { label: 'Kontaktiert', value: stats?.contacted ?? '–', color: '#D97706' },
    { label: 'Qualifiziert', value: stats?.qualified ?? '–', color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Willkommen im Admin Panel von Martin Krendl</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">{card.label}</p>
            <p
              className="mt-2 text-3xl font-extrabold"
              style={{ color: card.color }}
            >
              {loading ? '…' : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/cms"
          className="flex items-center gap-4 rounded-[4px] border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px]"
            style={{ backgroundColor: brand }}
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#2F2F2F]">Content bearbeiten</p>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Texte, Farben und Links der Seite anpassen</p>
          </div>
        </Link>

        <Link
          href="/admin/crm"
          className="flex items-center gap-4 rounded-[4px] border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px]"
            style={{ backgroundColor: brand }}
          >
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#2F2F2F]">Leads verwalten</p>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Quiz-Anfragen einsehen und bearbeiten</p>
          </div>
        </Link>
      </div>

      {/* Recent Leads */}
      <div className="rounded-[4px] border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-bold text-[#2F2F2F]">Neueste Leads</h2>
          <Link href="/admin/crm" className="text-sm font-semibold hover:underline" style={{ color: brand }}>
            Alle anzeigen →
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-[#6B6B6B]">Lade...</div>
        ) : recentLeads.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[#6B6B6B]">Noch keine Leads vorhanden.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-[#2F2F2F]">{lead.name}</p>
                  <p className="text-sm text-[#6B6B6B]">{lead.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={lead.status} />
                  <p className="text-xs text-[#6B6B6B]">
                    {new Date(lead.created_at).toLocaleDateString('de-AT')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    new: { label: 'Neu', bg: '#EFF6FF', text: '#2563EB' },
    contacted: { label: 'Kontaktiert', bg: '#FFFBEB', text: '#D97706' },
    qualified: { label: 'Qualifiziert', bg: '#ECFDF5', text: '#059669' },
    closed: { label: 'Abgeschlossen', bg: '#F3F4F6', text: '#6B7280' },
  };
  const s = map[status] || map.new;
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}
