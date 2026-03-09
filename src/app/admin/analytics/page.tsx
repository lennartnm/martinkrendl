'use client';
// src/app/admin/analytics/page.tsx

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Monitor, Smartphone, Tablet,
  Loader2, RefreshCw, CheckCircle, GitCommit, Plus, Trash2,
  ChevronDown, Tag, ArrowRight, BarChart2, Users, Calendar,
  Eye, Send,
} from 'lucide-react';

const brand = '#884A4A';

// ── Types ─────────────────────────────────────────────────────────────────────
type DailyEntry  = { date: string; views: number };
type PageEntry   = { path: string; views: number };
type Devices     = { mobile: number; desktop: number; tablet: number };
type Stats = { total: number; today: number; period: number; trend: number; daily: DailyEntry[]; topPages: PageEntry[]; devices: Devices };
type FunnelCounts = Record<string, number>;
type FunnelDaily  = { date: string; views: number; submits: number }[];
type ChangelogEntry = { id: string; description: string; category: string; created_at: string };

const FUNNEL_STEPS = [
  { key: 'view',   label: 'Quiz gesehen',     color: brand },
  { key: 'q1',     label: 'Frage 1',          color: '#A06060' },
  { key: 'q2',     label: 'Frage 2',          color: '#B87070' },
  { key: 'q3',     label: 'Frage 3',          color: '#C88080' },
  { key: 'form',   label: 'Formular',         color: '#D89090' },
  { key: 'submit', label: 'Abgesendet ✓',     color: '#059669' },
];

const ENTRY_COLOR = { color: brand, bg: '#FDF4F4' };
function getCat(_val: string) { return ENTRY_COLOR; }

// ── Date helpers ──────────────────────────────────────────────────────────────
function toDateInputVal(d: Date) {
  return d.toISOString().split('T')[0];
}
function fromDateInputVal(s: string) {
  return new Date(s + 'T00:00:00');
}
function formatDateDE(d: Date) {
  return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color = brand }: { data: DailyEntry[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.views), 1);
  const W = 400; const H = 60; const P = 4;
  const pts = data.map((d, i) => {
    const x = P + (i / Math.max(data.length - 1, 1)) * (W - P * 2);
    const y = H - P - (d.views / max) * (H - P * 2);
    return `${x},${y}`;
  });
  const poly = pts.join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
        <stop offset="100%" stopColor={color} stopOpacity="0.01" />
      </linearGradient></defs>
      <polygon points={`${P},${H} ${poly} ${W - P},${H}`} fill="url(#sg)" />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── DeviceDonut ───────────────────────────────────────────────────────────────
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
          {(() => { let cum = 0; return items.map(item => { const pct = (item.value / total) * 100; const c = 2 * Math.PI * 15.9155; const d = (pct / 100) * c; const el = <circle key={item.label} cx="18" cy="18" r="15.9155" fill="none" stroke={item.color} strokeWidth="3.5" strokeDasharray={`${d} ${c - d}`} strokeDashoffset={-cum * c / 100} />; cum += pct; return el; }); })()}
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

// ── BarChart ──────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: PageEntry[] }) {
  if (!data.length) return <p className="py-8 text-center text-sm text-[#6B6B6B]">Keine Daten.</p>;
  const max = Math.max(...data.map(d => d.views), 1);
  return (
    <div className="space-y-2">
      {data.map(item => (
        <div key={item.path} className="flex items-center gap-3">
          <div className="w-36 shrink-0 truncate text-xs font-mono text-[#4A4A4A]">{item.path || '/'}</div>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-5 rounded-[2px]" style={{ width: `${(item.views / max) * 100}%`, backgroundColor: brand, minWidth: 4 }} />
            <span className="shrink-0 text-xs font-semibold">{item.views}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Custom Date Range Picker ──────────────────────────────────────────────────
function DateRangePicker({ from, to, onChange }: {
  from: string; to: string;
  onChange: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo]     = useState(to);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalFrom(from); setLocalTo(to); }, [from, to]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const apply = () => {
    if (localFrom && localTo && localFrom <= localTo) {
      onChange(localFrom, localTo);
      setOpen(false);
    }
  };

  const diffDays = from && to ? Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1 : 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-9 items-center gap-1.5 rounded-[4px] border border-neutral-200 bg-white px-3 text-sm font-medium transition hover:border-[#884A4A]"
      >
        <Calendar className="h-3.5 w-3.5 text-[#6B6B6B]" />
        <span className="text-[#2F2F2F]">{from ? `${formatDateDE(fromDateInputVal(from))} – ${formatDateDE(fromDateInputVal(to))}` : 'Zeitraum wählen'}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#6B6B6B] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-[4px] border border-neutral-200 bg-white p-4 shadow-lg">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Benutzerdefinierter Zeitraum</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[#6B6B6B]">VON</label>
              <input type="date" value={localFrom} onChange={e => setLocalFrom(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-neutral-200 px-2 text-sm outline-none focus:border-[#884A4A]" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-[#6B6B6B]">BIS</label>
              <input type="date" value={localTo} onChange={e => setLocalTo(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-neutral-200 px-2 text-sm outline-none focus:border-[#884A4A]" />
            </div>
          </div>
          <button
            onClick={apply}
            disabled={!localFrom || !localTo || localFrom > localTo}
            className="mt-3 h-9 w-full rounded-[4px] text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: brand }}
          >
            Anwenden
          </button>
          {diffDays > 0 && (
            <p className="mt-2 text-center text-xs text-[#9CA3AF]">{diffDays} Tage ausgewählt</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Funnel Timeline with changelog markers ─────────────────────────────────────
function FunnelTimeline({
  daily, changelog, funnelCounts,
}: {
  daily: FunnelDaily;
  changelog: ChangelogEntry[];
  funnelCounts: FunnelCounts;
}) {
  const topViews   = daily.reduce((s, d) => s + d.views, 0);
  const topSubmits = daily.reduce((s, d) => s + d.submits, 0);
  const conversion = topViews > 0 ? ((topSubmits / topViews) * 100).toFixed(1) : '–';

  const W = 800; const H = 120; const P = 10;
  const maxVal = Math.max(...daily.map(d => Math.max(d.views, d.submits)), 1);

  const viewPts = daily.map((d, i) => ({
    x: P + (i / Math.max(daily.length - 1, 1)) * (W - P * 2),
    y: H - P - (d.views / maxVal) * (H - P * 2),
    ...d,
  }));
  const submitPts = daily.map((d, i) => ({
    x: P + (i / Math.max(daily.length - 1, 1)) * (W - P * 2),
    y: H - P - (d.submits / maxVal) * (H - P * 2),
  }));

  const changelogByDate: Record<string, ChangelogEntry[]> = {};
  for (const e of changelog) {
    const key = new Date(e.created_at).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
    (changelogByDate[key] ||= []).push(e);
  }

  return (
    <div className="space-y-5">
      {/* KPI summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-[4px] border border-neutral-100 bg-neutral-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Quiz gesehen</p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: brand }}>{topViews.toLocaleString('de-AT')}</p>
        </div>
        <div className="rounded-[4px] border border-neutral-100 bg-neutral-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Abgesendet</p>
          <p className="mt-1 text-2xl font-extrabold text-[#059669]">{topSubmits.toLocaleString('de-AT')}</p>
        </div>
        <div className="rounded-[4px] border border-neutral-100 bg-neutral-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Conversion</p>
          <p className="mt-1 text-2xl font-extrabold text-[#2F2F2F]">{conversion}%</p>
        </div>
        <div className="rounded-[4px] border border-neutral-100 bg-neutral-50 p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Änderungen</p>
          <p className="mt-1 text-2xl font-extrabold text-[#7C3AED]">{changelog.length}</p>
        </div>
      </div>

      {/* Timeline chart */}
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="tfg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={brand} stopOpacity="0.12" />
              <stop offset="100%" stopColor={brand} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {/* View area fill */}
          <polygon
            points={`${P},${H} ${viewPts.map(p => `${p.x},${p.y}`).join(' ')} ${W - P},${H}`}
            fill="url(#tfg)"
          />
          {/* View line */}
          <polyline
            points={viewPts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke={brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Submit line */}
          <polyline
            points={submitPts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3"
          />
          {/* Changelog markers */}
          {viewPts.map((pt, i) => {
            const entries = changelogByDate[pt.date];
            if (!entries?.length) return null;
            const cat = getCat(entries[0].category);
            return (
              <g key={i}>
                <line x1={pt.x} y1={0} x2={pt.x} y2={H} stroke={cat.color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                <circle cx={pt.x} cy={12} r="6" fill={cat.color} />
                <text x={pt.x} y="16" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">{entries.length}</text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-5 rounded" style={{ backgroundColor: brand }} />
            <span className="text-xs text-[#6B6B6B]">Aufrufe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 border-t-2 border-dashed" style={{ borderColor: '#059669' }} />
            <span className="text-xs text-[#6B6B6B]">Absendungen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: brand }} />
            <span className="text-xs text-[#9CA3AF]">Änderung</span>
          </div>
        </div>

        {/* Date labels */}
        {daily.length > 0 && (
          <div className="mt-1 flex justify-between text-[10px] text-[#9CA3AF]">
            <span>{daily[0].date}</span>
            <span>{daily[daily.length - 1].date}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Funnel Steps ──────────────────────────────────────────────────────────────
function FunnelSteps({ stepCounts, loading }: { stepCounts: FunnelCounts; loading: boolean }) {
  if (loading) return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" style={{ color: brand }} /></div>;
  const top = stepCounts['view'] || 1;
  return (
    <div className="space-y-2">
      {FUNNEL_STEPS.map((step, i) => {
        const count   = stepCounts[step.key] || 0;
        const pct     = Math.round((count / top) * 100);
        const prev    = i > 0 ? (stepCounts[FUNNEL_STEPS[i - 1].key] || 0) : count;
        const dropPct = prev > 0 && i > 0 ? Math.round(((prev - count) / prev) * 100) : 0;
        return (
          <div key={step.key} className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 shrink-0 text-center font-bold text-[#9CA3AF]">{i + 1}</span>
              <span className="flex-1 font-semibold text-[#2F2F2F]">{step.label}</span>
              {dropPct > 0 && <span className="text-[10px] font-medium text-[#DC2626]">−{dropPct}%</span>}
              <span className="w-12 text-right font-bold text-[#2F2F2F]">{count.toLocaleString('de-AT')}</span>
              <span className="w-9 text-right text-[#9CA3AF]">{pct}%</span>
            </div>
            <div className="h-6 w-full overflow-hidden rounded-[3px] bg-neutral-100">
              <div className="h-full rounded-[3px] transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: step.color, minWidth: count > 0 ? 4 : 0 }} />
            </div>
            {i < FUNNEL_STEPS.length - 1 && (
              <div className="pl-5 leading-none">
                <ArrowRight className="h-2.5 w-2.5 text-neutral-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Changelog Panel ───────────────────────────────────────────────────────────
function ChangelogPanel({ entries, onAdd, onDelete, loading }: {
  entries: ChangelogEntry[]; onAdd: (d: string, c: string) => void;
  onDelete: (id: string) => void; loading: boolean;
}) {
  const [desc, setDesc] = useState('');
  const submit = () => { if (!desc.trim()) return; onAdd(desc.trim(), 'general'); setDesc(''); };

  return (
    <div className="space-y-5">
      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text" value={desc} onChange={e => setDesc(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Änderung kurz beschreiben…"
          className="h-9 flex-1 rounded-[4px] border border-neutral-200 px-3 text-sm outline-none transition focus:border-[#884A4A]"
        />
        <button type="button" onClick={submit} disabled={!desc.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-[4px] text-white disabled:opacity-40 transition hover:opacity-90"
          style={{ backgroundColor: brand }}>
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Timeline entries */}
      {loading ? (
        <div className="flex h-16 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" style={{ color: brand }} /></div>
      ) : entries.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-neutral-200 py-8 text-center text-sm text-[#9CA3AF]">
          Noch keine Einträge.<br />
          <span className="text-xs">Logge deine erste Veränderung oben.</span>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-neutral-100" />

          <div className="space-y-1">
            {entries.map(entry => {
              const cat  = getCat(entry.category);
              const date = new Date(entry.created_at);
              return (
                <div key={entry.id} className="group relative flex gap-4 rounded-[4px] px-2 py-2.5 transition hover:bg-neutral-50">
                  {/* Icon dot */}
                  <div className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: cat.bg, borderColor: cat.color + '40' }}>
                    <GitCommit className="h-3.5 w-3.5" style={{ color: cat.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-snug text-[#1F2937]">{entry.description}</p>
                      <button type="button" onClick={() => onDelete(entry.id)}
                        className="shrink-0 opacity-0 transition group-hover:opacity-100 text-neutral-300 hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF]">
                      {date.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      {' · '}
                      {date.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const today     = new Date();
  const thirtyAgo = new Date(today.getTime() - 29 * 86400000);

  const [tab, setTab]   = useState<'pageviews' | 'funnel'>('pageviews');

  // Date range state (ISO string YYYY-MM-DD)
  const [fromDate, setFromDate] = useState(toDateInputVal(thirtyAgo));
  const [toDate, setToDate]     = useState(toDateInputVal(today));

  // Quick range buttons
  const RANGES = [
    { label: '7T',  days: 7 },
    { label: '30T', days: 30 },
    { label: '90T', days: 90 },
  ];
  const [activeRange, setActiveRange] = useState<number | null>(30);

  const setQuickRange = (days: number) => {
    const to   = new Date();
    const from = new Date(to.getTime() - (days - 1) * 86400000);
    setFromDate(toDateInputVal(from));
    setToDate(toDateInputVal(to));
    setActiveRange(days);
  };

  const handleCustomRange = (from: string, to: string) => {
    setFromDate(from); setToDate(to); setActiveRange(null);
  };

  // Pageview stats
  const [stats, setStats]     = useState<Stats | null>(null);
  const [pvLoading, setPvLoading] = useState(true);
  const [error, setError]     = useState('');

  // Funnel
  const [funnelCounts, setFunnelCounts] = useState<FunnelCounts>({});
  const [funnelDaily, setFunnelDaily]   = useState<FunnelDaily>([]);
  const [funnelLoading, setFunnelLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [quizList, setQuizList] = useState<{id:string;label:string}[]>([]);
  const [quizDropOpen, setQuizDropOpen] = useState(false);
  const quizDropRef = useRef<HTMLDivElement>(null);

  // Changelog
  const [changelog, setChangelog]   = useState<ChangelogEntry[]>([]);
  const [clLoading, setClLoading]   = useState(true);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{if(quizDropRef.current&&!quizDropRef.current.contains(e.target as Node))setQuizDropOpen(false);};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);

  const diffDays = Math.round((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000) + 1;

  const loadPageviews = useCallback(async () => {
    setPvLoading(true); setError('');
    try {
      const res  = await fetch(`/api/admin/pageview?from=${fromDate}&to=${toDate}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setStats(json);
    } catch (e: any) { setError(e.message); }
    finally { setPvLoading(false); }
  }, [fromDate, toDate]);

  const loadFunnel = useCallback(async () => {
    setFunnelLoading(true);
    try {
      const qParam = selectedQuizId && selectedQuizId !== 'all' ? `&quiz_id=${selectedQuizId}` : '';
      const res  = await fetch(`/api/admin/quiz-funnel?from=${fromDate}&to=${toDate}${qParam}`);
      const json = await res.json();
      if (json.ok) { setFunnelCounts(json.stepCounts || {}); setFunnelDaily(json.daily || []); }
    } catch {}
    finally { setFunnelLoading(false); }
  }, [fromDate, toDate, selectedQuizId]);

  const loadChangelog = async () => {
    setClLoading(true);
    try {
      const res  = await fetch('/api/admin/funnel-changelog');
      const json = await res.json();
      if (json.ok) setChangelog(json.data || []);
    } catch {}
    finally { setClLoading(false); }
  };

  useEffect(() => { loadPageviews(); loadFunnel(); }, [loadPageviews, loadFunnel]);
  useEffect(() => { loadChangelog(); }, []);
  useEffect(() => {
    fetch('/api/admin/quiz-configs').then(r=>r.json()).then(j=>{
      if(j.ok) {
        // Filter out quiz_* variant pages (CMS-created), only keep hardcoded/component quizzes
        const filtered = (j.data||[]).filter((q:any)=>!q.id.startsWith('quiz_'));
        setQuizList([{id:'all',label:'Alle Quizze'},...filtered]);
      }
    }).catch(()=>{});
  }, []);

  const addChangelog = async (description: string, category: string) => {
    try {
      const res  = await fetch('/api/admin/funnel-changelog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description, category }) });
      const json = await res.json();
      if (json.ok) setChangelog(prev => [json.data, ...prev]);
    } catch {}
  };

  const deleteChangelog = async (id: string) => {
    setChangelog(prev => prev.filter(e => e.id !== id));
    try { await fetch('/api/admin/funnel-changelog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); } catch {}
  };

  const TrendIcon  = !stats ? Minus : stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus;
  const trendColor = !stats ? '#6B6B6B' : stats.trend > 0 ? '#059669' : stats.trend < 0 ? '#DC2626' : '#6B6B6B';

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); * { font-family: 'Open Sans', sans-serif !important; }`}</style>
      <div className="space-y-5 pb-10">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Analytics</h1>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Seitenaufrufe, Quiz-Funnel und Optimierungsverlauf.</p>
          </div>
          {/* Date controls */}
          <div className="flex flex-wrap items-center gap-2">
            {RANGES.map(r => (
              <button key={r.days} onClick={() => setQuickRange(r.days)}
                className="rounded-[4px] px-3 py-1.5 text-sm font-semibold transition"
                style={{ backgroundColor: activeRange === r.days ? brand : '#F3F4F6', color: activeRange === r.days ? 'white' : '#4A4A4A' }}>
                {r.label}
              </button>
            ))}
            <DateRangePicker from={fromDate} to={toDate} onChange={handleCustomRange} />
            <button onClick={() => { loadPageviews(); loadFunnel(); }}
              className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] hover:bg-neutral-50">
              <RefreshCw className={`h-4 w-4 ${(pvLoading || funnelLoading) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* ── Tabs ── */}
        <div className="flex gap-1 rounded-[4px] border border-neutral-200 bg-neutral-50 p-1 w-fit">
          {([['pageviews', <Users key="u" className="h-4 w-4" />, 'Seitenaufrufe'], ['funnel', <BarChart2 key="b" className="h-4 w-4" />, 'Quiz Funnel']] as [string, React.ReactNode, string][]).map(([key, icon, label]) => (
            <button key={key} onClick={() => setTab(key as 'pageviews' | 'funnel')}
              className="flex items-center gap-1.5 rounded-[2px] px-3 py-1.5 text-sm font-semibold transition"
              style={{ backgroundColor: tab === key ? 'white' : 'transparent', color: tab === key ? brand : '#6B6B6B', boxShadow: tab === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* ══ Pageviews Tab ══════════════════════════════════════════════════ */}
        {tab === 'pageviews' && (
          pvLoading && !stats ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} /></div>
          ) : (
            <div className="space-y-4">
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Gesamt Aufrufe', value: stats?.total ?? 0,  sub: 'Alle Zeit' },
                  { label: 'Heute',          value: stats?.today ?? 0,  sub: 'Seit Mitternacht' },
                  { label: `${diffDays} Tage`, value: stats?.period ?? 0, sub: 'Im Zeitraum' },
                  { label: 'Trend (7 Tage)', value: stats?.trend != null ? `${stats.trend > 0 ? '+' : ''}${stats.trend}%` : '–', sub: 'vs. Vorwoche', trend: true },
                ].map(card => (
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

              {/* Sparkline */}
              <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-bold text-[#2F2F2F]">Aufrufe über Zeit</h2>
                  <span className="text-xs text-[#6B6B6B]">{diffDays} Tage</span>
                </div>
                {stats?.daily?.length ? (
                  <>
                    <Sparkline data={stats.daily} />
                    <div className="mt-1 flex justify-between text-[10px] text-[#6B6B6B]">
                      <span>{stats.daily[0]?.date}</span><span>{stats.daily[stats.daily.length - 1]?.date}</span>
                    </div>
                  </>
                ) : <p className="py-8 text-center text-sm text-[#6B6B6B]">Keine Daten im Zeitraum.</p>}
              </div>

              {/* Top pages + Devices */}
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
            </div>
          )
        )}

        {/* ══ Funnel Tab ═════════════════════════════════════════════════════ */}
        {tab === 'funnel' && (
          <div className="space-y-4">

            {/* ── Quiz Selector ── */}
            {quizList.length > 1 && (
              <div className="flex items-center gap-3 rounded-[4px] border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                <BarChart2 className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="text-sm font-semibold text-neutral-600">Quiz:</span>
                <div ref={quizDropRef} className="relative">
                  <button type="button" onClick={()=>setQuizDropOpen(v=>!v)}
                    className={`flex h-9 items-center gap-2 rounded-[4px] border bg-white pl-3 pr-2.5 text-sm font-medium text-neutral-700 shadow-sm transition min-w-[180px] ${quizDropOpen?'border-[#884A4A] ring-2 ring-[#884A4A]/10':'border-neutral-200 hover:border-neutral-300'}`}>
                    <span className="flex-1 truncate text-left">
                      {quizList.find(q=>q.id===selectedQuizId)?.label??'Alle Quizze'}
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${quizDropOpen?'rotate-180':''}`}/>
                  </button>
                  {quizDropOpen&&(
                    <div className="absolute left-0 top-full z-50 mt-1.5 min-w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
                      {quizList.map(q=>(
                        <button key={q.id} type="button"
                          onClick={()=>{setSelectedQuizId(q.id);setQuizDropOpen(false);}}
                          className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition ${selectedQuizId===q.id?'bg-[#FDF8F8] font-semibold text-[#884A4A]':'text-neutral-700 hover:bg-neutral-50'}`}>
                          {selectedQuizId===q.id&&<span className="h-1.5 w-1.5 rounded-full bg-[#884A4A] shrink-0"/>}
                          {selectedQuizId!==q.id&&<span className="h-1.5 w-1.5 rounded-full bg-transparent shrink-0"/>}
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-neutral-400 hidden md:block">Funnel-Daten werden nach Quiz gefiltert</span>
              </div>
            )}

            {/* ① Große Timeline mit KPIs + Änderungen */}
            <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-[#2F2F2F]">Verlauf & Kern-KPIs</h2>
                <span className="text-xs text-[#9CA3AF]">{diffDays} Tage</span>
              </div>
              {funnelLoading ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" style={{ color: brand }} /></div>
              ) : funnelDaily.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#9CA3AF]">
                  Noch keine Funnel-Daten.<br />
                  <span className="text-xs">Daten werden erfasst, sobald Besucher das Quiz nutzen.</span>
                </div>
              ) : (
                <FunnelTimeline daily={funnelDaily} changelog={changelog} funnelCounts={funnelCounts} />
              )}
            </div>

            {/* ② Schritt-für-Schritt Funnel */}
            <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-[#2F2F2F]">Schritt-für-Schritt Funnel</h2>
                <span className="text-xs text-[#9CA3AF]">{diffDays} Tage</span>
              </div>
              <FunnelSteps stepCounts={funnelCounts} loading={funnelLoading} />
            </div>

            {/* ③ Changelog */}
            <div className="rounded-[4px] border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" style={{ color: brand }} />
                <h2 className="font-bold text-[#2F2F2F]">Änderungs-Log</h2>
                {changelog.length > 0 && (
                  <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: brand }}>
                    {changelog.length}
                  </span>
                )}
                <span className="ml-auto text-xs text-[#9CA3AF]">Als Markierungen im Verlauf sichtbar</span>
              </div>
              <ChangelogPanel entries={changelog} onAdd={addChangelog} onDelete={deleteChangelog} loading={clLoading} />
            </div>

          </div>
        )}
      </div>
    </>
  );
}
