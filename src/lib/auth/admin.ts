// Admin allowlist. Comma-separated env var ADMIN_EMAILS, case-insensitive.
// Example: ADMIN_EMAILS=anyadikedivine0@gmail.com,daveydenco@gmail.com
//
// Server-only — every admin page calls assertAdmin() before rendering;
// every admin API route calls assertAdmin() before mutating.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
  if (!isAdminEmail(user.email)) return null;
  return { id: user.id, email: user.email };
}

// Page guard — call as the first thing in an admin server component.
// Non-admins get bounced to /dashboard, no /admin existence leak.
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const admin = await getAdminUser();
  if (!admin) redirect("/dashboard");
  return admin;
}
