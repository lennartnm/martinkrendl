'use client';
import { ReactNode, useRef } from 'react';
import clsx from 'clsx';

export function Carousel({
  children,
  ariaLabel,
  className,
}: {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={ref}
        aria-label={ariaLabel}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* Hide scrollbar */}
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {Array.isArray(children)
          ? children.map((c, i) => (
              <div key={i} className="snap-start">
                {c}
              </div>
            ))
          : children}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
        <button
          aria-label="Zurück"
          onClick={() => scrollBy(-400)}
          className="pointer-events-auto m-2 rounded-full bg-white/90 p-2 shadow ring-1 ring-gray-200 hover:bg-white"
        >
          ‹
        </button>
        <button
          aria-label="Weiter"
          onClick={() => scrollBy(400)}
          className="pointer-events-auto m-2 rounded-full bg-white/90 p-2 shadow ring-1 ring-gray-200 hover:bg-white"
        >
          ›
        </button>
      </div>
    </div>
  );
}
