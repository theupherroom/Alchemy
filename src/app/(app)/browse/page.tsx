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
};

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
            <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
              <p className="display text-2xl text-ink">No profiles match yet.</p>
              <p className="mt-2 text-sm text-muted">
                Loosen a filter — or you may be among the earliest to arrive.
              </p>
            </div>
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
