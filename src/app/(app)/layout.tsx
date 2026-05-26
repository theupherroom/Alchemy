import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { NotificationBell } from "@/components/nav/NotificationBell";
import { MobileNav } from "@/components/nav/MobileNav";
import { AppFooter } from "@/components/nav/AppFooter";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/browse", label: "Browse" },
  { href: "/matches", label: "Matches" },
  { href: "/suggestions", label: "Suggested" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles_self")
    .select("alias,calendar_connected")
    .maybeSingle();

  return (
    <div className="min-h-[100dvh] bg-cream">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/80 backdrop-blur-md">
        <div className="container-site flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="display text-xl text-ink transition-opacity duration-200 hover:opacity-70"
            >
              alchemy
            </Link>
            <nav className="hidden gap-6 text-sm lg:flex">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <NotificationBell />
            {profile?.alias ? (
              <Badge
                variant="primary"
                className="alias-code hidden sm:inline-flex"
              >
                {profile.alias}
              </Badge>
            ) : null}
            <form
              action="/auth/logout"
              method="post"
              className="hidden lg:block"
            >
              <button
                type="submit"
                className="text-xs text-muted hover:text-ink"
              >
                Sign out
              </button>
            </form>
            <MobileNav alias={profile?.alias ?? null} links={NAV_LINKS} />
          </div>
        </div>
      </header>
      {!profile?.calendar_connected ? (
        <div className="border-b border-border/40 bg-cream-deep/50 text-muted">
          <div className="container-site flex items-center justify-between gap-3 py-2 text-xs">
            <span>
              Connect Google Calendar to enable auto-scheduling for your
              future matches.
            </span>
            <Link
              href="/settings/calendar"
              className="whitespace-nowrap font-medium text-primary underline-offset-4 hover:underline"
            >
              Connect →
            </Link>
          </div>
        </div>
      ) : null}
      <main className="flex min-h-[calc(100dvh-4rem)] flex-col">
        <div className="flex-1">{children}</div>
        <AppFooter />
      </main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-muted transition-colors duration-200 hover:text-ink"
    >
      {children}
    </Link>
  );
}
