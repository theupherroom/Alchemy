import Link from "next/link";
import { Grain } from "@/components/landing/Grain";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-cream">
      <Grain />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-32 h-[480px] w-[480px] rounded-full bg-primary-bg/50 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] translate-x-1/3 translate-y-1/3 rounded-full bg-secondary-bg/50 blur-[120px]"
      />

      <div className="relative z-10">
        <header className="container-site flex h-20 items-center">
          <Link
            href="/"
            className="display text-2xl text-ink transition-opacity duration-200 hover:opacity-70"
          >
            alchemy
          </Link>
        </header>
        <main className="container-form pb-24">{children}</main>
      </div>
    </div>
  );
}
