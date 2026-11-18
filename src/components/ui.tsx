"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

/* ---------- Boutons ---------- */
type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xs",
  accent: "bg-slate-900 text-white hover:bg-slate-800 shadow-xs",
  secondary: "bg-white text-slate-800 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50",
};

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

export function Button({
  variant = "primary",
  className = "",
  loading,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button {...rest} disabled={rest.disabled || loading} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({ href, variant = "primary", className = "", children }: { href: string; variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />;
}

/* ---------- Surfaces ---------- */
export function Card({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <Tag className={`rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs sm:p-6 ${className}`}>{children}</Tag>;
}

type Tone = "plum" | "coral" | "sage" | "neutral" | "red" | "amber";

export function Badge({ children, tone = "plum", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  const tones: Record<Tone, string> = {
    plum: "bg-slate-100 text-slate-800 border border-slate-200/60",
    coral: "bg-rose-50 text-rose-700 border border-rose-200/60",
    sage: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200/60",
    red: "bg-red-50 text-red-800 border border-red-200/60",
    amber: "bg-amber-50 text-amber-900 border border-amber-200/60",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
}

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <Badge tone="sage" className={className}>
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path fill="currentColor" d="M8 0l1.9 1.5 2.4-.2.8 2.3 2.1 1.2-.6 2.3.9 2.2-1.9 1.5-.3 2.4-2.4.4L9.6 15 8 14l-1.6 1-1.3-1.9-2.4-.4-.3-2.4L.5 8.8l.9-2.2-.6-2.3L2.9 3l.8-2.3 2.4.2z" />
        <path fill="#fff" d="M7 10.6L4.7 8.3l1-1L7 8.6l3.3-3.3 1 1z" />
      </svg>
      Vérifiée par PHAR
    </Badge>
  );
}

/* ---------- Champs ---------- */
const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:outline-none";

export function Input({ label, hint, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-slate-800">{label}</span>}
      <input {...rest} className={field} />
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Textarea({ label, hint, className = "", ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-slate-800">{label}</span>}
      <textarea rows={4} {...rest} className={`${field} resize-none leading-relaxed ${className}`} />
      {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Select({ label, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold text-slate-800">{label}</span>}
      <select {...rest} className={`${field} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 12 12%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%230F172A%22 stroke-width=%221.6%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}>
        {children}
      </select>
    </label>
  );
}

/** Puce sélectionnable (filtres, réponses rapides). */
export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
        active ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Identité ---------- */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-slate-950 ${className}`}>
      <span className="font-bold text-lg text-slate-950">PHAR</span>
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function AiBadge({ source }: { source?: "ia" | "local" | null }) {
  if (!source) return null;
  return source === "ia" ? <Badge tone="sage">Optimisé par l&apos;IA</Badge> : <Badge tone="neutral">Moteur local</Badge>;
}

export function Empty({ title, text, action, icon }: { title: string; text: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-700">{icon}</div>}
      <p className="text-sm sm:text-base font-bold text-slate-900">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Score de compatibilité ---------- */
export function ScoreRing({ value, size = 48, label = true }: { value: number; size?: number; label?: boolean }) {
  const reduce = useReducedMotion();
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 70 ? "#059669" : value >= 45 ? "#0F172A" : "#D97706";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value} % compatible`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={4} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c * (1 - value / 100) : c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </svg>
      {label && <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900">{value}</span>}
    </div>
  );
}

/* ---------- Onglets avec indicateur animé ---------- */
export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div role="tablist" className="no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 border border-slate-200/70">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={`relative shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${value === t.id ? "text-white" : "text-slate-600 hover:text-slate-950"}`}
        >
          {value === t.id && (
            <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-lg bg-slate-900 shadow-xs" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
          )}
          <span className="relative">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Panneau : feuille du bas sur mobile, fenêtre sur ordinateur ---------- */
export function Sheet({ open, onClose, children, footer, title }: { open: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-plum/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_-20px_rgba(42,27,110,0.35)] sm:rounded-[28px]"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => info.offset.y > 120 && onClose()}
          >
            <div className="flex justify-center pt-3 sm:hidden" aria-hidden>
              <span className="h-1.5 w-10 rounded-full bg-neutral-200" />
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-lg text-ink hover:bg-plum-50"
            >
              ×
            </button>
            <div className="overflow-y-auto overscroll-contain px-6 pb-6 pt-4 sm:pt-7">{children}</div>
            {footer && <div className="border-t border-line bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Frise d'étapes (suivi de candidature) ---------- */
export function Stepper({ steps, current, failed }: { steps: string[]; current: number; failed?: boolean }) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="Avancement">
      {steps.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className="flex flex-1 flex-col gap-1.5">
            <span className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <motion.span
                className={`block h-full rounded-full ${failed && i === current ? "bg-red-400" : i === current && i === steps.length - 1 ? "bg-sage" : "bg-plum"}`}
                initial={false}
                animate={{ width: done ? "100%" : "0%" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
              />
            </span>
            <span className={`hidden text-[12px] sm:block ${i === current ? "font-semibold text-ink" : "text-muted"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Choix segmenté (ton, langue, canal…) ---------- */
export function Segmented<T extends string>({ label, options, value, onChange, size = "md" }: { label?: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; size?: "sm" | "md" }) {
  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>}
      <div role="radiogroup" aria-label={label} className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-bg p-1 ring-1 ring-line">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            onClick={() => onChange(o.id)}
            className={`flex-1 shrink-0 whitespace-nowrap rounded-xl font-semibold transition-colors ${size === "sm" ? "px-2.5 py-1.5 text-[13px]" : "px-3 py-2 text-sm"} ${
              value === o.id ? "bg-white text-plum shadow-sm ring-1 ring-plum/15" : "text-muted hover:text-plum"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
