export default function Footer() {
  return (
    <footer className="bg-slate-100 text-black border-t border-slate-200 py-8 text-center text-sm">
      <div className="space-x-4">
        <a href="https://www.martinkrendl.com/impressum/" className="transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20">Impressum</a>
        <a href="https://www.martinkrendl.com/datenschutz/" className="transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20">Datenschutz</a>
         
      </div>
      <p className="mt-3">© {new Date().getFullYear()} Martin Krendl. Alle Rechte vorbehalten.</p>
    </footer>
  );
}
