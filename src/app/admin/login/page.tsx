'use client';
// src/app/admin/login/page.tsx — Enhanced login with password reset

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const brand = '#884A4A';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login'|'forgot'|'forgot_sent'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [fontStyle, setFontStyle] = useState('');

  // Load the same global font used in the admin panel
  useEffect(() => {
    fetch('/api/admin/font-settings').then(r => r.json()).then(j => {
      const font = j.font || 'Open Sans';
      const url = j.url || `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800&display=swap`;
      setFontStyle(`@import url('${url}'); * { font-family: '${font}', sans-serif !important; }`);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
      if (res.ok) { router.push('/admin'); } else { setError('E-Mail oder Passwort falsch.'); }
    } catch { setError('Verbindungsfehler. Bitte nochmal versuchen.'); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/password-reset', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({action:'request',email:resetEmail}) });
      const json = await res.json();
      if (json.ok) {
        setResetToken(json.reset_token || '');
        setMode('forgot_sent');
      } else { setError('Fehler beim Zurücksetzen.'); }
    } catch { setError('Verbindungsfehler.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{backgroundColor:'#F7F4F4'}}>
      {fontStyle && <style>{fontStyle}</style>}
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[4px]" style={{backgroundColor:brand}}>
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold" style={{color:'#2F2F2F'}}>MARTIN KRENDL</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Admin Panel</p>
        </div>

        <div className="rounded-[4px] border border-neutral-200 bg-white p-8 shadow-sm">
          {mode === 'login' && (
            <>
              <h2 className="mb-6 text-xl font-bold" style={{color:'#2F2F2F'}}>Anmelden</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">E-Mail</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="h-11 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]" placeholder="admin@martinkrendl.at"/>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">Passwort</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="h-11 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]" placeholder="••••••••"/>
                </div>
                {error && <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <button type="submit" disabled={loading} className="mt-2 h-11 w-full rounded-[4px] text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60" style={{backgroundColor:brand}}>
                  {loading ? 'Anmelden...' : 'Anmelden'}
                </button>
              </form>
              <button type="button" onClick={()=>{setMode('forgot');setError('');setResetEmail('');}} className="mt-4 w-full text-center text-sm text-[#884A4A] hover:underline">
                Passwort vergessen?
              </button>
              <div className="mt-4 rounded-[4px] border border-neutral-100 bg-neutral-50 px-4 py-3">
                <p className="text-xs text-neutral-500 font-semibold mb-1">Erstmalige Anmeldung?</p>
                <p className="text-xs text-neutral-400">Dein Passwort wird vom Administrator gesetzt. Danach kannst du es unter Einstellungen ändern.</p>
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="mb-2 text-xl font-bold" style={{color:'#2F2F2F'}}>Passwort zurücksetzen</h2>
              <p className="mb-6 text-sm text-neutral-500">Gib deine E-Mail-Adresse ein. Du erhältst einen Reset-Token vom Administrator.</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">E-Mail</label>
                  <input type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} required className="h-11 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-[#884A4A]" placeholder="deine@email.at"/>
                </div>
                {error && <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <button type="submit" disabled={loading} className="h-11 w-full rounded-[4px] text-sm font-semibold text-white disabled:opacity-60" style={{backgroundColor:brand}}>
                  {loading ? 'Wird gesendet...' : 'Reset anfordern'}
                </button>
              </form>
              <button type="button" onClick={()=>{setMode('login');setError('');}} className="mt-4 w-full text-center text-sm text-neutral-500 hover:underline">← Zurück zur Anmeldung</button>
            </>
          )}

          {mode === 'forgot_sent' && (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mx-auto">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h2 className="mb-2 text-center text-xl font-bold" style={{color:'#2F2F2F'}}>Anfrage eingegangen</h2>
              <p className="text-center text-sm text-neutral-500 mb-4">Der Reset-Token wurde generiert. Wende dich an deinen Administrator, um das neue Passwort zu setzen, oder nutze folgenden Link:</p>
              {resetToken && (
                <div className="rounded-[4px] bg-neutral-50 border border-neutral-200 p-3 text-center">
                  <a href={`/admin/reset-password?token=${resetToken}`} className="text-sm font-semibold text-[#884A4A] hover:underline">
                    Passwort jetzt ändern →
                  </a>
                </div>
              )}
              <button type="button" onClick={()=>{setMode('login');setError('');}} className="mt-4 w-full text-center text-sm text-neutral-500 hover:underline">← Zurück zur Anmeldung</button>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-[#6B6B6B]">Nur für autorisierte Nutzer</p>
      </div>
    </div>
  );
}
