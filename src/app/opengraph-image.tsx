import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "PHAR — Ton avenir a un cap. PHAR l'éclaire.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image d'aperçu des liens partagés (WhatsApp, Facebook, LinkedIn, X…). */
export default async function Image() {
  const line = { fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 } as const;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A2A5C", color: "white" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 56px", width: 1200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "white", letterSpacing: 2 }}>PHAR</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#22C3C9", background: "rgba(34,195,201,0.15)", padding: "4px 12px", borderRadius: 12 }}>
              Inclusion &amp; Employabilité
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={line}>Ton avenir a un cap.</div>
            <div style={{ ...line, color: "#22C3C9" }}>PHAR l&apos;éclaire.</div>
            <div style={{ marginTop: 24, fontSize: 24, color: "rgba(255,255,255,0.85)", lineHeight: 1.3 }}>
              Révèle tes talents, développe tes compétences et rejoins les opportunités qui t&apos;attendent à l&apos;horizon.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#FFB81C", fontWeight: 700 }}>
            Pour les jeunes talents de 18 à 30 ans
          </div>
        </div>
      </div>
    ),
    size,
  );
}
