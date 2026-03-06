'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { MapPin, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const brand = '#884A4A';
const graphite = '#2F2F2F';
const lightGray = '#6B6B6B';

type Answers = {
  ready?: 'Ja, ich bin gespannt' | 'Noch unsicher';
  experience?:
    | 'Ja, im Kirchenchor'
    | 'Ja, in der Band'
    | 'Sonstige Erfahrung'
    | 'Noch keine Erfahrung';
  lessonType?: 'Vor-Ort Unterricht' | 'Online-Unterricht';
  name?: string;
  email?: string;
  phone?: string;
};

const question1Options = [
  {
    value: 'Ja, ich bin gespannt' as const,
    title: 'Ja, ich bin gespannt',
    image: '/option11.jpg',
  },
  {
    value: 'Noch unsicher' as const,
    title: 'Noch unsicher',
    image: '/option22.jpg',
  },
];

const question2Options = [
  {
    value: 'Ja, im Kirchenchor' as const,
    title: 'Ja, im Kirchenchor',
    image: '/kirchenchor.jpg',
  },
  {
    value: 'Ja, in der Band' as const,
    title: 'Ja, in der Band',
    image: '/band.jpg',
  },
  {
    value: 'Sonstige Erfahrung' as const,
    title: 'Sonstige Erfahrung',
    image: '/sonstige-erfahrung.jpg',
  },
  {
    value: 'Noch keine Erfahrung' as const,
    title: 'Noch keine Erfahrung',
    image: '/keine-erfahrung.jpg',
  },
];

const question3Options = [
  {
    value: 'Vor-Ort Unterricht' as const,
    title: 'Vor-Ort Unterricht',
    icon: MapPin,
  },
  {
    value: 'Online-Unterricht' as const,
    title: 'Online-Unterricht',
    icon: Monitor,
  },
];

function ProgressBar({ step }: { step: number }) {
  const total = 4;
  const progress = ((step + 1) / total) * 100;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: brand }}
        />
      </div>
    </div>
  );
}

function ImageAnswerCard({
  title,
  image,
  onClick,
  compact = false,
}: {
  title: string;
  image: string;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group overflow-hidden rounded-[4px] border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div
          className={`absolute inset-x-0 bottom-0 text-center ${
            compact ? 'px-2 py-2.5 md:px-2 md:py-3' : 'px-4 py-4'
          }`}
          style={{ backgroundColor: `${brand}E6` }}
        >
          <span
            className={`block font-bold text-white ${
              compact ? 'text-xs leading-snug md:text-sm' : 'text-sm md:text-base'
            }`}
          >
            {title}
          </span>
        </div>
      </div>
    </button>
  );
}

function IconAnswerCard({
  title,
  icon: Icon,
  onClick,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex aspect-square w-full flex-col items-center justify-center rounded-[4px] text-center text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
      style={{ backgroundColor: brand }}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <span className="px-4 text-base font-bold leading-snug md:text-lg">
        {title}
      </span>
    </button>
  );
}

export default function Quiz() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const sentLeadRef = useRef(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoadingStep = (data: Partial<Answers>) => {
    setAnswers((prev) => ({ ...prev, ...data }));
    setLoading(true);
    setStep(3);

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setStep(4);
      loadingTimeoutRef.current = null;
    }, 1800);
  };

  const next = (data: Partial<Answers>) => {
    if (step === 2) {
      startLoadingStep(data);
      return;
    }

    setAnswers((prev) => ({ ...prev, ...data }));
    setStep((prev) => (prev + 1) as 0 | 1 | 2 | 3 | 4);
  };

  const back = () => {
    if (loading) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
      setStep(2);
      return;
    }

    if (step === 4) {
      setStep(2);
      return;
    }

    setStep((prev) => (prev > 0 ? ((prev - 1) as 0 | 1 | 2 | 3 | 4) : 0));
  };

  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const payload = {
      ready: answers.ready ?? '',
      experience: answers.experience ?? '',
      lessonType: answers.lessonType ?? '',
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      hp: String(form.get('hp') || '').trim(),
    };

    if (!payload.name || !payload.email || !payload.phone) {
      alert('Bitte fülle alle Felder aus.');
      return;
    }

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
    } catch {}

    window.location.href = '/danke';
  };

  return (
    <div
      className="mx-auto w-full max-w-5xl"
      style={
        {
          '--brand': brand,
          '--graphite': graphite,
          '--lightGray': lightGray,
        } as React.CSSProperties
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');

        .quiz-open-sans {
          font-family: 'Open Sans', sans-serif;
        }
      `}</style>

<div className="quiz-open-sans rounded-[4px] bg-[#f7f7f7]">
        {step !== 4 && <ProgressBar step={step} />}

        <div className="mt-6 md:mt-8">
          {step === 0 && (
            <section className="text-center">
              <h2 className="text-3xl font-extrabold text-[color:var(--graphite)] md:text-4xl">
                Bereit für deine unverbindliche Probestunde?
              </h2>

              <div className="mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-3 md:max-w-[520px] md:grid-cols-2 md:gap-4">
                {question1Options.map((option) => (
                  <ImageAnswerCard
                    key={option.value}
                    title={option.title}
                    image={option.image}
                    compact
                    onClick={() => next({ ready: option.value })}
                  />
                ))}
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="text-center">
              <h2 className="text-3xl font-extrabold text-[color:var(--graphite)] md:text-4xl">
                Hast du bereits Erfahrung im Singen?
              </h2>

              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {question2Options.map((option) => (
                  <ImageAnswerCard
                    key={option.value}
                    title={option.title}
                    image={option.image}
                    compact
                    onClick={() => next({ experience: option.value })}
                  />
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={back}
                  className="text-sm underline underline-offset-4"
                  style={{ color: lightGray }}
                >
                  Zurück
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="text-center">
              <h2 className="text-3xl font-extrabold text-[color:var(--graphite)] md:text-4xl">
                Interessiert du dich für vor-Ort Unterricht oder online?
              </h2>

              <div className="mx-auto mt-8 grid max-w-[520px] grid-cols-2 gap-3 md:max-w-[520px] md:grid-cols-2 md:gap-4">
                {question3Options.map((option) => (
                  <IconAnswerCard
                    key={option.value}
                    title={option.title}
                    icon={option.icon}
                    onClick={() => next({ lessonType: option.value })}
                  />
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={back}
                  className="text-sm underline underline-offset-4"
                  style={{ color: lightGray }}
                >
                  Zurück
                </button>
              </div>
            </section>
          )}

          {step === 3 && loading && (
            <section className="py-10 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center rounded-[4px] border border-neutral-200 bg-white px-6 py-10 shadow-sm">
                <div
                  className="h-14 w-14 animate-spin rounded-full border-4 border-neutral-200"
                  style={{ borderTopColor: brand }}
                />
                <h3 className="mt-6 text-2xl font-extrabold text-[color:var(--graphite)]">
                  Einen Moment bitte ...
                </h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--lightGray)]">
                  Wir bereiten deine unverbindliche Probestunde vor.
                </p>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={back}
                  className="text-sm underline underline-offset-4"
                  style={{ color: lightGray }}
                >
                  Zurück
                </button>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="mx-auto max-w-2xl text-center">
              <div className="mx-auto mb-6 flex justify-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-full md:h-32 md:w-32">
                  <Image
                    src="/martin1.jpg"
                    alt="Martin Krendl"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <h2 className="mt-3 text-3xl font-extrabold text-[color:var(--graphite)] md:text-4xl">
                Du bist bereit für deine Probestunde!
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-[color:var(--lightGray)]">
                Wow, das klingt super! Ich lade dich herzlich zu einer
                unverbindlichen Probestunde ein. Dort lernst du die Voiceation
                Methode kennen und wie sie deine Stimme auf das nächste Level
                hebt. Ich freue mich auf dich!

                <br></br>
            Dein Martin
              </p>

              <form onSubmit={submitLead} className="mx-auto mt-8 max-w-xl space-y-3">
                <input type="hidden" name="ready" value={answers.ready || ''} />
                <input
                  type="hidden"
                  name="experience"
                  value={answers.experience || ''}
                />
                <input
                  type="hidden"
                  name="lessonType"
                  value={answers.lessonType || ''}
                />
                <input
                  type="text"
                  name="hp"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />

                <input
                  className="h-12 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-[color:var(--graphite)] outline-none transition focus:border-[color:var(--brand)]"
                  name="name"
                  placeholder="Dein Name"
                  required
                />
                <input
                  className="h-12 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-[color:var(--graphite)] outline-none transition focus:border-[color:var(--brand)]"
                  type="email"
                  name="email"
                  placeholder="Deine E-Mail-Adresse"
                  required
                />
                <input
                  className="h-12 w-full rounded-[4px] border border-neutral-300 bg-white px-4 text-[color:var(--graphite)] outline-none transition focus:border-[color:var(--brand)]"
                  type="tel"
                  name="phone"
                  placeholder="Deine Telefonnummer"
                  required
                  pattern="^[0-9+()\\s-]{6,}$"
                />

                <Button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-[4px] px-6 font-semibold text-white hover:opacity-95"
                  style={{ backgroundColor: brand }}
                >
                  Unverbindliche Probestunde anfragen
                </Button>

                <p className="text-sm text-[color:var(--lightGray)]">
                  Mit dem Absenden erklärst du dich mit der Verarbeitung deiner
                  Angaben einverstanden.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={back}
                    className="text-sm underline underline-offset-4"
                    style={{ color: lightGray }}
                  >
                    Zurück
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
