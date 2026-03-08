'use client';
// src/app/admin/reset-password/page.tsx

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const brand = '#884A4A';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [phase, setPhase] = useState<'loading'|'valid'|'invalid'|'success'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { setPhase('invalid'); return; }
    fetch('/api/admin/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', token }),
    }).then(r => r.json()).then(j => {
      if (j.valid) { setEmail(j.email || ''); setPhase('valid'); }
      else setPhase('invalid');
    }).catch(() => setPhase('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Das Passwort muss mindestens 8 Zeichen lang sein.'); return; }
    if (password !== confirm) { setError('Die Passwörter stimmen nicht überein.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token, password }),
      });
      const json = await res.json();
      if (json.ok) { setPhase('success'); }
      else {
        const msgs: Record<string, string> = {
          invalid_or_expired_token: 'Dieser Link ist abgelaufen oder ungültig.',
          password_too_short: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
        };
        setError(msgs[json.error] || 'Fehler beim Zurücksetzen. Bitte nochmal versuchen.');
      }
    } catch { setError('Verbindungsfehler.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: '#F7F4F4' }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[4px]" style={{ backgroundColor: brand }}>
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#2F2F2F' }}>MARTIN KRENDL</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Admin Panel</p>
        </div>

        <div className="rounded-[4px] border border-neutral-200 bg-white p-8 shadow-sm">
          {phase === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200" style={{ borderTopColor: brand }} />
            </div>
          )}

          {phase === 'invalid' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-neutral-800">Link ungültig</h2>
              <p className="mb-6 text-sm text-neutral-500">Dieser Reset-Link ist abgelaufen oder ungültig. Bitte fordere einen neuen an.</p>
              <a href="/admin/login" className="inline-block rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: brand }}>
                Zurück zur Anmeldung
              </a>
            </div>
          )}

          {phase === 'valid' && (
            <>
              <h2 className="mb-2 text-xl font-bold" style={{ color: '#2F2F2F' }}>Neues Passwort setzen</h2>
              {email && <p className="mb-6 text-sm text-neutral-500">Für: <strong>{email}</strong></p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">Neues Passwort</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                    className="h-11 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
                    placeholder="Mindestens 8 Zeichen" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">Passwort bestätigen</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                    className="h-11 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
                    placeholder="Passwort wiederholen" />
                </div>
                <div className="rounded-[4px] bg-neutral-50 border border-neutral-100 px-3 py-2 text-xs text-neutral-500">
                  Mindestens 8 Zeichen · Verwende Buchstaben, Zahlen und Sonderzeichen
                </div>
                {error && <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <button type="submit" disabled={saving}
                  className="mt-2 h-11 w-full rounded-[4px] text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: brand }}>
                  {saving ? 'Wird gespeichert...' : 'Passwort speichern'}
                </button>
              </form>
            </>
          )}

          {phase === 'success' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-neutral-800">Passwort geändert</h2>
              <p className="mb-6 text-sm text-neutral-500">Dein Passwort wurde erfolgreich gesetzt. Du kannst dich jetzt anmelden.</p>
              <button onClick={() => router.push('/admin/login')}
                className="inline-block w-full rounded-[4px] px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: brand }}>
                Zur Anmeldung
              </button>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-[#6B6B6B]">Nur für autorisierte Nutzer</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F7F4F4' }}><div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200" style={{ borderTopColor: '#884A4A' }} /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
