import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";

// POST /api/admin/cron/[job]
// Wrapper that lets admins fire the GET cron endpoints from the UI.
// Forwards to the corresponding /api/cron/<job> with the CRON_SECRET bearer.

const ALLOWED = new Set(["suggestions", "expire-matches", "digest"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ job: string }> },
) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { job } = await params;
  if (!ALLOWED.has(job)) {
    return NextResponse.json({ error: "unknown job" }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const url = `${origin}/api/cron/${job}`;
  const secret = process.env.CRON_SECRET;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: secret ? { authorization: `Bearer ${secret}` } : {},
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    if (!res.ok) {
      return NextResponse.json(
        { error: body.error ?? `cron returned ${res.status}` },
        { status: 500 },
      );
    }
    return NextResponse.json(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
