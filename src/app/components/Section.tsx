import { ReactNode } from 'react';
import clsx from 'clsx';

export function Section({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={clsx('mx-auto max-w-7xl px-6 py-14 md:py-20', className)}>
      {children}
    </section>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{children}</h2>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="text-sm font-semibold uppercase tracking-wider text-primary-600">{children}</div>;
}
