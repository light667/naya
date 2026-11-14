import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "NAYA — Vos compétences méritent d'être vues";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image d'aperçu des liens partagés (WhatsApp, Facebook, LinkedIn, X…). */
export default async function Image() {
  const photo = await readFile(join(process.cwd(), "public/images/hero.jpg"))
    .then((b) => `data:image/jpeg;base64,${b.toString("base64")}`)
    .catch(() => null);
  const line = { fontSize: 70, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 } as const;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#150B3F", color: "white" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px", width: photo ? 720 : 1200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "#2A1B6E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 800, position: "relative" }}>
              N
              <div style={{ position: "absolute", top: 5, right: 5, width: 13, height: 13, borderRadius: 7, background: "#FFB21E" }} />
            </div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>naya</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={line}>Vos compétences</div>
            <div style={line}>méritent</div>
            <div style={{ ...line, color: "#FFB21E" }}>d’être vues.</div>
            <div style={{ marginTop: 28, fontSize: 28, color: "rgba(255,255,255,0.75)", lineHeight: 1.3 }}>Compétences révélées, portfolio, missions rémunérées vérifiées.</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#FFB21E" }}>Pour les jeunes femmes de 18 à 30 ans · Togo</div>
        </div>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={480} height={630} style={{ width: 480, height: 630, objectFit: "cover", borderTopLeftRadius: 240 }} />
        )}
      </div>
    ),
    size,
  );
}
