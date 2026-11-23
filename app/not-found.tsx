import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-32 text-center sm:px-10">
      <h1 className="font-serif text-6xl italic">Nicht gefunden.</h1>
      <Link href="/" className="mt-8 inline-block text-[11px] uppercase tracking-[0.25em] text-mute hover:text-ink">
        ← Zurück zur Startseite
      </Link>
    </div>
  );
}
