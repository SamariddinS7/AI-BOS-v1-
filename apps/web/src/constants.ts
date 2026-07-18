export const T = {
  // — Backgrounds (layered depth model)
  bg:       "var(--color-app-bg)",
  surface:  "var(--color-surface-ground)",
  card:     "var(--color-surface-card)",
  cardHov:  "var(--color-surface-layer)",
  overlay:  "rgba(7,11,22,0.92)",

  // — Borders
  border:   "var(--color-border-dark)",
  borderHi: "var(--color-border-glow)",

  // — Accent palette
  accent:   "var(--color-brand-500)",
  accentDim: "rgba(0, 212, 255, 0.1)",
  accentMid: "rgba(0, 212, 255, 0.18)",
  accentStr: "rgba(0, 212, 255, 0.28)",

  green:    "#22C55E",  greenDim: "rgba(34,197,94,0.12)",
  amber:    "#F59E0B",  amberDim: "rgba(245,158,11,0.12)",
  red:      "#EF4444",  redDim:   "rgba(239,68,68,0.11)",
  violet:   "#A78BFA",  violetDim:"rgba(167,139,250,0.12)",
  teal:     "#2DD4BF",  tealDim:  "rgba(45,212,191,0.11)",
  sky:      "#38BDF8",  skyDim:   "rgba(56,189,248,0.11)",

  // — Text scale
  t1: "var(--color-text-primary)",   // heading
  t2: "var(--color-text-secondary)",   // body
  t3: "var(--color-text-muted)",   // meta
  t4: "var(--color-border-dark)",   // muted/disabled

  // — Typography
  sans: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",

  // — Spacing helpers (8px grid)
  s: (n) => `${n * 8}px`,

  // — Radii
  r1: "6px",   r2: "10px",  r3: "14px",  r4: "20px",

  // — Shadows
  s1: "0 1px 3px rgba(0,0,0,0.5)",
  s2: "0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
  s3: "0 12px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)",
  sAccent: "0 0 24px rgba(0,212,255,0.16)",
  sGreen:  "0 0 16px rgba(34,197,94,0.18)",
};

export const NAV_GROUPS = [
  {
    label: "Asosiy",
    items: [
      { id:"dashboard",  icon:"", label:"Dashboard"         },
      { id:"finance",    icon:"", label:"Moliya"             },
      { id:"marketing",  icon:"", label:"Marketing"         },
      { id:"sales",      icon:"", label:"Savdo"             },
      { id:"crm",        icon:"", label:"CRM"               },
    ],
  },
  {
    label: "Operatsiya",
    items: [
      { id:"tasks",      icon:"", label:"Vazifalar"         },
      { id:"projects",   icon:"", label:"Loyihalar"         },
      { id:"warehouse",  icon:"", label:"Ombor"             },
      { id:"production", icon:"", label:"Ishlab Chiqarish"  },
    ],
  },
  {
    label: "Aql-Zakovat",
    items: [
      { id:"agents",   icon:"", label:"AI Agentlar"    },
      { id:"reports",  icon:"", label:"Hisobotlar"     },
      { id:"deploy",   icon:"", label:"n8n & Deploy"   },
      { id:"strategy", icon:"", label:"Strategiya"     },
    ],
  },
  {
    label: "Jamoa & Tizim",
    items: [
      { id:"hr",         icon:"", label:"HR"                },
      { id:"health",     icon:"", label:"Tizim Holati"     },
      { id:"settings",   icon:"", label:"Sozlamalar"       },
    ],
  },
];
