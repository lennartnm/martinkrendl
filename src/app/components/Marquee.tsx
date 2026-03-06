import { ReactNode } from 'react';
import clsx from 'clsx';

export function Marquee({
  children,
  ariaLabel,
  speed = 20,
  className,
}: {
  children: ReactNode;
  ariaLabel?: string;
  speed?: number; // px/s
  className?: string;
}) {
  // CSS variable steuert die Geschwindigkeit
  return (
    <div
      aria-label={ariaLabel}
      className={clsx('relative overflow-hidden', className)}
      style={{ ['--speed' as any]: `${speed}s` }}
    >
      <div className="flex w-max animate-marquee items-center py-6">
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
