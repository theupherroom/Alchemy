import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileCard } from "@/components/profile/ProfileCard";
import type { PublicProfileColumns } from "@/types/database";

// Renders up to 4 highest-scoring suggestions for the current user.
// Suggestions are computed by a daily cron (Phase 2d) and stored in
// public.suggestions with score + rationale. This component reads them and
// passes initialScore to ProfileCard so no per-card fetch is needed.

export async function SuggestedStrip({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("suggestions")
    .select("candidate, score, rationale")
    .eq("for_user", currentUserId)
    .eq("dismissed", false)
    .order("score", { ascending: false })
    .limit(4);

  if (!rows || rows.length === 0) return null;

  const candidateIds = rows.map((r) => r.candidate);
  const { data: profiles } = await admin
    .from("profiles_public")
    .select("*")
    .in("id", candidateIds);

  const byId = new Map<string, PublicProfileColumns>(
    ((profiles ?? []) as PublicProfileColumns[]).map((p) => [p.id, p]),
  );

  const enriched = rows
    .map((r) => {
      const profile = byId.get(r.candidate);
      return profile ? { profile, score: r.score, rationale: r.rationale } : null;
    })
    .filter((x): x is { profile: PublicProfileColumns; score: number; rationale: string } => x !== null);

  if (enriched.length === 0) return null;

  return (
    <section className="space-y-4 pb-10">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="eyebrow">Suggested for you</p>
          <h2 className="display text-2xl text-ink md:text-3xl">
            High-fit alignments, ranked.
          </h2>
        </div>
        <Link
          href="/suggestions"
          className="hidden text-sm text-primary underline-offset-4 hover:underline md:inline"
        >
          See all
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {enriched.map(({ profile, score, rationale }) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            initialScore={{ score, rationale }}
          />
        ))}
      </div>
    </section>
  );
}
