// Tiny class-name joiner. Adds no dependency.
// If conflict-resolution (tailwind-merge) becomes necessary, swap implementation
// here — callers don't change.

type ClassValue = string | number | false | null | undefined;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}
