'use client';
// src/app/admin/analytics/page.tsx

import { useEffect, useState, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Users, Monitor, Smartphone, Tablet,
  Loader2, RefreshCw, CheckCircle, GitCommit, Plus, Trash2, ChevronDown, Tag,
  ArrowRight, BarChart2,
} from 'lucide-react';

const brand = '#884A4A';

// ── Types ─────────────────────────────────────────────────────────────────────
type DailyEntry  = { date: string; views: number };
type PageEntry   = { path: string; views: number };
type Devices     = { mobile: number; desktop: number; tablet: number };

type Stats = {
  total: number; today: number; period: number; trend: number;
  daily: DailyEntry[]; topPages: PageEntry[]; devices: Devices;
};

type FunnelStepCounts = Record<string, number>;
type FunnelDaily      = { date: string; views: number; submits: number }[];

type ChangelogEntry = {
  id: string; description: string; category: string; created_at: string;
};

const RANGES = [
  { label: '7 Tage',  days: 7 },
  { label: '30 Tage', days: 30 },
  { label: '90 Tage', days: 90 },
];

const FUNNEL_STEPS: { key: string; label: string; color: string }[] = [
  { key: 'view',   label: 'Quiz gesehen',     color: brand },
  { key: 'q1',     label: 'Frage 1 beantw.',  color: '#A06060' },
  { key: 'q2',     label: 'Frage 2 beantw.',  color: '#B87070' },
  { key: 'q3',     label: 'Frage 3 beantw.',  color: '#C88080' },
  { key: 'form',   label: 'Formular gesehen', color: '#D89090' },
  { key: 'submit', label: 'Abgesendet',        color: '#059669' },
];

const CHANGELOG_CATEGORIES = [
  { value: 'general',  label: 'Allgemein',    color: '#6B7280' },
  { value: 'design',   label: 'Design',       color: '#8B5CF6' },
  { value: 'copy',     label: 'Text/Copy',    color: '#0EA5E9' },
  { value: 'offer',    label: 'Angebot',      color: '#F59E0B' },
  { value: 'technical',label: 'Technisch',    color: '#10B981' },
];

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color = brand }: { data: DailyEntry[]; color?: string }) {
  if (data.length === 0) return <div className="h-16 flex items-center justify-center text-xs text-[#6B6B6B]">Keine Daten</div>;
  const max = Math.max(...data.map((d) => d.views), 1);
  const w = 400; const h = 60; const pad = 4;
  const pts = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (d.views / max) * (h - pad * 2);
    return `${x},${y}`;
  });
  const poly = pts.join(' ');
  const area = `${pad},${h} ${poly} ${w - pad},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#sg)" />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: PageEntry[] }) {
  if (data.length === 0) return <p className="py-8 text-center text-sm text-[#6B6B6B]">Noch keine Seitenaufrufe erfasst.</p>;
  const max = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.path} className="flex items-center gap-3">
          <div className="w-36 shrink-0 truncate text-xs font-mono text-[#4A4A4A]" title={item.path}>{item.path || '/'}</div>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-5 rounded-[2px]" style={{ width: `${(item.views / max) * 100}%`, backgroundColor: brand, minWidth: 4 }} />
            <span className="shrink-0 text-xs font-semibold text-[#2F2F2F]">{item.views}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Device Donut ──────────────────────────────────────────────────────────────
function DeviceChart({ devices }: { devices: Devices }) {
  const total = devices.mobile + devices.desktop + devices.tablet || 1;
  const items = [
    { label: 'Desktop', value: devices.desktop, color: brand,     Icon: Monitor },
    { label: 'Mobile',  value: devices.mobile,  color: '#C17070', Icon: Smartphone },
    { label: 'Tablet',  value: devices.tablet,  color: '#E8C0C0', Icon: Tablet },
  ];
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          {(() => {
            let cum = 0;
            return items.map((item) => {
              const pct = (item.value / total) * 100;
              const circ = 2 * Math.PI * 15.9155;
              const dash = (pct / 100) * circ;
              const el = <circle key={item.label} cx="18" cy="18" r="15.9155" fill="none" stroke={item.color} strokeWidth="3.5" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-cum * circ / 100} />;
              cum += pct;
              return el;
            });
          })()}
        </svg>
      </div>
      <div className="space-y-2">
        {items.map(({ label, value, color, Icon }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
            <Icon className="h-3.5 w-3.5 text-[#6B6B6B]" />
            <span className="text-sm text-[#4A4A4A]">{label}</span>
            <span className="ml-auto pl-4 text-sm font-semibold text-[#2F2F2F]">{value}</span>
            <span className="text-xs text-[#6B6B6B]">({Math.round((value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quiz Funnel Chart ─────────────────────────────────────────────────────────
function FunnelChart({ stepCounts, loading }: { stepCounts: FunnelStepCounts; loading: boolean }) {
  if (loading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" style={{ color: brand }} /></div>;
  const topVal = stepCounts['view'] || 1;
  return (
    <div className="space-y-2">
      {FUNNEL_STEPS.map((step, i) => {
        const count = stepCounts[step.key] || 0;
        const pct = Math.round((count / topVal) * 100);
        const prevCount = i > 0 ? (stepCounts[FUNNEL_STEPS[i - 1].key] || 0) : count;
        const dropPct = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;
        return (
          <div key={step.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 text-center font-bold text-[#9CA3AF]">{i + 1}</span>
                <span className="font-semibold text-[#2F2F2F]">{step.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {i > 0 && dropPct > 0 && (
                  <span className="text-[#DC2626] text-[10px] font-medium">−{dropPct}%</span>
                )}
                <span className="font-bold text-[#2F2F2F] w-10 text-right">{count.toLocaleString('de-AT')}</span>
                <span className="text-[#6B6B6B] w-10 text-right">{pct}%</span>
              </div>
            </div>
            <div className="h-7 w-full overflow-hidden rounded-[3px] bg-neutral-100">
              <div
                className="h-full rounded-[3px] transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: step.color, minWidth: count > 0 ? 4 : 0 }}
              />
            </div>
            {i < FUNNEL_STEPS.length - 1 && (
              <div className="flex justify-start pl-6">
                <ArrowRight className="h-3 w-3 text-neutral-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Funnel Timeline Chart ─────────────────────────────────────────────────────
function FunnelTimeline({ daily, changelog, days }: { daily: FunnelDaily; changelog: ChangelogEntry[]; days: number }) {
  if (daily.length === 0) return <p className="py-8 text-center text-sm text-[#6B6B6B]">Noch keine Daten.</p>;

  const maxViews = Math.max(...daily.map(d => d.views), 1);
  const w = 800; const h = 100; const pad = 8;

  // Build changelog date index for markers
  const changelogByDate: Record<string, ChangelogEntry[]> = {};
  for (const entry of changelog) {
    const key = new Date(entry.created_at).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
    if (!changelogByDate[key]) changelogByDate[key] = [];
    changelogByDate[key].push(entry);
  }

  const viewPts = daily.map((d, i) => {
    const x = pad + (i / Math.max(daily.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - (d.views / maxViews) * (h - pad * 2);
    return { x, y, ...d };
  });

  const submitPts = daily.map((d, i) => {
    const x = pad + (i / Math.max(daily.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((d.submits || 0) / maxViews) * (h - pad * 2);
    return { x, y };
  });

  const viewPolyline  = viewPts.map(p => `${p.x},${p.y}`).join(' ');
  const submitPolyline = submitPts.map(p => `${p.x},${p.y}`).join(' ');
  const viewArea = `${pad},${h} ${viewPolyline} ${w - pad},${h}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={brand} stopOpacity="0.15" />
            <stop offset="100%" stopColor={brand} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <polygon points={viewArea} fill="url(#fg)" />
        <polyline points={viewPolyline} fill="none" stroke={brand} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={submitPolyline} fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />

        {/* Changelog markers */}
        {viewPts.map((pt, i) => {
          const entries = changelogByDate[pt.date];
          if (!entries?.length) return null;
          const cat = CHANGELOG_CATEGORIES.find(c => c.value === entries[0].category) || CHANGELOG_CATEGORIES[0];
          return (
            <g key={i}>
              <line x1={pt.x} y1={0} x2={pt.x} y2={h} stroke={cat.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
              <circle cx={pt.x} cy={8} r="5" fill={cat.color} />
              <text x={pt.x} y="11" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">{entries.length}</text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 rounded" style={{ backgroundColor: brand }} />
          <span className="text-xs text-[#6B6B6B]">Quiz Aufrufe</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 rounded border-t-2 border-dashed" style={{ borderColor: '#059669' }} />
          <span className="text-xs text-[#6B6B6B]">Absendungen</span>
        </div>
        {CHANGELOG_CATEGORIES.map(cat => (
          <div key={cat.value} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-xs text-[#6B6B6B]">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Date labels */}
      <div className="mt-1 flex justify-between text-[10px] text-[#6B6B6B]">
        <span>{daily[0]?.date}</span>
        <span>{daily[daily.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// ── Changelog Panel ───────────────────────────────────────────────────────────
function ChangelogPanel({ entries, onAdd, onDelete, loading }: {
  entries: ChangelogEntry[]; onAdd: (desc: string, cat: string) => void; onDelete: (id: string) => void; loading: boolean;
}) {
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('general');
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submit = () => {
    if (!desc.trim()) return;
    onAdd(desc.trim(), cat);
    setDesc('');
  };

  const selectedCat = CHANGELOG_CATEGORIES.find(c => c.value === cat)!;

  return (
    <div className="space-y-4">
      {/* Add entry */}
      <div className="flex gap-2">
        <input
          type="text"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Änderung beschreiben, z.B. CTA-Text geändert…"
          className="h-9 flex-1 rounded-[4px] border border-neutral-200 px-3 text-sm outline-none transition focus:border-[#884A4A]"
        />
        {/* Category dropdown */}
        <div ref={catRef} className="relative">
          <button type="button" onClick={() => setCatOpen(v => !v)}
            className="flex h-9 items-center gap-1.5 rounded-[4px] border border-neutral-200 px-3 text-xs font-medium transition hover:border-[#884A4A]">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedCat.color }} />
            <span className="hidden sm:inline">{selectedCat.label}</span>
            <ChevronDown className="h-3 w-3 text-[#6B6B6B]" />
          </button>
          {catOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-lg">
              {CHANGELOG_CATEGORIES.map(c => (
                <button key={c.value} type="button" onClick={() => { setCat(c.value); setCatOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition hover:bg-neutral-50 ${cat === c.value ? 'font-semibold' : ''}`}>
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />{c.label}
                  {cat === c.value && <CheckCircle className="ml-auto h-3 w-3" style={{ color: c.color }} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={submit} disabled={!desc.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] text-white disabled:opacity-40 transition hover:opacity-90"
          style={{ backgroundColor: brand }}>
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Entries timeline */}
      {loading ? (
        <div className="flex h-20 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" style={{ color: brand }} /></div>
      ) : entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#9CA3AF]">Noch keine Einträge. Logge deine erste Veränderung!</p>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-200" />
          {entries.map((entry, i) => {
            const cat = CHANGELOG_CATEGORIES.find(c => c.value === entry.category) || CHANGELOG_CATEGORIES[0];
            const date = new Date(entry.created_at);
            return (
              <div key={entry.id} className="relative flex gap-3 pb-4 pl-7">
                {/* Dot */}
                <div className="absolute left-0 top-1 h-5 w-5 shrink-0 flex items-center justify-center rounded-full border-2 border-white bg-white shadow-sm" style={{ backgroundColor: cat.color + '20', borderColor: cat.color }}>
                  <GitCommit className="h-2.5 w-2.5" style={{ color: cat.color }} />
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[#2F2F2F] leading-snug">{entry.description}</p>
                    <button type="button" onClick={() => onDelete(entry.id)} className="shrink-0 text-neutral-300 hover:text-red-400 transition mt-0.5">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: cat.color + '18', color: cat.color }}>{cat.label}</span>
                    <span className="text-[10px] text-[#9CA3AF]">{date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit' })} · {date.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [days, setDays]       = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [funnelSteps, setFunnelSteps]   = useState<FunnelStepCounts>({});
  const [funnelDaily, setFunnelDaily]   = useState<FunnelDaily>([]);
  const [funnelLoading, setFunnelLoading] = useState(true);

  const [changelog, setChangelog]       = useState<ChangelogEntry[]>([]);
  const [changelogLoading, setChangelogLoading] = useState(true);

  // Tab: 'pageviews' | 'funnel'
  const [tab, setTab] = useState<'pageviews' | 'funnel'>('pageviews');

  const loadStats = async (d: number) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/admin/pageview?days=${d}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setStats(json);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const loadFunnel = async (d: number) => {
    setFunnelLoading(true);
    try {
      const res = await fetch(`/api/admin/quiz-funnel?days=${d}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setFunnelSteps(json.stepCounts || {});
      setFunnelDaily(json.daily || []);
    } catch {}
    finally { setFunnelLoading(false); }
  };

  const loadChangelog = async () => {
    setChangelogLoading(true);
    try {
      const res = await fetch('/api/admin/funnel-changelog');
      const json = await res.json();
      if (json.ok) setChangelog(json.data || []);
    } catch {}
    finally { setChangelogLoading(false); }
  };

  useEffect(() => {
    loadStats(days);
    loadFunnel(days);
  }, [days]);

  useEffect(() => { loadChangelog(); }, []);

  const addChangelog = async (description: string, category: string) => {
    try {
      const res = await fetch('/api/admin/funnel-changelog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description, category }) });
      const json = await res.json();
      if (json.ok) setChangelog(prev => [json.data, ...prev]);
    } catch {}
  };

  const deleteChangelog = async (id: string) => {
    setChangelog(prev => prev.filter(e => e.id !== id));
    try { await fetch('/api/admin/funnel-changelog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); } catch {}
  };

  const TrendIcon = !stats ? Minus : stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus;
  const trendColor = !stats ? '#6B6B6B' : stats.trend > 0 ? '#059669' : stats.trend < 0 ? '#DC2626' : '#6B6B6B';

  const funnelConversion = funnelSteps['view'] > 0
    ? ((funnelSteps['submit'] || 0) / funnelSteps['view'] * 100).toFixed(1)
    : '–';

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); * { font-family: 'Open Sans', sans-serif !important; }`}</style>
      <div className="space-y-6 pb-10">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Analytics</h1>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Seitenaufrufe, Quiz-Funnel und Verlauf deiner Optimierungen.</p>
          </div>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <button key={r.days} onClick={() => setDays(r.days)}
                className="rounded-[4px] px-3 py-1.5 text-sm font-semibold transition"
                style={{ backgroundColor: days === r.days ? brand : '#F3F4F6', color: days === r.days ? 'white' : '#4A4A4A' }}>
                {r.label}
              </button>
            ))}
            <button onClick={() => { loadStats(days); loadFunnel(days); }}
              className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] hover:bg-neutral-50">
              <RefreshCw className={`h-4 w-4 ${(loading || funnelLoading) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-1 rounded-[4px] border border-neutral-200 bg-neutral-50 p-1 w-fit">
          <button onClick={() => setTab('pageviews')}
            className="flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-sm font-semibold transition"
            style={{ backgroundColor: tab === 'pageviews' ? 'white' : 'transparent', color: tab === 'pageviews' ? brand : '#6B6B6B', boxShadow: tab === 'pageviews' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            <Users className="h-4 w-4" />Seitenaufrufe
          </button>
          <button onClick={() => setTab('funnel')}
            className="flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-sm font-semibold transition"
            style={{ backgroundColor: tab === 'funnel' ? 'white' : 'transparent', color: tab === 'funnel' ? brand : '#6B6B6B', boxShadow: tab === 'funnel' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            <BarChart2 className="h-4 w-4" />Quiz Funnel
          </button>
        </div>

        {/* ── Pageviews Tab ──────────────────────────────────────────────────── */}
        {tab === 'pageviews' && (
          <>
            {loading && !stats ? (
              <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} /></div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: 'Gesamt Aufrufe',     value: stats?.total ?? 0,  sub: 'Alle Zeit' },
                    { label: 'Heute',              value: stats?.today ?? 0,  sub: 'Seit Mitternacht' },
                    { label: `Letzte ${days} Tage`,value: stats?.period ?? 0, sub: 'Im gewählten Zeitraum' },
                    { label: 'Trend (7 Tage)',     value: stats?.trend != null ? `${stats.trend > 0 ? '+' : ''}${stats.trend}%` : '–', sub: 'vs. vorherige 7 Tage', trend: true },
                  ].map((card) => (
                    <div key={card.label} className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">{card.label}</p>
                      <div className="mt-2 flex items-end gap-2">
                        <p className="text-3xl font-extrabold text-[#2F2F2F]">{card.value}</p>
                        {card.trend && stats && <TrendIcon className="mb-1 h-5 w-5" style={{ color: trendColor }} />}
                      </div>
                      <p className="mt-1 text-xs text-[#6B6B6B]">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Sparkline Chart */}
                <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-bold text-[#2F2F2F]">Aufrufe über Zeit</h2>
                    <span className="text-xs text-[#6B6B6B]">Letzte {days} Tage</span>
                  </div>
                  {stats && stats.daily.length > 0 ? (
                    <>
                      <Sparkline data={stats.daily} />
                      <div className="mt-2 flex justify-between text-[10px] text-[#6B6B6B]">
                        <span>{stats.daily[0]?.date}</span>
                        <span>{stats.daily[stats.daily.length - 1]?.date}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-20 items-center justify-center text-sm text-[#6B6B6B]">Noch keine Daten für diesen Zeitraum.</div>
                  )}
                </div>

                {/* Top Pages + Devices */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-bold text-[#2F2F2F]">Top Seiten</h2>
                    <BarChart data={stats?.topPages ?? []} />
                  </div>
                  <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-bold text-[#2F2F2F]">Geräte</h2>
                    {stats && <DeviceChart devices={stats.devices} />}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Funnel Tab ─────────────────────────────────────────────────────── */}
        {tab === 'funnel' && (
          <div className="space-y-4">
            {/* Funnel KPI cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Quiz Aufrufe', value: (funnelSteps['view'] || 0).toLocaleString('de-AT'), sub: `Letzte ${days} Tage`, color: brand },
                { label: 'Frage 1 beantw.', value: (funnelSteps['q1'] || 0).toLocaleString('de-AT'), sub: `von ${funnelSteps['view'] || 0} Aufrufen`, color: '#A06060' },
                { label: 'Formular erreicht', value: (funnelSteps['form'] || 0).toLocaleString('de-AT'), sub: `nach Frage 3`, color: '#C88080' },
                { label: 'Abgesendet', value: (funnelSteps['submit'] || 0).toLocaleString('de-AT'), sub: `Conversion: ${funnelConversion}%`, color: '#059669' },
              ].map((card) => (
                <div key={card.label} className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">{card.label}</p>
                  <p className="mt-2 text-3xl font-extrabold" style={{ color: card.color }}>{card.value}</p>
                  <p className="mt-1 text-xs text-[#6B6B6B]">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Funnel + Timeline grid */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Funnel steps */}
              <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-[#2F2F2F]">Schritt-für-Schritt Funnel</h2>
                  <span className="text-xs text-[#6B6B6B]">Letzte {days} Tage</span>
                </div>
                <FunnelChart stepCounts={funnelSteps} loading={funnelLoading} />
              </div>

              {/* Timeline with changelog markers */}
              <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-[#2F2F2F]">Verlauf & Änderungen</h2>
                  <span className="text-xs text-[#6B6B6B]">Letzte {days} Tage</span>
                </div>
                <FunnelTimeline daily={funnelDaily} changelog={changelog} days={days} />
              </div>
            </div>

            {/* Changelog panel */}
            <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" style={{ color: brand }} />
                <h2 className="font-bold text-[#2F2F2F]">Änderungs-Log</h2>
                <span className="ml-auto text-xs text-[#9CA3AF]">Veränderungen im Zeitverlauf sichtbar machen</span>
              </div>
              <ChangelogPanel
                entries={changelog}
                onAdd={addChangelog}
                onDelete={deleteChangelog}
                loading={changelogLoading}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
