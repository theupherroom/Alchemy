import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/admin/CopyButton";
import { formatAlias } from "@/lib/alias/display";

export const metadata = { title: "Signups — admin" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AdminSignupsPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string }>;
}) {
  const { window: range } = await searchParams;
  const sinceDays =
    range === "30"
      ? 30
      : range === "all"
        ? 365
        : range === "1"
          ? 1
          : 7;
  const since = new Date(Date.now() - sinceDays * 86_400_000).toISOString();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select(
      "id, alias, full_name, org_name, personal_email, status, created_at, onboarded_at, calendar_connected",
    )
    .gt("created_at", since)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  const rows = data ?? [];
  const allEmails = rows.map((r) => r.personal_email).join(", ");

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-6">
        <p className="eyebrow">Admin · Signups</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          New signups.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Use this list to add testers to your Google OAuth Test Users until
          verification clears. Hit copy on a single email, or grab all
          emails at once and paste into Google Cloud Console.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-6">
        <RangeChip value="1" current={range ?? "7"}>24h</RangeChip>
        <RangeChip value="7" current={range ?? "7"}>7 days</RangeChip>
        <RangeChip value="30" current={range ?? "7"}>30 days</RangeChip>
        <RangeChip value="all" current={range ?? "7"}>All time</RangeChip>
      </div>

      {error ? (
        <p className="rounded-[10px] bg-error/10 px-4 py-3 text-sm text-error">
          {error.message}
        </p>
      ) : rows.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">No signups in this window.</p>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3">
            <p className="text-xs text-muted">
              {rows.length} signup{rows.length === 1 ? "" : "s"} shown
            </p>
            <CopyButton value={allEmails} label={`Copy all ${rows.length} emails`} />
          </div>

          <div className="space-y-3">
            {rows.map((r) => (
              <Card key={r.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="display text-lg text-ink">
                        {r.alias ? formatAlias(r.alias) : "(no alias yet)"}
                      </p>
                      {r.status === "suspended" ? (
                        <Badge variant="error">Suspended</Badge>
                      ) : !r.onboarded_at ? (
                        <Badge variant="warning">Onboarding incomplete</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                      {r.calendar_connected ? (
                        <Badge variant="primary">Calendar connected</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted">
                      {r.full_name || "—"} · {r.org_name || "—"} · joined{" "}
                      {new Date(r.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="alias-code text-xs text-primary-fg">
                      {r.personal_email}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton value={r.personal_email} label="Copy email" />
                    <Link
                      href={`/admin/users/${r.id}`}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      Open →
                    </Link>
                  </div>
                </CardBody>
              </Card>
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
          <li>Scroll to <span className="text-ink">Test users</span> → <span className="text-ink">+ Add users</span>.</li>
          <li>Paste the copied emails. Up to 100 testers allowed while in Testing mode.</li>
          <li>Save. The user can now sign in with Google immediately.</li>
        </ol>
      </div>
    </div>
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
