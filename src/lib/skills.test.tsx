import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { mergeSkills, newOnly, normalizeCategory, normalizeLevel, parseSkills } from "./skills";
import { SkillList } from "@/components/SkillList";
import type { Skill } from "./types";

const meta = { source: "assistant" as const, status: "confirmee_assistant" as const, now: "2026-11-26T10:00:00.000Z" };

describe("parseSkills : validation de la réponse de l'IA", () => {
  it("accepte la forme attendue", () => {
    const r = parseSkills(
      { skills: [{ name: "coupe de tissu wax", category: "Couture & Mode", level: "confirmée", evidence: "Je couds des tenues en wax depuis 5 ans" }] },
      meta,
    );
    expect(r.valid).toBe(true);
    expect(r.skills).toEqual([
      { name: "Coupe de tissu wax", category: "Couture & Mode", level: "confirmée", evidence: "Je couds des tenues en wax depuis 5 ans", source: "assistant", status: "confirmee_assistant", added_at: meta.now },
    ]);
  });

  it("accepte une chaîne JSON entourée de ```json", () => {
    const r = parseSkills('```json\n{"skills":[{"name":"Gestion de la caisse","category":"gestion","level":"intermédiaire","evidence":"Je tiens la caisse"}]}\n```', meta);
    expect(r.valid).toBe(true);
    expect(r.skills[0].category).toBe("Gestion & Devis");
  });

  it("répare les variantes françaises des clés et des niveaux", () => {
    const r = parseSkills({ competences: [{ nom: "Tresses", categorie: "coiffure", niveau: "Expert", preuve: "Je tresse le samedi" }] }, meta);
    expect(r.skills[0]).toMatchObject({ name: "Tresses", category: "Beauté & Bien-être", level: "confirmée", evidence: "Je tresse le samedi" });
  });

  it("rejette une réponse sans liste (on réessaie alors)", () => {
    expect(parseSkills({ reply: "Voici tes compétences : couture" }, meta).valid).toBe(false);
    expect(parseSkills("pas du JSON", meta).valid).toBe(false);
  });

  it("ignore les noms vides, les doublons et limite à 10", () => {
    const many = Array.from({ length: 14 }, (_, i) => ({ name: `Compétence ${i}` }));
    const r = parseSkills({ skills: [{ name: "" }, { name: "Vente" }, { name: "vente" }, ...many] }, meta);
    expect(r.skills.filter((s) => s.name === "Vente")).toHaveLength(1);
    expect(r.skills).toHaveLength(10);
  });
});

describe("normalisation", () => {
  it("ramène les catégories vers la liste unique", () => {
    expect(normalizeCategory("Communication digitale")).toBe("Digital & Tech");
    expect(normalizeCategory("Cuisine & traiteur")).toBe("Cuisine & Traiteur");
    expect(normalizeCategory("n'importe quoi", "Accueil des clients")).toBe("Commerce & Vente");
  });
  it("ramène les niveaux vers 3 valeurs", () => {
    expect(normalizeLevel("débutant")).toBe("débutante");
    expect(normalizeLevel("avancé")).toBe("confirmée");
    expect(normalizeLevel(undefined)).toBe("intermédiaire");
  });
});

describe("mergeSkills : jamais d'écrasement", () => {
  const existing: Skill[] = [{ name: "Couture & confection", category: "Couture & Mode", level: "confirmée", status: "declaree" }];

  it("ajoute les nouvelles et garde les anciennes intactes", () => {
    const { skills, added } = mergeSkills(existing, [{ name: "Vente", category: "Commerce & Vente", level: "intermédiaire", status: "confirmee_assistant" }]);
    expect(skills).toHaveLength(2);
    expect(skills[0]).toEqual(existing[0]);
    expect(added.map((s) => s.name)).toEqual(["Vente"]);
  });

  it("garde le niveau choisi, monte seulement le statut", () => {
    const { skills, added } = mergeSkills(existing, [{ name: "couture & CONFECTION", category: "Couture & Mode", level: "débutante", status: "confirmee_assistant", evidence: "Je couds" }]);
    expect(added).toHaveLength(0);
    expect(skills[0]).toMatchObject({ level: "confirmée", status: "confirmee_assistant", evidence: "Je couds" });
  });

  it("newOnly ne compte que ce qui manque au profil", () => {
    expect(newOnly(existing, [{ name: "Couture & confection", category: "x" }, { name: "Vente", category: "x" }]).map((s) => s.name)).toEqual(["Vente"]);
  });
});

describe("parcours complet : réponse de l'IA → profil → affichage", () => {
  it("les compétences renvoyées par l'IA s'affichent sur le profil avec leur statut", () => {
    const aiResponse = JSON.stringify({
      skills: [
        { name: "Coupe de tissu wax", category: "Couture & Mode", level: "confirmée", evidence: "Je coupe le wax pour les clientes du quartier" },
        { name: "Accueil des clients", category: "Commerce & Vente", level: "intermédiaire", evidence: "Je reçois les clientes à l'atelier" },
      ],
    });
    const parsed = parseSkills(aiResponse, meta);
    const profileSkills: Skill[] = [{ name: "Tresses", category: "Beauté & Bien-être", level: "intermédiaire", status: "declaree" }];
    const { skills } = mergeSkills(profileSkills, parsed.skills);

    const html = renderToStaticMarkup(<SkillList skills={skills} />);
    expect(html).toContain("Tresses");
    expect(html).toContain("Coupe de tissu wax");
    expect(html).toContain("Accueil des clients");
    expect(html).toContain("Confirmée par l&#x27;assistant");
    expect(html).toContain("Déclarée");
    expect(html).toContain("J&#x27;ai de l&#x27;expérience");
    expect(html).not.toMatch(/certifi/i);
  });
});
