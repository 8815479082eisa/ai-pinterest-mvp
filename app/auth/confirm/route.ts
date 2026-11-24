import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Login link from the e-mail lands here (?token_hash=…&type=email).
 * Unlike the ?code= flow this works in any browser, not only the one that requested the link.
 */
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = (request.nextUrl.searchParams.get("type") ?? "email") as EmailOtpType;

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL("/studio", request.url));
  }
  return NextResponse.redirect(new URL("/login?error=link", request.url));
}
