import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-cream">
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
  );
}
