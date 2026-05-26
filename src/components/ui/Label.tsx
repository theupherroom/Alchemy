import { type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  hint?: string;
};

export function Label({ className, children, hint, ...rest }: LabelProps) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1.5 text-sm font-medium text-ink",
        className,
      )}
      {...rest}
    >
      <span>
        {children}
        {hint ? (
          <span className="ml-2 font-normal text-muted">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}
