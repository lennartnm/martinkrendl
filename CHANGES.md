# Änderungen & neue Features

## Wichtig: SQL Migration zuerst ausführen!
Führe `MIGRATION.sql` einmalig im Supabase SQL Editor aus, bevor du deployst.

---

## 1. CMS – Bessere Feldstruktur
- Felder im ausgeklappten Bereich sind nach Gruppen **Text, Bilder & Videos, Links, Farben** gegliedert
- Jede Gruppe hat eine farbige Kopfzeile und kann einzeln auf-/zugeklappt werden

## 2. Drag & Drop – Auto-Scroll
- Beim Verschieben einer Sektion scrollt die Seite automatisch, wenn man oben/unten an den Viewport-Rand kommt

## 3. Duplikat-Loading
- Nach dem Duplizieren einer Sektion erscheint ein Ladeindikator
- Neue Sektionen sind standardmäßig ausgeblendet

## 4. Header als eigene Komponente
- Der Header ist jetzt unter CMS → Komponenten → **Header** editierbar
- Felder: Logo-Text, Button-Text, Button-Link, Hintergrundfarbe, Topbar-Text/Farbe
- Pro Seite lässt sich per Checkbox steuern, ob **Header & Footer** angezeigt werden (standardmäßig aktiv)

## 5. Bold & Italic in Texten
- In allen Textfeldern (im CMS) kann mit `**fett**` und `*kursiv*` formatiert werden
- Die bestehenden Texte bleiben unverändert (keine Formatierung)

## 6. Globale Schriftart
- Im CMS-Bereich gibt es ein **Font-Panel** mit 15 Google Fonts zur Auswahl
- Die gewählte Schrift gilt für alle Seiten, den Admin-Bereich und die Login-Seite

## 7. Dynamische Seiten ohne Code-Anpassung
- Neue Seiten sind automatisch unter `/p/[slug]` erreichbar (z.B. `/p/herbst-2025`)
- Die Route `src/app/p/[slug]/page.tsx` rendert alle CMS-Sektionen dynamisch
- **Kein manuelles Anlegen von Next.js-Routen mehr nötig!**

## 8. Nur echte Seiten als Vorlagen
- Beim Duplizieren/Neu-Anlegen einer Seite werden nur echte Seiten (keine Komponenten) als Vorlage angeboten

## 9. Quiz-Verwaltung
- Im CMS gibt es unter dem Seiten-Dropdown **"Quiz duplizieren / neu anlegen"**
- Jede Quiz-Variante hat eigene Texte, Bilder und Farben
- Im Quiz-Abschnitt einer Seite gibt es ein **Dropdown** zum Auswählen, welches Quiz verwendet wird
- Der Sektions-Hintergrund ist pro Quiz-Sektion wählbar

## 10. Analytics – Quiz-Dropdown
- Im Analytics-Tab gibt es oberhalb des Funnels ein **Dropdown** zum Filtern nach Quiz-Variante
- Die Funnel-Daten werden pro Quiz separat gespeichert

## 11. Login & Passwort-Verwaltung
- **"Passwort vergessen"** Link auf der Login-Seite
- Reset-Token-System: Bei Anforderung wird per E-Mail (via Resend, wenn `RESEND_API_KEY` gesetzt) ein Reset-Link verschickt
- In Development wird der Link in der Console ausgegeben
- Neue Seite `/admin/reset-password` für das Setzen eines neuen Passworts
- Passworter können auch eingeloggt unter den Admin-Einstellungen geändert werden
- Erstpasswort kann via Supabase SQL gesetzt werden (Hash generieren mit bcrypt)

---

## Benötigte Umgebungsvariablen (optional)
```
RESEND_API_KEY=...           # Für E-Mail-Versand bei Passwort-Reset
RESEND_FROM_EMAIL=...        # Absender-E-Mail (Standard: noreply@martinkrendl.at)
NEXT_PUBLIC_SITE_URL=...     # Für korrekte Reset-Links (z.B. https://martinkrendl.vercel.app)
```

## Supabase: Erstpasswort setzen
```sql
-- Neues Passwort-Hash generieren (z.B. für "meinPasswort123"):
-- Benutze bcrypt mit cost 12
UPDATE admin_users 
SET password_hash = '$2b$12$...' -- Hash hier einfügen
WHERE email = 'admin@martinkrendl.at';
```

Alternativ: Beim ersten Login "Passwort vergessen" klicken und Reset-Token über die Konsole/E-Mail verwenden.
