import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

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
      <header className="border-b border-border/60 bg-cream/80 backdrop-blur-md">
        <div className="container-site flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/browse"
              className="display text-xl text-ink transition-opacity duration-200 hover:opacity-70"
            >
              alchemy
            </Link>
            <nav className="hidden gap-6 text-sm md:flex">
              <NavLink href="/browse">Browse</NavLink>
              <NavLink href="/matches">Matches</NavLink>
              <NavLink href="/profile">Profile</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {profile?.alias ? (
              <Badge variant="primary" className="alias-code">
                {profile.alias}
              </Badge>
            ) : null}
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="text-xs text-muted hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {!profile?.calendar_connected ? (
        <div className="bg-warning/10 text-warning">
          <div className="container-site flex items-center justify-between py-2 text-xs">
            <span>
              Calendar not connected — your matches cannot be auto-scheduled.
            </span>
            <Link
              href="/settings/calendar"
              className="font-medium underline-offset-4 hover:underline"
            >
              Connect
            </Link>
          </div>
        </div>
      ) : null}
      <main>{children}</main>
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
