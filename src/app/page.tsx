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
  MicVocal,
} from "lucide-react";

const brand = "#884A4A";
const graphite = "#2F2F2F";
const darkGray = "#4A4A4A";
const lightGray = "#6B6B6B";
const sectionWidth = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

const logos = [
  "/logo1.jpg",
  "/logo2.jpg",
 
];

const featureCards = [
  {
    icon: GraduationCap,
    title: "Individuelles Vocal Coaching",
    text: "Kein Unterricht von der Stange, sondern ein klar auf dich und deine Stimme abgestimmter Weg.",
  },
  {
    icon: Trophy,
    title: "Erprobte Methode",
    text: "Du arbeitest mit einer Methode, die vielen Sänger:innen geholfen hat, freier, sicherer und klangvoller zu singen.",
  },
  {
    icon: ShieldCheck,
    title: "Gesund und mit Gefühl singen",
    text: "Mehr Klang, mehr Sicherheit und mehr Leichtigkeit – ohne unnötigen Druck auf die Stimme.",
  },
];

const secondFeatureCards = [
  {
    icon: Users,
    title: "Für jedes Level",
    text: "Ob Anfänger:in, Wiedereinsteiger:in oder Profi – du wirst dort abgeholt, wo du gerade stehst.",
  },
  {
    icon: Award,
    title: "Mit Erfahrung",
    text: "Langjährige Unterrichts- und Bühnenerfahrung verbinden sich mit einem klaren Blick für deine nächsten Schritte.",
  },
  {
    icon: Video,
    title: "Live oder online",
    text: "Du kannst im Studio in Steyr oder unkompliziert via Zoom mit mir arbeiten.",
  },
  {
    icon: MicVocal,
    title: "Mit echter Freude",
    text: "Singen darf wirksam sein – und gleichzeitig leicht, lebendig und berührend bleiben.",
  },
];

const bulletPoints = [
  "Mehr Stimmumfang und mehr Sicherheit in der Höhe",
  "Klarerer, kräftigerer Klang ohne unnötige Anstrengung",
  "Persönliche Begleitung mit ehrlichem Feedback und klaren Schritten",
];

const reviews = [
  {
    text: "Egal ob Profi oder Hobby Musiker, jeder kann bei Martin was lernen. Er freut sich über deinen Erfolg und ist einfach ein wirklich cooler Typ. Habe keine Minute bereut, die ich bei ihm Unterricht hatte. 100% Empfehlung!!",
    author: "Angelika Spitzbart",
  },
  {
    text: 'Martin ist ein sehr geduldiger, wertschätzender Vollblutmusiker und Lehrer ... Alles, was ich bei ihm lernen durfte ist abgespeichert ... die Liebe und der Mut zum "Selbstmusizieren" ist wieder da!!',
    author: "Birgit Baumgartner",
  },
  {
    text: "Martin Krendl ist ein Könner auf seinem Gebiet! Ob Cajon oder Gesang, er ist der Experte! Nicht nur was er einem beibringt, sondern auch wie er lehrt ist einfach PERFEKT!!!! Man merkt er ist bei jedem Schüler mit Herz und Seele bei der Sache und kitzelt aus jedem Menschen das best Möglichste heraus! Dank Martins Art kann er mit jedem Typ Mensch umgehen und weiß immer genau was zu tun ist! Ich bin sehr froh von so einem Profi lernen zu dürfen! DANKE!",
    author: "Marianne Falkner",
  },
];

const carouselVideos = ["/5030c62f-ea92-45de-bab1-7f8aeda2f40c.mp4", "/85052189-16cf-4fe2-aa49-b46f0d96a05f.mp4", "/80cd8f88-d573-43bb-8238-0eaf3066ca59.mp4"];

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
              Kostenloses Kennenlernen
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="relative aspect-square w-full md:aspect-[16/6]">
          <Image
            src="/martin-desktop.jpg"
            alt="Martin Krendl beim Singen"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />

          <div className="absolute inset-x-0 bottom-0">
            <div className={`${sectionWidth} pb-10 md:pb-14`}>
              <div className="mx-auto max-w-4xl text-center text-white">
                <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
                  Sing freier, sicherer und mit mehr Ausdruck
                </h1>
                <p className="mt-4 text-sm text-white/85 md:text-lg">
                  Für alle, die ihre Stimme wirklich entwickeln möchten – ob
                  unter der Dusche, im Chor, auf der Bühne oder einfach für sich
                  selbst.
                </p>

                <p className="mt-4 text-sm text-white/85 md:text-lg">
                  Im Vocal Coaching mit Martin Krendl arbeitest du gezielt an
                  Klang, Höhe, Leichtigkeit und Ausdruck – persönlich in Steyr
                  oder online via Zoom.
                </p>

                <div className="mt-6">
                  <a href="#quiz">
                    <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                      Kostenloses Kennenlerngespräch anfragen
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
                    Persönliches Vocal Coaching mit Herz, Struktur und Erfahrung
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
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
              Bekannt aus Coaching, Bühne und Ausbildung
            </p>
          </div>

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
              src="/martin3.jpg"
              alt="Gesangsunterricht mit Martin Krendl"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Deine Stimme kann mehr, als du vielleicht gerade glaubst
            </h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              Viele Sänger:innen kämpfen mit Unsicherheit, engen Höhen,
              fehlender Kraft oder dem Gefühl, nicht so zu klingen, wie sie es
              eigentlich möchten. Genau hier setzt das Coaching an:
              verständlich, individuell und mit Fokus auf echte Veränderung.
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
                  Jetzt kostenlos kennenlernen
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
            src="/martin-zitat.jpg"
            alt="Martin Krendl beim Singen"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className={`${sectionWidth} absolute inset-0 flex items-center`}>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Meine Haltung im Unterricht
              </p>
              <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-white md:text-4xl">
                „Singen soll nicht schwerer werden – sondern freier, ehrlicher
                und sicherer.“
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
                Hör und sieh selbst
              </h2>
              <p className="mt-3 max-w-2xl text-[color:var(--lightGray)]">
                Die Videos zeigen mich direkt beim Singen – damit du ein Gefühl
                dafür bekommst, wer dich im Coaching begleitet.
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
              Coaching, das dich musikalisch und stimmlich weiterbringt
            </h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              Es geht nicht darum, dich in ein starres System zu pressen. Es
              geht darum, deine Stimme besser zu verstehen, Blockaden zu lösen
              und Stück für Stück freier zu singen – so, dass es sich gut,
              gesund und echt anfühlt.
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
                  Kostenloses Gespräch starten
                </Button>
              </a>
            </div>
          </div>

          <div className="order-1 relative aspect-square overflow-hidden rounded-[4px] md:order-2">
            <Image
              src="/martin2.jpg"
              alt="Martin Krendl im Vocal Coaching"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4 cards accent + heading + button */}
      <section className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Was dich im Coaching erwartet
            </h2>
            <p className="mt-4 text-[color:var(--lightGray)]">
              Klarer Unterricht, persönliche Aufmerksamkeit und ein Ansatz, der
              sich an deiner Stimme orientiert – nicht an pauschalen Lösungen.
            </p>
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
                Zum Kennenlern-Quiz
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
              Ob du sicherer intonieren, freier in die Höhe kommen, kraftvoller
              klingen oder einfach wieder mit mehr Freude singen möchtest: Der
              nächste Schritt beginnt oft nicht mit mehr Druck, sondern mit dem
              richtigen Zugang zu deiner Stimme.
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
                Video-Testimonial
              </p>
              <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-[color:var(--graphite)]">
                „Martin Krendl ist ein absoluter Meister seines Fachs“
              </blockquote>
              <p className="mt-4 text-sm leading-7 text-[color:var(--lightGray)]">
                – Robin D., Starvocal Coach
              </p>
            </div>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="order-2 rounded-[4px] bg-neutral-100 p-8 md:order-1">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                Video-Testimonial
              </p>
              <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-[color:var(--graphite)]">
                „Ich durfte schon mehrfach mit Martin auf der Bühne stehen. Was
                der präsentiert ist wow“
              </blockquote>
              <p className="mt-4 text-sm leading-7 text-[color:var(--lightGray)]">
                – Misha Kovar, Originalcast We Will Rock You, Tanz der Vampire,
                Evita, u.n.v.m.
              </p>
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

      {/* About / Story */}
      <section className="py-14 md:py-20">
        <div
          className={`${sectionWidth} grid items-center gap-8 md:grid-cols-2 md:gap-12`}
        >
          <div className="relative aspect-square overflow-hidden rounded-[4px]">
            <Image
              src="/martin1.jpg"
              alt="Martin Krendl Portrait"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
              Über Martin
            </p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Von der eigenen Suche zur Arbeit mit Sänger:innen
            </h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              Mein eigener Wendepunkt kam, als mir Robin D. in kurzer Zeit etwas
              gezeigt hat, das ich nach Monaten bei anderen Lehrer:innen nicht
              geschafft hatte. Diese Erfahrung hat meinen Blick auf Stimme,
              Technik und Unterricht grundlegend verändert.
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              2009 begann meine Coaching-Ausbildung, 2012 eröffnete ich mein
              eigenes Voiceation Studio. Heute arbeite ich mit Anfänger:innen,
              Fortgeschrittenen und Profis, gebe Workshops für Chöre und
              Ensembles und unterrichte live im Studio oder via Zoom.
            </p>
            <p className="mt-4 text-base leading-8 text-[color:var(--lightGray)]">
              Mir ist wichtig, dass Menschen nicht nur „besser singen“, sondern
              ihre Stimme mit mehr Vertrauen, Freiheit und Freude erleben.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Stimmen von Schüler:innen
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
                    {review.text}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-[color:var(--brand)]">
                    – {review.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-20 pt-14 md:pb-24 md:pt-20">
        <div
          className={`${sectionWidth} grid items-center gap-8 md:grid-cols-3 md:gap-10`}
        >
          <div className="relative aspect-video overflow-hidden rounded-[4px]">
            <Image
              src="/final-cta-image.jpg"
              alt="Vocal Coaching in Steyr"
              fill
              className="object-cover"
            />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Lass uns gemeinsam schauen, was in deiner Stimme steckt
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--lightGray)]">
              Wenn du spürst, dass deine Stimme noch mehr kann, dann ist ein
              persönliches Kennenlerngespräch der beste erste Schritt. Ganz
              unkompliziert, kostenlos und mit Blick darauf, was für dich gerade
              sinnvoll ist.
            </p>

            <div className="mt-8">
              <a href="#quiz">
                <Button className="rounded-[4px] bg-[color:var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-95">
                  Jetzt Kennenlerngespräch anfragen
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
