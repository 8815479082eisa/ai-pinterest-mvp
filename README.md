# Muse — AI Pinterest MVP

Eine Pinterest-ähnliche Plattform für KI-Charaktere und KI-Marken. Nur Frontend, mit statischen Daten.

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- Daten: `lib/data.ts` (3 fiktive Charaktere × 6 Bilder)
- Bilder: `public/images/` – werden direkt von Vercel ausgeliefert

## Struktur

```
app/page.tsx            Startseite – Masonry-Feed aller Bilder
app/c/[slug]/page.tsx   Profilseite eines Charakters
components/             Pin, Masonry, FollowButton
lib/config.ts           imageUrl() → Pfad der Bilder
lib/data.ts             Charaktere + Bilder
public/images/<slug>/   01.jpg … 06.jpg + avatar.jpg
```

## Lokal starten

```bash
npm install
npm run dev
```

## Neuen Charakter hinzufügen

1. Bilder nach `public/images/<slug>/01.jpg … 06.jpg` + `avatar.jpg` legen
2. In `lib/data.ts` ein neues Objekt in `characters` ergänzen – fertig.

Jeder Push auf `main` wird von Vercel automatisch deployed.

Alle Charaktere, Creator-Namen und Bilder sind fiktiv; die Bilder wurden per Code generiert (`scripts/gen_images.py`).
