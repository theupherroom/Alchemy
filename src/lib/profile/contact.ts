// Display helpers for admin views.
// Members see aliases only — admin views also see first name + email.

export function firstNameOf(fullName: string | null | undefined): string {
  if (!fullName) return "";
  const trimmed = fullName.trim();
  if (!trimmed) return "";
  return trimmed.split(/\s+/)[0] ?? "";
}

export function contactLine(
  fullName: string | null | undefined,
  email: string | null | undefined,
): string {
  const first = firstNameOf(fullName);
  if (first && email) return `${first} · ${email}`;
  return email ?? first ?? "";
}
