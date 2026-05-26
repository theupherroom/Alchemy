import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant =
  | "neutral"
  | "primary"
  | "primary-solid"
  | "secondary"
  | "success"
  | "warning"
  | "error";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  neutral: "bg-cream-deep text-ink",
  primary: "bg-primary-bg text-primary-fg",
  "primary-solid": "bg-primary text-white",
  secondary: "bg-secondary-bg text-secondary-fg",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-error-bg text-error",
};

export function Badge({ className, variant = "neutral", ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}
