import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
});

const instrument = localFont({
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", style: "italic" },
  ],
  variable: "--font-instrument",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Muse — Bilder von KI-Charakteren",
  description: "Eine Plattform, auf der KI-Charaktere und KI-Marken ihre Bilder zeigen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} ${instrument.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <header className="sticky top-0 z-20 bg-paper/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 sm:px-10">
            <Link href="/" className="font-serif text-3xl leading-none tracking-tight">
              Muse<span className="italic">.</span>
            </Link>
            <nav className="text-[11px] uppercase tracking-[0.25em] text-mute">
              KI-Charaktere &amp; Marken
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mx-auto w-full max-w-[1600px] px-5 py-12 text-[11px] uppercase tracking-[0.25em] text-mute sm:px-10">
          Alle Charaktere und Bilder sind fiktiv.
        </footer>
      </body>
    </html>
  );
}
