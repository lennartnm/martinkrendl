// src/app/api/admin/pageview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAdminSession } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST: track a pageview (public, no auth required)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = body.page || '/';
    const referrer = body.referrer || req.headers.get('referer') || null;
    const ua = req.headers.get('user-agent') || '';

    // Simple device detection
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    const isTablet = /ipad|tablet/i.test(ua);
    const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    // Simple browser detection
    let browser = 'other';
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) browser = 'chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
    else if (/firefox/i.test(ua)) browser = 'firefox';
    else if (/edge/i.test(ua)) browser = 'edge';

    await supabase.from('pageviews').insert({
      page,
      referrer,
      device,
      browser,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// GET: analytics data (admin only)
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const prevSince = new Date(Date.now() - days * 2 * 86400000).toISOString();

  try {
    // Total all time
    const { count: total } = await supabase.from('pageviews').select('*', { count: 'exact', head: true });

    // Today
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const { count: today } = await supabase.from('pageviews').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString());

    // Period
    const { count: period } = await supabase.from('pageviews').select('*', { count: 'exact', head: true }).gte('created_at', since);

    // Prev 7 days for trend
    const week1Since = new Date(Date.now() - 7 * 86400000).toISOString();
    const week2Since = new Date(Date.now() - 14 * 86400000).toISOString();
    const { count: w1 } = await supabase.from('pageviews').select('*', { count: 'exact', head: true }).gte('created_at', week1Since);
    const { count: w2 } = await supabase.from('pageviews').select('*', { count: 'exact', head: true }).gte('created_at', week2Since).lt('created_at', week1Since);
    const trend = w2 && w2 > 0 ? Math.round(((w1! - w2) / w2) * 100) : 0;

    // Daily breakdown
    const { data: rawDaily } = await supabase
      .from('pageviews').select('created_at').gte('created_at', since).order('created_at');

    const dailyMap: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
      dailyMap[key] = 0;
    }
    for (const row of rawDaily || []) {
      const key = new Date(row.created_at).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
      if (key in dailyMap) dailyMap[key]++;
    }
    const daily = Object.entries(dailyMap).map(([date, views]) => ({ date, views }));

    // Top pages
    const { data: rawPages } = await supabase.from('pageviews').select('page').gte('created_at', since);
    const pageMap: Record<string, number> = {};
    for (const r of rawPages || []) { const p = r.page || '/'; pageMap[p] = (pageMap[p] || 0) + 1; }
    const topPages = Object.entries(pageMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([path, views]) => ({ path, views }));

    // Devices
    const { data: rawDevices } = await supabase.from('pageviews').select('device').gte('created_at', since);
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    for (const r of rawDevices || []) {
      const d = r.device as 'mobile' | 'desktop' | 'tablet';
      if (d in devices) devices[d]++;
    }

    return NextResponse.json({ ok: true, total: total || 0, today: today || 0, period: period || 0, trend, daily, topPages, devices });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
