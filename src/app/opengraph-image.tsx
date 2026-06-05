import { ImageResponse } from "next/og";

// Social share image (Twitter, LinkedIn, iMessage) — 1200x630 per OG spec.
// v3 palette: off-white background, burnt-orange + salmon ambient washes,
// espresso headline, cyan dot.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "alchemy — partnerships built on impact, not identity. A tool of The UpHer Room.";

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
          background: "#fbf6f3",
          padding: 72,
          fontFamily: "'Fraunces', 'Times New Roman', Georgia, serif",
          position: "relative",
        }}
      >
        {/* burnt-orange ambient wash, top-left */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(251, 228, 213, 0.85)",
            filter: "blur(120px)",
          }}
        />
        {/* salmon ambient wash, bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(240, 193, 163, 0.7)",
            filter: "blur(120px)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#4b3621",
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
              background: "#334e4f",
            }}
          />
          A tool of The UpHer Room
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 132,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: "#4b3621",
            }}
          >
            alchemy.
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 36,
              lineHeight: 1.15,
              maxWidth: 900,
              gap: "0 10px",
            }}
          >
            <span style={{ color: "#4b3621" }}>Partnerships built on</span>
            <span style={{ color: "#d35400" }}>impact.</span>
            <span style={{ color: "#4b3621" }}>Not identity.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#7c6856",
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
