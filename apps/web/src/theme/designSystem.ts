/**
 * T-Object: Loyihaning yagona dizayn tokenlari.
 * Ranglar, shadowlar, radiuslar va spacing helperlar.
 */
export const T = {
  // Ranglar palitrasi (Layered depth model)
  bg:       "#0B0F19",
  surface:  "#111827",
  card:     "#1A2236",
  cardHov:  "#1E2840",
  overlay:  "rgba(7,11,22,0.92)",

  // Borderlar
  border:   "#2A3655",
  borderHi: "#3D4F78",

  // Aktsent ranglar
  accent:   "#00D4FF",
  accentDim:"rgba(0,212,255,0.10)",
  accentMid:"rgba(0,212,255,0.18)",
  accentStr:"rgba(0,212,255,0.28)",

  green:    "#22C55E",  greenDim: "rgba(34,197,94,0.12)",
  amber:    "#F59E0B",  amberDim: "rgba(245,158,11,0.12)",
  red:      "#EF4444",  redDim:   "rgba(239,68,68,0.11)",
  violet:   "#A78BFA",  violetDim:"rgba(167,139,250,0.12)",
  teal:     "#2DD4BF",  tealDim:  "rgba(45,212,191,0.11)",

  // Matn ranglari
  t1: "#F0F4FF",   // Sarlavhalar
  t2: "#8B9EC4",   // Asosiy matn
  t3: "#4D618A",   // Meta ma'lumotlar
  t4: "#283350",   // O'chirilgan/Muted

  // Shriftlar
  sans: "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",

  // Spacing helper (8px grid)
  s: (n: number) => `${n * 8}px`,

  // Radiuslar
  r1: "6px", r2: "10px", r3: "14px", r4: "20px",

  // Shadowlar
  s1: "0 1px 3px rgba(0,0,0,0.5)",
  s2: "0 4px 20px rgba(0,0,0,0.5)",
  s3: "0 12px 40px rgba(0,0,0,0.6)",
};

/**
 * Global CSS: Barcha mikro-animatsiyalar va utility classlar.
 */
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes shimmer { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }
  @keyframes agentPulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0.5);} 50%{box-shadow:0 0 0 8px rgba(0,212,255,0);} }
  
  .card {
    background: ${T.card};
    border: 1px solid ${T.border};
    border-radius: ${T.r3};
    transition: all 160ms ease;
    position: relative;
    overflow: hidden;
  }
  .card:hover {
    transform: translateY(-2px);
    border-color: ${T.borderHi};
    background: ${T.cardHov};
    box-shadow: ${T.s2};
  }
  
  .fade-up { animation: fadeUp 220ms ease both; }
  .fade-in { animation: fadeIn 200ms ease both; }
  .shimmer { animation: shimmer 1.8s ease-in-out infinite; }
  
  .btn-primary {
    background: ${T.accentDim}; color: ${T.accent}; border: 1px solid ${T.accentStr};
    border-radius: ${T.r1}; padding: 7px 16px; font-weight: 600; cursor: pointer;
    transition: all 140ms ease;
  }
  .btn-primary:hover { background: ${T.accentMid}; box-shadow: 0 0 12px ${T.accentDim}; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .toast-item { animation: fadeUp 220ms cubic-bezier(0.34,1.56,0.64,1) both; }
  .toast-item.removing { opacity: 0; transform: translateY(-8px); transition: all 200ms ease; }
`;
