import Link from "next/link";

const UPHER_ROOM_URL = "https://theupherroom.com";

// Persistent app-shell footer. Quieter than the marketing footer.
// One row: brand attribution + utility links.

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-border/50 bg-cream/60">
      <div className="container-site flex flex-col gap-3 py-8 text-xs text-muted md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="display text-base text-ink">alchemy</span>
          <span aria-hidden="true">·</span>
          <span>
            A tool of{" "}
            <a
              href={UPHER_ROOM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline-offset-4 hover:underline"
            >
              The UpHer Room Inc.
            </a>
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-5">
          <Link href="/help" className="hover:text-ink">
            Help
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <a
            href="mailto:hello@theupherroom.com"
            className="hover:text-ink"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
