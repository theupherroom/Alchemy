import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/admin/CopyButton";
import { formatAlias } from "@/lib/alias/display";
import type { ProfileStatus } from "@/types/database";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "Users — admin" };
export const dynamic = "force-dynamic";

type Filter =
  | ProfileStatus
  | "all"
  | "flagged"
  | "no_calendar"
  | "pending_approval"
  | "rejected";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: Filter; q?: string }>;
}) {
  await requireAdmin();
  const { status = "all", q = "" } = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select(
      "id, alias, full_name, org_name, personal_email, sector, status, flag_count, calendar_connected, created_at, onboarded_at, is_admin, approval_status",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status === "active" || status === "suspended" || status === "deleted") {
    query = query.eq("status", status);
  } else if (status === "flagged") {
    query = query.gt("flag_count", 0);
  } else if (status === "no_calendar") {
    query = query.eq("calendar_connected", false);
  } else if (status === "pending_approval") {
    query = query.eq("approval_status", "pending");
  } else if (status === "rejected") {
    query = query.eq("approval_status", "rejected");
  }

  if (q.trim().length >= 2) {
    const safe = q.trim().replace(/[%_]/g, "");
    query = query.or(
      `alias.ilike.%${safe}%,full_name.ilike.%${safe}%,org_name.ilike.%${safe}%,personal_email.ilike.%${safe}%`,
    );
  }

  const { data, error } = await query;
  const rows = data ?? [];

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-6">
        <p className="eyebrow">Admin · Users</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Everyone on the platform.
        </h1>
      </div>

      <form className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search alias, name, org, or email…"
          className="h-10 w-full max-w-sm rounded-full border border-border bg-white px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input type="hidden" name="status" value={status} />
        <button
          type="submit"
          className="h-10 rounded-full bg-primary px-4 text-sm font-medium text-white"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2 pb-6">
        <FilterChip value="all" current={status}>All</FilterChip>
        <FilterChip value="pending_approval" current={status}>Pending approval</FilterChip>
        <FilterChip value="active" current={status}>Active</FilterChip>
        <FilterChip value="suspended" current={status}>Suspended</FilterChip>
        <FilterChip value="rejected" current={status}>Rejected</FilterChip>
        <FilterChip value="flagged" current={status}>Flagged</FilterChip>
        <FilterChip value="no_calendar" current={status}>No calendar</FilterChip>
      </div>

      {error ? (
        <p className="rounded-input bg-error/10 px-4 py-3 text-sm text-error">
          {error.message}
        </p>
      ) : rows.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">No users match.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((u) => (
            <Card key={u.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="display text-lg text-ink hover:underline"
                    >
                      {u.alias ? formatAlias(u.alias) : "(no alias)"}
                    </Link>
                    {u.status === "suspended" ? (
                      <Badge variant="error">Suspended</Badge>
                    ) : u.status === "deleted" ? (
                      <Badge variant="neutral">Deleted</Badge>
                    ) : !u.onboarded_at ? (
                      <Badge variant="warning">Incomplete</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                    {u.flag_count > 0 ? (
                      <Badge variant="warning">
                        {u.flag_count} flag{u.flag_count === 1 ? "" : "s"}
                      </Badge>
                    ) : null}
                    {u.calendar_connected ? (
                      <Badge variant="primary">Calendar</Badge>
                    ) : null}
                    {u.is_admin ? <Badge variant="primary">Admin</Badge> : null}
                    {u.approval_status === "pending" ? (
                      <Badge variant="warning">Pending approval</Badge>
                    ) : u.approval_status === "rejected" ? (
                      <Badge variant="error">Rejected</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted">
                    {u.full_name || "—"} · {u.org_name || "—"} · {u.sector}
                  </p>
                  <p className="alias-code text-xs text-primary-fg">
                    {u.personal_email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton value={u.personal_email} label="Email" />
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Manage →
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  value,
  current,
  children,
}: {
  value: string;
  current: string;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <Link
      href={`/admin/users?status=${value}`}
      className={
        active
          ? "rounded-full border border-primary bg-primary px-3 py-1 text-xs text-white"
          : "rounded-full border border-border bg-white px-3 py-1 text-xs text-ink hover:border-primary/40"
      }
    >
      {children}
    </Link>
  );
}
