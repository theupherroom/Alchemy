import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Badge } from "@/components/ui/Badge";
import { RespondButtons } from "./RespondButtons";
import {
  GEO_OPTIONS,
  SECTOR_OPTIONS,
  labelOf,
} from "@/lib/profile/enums";
import type {
  MatchStatus,
  PublicProfileColumns,
} from "@/types/database";

export const metadata = { title: "Matches — alchemy" };
export const dynamic = "force-dynamic";

type MatchRow = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: MatchStatus;
  score: number | null;
  rationale: string | null;
  created_at: string;
  responded_at: string | null;
};

type MeetingRow = {
  match_id: string;
  starts_at: string;
  meet_link: string | null;
};

export default async function MatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  const { data: matches } = await admin
    .from("matches")
    .select("*")
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const all = (matches ?? []) as MatchRow[];

  const otherIds = Array.from(
    new Set(all.map((m) => (m.requester_id === user.id ? m.recipient_id : m.requester_id))),
  );
  const { data: profilesData } = otherIds.length
    ? await admin.from("profiles_public").select("*").in("id", otherIds)
    : { data: [] as PublicProfileColumns[] };
  const byId = new Map<string, PublicProfileColumns>(
    ((profilesData ?? []) as PublicProfileColumns[]).map((p) => [p.id, p]),
  );

  const acceptedIds = all.filter((m) => m.status === "accepted").map((m) => m.id);
  const { data: meetings } = acceptedIds.length
    ? await admin
        .from("meetings")
        .select("match_id, starts_at, meet_link")
        .in("match_id", acceptedIds)
    : { data: [] as MeetingRow[] };
  const meetingByMatch = new Map<string, MeetingRow>(
    ((meetings ?? []) as MeetingRow[]).map((m) => [m.match_id, m]),
  );

  const incoming = all.filter(
    (m) => m.recipient_id === user.id && m.status === "pending",
  );
  const sent = all.filter(
    (m) => m.requester_id === user.id && m.status === "pending",
  );
  const confirmed = all.filter((m) => m.status === "accepted");
  const closed = all.filter((m) => m.status === "declined" || m.status === "expired");

  return (
    <div className="container-app py-12 md:py-16">
      <div className="space-y-3 pb-10">
        <p className="eyebrow">Matches</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Where your introductions stand.
        </h1>
      </div>

      <SectionHeading>Incoming</SectionHeading>
      {incoming.length === 0 ? (
        <Empty text="No incoming requests right now." />
      ) : (
        <div className="space-y-4">
          {incoming.map((m) => (
            <MatchRowCard
              key={m.id}
              match={m}
              other={byId.get(m.requester_id)}
              role="recipient"
            />
          ))}
        </div>
      )}

      <Divider className="my-12" />

      <SectionHeading>Confirmed</SectionHeading>
      {confirmed.length === 0 ? (
        <Empty text="No confirmed matches yet." />
      ) : (
        <div className="space-y-4">
          {confirmed.map((m) => (
            <MatchRowCard
              key={m.id}
              match={m}
              other={byId.get(
                m.requester_id === user.id ? m.recipient_id : m.requester_id,
              )}
              role={m.requester_id === user.id ? "requester" : "recipient"}
              meeting={meetingByMatch.get(m.id)}
            />
          ))}
        </div>
      )}

      <Divider className="my-12" />

      <SectionHeading>Sent</SectionHeading>
      {sent.length === 0 ? (
        <Empty text="No pending requests sent." />
      ) : (
        <div className="space-y-4">
          {sent.map((m) => (
            <MatchRowCard
              key={m.id}
              match={m}
              other={byId.get(m.recipient_id)}
              role="requester"
            />
          ))}
        </div>
      )}

      {closed.length > 0 ? (
        <>
          <Divider className="my-12" />
          <SectionHeading>Closed</SectionHeading>
          <div className="space-y-4">
            {closed.map((m) => (
              <MatchRowCard
                key={m.id}
                match={m}
                other={byId.get(
                  m.requester_id === user.id ? m.recipient_id : m.requester_id,
                )}
                role={m.requester_id === user.id ? "requester" : "recipient"}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow pb-4">{children}</p>;
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center text-sm text-muted">
      {text}
    </div>
  );
}

function MatchRowCard({
  match,
  other,
  role,
  meeting,
}: {
  match: MatchRow;
  other: PublicProfileColumns | undefined;
  role: "requester" | "recipient";
  meeting?: MeetingRow;
}) {
  if (!other) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-muted">Profile no longer available.</p>
        </CardBody>
      </Card>
    );
  }

  const subtitle = [
    labelOf(SECTOR_OPTIONS, other.sector),
    other.region,
    labelOf(GEO_OPTIONS, other.geographic_reach),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="transition-shadow duration-200 hover:shadow-[var(--shadow-warm-lg)]">
      <CardBody className="space-y-4">
        <Link
          href={`/matches/${match.id}`}
          className="-m-2 block rounded-2xl p-2 transition-colors duration-200 hover:bg-cream-deep/30"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="display text-xl text-ink md:text-2xl">
                {other.alias}
              </p>
              <p className="text-xs text-muted">{subtitle}</p>
            </div>
            {match.score !== null ? (
              <Badge variant={match.score >= 80 ? "primary" : "neutral"}>
                {match.score}% match
              </Badge>
            ) : null}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink/90">
            {other.mission_statement}
          </p>
        </Link>

        {match.status === "accepted" && meeting ? (
          <div className="rounded-[10px] bg-primary-bg/60 px-4 py-3 text-sm text-primary-fg">
            <p className="font-medium">
              Intro meeting:{" "}
              {new Date(meeting.starts_at).toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            {meeting.meet_link ? (
              <a
                href={meeting.meet_link}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs underline-offset-4 hover:underline"
              >
                Open Google Meet ↗
              </a>
            ) : null}
          </div>
        ) : null}

        {match.status === "accepted" && !meeting ? (
          <div className="rounded-[10px] bg-warning/10 px-4 py-3 text-xs text-warning">
            Match accepted — we are still trying to find a time on both your
            calendars. Connect Google Calendar if you haven&apos;t already.
          </div>
        ) : null}

        {role === "recipient" && match.status === "pending" ? (
          <RespondButtons matchId={match.id} />
        ) : null}

        {role === "requester" && match.status === "pending" ? (
          <p className="text-xs text-muted">Waiting on their reply.</p>
        ) : null}

        {match.status === "declined" ? (
          <p className="text-xs text-muted">Declined.</p>
        ) : null}
      </CardBody>
    </Card>
  );
}
