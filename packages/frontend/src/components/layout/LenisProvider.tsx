'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger globally
gsap.registerPlugin(ScrollTrigger);

interface LenisProviderProps {
  children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  useEffect(() => {
    // 1. Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Expose lenis globally for component actions (e.g. Scroll to Top)
    (window as any).lenis = lenis;

    // 2. Sync Lenis scroll events with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // 3. Connect GSAP ticker animation loop to drive Lenis updates
    const updateLoop = (time: number) => {
      // time in seconds, Lenis expects milliseconds
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(updateLoop);
    
    // Disable lag smoothing for synchronized renders
    gsap.ticker.lagSmoothing(0);

    // Cleanup scroll listeners on unmount
    return () => {
      lenis.destroy();
      (window as any).lenis = undefined;
      gsap.ticker.remove(updateLoop);
    };
  }, []);

  return <>{children}</>;
}
