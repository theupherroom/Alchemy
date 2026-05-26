import Link from "next/link";

export const metadata = { title: "Terms — alchemy" };

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="eyebrow">Terms of use</p>
        <h1 className="display text-4xl text-ink md:text-5xl">
          The agreement.
        </h1>
        <p className="text-sm text-muted">Last updated: 26 May 2026.</p>
      </header>

      <div className="space-y-6">
        <Section title="The platform">
          alchemy is a service operated by The UpHer Room Inc. By creating an
          account, you agree to these terms. If you don't agree, please don't
          use the service.
        </Section>

        <Section title="Eligibility">
          You must be 18 or older, legally able to enter into contracts, and
          representing yourself or an organisation you are authorised to
          represent. One person, one account. Misrepresenting identity or
          affiliation is grounds for suspension.
        </Section>

        <Section title="Good faith">
          alchemy works because members show up honestly. By participating, you
          agree to:
          <ul className="list-inside list-disc space-y-2 pt-3 text-sm text-muted">
            <li>Treat other members with respect, including outside the platform.</li>
            <li>Show up to scheduled intro meetings, or cancel with reasonable notice.</li>
            <li>
              Use information shared at a meeting only for the purpose it was
              shared. No cold outreach to a match's network, no harvesting of
              contacts.
            </li>
            <li>
              Submit flags only when warranted. Frivolous flagging undermines
              the system.
            </li>
          </ul>
        </Section>

        <Section title="Three-strike suspension">
          If three members flag your account, it is suspended automatically.
          We do not run an appeals process during beta. Email
          hello@theupherroom.com if you believe the suspension is an error.
        </Section>

        <Section title="Anonymity is mutual">
          You agree not to attempt to identify other members through external
          channels before a confirmed meeting. The product's value depends on
          the inversion of when identity is revealed.
        </Section>

        <Section title="No employment or fiduciary relationship">
          alchemy is an introduction service. Whatever business, partnership,
          or arrangement you enter into with another member is between you and
          them. We do not vouch for, employ, or act as agent for any member.
        </Section>

        <Section title="Liability">
          The service is provided "as is" during beta. We are not liable for
          interactions between members, the outcomes of any partnership formed,
          or for downtime, data loss, or third-party service failures
          (Anthropic, Resend, Google, etc.).
        </Section>

        <Section title="Account deletion">
          You can request deletion at any time by emailing
          hello@theupherroom.com. Profile data is removed within 14 days; some
          records (match history, flags) may be retained in anonymised form
          for platform integrity.
        </Section>

        <Section title="Changes">
          We may update these terms as the product matures. Material changes
          will be emailed to active members with at least 14 days' notice.
        </Section>

        <Section title="Governing law">
          These terms are governed by the laws of the United States and the
          state in which The UpHer Room Inc. is registered. Disputes will be
          resolved in those courts.
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
