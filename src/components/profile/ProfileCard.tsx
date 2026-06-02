import { Card, CardBody } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { ScoreBubble } from "./ScoreBubble";
import { ScoreLoader } from "./ScoreLoader";
import { RequestButton } from "./RequestButton";
import { FlagButton } from "./FlagButton";
import {
  GEO_OPTIONS,
  PARTNERSHIP_TYPE_OPTIONS,
  SECTOR_OPTIONS,
  labelOf,
} from "@/lib/profile/enums";
import { formatAlias } from "@/lib/alias/display";
import type { PublicProfileColumns } from "@/types/database";

type ProfileCardProps = {
  profile: PublicProfileColumns;
  // initialScore: known score+rationale (e.g. from suggestions table).
  // If undefined the card will fetch its own score from /api/score on mount.
  initialScore?: { score: number; rationale: string } | null;
  // If true the request button is hidden (e.g. when viewing your own profile).
  hideRequest?: boolean;
  // Whether the user has already requested or matched this candidate.
  matchStatus?: "pending" | "accepted" | "declined" | null;
};

export function ProfileCard({
  profile,
  initialScore,
  hideRequest,
  matchStatus,
}: ProfileCardProps) {
  const subtitleParts = [
    labelOf(SECTOR_OPTIONS, profile.sector),
    profile.region,
    labelOf(GEO_OPTIONS, profile.geographic_reach),
  ].filter(Boolean);

  return (
    <Card className="flex h-full flex-col">
      <CardBody className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="display text-2xl text-ink md:text-[1.625rem]">
              {formatAlias(profile.alias)}
            </p>
            <p className="text-xs text-muted">{subtitleParts.join(" · ")}</p>
          </div>
          {initialScore === undefined ? (
            <ScoreLoader candidateId={profile.id} />
          ) : (
            <ScoreBubble score={initialScore?.score ?? null} />
          )}
        </div>

        <Divider />

        <p className="text-base leading-relaxed text-ink">
          {profile.mission_statement}
        </p>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted">Offers</dt>
          <dd className="text-ink">{profile.what_we_offer}</dd>
          <dt className="text-muted">Looking</dt>
          <dd className="text-ink">{profile.what_we_need}</dd>
        </dl>

        {profile.partnership_types.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.partnership_types.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-cream-deep px-2.5 py-0.5 text-[11px] text-muted"
              >
                {labelOf(PARTNERSHIP_TYPE_OPTIONS, t)}
              </span>
            ))}
          </div>
        ) : null}

        {hideRequest ? null : (
          <div className="mt-auto space-y-2 pt-2">
            <RequestButton
              candidateId={profile.id}
              candidateAlias={profile.alias}
              initialStatus={matchStatus ?? null}
            />
            <div className="flex justify-end">
              <FlagButton
                reportedId={profile.id}
                reportedAlias={profile.alias}
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
