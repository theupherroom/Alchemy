import Link from "next/link";

const UPHER_ROOM_URL = "https://theupherroom.com";

// Marketing footer for the public landing page. Slightly richer than the app
// footer — surfaces the parent brand + sister-product callouts.

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-cream-deep/30">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <p className="display text-2xl text-ink">alchemy</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            A bias-blind strategic partnership platform. A tool of The UpHer
            Room Inc. — building women of influence for leadership and impact.
          </p>
          <a
            href={UPHER_ROOM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            Visit theupherroom.com
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <FooterColumn title="Product">
          <FooterLink href="/signup">Create account</FooterLink>
          <FooterLink href="/login">Sign in</FooterLink>
          <FooterLink href="/#how-it-works">How it works</FooterLink>
        </FooterColumn>

        <FooterColumn title="Legal">
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
          <FooterLink href="/help">Help & FAQ</FooterLink>
        </FooterColumn>

        <FooterColumn title="The UpHer Room">
          <ExternalLink href={UPHER_ROOM_URL}>Home</ExternalLink>
          <ExternalLink href="https://builtformore.theupherroom.com">
            BuiltForMore
          </ExternalLink>
          <FooterLink href="mailto:hello@theupherroom.com">Contact</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-border/60">
        <div className="container-site flex flex-wrap items-center justify-between gap-4 py-6 text-xs text-muted">
          <span>© {new Date().getFullYear()} The UpHer Room Inc.</span>
          <span className="alias-code">Partner Violet-42 · Partner Ember-17</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
        {title}
      </p>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-muted underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
      >
        {children}
      </Link>
    </li>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-muted underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
      >
        {children}
        <span aria-hidden="true" className="text-[10px]">↗</span>
      </a>
    </li>
  );
}
