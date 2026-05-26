import Link from "next/link";
import { MarketingFooter } from "@/components/landing/MarketingFooter";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-cream">
      <header className="container-site flex h-20 items-center justify-between">
        <Link
          href="/"
          className="display text-xl text-ink transition-opacity duration-200 hover:opacity-70"
        >
          alchemy
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-muted hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-4 py-2 text-white"
          >
            Get started
          </Link>
        </nav>
      </header>
      <main className="container-form py-12 md:py-20">{children}</main>
      <MarketingFooter />
    </div>
  );
}
