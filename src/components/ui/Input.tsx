import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-[10px] border border-border bg-white px-4 text-sm text-ink placeholder:text-muted/70",
        "transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0",
        "disabled:cursor-not-allowed disabled:bg-cream-deep disabled:opacity-60",
        className,
      )}
      {...rest}
    />
  );
});
