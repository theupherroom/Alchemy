import Link from "next/link";

export const metadata = { title: "Help & FAQ — alchemy" };

const FAQ = [
  {
    q: "Why does alchemy keep me anonymous?",
    a: "Most networking platforms reward who you already know. alchemy reverses that — the mission and partnership fit are the only signals other members see until you both confirm a meeting. That removes the bias that gatekeeps strategic introductions for women-owned and mission-driven organisations.",
  },
  {
    q: "When do other members see my real name?",
    a: "At the meeting itself — never before. Your alias (e.g. Partner Violet-42) is the only identifier in browse, match requests, calendar invites, and intro emails. Real names appear when you both show up to the call.",
  },
  {
    q: "Do I have to connect Google Calendar?",
    a: "Not to use the directory or send match requests. But auto-scheduling only works when both members have connected — until then, accepted matches sit in 'scheduling pending' until you connect. You can connect any time from Settings.",
  },
  {
    q: "How are match scores calculated?",
    a: "Claude scores each pair on alignment of mission, partnership types sought, complementarity of needs and offers, and geographic compatibility. Most pairs are not a strong match — scores of 80+ are reserved for genuine alignment. Scores are cached for 24 hours per pair to keep costs predictable.",
  },
  {
    q: "What happens if someone misbehaves?",
    a: "Any member can flag another from their profile or after a match. Three flags suspend an account automatically. We don't run an appeal process in the beta — write to hello@theupherroom.com if you believe something was a mistake.",
  },
  {
    q: "Can I edit my profile after onboarding?",
    a: "Yes — every field except your alias can be updated any time from Profile → Edit profile. Your alias is permanent so other members can trust they're talking to the same person each time.",
  },
  {
    q: "Is there a chat feature?",
    a: "Deliberately no. alchemy's product surface ends at the introduction — once a meeting is booked, the conversation continues off-platform. We chose this so the value is the warmth of the introduction itself, not yet another inbox.",
  },
  {
    q: "Who is alchemy for?",
    a: "Mission-driven founders, entrepreneurs, and organisational leaders. Women-owned businesses get first access. Built by The UpHer Room Inc., a Center of Excellence advancing leadership for women.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="eyebrow">Help & FAQ</p>
        <h1 className="display text-4xl text-ink md:text-5xl">
          The short answers.
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Still stuck? Email{" "}
          <a
            href="mailto:hello@theupherroom.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            hello@theupherroom.com
          </a>{" "}
          and a real person will reply.
        </p>
      </header>

      <div className="space-y-8">
        {FAQ.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-border bg-white px-6 py-4 transition-colors duration-200 hover:border-primary/40"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium text-ink">
              {f.q}
              <span
                aria-hidden="true"
                className="text-muted transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="pt-4 text-sm text-muted">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
