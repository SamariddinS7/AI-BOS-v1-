import React, { memo, useRef, useEffect } from 'react';
import { T } from '../constants';

// ── Seeded RNG for stable star positions ─────────────────────────
function fxRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

// ── Background canvas — renders everything in one rAF loop ────────
export default memo(() => {
  const cvRef    = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    const cv  = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");

    // ── resize handler ──────────────────────────────────────────────
    let W = 0, H = 0;
    const resize = () => {
      W = cv.width  = window.innerWidth;
      H = cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // ── STARS ────────────────────────────────────────────────────────
    const rng = fxRng(42);
    const STAR_COUNT = window.innerWidth < 760 ? 90 : 180;
    const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
      x:   rng() * 1920,
      y:   rng() * 1080,
      r:   0.3 + rng() * 1.4,
      a:   rng(),          // alpha base
      spd: 0.003 + rng() * 0.012,
      off: rng() * Math.PI * 2,
      twinkle: rng() > 0.6, // 40% of stars twinkle
    }));

    // ── MAIN DRAW LOOP ───────────────────────────────────────────────
    let t = 0;

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);

      const scaleX = W / 1920;
      const scaleY = H / 1080;

      // ── 4. STARS ────────────────────────────────────────────────────
      stars.forEach(s => {
        s.off += s.spd;
        const alpha = s.twinkle
          ? Math.max(0.05, s.a * (0.5 + 0.5 * Math.sin(s.off)))
          : s.a * 0.65;
        ctx.fillStyle = `rgba(240,244,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x * scaleX, s.y * scaleY, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas id="bg-canvas" ref={cvRef} style={{position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none'}}/>
  );
});
