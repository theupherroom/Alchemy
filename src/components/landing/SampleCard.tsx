import { AnimatedScore } from "./AnimatedScore";
import { cn } from "@/lib/cn";

type SampleCardProps = {
  alias: string;
  subtitle: string;
  mission: string;
  offer: string;
  need: string;
  score: number;
  tag: string;
  rotate?: string;
  className?: string;
};

// Double-bezel card: outer shell + inner core. The shell has a hairline ring
// and a generous outer radius; the core has a slightly smaller mathematically
// computed radius for concentric curves.

export function SampleCard({
  alias,
  subtitle,
  mission,
  offer,
  need,
  score,
  tag,
  rotate,
  className,
}: SampleCardProps) {
  const tone =
    score >= 80
      ? "bg-primary text-white"
      : "bg-primary-bg text-primary-fg";

  return (
    <div
      className={cn(
        "group rounded-[2rem] border border-border bg-cream-deep/60 p-2 shadow-[var(--shadow-warm-lg)] backdrop-blur-sm transition-transform duration-[600ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
        "hover:-translate-y-1",
        className,
      )}
      style={rotate ? { transform: `rotate(${rotate})` } : undefined}
    >
      <div
        className="relative overflow-hidden rounded-[calc(2rem-0.5rem)] bg-white p-6 md:p-7"
        style={{
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6)",
        }}
      >
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-bg/40 blur-2xl" />

        <div className="relative space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="alias-code text-[10px] uppercase tracking-[0.2em] text-bronze">
                {tag}
              </p>
              <p className="display text-2xl text-ink md:text-[1.7rem]">
                {alias}
              </p>
              <p className="text-xs text-muted">{subtitle}</p>
            </div>
            <span
              className={cn(
                "alias-code inline-flex items-center rounded-full px-3 py-1 text-xs tabular-nums",
                tone,
              )}
            >
              <AnimatedScore target={score} />% match
            </span>
          </div>

          <div className="h-px w-12 bg-secondary" />

          <p className="text-base leading-relaxed text-ink">{mission}</p>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
            <dt className="text-muted">Offers</dt>
            <dd className="text-ink">{offer}</dd>
            <dt className="text-muted">Looking</dt>
            <dd className="text-ink">{need}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
