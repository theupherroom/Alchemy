import { Card, CardBody } from "@/components/ui/Card";
import { OpsTriggers } from "@/components/admin/OpsTriggers";
import { headers } from "next/headers";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "Ops — admin" };
export const dynamic = "force-dynamic";

export default async function AdminOpsPage() {
  await requireAdmin();
  const host = (await headers()).get("host") ?? "alchemy.theupherroom.com";
  const proto = host.startsWith("localhost") ? "http" : "https";

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-6">
        <p className="eyebrow">Admin · Ops</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Manual triggers.
        </h1>
        <p className="text-sm text-muted">
          Run the daily/weekly crons on demand. Useful for debugging or
          forcing fresh suggestions before a pilot session.
        </p>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <p className="eyebrow">Crons</p>
          <OpsTriggers />
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="space-y-3">
          <p className="eyebrow">Cron URLs (for Vercel)</p>
          <p className="text-xs text-muted">
            These are the paths Vercel auto-pings on the schedule in
            <code className="alias-code">vercel.json</code>. Listed here for
            quick reference.
          </p>
          <ul className="space-y-2 text-xs">
            <li>
              <code className="alias-code text-primary-fg">
                GET {proto}://{host}/api/cron/suggestions
              </code>
              <span className="ml-2 text-muted">— daily 03:00 UTC</span>
            </li>
            <li>
              <code className="alias-code text-primary-fg">
                GET {proto}://{host}/api/cron/expire-matches
              </code>
              <span className="ml-2 text-muted">— daily 04:00 UTC</span>
            </li>
            <li>
              <code className="alias-code text-primary-fg">
                GET {proto}://{host}/api/cron/digest
              </code>
              <span className="ml-2 text-muted">— Monday 14:00 UTC</span>
            </li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
