import Image from "next/image";

type Props = {
  firstName: string;
  trade: string;
  city: string;
  years?: number;
  skills: string[];
  photo?: string;
  example?: boolean;
};

/** Carte de compétences : le seul objet riche en couleur de PHAR (indigo, ocre, bandeau wax). */
export function SkillCard({ firstName, trade, city, years, skills, photo, example }: Props) {
  return (
    <figure className="relative w-full max-w-[360px] overflow-hidden rounded-2xl bg-indigo-brand text-[#FFF8EF] shadow-[0_8px_24px_rgba(43,27,20,0.18)]">
      <div className="wax-band" aria-hidden />
      <div className="p-6">
        <div className="flex items-center justify-between text-xs text-[#FFF8EF]/75">
          <span>Carte de compétences</span>
          {example && <span className="rounded-md bg-[#FFF8EF]/12 px-2 py-0.5">Exemple</span>}
        </div>

        <div className="mt-5 flex items-center gap-4">
          {photo ? (
            <Image src={photo} alt="" width={64} height={64} className="h-16 w-16 rounded-full object-cover ring-2 ring-ocre" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ocre text-2xl font-semibold text-ink">{firstName[0]}</span>
          )}
          <div className="min-w-0">
            <p className="text-2xl font-semibold leading-tight">{firstName}</p>
            <p className="text-sm text-[#FFF8EF]/80">
              {trade} · {city}
            </p>
          </div>
        </div>

        {years != null && (
          <p className="mt-5 text-sm">
            <span className="text-3xl font-semibold tabular-nums text-ocre">{years}</span> ans d&apos;expérience
          </p>
        )}

        <ul className="mt-5 flex flex-wrap gap-2">
          {skills.map((s) => (
            <li key={s} className="rounded-lg bg-[#FFF8EF]/12 px-3 py-1.5 text-sm">
              {s}
            </li>
          ))}
        </ul>

        <figcaption className="mt-6 flex items-center gap-2 border-t border-[#FFF8EF]/15 pt-4 text-sm text-[#FFF8EF]/80">
          <span className="h-2 w-2 rounded-full bg-ocre" aria-hidden />
          Validation mentor : en attente
        </figcaption>
      </div>
    </figure>
  );
}
