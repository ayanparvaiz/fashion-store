import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Fashion Store — trend-led fashion for women and men in Singapore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Fetches the TTF for Archivo Black from Google Fonts at build time. */
async function loadDisplayFont(): Promise<ArrayBuffer> {
  const css = await fetch("https://fonts.googleapis.com/css2?family=Archivo+Black").then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error("Could not resolve Archivo Black font file");
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const font = await loadDisplayFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#ffffff",
          padding: 72,
          fontFamily: "Archivo Black",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, letterSpacing: -1 }}>
          FASHION<span style={{ color: "#e5005a" }}>.</span>STORE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, lineHeight: 0.95, letterSpacing: -3 }}>MAIN CHARACTER</div>
          <div style={{ fontSize: 104, lineHeight: 0.95, letterSpacing: -3, color: "#e5005a" }}>ENERGY.</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#bdbdbd" }}>
          New drops weekly · Free delivery over S$80 · Cash on Delivery across Singapore
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Archivo Black", data: font, weight: 400, style: "normal" }] },
  );
}
