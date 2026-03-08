// src/app/p/[slug]/page.tsx
// Dynamic route for CMS-managed pages created via the admin panel.
// This catches all /p/[slug] routes and renders content from Supabase.
// 
// HOW IT WORKS:
// 1. Admin creates a page in CMS (e.g. "Herbst Landingpage" at path "/p/herbst")
// 2. The page ID in cms_pages is derived from the path slug
// 3. This route renders that page using the same section renderers as page.tsx
// 4. No manual code changes needed for new pages!

import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Footer from "@/components/ui/Footer";
import TopHeader from "@/components/TopHeader";
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

async function getPageBySlug(slug: string) {
  try {
    // Try exact path match first (/p/slug)
    const fullPath = `/p/${slug}`;
    const { data: byPath } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("path", fullPath)
      .single();
    if (byPath) return byPath;

    // Fallback: try by ID
    const { data: byId } = await supabase
      .from("cms_pages")
      .select("*")
      .eq("id", slug)
      .single();
    return byId || null;
  } catch {
    return null;
  }
}

async function getContent(pageId: string): Promise<Record<string, string>> {
  try {
    const { data } = await supabase
      .from("cms_content")
      .select("section_key, field_key, value")
      .eq("page", pageId);
    const map: Record<string, string> = {};
    for (const entry of data || []) {
      map[`${entry.section_key}::${entry.field_key}`] = entry.value;
    }
    return map;
  } catch { return {}; }
}

async function getSections(pageId: string): Promise<CmsSection[]> {
  try {
    const { data } = await supabase
      .from("cms_sections")
      .select("section_instance, section_type, hidden, sort_order")
      .eq("page_id", pageId)
      .order("sort_order");
    return data || [];
  } catch { return []; }
}

async function getGlobalSettings(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.from("global_settings").select("*");
    const map: Record<string, string> = {};
    for (const row of data || []) map[row.key] = row.value;
    return map;
  } catch { return {}; }
}

const featureIcons = [GraduationCap, Trophy, ShieldCheck];
const secondFeatureIcons = [Users, Award, Video, MicVocal];
const sectionWidth = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

function CmsImage({ src, alt, fill, width, height, className, priority }: {
  src: string; alt: string; fill?: boolean;
  width?: number; height?: number; className?: string; priority?: boolean;
}) {
  if (!src) return null;
  const isExternal = src.startsWith("http");
  if (fill) {
    return isExternal
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className || ""}`} style={{ objectFit: "cover" }} />
      : <Image src={src} alt={alt} fill className={className} priority={priority} />;
  }
  return isExternal
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={src} alt={alt} width={width} height={height} className={className} />
    : <Image src={src} alt={alt} width={width || 400} height={height || 300} className={className} />;
}

// Rich text renderer: **bold** and *italic* support
function RichText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </span>
  );
}

export async function generateStaticParams() {
  // Will be empty on build; pages are rendered dynamically
  return [];
}

export const dynamic = "force-dynamic";

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  const [cms, dbSections, headerCms, globalSettings] = await Promise.all([
    getContent(page.id),
    getSections(page.id),
    getContent("component_header"),
    getGlobalSettings(),
  ]);

  const c = (key: string) => cms[key] ?? "";
  const ci = (instance: string, field: string) => cms[`${instance}::${field}`] ?? "";

  // Layout settings
  const showHeader = cms["layout::show_header"] !== "false";
  const showFooter = cms["layout::show_footer"] !== "false";

  // Header from CMS
  const headerLogoText  = headerCms["header::logo_text"]  || "MARTIN KRENDL";
  const headerCtaLabel  = headerCms["header::cta_label"]  || "Kostenloses Kennenlernen";
  const headerCtaLink   = headerCms["header::cta_link"]   || "#quiz";
  const headerBg        = headerCms["header::bg_color"]   || "#884A4A";
  const headerShowTopbar = headerCms["header::show_topbar"] !== "false";
  const headerTopbarText  = headerCms["header::topbar_text"] || "Gesangsunterricht in Steyr oder online 🎶";
  const headerTopbarBg    = headerCms["header::topbar_bg"]   || "#e0e0e0";
  const headerTopbarColor = headerCms["header::topbar_color"] || "#333333";

  // Font
  const fontFamily = globalSettings["font_family"] || "Open Sans";
  const fontUrl    = globalSettings["font_url"]    || `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700;800&display=swap`;

  // Colors
  const brandColor = c("colors::brand") || "#884A4A";
  const graphite   = c("colors::graphite") || "#2F2F2F";
  const darkGray   = c("colors::dark_gray") || "#4A4A4A";
  const lightGray  = c("colors::light_gray") || "#6B6B6B";
  const quizBg     = c("colors::quiz_bg") || "#F7F7F7";

  const activeSections = dbSections.filter(s => !s.hidden);

  const sectionRenderers: Record<string, (instance: string) => React.ReactNode> = {
    header: () => null,
    global_colors: () => null,
    hero_legacy: (inst) => sectionRenderers["hero"](inst),
    hero: (instance) => {
      const title    = ci(instance, "title")     || "Sing freier, sicherer und mit mehr Ausdruck";
      const subtitle = ci(instance, "subtitle")  || "";
      const ctaLabel = ci(instance, "cta_label") || "Probestunde anfragen";
      const ctaLink  = ci(instance, "cta_link")  || "#quiz";
      const proof    = ci(instance, "social_proof") || "";
      const image    = ci(instance, "image") || "/martin-desktop.jpg";
      return (
        <section key={instance} className="relative">
          <div className="relative aspect-square w-full md:aspect-[16/6]">
            <CmsImage src={image} alt="Hero" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
            <div className="absolute inset-x-0 bottom-0">
              <div className={`${sectionWidth} pb-10 md:pb-14`}>
                <div className="mx-auto max-w-4xl text-center text-white">
                  <h1 className="text-3xl font-extrabold leading-tight md:text-5xl"><RichText text={title} /></h1>
                  {subtitle && <p className="mt-4 text-sm text-white/85 md:text-lg"><RichText text={subtitle} /></p>}
                  <div className="mt-6">
                    <a href={ctaLink}>
                      <Button className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                        {ctaLabel}
                      </Button>
                    </a>
                  </div>
                  {proof && (
                    <div className="mt-4 flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />)}
                      </div>
                      <p className="text-sm font-semibold text-white/90">{proof}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    },
    flowing_text: (instance) => {
      const text = ci(instance, "text") || c("flowing_text::text");
      return (
        <section key={instance} className="py-16 md:py-20" style={{ backgroundColor: brandColor }}>
          <div className={sectionWidth}>
            <p className="mx-auto max-w-4xl text-center text-xl font-semibold leading-9 text-white md:text-2xl md:leading-10">
              <RichText text={text} />
            </p>
          </div>
        </section>
      );
    },
    flowing_text_legacy: (inst) => sectionRenderers["flowing_text"](inst),
    quote: (instance) => {
      const label = ci(instance, "label") || c("quote_section::label");
      const quote = ci(instance, "quote") || c("quote_section::quote");
      const bg    = ci(instance, "bg")    || c("images::quote_bg");
      return (
        <section key={instance} className="relative py-20 md:py-28">
          {bg && <CmsImage src={bg} alt="" fill className="object-cover" />}
          <div className="absolute inset-0 bg-black/60" />
          <div className={`${sectionWidth} relative`}>
            <div className="mx-auto max-w-3xl text-center">
              {label && <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/70">{label}</p>}
              <blockquote className="text-2xl font-bold italic leading-10 text-white md:text-3xl md:leading-[1.4]">
                <RichText text={quote} />
              </blockquote>
            </div>
          </div>
        </section>
      );
    },
    quote_legacy: (inst) => sectionRenderers["quote"](inst),
    final_cta: (instance) => {
      const title    = ci(instance, "title")     || c("final_cta::title");
      const text     = ci(instance, "text")      || c("final_cta::text");
      const ctaLabel = ci(instance, "cta_label") || c("final_cta::cta_label");
      const ctaLink  = ci(instance, "cta_link")  || c("links::final_cta") || "#quiz";
      const image    = ci(instance, "image")     || c("images::final_cta");
      return (
        <section key={instance} className="relative py-20 md:py-28">
          {image && <CmsImage src={image} alt="" fill className="object-cover" />}
          <div className="absolute inset-0 bg-black/60" />
          <div className={`${sectionWidth} relative`}>
            <div className="mx-auto max-w-2xl text-center text-white">
              <h2 className="text-3xl font-extrabold md:text-4xl"><RichText text={title} /></h2>
              {text && <p className="mt-5 text-lg leading-8 text-white/85"><RichText text={text} /></p>}
              <a href={ctaLink} className="mt-8 inline-block rounded-[4px] px-8 py-4 font-bold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                {ctaLabel}
              </a>
            </div>
          </div>
        </section>
      );
    },
    final_cta_legacy: (inst) => sectionRenderers["final_cta"](inst),
    quiz: (instance) => (
      <section key={instance} id="quiz" className="py-16 md:py-20" style={{ backgroundColor: quizBg }}>
        <div className={sectionWidth}>
          <Quiz quizId={ci(instance, "quiz_id") || "component_quiz"} />
        </div>
      </section>
    ),
    image_text: (instance) => {
      const title    = ci(instance, "title");
      const text     = ci(instance, "text");
      const bullet1  = ci(instance, "bullet_1");
      const bullet2  = ci(instance, "bullet_2");
      const bullet3  = ci(instance, "bullet_3");
      const ctaLabel = ci(instance, "cta_label");
      const ctaLink  = ci(instance, "cta_link") || "#quiz";
      const image    = ci(instance, "image");
      return (
        <section key={instance} className="py-16 md:py-20">
          <div className={sectionWidth}>
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              {image && (
                <div className="relative aspect-square overflow-hidden rounded-[4px]">
                  <CmsImage src={image} alt={title} fill className="object-cover" />
                </div>
              )}
              <div>
                {title && <h2 className="text-3xl font-extrabold md:text-4xl" style={{ color: graphite }}><RichText text={title} /></h2>}
                {text && <p className="mt-5 text-base leading-8" style={{ color: darkGray }}><RichText text={text} /></p>}
                {[bullet1, bullet2, bullet3].filter(Boolean).length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {[bullet1, bullet2, bullet3].filter(Boolean).map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: brandColor }} />
                        <span className="text-base" style={{ color: darkGray }}><RichText text={b} /></span>
                      </li>
                    ))}
                  </ul>
                )}
                {ctaLabel && (
                  <a href={ctaLink} className="mt-8 inline-block rounded-[4px] px-7 py-3.5 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                    {ctaLabel}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      );
    },
    about: (instance) => {
      const label  = ci(instance, "label") || c("about::label");
      const title  = ci(instance, "title") || c("about::title");
      const text1  = ci(instance, "text_1") || c("about::text_1");
      const text2  = ci(instance, "text_2") || c("about::text_2");
      const text3  = ci(instance, "text_3") || c("about::text_3");
      const image  = ci(instance, "image") || c("images::about");
      return (
        <section key={instance} className="py-16 md:py-20">
          <div className={sectionWidth}>
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              {image && (
                <div className="relative aspect-square max-w-sm overflow-hidden rounded-full mx-auto md:mx-0">
                  <CmsImage src={image} alt={title} fill className="object-cover" />
                </div>
              )}
              <div>
                {label && <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: brandColor }}>{label}</p>}
                <h2 className="text-3xl font-extrabold md:text-4xl" style={{ color: graphite }}><RichText text={title} /></h2>
                {[text1, text2, text3].filter(Boolean).map((t, i) => (
                  <p key={i} className="mt-4 text-base leading-8" style={{ color: darkGray }}><RichText text={t} /></p>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },
    about_legacy: (inst) => sectionRenderers["about"](inst),
  };

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
        @import url('${fontUrl}');
        html { scroll-behavior: smooth; }
        body { font-family: '${fontFamily}', sans-serif; color: var(--graphite); background: #ffffff; }
      `}</style>

      {showHeader && headerShowTopbar && (
        <TopHeader text={headerTopbarText} bgColor={headerTopbarBg} textColor={headerTopbarColor} />
      )}

      {showHeader && (
        <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: headerBg }}>
          <div className={`${sectionWidth} flex h-20 items-center justify-between`}>
            <div className="text-left text-lg font-extrabold tracking-[0.18em] text-white md:text-xl">
              {headerLogoText}
            </div>
            <a href={headerCtaLink}>
              <Button variant="secondary" className="rounded-[4px] px-6 py-3 font-semibold text-white">
                {headerCtaLabel}
              </Button>
            </a>
          </div>
        </header>
      )}

      {orderedSections as React.ReactNode[]}

      {showFooter && <Footer />}
    </main>
  );
}
