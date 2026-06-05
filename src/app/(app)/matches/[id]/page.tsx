import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { Badge } from "@/components/ui/Badge";
import { FlagButton } from "@/components/profile/FlagButton";
import { CompatibilityBars } from "@/components/profile/CompatibilityBars";
import { RespondButtons } from "../RespondButtons";
import { CelebrationOverlay } from "./CelebrationOverlay";
import { RescheduleButton } from "./RescheduleButton";
import {
  GEO_OPTIONS,
  ORG_TYPE_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  STAGE_OPTIONS,
  labelOf,
} from "@/lib/profile/enums";
import { formatAlias } from "@/lib/alias/display";
import { computeCompatibility } from "@/lib/matching/compatibility";
import type { PublicProfileColumns } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ just?: string }>;
}) {
  const { id: matchId } = await params;
  const { just } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: match } = await admin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();

  if (!match) notFound();
  if (match.requester_id !== user.id && match.recipient_id !== user.id) {
    notFound();
  }

  const otherId =
    match.requester_id === user.id ? match.recipient_id : match.requester_id;
  const role = match.requester_id === user.id ? "requester" : "recipient";

  const { data: otherData } = await admin
    .from("profiles_public")
    .select("*")
    .eq("id", otherId)
    .maybeSingle();
  const other = (otherData ?? null) as PublicProfileColumns | null;

  const { data: meeting } = match.status === "accepted"
    ? await admin
        .from("meetings")
        .select("starts_at, ends_at, meet_link, reschedule_count")
        .eq("match_id", matchId)
        .maybeSingle()
    : { data: null };

  const justAccepted = just === "accepted" && match.status === "accepted";

  const { data: meData } = await admin
    .from("profiles_public")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const me = (meData ?? null) as PublicProfileColumns | null;
  const compatibility = me && other ? computeCompatibility(me, other) : null;

  return (
    <div className="container-app py-12 md:py-16">
      {justAccepted ? (
        <CelebrationOverlay
          startsAt={meeting?.starts_at ?? null}
          meetLink={meeting?.meet_link ?? null}
        />
      ) : null}

      <div className="pb-8">
        <Link
          href="/matches"
          className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← All matches
        </Link>
      </div>

      {!other ? (
        <Card>
          <CardBody>
            <p className="text-sm text-muted">
              The other profile is no longer available.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="eyebrow">
                    {match.status === "accepted"
                      ? "Confirmed match"
                      : match.status === "pending"
                        ? role === "recipient"
                          ? "Incoming request"
                          : "Awaiting reply"
                        : labelOf(
                            [
                              { value: "declined", label: "Declined" },
                              { value: "expired", label: "Expired" },
                            ],
                            match.status,
                          )}
                  </p>
                  <h1 className="display text-3xl text-ink md:text-5xl">
                    {formatAlias(other.alias)}
                  </h1>
                  <p className="text-xs text-muted">
                    {[
                      labelOf(SECTOR_OPTIONS, other.sector),
                      other.region,
                      labelOf(GEO_OPTIONS, other.geographic_reach),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {match.score !== null ? (
                  <Badge variant={match.score >= 80 ? "primary" : "neutral"}>
                    {match.score}% match
                  </Badge>
                ) : null}
              </div>

              <Divider />

              <Section title="Mission">{other.mission_statement}</Section>

              <div className="grid gap-6 md:grid-cols-2">
                <KeyValue
                  label="Sector"
                  value={labelOf(SECTOR_OPTIONS, other.sector)}
                />
                <KeyValue
                  label="Organization type"
                  value={labelOf(ORG_TYPE_OPTIONS, other.org_type)}
                />
                <KeyValue
                  label="Stage"
                  value={labelOf(STAGE_OPTIONS, other.stage)}
                />
                <KeyValue
                  label="Partnership types"
                  value={other.partnership_types
                    .map((t) => labelOf(PARTNERSHIP_TYPE_OPTIONS, t))
                    .join(" · ")}
                />
              </div>

              <Divider />

              <Section title="What they offer">{other.what_we_offer}</Section>
              <Section title="What they need">{other.what_we_need}</Section>
            </CardBody>
          </Card>

          {match.rationale ? (
            <Card>
              <CardBody className="space-y-3">
                <p className="eyebrow">Why you matched</p>
                <p className="text-base leading-relaxed text-ink">
                  {match.rationale}
                </p>
                <p className="text-xs text-muted">
                  Generated by Claude against your visible profile fields —
                  no identity ever crosses the prompt.
                </p>
              </CardBody>
            </Card>
          ) : null}

          {compatibility ? (
            <Card>
              <CardBody className="space-y-5">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="eyebrow">Compatibility breakdown</p>
                    <p className="mt-1 text-xs text-muted">
                      Computed from your visible profile fields. The AI score
                      above weighs all five dimensions holistically.
                    </p>
                  </div>
                </div>
                <CompatibilityBars axes={compatibility} />
              </CardBody>
            </Card>
          ) : null}

          {match.status === "accepted" && meeting ? (
            <Card className="bg-gradient-to-br from-white via-cream to-secondary-bg/30">
              <CardBody className="space-y-4">
                <p className="eyebrow">Your intro meeting</p>
                <p className="display text-2xl text-ink md:text-3xl">
                  {new Date(meeting.starts_at).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {meeting.meet_link ? (
                    <a
                      href={meeting.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white transition active:scale-[0.98] hover:bg-primary-hover"
                    >
                      Open Google Meet ↗
                    </a>
                  ) : null}
                  <RescheduleButton
                    matchId={matchId}
                    rescheduleCount={meeting.reschedule_count ?? 0}
                  />
                </div>
                <p className="pt-2 text-xs text-muted">
                  You'll find out who they are when you show up. Need a
                  different time? Reschedule and we'll pick the next free
                  30-minute window on both calendars.
                </p>
              </CardBody>
            </Card>
          ) : null}

          {match.status === "accepted" && !meeting ? (
            <Card className="bg-warning/10">
              <CardBody className="space-y-3">
                <p className="eyebrow text-warning">Scheduling pending</p>
                <p className="text-sm leading-relaxed text-ink">
                  We couldn't auto-schedule yet. This usually means one of you
                  hasn't connected Google Calendar, or there was no overlap in
                  the next 14 days. Connect or reconnect, and we'll retry.
                </p>
                <Link
                  href="/settings/calendar"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Calendar settings →
                </Link>
              </CardBody>
            </Card>
          ) : null}

          {match.status === "pending" && role === "recipient" ? (
            <Card>
              <CardBody className="space-y-3">
                <p className="eyebrow">Your turn</p>
                <p className="text-sm leading-relaxed text-ink">
                  Accept to book a 30-minute intro on both your calendars.
                  Decline if the timing or fit isn't right.
                </p>
                <RespondButtons matchId={matchId} redirectOnAccept />
              </CardBody>
            </Card>
          ) : null}

          <div className="flex justify-end">
            <FlagButton reportedId={other.id} reportedAlias={other.alias} />
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {title}
      </p>
      <p className="text-base leading-relaxed text-ink">{children}</p>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
