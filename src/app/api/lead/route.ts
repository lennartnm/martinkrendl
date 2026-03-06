// src/app/api/lead/route.ts
// Überschreibt die bestehende Route – speichert Leads jetzt AUCH in Supabase

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LeadIn = {
  ready?: string;
  experience?: string;
  lessonType?: string;
  name?: string;
  email?: string;
  phone?: string;
  hp?: string;
};

const WEBHOOK = 'https://hook.eu2.make.com/';

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function sanitize(s: unknown) {
  return String(s ?? '').trim().slice(0, 500);
}

export async function POST(req: NextRequest) {
  let body: LeadIn = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot → Bot
  if (body.hp) {
    return NextResponse.json({ ok: true, forwarded: false, bot: true }, { status: 204 });
  }

  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const phone = sanitize(body.phone);

  if (!name || !email || !isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 400 });
  }

  // UTM-Parameter
  const sp = req.nextUrl?.searchParams;
  const getUtm = (key: string) => sanitize(sp?.get(key));
  let utm_campaign = getUtm('utm_campaign');
  if (!utm_campaign) {
    const ref = req.headers.get('referer');
    try {
      if (ref) utm_campaign = sanitize(new URL(ref).searchParams.get('utm_campaign'));
    } catch {}
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  // ── 1. In Supabase speichern ──────────────────────────────────────────
  try {
    await supabase.from('leads').insert({
      name,
      email,
      phone: phone || null,
      ready: sanitize(body.ready) || null,
      experience: sanitize(body.experience) || null,
      lesson_type: sanitize(body.lessonType) || null,
      status: 'new',
      notes: '',
      utm_source: getUtm('utm_source') || null,
      utm_medium: getUtm('utm_medium') || null,
      utm_campaign: utm_campaign || null,
      ip,
    });
  } catch (e) {
    console.error('Supabase insert error:', e);
    // Fehler beim Speichern in Supabase → trotzdem weitermachen und Webhook versuchen
  }

  // ── 2. Make.com Webhook (wie bisher) ─────────────────────────────────
  let signal: AbortSignal | undefined;
  try {
    if (typeof (AbortSignal as any).timeout === 'function') {
      signal = (AbortSignal as any).timeout(10_000);
    } else {
      const controller = new AbortController();
      signal = controller.signal;
      setTimeout(() => controller.abort(), 10_000);
    }

    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'next-quiz',
        name,
        email,
        phone,
        ready: body.ready,
        experience: body.experience,
        lessonType: body.lessonType,
        meta: {
          ua: req.headers.get('user-agent') ?? undefined,
          ip,
          ts: new Date().toISOString(),
          utm: {
            source: getUtm('utm_source') || undefined,
            medium: getUtm('utm_medium') || undefined,
            campaign: utm_campaign || undefined,
          },
        },
      }),
      signal,
    });

    return NextResponse.json({ ok: res.ok, forwarded: true }, { status: res.ok ? 200 : 502 });
  } catch (e) {
    console.error('Webhook-Error', e);
    return NextResponse.json({ ok: false, forwarded: false }, { status: 502 });
  }
}
