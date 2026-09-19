import React, { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: number; // 1: static, 2: drift, 3: blink, 4: bright
  vx: number;
  vy: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface GalaxyBackgroundProps {
  className?: string;
  enableShootingStars?: boolean;
  reducedMotionOverride?: boolean;
}

export const GalaxyBackground: React.FC<GalaxyBackgroundProps> = ({
  className = '',
  enableShootingStars = true,
  reducedMotionOverride,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Monitor prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isMotionReduced = reducedMotionOverride !== undefined ? reducedMotionOverride : prefersReducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let lastShootingStarTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initStars(width, height);
    };

    const initStars = (w: number, h: number) => {
      stars = [];
      // Calculate star count based on viewport area (approx 120-180 stars for desktop, sparse & elegant)
      const area = w * h;
      const starCount = Math.floor(Math.min(220, Math.max(70, area / 12000)));

      for (let i = 0; i < starCount; i++) {
        const rand = Math.random();
        let layer = 1;
        let size = 0.8 + Math.random() * 0.6;
        let baseAlpha = 0.15 + Math.random() * 0.35;
        let twinkleSpeed = 0;
        let vx = 0;
        let vy = 0;

        if (rand < 0.45) {
          // Layer 1: Small static stars
          layer = 1;
          size = 0.7 + Math.random() * 0.5;
          baseAlpha = 0.15 + Math.random() * 0.25;
        } else if (rand < 0.75) {
          // Layer 2: Slow drifting stars
          layer = 2;
          size = 0.9 + Math.random() * 0.6;
          baseAlpha = 0.25 + Math.random() * 0.35;
          vx = (Math.random() - 0.5) * 0.04;
          vy = -0.015 - Math.random() * 0.025;
        } else if (rand < 0.92) {
          // Layer 3: Subtle blinking stars (slow breathing)
          layer = 3;
          size = 1.0 + Math.random() * 0.8;
          baseAlpha = 0.3 + Math.random() * 0.4;
          twinkleSpeed = 0.0008 + Math.random() * 0.0012;
        } else {
          // Layer 4: Occasional slightly brighter stars
          layer = 4;
          size = 1.4 + Math.random() * 0.9;
          baseAlpha = 0.6 + Math.random() * 0.3;
          twinkleSpeed = 0.0005 + Math.random() * 0.0008;
        }

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size,
          baseAlpha,
          alpha: baseAlpha,
          twinkleSpeed,
          twinkleOffset: Math.random() * Math.PI * 2,
          layer,
          vx,
          vy,
        });
      }
    };

    const spawnShootingStar = (now: number) => {
      if (isMotionReduced || !enableShootingStars) return;
      // Rare appearance: interval between 7s and 16s
      const interval = 8000 + Math.random() * 9000;
      if (now - lastShootingStarTime > interval) {
        lastShootingStarTime = now;
        // Spawn from upper quadrant
        const angle = (Math.PI / 180) * (32 + Math.random() * 12); // ~35 degrees
        const startX = Math.random() * (width * 0.85);
        const startY = Math.random() * (height * 0.4);

        shootingStars.push({
          x: startX,
          y: startY,
          length: 90 + Math.random() * 80,
          speed: 7 + Math.random() * 4,
          angle,
          opacity: 0,
          life: 0,
          maxLife: 45 + Math.random() * 30, // frames
        });
      }
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Deep space subtle gradient wash
      const radialGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.25,
        100,
        width * 0.5,
        height * 0.4,
        Math.max(width, height) * 0.8
      );
      radialGlow.addColorStop(0, 'rgba(18, 20, 29, 0.22)');
      radialGlow.addColorStop(0.5, 'rgba(9, 10, 14, 0.15)');
      radialGlow.addColorStop(1, 'rgba(5, 5, 7, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (!isMotionReduced) {
          // Subtle drifting
          if (star.layer === 2) {
            star.x += star.vx;
            star.y += star.vy;
            if (star.y < 0) star.y = height;
            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
          }

          // Gentle sinusoidal blinking
          if (star.twinkleSpeed > 0) {
            const oscillation = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
            star.alpha = star.baseAlpha * (0.65 + oscillation * 0.35);
          }
        } else {
          star.alpha = star.baseAlpha * 0.6;
        }

        ctx.fillStyle = `rgba(240, 243, 248, ${Math.max(0.08, Math.min(1, star.alpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Layer 4 subtle soft halo
        if (star.layer === 4 && star.size > 1.4) {
          const haloAlpha = star.alpha * 0.22;
          ctx.fillStyle = `rgba(215, 230, 255, ${haloAlpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render rare shooting stars
      if (!isMotionReduced && enableShootingStars) {
        spawnShootingStar(time);

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          s.life++;

          // Natural fade in then fade out
          const progress = s.life / s.maxLife;
          if (progress < 0.2) {
            s.opacity = (progress / 0.2) * 0.75;
          } else {
            s.opacity = (1 - (progress - 0.2) / 0.8) * 0.75;
          }

          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;

          const tailX = s.x - Math.cos(s.angle) * s.length;
          const tailY = s.y - Math.sin(s.angle) * s.length;

          const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.7, `rgba(200, 225, 255, ${s.opacity * 0.4})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

          ctx.beginPath();
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();

          // Small head glow
          ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
          ctx.fill();

          if (s.life >= s.maxLife || s.x > width + 100 || s.y > height + 100) {
            shootingStars.splice(i, 1);
          }
        }
      }

      if (!isMotionReduced) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (!isMotionReduced) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      render(0);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMotionReduced, enableShootingStars]);

  return (
    <div
      id="friday-galaxy-container"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Deep space base layer */}
      <div className="absolute inset-0 bg-[#050507]" />

      {/* Atmospheric radial ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(22,26,38,0.35),rgba(5,5,7,0.95))]" />

      {/* Animated canvas starfield */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block opacity-95"
      />

      {/* Extreme subtle vignette border */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,5,7,0.75)_100%)]" />
    </div>
  );
};
