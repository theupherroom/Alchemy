import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/verify-email",
  "/auth",
  "/help",
  "/privacy",
  "/terms",
];
const ONBOARDING_PATH = "/onboarding";

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env is missing on the host (e.g. Vercel without env vars set), don't
  // crash the whole site — just let the request through and let pages render
  // their own configuration errors. Logged so the misconfiguration is visible
  // in Vercel logs.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "middleware: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing — passing through",
      );
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isPublic = PUBLIC_PATHS.some(
      (p) => path === p || path.startsWith(`${p}/`),
    );
    const isApi = path.startsWith("/api/");

    // Not signed in -> bounce to login (except for public + api routes)
    if (!user && !isPublic && !isApi) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    // Signed in but not onboarded -> force onboarding (except for onboarding itself + api)
    if (user && !isApi && path !== ONBOARDING_PATH) {
      const { data: profile } = await supabase
        .from("profiles_self")
        .select("onboarded_at,status")
        .maybeSingle();

      if (profile?.status === "suspended" && path !== "/suspended") {
        const url = request.nextUrl.clone();
        url.pathname = "/suspended";
        return NextResponse.redirect(url);
      }

      if (!profile?.onboarded_at && !isPublic) {
        const url = request.nextUrl.clone();
        url.pathname = ONBOARDING_PATH;
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (err) {
    // Any unexpected failure (network blip, schema not yet migrated, etc.)
    // should NOT bring down the site. Let the request through; pages handle
    // their own errors.
    // eslint-disable-next-line no-console
    console.error("middleware error:", err);
    return supabaseResponse;
  }
}
