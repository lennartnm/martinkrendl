// app/api/lead/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LeadIn = {
  // Vom Quiz
  partyType?: string;
  partyDate?: string;
  zipCode?: string;

  // Kontakt
  name?: string;
  email?: string;
  phone?: string;

  // optionales Honeypot-Feld
  hp?: string;

  // evtl. alte Felder von früheren Formularen (werden unten befüllt, für Zap-Rückwärtskompatibilität)
  option?: string;
  timeframe?: string;
  bundesland?: string;
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

  // Honeypot -> Bot
  if (body.hp) {
    return NextResponse.json({ ok: true, forwarded: false, bot: true }, { status: 204 });
  }

  // Payload übernehmen & sanitisieren
  const payload: LeadIn = {
    partyType: sanitize(body.partyType),
    partyDate: sanitize(body.partyDate),
    zipCode: sanitize(body.zipCode),
    name: sanitize(body.name),
    email: sanitize(body.email),
    phone: sanitize(body.phone),

    // Rückwärtskompatible Keys für bestehende Zaps
    option: sanitize(body.partyType),
    timeframe: sanitize(body.partyDate),
    bundesland: sanitize(body.zipCode),
  };

  // Minimal-Validierung
  if (!payload.name || !payload.email || !isValidEmail(payload.email)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'validation',
        fields: { name: !!payload.name, email: isValidEmail(payload.email || '') },
      },
      { status: 400 }
    );
  }

  // 🔎 UTM-Parameter einsammeln (Query + Referer-Fallback)
  const sp = req.nextUrl?.searchParams;
  const getUtm = (key: string) => sanitize(sp?.get(key));
  let utm_campaign = getUtm('utm_campaign');

  if (!utm_campaign) {
    const ref = req.headers.get('referer');
    try {
      if (ref) {
        const refParams = new URL(ref).searchParams;
        utm_campaign = sanitize(refParams.get('utm_campaign'));
      }
    } catch {
      // ignore invalid referer
    }
  }

  const utm = {
    source: getUtm('utm_source') || undefined,
    medium: getUtm('utm_medium') || undefined,
    campaign: utm_campaign || undefined,
    term: getUtm('utm_term') || undefined,
    content: getUtm('utm_content') || undefined,
  };

  // Timeout-Handling für den Webhook
  let controller: AbortController | undefined;
  let signal: AbortSignal | undefined;
  if (typeof (AbortSignal as any).timeout === 'function') {
    signal = (AbortSignal as any).timeout(10_000);
  } else {
    controller = new AbortController();
    signal = controller.signal;
    setTimeout(() => controller?.abort(), 10_000);
  }

  try {
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'next-quiz',
        ...payload, // enthält neue und kompatible Felder
        meta: {
          ua: req.headers.get('user-agent') ?? undefined,
          ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined,
          ts: new Date().toISOString(),
          utm,
        },
      }),
      signal,
    });

    const ok = res.ok;
    return NextResponse.json({ ok, forwarded: true }, { status: ok ? 200 : 502 });
  } catch (e) {
    console.error('Webhook-Error', e);
    return NextResponse.json({ ok: false, forwarded: false }, { status: 502 });
  }
}
