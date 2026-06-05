import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardBody } from "@/components/ui/Card";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "AI cost — admin" };
export const dynamic = "force-dynamic";

// Claude Haiku 4.5 pricing (Jan 2026): roughly $1/1M input, $5/1M output tokens.
// Treat these as approximate.
const INPUT_PRICE_PER_M = 1.0;
const OUTPUT_PRICE_PER_M = 5.0;

function costUsd(input: number, output: number): number {
  return (
    (input / 1_000_000) * INPUT_PRICE_PER_M +
    (output / 1_000_000) * OUTPUT_PRICE_PER_M
  );
}

export default async function AdminAILogsPage() {
  await requireAdmin();
  const admin = createAdminClient();
  const day = new Date(Date.now() - 86_400_000).toISOString();
  const week = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const month = new Date(Date.now() - 30 * 86_400_000).toISOString();

  const [{ data: dayRows }, { data: weekRows }, { data: monthRows }, { data: recent }] =
    await Promise.all([
      admin
        .from("ai_call_log")
        .select("feature, input_tokens, output_tokens, error")
        .gt("created_at", day),
      admin
        .from("ai_call_log")
        .select("feature, input_tokens, output_tokens, error")
        .gt("created_at", week),
      admin
        .from("ai_call_log")
        .select("feature, input_tokens, output_tokens, error")
        .gt("created_at", month),
      admin
        .from("ai_call_log")
        .select(
          "id, feature, model, input_tokens, output_tokens, latency_ms, error, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  function summarize(rows: typeof dayRows) {
    const r = rows ?? [];
    const calls = r.length;
    const errors = r.filter((x) => x.error).length;
    const inputTokens = r.reduce((s, x) => s + (x.input_tokens ?? 0), 0);
    const outputTokens = r.reduce((s, x) => s + (x.output_tokens ?? 0), 0);
    return {
      calls,
      errors,
      cost: costUsd(inputTokens, outputTokens),
      inputTokens,
      outputTokens,
    };
  }

  const sumDay = summarize(dayRows);
  const sumWeek = summarize(weekRows);
  const sumMonth = summarize(monthRows);

  return (
    <div className="container-site py-10">
      <div className="space-y-3 pb-6">
        <p className="eyebrow">Admin · AI cost</p>
        <h1 className="display text-3xl text-ink md:text-4xl">
          Anthropic spend.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Computed from <code className="alias-code">ai_call_log</code>.
          Token-based estimate using Haiku 4.5 pricing
          (${INPUT_PRICE_PER_M.toFixed(2)}/M input, $
          {OUTPUT_PRICE_PER_M.toFixed(2)}/M output).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SpendCard label="Last 24 hours" data={sumDay} />
        <SpendCard label="Last 7 days" data={sumWeek} />
        <SpendCard label="Last 30 days" data={sumMonth} />
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="eyebrow">Latest 50 calls</h2>
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-xs">
                <thead>
                  <tr className="bg-cream-deep/50 text-left text-muted">
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Feature</th>
                    <th className="px-3 py-2 font-medium">Model</th>
                    <th className="px-3 py-2 text-right font-medium">In</th>
                    <th className="px-3 py-2 text-right font-medium">Out</th>
                    <th className="px-3 py-2 text-right font-medium">ms</th>
                    <th className="px-3 py-2 font-medium">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {(recent ?? []).map((row) => (
                    <tr key={row.id} className="text-ink">
                      <td className="whitespace-nowrap px-3 py-2 text-muted">
                        {new Date(row.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2">{row.feature}</td>
                      <td className="px-3 py-2 text-muted">{row.model}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.input_tokens ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.output_tokens ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {row.latency_ms ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-error">
                        {row.error ? row.error.slice(0, 60) : ""}
                      </td>
                    </tr>
                  ))}
                  {(recent ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-muted">
                        No AI calls logged yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function SpendCard({
  label,
  data,
}: {
  label: string;
  data: {
    calls: number;
    errors: number;
    cost: number;
    inputTokens: number;
    outputTokens: number;
  };
}) {
  return (
    <Card>
      <CardBody className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
          {label}
        </p>
        <p className="display text-3xl tabular-nums text-ink">
          ${data.cost.toFixed(2)}
        </p>
        <p className="text-xs text-muted">
          {data.calls} calls · {data.errors} errors
        </p>
        <p className="text-xs text-muted">
          {data.inputTokens.toLocaleString()} in /{" "}
          {data.outputTokens.toLocaleString()} out
        </p>
      </CardBody>
    </Card>
  );
}
