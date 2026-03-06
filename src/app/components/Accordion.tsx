'use client';
import { useId, useState } from 'react';
import clsx from 'clsx';

export function Accordion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx('divide-y divide-gray-200 rounded-xl border border-gray-100', className)}>{children}</div>;
}

export function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <button
        className="flex w-full items-center justify-between p-4 text-left font-medium"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{question}</span>
        <span className="ml-4 text-xl">{open ? '–' : '+'}</span>
      </button>
      <div id={id} hidden={!open} className="px-4 pb-4 text-gray-700">
        {answer}
      </div>
    </div>
  );
}
