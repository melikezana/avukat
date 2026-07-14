import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 512,
  height: 512
};
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
          background: "#0A1628",
          color: "#CFAE77",
          fontSize: 150,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          border: "24px solid #8B6A2F"
        }}
      >
        İD
      </div>
    ),
    size
  );
}
