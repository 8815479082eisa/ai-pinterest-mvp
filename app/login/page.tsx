import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { sendMagicLink } from "./actions";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  wait: "Bitte warte etwa eine Minute, bevor du einen neuen Link anforderst.",
  link: "Der Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an.",
  send: "Der Link konnte nicht gesendet werden. Bitte versuche es gleich noch einmal.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  if (await getUser()) redirect("/studio");
  const { sent, error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-5 py-24 sm:py-32">
      <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-mute">Für Creator</p>
      <h1 className="font-serif text-6xl leading-[0.95] tracking-tight">
        Ins <span className="italic">Studio.</span>
      </h1>

      {sent ? (
        <p className="mt-10 text-base leading-relaxed">
          Wir haben dir einen Anmeldelink geschickt. Öffne die E-Mail und klicke einmal auf den Link —
          das funktioniert in jedem Browser. Der Link ist nur einmal gültig.
        </p>
      ) : (
        <form action={sendMagicLink} className="mt-10 space-y-4">
          <label className="block text-[11px] uppercase tracking-[0.25em] text-mute" htmlFor="email">
            E-Mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full border-b border-ink bg-transparent py-3 text-lg outline-none placeholder:text-mute"
            placeholder="du@beispiel.de"
          />
          <button className="mt-6 w-full rounded-full bg-ink py-3.5 text-[11px] uppercase tracking-[0.25em] text-paper transition hover:opacity-80">
            Anmeldelink senden
          </button>
          {error && <p className="text-sm text-red-700">{ERRORS[String(error)] ?? ERRORS.send}</p>}
        </form>
      )}
    </div>
  );
}
