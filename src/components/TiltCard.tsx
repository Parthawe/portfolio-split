import { useRef, useCallback, useEffect, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function TiltCard({ children, className = '', intensity = 4 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.006)`;
      // Dynamic glow that follows tilt direction — uses filter (composited, no repaint)
      const shadowX = x * 10;
      const shadowY = y * 10;
      el.style.filter = `drop-shadow(${-shadowX}px ${-shadowY}px 14px rgba(0,0,0,0.06))`;
    });
  }, [intensity, isTouch, prefersReducedMotion]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafId.current);
    el.style.transform = '';
    el.style.filter = '';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={isTouch || prefersReducedMotion ? undefined : { transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1), filter 420ms cubic-bezier(0.16, 1, 0.3, 1)', transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}
