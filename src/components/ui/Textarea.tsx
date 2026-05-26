import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-[10px] border border-border bg-white px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-muted/70",
          "transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:bg-cream-deep disabled:opacity-60",
          "resize-y",
          className,
        )}
        {...rest}
      />
    );
  },
);
