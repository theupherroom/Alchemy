import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendApprovalEmail } from "@/lib/email/approved";

type Action =
  | "ban"
  | "unban"
  | "reset_flags"
  | "delete"
  | "grant_admin"
  | "revoke_admin"
  | "approve"
  | "reject"
  | "reset_approval";

type Body = {
  action?: Action;
};

const ALLOWED: Action[] = [
  "ban",
  "unban",
  "reset_flags",
  "delete",
  "grant_admin",
  "revoke_admin",
  "approve",
  "reject",
  "reset_approval",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Body | null;
  const action = body?.action;

  if (!action || !ALLOWED.includes(action)) {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  if (id === admin.id) {
    return NextResponse.json(
      { error: "Refusing to take action on your own account." },
      { status: 400 },
    );
  }

  const client = createAdminClient();

  if (action === "ban") {
    const { error } = await client
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: "suspended" });
  }

  if (action === "unban") {
    const { error } = await client
      .from("profiles")
      .update({ status: "active" })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ status: "active" });
  }

  if (action === "reset_flags") {
    const { error } = await client
      .from("profiles")
      .update({ flag_count: 0 })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ flag_count: 0 });
  }

  if (action === "grant_admin" || action === "revoke_admin") {
    const isAdmin = action === "grant_admin";
    const { error } = await client
      .from("profiles")
      .update({ is_admin: isAdmin })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ is_admin: isAdmin });
  }

  if (action === "approve") {
    const { error } = await client
      .from("profiles")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: admin.id,
      })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    // Fire-and-forget the approval email. Don't fail the action if email fails.
    const emailResult = await sendApprovalEmail(id).catch((err) => ({
      sent: false,
      error: err instanceof Error ? err.message : "unknown",
    }));

    return NextResponse.json({
      approval_status: "approved",
      email: emailResult,
    });
  }

  if (action === "reject") {
    const { error } = await client
      .from("profiles")
      .update({
        approval_status: "rejected",
        approved_at: null,
        approved_by: admin.id,
      })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ approval_status: "rejected" });
  }

  if (action === "reset_approval") {
    const { error } = await client
      .from("profiles")
      .update({
        approval_status: "pending",
        approved_at: null,
        approved_by: null,
      })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ approval_status: "pending" });
  }

  // delete
  const { error: profileErr } = await client
    .from("profiles")
    .delete()
    .eq("id", id);
  if (profileErr)
    return NextResponse.json({ error: profileErr.message }, { status: 500 });

  const { error: authErr } = await client.auth.admin.deleteUser(id);
  if (authErr)
    return NextResponse.json(
      { error: `profile deleted but auth deletion failed: ${authErr.message}` },
      { status: 500 },
    );

  return NextResponse.json({ deleted: true });
}
