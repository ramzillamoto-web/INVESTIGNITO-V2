import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  maxAlpha: number;
  phase: number;
  speed: number;
  size: number;
}

interface MistCloud {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
}

interface CreepyWisp {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  alpha: number;
  fadeSpeed: number;
  size: number;
  life: number;
  maxLife: number;
}

export const DarkMistBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchPointRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive resize with debouncing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Responsive particle count based on screen size
    const isMobile = width < 768;
    const flakeCount = isMobile ? 35 : 75;
    const mistCloudCount = isMobile ? 6 : 12;

    // 1. Blizzard Flurries / Embers
    const flakes: Particle[] = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.45) * 0.8,
      vy: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      maxAlpha: Math.random() * 0.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.005,
      size: Math.random() * 2.5 + 1,
    }));

    // 2. Drifting Mist Clouds
    const mistClouds: MistCloud[] = Array.from({ length: mistCloudCount }, (_, i) => {
      const isEerieTint = i % 3 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: (Math.random() * 250 + 180) * (isMobile ? 0.75 : 1),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.08 + 0.03,
        color: isEerieTint
          ? 'rgba(70, 15, 20, ' // Subtle blood-mist undertone
          : 'rgba(25, 30, 45, ', // Cold gothic blue-grey fog
      };
    });

    // 3. Creepy Spectral Wisps (random apparition sightings drifting in shadows)
    const wisps: CreepyWisp[] = [];
    let lastWispTime = Date.now();

    const spawnWisp = () => {
      const side = Math.random() > 0.5 ? 0 : width;
      wisps.push({
        x: side === 0 ? -50 : width + 50,
        y: Math.random() * height * 0.8 + height * 0.1,
        targetX: side === 0 ? width + 100 : -100,
        targetY: Math.random() * height,
        alpha: 0,
        fadeSpeed: 0.004,
        size: Math.random() * 80 + 60,
        life: 0,
        maxLife: Math.random() * 400 + 300,
      });
    };

    // Touch & Pointer interaction
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
      if (clientX !== undefined && clientY !== undefined) {
        touchPointRef.current = { x: clientX, y: clientY, active: true };
      }
    };

    const handlePointerLeave = () => {
      touchPointRef.current.active = false;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerLeave, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.015;

      // Base deep darkness
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, width, height);

      // Vignette & Gothic Radial gradient
      const darkGradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      darkGradient.addColorStop(0, '#0c0d12');
      darkGradient.addColorStop(0.5, '#07070a');
      darkGradient.addColorStop(1, '#020203');
      ctx.fillStyle = darkGradient;
      ctx.fillRect(0, 0, width, height);

      // Render Drifting Mist Clouds
      for (let i = 0; i < mistClouds.length; i++) {
        const cloud = mistClouds[i];
        cloud.x += cloud.vx;
        cloud.y += cloud.vy;

        // Wrap around boundaries
        if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius;
        if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = height + cloud.radius;
        if (cloud.y > height + cloud.radius) cloud.y = -cloud.radius;

        // Subtle pulsation in density
        const pulse = Math.sin(time * 0.5 + i) * 0.02 + cloud.alpha;

        const mistGrad = ctx.createRadialGradient(
          cloud.x,
          cloud.y,
          0,
          cloud.x,
          cloud.y,
          cloud.radius
        );
        mistGrad.addColorStop(0, `${cloud.color}${pulse * 1.5})`);
        mistGrad.addColorStop(0.5, `${cloud.color}${pulse * 0.8})`);
        mistGrad.addColorStop(1, `${cloud.color}0)`);

        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Periodically spawn eerie shadow wisps
      if (Date.now() - lastWispTime > 4500 && wisps.length < 3) {
        spawnWisp();
        lastWispTime = Date.now();
      }

      // Update & Render Creepy Shadows / Wisps
      for (let i = wisps.length - 1; i >= 0; i--) {
        const wisp = wisps[i];
        wisp.life++;

        // Drifting motion
        wisp.x += (wisp.targetX - wisp.x) * 0.003;
        wisp.y += Math.sin(time + i) * 0.4;

        if (wisp.life < wisp.maxLife * 0.4) {
          wisp.alpha = Math.min(0.09, wisp.alpha + wisp.fadeSpeed);
        } else {
          wisp.alpha = Math.max(0, wisp.alpha - wisp.fadeSpeed);
        }

        // Draw shadow phantom presence
        const wispGrad = ctx.createRadialGradient(
          wisp.x,
          wisp.y,
          0,
          wisp.x,
          wisp.y,
          wisp.size
        );
        wispGrad.addColorStop(0, `rgba(180, 20, 30, ${wisp.alpha * 0.9})`);
        wispGrad.addColorStop(0.4, `rgba(15, 20, 30, ${wisp.alpha * 0.6})`);
        wispGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = wispGrad;
        ctx.beginPath();
        ctx.ellipse(wisp.x, wisp.y, wisp.size * 1.8, wisp.size * 0.8, Math.sin(time * 0.5) * 0.2, 0, Math.PI * 2);
        ctx.fill();

        if (wisp.life >= wisp.maxLife || (wisp.alpha <= 0 && wisp.life > 50)) {
          wisps.splice(i, 1);
        }
      }

      // Reactive Touch / Mouse Fog Dispersal Ripple
      if (touchPointRef.current.active) {
        const { x, y } = touchPointRef.current;
        const touchGrad = ctx.createRadialGradient(x, y, 0, x, y, 160);
        touchGrad.addColorStop(0, 'rgba(185, 28, 28, 0.08)');
        touchGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.04)');
        touchGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = touchGrad;
        ctx.beginPath();
        ctx.arc(x, y, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      // Snow Flurries & Cold Blizzard Specks
      ctx.fillStyle = 'rgba(230, 240, 255, 0.7)';
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.x += f.vx + Math.sin(f.phase + time) * 0.4;
        f.y += f.vy;
        f.phase += f.speed;

        // Wrap
        if (f.y > height + 10) {
          f.y = -10;
          f.x = Math.random() * width;
        }
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;

        const currentAlpha = (Math.sin(f.phase) * 0.5 + 0.5) * f.maxAlpha;
        ctx.fillStyle = `rgba(215, 225, 245, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerLeave);
      window.removeEventListener('mouseleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Animated Dark Mist Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-95 transition-opacity duration-1000"
      />

      {/* Atmospheric Moving Fog Overlays (CSS multi-layer for depth) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/15 via-transparent to-transparent pointer-events-none mix-blend-screen" />
      
      {/* Subtle Scanline / Film Grain Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};
