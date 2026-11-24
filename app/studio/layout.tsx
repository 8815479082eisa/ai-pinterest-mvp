import { signOut } from "@/app/login/actions";
import { getUser } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: LayoutProps<"/studio">) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5 pt-2">
        <Link href="/studio" className="text-[11px] uppercase tracking-[0.3em]">
          Studio
        </Link>
        <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-mute">
          <span className="normal-case tracking-normal">{user.email}</span>
          <form action={signOut}>
            <button className="uppercase tracking-[0.2em] transition hover:text-ink">Abmelden</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
