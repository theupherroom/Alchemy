import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Divider } from "@/components/ui/Divider";
import { CopyButton } from "@/components/admin/CopyButton";
import { UserActions } from "@/components/admin/UserActions";
import { formatAlias } from "@/lib/alias/display";
import {
  GEO_OPTIONS,
  ORG_TYPE_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
  labelOf,
} from "@/lib/profile/enums";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!profile) notFound();

  const [{ data: outgoingMatches }, { data: incomingMatches }, { data: flagsAgainst }] =
    await Promise.all([
      admin
        .from("matches")
        .select("id, recipient_id, status, score, created_at")
        .eq("requester_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("matches")
        .select("id, requester_id, status, score, created_at")
        .eq("recipient_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("flags")
        .select("id, reporter_id, reason, created_at")
        .eq("reported_id", id)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="container-app py-10">
      <Link
        href="/admin/users"
        className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← All users
      </Link>

      <div className="space-y-2 pb-8 pt-3">
        <p className="eyebrow">Admin · User</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="display text-3xl text-ink md:text-4xl">
            {formatAlias(profile.alias)}
          </h1>
          {profile.status === "suspended" ? (
            <Badge variant="error">Suspended</Badge>
          ) : !profile.onboarded_at ? (
            <Badge variant="warning">Incomplete onboarding</Badge>
          ) : (
            <Badge variant="success">Active</Badge>
          )}
          {profile.flag_count > 0 ? (
            <Badge variant="warning">{profile.flag_count} flags</Badge>
          ) : null}
          {profile.is_admin ? (
            <Badge variant="primary">Admin</Badge>
          ) : null}
          {profile.approval_status === "pending" ? (
            <Badge variant="warning">Awaiting approval</Badge>
          ) : profile.approval_status === "rejected" ? (
            <Badge variant="error">Rejected</Badge>
          ) : (
            <Badge variant="success">Approved</Badge>
          )}
        </div>
        <p className="alias-code text-sm text-muted">
          {profile.full_name} · {profile.personal_email}
        </p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <p className="eyebrow">Identity</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <KV label="Full name" value={profile.full_name} />
            <KV label="Org" value={profile.org_name} />
            <KV
              label="Email"
              value={profile.personal_email}
              copyable
            />
            <KV label="Website" value={profile.website ?? "—"} />
            <KV label="Joined" value={new Date(profile.created_at).toLocaleString()} />
            <KV
              label="Onboarded"
              value={
                profile.onboarded_at
                  ? new Date(profile.onboarded_at).toLocaleString()
                  : "not yet"
              }
            />
            <KV
              label="Calendar connected"
              value={profile.calendar_connected ? "yes" : "no"}
            />
            <KV label="Timezone" value={profile.timezone} />
            <KV label="User ID" value={profile.id} copyable />
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="space-y-4">
          <p className="eyebrow">Public profile</p>
          <KV label="Mission" value={profile.mission_statement} wide />
          <div className="grid gap-3 sm:grid-cols-2">
            <KV
              label="Sector"
              value={labelOf(SECTOR_OPTIONS, profile.sector)}
            />
            <KV
              label="Org type"
              value={labelOf(ORG_TYPE_OPTIONS, profile.org_type)}
            />
            <KV label="Stage" value={labelOf(STAGE_OPTIONS, profile.stage)} />
            <KV
              label="Reach"
              value={labelOf(GEO_OPTIONS, profile.geographic_reach)}
            />
            <KV label="Region" value={profile.region ?? "—"} />
            <KV
              label="Partnership types"
              value={profile.partnership_types
                .map((t: string) =>
                  labelOf(
                    PARTNERSHIP_TYPE_OPTIONS,
                    t as (typeof PARTNERSHIP_TYPE_OPTIONS)[number]["value"],
                  ),
                )
                .join(" · ")}
            />
          </div>
          <Divider />
          <KV label="What they offer" value={profile.what_we_offer} wide />
          <KV label="What they need" value={profile.what_we_need} wide />
          {profile.impact_statement ? (
            <KV label="Impact" value={profile.impact_statement} wide />
          ) : null}
        </CardBody>
      </Card>

      <Card className="mt-4 border-warning/30">
        <CardBody className="space-y-3">
          <p className="eyebrow">Admin actions</p>
          <UserActions
            userId={profile.id}
            alias={formatAlias(profile.alias)}
            status={profile.status}
            isAdmin={profile.is_admin ?? false}
            approvalStatus={profile.approval_status ?? "pending"}
          />
          <p className="text-xs leading-relaxed text-muted">
            <strong className="text-ink">Suspend</strong> hides the user from
            browse and blocks sign-in. <strong className="text-ink">Reinstate</strong>
            {" "}reverses it. <strong className="text-ink">Reset flag count</strong>
            {" "}sets flag_count to 0 (use after a false-flag review).
            {" "}<strong className="text-ink">Make admin</strong> gives this
            user full /admin access — they can suspend, ban, delete, and grant
            admin to others. <strong className="text-ink">Delete</strong>
            {" "}hard-removes the user, all their matches, meetings,
            suggestions, and OAuth tokens. Cannot be undone.
          </p>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="space-y-3">
          <p className="eyebrow">Flags against this user ({flagsAgainst?.length ?? 0})</p>
          {!flagsAgainst || flagsAgainst.length === 0 ? (
            <p className="text-sm text-muted">No flags.</p>
          ) : (
            <ul className="space-y-2">
              {flagsAgainst.map((f) => (
                <li
                  key={f.id}
                  className="rounded-[10px] border border-border bg-cream-deep/40 p-3 text-xs"
                >
                  <p className="text-ink">
                    {f.reason || <span className="text-muted">(no reason given)</span>}
                  </p>
                  <p className="mt-1 text-muted">
                    Reporter: {f.reporter_id} ·{" "}
                    {new Date(f.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <MatchesCard title="Outgoing matches" rows={outgoingMatches ?? []} />
        <MatchesCard title="Incoming matches" rows={incomingMatches ?? []} />
      </div>
    </div>
  );
}

function KV({
  label,
  value,
  copyable,
  wide,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
        {label}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <p className="text-sm leading-relaxed text-ink">{value}</p>
        {copyable && value && value !== "—" ? (
          <CopyButton value={value} label="Copy" />
        ) : null}
      </div>
    </div>
  );
}

function MatchesCard({
  title,
  rows,
}: {
  title: string;
  rows: {
    id: string;
    status: string;
    score: number | null;
    created_at: string;
  }[];
}) {
  return (
    <Card>
      <CardBody>
        <p className="eyebrow">{title} ({rows.length})</p>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-muted">None.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-xs">
            {rows.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span className="text-ink">
                  {m.status}
                  {m.score !== null ? ` · ${m.score}%` : ""}
                </span>
                <span className="text-muted">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
