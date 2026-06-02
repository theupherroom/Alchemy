import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { ProfileCard } from "@/components/profile/ProfileCard";
import type { PublicProfileColumns } from "@/types/database";
import { formatAlias } from "@/lib/alias/display";

export const metadata = { title: "Dashboard — alchemy" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles_self")
    .select("alias,calendar_connected,onboarded_at")
    .maybeSingle();
  if (!profile) redirect("/onboarding");

  const admin = createAdminClient();

  // Aggregate stats and most-recent data in parallel.
  const [
    { data: matches },
    { data: meetings },
    { data: topSuggestionRow },
    { data: notifications },
  ] = await Promise.all([
    admin
      .from("matches")
      .select("id, requester_id, recipient_id, status, created_at")
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`),
    admin
      .from("meetings")
      .select("match_id, starts_at, meet_link")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true }),
    admin
      .from("suggestions")
      .select("candidate, score, rationale")
      .eq("for_user", user.id)
      .eq("dismissed", false)
      .order("score", { ascending: false })
      .limit(1),
    supabase
      .from("notifications")
      .select("id, kind, match_id, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allMatches = matches ?? [];
  const incoming = allMatches.filter(
    (m) => m.recipient_id === user.id && m.status === "pending",
  );
  const outgoing = allMatches.filter(
    (m) => m.requester_id === user.id && m.status === "pending",
  );
  const confirmed = allMatches.filter((m) => m.status === "accepted");

  // Pull upcoming meetings that the user is a party to.
  const myMatchIds = new Set(allMatches.map((m) => m.id));
  const upcomingMeetings = (meetings ?? []).filter((m) =>
    myMatchIds.has(m.match_id),
  );

  // Resolve the top suggestion to a renderable profile, if any.
  const topSuggestion = topSuggestionRow?.[0] ?? null;
  let topProfile: PublicProfileColumns | null = null;
  if (topSuggestion) {
    const { data: p } = await admin
      .from("profiles_public")
      .select("*")
      .eq("id", topSuggestion.candidate)
      .maybeSingle();
    topProfile = (p ?? null) as PublicProfileColumns | null;
  }

  return (
    <div className="container-site py-12 md:py-16">
      <section className="space-y-3 pb-10">
        <p className="eyebrow">Dashboard</p>
        <h1 className="display text-3xl text-ink md:text-5xl">
          Hi, <span className="text-primary">{formatAlias(profile.alias)}</span>.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          A quick view of where your introductions stand. Everything else lives
          one tap away.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 pb-12 md:grid-cols-4 md:gap-5">
        <Stat
          href="/matches"
          label="Incoming"
          value={incoming.length}
          accent={incoming.length > 0}
        />
        <Stat href="/matches" label="Awaiting reply" value={outgoing.length} />
        <Stat href="/matches" label="Confirmed" value={confirmed.length} />
        <Stat
          href="/suggestions"
          label="Suggestions"
          value={(topSuggestionRow?.length ?? 0) > 0 ? "✓" : "—"}
          subtle
        />
      </section>

      {upcomingMeetings.length > 0 ? (
        <section className="pb-12">
          <p className="eyebrow pb-3">Next meeting</p>
          <Card className="bg-gradient-to-br from-white via-cream to-secondary-bg/30">
            <CardBody className="space-y-3">
              <p className="display text-2xl text-ink md:text-3xl">
                {new Date(upcomingMeetings[0].starts_at).toLocaleString(
                  undefined,
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )}
              </p>
              {upcomingMeetings[0].meet_link ? (
                <a
                  href={upcomingMeetings[0].meet_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-fit items-center rounded-full bg-primary px-5 text-xs font-medium text-white"
                >
                  Open Google Meet ↗
                </a>
              ) : null}
              <Link
                href={`/matches/${upcomingMeetings[0].match_id}`}
                className="block text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                See match details →
              </Link>
            </CardBody>
          </Card>
        </section>
      ) : null}

      {topProfile && topSuggestion ? (
        <section className="pb-12">
          <div className="flex items-baseline justify-between gap-4 pb-3">
            <p className="eyebrow">Top suggestion</p>
            <Link
              href="/suggestions"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              See all →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
            <ProfileCard
              profile={topProfile}
              initialScore={{
                score: topSuggestion.score,
                rationale: topSuggestion.rationale,
              }}
            />
            <Card>
              <CardBody className="space-y-3">
                <p className="eyebrow">Why this one</p>
                <p className="text-base leading-relaxed text-ink">
                  {topSuggestion.rationale}
                </p>
                <p className="pt-2 text-xs text-muted">
                  Suggestions are recomputed daily based on mission, partnership
                  type, and the offers / needs you each described.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>
      ) : null}

      <Divider className="my-2" />

      <section className="grid gap-3 py-10 md:grid-cols-4 md:gap-5">
        <ActionLink
          href="/browse"
          eyebrow="Find people"
          title="Browse the exchange"
        />
        <ActionLink
          href="/matches"
          eyebrow="Your matches"
          title="Inbox & confirmed"
        />
        <ActionLink
          href="/profile/edit"
          eyebrow="Your card"
          title="Edit profile"
        />
        <ActionLink
          href="/settings/calendar"
          eyebrow="Scheduling"
          title="Calendar settings"
        />
      </section>

      {(notifications ?? []).length > 0 ? (
        <section className="pt-6">
          <p className="eyebrow pb-3">Recent activity</p>
          <Card>
            <CardBody className="divide-y divide-border p-0">
              {(notifications ?? []).map((n) => (
                <ActivityRow key={n.id} notification={n} />
              ))}
            </CardBody>
          </Card>
        </section>
      ) : null}
    </div>
  );
}

function Stat({
  href,
  label,
  value,
  accent,
  subtle,
}: {
  href: string;
  label: string;
  value: number | string;
  accent?: boolean;
  subtle?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-white p-5 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-elev"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p
        className={`display mt-2 text-3xl text-ink md:text-4xl ${
          accent ? "text-primary" : subtle ? "text-muted" : ""
        }`}
      >
        {value}
      </p>
    </Link>
  );
}

function ActionLink({
  href,
  eyebrow,
  title,
}: {
  href: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-white p-5 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-elev"
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
        {eyebrow}
      </p>
      <p className="mt-2 flex items-center justify-between text-base font-medium text-ink">
        <span>{title}</span>
        <svg
          className="h-4 w-4 text-muted transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:text-ink"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      </p>
    </Link>
  );
}

type NotificationKind =
  | "match_request"
  | "match_accepted"
  | "match_declined"
  | "meeting_scheduled"
  | "flag_warning"
  | "flag_final_warning"
  | "calendar_disconnected";

const ACTIVITY_LABEL: Record<NotificationKind, string> = {
  match_request: "Incoming match request",
  match_accepted: "Your request was accepted",
  match_declined: "Your request was declined",
  meeting_scheduled: "Intro meeting scheduled",
  flag_warning: "Warning — you were flagged",
  flag_final_warning: "Final warning — one more flag suspends your account",
  calendar_disconnected: "Calendar disconnected",
};

function ActivityRow({
  notification,
}: {
  notification: {
    id: string;
    kind: NotificationKind;
    match_id: string | null;
    read_at: string | null;
    created_at: string;
  };
}) {
  const href = notification.match_id
    ? `/matches/${notification.match_id}`
    : notification.kind === "calendar_disconnected"
      ? "/settings/calendar"
      : "/matches";
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors duration-200 hover:bg-cream"
    >
      <div className="flex items-center gap-3">
        {!notification.read_at ? (
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
        ) : (
          <span className="h-2 w-2" aria-hidden="true" />
        )}
        <span className="text-sm text-ink">
          {ACTIVITY_LABEL[notification.kind]}
        </span>
      </div>
      <span className="text-[11px] text-muted">
        {timeAgo(notification.created_at)}
      </span>
    </Link>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
