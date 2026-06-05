import { ImageResponse } from "next/og";

// Home-screen icon for iOS / iPadOS — must be fully opaque (no transparency).
// v3 palette: off-white → salmon gradient with espresso letterform.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbf6f3 0%, #f0c1a3 100%)",
          color: "#4b3621",
          fontSize: 140,
          fontFamily: "Fraunces, 'Times New Roman', Georgia, serif",
          fontWeight: 400,
          letterSpacing: "-0.04em",
          paddingBottom: 14,
        }}
      >
        a
      </div>
    ),
    { ...size },
  );
}
