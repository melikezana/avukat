import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180
};
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
          background: "#0A1628",
          color: "#CFAE77",
          fontSize: 54,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          border: "10px solid #8B6A2F"
        }}
      >
        İD
      </div>
    ),
    size
  );
}
