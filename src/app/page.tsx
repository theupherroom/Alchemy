import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Grain } from "@/components/landing/Grain";
import { Reveal } from "@/components/landing/Reveal";
import { SampleCard } from "@/components/landing/SampleCard";
import { MarketingFooter } from "@/components/landing/MarketingFooter";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-cream">
      <Grain />

      {/* ambient color washes — burnt-orange + salmon + cyan */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-primary-bg/60 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[36%] -right-40 h-[520px] w-[520px] rounded-full bg-accent/40 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[68%] -left-32 h-[420px] w-[420px] rounded-full bg-secondary-bg/60 blur-[140px]"
      />

      <div className="relative z-10">
        <Header signedIn={Boolean(user)} />
        <Hero signedIn={Boolean(user)} />
        <ExchangeSection />
        <HowItWorks />
        <RevealSection />
        <BuiltBy />
        <OurCore />
        <BuiltFor />
        <FinalCta signedIn={Boolean(user)} />
        <MarketingFooter />
      </div>
    </div>
  );
}

function Header({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="container-site flex h-20 items-center justify-between">
      <span className="display text-xl text-ink">alchemy</span>
      <nav className="flex items-center gap-3 text-sm">
        {signedIn ? (
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 rounded-full bg-ink py-2 pl-5 pr-2 text-sm font-medium text-cream transition-[transform,opacity] active:scale-[0.98]"
          >
            Open the app
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <Arrow />
            </span>
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-muted transition-colors duration-200 hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-ink py-2 pl-5 pr-2 text-sm font-medium text-cream transition-[transform,opacity] active:scale-[0.98]"
            >
              Get started
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <Arrow />
              </span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="container-site grid items-center gap-16 pt-12 pb-24 md:grid-cols-[1.05fr_1fr] md:pt-20 md:pb-40">
      <div className="space-y-10">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            A tool of The UpHer Room
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="display text-5xl leading-[1.02] text-ink sm:text-6xl md:text-[5.5rem]">
            Partnerships Built on{" "}
            <span className="text-primary">Impact.</span>
            <br />
            Not Identity.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="max-w-lg text-lg leading-relaxed text-muted">
            Alchemy eliminates subjective bias by connecting impact-focused
            leaders through shared vision, ensuring initial meetings occur on
            equitable ground.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href={signedIn ? "/dashboard" : "/signup"}
              className="group inline-flex items-center gap-2 rounded-full bg-primary py-3 pl-7 pr-3 text-sm font-medium text-white shadow-press transition-[transform,opacity,box-shadow] duration-200 active:scale-[0.98] hover:bg-primary-hover hover:shadow-elev-lg"
            >
              {signedIn ? "Open the app" : "Start your anonymous profile"}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <Arrow />
              </span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              How it works ↓
            </Link>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <div className="flex flex-wrap items-center gap-5 pt-6 text-[11px] uppercase tracking-[0.18em] text-muted">
            <Mark>Anonymous</Mark>
            <Dot />
            <Mark>Mission-matched</Mark>
            <Dot />
            <Mark>AI-scheduled</Mark>
          </div>
        </Reveal>
      </div>

      <Reveal delay={200} className="relative">
        <div className="relative mx-auto max-w-[420px] space-y-5 md:max-w-none">
          <SampleCard
            tag="Profile · Health"
            alias="Partner Violet-42"
            subtitle="Health · Indianapolis · Strategic"
            mission="We help under-resourced clinics deliver preventive care to women over 50."
            offer="Vendor relationships, board advisory"
            need="Funder intros, program co-design"
            score={87}
            rotateClass="md:-rotate-2"
          />
          <SampleCard
            tag="Profile · Capital"
            alias="Partner Ember-17"
            subtitle="Social impact · National · Advisory"
            mission="Capital and coaching for women founders in their first five years."
            offer="Pre-seed cheques, founder coaching"
            need="Clinical-sector pipeline, advisors"
            score={72}
            rotateClass="md:rotate-2"
            className="md:-mt-12 md:ml-20"
          />
        </div>
      </Reveal>
    </section>
  );
}

function ExchangeSection() {
  return (
    <section className="border-t border-border/60 bg-white/60 py-24 md:py-32">
      <div className="container-site grid gap-16 md:grid-cols-2 md:gap-24">
        <Reveal>
          <div className="space-y-6 md:sticky md:top-32">
            <span className="eyebrow">The exchange</span>
            <h2 className="display text-4xl leading-[1.05] text-ink md:text-6xl">
              The End of Superficial Partnerships.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted">
              The platform helps mission-driven leaders identify compatible
              partners by prioritizing work alignment over credentials or
              connections. Users create anonymous profiles, review matched
              opportunities, and reveal identity only after mutual agreement to
              proceed.
            </p>
            <ul className="space-y-3 pt-4 text-sm text-ink">
              <Bullet>Sector and partnership-type alignment</Bullet>
              <Bullet>Complementary needs and offers</Bullet>
              <Bullet>Honest AI scores — 80+ reserved for genuine fit</Bullet>
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120} className="space-y-6">
          <SampleCard
            tag="Looking for"
            alias="Partner Saffron-31"
            subtitle="Education · Regional · Co-program"
            mission="Out-of-school STEM programming for girls in rural Indiana."
            offer="Teacher network, classroom integration"
            need="Curriculum design, scholarship funding"
            score={91}
            rotateClass="md:rotate-1"
          />
          <div className="flex items-center justify-center py-2 text-muted">
            <svg
              className="h-6 w-6 animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 7l10 10M17 7L7 17" />
            </svg>
          </div>
          <SampleCard
            tag="Aligns with"
            alias="Partner Cedar-58"
            subtitle="Finance · National · Sponsorship"
            mission="Scholarship pipeline for first-gen STEM students."
            offer="Sponsorship budget, alumni network"
            need="Rural-area programs, on-the-ground partners"
            score={91}
            rotateClass="md:-rotate-1"
          />
        </Reveal>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Register behind an alias.",
      body: "Members see Partner Violet-42 — not your name, organization, or photo. All profiles undergo internal verification before matching initiates.",
    },
    {
      n: "02",
      title: "Browse missions, not headshots.",
      body: "The system prioritizes mission-alignment, using AI to assess genuine compatibility while disregarding titles and organizational logos.",
    },
    {
      n: "03",
      title: "AI handles the logistics.",
      body: "Upon mutual acceptance, the system reviews calendars, generates introduction emails, and schedules a 30-minute video meeting. Names appear only at meeting start.",
    },
  ];

  return (
    <section id="how-it-works" className="container-site py-24 md:py-32">
      <Reveal>
        <div className="max-w-2xl space-y-4 pb-16">
          <span className="eyebrow">How it works</span>
          <h2 className="display text-4xl leading-[1.05] text-ink md:text-6xl">
            Three steps. No back-and-forth.{" "}
            <span className="text-primary">Powered by AI.</span>
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-10 md:grid-cols-3 md:gap-6">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120}>
            <div className="group rounded-[1.75rem] border border-border bg-cream-deep/50 p-2 transition-transform duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
              <div className="rounded-[calc(1.75rem-0.5rem)] bg-white p-8 md:min-h-[260px]">
                <p className="alias-code text-xs text-bronze">{s.n}</p>
                <h3 className="display mt-6 text-2xl leading-tight text-ink md:text-[1.75rem]">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {s.body}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function RevealSection() {
  return (
    <section className="border-y border-border/60 bg-ink text-cream">
      <div className="container-site py-24 md:py-40">
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:items-end md:gap-24">
          <Reveal>
            <div className="space-y-8">
              <span className="alias-code inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-cream/70">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                The reveal
              </span>
              <h2 className="display text-4xl leading-[1.04] text-cream md:text-7xl">
                Show up authentically.{" "}
                <br className="hidden md:inline" />
                <span className="text-accent">Not rehearsed.</span>
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-cream/70">
                Identity remains concealed across all communications —
                directory listings, match requests, introductions, and calendar
                invites — preventing pre-meeting research and reducing bias
                introduction. The first time real names appear is in the
                meeting itself.
              </p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <dl className="grid grid-cols-2 gap-x-12 gap-y-6 md:grid-cols-1">
              <Stat label="Profile setup" value="~5 min" />
              <Stat label="Time to first match" value="< 24h" />
              <Stat label="Auto-scheduling" value="30-min" />
              <Stat label="Identity reveal" value="0 leaks" />
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BuiltBy() {
  return (
    <section className="container-site py-24 md:py-32">
      <Reveal>
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div className="space-y-3">
            <span className="eyebrow">Built by</span>
            <h2 className="display text-3xl leading-[1.1] text-ink md:text-4xl">
              The UpHer Room Inc.
            </h2>
            <a
              href="https://theupherroom.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 pt-3 text-xs text-primary underline-offset-4 hover:underline"
            >
              theupherroom.com
              <ExternalLinkIcon />
            </a>
          </div>
          <p className="text-base leading-relaxed text-muted md:text-lg">
            The organization advances leadership development, capacity building,
            and economic mobility for women, believing influence develops
            through access, preparation, collaboration, and strategic
            networking. Alchemy represents their technology initiative making
            strategic partnership more accessible and mission-centered.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function OurCore() {
  const cards = [
    {
      title: "Research",
      body: "Examining barriers, patterns, and opportunities affecting women's access to leadership, capital, collaboration, and economic mobility.",
    },
    {
      title: "Education",
      body: "Creating learning experiences and programs strengthening women's leadership capacity and sustainability.",
    },
    {
      title: "Technology",
      body: "Developing digital tools expanding access and creating connection pathways for mission-driven leaders.",
    },
  ];

  return (
    <section className="border-t border-border/60 bg-cream-deep/40 py-24 md:py-32">
      <div className="container-site">
        <Reveal>
          <div className="max-w-2xl space-y-4 pb-16">
            <span className="eyebrow">The cards</span>
            <h2 className="display text-4xl leading-[1.05] text-ink md:text-6xl">
              Our core.
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted">
              Three pillars that shape The UpHer Room&apos;s work — and the
              context Alchemy sits inside.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 120}>
              <div className="group h-full rounded-[1.75rem] border border-border bg-white p-2 transition-transform duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
                <div className="flex h-full flex-col rounded-[calc(1.75rem-0.5rem)] bg-cream p-8 md:min-h-[280px]">
                  <span className="alias-code text-[10px] uppercase tracking-[0.22em] text-bronze">
                    0{i + 1} / pillar
                  </span>
                  <h3 className="display mt-5 text-3xl leading-tight text-ink md:text-[2rem]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {card.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuiltFor() {
  return (
    <section className="container-site py-24 md:py-32">
      <Reveal>
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-16">
          <div className="space-y-3">
            <span className="eyebrow">Built for</span>
            <h2 className="display text-3xl leading-[1.1] text-ink md:text-4xl">
              Every leader driving real change.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-muted md:text-lg">
            Alchemy serves mission-focused founders, nonprofit directors,
            social entrepreneurs, and organizational changemakers. Originating
            as an innovation project within The UpHer Room, the platform
            addresses systemic biases limiting exceptional leaders — now
            accessible to any leader prioritizing mission impact.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="container-site pb-24 md:pb-32">
      <Reveal>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-cream-deep/60 p-2">
          <div className="relative rounded-[calc(2rem-0.5rem)] bg-gradient-to-br from-white via-cream to-accent/30 px-8 py-16 md:px-16 md:py-24">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-bg/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-secondary-bg/50 blur-3xl" />
            <div className="relative max-w-2xl space-y-6">
              <span className="eyebrow">Begin</span>
              <h2 className="display text-4xl leading-[1.05] text-ink md:text-6xl">
                Your alias is waiting.
              </h2>
              <p className="max-w-lg text-base leading-relaxed text-muted">
                Sign up in two minutes. Build your anonymous profile in five.
                Connect your calendar. Then let the mission lead.
              </p>
              <div className="pt-2">
                <Link
                  href={signedIn ? "/dashboard" : "/signup"}
                  className="group inline-flex items-center gap-2 rounded-full bg-ink py-3 pl-7 pr-3 text-sm font-medium text-cream transition-[transform,opacity] active:scale-[0.98]"
                >
                  {signedIn ? "Open the app" : "Create your account"}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <Arrow />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-cream/50">
        {label}
      </dt>
      <dd className="display text-3xl text-cream md:text-4xl">{value}</dd>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"
      />
      <span>{children}</span>
    </li>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}

function Dot() {
  return <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />;
}

function Arrow() {
  return (
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
  );
}

function ExternalLinkIcon() {
  return (
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
  );
}
