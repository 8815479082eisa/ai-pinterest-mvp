import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Supabase client for Client Components (used for direct image uploads). */
export const createClient = () => createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
