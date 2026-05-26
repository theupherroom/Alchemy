import { ImageResponse } from "next/og";

// Browser tab favicon — generated at build time by Next.
// Lowercase serif "a" on warm cream, deep-purple ink. Sits in the same
// editorial wordmark family as theupherroom.com.

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
          background: "#fdfbf7",
          color: "#21172f",
          fontSize: 26,
          fontFamily:
            "Fraunces, 'Times New Roman', Georgia, serif",
          fontWeight: 400,
          letterSpacing: "-0.04em",
          borderRadius: 6,
          border: "1px solid #e4d9cf",
          paddingBottom: 2,
        }}
      >
        a
      </div>
    ),
    { ...size },
  );
}
