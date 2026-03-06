"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

const brand = "#884A4A";
const graphite = "#2F2F2F";
const darkGray = "#4A4A4A";
const lightGray = "#6B6B6B";
const sectionWidth = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

export default function DankePage() {
  return (
    <main
      className="min-h-screen bg-white text-[color:var(--graphite)]"
      style={
        {
          "--brand": brand,
          "--graphite": graphite,
          "--darkGray": darkGray,
          "--lightGray": lightGray,
        } as CSSProperties
      }
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Open Sans', sans-serif;
          color: var(--graphite);
          background: #ffffff;
        }
      `}</style>

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ backgroundColor: brand }}
      >
        <div className={`${sectionWidth} flex h-20 items-center justify-between`}>
          <div className="text-left text-lg font-extrabold tracking-[0.18em] text-white md:text-xl">
            MARTIN KRENDL
          </div>

          <Link href="/">
            <Button
              variant="secondary"
              className="rounded-[4px] px-6 py-3 font-semibold text-white"
            >
              Zurück zur Startseite
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="flex min-h-[calc(100vh-80px)] items-center py-16 md:py-24">
        <div className={sectionWidth}>
          <div className="mx-auto max-w-2xl rounded-[4px] border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm md:px-10 md:py-14">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${brand}15` }}
            >
              <CheckCircle2
                className="h-8 w-8"
                style={{ color: brand }}
              />
            </div>

            <p
              className="mt-6 text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: brand }}
            >
              Danke für deine Anfrage
            </p>

            <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
              Deine Nachricht ist erfolgreich angekommen
            </h1>

            <p className="mt-5 text-base leading-8 text-[color:var(--lightGray)]">
              Danke für dein Interesse am Gesangsunterricht. Ich melde mich so
              bald wie möglich persönlich bei dir, damit wir gemeinsam schauen
              können, welcher nächste Schritt für dich und deine Stimme sinnvoll ist.
            </p>

            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              Bis dahin freue ich mich sehr über dein Vertrauen.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/">
                <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                  Zur Startseite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
