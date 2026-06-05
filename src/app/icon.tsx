import { ImageResponse } from "next/og";

// Browser tab favicon — generated at build time by Next.
// Lowercase serif "a" on off-white, espresso ink. Aligned with the v3 palette
// (burnt orange + espresso + cyan + salmon on off-white).

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf6f3",
          color: "#4b3621",
          fontSize: 26,
          fontFamily: "Fraunces, 'Times New Roman', Georgia, serif",
          fontWeight: 400,
          letterSpacing: "-0.04em",
          borderRadius: 6,
          border: "1px solid #e8dccf",
          paddingBottom: 2,
        }}
      >
        a
      </div>
    ),
    { ...size },
  );
}
