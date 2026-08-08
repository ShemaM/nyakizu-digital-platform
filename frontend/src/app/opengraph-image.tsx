import { ImageResponse } from "next/og";

export const alt = "Nyakizu Digital Market — Digital Trade Platform for Phone Accessories Sellers in Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#FAF9F6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#C8860A1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 8, height: 40, background: "#C8860A", display: "flex" }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#14120E", display: "flex" }}>
            Nyakizu Market
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 64,
            fontWeight: 800,
            color: "#14120E",
            lineHeight: 1.15,
            maxWidth: 920,
            display: "flex",
          }}
        >
          The trade you already do. Now digital.
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#4A4438",
            maxWidth: 820,
            display: "flex",
          }}
        >
          Orders, stock, and debts in one place — free for phone accessories sellers and buyers in Nairobi.
        </div>

        <div style={{ marginTop: 48, width: 120, height: 8, borderRadius: 4, background: "#C8860A", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
