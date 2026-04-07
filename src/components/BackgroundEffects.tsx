import React, { memo, useRef, useEffect } from 'react';

export default memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    interface Blob {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }

    const blobs: Blob[] = [
      { x: width * 0.2, y: height * 0.2, radius: 800, color: 'rgba(0, 212, 255, 0.4)', vx: 0.8, vy: 0.5 },
      { x: width * 0.8, y: height * 0.8, radius: 900, color: 'rgba(123, 31, 162, 0.4)', vx: -0.6, vy: -0.4 },
      { x: width * 0.5, y: height * 0.5, radius: 700, color: 'rgba(0, 255, 135, 0.3)', vx: 0.5, vy: -0.7 },
      { x: width * 0.1, y: height * 0.9, radius: 850, color: 'rgba(255, 64, 129, 0.3)', vx: -0.4, vy: 0.8 },
      { x: width * 0.9, y: height * 0.1, radius: 600, color: 'rgba(255, 167, 38, 0.3)', vx: 0.3, vy: 0.6 },
    ];

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw blobs with blur effect
      ctx.filter = 'blur(80px)';
      
      blobs.forEach(blob => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x < -blob.radius) blob.x = width + blob.radius;
        if (blob.x > width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = height + blob.radius;
        if (blob.y > height + blob.radius) blob.y = -blob.radius;

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add some subtle stars on top
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i + Date.now() * 0.0001) * 0.5 + 0.5) * width;
        const y = (Math.cos(i * 1.5 + Date.now() * 0.0001) * 0.5 + 0.5) * height;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -2,
          pointerEvents: 'none',
          background: 'transparent',
        }}
      />
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.05,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
});
