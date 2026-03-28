import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(135deg, #f8f5ef 0%, #efe4d0 100%)",
          color: "#1f2937",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 3, color: "#8b5e34" }}>
          DENVER PORCHFEST
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            A front-porch music day
            <br />
            for Denver neighbors.
          </div>
          <div style={{ fontSize: 30, color: "#3b7a57" }}>
            Saturday, October 10 · Free · 50+ artists
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
