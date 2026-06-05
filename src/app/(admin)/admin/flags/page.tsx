import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatAlias } from "@/lib/alias/display";
import { contactLine } from "@/lib/profile/contact";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "Flags — admin" };
export const dynamic = "force-dynamic";

type FlagRow = {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string | null;
  created_at: string;
};

export default async function AdminFlagsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: flags } = await admin
    .from("flags")
    .select("id, reporter_id, reported_id, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (flags ?? []) as FlagRow[];
  const ids = Array.from(
    new Set(rows.flatMap((f) => [f.reporter_id, f.reported_id])),
  );

  const { data: profileRows } = ids.length
    ? await admin
        .from("profiles")
        .select("id, alias, full_name, personal_email, status, flag_count")
        .in("id", ids)
    : {
        data: [] as {
          id: string;
          alias: string;
          full_name: string;
          personal_email: string;
          status: string;
          flag_count: number;
        }[],
      };

  const byId = new Map(
    (profileRows ?? []).map((p) => [p.id, p]),
  );

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-6">
        <p className="eyebrow">Admin · Flags</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Reports filed by members.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          3 flags auto-suspend a profile. Use this view to spot abusive
          reporters or to validate that suspensions were justified.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">No flags filed yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((f) => {
            const reporter = byId.get(f.reporter_id);
            const reported = byId.get(f.reported_id);
            return (
              <Card key={f.id}>
                <CardBody className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 text-sm">
                      <div>
                        <Link
                          href={`/admin/users/${f.reporter_id}`}
                          className="text-muted hover:text-ink"
                        >
                          {reporter
                            ? formatAlias(reporter.alias)
                            : f.reporter_id.slice(0, 8)}
                        </Link>
                        <span className="mx-2 text-muted">flagged</span>
                        <Link
                          href={`/admin/users/${f.reported_id}`}
                          className="display text-base text-ink hover:underline"
                        >
                          {reported
                            ? formatAlias(reported.alias)
                            : f.reported_id.slice(0, 8)}
                        </Link>
                        {reported && reported.status === "suspended" ? (
                          <Badge variant="error" className="ml-2">
                            Suspended
                          </Badge>
                        ) : reported && reported.flag_count >= 2 ? (
                          <Badge variant="warning" className="ml-2">
                            {reported.flag_count} flags
                          </Badge>
                        ) : null}
                      </div>
                      <p className="alias-code text-[11px] text-muted">
                        Reporter:{" "}
                        {reporter
                          ? contactLine(
                              reporter.full_name,
                              reporter.personal_email,
                            )
                          : "—"}
                      </p>
                      <p className="alias-code text-[11px] text-muted">
                        Reported:{" "}
                        {reported
                          ? contactLine(
                              reported.full_name,
                              reported.personal_email,
                            )
                          : "—"}
                      </p>
                    </div>
                    <p className="text-xs text-muted">
                      {new Date(f.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-ink">
                    {f.reason || (
                      <span className="text-muted">(no reason given)</span>
                    )}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
