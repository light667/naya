// Icônes au trait, 24px, héritent de la couleur du texte.
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const Icon = {
  home: () => (<svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...P}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" /></svg>),
  search: () => (<svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...P}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>),
  track: () => (<svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...P}><path d="M5 6h14M5 12h9M5 18h5" /><circle cx="18" cy="16" r="3" /></svg>),
  spark: () => (<svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...P}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>),
  user: () => (<svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...P}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20.5c1.3-3.6 4.2-5.3 7.5-5.3s6.2 1.7 7.5 5.3" /></svg>),
  plus: () => (<svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...P}><rect x="4" y="4" width="16" height="16" rx="5" /><path d="M12 8.5v7M8.5 12h7" /></svg>),
  shield: () => (<svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" {...P}><path d="M12 3.5 19 6v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6z" /><path d="m9 12 2 2 4-4" /></svg>),
  logout: () => (<svg viewBox="0 0 24 24" className="h-5 w-5" {...P}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10" /></svg>),
  pin: () => (<svg viewBox="0 0 24 24" className="h-4 w-4" {...P}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>),
  flag: () => (<svg viewBox="0 0 24 24" className="h-4 w-4" {...P}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></svg>),
  copy: () => (<svg viewBox="0 0 24 24" className="h-4 w-4" {...P}><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>),
  link: () => (<svg viewBox="0 0 24 24" className="h-4 w-4" {...P}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>),
};
