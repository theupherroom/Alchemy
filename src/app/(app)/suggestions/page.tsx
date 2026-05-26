import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileCard } from "@/components/profile/ProfileCard";
import type { PublicProfileColumns } from "@/types/database";

export const metadata = { title: "Suggested for you — alchemy" };
export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: suggestions } = await admin
    .from("suggestions")
    .select("candidate, score, rationale")
    .eq("for_user", user.id)
    .eq("dismissed", false)
    .order("score", { ascending: false });

  const candidateIds = (suggestions ?? []).map((s) => s.candidate);
  const { data: profiles } = candidateIds.length
    ? await admin.from("profiles_public").select("*").in("id", candidateIds)
    : { data: [] as PublicProfileColumns[] };

  const byId = new Map<string, PublicProfileColumns>(
    ((profiles ?? []) as PublicProfileColumns[]).map((p) => [p.id, p]),
  );

  const enriched = (suggestions ?? [])
    .map((s) => {
      const profile = byId.get(s.candidate);
      return profile
        ? { profile, score: s.score, rationale: s.rationale }
        : null;
    })
    .filter(
      (x): x is { profile: PublicProfileColumns; score: number; rationale: string } =>
        x !== null,
    );

  return (
    <div className="container-site py-12 md:py-16">
      <div className="space-y-3 pb-10">
        <p className="eyebrow">Suggested for you</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Where the alignment is strongest.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Recomputed daily based on mission, partnership type, and the offers
          / needs you each described. Only matches we'd put 50+ on are shown.
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <p className="display text-2xl text-ink">
            No suggestions yet.
          </p>
          <p className="mt-2 text-sm text-muted">
            Either the daily refresh hasn't run yet, or we haven't found
            anyone with strong alignment. Browse the full directory in the
            meantime.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {enriched.map(({ profile, score, rationale }) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              initialScore={{ score, rationale }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
