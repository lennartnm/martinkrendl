// src/app/page.tsx
// Server Component – lädt alle Inhalte und Sektionsreihenfolge dynamisch aus Supabase

import type { CSSProperties } from "react";
import Footer from '@/components/ui/Footer';
import TopHeader from '@/components/TopHeader';
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Quiz from "@/components/quiz";
import { VideoCarousel, TestimonialVideos } from "@/app/components/VideoSection";
import { supabase } from "@/lib/supabase";
import {
  Award, Check, GraduationCap, ShieldCheck, Star,
  Trophy, Users, Video, MicVocal,
} from "lucide-react";

type CmsSection = { section_instance: string; section_type: string; hidden: boolean; sort_order: number };

// ── CMS laden ─────────────────────────────────────────────────────────────────
async function getContent(page: string): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase
      .from("cms_content")
      .select("section_key, field_key, value")
      .eq("page", page);
    if (error || !data) return {};
    const map: Record<string, string> = {};
    for (const entry of data) {
      map[`${entry.section_key}::${entry.field_key}`] = entry.value;
    }
    return map;
  } catch {
    return {};
  }
}

// ── Sektionsreihenfolge aus DB laden ──────────────────────────────────────────
async function getSections(page: string): Promise<CmsSection[]> {
  try {
    const { data } = await supabase
      .from("cms_sections")
      .select("section_instance, section_type, hidden, sort_order")
      .eq("page_id", page)
      .order("sort_order");
    return data || [];
  } catch {
    return [];
  }
}

// ── Fallbacks ─────────────────────────────────────────────────────────────────
const FALLBACK: Record<string, string> = {
  "colors::brand":      "#884A4A",
  "colors::graphite":   "#2F2F2F",
  "colors::dark_gray":  "#4A4A4A",
  "colors::light_gray": "#6B6B6B",
  "colors::quiz_bg":    "#F7F7F7",
  "colors::header_bg":  "#884A4A",
  "images::hero":       "/martin-desktop.jpg",
  "images::section1":   "/martin3.jpg",
  "images::quote_bg":   "/martin-zitat.jpg",
  "images::section2":   "/martin2.jpg",
  "images::about":      "/martin1.jpg",
  "images::final_cta":  "/martin5.png",
  "images::logo1":      "/logo1.jpg",
  "images::logo2":      "/logo2.jpg",
  "videos::carousel_1_src":       "/5030c62f-ea92-45de-bab1-7f8aeda2f40c.mp4",
  "videos::carousel_1_thumb":     "/thumb11.jpg",
  "videos::carousel_2_src":       "/85052189-16cf-4fe2-aa49-b46f0d96a05f.mp4",
  "videos::carousel_2_thumb":     "/thumb22.jpg",
  "videos::carousel_3_src":       "/80cd8f88-d573-43bb-8238-0eaf3066ca59.mp4",
  "videos::carousel_3_thumb":     "/thumb33.jpg",
  "videos::testimonial_1_src":    "/review-video-1.mp4",
  "videos::testimonial_1_thumb":  "/review-video-1-thumb.jpg",
  "videos::testimonial_2_src":    "/review-video-2.mp4",
  "videos::testimonial_2_thumb":  "/review-video-2-thumb.jpg",
  "links::header_cta":       "#quiz",
  "links::hero_cta":         "#quiz",
  "links::image_text_1_cta": "#quiz",
  "links::image_text_2_cta": "#quiz",
  "links::features_2_cta":   "#quiz",
  "links::final_cta":        "#quiz",
  "header::logo_text": "MARTIN KRENDL",
  "header::cta_label": "Kostenloses Kennenlernen",
  "hero::title": "Sing freier, sicherer und mit mehr Ausdruck",
  "hero::subtitle": "Lerne mit der Voiceation Methode bekannter Stars, wie du deine Stimme auf ein neues Level heben kannst.",
  "hero::cta_label": "Unverbindliche Probestunde anfragen",
  "hero::social_proof": "100+ Schüler vor Ort & online",
  "logos_section::label": "Bekannt aus Unterricht, Bühne und Ausbildung",
  "feature_card_1::title": "Individueller Gesangsunterricht",
  "feature_card_1::text": "Kein Unterricht von der Stange, sondern ein klar auf dich und deine Stimme abgestimmter Weg.",
  "feature_card_2::title": "Erprobte Methode",
  "feature_card_2::text": "Du arbeitest mit einer Methode, die vielen Menschen geholfen hat, freier, sicherer und klangvoller zu singen.",
  "feature_card_3::title": "Gesund und mit Gefühl singen",
  "feature_card_3::text": "Mehr Klang, mehr Sicherheit und mehr Leichtigkeit – ohne unnötigen Druck auf die Stimme.",
  "image_text_1::title": "Deine Stimme kann mehr, als du vielleicht gerade glaubst",
  "image_text_1::text": "Viele Menschen kämpfen mit Unsicherheit, engen Höhen, fehlender Kraft oder dem Gefühl, nicht so zu klingen, wie sie es eigentlich möchten. Genau hier setzt der Gesangsunterricht an: verständlich, individuell und mit Fokus auf echte Veränderung.",
  "image_text_1::cta_label": "Jetzt kostenlos kennenlernen",
  "image_text_1::bullet_1": "Mehr Stimmumfang und mehr Sicherheit in der Höhe",
  "image_text_1::bullet_2": "Klarerer, kräftigerer Klang ohne unnötige Anstrengung",
  "image_text_1::bullet_3": "Persönliche Begleitung mit ehrlichem Feedback und klaren Schritten",
  "quote_section::label": "Meine Haltung im Unterricht",
  "quote_section::quote": "\u201eSingen soll nicht schwerer werden \u2013 sondern freier, ehrlicher und sicherer.\u201c",
  "video_section::title": "Hör und sieh selbst",
  "video_section::text": "Die Videos zeigen mich direkt beim Singen \u2013 damit du ein Gefühl dafür bekommst, wer dich im Gesangsunterricht begleitet.",
  "image_text_2::title": "Gesangsunterricht, der dich musikalisch und stimmlich weiterbringt",
  "image_text_2::text": "Es geht nicht darum, dich in ein starres System zu pressen. Es geht darum, deine Stimme besser zu verstehen, Blockaden zu lösen und Stück für Stück freier zu singen \u2013 so, dass es sich gut, gesund und echt anfühlt.",
  "image_text_2::cta_label": "Kostenloses Gespräch starten",
  "features_2_heading::title": "Was dich im Gesangsunterricht erwartet",
  "features_2_heading::text": "Klarer Unterricht, persönliche Aufmerksamkeit und ein Ansatz, der sich an deiner Stimme orientiert \u2013 nicht an pauschalen Lösungen.",
  "feature2_card_1::title": "Für jedes Level",
  "feature2_card_1::text": "Ob Anfänger, Wiedereinsteiger oder Profi \u2013 du wirst dort abgeholt, wo du gerade stehst.",
  "feature2_card_2::title": "Mit Erfahrung",
  "feature2_card_2::text": "Langjährige Unterrichts- und Bühnenerfahrung verbinden sich mit einem klaren Blick für deine nächsten Schritte.",
  "feature2_card_3::title": "Live oder online",
  "feature2_card_3::text": "Du kannst im Studio in Steyr oder unkompliziert via Zoom mit mir arbeiten.",
  "feature2_card_4::title": "Mit echter Freude",
  "feature2_card_4::text": "Singen darf wirksam sein \u2013 und gleichzeitig leicht, lebendig und berührend bleiben.",
  "flowing_text::text": "Ob du sicherer intonieren, freier in die Höhe kommen, kraftvoller klingen oder einfach wieder mit mehr Freude singen möchtest: Der nächste Schritt beginnt oft nicht mit mehr Druck, sondern mit dem richtigen Zugang zu deiner Stimme.",
  "testimonial_1::label": "Video-Testimonial",
  "testimonial_1::quote": "\u201eMartin Krendl ist ein absoluter Meister seines Fachs\u201c",
  "testimonial_1::author": "\u2013 Robin D., Starvocal Coach",
  "testimonial_2::label": "Video-Testimonial",
  "testimonial_2::quote": "\u201eIch durfte schon mehrfach mit Martin auf der Bühne stehen. Was der präsentiert ist wow\u201c",
  "testimonial_2::author": "\u2013 Misha Kovar, Originalcast We Will Rock You, Tanz der Vampire, Evita, u.n.v.m.",
  "about::label": "Über Martin",
  "about::title": "Von der eigenen Suche zur Arbeit mit Sängern",
  "about::text_1": "Mein eigener Wendepunkt kam, als mir Robin D. in kurzer Zeit etwas gezeigt hat, das ich nach Monaten bei anderen Lehrern nicht geschafft hatte. Diese Erfahrung hat meinen Blick auf Stimme, Technik und Unterricht grundlegend verändert.",
  "about::text_2": "2009 begann meine Ausbildung, 2012 eröffnete ich mein eigenes Voiceation Studio. Heute arbeite ich mit Anfängern, Fortgeschrittenen und Profis, gebe Workshops für Chöre und Ensembles und unterrichte live im Studio oder via Zoom.",
  "about::text_3": "Mir ist wichtig, dass Menschen nicht nur besser singen, sondern ihre Stimme mit mehr Vertrauen, Freiheit und Freude erleben.",
  "reviews::title": "Stimmen von Schülern",
  "review_1::text": "Egal ob Profi oder Hobby Musiker, jeder kann bei Martin was lernen. Er freut sich über deinen Erfolg und ist einfach ein wirklich cooler Typ. Habe keine Minute bereut, die ich bei ihm Unterricht hatte. 100% Empfehlung!!",
  "review_1::author": "Angelika Spitzbart",
  "review_2::text": "Martin ist ein sehr geduldiger, wertschätzender Vollblutmusiker und Lehrer ... Alles, was ich bei ihm lernen durfte ist abgespeichert ... die Liebe und der Mut zum Selbstmusizieren ist wieder da!!",
  "review_2::author": "Birgit Baumgartner",
  "review_3::text": "Martin Krendl ist ein Könner auf seinem Gebiet! Ob Cajon oder Gesang, er ist der Experte! Nicht nur was er einem beibringt, sondern auch wie er lehrt ist einfach PERFEKT!!!! Man merkt er ist bei jedem Schüler mit Herz und Seele bei der Sache.",
  "review_3::author": "Marianne Falkner",
  "final_cta::title": "Lass uns gemeinsam schauen, was in deiner Stimme steckt",
  "final_cta::text": "Wenn du spürst, dass deine Stimme noch mehr kann, dann ist ein persönliches Kennenlerngespräch der beste erste Schritt. Ganz unkompliziert, kostenlos und mit Blick darauf, was für dich gerade sinnvoll ist.",
  "final_cta::cta_label": "Jetzt Kennenlerngespräch anfragen",
};

// Default section order (maps to section IDs in CMS)
const DEFAULT_ORDER = [
  'hero', 'logos', 'feature_cards_3', 'image_text_1', 'quote',
  'video_carousel', 'image_text_2', 'feature_cards_4', 'flowing_text',
  'quiz', 'testimonials', 'about', 'reviews', 'final_cta',
];

const featureIcons = [GraduationCap, Trophy, ShieldCheck];
const secondFeatureIcons = [Users, Award, Video, MicVocal];
const sectionWidth = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

function CmsImage({ src, alt, fill, width, height, className, priority }: {
  src: string; alt: string; fill?: boolean;
  width?: number; height?: number;
  className?: string; priority?: boolean;
}) {
  const isExternal = src.startsWith('http');
  if (fill) {
    return isExternal
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className || ''}`} style={{ objectFit: 'cover' }} />
      : <Image src={src} alt={alt} fill className={className} priority={priority} />;
  }
  return isExternal
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={src} alt={alt} width={width} height={height} className={className} />
    : <Image src={src} alt={alt} width={width || 400} height={height || 300} className={className} />;
}

export default async function Page() {
  const [cms, dbSections] = await Promise.all([
    getContent("home"),
    getSections("home"),
  ]);
  const c = (key: string) => cms[key] ?? FALLBACK[key] ?? "";

  // Sektionsreihenfolge aus DB; Fallback wenn DB noch leer
  const activeSections = dbSections.length > 0
    ? dbSections.filter(s => !s.hidden)
    : DEFAULT_ORDER.map((id, i) => ({ section_instance: id, section_type: id, hidden: false, sort_order: i }));

  // Farben aus CMS
  const brandColor   = c("colors::brand");
  const graphite     = c("colors::graphite");
  const darkGray     = c("colors::dark_gray");
  const lightGray    = c("colors::light_gray");
  const quizBg       = c("colors::quiz_bg");
  const headerBg     = c("colors::header_bg");

  // Dynamischer Helfer: Wert aus CMS lesen, mit section_instance als Kontext
  // Für Legacy-Sektionen (instance = type) funktioniert c() direkt
  // Für neue Instanzen (z.B. "image_text_abc123") muss section_key = instance sein
  const ci = (instance: string, field: string) =>
    cms[`${instance}::${field}`] ?? FALLBACK[`${instance}::${field}`] ?? "";

  const bulletPoints = [c("image_text_1::bullet_1"), c("image_text_1::bullet_2"), c("image_text_1::bullet_3")];

  const featureCards = [
    { icon: featureIcons[0], title: c("feature_card_1::title"), text: c("feature_card_1::text") },
    { icon: featureIcons[1], title: c("feature_card_2::title"), text: c("feature_card_2::text") },
    { icon: featureIcons[2], title: c("feature_card_3::title"), text: c("feature_card_3::text") },
  ];

  const secondFeatureCards = [
    { icon: secondFeatureIcons[0], title: c("feature2_card_1::title"), text: c("feature2_card_1::text") },
    { icon: secondFeatureIcons[1], title: c("feature2_card_2::title"), text: c("feature2_card_2::text") },
    { icon: secondFeatureIcons[2], title: c("feature2_card_3::title"), text: c("feature2_card_3::text") },
    { icon: secondFeatureIcons[3], title: c("feature2_card_4::title"), text: c("feature2_card_4::text") },
  ];

  const reviews = [
    { text: c("review_1::text"), author: c("review_1::author") },
    { text: c("review_2::text"), author: c("review_2::author") },
    { text: c("review_3::text"), author: c("review_3::author") },
  ];

  // sectionRenderers: jeder Typ bekommt seine section_instance übergeben
  // Legacy-Sektionen haben instance == type (z.B. "hero"), neue haben UUIDs (z.B. "image_text_abc123")
  // ci(instance, field) liest den richtigen DB-Eintrag
  const sectionRenderers: Record<string, (instance: string) => React.ReactNode> = {
    // header / global_colors werden nicht als Sektionen gerendert (sind immer sichtbar)
    header: (_inst) => null,
    global_colors: (_inst) => null,
    hero: (instance) => (
      <section key="hero" className="relative">
        <div className="relative aspect-square w-full md:aspect-[16/6]">
          <CmsImage src={c("images::hero")} alt="Martin Krendl beim Singen" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className={`${sectionWidth} pb-10 md:pb-14`}>
              <div className="mx-auto max-w-4xl text-center text-white">
                <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{c("hero::title")}</h1>
                <p className="mt-4 text-sm text-white/85 md:text-lg">{c("hero::subtitle")}</p>
                <div className="mt-6">
                  <a href={c("links::hero_cta")}>
                    <Button className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                      {c("hero::cta_label")}
                    </Button>
                  </a>
                </div>
                <div className="mt-4 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />)}
                  </div>
                  <p className="text-sm font-semibold text-white/90">{c("hero::social_proof")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),
    logos: (instance) => (
      <section key="logos" className="py-12 md:py-14">
        <div className={sectionWidth}>
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: brandColor }}>
              {c("logos_section::label")}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {[c("images::logo1"), c("images::logo2")].map((logo, index) => (
              <div key={index} className="flex h-28 w-[min(100%,260px)] items-center justify-center rounded-[4px] border border-neutral-200 bg-white p-4 md:h-32">
                <CmsImage src={logo} alt={`Logo ${index + 1}`} width={180} height={80} className="max-h-14 w-auto object-contain md:max-h-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    feature_cards_3: (instance) => (
      <section key="feature_cards_3" className="pt-8 pb-14 md:pt-10 md:pb-20">
        <div className={sectionWidth}>
          <div className="grid gap-4 md:grid-cols-3 md:gap-6">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[4px] px-6 py-8 text-center text-white" style={{ backgroundColor: brandColor }}>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-white/20 bg-white/10">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/90">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    ),
    image_text_1: (instance) => (
      <section key="image_text_1" className="py-14 md:py-20">
        <div className={`${sectionWidth} grid items-center gap-8 md:grid-cols-2 md:gap-12`}>
          <div className="relative aspect-square overflow-hidden rounded-[4px]">
            <CmsImage src={c("images::section1")} alt="Gesangsunterricht mit Martin Krendl" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold md:text-4xl">{c("image_text_1::title")}</h2>
            <p className="mt-4 text-base leading-8" style={{ color: lightGray }}>{c("image_text_1::text")}</p>
            <div className="mt-6 space-y-3">
              {bulletPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: brandColor }}>
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-sm leading-7" style={{ color: graphite }}>{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <a href={c("links::image_text_1_cta")}>
                <Button className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                  {c("image_text_1::cta_label")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    ),
    quote: (instance) => (
      <section key="quote" className="py-14 md:py-20">
        <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/6]">
          <CmsImage src={c("images::quote_bg")} alt="Martin Krendl" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className={`${sectionWidth} absolute inset-0 flex items-center`}>
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{c("quote_section::label")}</p>
              <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-white md:text-4xl">
                {c("quote_section::quote")}
              </blockquote>
            </div>
          </div>
        </div>
      </section>
    ),
    video_carousel: (instance) => (
      <VideoCarousel
        key="video_carousel"
        title={c("video_section::title")}
        text={c("video_section::text")}
        brandColor={brandColor}
        videos={[
          { src: c("videos::carousel_1_src"), thumbnail: c("videos::carousel_1_thumb") },
          { src: c("videos::carousel_2_src"), thumbnail: c("videos::carousel_2_thumb") },
          { src: c("videos::carousel_3_src"), thumbnail: c("videos::carousel_3_thumb") },
        ]}
      />
    ),
    image_text_2: (instance) => (
      <section key="image_text_2" className="py-14 md:py-20">
        <div className={`${sectionWidth} grid items-center gap-8 md:grid-cols-2 md:gap-12`}>
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-extrabold md:text-4xl">{c("image_text_2::title")}</h2>
            <p className="mt-4 text-base leading-8" style={{ color: lightGray }}>{c("image_text_2::text")}</p>
            <div className="mt-6 space-y-3">
              {bulletPoints.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: brandColor }}>
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-sm leading-7" style={{ color: graphite }}>{point}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <a href={c("links::image_text_2_cta")}>
                <Button className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                  {c("image_text_2::cta_label")}
                </Button>
              </a>
            </div>
          </div>
          <div className="order-1 relative aspect-square overflow-hidden rounded-[4px] md:order-2">
            <CmsImage src={c("images::section2")} alt="Martin Krendl im Gesangsunterricht" fill className="object-cover" />
          </div>
        </div>
      </section>
    ),
    feature_cards_4: (instance) => (
      <section key="feature_cards_4" className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">{c("features_2_heading::title")}</h2>
            <p className="mt-4" style={{ color: lightGray }}>{c("features_2_heading::text")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {secondFeatureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[4px] px-5 py-7 text-center text-white" style={{ backgroundColor: brandColor }}>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-white/20 bg-white/10">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/90">{item.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <a href={c("links::features_2_cta")}>
              <Button className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                Zum Kennenlern-Quiz
              </Button>
            </a>
          </div>
        </div>
      </section>
    ),
    flowing_text: (instance) => (
      <section key="flowing_text" className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-lg leading-9 md:text-xl" style={{ color: darkGray }}>{c("flowing_text::text")}</p>
          </div>
        </div>
      </section>
    ),
    quiz: (instance) => (
      <section key="quiz" id="quiz" className="scroll-mt-28 py-14 md:py-20" style={{ backgroundColor: quizBg }}>
        <div className={sectionWidth}><Quiz /></div>
      </section>
    ),
    testimonials: (instance) => (
      <TestimonialVideos
        key="testimonials"
        t1label={c("testimonial_1::label")} t1quote={c("testimonial_1::quote")} t1author={c("testimonial_1::author")}
        t1src={c("videos::testimonial_1_src")} t1thumb={c("videos::testimonial_1_thumb")}
        t2label={c("testimonial_2::label")} t2quote={c("testimonial_2::quote")} t2author={c("testimonial_2::author")}
        t2src={c("videos::testimonial_2_src")} t2thumb={c("videos::testimonial_2_thumb")}
        brandColor={brandColor}
      />
    ),
    about: (instance) => (
      <section key="about" className="py-14 md:py-20">
        <div className={`${sectionWidth} grid items-center gap-8 md:grid-cols-2 md:gap-12`}>
          <div className="relative aspect-square overflow-hidden rounded-[4px]">
            <CmsImage src={c("images::about")} alt="Martin Krendl Portrait" fill className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: brandColor }}>{c("about::label")}</p>
            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">{c("about::title")}</h2>
            <p className="mt-4 text-base leading-8" style={{ color: lightGray }}>{c("about::text_1")}</p>
            <p className="mt-4 text-base leading-8" style={{ color: lightGray }}>{c("about::text_2")}</p>
            <p className="mt-4 text-base leading-8" style={{ color: lightGray }}>{c("about::text_3")}</p>
          </div>
        </div>
      </section>
    ),
    reviews: (instance) => (
      <section key="reviews" className="py-14 md:py-20">
        <div className={sectionWidth}>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">{c("reviews::title")}</h2>
          </div>
          <div className="overflow-x-auto pb-4 [scrollbar-width:none] md:overflow-visible">
            <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6">
              {reviews.map((review, index) => (
                <div key={index} className="min-w-[88%] rounded-[4px] bg-neutral-100 p-6 md:min-w-0">
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />)}
                  </div>
                  <p className="text-sm leading-7" style={{ color: graphite }}>{review.text}</p>
                  <p className="mt-4 text-sm font-semibold" style={{ color: brandColor }}>– {review.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    final_cta: (instance) => (
      <section key="final_cta" className="pb-20 pt-14 md:pb-24 md:pt-20">
        <div className={`${sectionWidth} grid items-center gap-8 md:grid-cols-3 md:gap-10`}>
          <div className="relative aspect-video overflow-hidden rounded-[4px]">
            <CmsImage src={c("images::final_cta")} alt="Gesangsunterricht in Steyr" fill className="object-cover" />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-3xl font-extrabold md:text-4xl">{c("final_cta::title")}</h2>
            <p className="mt-4 max-w-3xl text-base leading-8" style={{ color: lightGray }}>{c("final_cta::text")}</p>
            <div className="mt-8">
              <a href={c("links::final_cta")}>
                <Button variant="secondary" className="rounded-[4px] px-6 py-3 font-semibold text-white">
                  {c("final_cta::cta_label")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    ),
    // Alias: neue "image_text" Sektionen nutzen instance direkt
    image_text: (instance) => {
      const bp = [ci(instance, 'bullet_1'), ci(instance, 'bullet_2'), ci(instance, 'bullet_3')].filter(Boolean);
      return (
        <section key={instance} className="py-14 md:py-20">
          <div className={`${sectionWidth} grid items-center gap-8 md:grid-cols-2 md:gap-12`}>
            <div className="relative aspect-square overflow-hidden rounded-[4px]">
              <CmsImage src={ci(instance, 'image') || c("images::section1")} alt="Bild" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold md:text-4xl">{ci(instance, 'title')}</h2>
              <p className="mt-4 text-base leading-8" style={{ color: lightGray }}>{ci(instance, 'text')}</p>
              {bp.length > 0 && (
                <div className="mt-6 space-y-3">
                  {bp.map((point, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: brandColor }}>
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <p className="text-sm leading-7" style={{ color: graphite }}>{point}</p>
                    </div>
                  ))}
                </div>
              )}
              {ci(instance, 'cta_label') && (
                <div className="mt-8">
                  <a href={ci(instance, 'cta_link') || '#'}>
                    <Button className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                      {ci(instance, 'cta_label')}
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    },
  };

  // Build ordered section list dynamisch aus DB
  // sectionMap ist ein Record<sectionType, (instance: string) => ReactNode>
  // Jede Sektion wird mit ihrer section_instance gerendert
  const orderedSections = activeSections
    .map(s => {
      const renderer = sectionRenderers[s.section_type];
      if (!renderer) return null;
      return renderer(s.section_instance);
    })
    .filter(Boolean);

  return (
    <main
      className="min-h-screen bg-white"
      style={{
        "--brand": brandColor,
        "--graphite": graphite,
        "--darkGray": darkGray,
        "--lightGray": lightGray,
        "--quizBg": quizBg,
      } as CSSProperties}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');
        html { scroll-behavior: smooth; }
        body { font-family: 'Open Sans', sans-serif; color: var(--graphite); background: #ffffff; }
        input[type='range'] { -webkit-appearance: none; appearance: none; background: transparent; }
        input[type='range']::-webkit-slider-runnable-track { height: 4px; border-radius: 9999px; background: #e5e5e5; }
        input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -5px; height: 14px; width: 14px; border-radius: 9999px; background: var(--brand); cursor: pointer; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); }
        input[type='range']::-moz-range-track { height: 4px; border-radius: 9999px; background: #e5e5e5; }
        input[type='range']::-moz-range-thumb { height: 14px; width: 14px; border: 2px solid white; border-radius: 9999px; background: var(--brand); cursor: pointer; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); }
      `}</style>

      <TopHeader />

      {/* Header is always shown */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: headerBg }}>
        <div className={`${sectionWidth} flex h-20 items-center justify-between`}>
          <div className="text-left text-lg font-extrabold tracking-[0.18em] text-white md:text-xl">
            {c("header::logo_text")}
          </div>
          <a href={c("links::header_cta")}>
            <Button variant="secondary" className="rounded-[4px] px-6 py-3 font-semibold text-white">
              {c("header::cta_label")}
            </Button>
          </a>
        </div>
      </header>

      {orderedSections as React.ReactNode[]}

      <Footer />
    </main>
  );
}
