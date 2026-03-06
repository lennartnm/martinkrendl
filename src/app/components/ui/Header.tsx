"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Startseite" },
    { href: "/funktionsweise", label: "Funktionsweise" },
    { href: "/#preise", label: "Preise" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center md:items-end justify-between">
        {/* Brand + Desktop Navigation (grouped) */}
        <div className="flex items-center md:items-end gap-10">
          {/* Brand */}
          <a
            href="/"
            className="inline-flex items-end"
            aria-label="findbar – Startseite"
          >
            <Image
              src="/Findbar%20Logo%20PNG.webp"
              alt="findbar Logo"
              width={160}
              height={40}
              priority
              className="block h-8 md:h-10 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-end gap-8 text-sm text-slate-700">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="leading-none pb-0.5 transition-colors hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block md:self-end">
          <Button asChild className="self-end">
            <a href="/#preise">Jetzt anfragen</a>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-xl p-2 border border-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü öffnen</span>
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-6 pb-4 border-t border-slate-100">
          <div className="flex flex-col gap-4 py-4 text-base text-slate-800">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block leading-none pb-0.5 transition-colors hover:text-slate-900"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
          <Button asChild className="w-full">
            <a href="/#preise" onClick={() => setOpen(false)}>Jetzt anfragen</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
