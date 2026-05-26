import { ImageResponse } from "next/og";

// Social share image (Twitter, LinkedIn, iMessage) — 1200x630 per OG spec.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "alchemy — a bias-blind strategic partnership platform. A tool of The UpHer Room.";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdfbf7",
          padding: 72,
          fontFamily: "'Fraunces', 'Times New Roman', Georgia, serif",
          position: "relative",
        }}
      >
        {/* ambient color washes */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(237, 227, 243, 0.6)",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(245, 221, 227, 0.7)",
            filter: "blur(120px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#21172f",
            fontFamily: "'DM Sans', Helvetica, Arial, sans-serif",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: "#e6a7b0",
            }}
          />
          A tool of The UpHer Room
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, zIndex: 1 }}>
          <div
            style={{
              fontSize: 132,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: "#21172f",
            }}
          >
            alchemy.
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.15,
              color: "#2a1f1c",
              maxWidth: 900,
            }}
          >
            Mission first. Identity at the meeting.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#6b5d58",
            fontFamily: "'DM Sans', Helvetica, Arial, sans-serif",
            fontSize: 18,
            zIndex: 1,
          }}
        >
          <span>alchemy.theupherroom.com</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Partner Violet-42
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
