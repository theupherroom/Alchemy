// Admin gate. Two sources of truth, OR'd together:
//   1. profiles.is_admin = true (set via Supabase or via /admin UI)
//   2. ADMIN_EMAILS env var (comma-separated) — bootstrap fallback so you can
//      always recover access if a DB row gets misset.
//
// Server-only. Every admin page calls requireAdmin() before rendering;
// every admin API route calls getAdminUser() before mutating.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function parseAllowlist(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAllowlist().has(email.trim().toLowerCase());
}

export async function getAdminUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  // 1. Env bootstrap — checked first, no DB roundtrip.
  if (isAdminEmail(user.email)) {
    return { id: user.id, email: user.email };
  }

  // 2. DB-set is_admin flag.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_admin) {
    return { id: user.id, email: user.email };
  }
  return null;
}

// Page guard — call as the first thing in an admin server component.
// Non-admins get bounced to /dashboard, no /admin existence leak.
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const admin = await getAdminUser();
  if (!admin) redirect("/dashboard");
  return admin;
}
