"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Quiz from "@/components/quiz";
import {
  Award,
  Check,
  GraduationCap,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Video,
  Pause,
  Play,
} from "lucide-react";

const brand = "#884A4A";
const graphite = "#2F2F2F";
const darkGray = "#4A4A4A";
const lightGray = "#6B6B6B";
const sectionWidth = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

const logos = [
  "/logo1.jpg",
  "/logo2.jpg",
  "/logo3.jpg",
  "/logo4.jpg",
];

const featureCards = [
  {
    icon: GraduationCap,
    title: "Individuelle Betreuung",
    text: "Persönlich abgestimmtes Coaching für nachhaltige Fortschritte und messbare Ergebnisse.",
  },
  {
    icon: Trophy,
    title: "Erprobte Methode",
    text: "Strukturiertes Lernen mit klarem Fokus auf Verständnis, Sicherheit und langfristigen Erfolg.",
  },
  {
    icon: ShieldCheck,
    title: "Verlässlich & klar",
    text: "Transparente Begleitung mit klaren Schritten, ehrlichem Feedback und motivierender Unterstützung.",
  },
];

const secondFeatureCards = [
  {
    icon: Users,
    title: "Persönlich",
    text: "Nahbare Zusammenarbeit mit Fokus auf Vertrauen, Klarheit und individueller Förderung.",
  },
  {
    icon: Award,
    title: "Erfolgsorientiert",
    text: "Gezielte Strategien, die auf echte Fortschritte und sichtbare Ergebnisse ausgelegt sind.",
  },
  {
    icon: Video,
    title: "Modern",
    text: "Zeitgemäße Inhalte und Formate, die auf allen Geräten überzeugend funktionieren.",
  },
  {
    icon: Star,
    title: "Wertschätzend",
    text: "Lernen in einer motivierenden Atmosphäre mit echter Aufmerksamkeit für jede Person.",
  },
];

const bulletPoints = [
  "Persönliche Begleitung auf Augenhöhe",
  "Klare Struktur für schnelle Fortschritte",
  "Nachhaltige Unterstützung mit Fokus auf Ergebnisse",
];

const reviews = [
  "Ich habe mich vom ersten Moment an bestens aufgehoben gefühlt. Die Betreuung war klar, motivierend und sehr professionell.",
  "Unglaublich wertvolle Unterstützung. Inhalte wurden verständlich erklärt und individuell auf mich abgestimmt.",
  "Man merkt sofort die Erfahrung und die Ruhe in der Begleitung. Absolute Empfehlung für alle, die wirklich weiterkommen wollen.",
  "Die Zusammenarbeit war strukturiert, persönlich und effektiv. Genau die richtige Mischung aus Motivation und Klarheit.",
  "Hier wird nicht einfach nur begleitet, sondern wirklich verstanden, worauf es ankommt. Das hat einen riesigen Unterschied gemacht.",
  "Sehr hochwertiger Auftritt, starke Inhalte und eine Betreuung, die Vertrauen schafft. Ich würde es jederzeit wieder machen.",
  "Besonders beeindruckt hat mich die individuelle Herangehensweise. Ich habe mich ernst genommen und gefördert gefühlt.",
  "Modern, klar und menschlich. Genau die Art von Unterstützung, die man sich wünscht, wenn man echte Fortschritte erzielen möchte.",
  "Von Anfang bis Ende professionell und angenehm. Man spürt die Qualität in jedem Detail.",
];

const carouselVideos = ["/video1.mp4", "/video2.mp4", "/video3.mp4"];

type VideoState = {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
};

export default function Page() {
  const [activeVideo, setActiveVideo] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [videoStates, setVideoStates] = useState<VideoState[]>(
    carouselVideos.map(() => ({
      duration: 0,
      currentTime: 0,
      isPlaying: false,
    }))
  );

  const orderedVideos = useMemo(() => {
    const leftIndex =
      (activeVideo - 1 + carouselVideos.length) % carouselVideos.length;
    const rightIndex = (activeVideo + 1) % carouselVideos.length;

    return [leftIndex, activeVideo, rightIndex];
  }, [activeVideo]);

  const updateVideoState = (index: number, patch: Partial<VideoState>) => {
    setVideoStates((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const handleLoadedMetadata = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    updateVideoState(index, {
      duration: Number.isFinite(video.duration) ? video.duration : 0,
      currentTime: video.currentTime || 0,
    });
  };

  const handleTimeUpdate = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    updateVideoState(index, {
      currentTime: video.currentTime || 0,
    });
  };

  const handleTogglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (index: number, value: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    video.currentTime = value;
    updateVideoState(index, { currentTime: value });
  };

  const handleSelectVideo = (index: number) => {
    setActiveVideo(index);
  };

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index !== activeVideo) {
        video.pause();
      }
    });
  }, [activeVideo]);

  return (
    <main
      className="min-h-screen bg-white text-[color:var(--graphite)]"
      style={
        {
          "--brand": brand,
          "--graphite": graphite,
          "--darkGray": darkGray,
          "--lightGray": lightGray,
        } as React.CSSProperties
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

        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }

        input[type='range']::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 9999px;
          background: #e5e5e5;
        }

        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -5px;
          height: 14px;
          width: 14px;
          border-radius: 9999px;
          background: var(--brand);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
        }

        input[type='range']::-moz-range-track {
          height: 4px;
          border-radius: 9999px;
          background: #e5e5e5;
        }

        input[type='range']::-moz-range-thumb {
          height: 14px;
          width: 14px;
          border: 2px solid white;
          border-radius: 9999px;
          background: var(--brand);
          cursor: pointer;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.08);
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

          <a href="#quiz">
            <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
              Zum Quiz
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="relative aspect-square w-full md:aspect-[16/6]">
          <Image
            src="/hero.jpg"
            alt="Hero Bild"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

          <div className="absolute inset-x-0 bottom-0">
            <div className={`${sectionWidth} pb-10 md:pb-14`}>
              <div className="mx-auto max-w-3xl text-center text-white">
                <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
                  Klarheit, Struktur und echte Fortschritte für deinen nächsten
                  Schritt
                </h1>
                <p className="mt-4 text-sm text-white/85 md:text-lg">
                  Persönliche Begleitung mit einem modernen, klaren Ansatz –
                  individuell, motivierend und auf nachhaltige Ergebnisse
                  ausgerichtet.
                </p>

                <div className="mt-6">
                  <a href="#quiz">
                    <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                      Zum Quiz
                    </Button>
                  </a>
                </div>

                <div className="mt-4 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    100+ Schüler betreut
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo section */}
      <section className="py-12 md:py-14">
        <div className={sectionWidth}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {logos.map((logo, index) => (
              <div
                key={logo}
                className="flex h-28 items-center justify-center rounded-[4px] border border-neutral-200 bg-white p-4 md:h-32"
              >
                <Image
                  src={logo}
                  alt={`Logo ${index + 1}`}
                  width={180}
                  height={80}
                  className="max-h-14 w-auto object-contain md:max-h-16"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 cards accent */}
      <section className="pt-8 pb-14 md:pt-10 md:pb-20">
        <div className={sectionWidth}>
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[4px] px-6 py-8 text-center text-white"
                  style={{ backgroundColor: brand }}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-white/20 bg-white/10">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/90">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Image + text */}
      <section className="py-14 md:py-20">
        <div
          className={`${sectionWidth} grid items-center gap-8 md:grid-cols-2 md:gap-12`}
        >
          <div className="relative aspect-square overflow-hidden rounded-[4px]">
            <Image
              src="/section-image-1.jpg"
              alt="Persönliche Betreuung"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Persönlich begleitet. Klar geführt. Nachhaltig gestärkt.
            </h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              Hier geht es nicht um Standardlösungen, sondern um eine
              individuelle Begleitung mit echter Aufmerksamkeit für deine
              Situation. Der Fokus liegt auf Klarheit, Struktur und einem Weg,
              der sich für dich richtig und machbar anfühlt.
            </p>

            <div className="mt-6 space-y-3">
              {bulletPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: brand }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-sm leading-7 text-[color:var(--graphite)]">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a href="#quiz">
                <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                  Zum Quiz
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Full width quote image */}
      <section className="py-14 md:py-20">
        <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/6]">
          <Image
            src="/quote-image.jpg"
            alt="Zitat Hintergrund"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className={`${sectionWidth} absolute inset-0 flex items-center`}>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Zitat
              </p>
              <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-white md:text-4xl">
                „Wer mit Klarheit, Vertrauen und der richtigen Begleitung lernt,
                gewinnt nicht nur Sicherheit – sondern echte Perspektive.“
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Video carousel */}
      <section className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">
                Eindrücke im Videoformat
              </h2>
              <p className="mt-3 max-w-2xl text-[color:var(--lightGray)]">
                Moderne, horizontale Video-Darstellung mit einem klaren Fokus
                auf das mittlere Video auf Desktop.
              </p>
            </div>
          </div>

          {/* Mobile */}
          <div className="overflow-x-auto pb-4 [scrollbar-width:none] md:hidden">
            <div className="flex snap-x snap-mandatory gap-4">
              {carouselVideos.map((video, i) => {
                const state = videoStates[i];
                const duration = state.duration || 0;
                const currentTime = Math.min(state.currentTime, duration || 0);

                return (
                  <div key={video} className="min-w-[88%] snap-center">
                    <div className="overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleSelectVideo(i)}
                        className="block w-full text-left"
                      >
                        <div className="relative aspect-video bg-black">
                          <video
                            ref={(el) => {
                              videoRefs.current[i] = el;
                            }}
                            src={video}
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                            onLoadedMetadata={() => handleLoadedMetadata(i)}
                            onTimeUpdate={() => handleTimeUpdate(i)}
                            onPlay={() =>
                              updateVideoState(i, { isPlaying: true })
                            }
                            onPause={() =>
                              updateVideoState(i, { isPlaying: false })
                            }
                          />
                        </div>
                      </button>

                      <div className="border-t border-neutral-200 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            aria-label={
                              state.isPlaying
                                ? `Video ${i + 1} pausieren`
                                : `Video ${i + 1} abspielen`
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] text-white"
                            style={{ backgroundColor: brand }}
                            type="button"
                            onClick={() => handleTogglePlay(i)}
                          >
                            {state.isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>

                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={currentTime}
                            onChange={(e) =>
                              handleSeek(i, Number(e.target.value))
                            }
                            className="w-full"
                            aria-label={`Timeline Video ${i + 1}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center justify-center gap-4 lg:gap-6">
              {orderedVideos.map((videoIndex, position) => {
                const video = carouselVideos[videoIndex];
                const state = videoStates[videoIndex];
                const duration = state.duration || 0;
                const currentTime = Math.min(state.currentTime, duration || 0);
                const isCenter = position === 1;

                return (
                  <div
                    key={`${video}-${position}`}
                    className={`transition-all duration-300 ${
                      isCenter
                        ? "w-[52%] lg:w-[56%]"
                        : "w-[24%] lg:w-[22%] cursor-pointer opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm transition-all duration-300 ${
                        isCenter ? "scale-100" : "scale-[0.96]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectVideo(videoIndex)}
                        className="block w-full text-left"
                      >
                        <div className="relative aspect-video bg-black">
                          <video
                            ref={(el) => {
                              videoRefs.current[videoIndex] = el;
                            }}
                            src={video}
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover"
                            onLoadedMetadata={() =>
                              handleLoadedMetadata(videoIndex)
                            }
                            onTimeUpdate={() => handleTimeUpdate(videoIndex)}
                            onPlay={() =>
                              updateVideoState(videoIndex, { isPlaying: true })
                            }
                            onPause={() =>
                              updateVideoState(videoIndex, { isPlaying: false })
                            }
                          />
                        </div>
                      </button>

                      <div className="border-t border-neutral-200 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            aria-label={
                              state.isPlaying
                                ? `Video ${videoIndex + 1} pausieren`
                                : `Video ${videoIndex + 1} abspielen`
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] text-white"
                            style={{ backgroundColor: brand }}
                            type="button"
                            onClick={() => handleTogglePlay(videoIndex)}
                          >
                            {state.isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>

                          <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={currentTime}
                            onChange={(e) =>
                              handleSeek(videoIndex, Number(e.target.value))
                            }
                            className="w-full"
                            aria-label={`Timeline Video ${videoIndex + 1}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              {carouselVideos.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectVideo(index)}
                  aria-label={`Video ${index + 1} auswählen`}
                  className={`h-2.5 rounded-full transition-all ${
                    activeVideo === index ? "w-8" : "w-2.5"
                  }`}
                  style={{
                    backgroundColor:
                      activeVideo === index ? brand : "rgb(212 212 212)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mirrored image + text */}
      <section className="py-14 md:py-20">
        <div
          className={`${sectionWidth} grid items-center gap-8 md:grid-cols-2 md:gap-12`}
        >
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Moderne Begleitung mit einem klaren Blick auf das Wesentliche
            </h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              Ein starker Prozess entsteht dort, wo Erfahrung, Struktur und ein
              gutes Gespür für Menschen zusammenkommen. Ziel ist eine Umgebung,
              in der Orientierung entsteht und Fortschritt möglich wird.
            </p>

            <div className="mt-6 space-y-3">
              {bulletPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: brand }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-sm leading-7 text-[color:var(--graphite)]">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a href="#quiz">
                <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                  Zum Quiz
                </Button>
              </a>
            </div>
          </div>

          <div className="order-1 relative aspect-square overflow-hidden rounded-[4px] md:order-2">
            <Image
              src="/section-image-2.jpg"
              alt="Moderne Begleitung"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4 cards accent + heading + button */}
      <section className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Was die Zusammenarbeit besonders macht
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {secondFeatureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[4px] px-5 py-7 text-center text-white"
                  style={{ backgroundColor: brand }}
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-white/20 bg-white/10">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/90">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <a href="#quiz">
              <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                Zum Quiz
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Centered flowing text */}
      <section className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-lg leading-9 text-[color:var(--darkGray)] md:text-xl">
              Gute Begleitung bedeutet, Menschen nicht nur fachlich
              weiterzubringen, sondern ihnen auch Sicherheit, Orientierung und
              Vertrauen zu geben. Genau daraus entsteht ein Umfeld, in dem
              Entwicklung nicht erzwungen, sondern natürlich möglich wird.
            </p>
          </div>
        </div>
      </section>

      {/* Quiz import */}
      <section id="quiz" className="scroll-mt-28 py-14 md:py-20">
        <div className={sectionWidth}>
          <Quiz />
        </div>
      </section>

      {/* 2x video + quote layouts */}
      <section className="py-14 md:py-20">
        <div className={`${sectionWidth} space-y-12`}>
          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="overflow-hidden rounded-[4px] border border-neutral-200 bg-white">
              <div className="relative aspect-video">
                <video
                  src="/review-video-1.mp4"
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="rounded-[4px] bg-neutral-100 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                Bewertung
              </p>
              <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-[color:var(--graphite)]">
                „Professionell, motivierend und dabei immer persönlich. Genau
                die Unterstützung, die ich gebraucht habe.“
              </blockquote>
            </div>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="order-2 rounded-[4px] bg-neutral-100 p-8 md:order-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                Bewertung
              </p>
              <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-[color:var(--graphite)]">
                „Die Kombination aus Klarheit, Struktur und Menschlichkeit hat
                für mich den entscheidenden Unterschied gemacht.“
              </blockquote>
            </div>

            <div className="order-1 overflow-hidden rounded-[4px] border border-neutral-200 bg-white md:order-2">
              <div className="relative aspect-video">
                <video
                  src="/review-video-2.mp4"
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Du bist in bester Gesellschaft
            </h2>
          </div>

          <div className="overflow-x-auto pb-4 [scrollbar-width:none] md:overflow-visible">
            <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="min-w-[88%] rounded-[4px] bg-neutral-100 p-6 md:min-w-0"
                >
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-7 text-[color:var(--graphite)]">
                    {review}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final 3er grid */}
      <section className="pb-20 pt-14 md:pb-24 md:pt-20">
        <div
          className={`${sectionWidth} grid items-center gap-8 md:grid-cols-3 md:gap-10`}
        >
          <div className="relative aspect-video overflow-hidden rounded-[4px]">
            <Image
              src="/final-image.jpg"
              alt="Abschlussbild"
              fill
              className="object-cover"
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Der nächste Schritt beginnt mit einer klaren Entscheidung
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--lightGray)]">
              Wenn du dir eine Begleitung wünschst, die modern, persönlich und
              klar aufgebaut ist, dann ist jetzt ein guter Moment, den ersten
              Schritt zu machen. Ein kurzer Einstieg über das Quiz reicht, um
              den passenden nächsten Weg sichtbar zu machen.
            </p>

            <div className="mt-8">
              <a href="#quiz">
                <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                  Zum Quiz
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
