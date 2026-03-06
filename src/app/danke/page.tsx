"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function Page() {
  // dezente Bestätigungs-Animation (Haken in Markenfarbe)
  const [showTick, setShowTick] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowTick(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <main>
      {/* Bestätigung */}
      <section className="section bg-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            {/* Status-Pill in Marken-Optik */}
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#F5B8BE] bg-[#FFF5F6] px-4 py-1.5 backdrop-blur">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#E63446]" />
              <span className="text-xs text-gray-800">
                Super! Deine unverbindliche Fotobox-Anfrage ist bei uns.
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Vielen Dank für Dein Interesse!
            </h1>

            <p className="mt-3 text-gray-700">
              Wir prüfen Deine Angaben und melden uns in Kürze bei Dir.
            </p>

            {/* Haken-Icon mit Pop-Animation */}
            <div className="mt-6 flex items-center justify-center">
              <div
                className={[
                  "relative grid h-16 w-16 place-items-center rounded-full border-2",
                  "border-[#F5B8BE] bg-white shadow-sm",
                  showTick ? "animate-[pop_250ms_ease-out]" : "",
                ].join(" ")}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={[
                    "h-8 w-8",
                    showTick ? "opacity-100 scale-100" : "opacity-0 scale-90",
                    "transition-all duration-300 ease-out",
                  ].join(" ")}
                >
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    fill="none"
                    stroke="#E63446"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Keyframe für Pop */}
            <style jsx global>{`
              @keyframes pop {
                0% {
                  transform: scale(0.9);
                }
                100% {
                  transform: scale(1);
                }
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* Nächste Schritte – im Quiz/Card-Stil */}
      <section className="section bg-[#F9FAFB]">
        <div className="container">
          <div className="mx-auto w-full max-w-4xl rounded-lg border border-blue-200 bg-white p-5 shadow-xl sm:p-6">
            <h2 className="text-center text-lg sm:text-xl font-semibold text-gray-900">
              So geht es jetzt weiter:
            </h2>

            {/* Schritte in zwei Spalten */}
            <div className="mt-5 grid gap-3 grid-cols-1 sm:grid-cols-2">
              {[
                {
                  title: "1) Dein individuelles Angebot",
                  text: "Wir melden uns in wenigen Tagen bei Dir für Dein individuelles Angebot.",
                },
                {
                  title: "2) Wunsch-Fotobox reservieren",
                  text: "Du hast die Wahl! Wenn alles passt, machen wir Deine Party unvergesslich.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-rose-200 bg-white p-4 text-center shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>

            {/* CTA-Zeile */}
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-md btn-brand">
                {/* Link zur Startseite sollte angepasst werden, falls bekannt (z.B. fotobox-salzburg.at) */}
                <a href="https://fotoboxen-event.com">Zur Startseite & weiteren Fotobox-Stilen</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Optional: Ergänzungen / Hinweise */}
      <section className="section bg-white">
        <div className="container">
          <div className="mx-auto w-full max-w-3xl rounded-lg border border-blue-200 bg-white p-5 shadow-xl sm:p-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Möchtest Du noch etwas ergänzen oder Details ändern?
              </h2>
              <p className="mt-2 text-gray-700">
                Schreib uns bei weiteren Fragen einfach via Mail.
              </p>

              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {/* E-Mail-Adresse sollte auf Ihre Adresse angepasst werden */}
                <Button asChild className="h-11 rounded-md">
                  <a href="mailto:info@fotoboxen-event.com">Per E-Mail kontaktieren</a>
                </Button>
              </div>

              <p className="mt-4 text-xs text-gray-500">
                Hinweis: Deine Angaben verwenden wir ausschließlich zur Erstellung Deines unverbindlichen Angebots.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
