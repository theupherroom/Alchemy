import { Reveal } from "./Reveal";

const UPHER_ROOM_URL = "https://theupherroom.com";

// Section dedicated to the parent brand. Sits between "How it works" and the
// final CTA on the landing page. Links open in a new tab.

export function UpHerRoomSection() {
  return (
    <section className="border-t border-border/60 bg-white/60">
      <div className="container-site grid gap-16 py-24 md:grid-cols-[1.05fr_1fr] md:gap-24 md:py-32">
        <Reveal>
          <div className="space-y-8">
            <span className="eyebrow">Built by</span>
            <h2 className="display text-4xl leading-[1.04] text-ink md:text-6xl">
              The UpHer Room <br />
              <span className="text-primary">Inc.</span>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted">
              The UpHer Room is a Center of Excellence advancing leadership,
              capacity, and economic mobility for women. Their thesis: influence
              is cultivated, not accidental — through development, access to the
              right rooms, and collaboration across sectors.
            </p>
            <p className="max-w-md text-base leading-relaxed text-muted">
              Alchemy is the partnership engine inside that thesis — anonymous
              by design so the work matters more than the room you grew up in.
            </p>
            <a
              href={UPHER_ROOM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-ink py-3 pl-7 pr-3 text-sm font-medium text-cream transition-[transform,opacity] active:scale-[0.98]"
            >
              Visit theupherroom.com
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid grid-cols-2 gap-3">
            <PillarCard
              eyebrow="ServeHER"
              title="Community engagement"
              body="Connecting women leaders to the missions and communities they're called to serve."
            />
            <PillarCard
              eyebrow="FundHER"
              title="Resource mobilization"
              body="Capital, sponsorship, and the infrastructure to deploy it where it counts."
            />
            <PillarCard
              eyebrow="BuildHER"
              title="Coalition building"
              body="Cross-sector partnerships that move ideas forward with clarity and discipline."
            />
            <PillarCard
              eyebrow="BecomeHER"
              title="Leadership development"
              body="Cultivating the skills and access women need to lead the rooms they're called into."
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PillarCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-cream-deep/40 p-1.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5">
      <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-5 md:min-h-[200px]">
        <p className="alias-code text-[10px] uppercase tracking-[0.18em] text-bronze">
          {eyebrow}
        </p>
        <p className="display mt-3 text-lg leading-tight text-ink">{title}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}
