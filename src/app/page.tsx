import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-[100dvh] bg-cream">
      <header className="container-site flex h-20 items-center justify-between">
        <span className="display text-xl text-ink">alchemy</span>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <Link
              href="/browse"
              className="rounded-full bg-primary px-5 py-2 text-white transition-opacity hover:opacity-90"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-muted transition-colors duration-200 hover:text-ink"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-5 py-2 text-white transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="container-site grid items-center gap-16 py-20 md:grid-cols-[1.1fr_1fr] md:py-32">
        <div className="space-y-8">
          <p className="eyebrow">A tool of The UpHer Room</p>
          <h1 className="display text-5xl text-ink md:text-7xl">
            Mission first. <br />
            Identity at the meeting.
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted">
            Alchemy is a bias-blind strategic partnership platform. You meet
            anonymously around the work you each do — and only learn who the
            other person is once the introduction is already on both your
            calendars.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm font-medium text-white transition-[transform,opacity] active:scale-[0.98] hover:opacity-90"
            >
              Start your anonymous profile
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              How it works ↓
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <SampleCard
            alias="Partner Violet-42"
            subtitle="Health · Indianapolis · Strategic"
            mission="We help under-resourced clinics deliver preventive care to women over 50."
            score={87}
          />
          <SampleCard
            alias="Partner Ember-17"
            subtitle="Social impact · National · Advisory"
            mission="Capital and coaching for women founders in the first five years of building."
            score={72}
          />
        </div>
      </section>

      <section
        id="how-it-works"
        className="container-site grid gap-12 py-20 md:grid-cols-3 md:py-28"
      >
        <Step
          n="01"
          title="Sign up with an alias."
          body="Your full name, organisation, and contact details stay private. Other members see Partner Violet-42 — never you."
        />
        <Step
          n="02"
          title="Browse missions, not headshots."
          body="The exchange is mission-first. Filter by sector, partnership type, and reach. Match scores rank pairs by genuine fit."
        />
        <Step
          n="03"
          title="We book the meeting."
          body="When you both accept, Alchemy reads your free/busy and books a 30-minute intro on Google Meet. You meet — and only then do names appear."
        />
      </section>

      <footer className="container-site flex flex-wrap items-center justify-between gap-4 py-8 text-xs text-muted">
        <span>© Alchemy — a tool of The UpHer Room Inc.</span>
        <Link href="/login" className="hover:text-ink">
          Sign in
        </Link>
      </footer>
    </main>
  );
}

function SampleCard({
  alias,
  subtitle,
  mission,
  score,
}: {
  alias: string;
  subtitle: string;
  mission: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-warm)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="display text-xl text-ink">{alias}</p>
          <p className="text-xs text-muted">{subtitle}</p>
        </div>
        <span className="alias-code rounded-full bg-primary px-3 py-1 text-xs text-white">
          {score}% match
        </span>
      </div>
      <div className="my-4 h-px bg-secondary-bg" />
      <p className="text-sm leading-relaxed text-ink">{mission}</p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-3">
      <p className="alias-code text-xs text-bronze">{n}</p>
      <h3 className="display text-2xl text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
