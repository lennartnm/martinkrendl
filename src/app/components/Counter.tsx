'use client';
import { useEffect, useRef, useState } from 'react';

export function Counter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const duration = 900;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * easeOutCubic(p)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, value]);

  return (
    <div ref={ref} className="rounded-xl border border-gray-100 p-6 text-center shadow-sm">
      <div className="text-4xl font-bold">
        {n}
        {suffix}
      </div>
      <div className="mt-2 text-gray-700">{label}</div>
    </div>
  );
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
