import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/admin/CopyButton";
import { formatAlias } from "@/lib/alias/display";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "Signups — admin" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

type Profile = {
  id: string;
  alias: string;
  full_name: string;
  org_name: string;
  personal_email: string;
  status: string;
  approval_status: "pending" | "approved" | "rejected";
  created_at: string;
  onboarded_at: string | null;
  calendar_connected: boolean;
};

type SignupRow = {
  id: string;
  email: string;
  createdAt: string;
  emailConfirmedAt: string | null;
  profile: Profile | null;
};

export default async function AdminSignupsPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  await requireAdmin();
  const { window: range } = await searchParams;
  const sinceDays =
    range === "30"
      ? 30
      : range === "all"
        ? 365
        : range === "1"
          ? 1
          : 7;
  const since = new Date(Date.now() - sinceDays * 86_400_000);

  const admin = createAdminClient();

  // Pull auth users first so we catch people who confirmed email but never
  // finished onboarding. Profile rows only exist after the user submits the
  // onboarding form, so a pure profiles query misses them.
  const { data: authPage, error: authError } =
    await admin.auth.admin.listUsers({ perPage: PAGE_SIZE, page: 1 });

  const authUsers = (authPage?.users ?? [])
    .filter((u) => new Date(u.created_at) >= since)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const ids = authUsers.map((u) => u.id);
  const { data: profileRows, error: profileError } = ids.length
    ? await admin
        .from("profiles")
        .select(
          "id, alias, full_name, org_name, personal_email, status, approval_status, created_at, onboarded_at, calendar_connected",
        )
        .in("id", ids)
    : { data: [] as Profile[], error: null };

  const profileById = new Map<string, Profile>(
    ((profileRows ?? []) as Profile[]).map((p) => [p.id, p]),
  );

  const rows: SignupRow[] = authUsers.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    createdAt: u.created_at,
    emailConfirmedAt: u.email_confirmed_at ?? null,
    profile: profileById.get(u.id) ?? null,
  }));

  const error = authError ?? profileError;
  const allEmails = rows.map((r) => r.profile?.personal_email ?? r.email).join(", ");

  const incompleteCount = rows.filter((r) => !r.profile).length;
  const pendingCount = rows.filter(
    (r) => r.profile && r.profile.approval_status === "pending",
  ).length;
  const approvedCount = rows.filter(
    (r) => r.profile && r.profile.approval_status === "approved",
  ).length;

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-6">
        <p className="eyebrow">Admin · Signups</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          New signups.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Every account that has been created in this window — including ones
          who confirmed their email but haven&apos;t finished the profile
          form yet. Hit copy on a single email, or grab all at once to paste
          into Google Cloud Console Test Users.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-6">
        <RangeChip value="1" current={range ?? "7"}>24h</RangeChip>
        <RangeChip value="7" current={range ?? "7"}>7 days</RangeChip>
        <RangeChip value="30" current={range ?? "7"}>30 days</RangeChip>
        <RangeChip value="all" current={range ?? "7"}>All time</RangeChip>
      </div>

      {error ? (
        <p className="rounded-input bg-error/10 px-4 py-3 text-sm text-error">
          {"message" in error ? error.message : "Could not load signups."}
        </p>
      ) : rows.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">No signups in this window.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3">
            <p className="text-xs text-muted">
              {rows.length} signup{rows.length === 1 ? "" : "s"} ·{" "}
              {approvedCount} approved · {pendingCount} pending ·{" "}
              {incompleteCount} onboarding incomplete
            </p>
            <CopyButton
              value={allEmails}
              label={`Copy all ${rows.length} emails`}
            />
          </div>

          <div className="space-y-3">
            {rows.map((r) => (
              <SignupCard key={r.id} row={r} />
            ))}
          </div>
        </>
      )}

      <div className="mt-10 rounded-2xl border border-border bg-cream-deep/40 p-5 text-xs leading-relaxed text-muted">
        <p className="font-medium text-ink">Where to paste these emails</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>
            Open{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials/consent"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Google Cloud Console → OAuth consent
            </a>
            .
          </li>
          <li>
            Scroll to <span className="text-ink">Test users</span> →{" "}
            <span className="text-ink">+ Add users</span>.
          </li>
          <li>
            Paste the copied emails. Up to 100 testers allowed while in Testing
            mode.
          </li>
          <li>Save. The user can now sign in with Google immediately.</li>
        </ol>
      </div>
    </div>
  );
}

function SignupCard({ row }: { row: SignupRow }) {
  const profile = row.profile;
  const displayEmail = profile?.personal_email ?? row.email;
  const joined = new Date(row.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  let stateBadge: React.ReactNode = null;
  if (!profile) {
    stateBadge = row.emailConfirmedAt ? (
      <Badge variant="warning">Onboarding incomplete</Badge>
    ) : (
      <Badge variant="error">Email unconfirmed</Badge>
    );
  } else if (profile.status === "suspended") {
    stateBadge = <Badge variant="error">Suspended</Badge>;
  } else if (profile.approval_status === "pending") {
    stateBadge = <Badge variant="warning">Pending approval</Badge>;
  } else if (profile.approval_status === "rejected") {
    stateBadge = <Badge variant="error">Rejected</Badge>;
  } else {
    stateBadge = <Badge variant="success">Approved</Badge>;
  }

  return (
    <Card>
      <CardBody className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="display text-lg text-ink">
              {profile?.alias
                ? formatAlias(profile.alias)
                : row.emailConfirmedAt
                  ? "Has not built profile"
                  : "Has not confirmed email"}
            </p>
            {stateBadge}
            {profile?.calendar_connected ? (
              <Badge variant="primary">Calendar connected</Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted">
            {profile?.full_name || "—"} · {profile?.org_name || "—"} · joined{" "}
            {joined}
            {!row.emailConfirmedAt ? " · awaiting email confirmation" : ""}
          </p>
          <p className="alias-code text-xs text-primary-fg">{displayEmail}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={displayEmail} label="Copy email" />
          {profile ? (
            <Link
              href={`/admin/users/${row.id}`}
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              Open →
            </Link>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

function RangeChip({
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
      href={`/admin/signups?window=${value}`}
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
