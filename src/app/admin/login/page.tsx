'use client';

// src/app/admin/login/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const brand = '#884A4A';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        setError('E-Mail oder Passwort falsch.');
      }
    } catch {
      setError('Verbindungsfehler. Bitte nochmal versuchen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: '#F7F4F4' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[4px]"
            style={{ backgroundColor: brand }}
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold" style={{ color: '#2F2F2F' }}>
            MARTIN KRENDL
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="rounded-[4px] border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold" style={{ color: '#2F2F2F' }}>
            Anmelden
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
                placeholder="admin@martinkrendl.at"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#4A4A4A]">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-sm text-[#2F2F2F] outline-none transition focus:border-[#884A4A]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-[4px] text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: brand }}
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#6B6B6B]">
          Nur für autorisierte Nutzer
        </p>
      </div>
    </div>
  );
}
