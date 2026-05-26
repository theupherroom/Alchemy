import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Filters } from "./Filters";
import { SuggestedStrip } from "./SuggestedStrip";
import type {
  ProfileGeoReach,
  ProfilePartnershipType,
  ProfileSector,
  ProfileStage,
  PublicProfileColumns,
} from "@/types/database";

export const metadata = { title: "Browse — alchemy" };
export const dynamic = "force-dynamic";

type SearchParams = {
  sector?: ProfileSector;
  partnership_type?: ProfilePartnershipType;
  stage?: ProfileStage;
  geo?: ProfileGeoReach;
  q?: string;
};

function sanitizeQuery(q: string | undefined): string | null {
  if (!q) return null;
  // Allow letters, digits, spaces, hyphen, apostrophe. Cap at 80 chars.
  const cleaned = q
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .trim()
    .slice(0, 80);
  return cleaned.length >= 2 ? cleaned : null;
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const admin = createAdminClient();

  let query = admin
    .from("profiles_public")
    .select("*")
    .neq("id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.sector) query = query.eq("sector", params.sector);
  if (params.stage) query = query.eq("stage", params.stage);
  if (params.geo) query = query.eq("geographic_reach", params.geo);
  if (params.partnership_type) {
    query = query.contains("partnership_types", [params.partnership_type]);
  }
  const q = sanitizeQuery(params.q);
  if (q) {
    const pattern = `*${q}*`;
    query = query.or(
      `mission_statement.ilike.${pattern},what_we_offer.ilike.${pattern},what_we_need.ilike.${pattern},region.ilike.${pattern}`,
    );
  }

  const { data: profiles, error } = await query;
  const list = (profiles ?? []) as PublicProfileColumns[];

  // Existing match relationships for these candidates (to show button states).
  const candidateIds = list.map((p) => p.id);
  const { data: existingMatches } = candidateIds.length
    ? await supabase
        .from("matches")
        .select("requester_id, recipient_id, status")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .in(
          "requester_id",
          [user.id, ...candidateIds],
        )
    : { data: [] as { requester_id: string; recipient_id: string; status: string }[] };

  const statusByCandidate = new Map<
    string,
    "pending" | "accepted" | "declined"
  >();
  for (const m of existingMatches ?? []) {
    const other = m.requester_id === user.id ? m.recipient_id : m.requester_id;
    statusByCandidate.set(other, m.status as "pending" | "accepted" | "declined");
  }

  return (
    <div className="container-site py-12 md:py-16">
      <div className="space-y-3 pb-8">
        <p className="eyebrow">Browse</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Mission first.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Each card is an anonymous profile. Send a request when something
          aligns — we handle the meeting if they accept.
        </p>
      </div>

      <SuggestedStrip currentUserId={user.id} />

      <section className="grid gap-10 md:grid-cols-[260px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <Filters />
        </aside>
        <div className="space-y-6">
          {error ? (
            <p className="rounded-[10px] bg-error/10 px-4 py-3 text-sm text-error">
              Could not load profiles. Refresh to try again.
            </p>
          ) : list.length === 0 ? (
            <BrowseEmpty hasFilters={Boolean(params.sector || params.stage || params.geo || params.partnership_type)} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {list.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  matchStatus={statusByCandidate.get(profile.id) ?? null}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BrowseEmpty({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <p className="display text-2xl text-ink">
          Nothing matches those filters.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Loosen one or two to widen the lens. Strategic matches sometimes sit
          one sector over from where you'd expect.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
      <p className="alias-code text-xs uppercase tracking-[0.22em] text-bronze">
        You&apos;re early
      </p>
      <p className="display mt-3 text-2xl text-ink md:text-3xl">
        The room is still filling.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        You&apos;re among the first members of the alchemy beta. As more
        mission-driven leaders join, you&apos;ll start seeing scored matches
        here. Forward an invite to a peer to seed the network.
      </p>
      <p className="mx-auto mt-4 max-w-md text-xs text-muted">
        Invite link:{" "}
        <span className="alias-code text-primary-fg">
          alchemy.theupherroom.com/signup
        </span>
      </p>
    </div>
  );
}
