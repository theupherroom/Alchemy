import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatAlias } from "@/lib/alias/display";
import { contactLine } from "@/lib/profile/contact";

export const metadata = { title: "Meetings — admin" };
export const dynamic = "force-dynamic";

export default async function AdminMeetingsPage() {
  const admin = createAdminClient();
  const { data: meetings } = await admin
    .from("meetings")
    .select(
      "id, match_id, starts_at, ends_at, meet_link, created_at, google_event_id_requester, google_event_id_recipient",
    )
    .order("starts_at", { ascending: false })
    .limit(100);

  const rows = meetings ?? [];
  const matchIds = rows.map((m) => m.match_id);

  const { data: matches } = matchIds.length
    ? await admin
        .from("matches")
        .select("id, requester_id, recipient_id, status, score")
        .in("id", matchIds)
    : { data: [] };

  const matchById = new Map((matches ?? []).map((m) => [m.id, m]));

  const userIds = Array.from(
    new Set(
      (matches ?? []).flatMap((m) => [m.requester_id, m.recipient_id]),
    ),
  );
  const { data: profileRows } = userIds.length
    ? await admin
        .from("profiles")
        .select("id, alias, full_name, personal_email")
        .in("id", userIds)
    : {
        data: [] as {
          id: string;
          alias: string;
          full_name: string;
          personal_email: string;
        }[],
      };
  const profileById = new Map(
    (profileRows ?? []).map((p) => [p.id, p]),
  );

  const now = Date.now();

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-6">
        <p className="eyebrow">Admin · Meetings</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Auto-scheduled introductions.
        </h1>
        <p className="text-sm text-muted">
          Meetings created by the platform. Aliases only — real identities are
          not on the calendar event.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              No meetings booked yet. They appear here after the first
              auto-schedule fires.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((m) => {
            const match = matchById.get(m.match_id);
            const ts = new Date(m.starts_at).getTime();
            const upcoming = ts > now;
            const partyA = match
              ? profileById.get(match.requester_id)
              : undefined;
            const partyB = match
              ? profileById.get(match.recipient_id)
              : undefined;
            const aliasA = partyA?.alias ?? "?";
            const aliasB = partyB?.alias ?? "?";
            return (
              <Card key={m.id}>
                <CardBody className="flex flex-wrap items-start justify-between gap-4 py-4">
                  <div className="min-w-0 space-y-1">
                    <p className="display text-lg text-ink">
                      {formatAlias(aliasA)}{" "}
                      <span className="text-muted">×</span>{" "}
                      {formatAlias(aliasB)}
                    </p>
                    {partyA ? (
                      <p className="alias-code text-[11px] text-muted">
                        A: {contactLine(partyA.full_name, partyA.personal_email)}
                      </p>
                    ) : null}
                    {partyB ? (
                      <p className="alias-code text-[11px] text-muted">
                        B: {contactLine(partyB.full_name, partyB.personal_email)}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted">
                      {new Date(m.starts_at).toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      —{" "}
                      {new Date(m.ends_at).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    {match ? (
                      <p className="text-xs text-muted">
                        Match score:{" "}
                        {match.score !== null ? `${match.score}%` : "—"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={upcoming ? "primary" : "neutral"}>
                      {upcoming ? "Upcoming" : "Past"}
                    </Badge>
                    {m.meet_link ? (
                      <a
                        href={m.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary underline-offset-4 hover:underline"
                      >
                        Meet ↗
                      </a>
                    ) : null}
                    {match ? (
                      <>
                        <Link
                          href={`/admin/users/${match.requester_id}`}
                          className="text-xs text-muted hover:text-ink"
                        >
                          A →
                        </Link>
                        <Link
                          href={`/admin/users/${match.recipient_id}`}
                          className="text-xs text-muted hover:text-ink"
                        >
                          B →
                        </Link>
                      </>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
