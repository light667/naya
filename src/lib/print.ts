// Export PDF sans dépendance : ouvre une page mise en forme et lance l'impression
// (« Enregistrer au format PDF » sur ordinateur comme sur téléphone).
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function printText(title: string, text: string, meta?: string) {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
@page { margin: 22mm 20mm; }
body { font-family: Georgia, "Times New Roman", serif; color: #1b1340; font-size: 12pt; line-height: 1.6; max-width: 170mm; margin: 0 auto; }
header { border-bottom: 2px solid #2b1a6e; padding-bottom: 8px; margin-bottom: 22px; font-family: Arial, sans-serif; }
h1 { font-size: 15pt; margin: 0; color: #2b1a6e; }
small { color: #6b6488; }
p { margin: 0 0 12px; white-space: pre-wrap; }
footer { margin-top: 28px; font: 9pt Arial, sans-serif; color: #8a85a3; }
</style></head><body>
<header><h1>${esc(title)}</h1>${meta ? `<small>${esc(meta)}</small>` : ""}</header>
${text.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("")}
<footer>Rédigé avec NAYA</footer>
<script>window.onload = () => { window.print(); };</script>
</body></html>`);
  w.document.close();
  return true;
}
