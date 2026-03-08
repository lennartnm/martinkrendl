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
    const fullPath = `/p/${slug}`;
    // Try path match first (canonical for new pages)
    const { data: byPath } = await supabase
      .from("cms_pages").select("*").eq("path", fullPath).maybeSingle();
    if (byPath) return byPath;

    // Fallback: id may be slug directly (new pages) or slug with underscores (legacy)
    const { data: byId } = await supabase
      .from("cms_pages").select("*")
      .in("id", [slug, slug.replace(/-/g, "_")])
      .limit(1);
    return byId?.[0] ?? null;
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

    // ── Legacy section renderers (copies from home page, using ci() for instance-based lookup) ──
    logos: (instance) => {
      const label = ci(instance, "label") || c("logos_section::label");
      const logo1 = ci(instance, "logo_1") || c("images::logo1");
      const logo2 = ci(instance, "logo_2") || c("images::logo2");
      const logo3 = ci(instance, "logo_3") || c("images::logo3");
      const logos = [logo1, logo2, logo3].filter(Boolean);
      return (
        <section key={instance} className="py-12 md:py-14">
          <div className={sectionWidth}>
            {label && (
              <div className="mx-auto mb-8 max-w-3xl text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: brandColor }}>{label}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {logos.map((logo, idx) => (
                <div key={idx} className="flex h-28 w-[min(100%,260px)] items-center justify-center rounded-[4px] border border-neutral-200 bg-white p-4 md:h-32">
                  <CmsImage src={logo} alt={`Logo ${idx + 1}`} width={180} height={80} className="max-h-14 w-auto object-contain md:max-h-16" />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    },
    logos_legacy: (inst) => sectionRenderers["logos"](inst),

    feature_cards_3: (instance) => {
      const cards = [1, 2, 3].map(n => ({
        title: ci(instance + n, "title") || ci(`${instance}${n}`, "title") || c(`feature_card_${n}::title`),
        text:  ci(instance + n, "text")  || ci(`${instance}${n}`, "text")  || c(`feature_card_${n}::text`),
      }));
      const icons = [GraduationCap, Trophy, ShieldCheck];
      return (
        <section key={instance} className="pt-8 pb-14 md:pt-10 md:pb-20">
          <div className={sectionWidth}>
            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
              {cards.map((card, i) => {
                const Icon = icons[i];
                return (
                  <div key={i} className="rounded-[4px] px-6 py-8 text-center text-white" style={{ backgroundColor: brandColor }}>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-white/20 bg-white/10">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold"><RichText text={card.title} /></h3>
                    <p className="mt-3 text-sm leading-7 text-white/90"><RichText text={card.text} /></p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
    feature_cards_3_legacy: (inst) => sectionRenderers["feature_cards_3"](inst),

    feature_cards_4: (instance) => {
      const heading = ci(instance + "h", "title") || ci(`${instance}h`, "title") || c("features_2_heading::title");
      const subtext = ci(instance + "h", "text")  || ci(`${instance}h`, "text")  || c("features_2_heading::text");
      const cards = [1, 2, 3, 4].map(n => ({
        title: ci(instance + n, "title") || ci(`${instance}${n}`, "title") || c(`feature2_card_${n}::title`),
        text:  ci(instance + n, "text")  || ci(`${instance}${n}`, "text")  || c(`feature2_card_${n}::text`),
      }));
      const icons = [Users, Award, Video, MicVocal];
      const ctaLink = ci("links", "features_cta") || c("links::features_2_cta") || "#quiz";
      return (
        <section key={instance} className="py-14 md:py-20">
          <div className={sectionWidth}>
            {heading && (
              <div className="mx-auto mb-10 max-w-3xl text-center">
                <h2 className="text-3xl font-extrabold md:text-4xl"><RichText text={heading} /></h2>
                {subtext && <p className="mt-4" style={{ color: lightGray }}><RichText text={subtext} /></p>}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
              {cards.map((card, i) => {
                const Icon = icons[i];
                return (
                  <div key={i} className="rounded-[4px] px-5 py-7 text-center text-white" style={{ backgroundColor: brandColor }}>
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border border-white/20 bg-white/10">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold"><RichText text={card.title} /></h3>
                    <p className="mt-3 text-sm leading-7 text-white/90"><RichText text={card.text} /></p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <a href={ctaLink}>
                <Button className="rounded-[4px] px-6 py-3 font-semibold text-white hover:opacity-95" style={{ backgroundColor: brandColor }}>
                  Zum Kennenlern-Quiz
                </Button>
              </a>
            </div>
          </div>
        </section>
      );
    },
    feature_cards_4_legacy: (inst) => sectionRenderers["feature_cards_4"](inst),

    video_carousel: (instance) => {
      const title = ci(instance, "title") || c("video_section::title");
      const text  = ci(instance, "text")  || c("video_section::text");
      const videos = [
        { src: ci(instance, "vid1") || c("videos::carousel_1_src"), thumbnail: ci(instance, "thumb1") || c("videos::carousel_1_thumb") },
        { src: ci(instance, "vid2") || c("videos::carousel_2_src"), thumbnail: ci(instance, "thumb2") || c("videos::carousel_2_thumb") },
        { src: ci(instance, "vid3") || c("videos::carousel_3_src"), thumbnail: ci(instance, "thumb3") || c("videos::carousel_3_thumb") },
      ].filter(v => v.src);
      return (
        <VideoCarousel key={instance} title={title} text={text} brandColor={brandColor} videos={videos} />
      );
    },
    video_carousel_legacy: (inst) => sectionRenderers["video_carousel"](inst),

    testimonials: (instance) => {
      const t = (n: number, f: string) => ci(`${instance}${n}`, f) || c(`testimonial_${n}::${f}`);
      const tv = (n: number, f: string) => ci(`${instance}${n}`, f) || c(`videos::testimonial_${n}_${f}`);
      return (
        <TestimonialVideos key={instance}
          t1label={t(1, "label")} t1quote={t(1, "quote")} t1author={t(1, "author")}
          t1src={tv(1, "src")} t1thumb={tv(1, "thumb")}
          t2label={t(2, "label")} t2quote={t(2, "quote")} t2author={t(2, "author")}
          t2src={tv(2, "src")} t2thumb={tv(2, "thumb")}
          brandColor={brandColor}
        />
      );
    },
    testimonials_legacy: (inst) => sectionRenderers["testimonials"](inst),

    reviews: (instance) => {
      const reviewsTitle = ci(instance, "title") || c("reviews::title");
      const reviewList = [1, 2, 3].map(n => ({
        text:   ci(`${instance}${n}`, "text")   || c(`review_${n}::text`),
        author: ci(`${instance}${n}`, "author") || c(`review_${n}::author`),
      })).filter(r => r.text);
      return (
        <section key={instance} className="py-14 md:py-20">
          <div className={sectionWidth}>
            {reviewsTitle && (
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-3xl font-extrabold md:text-4xl"><RichText text={reviewsTitle} /></h2>
              </div>
            )}
            <div className="overflow-x-auto pb-4 [scrollbar-width:none] md:overflow-visible">
              <div className="flex gap-4 md:grid md:grid-cols-3 md:gap-6">
                {reviewList.map((review, idx) => (
                  <div key={idx} className="min-w-[88%] rounded-[4px] bg-neutral-100 p-6 md:min-w-0">
                    <div className="mb-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#D4AF37] text-[#D4AF37]" />)}
                    </div>
                    <p className="text-sm leading-7" style={{ color: graphite }}><RichText text={review.text} /></p>
                    <p className="mt-4 text-sm font-semibold" style={{ color: brandColor }}>– {review.author}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },
    reviews_legacy: (inst) => sectionRenderers["reviews"](inst),

    image_text_1: (inst) => sectionRenderers["image_text"](inst),
    image_text_2: (inst) => sectionRenderers["image_text"](inst),
    cta_banner: (inst) => {
      const bg = ci(inst, "bg_color") || brandColor;
      return (<section key={inst} className="py-14 md:py-20" style={{ backgroundColor: bg }}>
        <div className={sectionWidth}><div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="text-3xl font-extrabold md:text-4xl"><RichText text={ci(inst, "title")} /></h2>
          {ci(inst, "text") && <p className="mt-4 text-lg leading-8 text-white/85"><RichText text={ci(inst, "text")} /></p>}
          {ci(inst, "cta_label") && <a href={ci(inst, "cta_link") || "#"} className="mt-8 inline-block rounded-[4px] border-2 border-white px-8 py-4 font-bold text-white hover:opacity-90">{ci(inst, "cta_label")}</a>}
        </div></div>
      </section>);
    },
    stats_row: (inst) => {
      const stats = [1, 2, 3, 4].map(i => ({ num: ci(inst, `stat_${i}_number`), label: ci(inst, `stat_${i}_label`) })).filter(s => s.num);
      return (<section key={inst} className="py-14 md:py-20 bg-white">
        <div className={sectionWidth}><div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => <div key={i} className="text-center">
            <div className="text-4xl font-extrabold md:text-5xl" style={{ color: brandColor }}>{s.num}</div>
            <div className="mt-2 text-sm font-semibold" style={{ color: darkGray }}>{s.label}</div>
          </div>)}
        </div></div>
      </section>);
    },
    faq: (inst) => {
      const faqs = [1, 2, 3, 4, 5].map(i => ({ q: ci(inst + i, "question"), a: ci(inst + i, "answer") })).filter(f => f.q);
      return (<section key={inst} className="py-14 md:py-20">
        <div className={sectionWidth}><div className="mx-auto max-w-3xl">
          {ci(inst, "title") && <h2 className="text-3xl font-extrabold md:text-4xl text-center mb-10"><RichText text={ci(inst, "title")} /></h2>}
          <div className="space-y-3">{faqs.map((faq, i) => <details key={i} className="group rounded-[4px] border border-neutral-200 bg-white">
            <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold text-neutral-800 list-none">
              <RichText text={faq.q} /><span className="ml-4 shrink-0 text-neutral-400 group-open:rotate-45 transition-transform duration-200">+</span>
            </summary>
            <div className="px-5 pb-4 text-sm leading-7" style={{ color: darkGray }}><RichText text={faq.a} /></div>
          </details>)}</div>
        </div></div>
      </section>);
    },
    steps: (inst) => {
      const steps = [1, 2, 3, 4].map(i => ({ title: ci(inst + i, "title"), text: ci(inst + i, "text") })).filter(s => s.title);
      return (<section key={inst} className="py-14 md:py-20">
        <div className={sectionWidth}>
          {ci(inst, "title") && <div className="mx-auto mb-10 max-w-3xl text-center"><h2 className="text-3xl font-extrabold md:text-4xl"><RichText text={ci(inst, "title")} /></h2>{ci(inst, "text") && <p className="mt-4" style={{ color: lightGray }}><RichText text={ci(inst, "text")} /></p>}</div>}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => <div key={i} className="rounded-[4px] border border-neutral-200 bg-white p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ backgroundColor: brandColor }}>{i + 1}</div>
              <h3 className="font-bold text-neutral-800"><RichText text={step.title} /></h3>
              {step.text && <p className="mt-2 text-sm leading-7" style={{ color: darkGray }}><RichText text={step.text} /></p>}
            </div>)}
          </div>
        </div>
      </section>);
    },
    text_columns: (inst) => (<section key={inst} className="py-14 md:py-20">
      <div className={sectionWidth}>
        {ci(inst, "title") && <h2 className="text-3xl font-extrabold md:text-4xl text-center mb-10"><RichText text={ci(inst, "title")} /></h2>}
        <div className="grid gap-8 md:grid-cols-2">
          {["col_1", "col_2"].map((col, i) => <div key={i}>
            {ci(inst, `${col}_title`) && <h3 className="text-xl font-bold mb-3"><RichText text={ci(inst, `${col}_title`)} /></h3>}
            {ci(inst, `${col}_text`) && <p className="text-base leading-8" style={{ color: darkGray }}><RichText text={ci(inst, `${col}_text`)} /></p>}
          </div>)}
        </div>
      </div>
    </section>),
    image_fullwidth: (inst) => {
      const img = ci(inst, "image"); const title = ci(inst, "title");
      const op = parseFloat(ci(inst, "overlay_opacity") || "0.4");
      return (<section key={inst} className="relative overflow-hidden" style={{ maxHeight: "600px" }}>
        {img && <img src={img} alt="" className="w-full object-cover" style={{ maxHeight: "600px" }} />}
        {(title || op > 0) && <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: `rgba(0,0,0,${op})` }}>
          {title && <h2 className="px-4 text-center text-3xl font-extrabold text-white md:text-5xl"><RichText text={title} /></h2>}
        </div>}
      </section>);
    },
    checklist: (inst) => {
      const items = [1, 2, 3, 4, 5, 6].map(i => ci(inst + i, "item")).filter(Boolean);
      return (<section key={inst} className="py-14 md:py-20">
        <div className={sectionWidth}><div className="mx-auto max-w-3xl">
          {ci(inst, "title") && <h2 className="mb-4 text-3xl font-extrabold md:text-4xl"><RichText text={ci(inst, "title")} /></h2>}
          {ci(inst, "text") && <p className="mb-8 text-base leading-8" style={{ color: darkGray }}><RichText text={ci(inst, "text")} /></p>}
          <div className="grid gap-3 md:grid-cols-2">{items.map((item, i) => <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: brandColor }}>✓</div>
            <p className="text-base leading-7" style={{ color: graphite }}><RichText text={item} /></p>
          </div>)}</div>
          {ci(inst, "cta_label") && <div className="mt-8"><a href={ci(inst, "cta_link") || "#"} className="inline-block rounded-[4px] px-7 py-3.5 font-semibold text-white" style={{ backgroundColor: brandColor }}>{ci(inst, "cta_label")}</a></div>}
        </div></div>
      </section>);
    },
    image_gallery: (inst) => {
      const imgs = [1, 2, 3].map(i => ({ src: ci(inst + i, "image"), cap: ci(inst + i, "caption") })).filter(g => g.src);
      return (<section key={inst} className="py-14 md:py-20">
        <div className={sectionWidth}>
          {ci(inst, "title") && <h2 className="mb-10 text-3xl font-extrabold md:text-4xl text-center"><RichText text={ci(inst, "title")} /></h2>}
          <div className="grid gap-4 md:grid-cols-3">
            {imgs.map((img, i) => <div key={i}>
              <div className="relative aspect-square overflow-hidden rounded-[4px]"><CmsImage src={img.src} alt={img.cap || ""} fill className="object-cover" /></div>
              {img.cap && <p className="mt-2 text-center text-sm text-neutral-500">{img.cap}</p>}
            </div>)}
          </div>
        </div>
      </section>);
    },
    text_centered: (inst) => (<section key={inst} className="py-14 md:py-20">
      <div className={sectionWidth}><div className="mx-auto max-w-3xl text-center">
        {ci(inst, "label") && <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: brandColor }}>{ci(inst, "label")}</p>}
        {ci(inst, "title") && <h2 className="text-3xl font-extrabold md:text-4xl"><RichText text={ci(inst, "title")} /></h2>}
        {ci(inst, "text") && <p className="mt-5 text-lg leading-8" style={{ color: darkGray }}><RichText text={ci(inst, "text")} /></p>}
        {ci(inst, "cta_label") && <div className="mt-8"><a href={ci(inst, "cta_link") || "#"} className="inline-block rounded-[4px] px-8 py-4 font-bold text-white" style={{ backgroundColor: brandColor }}>{ci(inst, "cta_label")}</a></div>}
      </div></div>
    </section>),
    pricing: (inst) => {
      const pkgs = [1, 2, 3].map(i => ({ name: ci(inst + i, "name"), price: ci(inst + i, "price"), desc: ci(inst + i, "desc"), cta: ci(inst + i, "cta_label"), link: ci(inst + i, "cta_link") })).filter(p => p.name);
      return (<section key={inst} className="py-14 md:py-20">
        <div className={sectionWidth}>
          {ci(inst, "title") && <div className="mx-auto mb-10 max-w-3xl text-center"><h2 className="text-3xl font-extrabold md:text-4xl"><RichText text={ci(inst, "title")} /></h2>{ci(inst, "text") && <p className="mt-4" style={{ color: lightGray }}><RichText text={ci(inst, "text")} /></p>}</div>}
          <div className="grid gap-6 md:grid-cols-3">
            {pkgs.map((pkg, i) => <div key={i} className={`rounded-[4px] border-2 bg-white p-8 text-center ${i === 1 ? "shadow-xl scale-105" : ""}`} style={{ borderColor: i === 1 ? brandColor : "#E5E7EB" }}>
              {i === 1 && <div className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: brandColor }}>Empfohlen</div>}
              <h3 className="text-xl font-bold">{pkg.name}</h3>
              <div className="my-4 text-4xl font-extrabold" style={{ color: brandColor }}>{pkg.price}</div>
              {pkg.desc && <p className="mb-6 text-sm leading-7" style={{ color: darkGray }}><RichText text={pkg.desc} /></p>}
              {pkg.cta && <a href={pkg.link || "#"} className="block rounded-[4px] px-6 py-3 font-semibold text-white" style={{ backgroundColor: brandColor }}>{pkg.cta}</a>}
            </div>)}
          </div>
        </div>
      </section>);
    },
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
