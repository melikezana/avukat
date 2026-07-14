import { ImageResponse } from "next/og";
import { siteDefaults } from "@/lib/site";

export const runtime = "edge";
export const alt = siteDefaults.title;
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A1628",
          color: "#FAF7F1",
          padding: "72px",
          fontFamily: "Georgia, serif",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 34,
            border: "2px solid rgba(207, 174, 119, 0.72)"
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 72,
            top: 72,
            width: 140,
            height: 140,
            borderRadius: 8,
            border: "2px solid #CFAE77",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#CFAE77",
            fontSize: 54,
            fontWeight: 700
          }}
        >
          İD
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 760 }}>
          <div style={{ width: 96, height: 4, background: "#CFAE77" }} />
          <div style={{ fontSize: 70, lineHeight: 1.05, fontWeight: 700 }}>{siteDefaults.name}</div>
          <div style={{ fontSize: 34, lineHeight: 1.25, color: "#EBD9B5" }}>{siteDefaults.slogan}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 25, color: "#D9C18A" }}>
          <span>Hukuk yazıları</span>
          <span style={{ color: "#8B6A2F" }}>•</span>
          <span>Uzmanlık alanları</span>
          <span style={{ color: "#8B6A2F" }}>•</span>
          <span>İletişim</span>
        </div>
      </div>
    ),
    size
  );
}
