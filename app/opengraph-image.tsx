import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6B0F1A 0%, #93202D 55%, #B93A5A 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 72, color: "#FFF9F5", letterSpacing: 4, display: "flex" }}>MOMENTIA</div>
        <div style={{ fontSize: 32, color: "#C8A57A", marginTop: 24, fontStyle: "italic", display: "flex" }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
