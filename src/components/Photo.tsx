"use client";

import { useEffect, useRef, useState } from "react";

const TONES = [
  "from-[#3b2391] via-[#6a2c8e] to-[#ff5e7e]",
  "from-[#1f1257] via-[#2a1b6e] to-[#ffb21e]",
  "from-[#8a3a8f] via-[#d24f7a] to-[#ffb21e]",
  "from-[#15485a] via-[#1f9a8a] to-[#ffd36b]",
];

/**
 * Photo avec repli élégant : si le fichier n'existe pas encore dans /public/images,
 * un dégradé de la charte s'affiche à la place (aucune image cassée).
 */
export function Photo({ src, alt, className = "", tone = 0, priority }: { src: string; alt: string; className?: string; tone?: number; priority?: boolean }) {
  const [ok, setOk] = useState(true);
  const ref = useRef<HTMLImageElement>(null);
  // L'erreur peut survenir avant l'hydratation : on vérifie l'état de l'image au montage.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setOk(false);
  }, []);
  return (
    <div className={`${className.split(" ").includes("absolute") ? "" : "relative"} overflow-hidden bg-gradient-to-br ${TONES[tone % TONES.length]} ${className}`}>
      {ok && (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" onError={() => setOk(false)} className="absolute inset-0 h-full w-full object-cover text-transparent" />
      )}
      {!ok && <span aria-hidden className="bg-dots absolute inset-0 opacity-60" />}
    </div>
  );
}
