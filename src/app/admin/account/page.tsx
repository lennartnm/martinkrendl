'use client';
// src/app/admin/account/page.tsx

import { useState } from 'react';
import { KeyRound, CheckCircle, AlertCircle, Loader2, User, Shield } from 'lucide-react';

const brand = '#884A4A';

export default function AccountPage() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError(''); setSuccess('');
    if (!currentPw || !newPw || !confirmPw) { setError('Bitte alle Felder ausfüllen.'); return; }
    if (newPw !== confirmPw) { setError('Neues Passwort und Bestätigung stimmen nicht überein.'); return; }
    if (newPw.length < 8) { setError('Das neue Passwort muss mindestens 8 Zeichen lang sein.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change', current_password: currentPw, new_password: newPw }),
      });
      const json = await res.json();
      if (!json.ok) { setError(json.error || 'Fehler beim Ändern des Passworts.'); return; }
      setSuccess('Passwort wurde erfolgreich geändert.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch {
      setError('Ein Fehler ist aufgetreten. Bitte erneut versuchen.');
    } finally { setSaving(false); }
  };

  const strength = newPw.length === 0 ? 0 : newPw.length < 8 ? 1 : newPw.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Schwach', 'Mittel', 'Stark'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981'];

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-800">Account-Einstellungen</h1>
        <p className="mt-0.5 text-sm text-neutral-400">Passwort und Sicherheitseinstellungen verwalten.</p>
      </div>

      {/* Account Info */}
      <div className="rounded-[4px] border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: brand + '20' }}>
            <User className="h-4 w-4" style={{ color: brand }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">Administrator</p>
            <p className="text-xs text-neutral-400">Vollzugriff auf alle Bereiche</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: '#10B98120', color: '#10B981' }}>
            <Shield className="h-3 w-3" /> Aktiv
          </div>
        </div>
        <div className="rounded-[4px] bg-neutral-50 border border-neutral-100 px-4 py-3 text-sm text-neutral-500">
          Die E-Mail-Adresse und der Benutzername werden über Supabase verwaltet.
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-[4px] border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
          <KeyRound className="h-4 w-4 text-neutral-400" />
          <h2 className="text-sm font-bold text-neutral-800">Passwort ändern</h2>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            <button className="ml-auto underline text-xs" onClick={() => setError('')}>OK</button>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">AKTUELLES PASSWORT</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 text-sm outline-none focus:border-[#884A4A] transition" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">NEUES PASSWORT</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="Mindestens 8 Zeichen" autoComplete="new-password"
              className="h-10 w-full rounded-[4px] border border-neutral-200 px-3 text-sm outline-none focus:border-[#884A4A] transition" />
            {newPw.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                      style={{ backgroundColor: i <= strength ? strengthColor[strength] : '#E5E7EB' }} />
                  ))}
                </div>
                <span className="text-xs font-semibold" style={{ color: strengthColor[strength] }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">NEUES PASSWORT BESTÄTIGEN</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="Passwort wiederholen" autoComplete="new-password"
              className={`h-10 w-full rounded-[4px] border px-3 text-sm outline-none transition ${
                confirmPw && confirmPw !== newPw ? 'border-red-300 focus:border-red-400' :
                confirmPw && confirmPw === newPw ? 'border-emerald-300 focus:border-emerald-400' :
                'border-neutral-200 focus:border-[#884A4A]'
              }`} />
          </div>
        </div>

        <button onClick={handleChangePassword} disabled={saving || !currentPw || !newPw || !confirmPw}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[4px] text-sm font-semibold text-white disabled:opacity-40 transition"
          style={{ backgroundColor: brand }}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Wird gespeichert...</> : <><KeyRound className="h-4 w-4" /> Passwort ändern</>}
        </button>
      </div>
    </div>
  );
}
