import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";

// Ordered by user journey: sign up → onboard → wait for approval → become
// active member → match + meet → flag if bad behavior. Operations sits at
// the end as system-wide rather than user-stage.
const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/signups", label: "Signups" },
  {
    href: "/admin/users?status=pending_approval",
    label: "Pending",
    match: ["/admin/users?status=pending_approval"],
  },
  { href: "/admin/users?status=active", label: "Members", match: ["/admin/users"] },
  { href: "/admin/meetings", label: "Activity" },
  { href: "/admin/flags", label: "Moderation" },
  { href: "/admin/ai-logs", label: "AI cost" },
  { href: "/admin/ops", label: "Operations" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-[100dvh] bg-cream">
      <div className="border-b border-warning/30 bg-warning/5">
        <div className="container-site flex items-center justify-between gap-3 py-2 text-xs text-warning">
          <span className="alias-code uppercase tracking-[0.2em]">
            Admin · restricted
          </span>
          <Link href="/dashboard" className="hover:underline">
            ← Exit admin
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-border/60 bg-cream/85 backdrop-blur-md">
        <div className="container-site flex h-14 items-center gap-6 overflow-x-auto">
          <Link href="/admin" className="display text-lg text-ink shrink-0">
            alchemy / admin
          </Link>
          <nav className="flex gap-5 text-xs">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
