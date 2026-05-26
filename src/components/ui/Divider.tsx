import { cn } from "@/lib/cn";

export function Divider({ className }: { className?: string }) {
  return (
    <hr
      aria-hidden="true"
      className={cn("h-px w-full border-0 bg-secondary-bg/80", className)}
    />
  );
}
