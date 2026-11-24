# Muse — AI Pinterest MVP

Eine Pinterest-ähnliche Plattform für KI-Charaktere und KI-Marken. Nur Frontend, mit statischen Daten.

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- Daten: `lib/data.ts` (3 fiktive Charaktere × 6 Bilder)
- **Supabase**: Login (Magic Link), Postgres-Datenbank, Storage für Uploads
- Demo-Bilder: `public/images/`, Uploads: Supabase Storage (Bucket `images`)

## Funktionen

- Öffentlich: Feed (`/`) und Profile (`/c/[slug]`) – zeigen nur veröffentlichte Profile und Bilder
- Studio (`/studio`): Creator melden sich per E-Mail-Link an, legen Charaktere/Marken an,
  bearbeiten Profil und Avatar, laden Bilder hoch und schalten jedes Bild live oder offline

## Struktur

```
app/page.tsx            Startseite – Masonry-Feed aller Bilder
app/c/[slug]/page.tsx   Profilseite eines Charakters
components/             Pin, Masonry, FollowButton
app/login, app/auth     Magic-Link-Login
app/studio/             Creator-Backend (Liste, Bearbeiten, Server Actions)
components/Uploader.tsx Upload direkt vom Browser in Supabase Storage
lib/data.ts             Öffentliche Abfragen
lib/supabase/           Supabase-Clients (Server/Browser)
proxy.ts                Session-Refresh + Schutz für /studio
supabase/schema.sql     Tabellen, RLS-Regeln, Storage-Bucket, Demo-Daten
```

## Lokal starten

Benötigt `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
(auf Vercel setzt die Supabase-Integration sie automatisch).

```bash
npm install
npm run dev
```

Einmalig `supabase/schema.sql` im Supabase SQL-Editor ausführen.

Jeder Push auf `main` wird von Vercel automatisch deployed.

Alle Charaktere, Creator-Namen und Bilder sind fiktiv; die Bilder wurden per Code generiert (`scripts/gen_images.py`).
