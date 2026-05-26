import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white",
        "shadow-elev",
        className,
      )}
      {...rest}
    />
  );
}

export function CardBody({ className, ...rest }: CardProps) {
  return <div className={cn("p-6 md:p-8", className)} {...rest} />;
}
