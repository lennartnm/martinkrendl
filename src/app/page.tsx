import { Button } from '@/components/ui/Button';
import Quiz from '@/components/quiz';

export default function Page() {
  return (
    <>
      {/* HERO */}
      <section id="top" className="relative z-0">
        {/* Hero Mobile */}
        <div className="relative aspect-[4/5] sm:hidden">
          <div className="absolute inset-0">
            <img
              src="/fotobox-mobile.jpg"
              alt="Party-Gäste haben Spaß an einer Fotobox"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/70 pointer-events-none" aria-hidden="true" />
          </div>

          {/* Logo oben mittig (Mobile) */}
          <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 px-4">
            <img
              src="/Logo.png.webp"
              alt="Ihr Logo"
              className="w-44 sm:w-48 h-auto block drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]"
              loading="eager"
              sizes="40vw"
            />
          </div>

          {/* Overlay-Content */}
          <div className="absolute inset-0 z-10 grid place-items-center">
            <div className="mx-auto -translate-y-1 text-center text-white drop-shadow-[0_1px_8px_rgba(0,0,0,.35)] px-6">
              <h1 className="text-3xl xs:text-4xl font-semibold tracking-tight leading-tight">
                <strong>Die Fotobox für Deine unvergessliche Party<br /> im Salzburger Land 🕺</strong>
              </h1>
              <p className="mt-4 text-white/90 text-base leading-relaxed">
                Lachen, posieren, feiern: Mach Deine Weihnachtsfeier, Deinen Geburtstag oder Deine Hochzeit zum absoluten Highlight 📷
              </p>
              <div className="mt-8" />
            </div>
          </div>
        </div>

        {/* Hero Desktop */}
        <div className="relative hidden aspect-[16/6] sm:block">
          <div className="absolute inset-0">
            <img
              src="/fotobox-desktop.jpg"
              alt="Party-Gäste haben Spaß an einer Fotobox"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/70 pointer-events-none" aria-hidden="true" />
          </div>

          <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
            <img
              src="/Logo.png.webp"
              alt="Ihr Logo"
              className="h-12 w-auto lg:h-14 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]"
              loading="eager"
              sizes="20vw"
            />
          </div>

          <div className="absolute inset-0 z-10 grid place-items-center">
            <div className="mx-auto -translate-y-6 text-center text-white drop-shadow-[0_1px_8px_rgba(0,0,0,.35)] lg:-translate-y-10 px-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight">
                <strong>Die Fotobox für Deine unvergessliche Party<br className="inline lg:hidden" /> im Salzburger Land 🕺</strong>
              </h1>
              <p className="mt-4 text-white/90">
                Lachen, posieren, feiern: Mach Deine Weihnachtsfeier, Deinen Geburtstag oder Deine Hochzeit zum absoluten Highlight 📷
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUIZ (Offer-Fokus) – mobil normal, ab sm überlappend */}
      <section
        id="quiz"
        className="
          quiz-wrap relative z-10
          mt-12                 /* Mobile: normaler Abstand */
          sm:-mt-24 md:-mt-32 lg:-mt-40  /* Desktop: Überlappung mit dem Hero */
          px-5
        "
      >
        <div className="container">
          <div className="mx-auto w-full max-w-3xl rounded-lg border border-blue-200 bg-white p-7 sm:p-8 text-center shadow-xl">
            <p className="text-base sm:text-lg text-gray-700 mb-5 sm:mb-6">
              Jetzt unverbindliches Angebot für Deine Party-Fotobox anfordern, und den Abend unvergesslich machen 🙌 (kostenlos & unverbindlich)
            </p>
            <Quiz />
          </div>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="bg-white px-5 py-16 sm:py-24 mt-16 sm:mt-24">
        <div className="container">
          <p className="mx-auto max-w-3xl text-center text-base sm:text-xl text-gray-800 leading-relaxed">
            Eine Fotobox ist mehr als nur eine Kamera. Sie ist der <em>Garant</em> für ausgelassene Stimmung und die persönlichsten Erinnerungen an Dein Event – ob <span className="text-[#E63446]">Hochzeit</span>, <span className="text-[#E63446]">Geburtstag</span> oder <span className="text-[#E63446]">Weihnachtsfeier</span>.
          </p>
        </div>
      </section>

     {/* METHODE (Benefits) */}
<section className="bg-gray-50 px-5 py-16 sm:py-24 mt-16 sm:mt-24">
  <div className="container">
    <h2 className="text-center text-xl sm:text-3xl font-bold text-gray-900">
      Darum werden Deine Gäste eine Fotobox lieben
    </h2>
    <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:gap-7 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
      {[
        { title: 'Mega-Stimmung', text: 'Deine Gäste sind sofort im Party-Modus und haben Riesenspaß beim Posieren.' },
        { title: 'Stylische Auswahl', text: 'Wähle aus verschiedenen Stilen – von Vintage bis Modern – passend zu Deinem Event.' },
        { title: 'Unvergessliche Bilder', text: 'Drucke Deine lustigsten Momente sofort aus oder teile sie digital.' },
        { title: 'Rundum-Sorglos-Service', text: 'Lieferung, Aufbau und Abbau im Raum Salzburg übernehmen wir für Dich.' },
      ].map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-red-200/70 bg-red-50 p-6 text-center shadow-2xl flex flex-col justify-center min-h-[9rem] space-y-2"
        >
          <h3 className="text-lg sm:text-xl font-extrabold leading-tight text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.text}</p>
        </div>
      ))}
    </div>
    <div className="mt-10 flex justify-center">
      <Button asChild className="btn-brand rounded-md">
        <a href="#quiz">Jetzt für Dein Event in Salzburg anfragen!</a>
      </Button>
    </div>
  </div>
</section>

{/* GARANTIE - SEKTION 1 */}
<section className="bg-white px-5 py-16 sm:py-24 mt-16 sm:mt-24">
  <div className="container">
    <div className="mx-auto grid max-w-5xl items-center gap-8 md:gap-10 md:grid-cols-2">
      <div className="order-1 rounded-lg bg-white p-7 text-center shadow-2xl md:order-1 space-y-4">
        <p className="text-lg sm:text-2xl font-extrabold text-gray-900">
          Kein Stress, nur tolle Fotos: Unser Versprechen an Dich!
        </p>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Mit unseren Fotoboxen buchst Du eine garantierte Attraktion, die von der Buchung bis zur Abholung reibungslos läuft. Wir liefern pünktlich in Salzburg und Umgebung, bauen alles auf und sorgen für eine kinderleichte Bedienung.
        </p>
      </div>

      <div className="order-2 md:order-2">
        <img
          src="/fotobox1.jpg"
          alt="Fotobox im Einsatz auf einer Feier"
          className="w-full rounded-lg object-cover"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  </div>
</section>

{/* GARANTIE - SEKTION 2 */}
<section className="bg-white px-5 py-16 sm:py-24 mt-16 sm:mt-24">
  <div className="container">
    <div className="mx-auto grid max-w-5xl items-center gap-8 md:gap-10 md:grid-cols-2">
      <div className="order-1 rounded-lg bg-white p-7 text-center shadow-2xl md:order-2 space-y-4">
        <p className="text-lg sm:text-2xl font-extrabold text-gray-900">
          Beste Qualität und Service – Darauf kannst Du Dich verlassen!
        </p>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Wir legen Wert auf hochauflösende Fotos, professionelles Equipment und einen Service, der Dir den Rücken freihält. Genieße Deine Party, wir kümmern uns um die unvergesslichen Bilder.
        </p>
      </div>

      <div className="order-2 md:order-1">
        <img
          src="/fotobox2.jpg"
          alt="Fotobox im Einsatz auf einer Feier"
          className="w-full rounded-lg object-cover"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  </div>
</section>

{/* ANLÄSSE */}
<section className="bg-gray-50 px-5 py-16 sm:py-24 mt-16 sm:mt-24">
  <div className="container">
    <h2 className="text-center text-xl sm:text-3xl font-bold text-gray-900">
      Für jeden <span className="text-[#E63446]">Anlass</span> der richtige Style
    </h2>
  </div>
  <div className="container">
    <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:gap-7 grid-cols-1 sm:grid-cols-3">
      {[
        { value: 'Hochzeit', label: 'Romantisch, elegant oder verrückt – unvergessliche Hochzeitsfotos.' },
        { value: 'Weihnachtsfeier', label: 'Bringt Schwung in die Firmenfeier und lockert die Stimmung.' },
        { value: 'Geburtstag', label: 'Ob 18 oder 80: Die perfekte Attraktion für alle Altersgruppen.' },
      ].map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center rounded-lg border border-red-200/70 bg-red-50 p-6 text-center shadow-2xl space-y-2"
        >
          <p className="text-xl sm:text-3xl font-extrabold leading-tight text-gray-900">
            {item.value}
          </p>
          <p className="text-sm text-gray-600">{item.label}</p>
        </div>
      ))}
    </div>

    <div className="mt-10 flex justify-center">
      <Button asChild className="btn-brand rounded-md">
        <a href="#quiz-bottom">Jetzt unverbindlich mehr Informationen erhalten</a>
      </Button>
    </div>
  </div>
</section>


      {/* QUIZ (zweites Mal ganz unten) */}
      <section id="quiz-bottom" className="bg-white px-5 py-16 sm:py-24 mt-16 sm:mt-24">
        <div className="container">
          <div className="mx-auto w-full max-w-3xl rounded-lg border border-blue-200 bg-white p-7 sm:p-8 text-center shadow-xl">
            <p className="text-base sm:text-lg text-gray-700 mb-5 sm:mb-6">
              Bereit? Sichere Dir jetzt unverbindlich und kostenlos weitere Informationen zur Fotobox für Deine Party 🙌
            </p>
            <Quiz />
          </div>
        </div>
      </section>

      {/* GALERIE - Sektion mit Marquee + Scrollbar auf Mobile */}
<section className="bg-white px-5 py-16 sm:py-24 mt-16 sm:mt-24">
  <div className="container">
   

    {/* Desktop-Galerie */}
    <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-2 mt-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-square overflow-hidden rounded-md border border-white">
          <img
            src={`/${i}.jpg`}
            alt={`Fotobox Bild ${i}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>

    {/* Mobile Marquee-Scroll-Galerie */}
    <div className="sm:hidden mt-10 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <div className="flex animate-marquee gap-2">
        {[1, 2, 3, 4, 1, 2, 3, 4].map((i, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-64 h-64 rounded-md overflow-hidden border border-white"
          >
            <img
              src={`/${i}.jpg`}
              alt={`Fotobox Bild ${i}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      

      {/* ÜBER UNS */}
      <footer className="bg-gray-50 px-5 pt-16 pb-20 sm:pt-24 sm:pb-28 mt-16 sm:mt-24">
        <div className="container">
          <div className="mx-auto max-w-xl text-center space-y-5">
            <img
              src="/Logo.png.webp"
              alt="Ihr Logo"
              className="mx-auto h-16 w-auto mb-1"
              loading="lazy"
              sizes="25vw"
            />
            <p className="text-sm text-gray-600 leading-relaxed">
              Wir sind Dein Team für hochwertige Fotoboxen im Salzburger Land. Mit viel Liebe zum Detail,
              zuverlässigem Service und echtem Party-Feeling sorgen wir für Erinnerungen, die bleiben.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
