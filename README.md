# Muse — AI Pinterest MVP

Eine Pinterest-ähnliche Plattform für KI-Charaktere und KI-Marken. Nur Frontend, mit statischen Daten.

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- Daten: `lib/data.ts` (3 fiktive Charaktere × 6 Bilder)
- Bilder: öffentlicher **Cloudflare R2** Bucket, eingebunden über `IMAGE_BASE_URL`

## Struktur

```
app/page.tsx            Startseite – Masonry-Feed aller Bilder
app/c/[slug]/page.tsx   Profilseite eines Charakters
components/             Pin, Masonry, FollowButton
lib/config.ts           IMAGE_BASE_URL → Bild-URLs
lib/data.ts             Charaktere + Bilder
r2-images/              Bilddateien, die nach R2 hochgeladen werden
scripts/upload-r2.sh    Lädt r2-images/ in den Bucket hoch (wrangler)
```

## Lokal starten

```bash
cp .env.example .env.local   # IMAGE_BASE_URL eintragen
npm install
npm run dev
```

## Bilder nach Cloudflare R2

1. Cloudflare Dashboard → R2 → Bucket `ai-pinterest-images` anlegen
2. Bucket → Settings → **Public Development URL** aktivieren (`https://pub-….r2.dev`)
3. `npx wrangler login` und dann `bash scripts/upload-r2.sh` (legt Bucket + Public URL auch automatisch an)
4. Die `pub-….r2.dev`-URL als `IMAGE_BASE_URL` in Vercel (und `.env.local`) eintragen

## Neuen Charakter hinzufügen

1. Bilder nach `r2-images/<slug>/01.jpg … 06.jpg` + `avatar.jpg` legen und hochladen
2. In `lib/data.ts` ein neues Objekt in `characters` ergänzen – fertig.

Alle Charaktere, Creator-Namen und Bilder sind fiktiv; die Bilder wurden per Code generiert (`scripts/gen_images.py`).
