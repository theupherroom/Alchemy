import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import Link from "next/link";

export const metadata = { title: "Admin — alchemy" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = createAdminClient();

  const day = new Date(Date.now() - 86_400_000).toISOString();
  const week = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    signupsWeek,
    signupsDay,
    pendingMatches,
    acceptedMatches,
    flagsWeek,
    meetingsWeek,
    aiCallsDay,
    pendingApproval,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "suspended"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("created_at", week),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("created_at", day),
    admin
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted"),
    admin
      .from("flags")
      .select("id", { count: "exact", head: true })
      .gt("created_at", week),
    admin
      .from("meetings")
      .select("id", { count: "exact", head: true })
      .gt("created_at", week),
    admin
      .from("ai_call_log")
      .select("id", { count: "exact", head: true })
      .gt("created_at", day),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
  ]);

  const stats = [
    {
      label: "Pending approval",
      value: pendingApproval.count ?? 0,
      href: "/admin/users?status=pending_approval",
      tone:
        (pendingApproval.count ?? 0) > 0
          ? ("warning" as const)
          : undefined,
    },
    { label: "Total members", value: totalUsers.count ?? 0, href: "/admin/users" },
    {
      label: "Active",
      value: activeUsers.count ?? 0,
      href: "/admin/users?status=active",
      tone: "success" as const,
    },
    {
      label: "Suspended",
      value: suspendedUsers.count ?? 0,
      href: "/admin/users?status=suspended",
      tone: "error" as const,
    },
    {
      label: "Signups (24h)",
      value: signupsDay.count ?? 0,
      href: "/admin/signups",
    },
    {
      label: "Signups (7d)",
      value: signupsWeek.count ?? 0,
      href: "/admin/signups",
    },
    {
      label: "Pending matches",
      value: pendingMatches.count ?? 0,
      href: "/admin/users",
    },
    {
      label: "Confirmed matches",
      value: acceptedMatches.count ?? 0,
      href: "/admin/meetings",
      tone: "success" as const,
    },
    {
      label: "Meetings booked (7d)",
      value: meetingsWeek.count ?? 0,
      href: "/admin/meetings",
    },
    {
      label: "Flags filed (7d)",
      value: flagsWeek.count ?? 0,
      href: "/admin/flags",
      tone: (flagsWeek.count ?? 0) > 0 ? ("warning" as const) : undefined,
    },
    {
      label: "AI calls (24h)",
      value: aiCallsDay.count ?? 0,
      href: "/admin/ai-logs",
    },
  ];

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-8">
        <p className="eyebrow">Admin</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Operations overview.
        </h1>
        <p className="text-sm text-muted">
          Live counts from the database. Click any tile to drill in.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatTile
            key={s.label}
            label={s.label}
            value={s.value}
            href={s.href}
            tone={s.tone}
          />
        ))}
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <ShortcutCard
          href="/admin/users?status=pending_approval"
          eyebrow="Gating beta access"
          title="Review pending profiles"
          description="New signups land in pending. Approve them to make them visible in browse and let them request matches. An approval email fires automatically."
        />
        <ShortcutCard
          href="/admin/signups"
          eyebrow="Google OAuth gate"
          title="Add testers to Google test users"
          description="Until your OAuth client clears Google review, each new tester needs to be added to the Test Users list. Hit copy on each email, paste into Google Cloud Console."
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone?: "success" | "warning" | "error";
}) {
  const accent =
    tone === "success"
      ? "border-success/30"
      : tone === "warning"
        ? "border-warning/40"
        : tone === "error"
          ? "border-error/30"
          : "";
  return (
    <Link href={href} className="group block">
      <Card
        className={`h-full transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:shadow-elev-lg ${accent}`}
      >
        <CardBody className="space-y-2 py-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            {label}
          </p>
          <p className="display text-3xl tabular-nums text-ink md:text-4xl">
            {value}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}

function ShortcutCard({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5 group-hover:shadow-elev-lg">
        <CardBody className="space-y-2">
          <p className="eyebrow">{eyebrow}</p>
          <p className="display text-xl text-ink md:text-2xl">{title}</p>
          <p className="text-sm leading-relaxed text-muted">{description}</p>
          <p className="pt-1 text-xs text-primary group-hover:underline">
            Open →
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
