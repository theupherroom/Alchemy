// Fixed full-viewport noise overlay for film-grain texture.
// pointer-events: none so it never intercepts clicks.

export function Grain() {
  const noise =
    "data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage: `url("${noise}")`,
        backgroundSize: "200px 200px",
      }}
    />
  );
}
