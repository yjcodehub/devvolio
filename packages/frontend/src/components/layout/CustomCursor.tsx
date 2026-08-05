'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Center cursor and keep hidden initially to prevent jump on render
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 1, opacity: 0 });

    // Establish quickTo animation helpers (provides high-frame rate tracking)
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.25, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.25, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, { opacity: 1, duration: 0.2 });
      xTo(e.clientX);
      yTo(e.clientY);
    };

    // Watch hover events to scale cursor on hover triggers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, .hover-glow-trigger');

      if (isInteractive) {
        gsap.to(cursor, {
          scale: 2.2,
          backgroundColor: 'hsla(180, 100%, 50%, 0.12)', // Tint neon teal
          borderColor: 'hsl(180, 100%, 50%)',
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: 'hsla(250, 89%, 65%, 0.05)', // Fallback brand violet
          borderColor: 'hsl(250, 89%, 65%)',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hidden md:block fixed top-0 left-0 w-6 h-6 rounded-full border border-primary bg-primary/5 pointer-events-none z-50 transition-colors duration-200"
    />
  );
}
