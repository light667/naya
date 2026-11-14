// Gestion des médias du portfolio (bucket Supabase Storage « portfolio »).
import { supabase } from "./supabase";

export const BUCKET = "portfolio";
export const LIMITS = {
  image: { maxMb: 15, types: ["image/jpeg", "image/png", "image/webp", "image/gif"] },
  video: { maxMb: 50, types: ["video/mp4", "video/webm", "video/quicktime"] },
};
export const ACCEPT = [...LIMITS.image.types, ...LIMITS.video.types].join(",");

export const mediaUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export function checkFile(f: File): { kind: "image" | "video" } | { error: string } {
  const kind = f.type.startsWith("video/") ? "video" : f.type.startsWith("image/") ? "image" : null;
  if (!kind) return { error: `${f.name} : format non pris en charge.` };
  const lim = LIMITS[kind];
  if (!lim.types.includes(f.type)) return { error: `${f.name} : format ${f.type.split("/")[1]} non accepté (${kind === "image" ? "JPG, PNG, WebP, GIF" : "MP4, WebM, MOV"}).` };
  if (f.size > lim.maxMb * 1024 * 1024) return { error: `${f.name} : trop lourd (${lim.maxMb} Mo maximum).` };
  return { kind };
}

/** Réduit les photos (1920 px max, JPEG 85 %) pour un chargement rapide, y compris sur mobile. */
export async function optimizeImage(f: File): Promise<Blob> {
  if (f.type === "image/gif") return f;
  try {
    const bmp = await createImageBitmap(f);
    const scale = Math.min(1, 1920 / Math.max(bmp.width, bmp.height));
    if (scale === 1 && f.size < 600_000) return f;
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const out = await new Promise<Blob | null>((r) => c.toBlob(r, "image/jpeg", 0.85));
    return out && out.size < f.size ? out : f;
  } catch {
    return f;
  }
}

/** Image clé d'une vidéo (pour l'analyse par l'IA), en data URL JPEG. */
export function videoFrame(src: string, maxSide = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.src = src;
    const fail = () => reject(new Error("Impossible de lire la vidéo."));
    v.onerror = fail;
    v.onloadedmetadata = () => { v.currentTime = Math.min(1.5, (v.duration || 2) / 2); };
    v.onseeked = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(v.videoWidth, v.videoHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(v.videoWidth * scale);
        c.height = Math.round(v.videoHeight * scale);
        c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      } catch {
        fail();
      }
    };
  });
}

export async function uploadFile(userId: string, blob: Blob, originalName: string): Promise<string> {
  const ext = blob.type === "image/jpeg" ? "jpg" : (originalName.split(".").pop() || "bin").toLowerCase();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(error.message.includes("Bucket not found") ? "Stockage non configuré : exécutez la migration 002 dans Supabase." : error.message);
  return path;
}

export async function removeFile(path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "portfolio";
