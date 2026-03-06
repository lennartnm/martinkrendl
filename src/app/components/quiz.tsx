'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

// -------------------- Micro-Confirmation --------------------
function MicroConfirmation({
  tone = 'blue',
  title,
  subtitle,
}: {
  tone?: 'blue' | 'green';
  title: string;
  subtitle?: string;
}) {
  const tones =
    tone === 'green'
      ? { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-800' }
      : { border: 'border-[#3266AF33]', bg: 'bg-[#EAF2FF]', text: 'text-[#153965]' };

  return (
    <div
      className={[
        'mx-auto',
        'max-w-full',
        'inline-flex',
        'flex-wrap',
        'items-center',
        'justify-center',
        'rounded-full',
        'border',
        tones.border,
        tones.bg,
        'px-3', 'sm:px-4', // <— mobiler etwas weniger Padding
        'py-2',
        'shadow-sm',
        'min-w-0',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <span
        className={[
          'text-sm',
          'sm:text-base',
          'font-medium',
          tones.text,
          'text-center',
          'break-words',
          'min-w-0',
        ].join(' ')}
      >
        {title}
      </span>

      {subtitle && (
        <span
          className={[
            'text-xs',
            'sm:text-sm',
            'text-gray-600',
            'text-center',
            'sm:ml-2',
            'basis-full',
            'sm:basis-auto',
            'mt-1',
            'sm:mt-0',
            'break-words',
            'min-w-0',
          ].join(' ')}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

// -------------------- Optionen --------------------
const PARTY_DATE_OPTIONS = [
  { title: 'In den nächsten 4 Wochen', detail: 'Kurzfristige Planung' },
  { title: '1-3 Monate', detail: 'Etwas mehr Vorlaufzeit' },
  { title: 'Nach 3 Monaten', detail: 'Längerfristig geplant' },
  { title: 'Weiß ich noch nicht', detail: 'Noch unentschlossen' },
];

const PARTY_TYPE_OPTIONS = [
  { title: 'Geburtstag', detail: 'Ein besonderes Jubiläum', icon: '🎂' },
  { title: 'Hochzeit', detail: 'Der schönste Tag im Leben', icon: '💍' },
  { title: 'Firmenfeier', detail: 'Mitarbeiter oder Kunden Event', icon: '🏢' },
  { title: 'Sonstige', detail: 'z.B. Taufe, Weihnachtsfeier', icon: '🎉' },
];

type Answers = {
  ready?: 'Ja' | 'Nein';
  partyDate?: string;
  partyType?: string;
  zipCode?: string;
  name?: string;
  email?: string;
  phone?: string;
};

export default function Quiz() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [checking, setChecking] = useState(false);
  const sentLeadRef = useRef(false);
  const [zipCodeInput, setZipCodeInput] = useState('');

  const next = (data: Partial<Answers>) => {
    setAnswers((a) => ({ ...a, ...data }));
    if (step === 0 || step === 1 || step === 2) {
      setStep((s) => ((s + 1) as 0 | 1 | 2 | 3 | 4 | 5));
    }
  };

  // Zurück-Logik inkl. Fix für Step 5
  const back = () => {
    if (checking) {
      setChecking(false);
      setStep(3);
    } else if (step === 5) {
      setStep(3);
    } else {
      setStep((s) => (s > 0 ? ((s - 1) as 0 | 1 | 2 | 3 | 4 | 5) : 0));
    }
  };

  const nextFromZipCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (zipCodeInput.trim() === '') {
      alert('Bitte geben Sie Ihre PLZ ein.');
      return;
    }
    setAnswers((a) => ({ ...a, zipCode: zipCodeInput.trim() }));
    setChecking(true);
    setStep(4);
    setTimeout(() => {
      setChecking(false);
      setStep(5);
    }, 2000);
  };

  // WICHTIG: onSubmit verwenden, damit auch State-Werte mitgeschickt werden
  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload: Required<Pick<Answers, 'name' | 'email' | 'phone'>> &
      Pick<Answers, 'partyType' | 'partyDate' | 'zipCode' | 'ready'> = {
      ready: answers.ready ?? (String(form.get('ready') || '').trim() as 'Ja' | 'Nein' | undefined),
      partyType: answers.partyType ?? String(form.get('partyType') || '').trim(),
      partyDate: answers.partyDate ?? String(form.get('partyDate') || '').trim(),
      zipCode: answers.zipCode ?? String(form.get('zipCode') || '').trim(),
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
    };

    if (!payload.name || !payload.email || !payload.phone) {
      alert('Bitte fülle alle Felder aus.');
      return;
    }

    // fbq Event nur einmal senden
    if (!sentLeadRef.current) {
      try {
        (window as any).fbq?.('track', 'Lead', payload);
        sentLeadRef.current = true;
      } catch {}
    }

    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // optional: Fehler-Logging
    }

    window.location.href = '/danke';
  };

  return (
    <div className="quiz max-w-4xl mx-auto px-3 sm:px-4 space-y-4">
      {/* Micro-Confirmations für Steps 1, 2 & 3 */}
      {step === 1 && (
        <div className="flex justify-center">
          <MicroConfirmation
            tone="blue"
            title="Klingt gut – nur noch zwei kurze Fragen."
            subtitle="Das hilft uns, das beste Angebot zu finden."
          />
        </div>
      )}
      {step === 2 && (
        <div className="flex justify-center">
          <MicroConfirmation
            tone="blue"
            title="Super – gleich sind wir durch."
            subtitle="Wann ungefähr willst Du feiern?"
          />
        </div>
      )}
      {step === 3 && !checking && (
        <div className="flex justify-center">
          <MicroConfirmation
            tone="blue"
            title="Perfekt!"
            subtitle="Das ist die letzte Frage"
          />
        </div>
      )}
      {/* Grüne Micro-Confirmation auf der Kontaktseite */}
      {step === 5 && (
        <div className="flex justify-center">
          <MicroConfirmation
            tone="green"
            title="Das klingt super!"
            subtitle="Eine Fotobox wird Deine Gäste mit Sicherheit beeindrucken."
          />
        </div>
      )}

      <div className="flex items-center justify-center">
        <h3 className="text-center text-xl font-semibold sm:text-2xl text-[#3B3B3B]">
          {step === 0 && 'Bereit Deinen Gästen unvergessliche Erinnerungen zu bereiten?'}
          {step === 1 && 'Um was für eine Party handelt es sich?'}
          {step === 2 && 'Wann steigt Deine Party?'}
          {step === 3 && 'Wo steigt die Party?'}
          {step === 4 && 'Deine Antworten werden ausgewertet ...'}
          {step === 5 && 'Wohin dürfen wir Dir unverbindlich & kostenlos mehr Informationen senden?'}
        </h3>
      </div>

      {/* Schritt 0 – Einstiegsfrage (👍/👎 neben Ja/Nein) */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
            <button
              onClick={() => next({ ready: 'Ja' })}
              className="group h-36 md:h-40 w-full flex flex-col items-center justify-center rounded-lg border border-[#3B3B3B]/30 bg-white p-3 sm:p-4 text-center shadow-sm transition hover:border-[#3B3B3B] active:scale-[0.98]"
            >
              {/* fester Zeilenblock für gleiche Höhe */}
              <div className="flex items-center justify-center gap-2 h-7">
                <span className="text-lg font-semibold text-[#3B3B3B] leading-none">Ja</span>
                <span className="text-2xl leading-none select-none translate-y-[1px]" aria-hidden>👍</span>
              </div>
              <div className="mt-2 text-xs text-gray-600 max-w-[90%] leading-snug">
                Deine Feier wird einmalig.
              </div>
            </button>

            <button
              onClick={() => next({ ready: 'Nein' })}
              className="group h-36 md:h-40 w-full flex flex-col items-center justify-center rounded-lg border border-[#3B3B3B]/30 bg-white p-3 sm:p-4 text-center shadow-sm transition hover:border-[#3B3B3B] active:scale-[0.98]"
            >
              {/* fester Zeilenblock für gleiche Höhe */}
              <div className="flex items-center justify-center gap-2 h-7">
                <span className="text-lg font-semibold text-[#3B3B3B] leading-none">Nein</span>
                <span className="text-2xl leading-none select-none translate-y-[1px]" aria-hidden>👎</span>
              </div>
              <div className="mt-2 text-xs text-gray-600 max-w-[90%] leading-snug">
                Ich bin mir noch nicht sicher ..
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Schritt 4 – Ladeanimation */}
      {step === 4 && checking && (
        <div className="mx-auto flex flex-col items-center gap-4 rounded-lg border border-[#3B3B3B]/30 bg-white p-6 text-center max-w-md">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#3B3B3B]" />
          <p className="text-sm text-gray-700">Aktuelle Kapazität wird geprüft ...</p>
        </div>
      )}

      {/* Schritt 1 – Party Typ */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
            {PARTY_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.title}
                onClick={() => next({ partyType: opt.title })}
                className="group h-36 md:h-40 w-full flex flex-col items-center justify-center rounded-lg border border-[#3B3B3B]/30 bg-white p-3 sm:p-4 text-center shadow-sm transition hover:border-[#3B3B3B] active:scale-[0.98]"
              >
                <span className="text-4xl mb-2 leading-none select-none flex-shrink-0" aria-hidden>
                  {opt.icon}
                </span>
                <div className="text-lg font-semibold text-[#3B3B3B] mb-1 leading-tight">
                  {opt.title}
                </div>
                <div className="text-xs text-gray-600 max-w-[90%] leading-snug">
                  {opt.detail}
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={back}
              type="button"
              className="mt-2 text-sm underline underline-offset-4 text-gray-600 hover:text-[#3B3B3B]"
            >
              Zurück
            </button>
          </div>
        </div>
      )}

      {/* Schritt 2 – Party Datum */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
            {PARTY_DATE_OPTIONS.map((opt) => (
              <button
                key={opt.title}
                onClick={() => next({ partyDate: opt.title })}
                className="group h-36 md:h-40 w-full flex flex-col items-center justify-center rounded-lg border border-[#3B3B3B]/30 bg-white p-3 sm:p-4 text-center shadow-sm transition hover:border-[#3B3B3B] active:scale-[0.98]"
              >
                <div className="text-lg font-semibold text-[#3B3B3B] mb-1 leading-tight">
                  {opt.title}
                </div>
                <div className="text-xs text-gray-600 max-w-[90%] leading-snug">
                  {opt.detail}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={back}
              type="button"
              className="mt-2 text-sm underline underline-offset-4 text-gray-600 hover:text-[#3B3B3B]"
            >
              Zurück
            </button>
          </div>
        </div>
      )}

      {/* Schritt 3 – PLZ */}
      {step === 3 && (
        <div className="space-y-3">
          <form onSubmit={nextFromZipCode} className="mx-auto max-w-sm space-y-3">
            <input
              className="h-12 w-full rounded-lg border border-[#3B3B3B]/30 bg-white px-3 sm:px-4 text-center"
              type="text"
              pattern="[0-9]{4}"
              value={zipCodeInput}
              onChange={(e) => setZipCodeInput(e.target.value)}
              placeholder="Deine PLZ (z.B. 5020)"
              required
            />

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#3b3b3b] text-white hover:bg-[#3b3b3b]/90 active:bg-[#3b3b3b]/95"
            >
              Zum nächsten Schritt →
            </Button>

            <div className="flex justify-center">
              <button
                onClick={back}
                type="button"
                className="mt-2 text-sm underline underline-offset-4 text-gray-600 hover:text-[#3B3B3B]"
              >
                Zurück
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schritt 5 – Kontaktdaten */}
      {step === 5 && (
        <div className="space-y-3">
          {/* WICHTIG: onSubmit statt action */}
          <form onSubmit={submitLead} className="mx-auto max-w-3xl space-y-3 text-center">
            {/* Optional: Hidden-Felder als Fallback */}
            <input type="hidden" name="ready" value={answers.ready || ''} />
            <input type="hidden" name="partyType" value={answers.partyType || ''} />
            <input type="hidden" name="partyDate" value={answers.partyDate || ''} />
            <input type="hidden" name="zipCode" value={answers.zipCode || ''} />
            {/* Honeypot gegen Bots (API unterstützt 'hp') */}
            <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="hidden" />

            <div className="grid gap-3 sm:grid-cols-3">
              <input
                className="h-12 rounded-lg border border-[#3b3b3b]/30 bg-white px-3 sm:px-4"
                name="name"
                placeholder="Dein Name"
                required
              />
              <input
                className="h-12 rounded-lg border border-[#3b3b3b]/30 bg-white px-3 sm:px-4"
                type="email"
                name="email"
                placeholder="Deine E-Mail-Adresse"
                required
              />
              <input
                className="h-12 rounded-lg border border-[#3b3b3b]/30 bg-white px-3 sm:px-4"
                type="tel"
                name="phone"
                placeholder="Deine Telefonnummer"
                required
                pattern="^[0-9+()\\s-]{6,}$"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#3b3b3b] text-white transition-none hover:bg-[#3b3b3b] active:bg-[#3b3b3b]"
            >
             Kostenlos mehr Informationen erhalten
            </Button>

            <p className="text-center text-sm text-gray-500">
              Mit dem Absenden erklärst Du Dich mit der Verarbeitung Deiner Angaben einverstanden.
            </p>

            <div className="flex justify-center">
              <button
                onClick={back}
                type="button"
                className="mt-2 text-sm underline underline-offset-4 text-gray-600 hover:text-[#3b3b3b]"
              >
                Zurück
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
