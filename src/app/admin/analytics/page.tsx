'use client';
// src/app/admin/analytics/page.tsx

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Users, Monitor, Smartphone, Tablet, Loader2, RefreshCw, Info } from 'lucide-react';

const brand = '#884A4A';

type DailyEntry = { date: string; views: number };
type PageEntry  = { path: string; views: number };
type Devices    = { mobile: number; desktop: number; tablet: number };

type Stats = {
  total: number;
  today: number;
  period: number;
  trend: number;
  daily: DailyEntry[];
  topPages: PageEntry[];
  devices: Devices;
};

const RANGES = [
  { label: '7 Tage',  days: 7 },
  { label: '30 Tage', days: 30 },
  { label: '90 Tage', days: 90 },
];

// Sparkline mini-chart
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

// Bar chart for top pages
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

// Device Donut
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
              const el = (
                <circle key={item.label} cx="18" cy="18" r="15.9155"
                  fill="none" stroke={item.color} strokeWidth="3.5"
                  strokeDasharray={`${dash} ${circ - dash}`}
                  strokeDashoffset={-cum * circ / 100} />
              );
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

export default function AnalyticsPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [days, setDays]     = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async (d: number) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/admin/pageview?days=${d}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setStats(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(days); }, [days]);

  const TrendIcon = !stats ? Minus : stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus;
  const trendColor = !stats ? '#6B6B6B' : stats.trend > 0 ? '#059669' : stats.trend < 0 ? '#DC2626' : '#6B6B6B';

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap'); * { font-family: 'Open Sans', sans-serif !important; }`}</style>

      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2F2F2F]">Analytics</h1>
            <p className="mt-0.5 text-sm text-[#6B6B6B]">Seitenaufrufe deiner Website – datenschutzfreundlich, kein Cookie nötig.</p>
          </div>
          <div className="flex items-center gap-2">
            {RANGES.map((r) => (
              <button key={r.days} onClick={() => setDays(r.days)}
                className="rounded-[4px] px-3 py-1.5 text-sm font-semibold transition"
                style={{
                  backgroundColor: days === r.days ? brand : '#F3F4F6',
                  color: days === r.days ? 'white' : '#4A4A4A',
                }}>
                {r.label}
              </button>
            ))}
            <button onClick={() => load(days)}
              className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-neutral-200 text-[#6B6B6B] hover:bg-neutral-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {loading && !stats ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: brand }} />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Gesamt Aufrufe', value: stats?.total ?? 0, sub: 'Alle Zeit' },
                { label: 'Heute',          value: stats?.today ?? 0, sub: 'Seit Mitternacht' },
                { label: `Letzte ${days} Tage`, value: stats?.period ?? 0, sub: 'Im gewählten Zeitraum' },
                { label: 'Trend (7 Tage)', value: stats?.trend != null ? `${stats.trend > 0 ? '+' : ''}${stats.trend}%` : '–', sub: 'vs. vorherige 7 Tage', trend: true },
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

            {/* Setup Info */}
            <div className="rounded-[4px] border border-blue-100 bg-blue-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <Info className="h-4 w-4 shrink-0" />
                Tracking einrichten
              </p>
              <p className="mt-1 pl-6 text-xs text-blue-600">
                Damit Seitenaufrufe erfasst werden, muss in <code className="rounded bg-blue-100 px-1">src/app/layout.tsx</code> ein
                einmaliger Fetch-Aufruf zu <code className="rounded bg-blue-100 px-1">/api/admin/pageview</code> eingebaut werden.
                Das Tracking läuft ohne Cookies und ist DSGVO-konform.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
