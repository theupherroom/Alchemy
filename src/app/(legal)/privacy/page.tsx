import Link from "next/link";

export const metadata = { title: "Privacy — alchemy" };

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Privacy</p>
        <h1 className="display text-4xl text-ink md:text-5xl">
          What we collect, and why.
        </h1>
        <p className="text-sm text-muted">Last updated: 26 May 2026.</p>
      </header>

      <div className="prose-alchemy space-y-6 text-base leading-relaxed text-ink">
        <Section title="The short version">
          alchemy is anonymous by design. Your real name, organisation name,
          personal email, website, photo, and credentials are stored privately
          and are only shared with another member <em>at the meeting itself</em>.
          They never appear in browse, match previews, calendar invites, or
          AI prompts.
        </Section>

        <Section title="What we collect">
          <ul className="list-inside list-disc space-y-2 text-sm text-muted">
            <li>Account: email address + hashed password (via Supabase Auth).</li>
            <li>
              Visible profile: mission, sector, organisation type, stage,
              partnership types sought, what you offer, what you need,
              geographic reach, region. This is what other members see beside
              your alias.
            </li>
            <li>
              Hidden profile: full name, organisation name, personal email,
              website, profile photo URL, years in operation, credentials.
              These never appear in the directory.
            </li>
            <li>
              Google Calendar tokens (read-only free/busy + event-create
              scopes). Encrypted at rest. We never read event titles or
              attendee lists.
            </li>
            <li>
              Match records (who requested whom, accept/decline status), AI
              match scores + rationale, and meeting metadata (start time,
              Meet link).
            </li>
            <li>Flags submitted by you or against you.</li>
          </ul>
        </Section>

        <Section title="How AI is used">
          We use Anthropic's Claude API to score partnership compatibility and
          draft the intro email's rationale paragraph. Only your{" "}
          <strong>visible</strong> profile fields are passed to Claude — never
          your real name, email, organisation, website, or photo. AI calls are
          logged with token counts (not content) for cost monitoring.
        </Section>

        <Section title="How we use your data">
          <ul className="list-inside list-disc space-y-2 text-sm text-muted">
            <li>Show your visible profile to other authenticated members.</li>
            <li>Score matches between you and candidate profiles.</li>
            <li>
              Find a 30-minute overlap on both calendars and create a Google
              Meet event when a match is mutually accepted.
            </li>
            <li>Send transactional email (account confirmation, intro emails) via Resend.</li>
            <li>Enforce platform safety (flagging, auto-suspension).</li>
          </ul>
        </Section>

        <Section title="Who we share with">
          We do not sell your data. Sub-processors:
          <ul className="list-inside list-disc space-y-2 pt-3 text-sm text-muted">
            <li>Supabase (Postgres + Auth hosting, US/EU)</li>
            <li>Vercel (web hosting)</li>
            <li>Anthropic (AI scoring + email rationale)</li>
            <li>Resend (transactional email)</li>
            <li>Google (Calendar integration, only with your consent)</li>
          </ul>
        </Section>

        <Section title="Your rights">
          Write to{" "}
          <a
            href="mailto:hello@theupherroom.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@theupherroom.com
          </a>{" "}
          to access, correct, or delete your data. We will respond within 14 days.
        </Section>

        <Section title="Beta caveat">
          alchemy is in active beta. This policy may change as the product
          matures. We will email registered members when material changes are
          made, with at least 14 days' notice before any expanded use of data.
        </Section>
      </div>

      <div className="pt-6 text-sm text-muted">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← Back to home
        </Link>
      </div>
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
    <section className="space-y-3">
      <h2 className="display text-xl text-ink md:text-2xl">{title}</h2>
      <div className="text-sm leading-relaxed text-ink/90">{children}</div>
    </section>
  );
}
