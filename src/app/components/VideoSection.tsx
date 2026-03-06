"use client";
// src/app/components/VideoSection.tsx
// Empfängt Video-URLs und Brand-Farbe als Props vom Server (CMS-gesteuert)

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type VideoEntry = { src: string; thumbnail: string };
type VideoState = { duration: number; currentTime: number; isPlaying: boolean };

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// ── CmsImg: supports both local paths and full URLs ───────────────────────────
function CmsImg({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className || ""}`} />
  );
}

// ── ThumbnailVideo ────────────────────────────────────────────────────────────
function ThumbnailVideo({
  src, thumbnail, alt, className = "", videoClassName = "",
  controls = false, playsInline = true, preload = "metadata",
  onVideoRef, onLoadedMetadata, onTimeUpdate, onPlay, onPause,
}: {
  src: string; thumbnail: string; alt: string;
  className?: string; videoClassName?: string;
  controls?: boolean; playsInline?: boolean; preload?: "none" | "metadata" | "auto";
  onVideoRef?: (el: HTMLVideoElement | null) => void;
  onLoadedMetadata?: () => void; onTimeUpdate?: () => void;
  onPlay?: () => void; onPause?: () => void;
}) {
  const [showThumbnail, setShowThumbnail] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {showThumbnail && (
        <div className="pointer-events-none absolute inset-0 z-10">
          <CmsImg src={thumbnail} alt={alt} />
          <div className="absolute inset-0 bg-black/10" />
        </div>
      )}
      <video
        ref={onVideoRef}
        src={src}
        controls={controls}
        playsInline={playsInline}
        preload={preload}
        poster={thumbnail}
        className={`${videoClassName} relative z-20`}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onPlay={() => { setShowThumbnail(false); onPlay?.(); }}
        onPause={onPause}
        controlsList="nodownload"
      />
    </div>
  );
}

// ── CarouselVideoCard ─────────────────────────────────────────────────────────
function CarouselVideoCard({
  video, index, state, brandColor, isActive,
  onSelect, onTogglePlay, onSeek,
  onLoadedMetadata, onTimeUpdate, onPlay, onPause, videoRef,
}: {
  video: VideoEntry; index: number; state: VideoState;
  brandColor: string; isActive: boolean;
  onSelect: () => void; onTogglePlay: () => void; onSeek: (v: number) => void;
  onLoadedMetadata: () => void; onTimeUpdate: () => void;
  onPlay: () => void; onPause: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
}) {
  const duration = state.duration || 0;
  const currentTime = Math.min(state.currentTime, duration || 0);

  return (
    <div className={`overflow-hidden rounded-[4px] border border-neutral-200 bg-white shadow-sm transition-all duration-300 ${isActive ? "scale-100" : "scale-[0.96]"}`}>
      <button type="button" onClick={onSelect} className="block w-full text-left" aria-label={`Video ${index + 1} auswählen`}>
        <div className="relative aspect-video bg-black">
          <ThumbnailVideo
            src={video.src} thumbnail={video.thumbnail}
            alt={`Vorschaubild Video ${index + 1}`}
            className="h-full w-full" videoClassName="h-full w-full object-cover"
            preload="metadata" onVideoRef={videoRef}
            onLoadedMetadata={onLoadedMetadata} onTimeUpdate={onTimeUpdate}
            onPlay={onPlay} onPause={onPause}
          />
        </div>
      </button>
      <div className="border-t border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            aria-label={state.isPlaying ? `Video ${index + 1} pausieren` : `Video ${index + 1} abspielen`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] text-white"
            style={{ backgroundColor: brandColor }} type="button" onClick={onTogglePlay}
          >
            {state.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <div className="flex w-full items-center gap-3">
            <input
              type="range" min={0} max={duration || 0} step={0.1} value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))} className="w-full"
              aria-label={`Timeline Video ${index + 1}`}
            />
            <div className="min-w-[78px] text-right text-xs text-[color:var(--lightGray)]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── VideoCarousel (export) ────────────────────────────────────────────────────
export function VideoCarousel({
  title, text, brandColor, videos,
}: {
  title: string; text: string; brandColor: string;
  videos: VideoEntry[];
}) {
  const sectionWidth = "mx-auto w-full max-w-[1200px] px-4 md:px-6";
  const [activeVideo, setActiveVideo] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [videoStates, setVideoStates] = useState<VideoState[]>(
    videos.map(() => ({ duration: 0, currentTime: 0, isPlaying: false }))
  );

  // Sync state length if videos change
  useEffect(() => {
    setVideoStates(videos.map(() => ({ duration: 0, currentTime: 0, isPlaying: false })));
  }, [videos.length]);

  const orderedVideos = useMemo(() => {
    const len = videos.length;
    if (len === 0) return [];
    const leftIndex = (activeVideo - 1 + len) % len;
    const rightIndex = (activeVideo + 1) % len;
    return [leftIndex, activeVideo, rightIndex];
  }, [activeVideo, videos.length]);

  const updateVideoState = (index: number, patch: Partial<VideoState>) => {
    setVideoStates((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleLoadedMetadata = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    updateVideoState(index, { duration: Number.isFinite(video.duration) ? video.duration : 0, currentTime: video.currentTime || 0 });
  };

  const handleTimeUpdate = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    updateVideoState(index, { currentTime: video.currentTime || 0 });
  };

  const handleTogglePlay = async (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    videoRefs.current.forEach((v, i) => { if (i !== index && v && !v.paused) v.pause(); });
    if (video.paused) { try { await video.play(); } catch {} } else { video.pause(); }
  };

  const handleSeek = (index: number, value: number) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.currentTime = value;
    updateVideoState(index, { currentTime: value });
  };

  useEffect(() => {
    videoRefs.current.forEach((video, index) => { if (video && index !== activeVideo) video.pause(); });
  }, [activeVideo]);

  if (videos.length === 0) return null;

  return (
    <section className="py-14 md:py-20">
      <div className={sectionWidth}>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">{title}</h2>
          <p className="mt-3 text-[color:var(--lightGray)]">{text}</p>
        </div>

        {/* Mobile */}
        <div className="overflow-x-auto pb-4 [scrollbar-width:none] md:hidden">
          <div className="flex snap-x snap-mandatory gap-4">
            {videos.map((video, i) => (
              <div key={`${video.src}-${i}`} className="min-w-[88%] snap-center">
                <CarouselVideoCard
                  video={video} index={i}
                  state={videoStates[i] || { duration: 0, currentTime: 0, isPlaying: false }}
                  brandColor={brandColor} isActive={activeVideo === i}
                  onSelect={() => setActiveVideo(i)}
                  onTogglePlay={() => handleTogglePlay(i)}
                  onSeek={(v) => handleSeek(i, v)}
                  onLoadedMetadata={() => handleLoadedMetadata(i)}
                  onTimeUpdate={() => handleTimeUpdate(i)}
                  onPlay={() => updateVideoState(i, { isPlaying: true })}
                  onPause={() => updateVideoState(i, { isPlaying: false })}
                  videoRef={(el) => { videoRefs.current[i] = el; }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <div className="flex items-center justify-center gap-4 lg:gap-6">
            {orderedVideos.map((videoIndex, position) => {
              const video = videos[videoIndex];
              if (!video) return null;
              const isCenter = position === 1;
              return (
                <div
                  key={`${video.src}-${position}`}
                  className={`transition-all duration-300 ${isCenter ? "w-[52%] lg:w-[56%]" : "w-[24%] lg:w-[22%] cursor-pointer opacity-80 hover:opacity-100"}`}
                >
                  <CarouselVideoCard
                    video={video} index={videoIndex}
                    state={videoStates[videoIndex] || { duration: 0, currentTime: 0, isPlaying: false }}
                    brandColor={brandColor} isActive={isCenter}
                    onSelect={() => setActiveVideo(videoIndex)}
                    onTogglePlay={() => handleTogglePlay(videoIndex)}
                    onSeek={(v) => handleSeek(videoIndex, v)}
                    onLoadedMetadata={() => handleLoadedMetadata(videoIndex)}
                    onTimeUpdate={() => handleTimeUpdate(videoIndex)}
                    onPlay={() => updateVideoState(videoIndex, { isPlaying: true })}
                    onPause={() => updateVideoState(videoIndex, { isPlaying: false })}
                    videoRef={(el) => { videoRefs.current[videoIndex] = el; }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center gap-2">
            {videos.map((_, index) => (
              <button
                key={index} type="button" onClick={() => setActiveVideo(index)}
                aria-label={`Video ${index + 1} auswählen`}
                className={`h-2.5 rounded-full transition-all ${activeVideo === index ? "w-8" : "w-2.5"}`}
                style={{ backgroundColor: activeVideo === index ? brandColor : "rgb(212 212 212)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── TestimonialVideos (export) ────────────────────────────────────────────────
export function TestimonialVideos({
  t1label, t1quote, t1author, t1src, t1thumb,
  t2label, t2quote, t2author, t2src, t2thumb,
  brandColor,
}: {
  t1label: string; t1quote: string; t1author: string; t1src: string; t1thumb: string;
  t2label: string; t2quote: string; t2author: string; t2src: string; t2thumb: string;
  brandColor: string;
}) {
  const sectionWidth = "mx-auto w-full max-w-[1200px] px-4 md:px-6";

  return (
    <section className="py-14 md:py-20">
      <div className={`${sectionWidth} space-y-12`}>
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="overflow-hidden rounded-[4px] border border-neutral-200 bg-white">
            <div className="relative aspect-video bg-black">
              <ThumbnailVideo
                src={t1src} thumbnail={t1thumb} alt="Review Video 1"
                className="h-full w-full" videoClassName="h-full w-full object-cover"
                controls preload="metadata"
              />
            </div>
          </div>
          <div className="rounded-[4px] bg-neutral-100 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: brandColor }}>{t1label}</p>
            <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-[color:var(--graphite)]">{t1quote}</blockquote>
            <p className="mt-4 text-sm leading-7 text-[color:var(--lightGray)]">{t1author}</p>
          </div>
        </div>

        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="order-2 rounded-[4px] bg-neutral-100 p-8 md:order-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: brandColor }}>{t2label}</p>
            <blockquote className="mt-4 text-2xl font-bold leading-relaxed text-[color:var(--graphite)]">{t2quote}</blockquote>
            <p className="mt-4 text-sm leading-7 text-[color:var(--lightGray)]">{t2author}</p>
          </div>
          <div className="order-1 overflow-hidden rounded-[4px] border border-neutral-200 bg-white md:order-2">
            <div className="relative aspect-video bg-black">
              <ThumbnailVideo
                src={t2src} thumbnail={t2thumb} alt="Review Video 2"
                className="h-full w-full" videoClassName="h-full w-full object-cover"
                controls preload="metadata"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
