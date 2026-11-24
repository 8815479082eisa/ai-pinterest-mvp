import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/** The magic link lands here: exchange the code for a session, then open the studio. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/studio", request.url));
  }
  return NextResponse.redirect(new URL("/login?error=1", request.url));
}
